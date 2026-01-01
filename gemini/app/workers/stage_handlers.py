from __future__ import annotations

import asyncio
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict

from app.core.config import AppConfig
from app.core.job_manager import JobManager, STAGES, StageHandler, SessionFactory
from app.db.repository import (
    bulk_insert_segments,
    get_task,
    save_task_log,
    save_task_raw,
    update_task_input_meta,
)
from app.db.search import index_segments
from app.services.asr import ASRManager
from app.services.storage import get_task_dir
from app.services.subtitles import generate_srt, generate_vtt, write_subtitle
from app.services.transcript import merge_chunk_segments
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

    async def asr(task_id: str, _: JobManager) -> None:
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            chunk_paths = (task.input_meta or {}).get("chunks") or []

        if not chunk_paths:
            raise RuntimeError("Missing chunks for ASR")

        asr_manager = ASRManager(config)
        max_workers = max(1, config.processing.max_asr_workers)
        loop = asyncio.get_running_loop()
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            tasks = [
                loop.run_in_executor(executor, asr_manager.transcribe, path)
                for path in chunk_paths
            ]
            results = await asyncio.gather(*tasks)

        chunks_payload = []
        total_segments = 0
        for idx, (path, segments) in enumerate(zip(chunk_paths, results)):
            total_segments += len(segments)
            chunks_payload.append({"chunk_index": idx, "path": path, "segments": segments})

        if total_segments == 0:
            raise RuntimeError("ASR produced no segments")

        task_dir = get_task_dir(config.storage.temp_dir, task_id)
        task_dir.mkdir(parents=True, exist_ok=True)
        asr_path = task_dir / "asr.json"
        asr_path.write_text(
            json.dumps({"chunks": chunks_payload}, ensure_ascii=True, indent=2)
        )

        with session_factory() as db:
            save_task_raw(db, task_id, {"chunks": chunks_payload})
            update_task_input_meta(
                db,
                task_id,
                {"asr_path": str(asr_path), "asr_backend": asr_manager.backend_name},
            )
            save_task_log(db, task_id, "info", f"asr produced {total_segments} segments")

    async def merge(task_id: str, _: JobManager) -> None:
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            asr_path = (task.input_meta or {}).get("asr_path")

        if not asr_path:
            raise RuntimeError("Missing ASR output for merge")

        payload = json.loads(Path(asr_path).read_text())
        chunks = payload.get("chunks") or []
        segments = merge_chunk_segments(chunks, config.processing.chunk_duration)
        if not segments:
            raise RuntimeError("ASR merge produced no segments")

        task_dir = get_task_dir(config.storage.temp_dir, task_id)
        task_dir.mkdir(parents=True, exist_ok=True)
        srt_path = task_dir / "transcript.srt"
        vtt_path = task_dir / "transcript.vtt"
        write_subtitle(srt_path, generate_srt(segments))
        write_subtitle(vtt_path, generate_vtt(segments))

        with session_factory() as db:
            bulk_insert_segments(db, task_id, segments)

        with session_factory() as db:
            indexed = index_segments(db, task_id, segments)
            update_task_input_meta(
                db,
                task_id,
                {
                    "srt_path": str(srt_path),
                    "vtt_path": str(vtt_path),
                    "segment_count": len(segments),
                },
            )
            save_task_log(db, task_id, "info", f"merge generated {len(segments)} segments")
            if indexed:
                save_task_log(db, task_id, "info", "transcript indexed for search")

    async def noop(_: str, __: JobManager) -> None:
        return None

    handlers: Dict[str, StageHandler] = {stage: noop for stage in STAGES}
    handlers["slicing"] = slicing
    handlers["asr"] = asr
    handlers["merge"] = merge
    return handlers
