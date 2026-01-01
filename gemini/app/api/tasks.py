from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.job_manager import STATUS_QUEUED
from app.db.repository import create_task, update_task_input_meta
from app.db.session import get_session
from app.services.storage import save_upload_file

router = APIRouter(prefix="/api/v1", tags=["tasks"])
VALID_MODES = {"simple", "deep"}
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
ALLOWED_CONTENT_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
}


@router.post("/tasks")
async def create_task_endpoint(
    request: Request,
    file: UploadFile = File(...),
    mode: str = Form("simple"),
    video_type: str | None = Form(None),
    db: Session = Depends(get_session),
) -> dict:
    if mode not in VALID_MODES:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")

    ext = Path(file.filename or "").suffix.lower()
    ext_ok = ext in ALLOWED_EXTENSIONS if ext else False
    content_type = (file.content_type or "").lower()
    type_ok = content_type in ALLOWED_CONTENT_TYPES if content_type else False
    if not (ext_ok or type_ok):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    max_upload_mb = request.app.state.config.storage.max_upload_size_mb
    if max_upload_mb and max_upload_mb > 0:
        try:
            file.file.seek(0, 2)
            size = file.file.tell()
            file.file.seek(0)
        except Exception:
            size = None
        if size is not None and size > max_upload_mb * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"File too large (>{max_upload_mb} MB)",
            )

    task = create_task(
        db,
        status=STATUS_QUEUED,
        stage="slicing",
        mode=mode,
        video_type=video_type,
        input_meta={"filename": file.filename, "content_type": file.content_type},
    )

    temp_dir = request.app.state.config.storage.temp_dir
    saved_path = save_upload_file(temp_dir, task.id, file)
    await file.close()

    update_task_input_meta(
        db,
        task.id,
        {
            "path": str(saved_path),
            "size": saved_path.stat().st_size,
        },
    )

    request.app.state.job_manager.enqueue(task.id)
    return {"task_id": task.id, "status": STATUS_QUEUED}
