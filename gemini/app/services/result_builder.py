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


def _build_video_type(task: Task, raw: dict) -> dict | None:
    raw_type = raw.get("video_type")
    if isinstance(raw_type, dict) and raw_type.get("label"):
        label = str(raw_type.get("label")).strip()
        if not label:
            return None
        confidence = raw_type.get("confidence", 0.0)
        try:
            confidence = float(confidence)
        except (TypeError, ValueError):
            confidence = 0.0
        confidence = max(0.0, min(confidence, 1.0))
        return {"label": label, "confidence": confidence}
    if task.video_type:
        return {"label": task.video_type, "confidence": 1.0}
    return None


def _build_summary(raw: dict) -> dict:
    summary = raw.get("summary")
    if isinstance(summary, dict):
        overall = str(summary.get("overall") or "").strip()
        by_slice = summary.get("by_slice") or []
        if not isinstance(by_slice, list):
            by_slice = []
        return {"overall": overall, "by_slice": by_slice}
    return {"overall": "", "by_slice": []}


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
        "video_type": _build_video_type(task, raw_payload),
        "transcript": transcript,
        "summary": _build_summary(raw_payload),
        "keywords": _build_keywords(keywords, mentions_by_keyword, links_by_keyword),
        "error": task.error,
    }
