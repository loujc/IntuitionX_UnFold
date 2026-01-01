from __future__ import annotations

from pathlib import Path
from typing import Iterable


def _format_timestamp(seconds: float, sep: str) -> str:
    total_ms = int(round(max(seconds, 0.0) * 1000))
    hours = total_ms // 3_600_000
    total_ms %= 3_600_000
    minutes = total_ms // 60_000
    total_ms %= 60_000
    secs = total_ms // 1_000
    ms = total_ms % 1_000
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{sep}{ms:03d}"


def _sanitize_text(text: str) -> str:
    return " ".join(str(text).split())


def format_timestamp_srt(seconds: float) -> str:
    return _format_timestamp(seconds, ",")


def format_timestamp_vtt(seconds: float) -> str:
    return _format_timestamp(seconds, ".")


def generate_srt(segments: Iterable[dict]) -> str:
    blocks: list[str] = []
    for idx, segment in enumerate(segments, start=1):
        start = format_timestamp_srt(float(segment.get("start", 0.0)))
        end = format_timestamp_srt(float(segment.get("end", 0.0)))
        text = _sanitize_text(segment.get("text", ""))
        blocks.append(f"{idx}\n{start} --> {end}\n{text}")
    return "\n\n".join(blocks).strip() + "\n"


def generate_vtt(segments: Iterable[dict]) -> str:
    lines = ["WEBVTT", ""]
    for segment in segments:
        start = format_timestamp_vtt(float(segment.get("start", 0.0)))
        end = format_timestamp_vtt(float(segment.get("end", 0.0)))
        text = _sanitize_text(segment.get("text", ""))
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def write_subtitle(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")
