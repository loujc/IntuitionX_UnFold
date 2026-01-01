from __future__ import annotations

import asyncio
from pathlib import Path

import anyio
import pytest

from app.api.tasks import _event_stream
from app.core.config import load_config
from app.main import create_app


@pytest.mark.anyio(backends=["asyncio"])
async def test_sse_event_stream_cleanup(tmp_path: Path) -> None:
    db_path = tmp_path / "sse.db"
    temp_dir = tmp_path / "temp"

    config_path = tmp_path / "config.yaml"
    config_path.write_text(
        "\n".join(
            [
                "db:",
                f'  url: "sqlite:///{db_path}"',
                "storage:",
                f'  temp_dir: "{temp_dir}"',
            ]
        )
        + "\n"
    )

    config = load_config(config_path=config_path, env_path=tmp_path / ".env")
    app = create_app(config=config, start_job_manager=False)
    job_manager = app.state.job_manager
    task_id = "task_sse"

    class _FakeRequest:
        def __init__(self) -> None:
            self._disconnected = asyncio.Event()

        async def is_disconnected(self) -> bool:
            return self._disconnected.is_set()

        def disconnect(self) -> None:
            self._disconnected.set()

    request = _FakeRequest()
    events: list[str] = []

    stream = _event_stream(job_manager, request, task_id, ping_interval=1)
    job_manager.publish_event(task_id, "task_status", {"task_id": task_id})
    job_manager.publish_event(task_id, "task_progress", {"task_id": task_id})
    job_manager.publish_event(task_id, "task_result", {"task_id": task_id})

    with anyio.fail_after(3):
        async for chunk in stream:
            for line in chunk.splitlines():
                if line.startswith("event:"):
                    event_type = line.split(":", 1)[1].strip()
                    if event_type != "ping":
                        events.append(event_type)
            if len(events) == 3:
                request.disconnect()
                break

    await stream.aclose()
    await asyncio.sleep(0)

    assert events == ["task_status", "task_progress", "task_result"]
    assert task_id not in job_manager.event_queues
