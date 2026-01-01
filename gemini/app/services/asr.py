from __future__ import annotations

import importlib.util
import threading
import wave
from pathlib import Path
from typing import Any

from app.core.config import AppConfig


SegmentDict = dict[str, Any]


class BaseASRBackend:
    def transcribe(self, audio_path: str) -> list[SegmentDict]:
        raise NotImplementedError


def _module_available(module_name: str) -> bool:
    return importlib.util.find_spec(module_name) is not None


def resolve_backend_name(config: AppConfig) -> str:
    backend = (config.asr.backend or "auto").lower().replace("_", "-")
    if backend == "auto":
        if _module_available("faster_whisper"):
            return "faster-whisper"
        if _module_available("mlx_whisper"):
            return "mlx-whisper"
        return "stub"
    if backend in {"faster-whisper", "mlx-whisper", "stub"}:
        return backend
    raise ValueError(f"Unsupported ASR backend: {backend}")


def _normalize_segments(segments: list[SegmentDict]) -> list[SegmentDict]:
    normalized: list[SegmentDict] = []
    for segment in segments:
        start = float(segment.get("start", 0.0))
        end = float(segment.get("end", start))
        if end < start:
            end = start
        text = str(segment.get("text", "") or "").strip()
        if not text:
            continue
        normalized.append({"start": start, "end": end, "text": text})
    return normalized


def _wav_duration(path: str) -> float:
    try:
        with wave.open(path, "rb") as audio:
            frames = audio.getnframes()
            rate = audio.getframerate()
            if rate <= 0:
                return 0.0
            return frames / float(rate)
    except (wave.Error, FileNotFoundError):
        return 0.0


class FasterWhisperBackend(BaseASRBackend):
    def __init__(self, model_size: str) -> None:
        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise RuntimeError(
                "faster-whisper is not installed. Run `pip install faster-whisper`."
            ) from exc
        self._model = WhisperModel(model_size, device="auto", compute_type="auto")

    def transcribe(self, audio_path: str) -> list[SegmentDict]:
        segments, _info = self._model.transcribe(audio_path)
        return [
            {
                "start": float(segment.start),
                "end": float(segment.end),
                "text": str(segment.text),
            }
            for segment in segments
        ]


class MLXWhisperBackend(BaseASRBackend):
    def __init__(self, model_size: str) -> None:
        try:
            import mlx_whisper
        except ImportError as exc:
            raise RuntimeError(
                "mlx-whisper is not installed. Run `pip install mlx-whisper`."
            ) from exc
        self._mlx = mlx_whisper
        self._model_size = model_size

    def _call_transcribe(self, audio_path: str) -> dict[str, Any]:
        try:
            return self._mlx.transcribe(audio_path, path_or_hf_repo=self._model_size)
        except TypeError:
            try:
                return self._mlx.transcribe(audio_path, model=self._model_size)
            except TypeError:
                return self._mlx.transcribe(audio_path)

    def transcribe(self, audio_path: str) -> list[SegmentDict]:
        result = self._call_transcribe(audio_path)
        segments = result.get("segments") or []
        return [
            {
                "start": float(segment.get("start", 0.0)),
                "end": float(segment.get("end", 0.0)),
                "text": str(segment.get("text", "")),
            }
            for segment in segments
        ]


class StubBackend(BaseASRBackend):
    def transcribe(self, audio_path: str) -> list[SegmentDict]:
        duration = _wav_duration(audio_path)
        if duration <= 0:
            duration = 0.1
        name = Path(audio_path).name
        return [{"start": 0.0, "end": duration, "text": f"stub transcript for {name}"}]


def create_backend(name: str, config: AppConfig) -> BaseASRBackend:
    if name == "faster-whisper":
        return FasterWhisperBackend(config.asr.model_size)
    if name == "mlx-whisper":
        return MLXWhisperBackend(config.asr.model_size)
    if name == "stub":
        return StubBackend()
    raise ValueError(f"Unsupported ASR backend: {name}")


class ASRManager:
    def __init__(self, config: AppConfig) -> None:
        self._config = config
        self.backend_name = resolve_backend_name(config)
        self._thread_local = threading.local()

    def _get_backend(self) -> BaseASRBackend:
        backend = getattr(self._thread_local, "backend", None)
        if backend is None:
            backend = create_backend(self.backend_name, self._config)
            self._thread_local.backend = backend
        return backend

    def transcribe(self, audio_path: str | Path) -> list[SegmentDict]:
        backend = self._get_backend()
        segments = backend.transcribe(str(audio_path))
        return _normalize_segments(segments)
