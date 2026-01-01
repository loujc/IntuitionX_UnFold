from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import load_config
from app.main import create_app


def test_app_smoke(tmp_path: Path) -> None:
    config_path = tmp_path / "config.yaml"
    config_path.write_text("db:\n  url: \"sqlite:///:memory:\"\n")
    config = load_config(config_path=config_path, env_path=tmp_path / ".env")
    client = TestClient(create_app(config=config))
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
