from __future__ import annotations

import contextvars
import logging
import os

_RUN_ID = contextvars.ContextVar("run_id", default="-")
_TASK_ID = contextvars.ContextVar("task_id", default="-")
_LOG_FORMAT = (
    "%(asctime)s %(levelname)s [run_id=%(run_id)s task_id=%(task_id)s] "
    "%(name)s: %(message)s"
)


class ContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.run_id = _RUN_ID.get()
        record.task_id = _TASK_ID.get()
        return True


def setup_logging(level: str | None = None) -> None:
    log_level = (level or os.getenv("LOG_LEVEL", "INFO")).upper()
    logging.basicConfig(level=log_level, format=_LOG_FORMAT)
    root = logging.getLogger()
    for handler in root.handlers:
        handler.addFilter(ContextFilter())


def bind_run_id(run_id: str) -> None:
    _RUN_ID.set(run_id)


def bind_task_id(task_id: str) -> None:
    _TASK_ID.set(task_id)


def clear_context() -> None:
    _RUN_ID.set("-")
    _TASK_ID.set("-")

