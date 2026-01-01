from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import pytest

from app.services.video_splitter import split_video


def test_split_video(tmp_path: Path) -> None:
    if shutil.which("ffmpeg") is None:
        pytest.skip("ffmpeg not available")

    source_path = tmp_path / "input.mp4"
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=1000:duration=2",
        "-f",
        "lavfi",
        "-i",
        "color=c=black:s=320x240:d=2",
        "-shortest",
        str(source_path),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    output_dir = tmp_path / "chunks"
    chunks = split_video(source_path, output_dir, chunk_duration=1, enable_chunking=True)

    assert len(chunks) >= 2
    assert all(chunk.exists() for chunk in chunks)
