from __future__ import annotations

import re
from collections.abc import Iterable
from typing import Any


def _get_field(item: Any, name: str, default: Any) -> Any:
    if isinstance(item, dict):
        return item.get(name, default)
    return getattr(item, name, default)


def build_transcript_text(segments: Iterable[Any], max_chars: int | None = 6000) -> str:
    texts = []
    total = 0
    for segment in segments:
        text = str(_get_field(segment, "text", "") or "").strip()
        if not text:
            continue
        if max_chars is None:
            texts.append(text)
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


def normalize_video_types(raw: dict, max_items: int = 10) -> list[str]:
    items = raw.get("types") or raw.get("labels") or raw.get("video_types") or []
    if isinstance(items, str):
        items = [items]
    if not isinstance(items, list):
        return []
    results: list[str] = []
    for item in items:
        label = str(item or "").strip()
        if not label:
            continue
        if label in results:
            continue
        results.append(label)
        if len(results) >= max_items:
            break
    return results


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


def normalize_chapter_ranges(raw: dict, segments: Iterable[Any]) -> list[dict]:
    items = raw.get("chapters") or raw.get("sections") or raw.get("items") or []
    segment_list = list(segments)
    id_to_index: dict[str, int] = {}
    for idx, segment in enumerate(segment_list):
        segment_id = str(_get_field(segment, "segment_id", "") or "")
        if segment_id:
            id_to_index[segment_id] = idx
    if not id_to_index or not segment_list:
        return []

    ranges: list[dict] = []
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        start_id = item.get("start_segment_id") or item.get("start_id") or item.get("from")
        end_id = item.get("end_segment_id") or item.get("end_id") or item.get("to")
        if not start_id or not end_id:
            continue
        start_id = str(start_id)
        end_id = str(end_id)
        if start_id not in id_to_index or end_id not in id_to_index:
            continue
        start_index = id_to_index[start_id]
        end_index = id_to_index[end_id]
        if start_index > end_index:
            start_index, end_index = end_index, start_index
        chapter_id = item.get("chapter_id")
        try:
            chapter_id = int(chapter_id)
        except (TypeError, ValueError):
            chapter_id = idx
        ranges.append(
            {
                "chapter_id": chapter_id,
                "start_index": start_index,
                "end_index": end_index,
            }
        )

    ranges.sort(key=lambda item: (item["start_index"], item["end_index"]))
    if not ranges:
        return []

    last_index = len(segment_list) - 1

    # Auto-extend boundaries to cover full transcript
    if ranges[0]["start_index"] > 0:
        ranges[0]["start_index"] = 0
    if ranges[-1]["end_index"] < last_index:
        ranges[-1]["end_index"] = last_index

    # Validate no overlaps and no gaps
    prev_end = -1
    for item in ranges:
        if item["start_index"] <= prev_end:
            return []
        if prev_end != -1 and item["start_index"] != prev_end + 1:
            return []
        prev_end = item["end_index"]

    return ranges


def normalize_chapter_summaries(raw: dict) -> tuple[str, dict[int, str]]:
    overall = str(raw.get("overall") or raw.get("summary") or "").strip()
    items = raw.get("chapters") or raw.get("items") or []
    summaries: dict[int, str] = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        chapter_id = item.get("chapter_id")
        try:
            chapter_id = int(chapter_id)
        except (TypeError, ValueError):
            continue
        summary = str(item.get("summary") or item.get("text") or "").strip()
        summaries[chapter_id] = summary
    return overall, summaries


