from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Task
from app.db.session import Base
from app.services.llm_retry import call_llm_with_retry


def test_llm_retry_increments(tmp_path: Path) -> None:
    db_path = tmp_path / "llm_retry.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        task = Task(status="running", stage="llm_summary")
        session.add(task)
        session.commit()
        session.refresh(task)
        task_id = task.id

    attempts = {"count": 0}

    def flaky() -> str:
        if attempts["count"] < 2:
            attempts["count"] += 1
            raise RuntimeError("transient error")
        return "ok"

    result = call_llm_with_retry(SessionLocal, task_id, flaky, max_attempts=3)
    assert result == "ok"

    with SessionLocal() as session:
        task = session.get(Task, task_id)
        assert task is not None
        assert task.llm_retry_count == 2
