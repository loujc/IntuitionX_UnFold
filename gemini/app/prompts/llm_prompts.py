from __future__ import annotations

from typing import Iterable


SYSTEM_PROMPT = "You are a helpful assistant. Return only valid JSON."


def _truncate(text: str, max_chars: int = 4000) -> str:
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 3] + "..."


def build_video_type_prompt(video_types: Iterable[str], transcript_text: str) -> list[dict]:
    types = ", ".join(video_types)
    user_prompt = (
        "Classify the video type using the allowed list.\n"
        f"Allowed types: {types}\n"
        'Return JSON: {"label": "<type or null>", "confidence": 0.0}.\n'
        "Transcript:\n"
        f"{_truncate(transcript_text)}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_summary_prompt(video_type: str | None, slices: list[dict]) -> list[dict]:
    label = video_type or "unknown"
    slice_blocks = []
    for item in slices:
        slice_blocks.append(
            f"[slice {item['slice_id']}] ({item['start']}-{item['end']}s)\n{item['text']}"
        )
    slices_text = "\n\n".join(slice_blocks)
    user_prompt = (
        "Summarize the video and each slice. Return JSON with fields:\n"
        '{"overall": "...", "by_slice": [{"slice_id": 0, "start": 0, "end": 300, "summary": "..."}]}.\n'
        f"Video type: {label}\n"
        f"Slices:\n{_truncate(slices_text, max_chars=6000)}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_keyword_prompt(video_type: str | None, mode: str, segments: list[dict]) -> list[dict]:
    label = video_type or "unknown"
    mode = mode.lower().strip()
    if mode == "deep":
        mode_rule = "Extract technical terms and provide detailed definitions."
    else:
        mode_rule = "Extract only highly obscure terms and keep definitions brief."

    segment_lines = [f"[{item['segment_id']}] {item['text']}" for item in segments]
    transcript_text = "\n".join(segment_lines)
    user_prompt = (
        "Extract keywords from the transcript. Return JSON:\n"
        '{"items":[{"term":"...","definition":"...","mentions":[{"segment_id":"seg_000001"}],'
        '"links":[{"title":"...","url":"https://example.com","source":"llm"}]}]}.\n'
        f"Video type: {label}\n"
        f"Extraction Mode: {mode}\n"
        f"Rule: {mode_rule}\n"
        "Transcript:\n"
        f"{_truncate(transcript_text, max_chars=8000)}"
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]
