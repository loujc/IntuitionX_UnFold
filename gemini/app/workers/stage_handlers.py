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
    build_chapter_split_prompt,
    build_chapter_summary_prompt,
    build_keyword_prompt,
    build_quotes_prompt,
    build_video_type_prompt,
)
from app.services.asr import ASRManager
from app.services.llm_client import call_llm_json
from app.services.llm_pipeline import (
    attach_mentions_by_term,
    build_transcript_text,
    normalize_chapter_ranges,
    normalize_chapter_summaries,
    normalize_keywords,
    normalize_quotes,
    normalize_video_types,
)
from app.services.llm_retry import call_llm_with_retry
from app.services.result_builder import build_task_result
from app.services.storage import get_task_dir
from app.services.subtitles import generate_srt, generate_vtt, write_subtitle
from app.services.transcript import merge_chunk_segments
from app.services.video_splitter import split_video

logger = logging.getLogger(__name__)


def _get_video_types(raw, task) -> list[str]:
    """Extract video_types from TaskRaw or Task.video_type fallback."""
    video_types: list[str] = []
    if raw and isinstance(raw.raw_json, dict):
        stored_types = raw.raw_json.get("video_types")
        if isinstance(stored_types, list):
            video_types = [str(item).strip() for item in stored_types if str(item).strip()]
    if not video_types and task.video_type:
        video_types = [task.video_type]
    return video_types


