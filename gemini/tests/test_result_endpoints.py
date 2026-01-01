from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import load_config
from app.db.models import Task
from app.db.repository import (
    bulk_insert_keywords,
    bulk_insert_links,
    bulk_insert_mentions,
    bulk_insert_segments,
    get_keyword_links,
    get_keyword_mentions,
    get_keywords_by_task,
    get_segments_by_task,
    get_task,
    get_task_raw,
    save_task_timing,
    upsert_task_raw,
    upsert_task_result,
)
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.main import create_app
from app.services.result_builder import build_task_result


def test_result_endpoints_exclude_raw_and_timing(tmp_path: Path) -> None:
    db_path = tmp_path / "result_endpoints.db"
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
    app = create_app(config=config, start_job_manager=False)

    with SessionLocal() as db:
        task = Task(
            status="finished",
            stage="finalize",
            mode="simple",
            video_type="History",
            input_meta={"srt_path": "temp/sample.srt", "vtt_path": "temp/sample.vtt"},
        )
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

    keyword_rows = [{"term": "Saber", "definition": "A sword"}]
    with SessionLocal() as db:
        keywords = bulk_insert_keywords(db, task_id, keyword_rows)
    keyword = keywords[0]

    with SessionLocal() as db:
        bulk_insert_mentions(
            db,
            task_id,
            [{"keyword_id": keyword.id, "segment_id": "seg_000001"}],
        )
        bulk_insert_links(
            db,
            [
                {
                    "keyword_id": keyword.id,
                    "title": "Saber",
                    "url": "https://example.com",
                    "source": "llm",
                }
            ],
        )

    with SessionLocal() as db:
        upsert_task_raw(
            db,
            task_id,
            {
                "video_type": {"label": "History", "confidence": 0.9},
                "summary": {
                    "overall": "summary",
                    "by_slice": [{"slice_id": 0, "start": 0, "end": 300, "summary": "ok"}],
                },
            },
        )
        save_task_timing(db, task_id, "merge", 1200)

    with SessionLocal() as db:
        task = get_task(db, task_id)
        segments = get_segments_by_task(db, task_id)
        keywords = get_keywords_by_task(db, task_id)
        raw = get_task_raw(db, task_id)
        mentions_by_keyword = {keyword.id: get_keyword_mentions(db, keyword.id)}
        links_by_keyword = {keyword.id: get_keyword_links(db, keyword.id)}
        result_payload = build_task_result(
            task=task,
            segments=segments,
            keywords=keywords,
            mentions_by_keyword=mentions_by_keyword,
            links_by_keyword=links_by_keyword,
            input_meta=task.input_meta,
            raw=raw.raw_json if raw else None,
            status="finished",
        )

    with SessionLocal() as db:
        upsert_task_result(db, task_id, result_payload)

    with TestClient(app) as client:
        response = client.get(f"/api/v1/tasks/{task_id}/result")
        assert response.status_code == 200
        payload = response.json()
        assert "raw" not in payload
        assert "timing" not in payload
        assert payload["transcript"]["srt_path"] == "temp/sample.srt"
        assert payload["keywords"]["items"][0]["keyword_id"] == keyword.id

        raw_response = client.get(f"/api/v1/tasks/{task_id}/raw")
        assert raw_response.status_code == 200
        raw_payload = raw_response.json()
        assert "summary" in raw_payload

        timing_response = client.get(f"/api/v1/tasks/{task_id}/timing")
        assert timing_response.status_code == 200
        timing_payload = timing_response.json()
        assert timing_payload["items"][0]["stage"] == "merge"
