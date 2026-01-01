from __future__ import annotations

import shutil
from pathlib import Path

from fastapi import UploadFile


def get_task_dir(temp_dir: str, task_id: str) -> Path:
    return Path(temp_dir) / task_id


def save_upload_file(temp_dir: str, task_id: str, upload: UploadFile) -> Path:
    task_dir = get_task_dir(temp_dir, task_id)
    task_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(upload.filename or "").suffix
    if not suffix:
        suffix = ".mp4"
    target_path = task_dir / f"input{suffix}"

    with target_path.open("wb") as target:
        shutil.copyfileobj(upload.file, target)

    return target_path