def build_stage_handlers(
    config: AppConfig, session_factory: SessionFactory
) -> Dict[str, StageHandler]:
    llm_semaphore = asyncio.Semaphore(max(1, config.processing.llm_concurrency))

    def _write_llm_artifact(
        task_id: str,
        filename: str,
        raw_payload: dict,
        normalized_payload: dict,
        source: str,
    ) -> Path:
        task_dir = get_task_dir(config.storage.temp_dir, task_id)
        task_dir.mkdir(parents=True, exist_ok=True)
        payload = {
            "raw": raw_payload,
            "normalized": normalized_payload,
            "meta": {
                "model": config.llm.model_name,
                "provider": config.llm.provider,
                "source": source,
            },
        }
        path = task_dir / filename
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
        return path

    def _write_llm_text(task_id: str, filename: str, lines: list[str]) -> Path:
        task_dir = get_task_dir(config.storage.temp_dir, task_id)
        task_dir.mkdir(parents=True, exist_ok=True)
        text = "\n".join([line for line in lines if line.strip()]).strip()
        path = task_dir / filename
        path.write_text(text, encoding="utf-8")
        return path

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
        transcript_path = task_dir / "transcript.txt"
        transcript_text = "\n".join(
            [segment["text"] for segment in segments if segment.get("text")]
        ).strip()
        transcript_path.write_text(transcript_text, encoding="utf-8")

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
                    "transcript_txt_path": str(transcript_path),
                    "segment_count": len(segments),
                },
            )
            save_task_log(db, task_id, "info", f"merge generated {len(segments)} segments")
            if indexed:
                save_task_log(db, task_id, "info", "transcript indexed for search")

    async def llm_summary(task_id: str, _: JobManager) -> None:
        """识别视频类型（多标签）。

        注意：此阶段原名 llm_summary，现仅负责视频类型识别。
        摘要生成已移至 llm_chapters 阶段（语义分章 + 章节摘要）。
        """
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            segments = get_segments_by_task(db, task_id)

        if not segments:
            raise RuntimeError("Missing segments for summary")

        transcript_text = build_transcript_text(segments, max_chars=None)

        video_types: list[str] = []
        type_raw: dict = {}
        type_source = "llm"
        type_messages = build_video_type_prompt(transcript_text, hint=task.video_type)
        try:
            type_raw = await call_llm_json_async(task_id, type_messages)
        except Exception:
            logger.exception("LLM video type failed")
            if task.video_type:
                type_source = "input"
                video_types = [task.video_type]
            else:
                raise
        if not video_types:
            video_types = normalize_video_types(type_raw)
        if not video_types and task.video_type:
            video_types = [task.video_type]

        llm_video_type_path = _write_llm_artifact(
            task_id,
            "llm_video_type.json",
            type_raw,
            {"types": video_types},
            source=type_source,
        )
        llm_video_type_txt_path = _write_llm_text(
            task_id,
            "llm_video_type.txt",
            video_types,
        )

        with session_factory() as db:
            upsert_task_raw(db, task_id, {"video_types": video_types})
            if video_types:
                update_task_video_type(db, task_id, video_types[0])
            update_task_input_meta(
                db,
                task_id,
                {
                    "llm_video_type_path": str(llm_video_type_path),
                    "llm_video_type_txt_path": str(llm_video_type_txt_path),
                },
            )
            save_task_log(db, task_id, "info", "llm video types completed")

    async def llm_keywords(task_id: str, _: JobManager) -> None:
        """关键词抽取（按章节输入，本地映射 segment_id）。

        1. 读取 llm_chapters 生成的章节结构
        2. 按章节文本调用 LLM 抽取关键词（simple/deep 模式）
        3. 通过文本匹配在本地关联 mentions（segment_id）
        """
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            segments = get_segments_by_task(db, task_id)
            raw = get_task_raw(db, task_id)

        if not segments:
            raise RuntimeError("Missing segments for keyword extraction")

        mode = (task.mode or config.system.default_mode or "simple").lower()
        default_mode = (config.system.default_mode or "simple").lower()

        video_types = _get_video_types(raw, task)

        segments_sorted = sorted(segments, key=lambda item: item.index)
        segment_id_to_index = {seg.segment_id: idx for idx, seg in enumerate(segments_sorted)}

        chapter_blocks: list[dict] = []
        chapters = []
        if raw and isinstance(raw.raw_json, dict):
            summary = raw.raw_json.get("summary") or {}
            if isinstance(summary, dict):
                chapters = summary.get("chapters") or []

        if isinstance(chapters, list) and chapters:
            for chapter in chapters:
                if not isinstance(chapter, dict):
                    continue
                start_id = chapter.get("segment_start_id")
                end_id = chapter.get("segment_end_id")
                if start_id not in segment_id_to_index or end_id not in segment_id_to_index:
                    continue
                start_idx = segment_id_to_index[start_id]
                end_idx = segment_id_to_index[end_id]
                if start_idx > end_idx:
                    start_idx, end_idx = end_idx, start_idx
                texts = [
                    seg.text
                    for seg in segments_sorted[start_idx : end_idx + 1]
                    if seg.text
                ]
                chapter_blocks.append(
                    {
                        "chapter_id": chapter.get("chapter_id", len(chapter_blocks)),
                        "text": " ".join(texts),
                    }
                )

        if not chapter_blocks:
            texts = [seg.text for seg in segments_sorted if seg.text]
            chapter_blocks = [{"chapter_id": 0, "text": " ".join(texts)}]

        keyword_messages = build_keyword_prompt(
            video_types,
            mode,
            default_mode,
            chapter_blocks,
        )
        try:
            keyword_raw = await call_llm_json_async(task_id, keyword_messages)
        except Exception:
            logger.exception("LLM keywords failed")
            raise
        keywords_payload = normalize_keywords(keyword_raw, segments)
        keywords_payload = attach_mentions_by_term(keywords_payload, segments_sorted)

        llm_keywords_path = _write_llm_artifact(
            task_id,
            "llm_keywords.json",
            keyword_raw,
            {"items": keywords_payload},
            source="llm",
        )
        llm_keywords_txt_path = _write_llm_text(
            task_id,
            "llm_keywords.txt",
            [
                f"{item['term']}: {item['definition']}"
                for item in keywords_payload
                if item.get("term") and item.get("definition")
            ],
        )

        with session_factory() as db:
            update_task_input_meta(
                db,
                task_id,
                {
                    "llm_keywords_path": str(llm_keywords_path),
                    "llm_keywords_txt_path": str(llm_keywords_txt_path),
                },
            )

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

    async def llm_chapters(task_id: str, _: JobManager) -> None:
        """语义分章 + 章节摘要（中文）。

        1. 调用 LLM 将完整字幕按语义分割为若干章节
        2. 为每个章节生成摘要，同时生成 overall 总结
        3. 输出存入 summary.chapters，by_slice 置空
        """
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            segments = get_segments_by_task(db, task_id)
            raw = get_task_raw(db, task_id)

        if not segments:
            raise RuntimeError("Missing segments for chapter split")

        segments = sorted(segments, key=lambda item: item.index)
        segment_payload = [
            {
                "segment_id": seg.segment_id,
                "start": float(seg.start),
                "end": float(seg.end),
                "text": seg.text,
            }
            for seg in segments
            if seg.text
        ]
        if not segment_payload:
            raise RuntimeError("Missing segment text for chapter split")

        video_types = _get_video_types(raw, task)

        split_messages = build_chapter_split_prompt(video_types, segment_payload)
        try:
            split_raw = await call_llm_json_async(task_id, split_messages)
        except Exception:
            logger.exception("LLM chapter split failed")
            raise
        ranges = normalize_chapter_ranges(split_raw, segments)
        if not ranges:
            logger.warning("Chapter split returned invalid ranges, falling back to single chapter")
            ranges = [{"chapter_id": 0, "start_index": 0, "end_index": len(segments) - 1}]

        chapter_payloads = []
        for item in ranges:
            start_index = item["start_index"]
            end_index = item["end_index"]
            texts = [seg.text for seg in segments[start_index : end_index + 1] if seg.text]
            chapter_payloads.append(
                {
                    "chapter_id": item["chapter_id"],
                    "start_segment_id": segments[start_index].segment_id,
                    "end_segment_id": segments[end_index].segment_id,
                    "text": " ".join(texts),
                }
            )

        summary_messages = build_chapter_summary_prompt(video_types, chapter_payloads)
        try:
            summary_raw = await call_llm_json_async(task_id, summary_messages)
        except Exception:
            logger.exception("LLM chapter summary failed")
            raise
        overall, summary_map = normalize_chapter_summaries(summary_raw)

        chapters_payload = []
        for item in ranges:
            start_index = item["start_index"]
            end_index = item["end_index"]
            chapter_id = item["chapter_id"]
            chapters_payload.append(
                {
                    "chapter_id": chapter_id,
                    "segment_start_id": segments[start_index].segment_id,
                    "segment_end_id": segments[end_index].segment_id,
                    "start": float(segments[start_index].start),
                    "end": float(segments[end_index].end),
                    "summary": summary_map.get(chapter_id, ""),
                }
            )

        llm_chapters_path = _write_llm_artifact(
            task_id,
            "llm_chapters.json",
            {"split": split_raw, "summary": summary_raw},
            {"chapters": chapters_payload},
            source="llm",
        )
        llm_summary_path = _write_llm_artifact(
            task_id,
            "llm_summary.json",
            summary_raw,
            {"overall": overall, "chapters": chapters_payload},
            source="llm",
        )
        llm_chapters_txt_path = _write_llm_text(
            task_id,
            "llm_chapters.txt",
            [
                f"chapter {item['chapter_id']}: {item['segment_start_id']} -> {item['segment_end_id']} "
                f"({item['start']}-{item['end']}s)"
                for item in chapters_payload
            ],
        )
        llm_summary_txt_path = _write_llm_text(
            task_id,
            "llm_summary.txt",
            [
                f"overall: {overall}",
                *[
                    f"chapter {item['chapter_id']}: {item['summary']}"
                    for item in chapters_payload
                    if item.get("summary")
                ],
            ],
        )

        summary_payload = {
            "overall": overall,
            "by_slice": [],
            "chapters": chapters_payload,
        }

        with session_factory() as db:
            upsert_task_raw(db, task_id, {"summary": summary_payload})
            update_task_input_meta(
                db,
                task_id,
                {
                    "llm_chapters_path": str(llm_chapters_path),
                    "llm_summary_path": str(llm_summary_path),
                    "llm_chapters_txt_path": str(llm_chapters_txt_path),
                    "llm_summary_txt_path": str(llm_summary_txt_path),
                },
            )
            save_task_log(db, task_id, "info", f"llm chapters completed ({len(chapters_payload)})")

    async def llm_quotes(task_id: str, _: JobManager) -> None:
        """金句抽取（基于全量字幕，返回 1-5 句原文）。"""
        with session_factory() as db:
            task = get_task(db, task_id)
            if task is None:
                raise RuntimeError(f"Task {task_id} not found")
            segments = get_segments_by_task(db, task_id)
            raw = get_task_raw(db, task_id)

        if not segments:
            raise RuntimeError("Missing segments for quotes")

        segments_sorted = sorted(segments, key=lambda item: item.index)
        segment_payload = [
            {
                "segment_id": seg.segment_id,
                "start": float(seg.start),
                "end": float(seg.end),
                "text": seg.text,
            }
            for seg in segments_sorted
            if seg.text
        ]
        if not segment_payload:
            raise RuntimeError("Missing segment text for quotes")

        video_types = _get_video_types(raw, task)

        quote_messages = build_quotes_prompt(video_types, segment_payload)
        try:
            quote_raw = await call_llm_json_async(task_id, quote_messages)
        except Exception:
            logger.exception("LLM quotes failed")
            raise

        quotes_payload = normalize_quotes(quote_raw, segments_sorted)

        llm_quotes_path = _write_llm_artifact(
            task_id,
            "llm_quotes.json",
            quote_raw,
            {"items": quotes_payload},
            source="llm",
        )
        llm_quotes_txt_path = _write_llm_text(
            task_id,
            "llm_quotes.txt",
            [item["text"] for item in quotes_payload if item.get("text")],
        )

        with session_factory() as db:
            upsert_task_raw(db, task_id, {"quotes": {"items": quotes_payload}})
            update_task_input_meta(
                db,
                task_id,
                {
                    "llm_quotes_path": str(llm_quotes_path),
                    "llm_quotes_txt_path": str(llm_quotes_txt_path),
                },
            )
            save_task_log(db, task_id, "info", f"llm quotes completed ({len(quotes_payload)})")

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
    handlers["llm_chapters"] = llm_chapters
    handlers["llm_quotes"] = llm_quotes
    handlers["llm_keywords"] = llm_keywords
    handlers["finalize"] = finalize
    return handlers
