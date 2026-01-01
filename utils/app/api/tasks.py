from __future__ import annotations

import asyncio
import json
import time
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.job_manager import STATUS_QUEUED
from app.db.repository import (
    create_task,
    get_segment_by_id,
    get_segments_by_task,
    get_task,
    get_task_raw,
    get_task_result,
    get_task_timings,
    update_task_input_meta,
)
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
PING_INTERVAL_SECONDS = 15


def _format_sse(event: str, data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=True)
    return f"event: {event}\ndata: {payload}\n\n"


def _serialize_segment(segment: object) -> dict:
    return {
        "segment_id": getattr(segment, "segment_id", None),
        "index": getattr(segment, "index", None),
        "start": float(getattr(segment, "start", 0.0)),
        "end": float(getattr(segment, "end", 0.0)),
        "text": getattr(segment, "text", ""),
    }


def _event_stream(job_manager: object, request: Request, task_id: str, ping_interval: int):
    queue = job_manager.register_listener(task_id)

    async def generator():
        last_ping = time.monotonic()
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    message = await asyncio.wait_for(queue.get(), timeout=0.5)
                except asyncio.TimeoutError:
                    now = time.monotonic()
                    if now - last_ping >= ping_interval:
                        yield _format_sse("ping", {"ts": time.time()})
                        last_ping = now
                    continue

                queue.task_done()
                event = message.get("event", "message")
                data = message.get("data", {})
                yield _format_sse(event, data)
        finally:
            job_manager.remove_listener(task_id, queue)

    return generator()


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


@router.get("/tasks/{task_id}")
def get_task_status_endpoint(task_id: str, db: Session = Depends(get_session)) -> dict:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "task_id": task.id,
        "status": task.status,
        "stage": task.stage,
        "error": task.error,
    }


@router.get("/tasks/{task_id}/result")
def get_task_result_endpoint(task_id: str, db: Session = Depends(get_session)) -> dict:
    result = get_task_result(db, task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    return result.result_json


@router.get("/tasks/{task_id}/raw")
def get_task_raw_endpoint(task_id: str, db: Session = Depends(get_session)) -> dict:
    raw = get_task_raw(db, task_id)
    if raw is None:
        raise HTTPException(status_code=404, detail="Raw output not found")
    return raw.raw_json


@router.get("/tasks/{task_id}/timing")
def get_task_timing_endpoint(task_id: str, db: Session = Depends(get_session)) -> dict:
    if get_task(db, task_id) is None:
        raise HTTPException(status_code=404, detail="Task not found")
    timings = get_task_timings(db, task_id)
    return {
        "items": [
            {"stage": timing.stage, "elapsed_ms": timing.elapsed_ms}
            for timing in timings
        ]
    }


@router.get("/tasks/{task_id}/segments")
def get_task_segments_endpoint(task_id: str, db: Session = Depends(get_session)) -> dict:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    segments = get_segments_by_task(db, task_id)
    return {"items": [_serialize_segment(segment) for segment in segments]}


@router.get("/tasks/{task_id}/segments/{segment_id}")
def get_task_segment_endpoint(
    task_id: str, segment_id: str, db: Session = Depends(get_session)
) -> dict:
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    segment = get_segment_by_id(db, task_id, segment_id)
    if segment is None:
        raise HTTPException(status_code=404, detail="Segment not found")
    return _serialize_segment(segment)


@router.get("/tasks/{task_id}/events")
async def stream_task_events(request: Request, task_id: str) -> StreamingResponse:
    job_manager = request.app.state.job_manager
    # Push initial state if task exists
    state = job_manager.tasks.get(task_id)
    if state:
        job_manager.publish_event(
            task_id,
            "task_status",
            {
                "task_id": task_id,
                "status": state.status,
                "stage": state.stage,
                "ts": time.time(),
            },
        )
    return StreamingResponse(
        _event_stream(job_manager, request, task_id, PING_INTERVAL_SECONDS),
        media_type="text/event-stream",
    )
