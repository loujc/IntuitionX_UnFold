from __future__ import annotations

import logging
import subprocess
from pathlib import Path


logger = logging.getLogger(__name__)


def split_video(
    source_path: str | Path,
    output_dir: str | Path,
    chunk_duration: int,
    enable_chunking: bool = True,
) -> list[Path]:
    src = str(source_path)
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if enable_chunking:
        output_pattern = str(out_dir / "chunk_%03d.wav")
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            src,
            "-ac",
            "1",
            "-ar",
            "16000",
            "-vn",
            "-f",
            "segment",
            "-segment_time",
            str(chunk_duration),
            "-reset_timestamps",
            "1",
            output_pattern,
        ]
    else:
        output_pattern = str(out_dir / "chunk_000.wav")
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            src,
            "-ac",
            "1",
            "-ar",
            "16000",
            "-vn",
            output_pattern,
        ]

    logger.info(
        "Splitting video %s into %s (chunk_duration=%s, enable_chunking=%s)",
        src,
        out_dir,
        chunk_duration,
        enable_chunking,
    )
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except FileNotFoundError as exc:
        raise RuntimeError("ffmpeg not found in PATH") from exc
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.decode("utf-8", errors="ignore")
        cmd_str = " ".join(cmd)
        raise RuntimeError(f"ffmpeg failed ({cmd_str}): {stderr}") from exc

    chunks = sorted(out_dir.glob("chunk_*.wav"))
    logger.info("Split completed: %s chunks created", len(chunks))
    return chunks
