from __future__ import annotations

from collections.abc import Callable
from typing import TypeVar

from sqlalchemy.orm import Session
from tenacity import RetryCallState, Retrying, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.db.repository import increment_task_retry

T = TypeVar("T")

SessionFactory = Callable[[], Session]


def _on_retry(retry_state: RetryCallState, session_factory: SessionFactory, task_id: str) -> None:
    """Increment retry count using a fresh session to avoid rollback conflicts."""
    with session_factory() as db:
        increment_task_retry(db, task_id)


def call_llm_with_retry(
    session_factory: SessionFactory,
    task_id: str,
    func: Callable[..., T],
    *args: object,
    max_attempts: int = 3,
    **kwargs: object,
) -> T:
    """
    Call a function with retry logic and track retry count in the database.

    Args:
        session_factory: Factory function to create new database sessions
        task_id: Task ID for tracking retries
        func: Function to call
        max_attempts: Maximum number of attempts

    Note: Uses a fresh session for each retry count update to avoid
          interfering with the caller's transaction.
    """
    retrying = Retrying(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(min=1, max=8),
        retry=retry_if_exception_type(Exception),
        reraise=True,
        before_sleep=lambda state: _on_retry(state, session_factory, task_id),
    )
    for attempt in retrying:
        with attempt:
            return func(*args, **kwargs)
    raise RuntimeError("LLM retry unexpectedly exhausted without result")
