from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Dict

from app.core.config import AppConfig
from app.core.job_manager import JobManager, STAGES, StageHandler, SessionFactory
from app.db.repository import get_task, save_task_log, update_task_input_meta
from app.services.video_splitter import split_video


def build_stage_handlers(
    config: AppConfig, session_factory: SessionFactory
) -> Dict[str, StageHandler]:
    async def slicing(task_id: str, _: JobManager) -> None:
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            source_path = (task.input_meta or {}).get("path")

        if not source_path:
            raise RuntimeError("Missing input video path for slicing")

        chunk_dir = Path(config.storage.temp_dir) / task_id / "chunks"
        chunks = await asyncio.to_thread(
            split_video,
            source_path,
            chunk_dir,
            config.processing.chunk_duration,
            config.processing.enable_chunking,
        )
        chunk_paths = [str(path) for path in chunks]
        if not chunk_paths:
            raise RuntimeError("Video split produced no chunks")

        with session_factory() as db:
            update_task_input_meta(
                db,
                task_id,
                {"chunk_dir": str(chunk_dir), "chunks": chunk_paths},
            )
            save_task_log(db, task_id, "info", f"slicing produced {len(chunk_paths)} chunks")

    async def noop(_: str, __: JobManager) -> None:
        return None

    handlers: Dict[str, StageHandler] = {stage: noop for stage in STAGES}
    handlers["slicing"] = slicing
    return handlers
