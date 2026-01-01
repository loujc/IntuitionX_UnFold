from __future__ import annotations

import asyncio
import json
import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict

from app.core.config import AppConfig
from app.core.job_manager import JobManager, STAGES, StageHandler, SessionFactory
from app.db.repository import (
    bulk_insert_keywords,
    bulk_insert_links,
    bulk_insert_mentions,
    bulk_insert_segments,
    get_keyword_links,
    get_keyword_mentions,
    get_keywords_by_task,
    get_segments_by_task,
    get_task,
    get_task_raw,
    save_task_log,
    update_task_input_meta,
    update_task_video_type,
    upsert_task_raw,
    upsert_task_result,
)
from app.db.search import index_keywords, index_segments
from app.prompts.llm_prompts import (
    build_keyword_prompt,
    build_summary_prompt,
    build_video_type_prompt,
)
from app.services.asr import ASRManager
from app.services.llm_client import call_llm_json
from app.services.llm_pipeline import (
    build_summary_slices,
    build_transcript_text,
    normalize_keywords,
    normalize_summary,
    normalize_video_type,
)
from app.services.llm_retry import call_llm_with_retry
from app.services.result_builder import build_task_result
from app.services.storage import get_task_dir
from app.services.subtitles import generate_srt, generate_vtt, write_subtitle
from app.services.transcript import merge_chunk_segments
from app.services.video_splitter import split_video

logger = logging.getLogger(__name__)


def build_stage_handlers(
    config: AppConfig, session_factory: SessionFactory
) -> Dict[str, StageHandler]:
    llm_semaphore = asyncio.Semaphore(max(1, config.processing.llm_concurrency))

    async def call_llm_json_async(task_id: str, messages: list[dict]) -> dict:
        async with llm_semaphore:
            return await asyncio.to_thread(
                call_llm_with_retry,
                session_factory,
                task_id,
                call_llm_json,
                config,
                messages,
                temperature=0.3,
            )

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
            upsert_task_raw(db, task_id, {"asr": {"chunks": chunks_payload}})
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

    async def llm_summary(task_id: str, _: JobManager) -> None:
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            segments = get_segments_by_task(db, task_id)

        if not segments:
            raise RuntimeError("Missing segments for summary")

        transcript_text = build_transcript_text(segments)
        slices = build_summary_slices(segments, config.processing.chunk_duration)
        if not slices:
            raise RuntimeError("Missing slices for summary")

        video_type_payload: dict
        if task.video_type:
            video_type_payload = {"label": task.video_type, "confidence": 1.0}
        else:
            type_messages = build_video_type_prompt(config.system.video_types, transcript_text)
            try:
                type_raw = await call_llm_json_async(task_id, type_messages)
            except Exception:
                logger.exception("LLM video type failed")
                raise
            video_type_payload = normalize_video_type(type_raw, config.system.video_types)
            if video_type_payload.get("label"):
                with session_factory() as db:
                    update_task_video_type(db, task_id, video_type_payload["label"])

        summary_messages = build_summary_prompt(video_type_payload.get("label"), slices)
        try:
            summary_raw = await call_llm_json_async(task_id, summary_messages)
        except Exception:
            logger.exception("LLM summary failed")
            raise
        summary_payload = normalize_summary(summary_raw, slices)

        with session_factory() as db:
            upsert_task_raw(
                db,
                task_id,
                {"video_type": video_type_payload, "summary": summary_payload},
            )
            save_task_log(db, task_id, "info", "llm summary completed")

    async def llm_keywords(task_id: str, _: JobManager) -> None:
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            segments = get_segments_by_task(db, task_id)

        if not segments:
            raise RuntimeError("Missing segments for keyword extraction")

        mode = (task.mode or config.system.default_mode or "simple").lower()
        segment_payload = [
            {"segment_id": seg.segment_id, "text": seg.text}
            for seg in segments
            if seg.text
        ]
        keyword_messages = build_keyword_prompt(task.video_type, mode, segment_payload)
        try:
            keyword_raw = await call_llm_json_async(task_id, keyword_messages)
        except Exception:
            logger.exception("LLM keywords failed")
            raise
        keywords_payload = normalize_keywords(keyword_raw, segments)

        if not keywords_payload:
            with session_factory() as db:
                upsert_task_raw(db, task_id, {"keywords": {"items": []}})
                save_task_log(db, task_id, "info", "llm keywords empty")
            return

        keyword_rows = [
            {"term": item["term"], "definition": item["definition"]}
            for item in keywords_payload
        ]
        with session_factory() as db:
            keywords = bulk_insert_keywords(db, task_id, keyword_rows)

        mentions_to_insert: list[dict] = []
        links_to_insert: list[dict] = []
        for item, keyword in zip(keywords_payload, keywords):
            item["keyword_id"] = keyword.id
            for mention in item.get("mentions", []):
                mentions_to_insert.append(
                    {
                        "keyword_id": keyword.id,
                        "segment_id": mention["segment_id"],
                    }
                )
            for link in item.get("links", []):
                links_to_insert.append(
                    {
                        "keyword_id": keyword.id,
                        "title": link["title"],
                        "url": link["url"],
                        "source": link["source"],
                    }
                )

        with session_factory() as db:
            if mentions_to_insert:
                bulk_insert_mentions(db, task_id, mentions_to_insert)
            if links_to_insert:
                bulk_insert_links(db, links_to_insert)

        with session_factory() as db:
            indexed = index_keywords(db, task_id, keywords)
            db.commit()  # Commit index changes regardless of FTS5 availability
            if indexed:
                save_task_log(db, task_id, "info", "keywords indexed for search")

        with session_factory() as db:
            upsert_task_raw(db, task_id, {"keywords": {"items": keywords_payload}})
            save_task_log(db, task_id, "info", f"llm keywords completed ({len(keywords_payload)})")

    async def finalize(task_id: str, _: JobManager) -> None:
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            segments = get_segments_by_task(db, task_id)
            keywords = get_keywords_by_task(db, task_id)
            raw = get_task_raw(db, task_id)

        mentions_by_keyword: dict[int, list] = {}
        links_by_keyword: dict[int, list] = {}
        if keywords:
            with session_factory() as db:
                for keyword in keywords:
                    mentions_by_keyword[keyword.id] = get_keyword_mentions(db, keyword.id)
                    links_by_keyword[keyword.id] = get_keyword_links(db, keyword.id)

        result_payload = build_task_result(
            task=task,
            segments=segments,
            keywords=keywords,
            mentions_by_keyword=mentions_by_keyword,
            links_by_keyword=links_by_keyword,
            input_meta=task.input_meta,
            raw=raw.raw_json if raw else None,
            status="finished",
        )

        with session_factory() as db:
            upsert_task_result(db, task_id, result_payload)
            save_task_log(db, task_id, "info", "final result assembled")

    async def noop(_: str, __: JobManager) -> None:
        return None

    handlers: Dict[str, StageHandler] = {stage: noop for stage in STAGES}
    handlers["slicing"] = slicing
    handlers["asr"] = asr
    handlers["merge"] = merge
    handlers["llm_summary"] = llm_summary
    handlers["llm_keywords"] = llm_keywords
    handlers["finalize"] = finalize
    return handlers
