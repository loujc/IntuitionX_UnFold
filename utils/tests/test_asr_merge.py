from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

import pytest

from app.core.config import AppConfig
from app.services.asr import ASRManager
from app.services.subtitles import generate_srt, generate_vtt
from app.services.transcript import merge_chunk_segments


def _write_wav(path: Path, duration: float = 0.5, rate: int = 16000) -> None:
    frames = int(duration * rate)
    payload = bytearray()
    for i in range(frames):
        sample = int(32767 * math.sin(2 * math.pi * 440 * i / rate))
        payload += struct.pack("<h", sample)
    with wave.open(str(path), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(rate)
        audio.writeframes(payload)


def _parse_srt(content: str) -> list[list[str]]:
    blocks = [block for block in content.strip().split("\n\n") if block.strip()]
    cues: list[list[str]] = []
    for block in blocks:
        lines = block.splitlines()
        assert lines[0].isdigit()
        assert "-->" in lines[1]
        cues.append(lines)
    return cues


def _parse_vtt(content: str) -> list[str]:
    lines = [line for line in content.splitlines() if line.strip()]
    assert lines[0] == "WEBVTT"
    return [line for line in lines[1:] if "-->" in line]


def test_stub_asr_transcribe(tmp_path: Path) -> None:
    audio_path = tmp_path / "sample.wav"
    _write_wav(audio_path)

    config = AppConfig()
    config.asr.backend = "stub"
    manager = ASRManager(config)

    segments = manager.transcribe(audio_path)
    assert segments
    first = segments[0]
    assert {"start", "end", "text"} <= set(first)
    assert first["end"] >= first["start"]


def test_merge_and_generate_subtitles() -> None:
    chunks = [
        {"chunk_index": 0, "segments": [{"start": 0.0, "end": 1.0, "text": "Hello"}]},
        {"chunk_index": 1, "segments": [{"start": 0.5, "end": 1.5, "text": "World"}]},
    ]
    merged = merge_chunk_segments(chunks, chunk_duration=2)

    assert merged[0]["segment_id"] == "seg_000000"
    assert merged[1]["index"] == 1
    assert merged[1]["start"] == pytest.approx(2.5)

    srt = generate_srt(merged)
    vtt = generate_vtt(merged)
    assert len(_parse_srt(srt)) == len(merged)
    assert len(_parse_vtt(vtt)) == len(merged)
