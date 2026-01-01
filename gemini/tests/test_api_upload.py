from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import load_config
from app.db.models import Task
from app.db.session import SessionLocal
from app.main import create_app


def test_upload_creates_task(tmp_path: Path) -> None:
    db_path = tmp_path / "api_upload.db"
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

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/tasks",
            data={"mode": "simple"},
            files={"file": ("sample.mp4", b"dummy", "video/mp4")},
        )

    assert response.status_code == 200
    payload = response.json()
    task_id = payload["task_id"]
    assert payload["status"] == "queued"

    with SessionLocal() as session:
        task = session.get(Task, task_id)
        assert task is not None
        assert task.status == "queued"
        assert task.input_meta is not None
        assert "path" in task.input_meta
        saved_path = Path(task.input_meta["path"])

    assert saved_path.exists()
    assert saved_path.parent.name == task_id
