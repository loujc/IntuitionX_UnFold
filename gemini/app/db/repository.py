from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import (
    Keyword,
    KeywordLink,
    KeywordMention,
    Segment,
    Task,
    TaskLog,
    TaskRaw,
    TaskResult,
    TaskTiming,
)


def create_task(db: Session, **fields) -> Task:
    task = Task(**fields)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task_status(
    db: Session, task_id: str, status: str, stage: str | None = None, error: str | None = None
) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise ValueError(f"Task {task_id} not found")
    task.status = status
    if stage is not None:
        task.stage = stage
    if error is not None:
        task.error = error
    db.commit()
    db.refresh(task)
    return task


def save_task_result(db: Session, task_id: str, result_json: dict) -> TaskResult:
    result = TaskResult(task_id=task_id, result_json=result_json)
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def save_task_raw(db: Session, task_id: str, raw_json: dict) -> TaskRaw:
    raw = TaskRaw(task_id=task_id, raw_json=raw_json)
    db.add(raw)
    db.commit()
    db.refresh(raw)
    return raw


def save_task_timing(db: Session, task_id: str, stage: str, elapsed_ms: int) -> TaskTiming:
    timing = TaskTiming(task_id=task_id, stage=stage, elapsed_ms=elapsed_ms)
    db.add(timing)
    db.commit()
    db.refresh(timing)
    return timing


def save_task_log(db: Session, task_id: str, level: str, message: str) -> TaskLog:
    log = TaskLog(task_id=task_id, level=level, message=message)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def increment_task_retry(db: Session, task_id: str, increment: int = 1) -> Task | None:
    task = db.get(Task, task_id)
    if task is None:
        return None
    task.llm_retry_count += increment
    db.commit()
    db.refresh(task)
    return task


def bulk_insert_segments(
    db: Session, task_id: str, segments: Sequence[dict]
) -> list[Segment]:
    items = [Segment(task_id=task_id, **segment) for segment in segments]
    db.add_all(items)
    db.commit()
    return items


def bulk_insert_keywords(
    db: Session, task_id: str, keywords: Sequence[dict]
) -> list[Keyword]:
    items = [Keyword(task_id=task_id, **keyword) for keyword in keywords]
    db.add_all(items)
    db.commit()
    return items


def bulk_insert_mentions(
    db: Session, task_id: str, mentions: Sequence[dict]
) -> list[KeywordMention]:
    items = [KeywordMention(task_id=task_id, **mention) for mention in mentions]
    db.add_all(items)
    db.commit()
    return items


def bulk_insert_links(db: Session, links: Sequence[dict]) -> list[KeywordLink]:
    items = [KeywordLink(**link) for link in links]
    db.add_all(items)
    db.commit()
    return items


def get_task(db: Session, task_id: str) -> Task | None:
    return db.get(Task, task_id)


def get_task_result(db: Session, task_id: str) -> TaskResult | None:
    return db.execute(select(TaskResult).where(TaskResult.task_id == task_id)).scalar_one_or_none()


def get_segments_by_task(db: Session, task_id: str) -> list[Segment]:
    return list(db.execute(select(Segment).where(Segment.task_id == task_id)).scalars())


def get_segment_by_id(db: Session, task_id: str, segment_id: str) -> Segment | None:
    return db.execute(
        select(Segment).where(Segment.task_id == task_id, Segment.segment_id == segment_id)
    ).scalar_one_or_none()


def get_keywords_by_task(db: Session, task_id: str) -> list[Keyword]:
    return list(db.execute(select(Keyword).where(Keyword.task_id == task_id)).scalars())


def get_keyword_mentions(db: Session, keyword_id: int) -> list[KeywordMention]:
    return list(
        db.execute(select(KeywordMention).where(KeywordMention.keyword_id == keyword_id)).scalars()
    )


def get_mentions_by_segment(db: Session, task_id: str, segment_id: str) -> list[KeywordMention]:
    return list(
        db.execute(
            select(KeywordMention).where(
                KeywordMention.task_id == task_id, KeywordMention.segment_id == segment_id
            )
        ).scalars()
    )


def get_keyword_links(db: Session, keyword_id: int) -> list[KeywordLink]:
    return list(
        db.execute(select(KeywordLink).where(KeywordLink.keyword_id == keyword_id)).scalars()
    )


def get_task_raw(db: Session, task_id: str) -> TaskRaw | None:
    return db.execute(select(TaskRaw).where(TaskRaw.task_id == task_id)).scalar_one_or_none()


def get_task_timings(db: Session, task_id: str) -> list[TaskTiming]:
    return list(db.execute(select(TaskTiming).where(TaskTiming.task_id == task_id)).scalars())


def get_task_logs(db: Session, task_id: str) -> list[TaskLog]:
    return list(db.execute(select(TaskLog).where(TaskLog.task_id == task_id)).scalars())
