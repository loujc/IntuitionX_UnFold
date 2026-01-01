from __future__ import annotations

from typing import Iterable


def merge_chunk_segments(chunks: Iterable[dict], chunk_duration: int) -> list[dict]:
    merged: list[dict] = []
    index = 0
    for chunk in sorted(chunks, key=lambda item: int(item.get("chunk_index", 0))):
        offset = int(chunk.get("chunk_index", 0)) * chunk_duration
        for segment in chunk.get("segments", []):
            start = float(segment.get("start", 0.0)) + offset
            end = float(segment.get("end", start)) + offset
            if end < start:
                end = start
            text = str(segment.get("text", "")).strip()
            if not text:
                continue
            merged.append(
                {
                    "segment_id": f"seg_{index:06d}",
                    "index": index,
                    "start": start,
                    "end": end,
                    "text": text,
                }
            )
            index += 1
    return merged
