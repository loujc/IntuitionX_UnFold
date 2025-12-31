from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.db.models import Task, TaskRaw, TaskResult
from app.db.session import Base


def test_db_result_split(tmp_path: Path) -> None:
    db_path = tmp_path / "result_split.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        task = Task(status="running", stage="merge")
        session.add(task)
        session.commit()
        session.refresh(task)

        result = TaskResult(task_id=task.id, result_json={"summary": "ok"})
        raw = TaskRaw(task_id=task.id, raw_json={"raw": {"key": "value"}})
        session.add_all([result, raw])
        session.commit()

        stored_result = session.execute(
            select(TaskResult).where(TaskResult.task_id == task.id)
        ).scalar_one()
        stored_raw = session.execute(
            select(TaskRaw).where(TaskRaw.task_id == task.id)
        ).scalar_one()

        assert stored_result.result_json["summary"] == "ok"
        assert stored_raw.raw_json["raw"]["key"] == "value"