def attach_mentions_by_term(
    keywords: list[dict],
    segments: Iterable[Any],
) -> list[dict]:
    segment_list = []
    for segment in segments:
        segment_id = str(_get_field(segment, "segment_id", "") or "")
        text = str(_get_field(segment, "text", "") or "")
        index = int(_get_field(segment, "index", 0))
        if not segment_id or not text:
            continue
        segment_list.append({"segment_id": segment_id, "text": text, "index": index})
    if not segment_list:
        return keywords
    segment_list.sort(key=lambda item: item["index"])

    for item in keywords:
        term = str(item.get("term") or "").strip()
        if not term:
            item["mentions"] = []
            continue
        # Use word boundary matching to avoid substring false positives
        # e.g., "AI" should not match "WAIT", "in" should not match "inside"
        pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
        mentions: list[dict] = []
        seen_ids: set[str] = set()
        for segment in segment_list:
            text = segment["text"]
            if pattern.search(text):
                seg_id = segment["segment_id"]
                if seg_id in seen_ids:
                    continue
                seen_ids.add(seg_id)
                mentions.append({"segment_id": seg_id})
        item["mentions"] = mentions
    return keywords


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


def _normalize_match_text(text: str) -> str:
    return "".join(char for char in text if not char.isspace())


def _trim_text_to_target(text: str, target_norm: str) -> str:
    if not target_norm:
        return text
    chars: list[str] = []
    count = 0
    for char in text:
        chars.append(char)
        if char.isspace():
            continue
        count += 1
        if count >= len(target_norm):
            break
    return "".join(chars)


def normalize_quotes(raw: dict, segments: Iterable[Any], max_items: int = 5) -> list[dict]:
    items = raw.get("quotes") or raw.get("items") or []
    if isinstance(items, dict):
        items = items.get("items") or []
    if isinstance(items, str):
        items = []
    if not isinstance(items, list):
        return []

    segment_list = sorted(segments, key=lambda item: int(_get_field(item, "index", 0)))
    by_id: dict[str, Any] = {}
    by_index: dict[int, Any] = {}
    id_to_pos: dict[str, int] = {}
    for pos, segment in enumerate(segment_list):
        segment_id = str(_get_field(segment, "segment_id", "") or "")
        if segment_id:
            by_id[segment_id] = segment
            id_to_pos[segment_id] = pos
        try:
            index = int(_get_field(segment, "index", 0))
        except (TypeError, ValueError):
            index = 0  # Use default instead of skipping
        by_index[index] = segment

    results: list[dict] = []
    seen: set[str] = set()
    for item in items:
        if not isinstance(item, dict):
            continue
        segment_id = item.get("segment_id") or item.get("id") or item.get("segment")
        if not segment_id and "index" in item:
            try:
                segment_id = _get_field(by_index[int(item.get("index"))], "segment_id", "")
            except (KeyError, TypeError, ValueError):
                segment_id = None
        if not segment_id:
            continue
        segment_id = str(segment_id)
        if segment_id in seen or segment_id not in by_id:
            continue
        target_text = str(item.get("text") or "").strip()
        if not target_text:
            continue
        target_norm = _normalize_match_text(target_text)
        if not target_norm:
            continue

        start_idx = id_to_pos.get(segment_id)
        if start_idx is None:
            continue
        match_end_idx = None
        concat_text = ""
        concat_norm = ""
        for end_idx in range(start_idx, len(segment_list)):
            concat_text += str(_get_field(segment_list[end_idx], "text", "") or "")
            concat_norm = _normalize_match_text(concat_text)
            if concat_norm.startswith(target_norm) and len(concat_norm) >= len(target_norm):
                match_end_idx = end_idx
                break

        if match_end_idx is None:
            match_end_idx = start_idx
            matched_text = str(_get_field(segment_list[start_idx], "text", "") or "")
        else:
            matched_text = _trim_text_to_target(concat_text, target_norm).strip()
            if not matched_text:
                matched_text = str(_get_field(segment_list[start_idx], "text", "") or "")

        start_segment = segment_list[start_idx]
        end_segment = segment_list[match_end_idx]
        seen.add(segment_id)
        results.append(
            {
                "segment_id": segment_id,
                "index": int(_get_field(start_segment, "index", 0)),
                "start": float(_get_field(start_segment, "start", 0.0)),
                "end": float(_get_field(end_segment, "end", 0.0)),
                "text": matched_text,
            }
        )
        if len(results) >= max_items:
            break
    return results
