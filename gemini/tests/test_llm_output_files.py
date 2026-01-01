from __future__ import annotations

import json
from pathlib import Path

import pytest

import app.workers.stage_handlers as stage_handlers_module
from app.core.config import load_config
from app.db.init_db import init_db
from app.db.models import Task
from app.db.repository import bulk_insert_segments, get_task
from app.db.session import SessionLocal
from app.workers.stage_handlers import build_stage_handlers


@pytest.mark.anyio
async def test_llm_outputs_written_to_temp(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    db_path = tmp_path / "llm_outputs.db"
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
    stage_handlers = build_stage_handlers(config, SessionLocal)

    with SessionLocal() as db:
        task = Task(status="running", stage="llm_summary", mode="simple")
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

    responses: list[dict] = []

    def fake_call_llm_json(*_: object, **__: object) -> dict:
        return responses.pop(0)

    monkeypatch.setattr(stage_handlers_module, "call_llm_json", fake_call_llm_json)

    responses[:] = [{"types": ["History", "Finance"]}]
    await stage_handlers["llm_summary"](task_id, object())

    task_dir = temp_dir / task_id
    video_type_path = task_dir / "llm_video_type.json"
    assert video_type_path.exists()
    assert (task_dir / "llm_video_type.txt").exists()

    video_type_payload = json.loads(video_type_path.read_text())
    assert video_type_payload["raw"]["types"] == ["History", "Finance"]
    assert video_type_payload["normalized"]["types"] == ["History", "Finance"]
    assert video_type_payload["meta"]["source"] == "llm"

    with SessionLocal() as db:
        task = get_task(db, task_id)
        meta = task.input_meta or {}
        assert meta["llm_video_type_path"].endswith("llm_video_type.json")
        assert meta["llm_video_type_txt_path"].endswith("llm_video_type.txt")

    responses[:] = [
        {
            "chapters": [
                {
                    "chapter_id": 0,
                    "start_segment_id": "seg_000000",
                    "end_segment_id": "seg_000001",
                }
            ]
        },
        {"overall": "summary", "chapters": [{"chapter_id": 0, "summary": "ok"}]},
    ]
    await stage_handlers["llm_chapters"](task_id, object())

    chapters_path = task_dir / "llm_chapters.json"
    summary_path = task_dir / "llm_summary.json"
    assert chapters_path.exists()
    assert summary_path.exists()
    assert (task_dir / "llm_chapters.txt").exists()
    assert (task_dir / "llm_summary.txt").exists()

    with SessionLocal() as db:
        task = get_task(db, task_id)
        meta = task.input_meta or {}
        assert meta["llm_chapters_path"].endswith("llm_chapters.json")
        assert meta["llm_summary_path"].endswith("llm_summary.json")
        assert meta["llm_chapters_txt_path"].endswith("llm_chapters.txt")
        assert meta["llm_summary_txt_path"].endswith("llm_summary.txt")

    responses[:] = [
        {
            "quotes": [
                {"segment_id": "seg_000001", "text": "world"}
            ]
        }
    ]
    await stage_handlers["llm_quotes"](task_id, object())

    quotes_path = task_dir / "llm_quotes.json"
    assert quotes_path.exists()
    assert (task_dir / "llm_quotes.txt").exists()
    quotes_payload = json.loads(quotes_path.read_text())
    assert quotes_payload["raw"]["quotes"][0]["segment_id"] == "seg_000001"
    assert quotes_payload["normalized"]["items"][0]["segment_id"] == "seg_000001"

    with SessionLocal() as db:
        task = get_task(db, task_id)
        meta = task.input_meta or {}
        assert meta["llm_quotes_path"].endswith("llm_quotes.json")
        assert meta["llm_quotes_txt_path"].endswith("llm_quotes.txt")

    responses[:] = [
        {
            "items": [
                {
                    "term": "Saber",
                    "definition": "A sword",
                }
            ]
        }
    ]
    await stage_handlers["llm_keywords"](task_id, object())

    keywords_path = task_dir / "llm_keywords.json"
    assert keywords_path.exists()
    keywords_payload = json.loads(keywords_path.read_text())
    assert keywords_payload["raw"]["items"][0]["term"] == "Saber"
    assert keywords_payload["normalized"]["items"][0]["term"] == "Saber"

    with SessionLocal() as db:
        task = get_task(db, task_id)
        meta = task.input_meta or {}
        assert meta["llm_keywords_path"].endswith("llm_keywords.json")
        assert meta["llm_keywords_txt_path"].endswith("llm_keywords.txt")
