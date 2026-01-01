from __future__ import annotations

from collections.abc import Iterable
from typing import Any


def _get_field(item: Any, name: str, default: Any) -> Any:
    if isinstance(item, dict):
        return item.get(name, default)
    return getattr(item, name, default)


def build_transcript_text(segments: Iterable[Any], max_chars: int = 6000) -> str:
    texts = []
    total = 0
    for segment in segments:
        text = str(_get_field(segment, "text", "") or "").strip()
        if not text:
            continue
        if total + len(text) + 1 > max_chars:
            remaining = max_chars - total
            if remaining > 20:
                # Try to find the nearest sentence boundary
                truncated = text[: remaining - 3]
                last_period = max(
                    truncated.rfind("."),
                    truncated.rfind("?"),
                    truncated.rfind("!"),
                    truncated.rfind("。"),
                    truncated.rfind("？"),
                    truncated.rfind("！"),
                )
                if last_period > remaining // 2:
                    texts.append(truncated[: last_period + 1])
                else:
                    texts.append(truncated + "...")
            elif remaining > 3:
                texts.append(text[: remaining - 3] + "...")
            break
        texts.append(text)
        total += len(text) + 1
    return "\n".join(texts)


def build_summary_slices(segments: Iterable[Any], chunk_duration: int) -> list[dict]:
    slices: dict[int, dict[str, Any]] = {}
    for segment in segments:
        start = float(_get_field(segment, "start", 0.0))
        end = float(_get_field(segment, "end", start))
        text = str(_get_field(segment, "text", "") or "").strip()
        if not text:
            continue
        slice_id = int(start // chunk_duration) if chunk_duration > 0 else 0
        if slice_id not in slices:
            slice_start = slice_id * chunk_duration
            slices[slice_id] = {
                "slice_id": slice_id,
                "start": slice_start,
                "end": slice_start + chunk_duration,
                "text": "",
            }
        slices[slice_id]["text"] = f"{slices[slice_id]['text']} {text}".strip()
        if end > slices[slice_id]["end"]:
            slices[slice_id]["end"] = end
    return [slices[key] for key in sorted(slices.keys())]


def normalize_video_type(raw: dict, allowed_types: Iterable[str]) -> dict:
    label = str(raw.get("label") or raw.get("video_type") or "").strip()
    allowed = {t.strip() for t in allowed_types}
    if label and label not in allowed:
        label = ""
    confidence = raw.get("confidence", 0.0)
    try:
        confidence = float(confidence)
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(confidence, 1.0))
    return {"label": label or None, "confidence": confidence if label else 0.0}


def normalize_summary(raw: dict, slices: list[dict]) -> dict:
    overall = str(raw.get("overall") or raw.get("summary") or "").strip()
    by_slice_raw = raw.get("by_slice") or raw.get("slices") or []
    slice_map = {item["slice_id"]: item for item in slices}
    by_slice: list[dict] = []
    for item in by_slice_raw:
        slice_id = item.get("slice_id")
        if slice_id is None:
            slice_id = item.get("index")
        if slice_id is None:
            continue
        if slice_id not in slice_map:
            continue
        summary_text = str(item.get("summary") or "").strip()
        slice_info = slice_map[slice_id]
        by_slice.append(
            {
                "slice_id": slice_id,
                "start": slice_info["start"],
                "end": slice_info["end"],
                "summary": summary_text,
            }
        )
    if not by_slice:
        # Assign overall summary to the first slice to avoid losing information
        by_slice = []
        for idx, item in enumerate(slices):
            by_slice.append(
                {
                    "slice_id": item["slice_id"],
                    "start": item["start"],
                    "end": item["end"],
                    "summary": overall if idx == 0 else "",
                }
            )
    return {"overall": overall, "by_slice": by_slice}


def normalize_keywords(raw: dict, segments: Iterable[Any]) -> list[dict]:
    items = raw.get("items") or raw.get("keywords") or []
    segment_by_index = {}
    valid_ids = set()
    for segment in segments:
        segment_id = str(_get_field(segment, "segment_id", ""))
        if not segment_id:
            continue
        valid_ids.add(segment_id)
        segment_by_index[int(_get_field(segment, "index", 0))] = segment_id

    normalized: list[dict] = []
    for item in items:
        term = str(item.get("term") or "").strip()
        definition = str(item.get("definition") or "").strip()
        if not term or not definition:
            continue
        mentions_in = item.get("mentions") or []
        mentions: list[dict] = []
        seen_ids = set()
        for mention in mentions_in:
            segment_id = mention.get("segment_id")
            if not segment_id and "index" in mention:
                try:
                    segment_id = segment_by_index[int(mention.get("index"))]
                except (KeyError, TypeError, ValueError):
                    segment_id = None
            if not segment_id or segment_id not in valid_ids:
                continue
            if segment_id in seen_ids:
                continue
            seen_ids.add(segment_id)
            mentions.append({"segment_id": segment_id})
        links_in = item.get("links") or []
        links: list[dict] = []
        for link in links_in:
            title = str(link.get("title") or "").strip()
            url = str(link.get("url") or "").strip()
            source = str(link.get("source") or "llm").strip()
            if not title or not url:
                continue
            links.append({"title": title, "url": url, "source": source})
        normalized.append(
            {
                "term": term,
                "definition": definition,
                "mentions": mentions,
                "links": links,
            }
        )
    return normalized
