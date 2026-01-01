from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import load_config
from app.db.init_db import init_db
from app.db.models import Task
from app.db.repository import bulk_insert_segments
from app.db.session import SessionLocal
from app.main import create_app


def _create_app(tmp_path: Path):
    db_path = tmp_path / "read_endpoints.db"
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
    init_db(config)
    return create_app(config=config, start_job_manager=False)


def test_task_status_and_segments(tmp_path: Path) -> None:
    app = _create_app(tmp_path)

    with SessionLocal() as db:
        task = Task(status="failed", stage="merge", error="boom")
        db.add(task)
        db.commit()
        db.refresh(task)
        task_id = task.id

    segments_payload = [
        {
            "segment_id": "seg_000000",
            "index": 0,
            "start": 0.0,
            "end": 1.0,
            "text": "hello",
        },
        {
            "segment_id": "seg_000001",
            "index": 1,
            "start": 1.0,
            "end": 2.0,
            "text": "world",
        },
    ]
    with SessionLocal() as db:
        bulk_insert_segments(db, task_id, segments_payload)

    with TestClient(app) as client:
        status_resp = client.get(f"/api/v1/tasks/{task_id}")
        assert status_resp.status_code == 200
        status_payload = status_resp.json()
        assert status_payload["status"] == "failed"
        assert status_payload["stage"] == "merge"
        assert status_payload["error"] == "boom"

        segments_resp = client.get(f"/api/v1/tasks/{task_id}/segments")
        assert segments_resp.status_code == 200
        items = segments_resp.json()["items"]
        assert len(items) == 2
        assert items[0]["segment_id"] == "seg_000000"

        segment_resp = client.get(f"/api/v1/tasks/{task_id}/segments/seg_000001")
        assert segment_resp.status_code == 200
        segment_payload = segment_resp.json()
        assert segment_payload["segment_id"] == "seg_000001"
        assert segment_payload["index"] == 1


def test_read_endpoints_errors(tmp_path: Path) -> None:
    app = _create_app(tmp_path)

    with SessionLocal() as db:
        task = Task(status="queued", stage="slicing")
        db.add(task)
        db.commit()
        db.refresh(task)
        task_id = task.id

    with TestClient(app) as client:
        missing_task = "missing-task"
        assert client.get(f"/api/v1/tasks/{missing_task}").status_code == 404
        assert client.get(f"/api/v1/tasks/{missing_task}/segments").status_code == 404
        assert (
            client.get(f"/api/v1/tasks/{missing_task}/segments/seg_000000").status_code
            == 404
        )
        assert client.get(f"/api/v1/tasks/{missing_task}/result").status_code == 404
        assert client.get(f"/api/v1/tasks/{missing_task}/raw").status_code == 404
        assert client.get(f"/api/v1/tasks/{missing_task}/timing").status_code == 404

        assert client.get(f"/api/v1/tasks/{task_id}/result").status_code == 404
        assert client.get(f"/api/v1/tasks/{task_id}/raw").status_code == 404
