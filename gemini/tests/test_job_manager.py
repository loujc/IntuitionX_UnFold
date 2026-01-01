from __future__ import annotations

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.core.job_manager import JobManager, STATUS_FAILED, STATUS_FINISHED, STAGES
from app.db.models import Task, TaskLog
from app.db.session import Base


@pytest.mark.anyio(backends=["asyncio"])
async def test_job_manager_success(tmp_path) -> None:
    db_path = tmp_path / "job_manager_success.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        task = Task(status="queued", stage="")
        session.add(task)
        session.commit()
        session.refresh(task)
        task_id = task.id

    calls: list[str] = []

    def make_handler(stage: str):
        async def _handler(_: str, __: JobManager) -> None:
            calls.append(stage)

        return _handler

    stage_handlers = {stage: make_handler(stage) for stage in STAGES}
    manager = JobManager(session_factory=SessionLocal, stage_handlers=stage_handlers)

    manager.enqueue(task_id)
    await manager.run_once()

    assert calls == STAGES
    with SessionLocal() as session:
        db_task = session.get(Task, task_id)
        assert db_task is not None
        assert db_task.status == STATUS_FINISHED


@pytest.mark.anyio(backends=["asyncio"])
async def test_job_manager_failure(tmp_path) -> None:
    db_path = tmp_path / "job_manager_failure.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        task = Task(status="queued", stage="")
        session.add(task)
        session.commit()
        session.refresh(task)
        task_id = task.id

    async def ok_handler(_: str, __: JobManager) -> None:
        return None

    async def fail_handler(_: str, __: JobManager) -> None:
        raise RuntimeError("boom")

    stage_handlers = {
        STAGES[0]: ok_handler,
        STAGES[1]: fail_handler,
    }
    manager = JobManager(session_factory=SessionLocal, stage_handlers=stage_handlers)

    manager.enqueue(task_id)
    await manager.run_once()

    with SessionLocal() as session:
        db_task = session.get(Task, task_id)
        assert db_task is not None
        assert db_task.status == STATUS_FAILED
        logs = session.execute(select(TaskLog).where(TaskLog.task_id == task_id)).scalars().all()
        assert any("failed" in log.message for log in logs)
