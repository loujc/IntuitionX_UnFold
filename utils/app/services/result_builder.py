from __future__ import annotations

from typing import Iterable

from app.db.models import Keyword, KeywordLink, KeywordMention, Segment, Task


def _serialize_segment(segment: Segment) -> dict:
    return {
        "segment_id": segment.segment_id,
        "index": segment.index,
        "start": float(segment.start),
        "end": float(segment.end),
        "text": segment.text,
    }


def _build_video_type_list(task: Task, raw: dict) -> list[str]:
    items = raw.get("video_types") or []
    if isinstance(items, str):
        items = [items]
    if not isinstance(items, list):
        items = []
    types = [str(item).strip() for item in items if str(item).strip()]
    if not types:
        raw_type = raw.get("video_type")
        if isinstance(raw_type, dict) and raw_type.get("label"):
            label = str(raw_type.get("label")).strip()
            if label:
                types = [label]
        elif isinstance(raw_type, str) and raw_type.strip():
            types = [raw_type.strip()]
    if not types and task.video_type:
        types = [task.video_type]
    return types


def _build_summary(raw: dict) -> dict:
    summary = raw.get("summary")
    if isinstance(summary, dict):
        overall = str(summary.get("overall") or "").strip()
        by_slice = summary.get("by_slice") or []
        if not isinstance(by_slice, list):
            by_slice = []
        chapters = summary.get("chapters") or []
        if not isinstance(chapters, list):
            chapters = []
        return {"overall": overall, "by_slice": by_slice, "chapters": chapters}
    return {"overall": "", "by_slice": [], "chapters": []}


def _build_keywords(
    keywords: Iterable[Keyword],
    mentions_by_keyword: dict[int, list[KeywordMention]],
    links_by_keyword: dict[int, list[KeywordLink]],
) -> dict:
    items: list[dict] = []
    for keyword in keywords:
        mentions = [
            {"segment_id": mention.segment_id}
            for mention in mentions_by_keyword.get(keyword.id, [])
        ]
        links = [
            {"title": link.title, "url": link.url, "source": link.source}
            for link in links_by_keyword.get(keyword.id, [])
        ]
        items.append(
            {
                "keyword_id": keyword.id,
                "term": keyword.term,
                "definition": keyword.definition,
                "mentions": mentions,
                "links": links,
            }
        )
    return {"items": items}


def _build_quotes(raw: dict) -> dict:
    payload = raw.get("quotes")
    if isinstance(payload, dict):
        items = payload.get("items") or []
    else:
        items = payload or []
    if not isinstance(items, list):
        items = []
    normalized: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        segment_id = str(item.get("segment_id") or "").strip()
        if not segment_id:
            continue
        text = str(item.get("text") or "").strip()
        if not text:
            continue
        try:
            index = int(item.get("index", 0))
        except (TypeError, ValueError):
            index = 0
        try:
            start = float(item.get("start", 0.0))
        except (TypeError, ValueError):
            start = 0.0
        try:
            end = float(item.get("end", start))
        except (TypeError, ValueError):
            end = start
        normalized.append(
            {
                "segment_id": segment_id,
                "index": index,
                "start": start,
                "end": end,
                "text": text,
            }
        )
    return {"items": normalized}


def build_task_result(
    task: Task,
    segments: list[Segment],
    keywords: list[Keyword],
    mentions_by_keyword: dict[int, list[KeywordMention]],
    links_by_keyword: dict[int, list[KeywordLink]],
    input_meta: dict | None,
    raw: dict | None,
    status: str | None = None,
) -> dict:
    meta = input_meta or {}
    raw_payload = raw or {}
    result_status = status or task.status
    transcript = {
        "segments": [_serialize_segment(segment) for segment in segments],
        "srt_path": meta.get("srt_path"),
        "vtt_path": meta.get("vtt_path"),
    }
    return {
        "task_id": task.id,
        "status": result_status,
        "mode": task.mode,
        "video_type": _build_video_type_list(task, raw_payload),
        "transcript": transcript,
        "summary": _build_summary(raw_payload),
        "keywords": _build_keywords(keywords, mentions_by_keyword, links_by_keyword),
        "quotes": _build_quotes(raw_payload),
        "error": task.error,
    }
