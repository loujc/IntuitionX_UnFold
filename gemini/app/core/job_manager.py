from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Dict, Iterable

from sqlalchemy.orm import Session

from app.db.repository import save_task_log, save_task_timing, update_task_status

logger = logging.getLogger(__name__)

STATUS_QUEUED = "queued"
STATUS_RUNNING = "running"
STATUS_FINISHED = "finished"
STATUS_FAILED = "failed"

STAGES: list[str] = [
    "slicing",
    "asr",
    "merge",
    "llm_summary",
    "llm_keywords",
    "finalize",
]

StageHandler = Callable[[str, "JobManager"], Awaitable[None] | None]
SessionFactory = Callable[[], Session]


@dataclass
class TaskState:
    task_id: str
    status: str = STATUS_QUEUED
    stage: str = ""
    progress: float = 0.0
    error: str | None = None


class JobManager:
    def __init__(
        self,
        session_factory: SessionFactory,
        stage_handlers: Dict[str, StageHandler] | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._stage_handlers = stage_handlers or {}
        self.tasks: Dict[str, TaskState] = {}
        self.job_queue: asyncio.Queue[str] = asyncio.Queue()
        self.event_queues: Dict[str, list[asyncio.Queue[dict]]] = {}
        self._stop_event = asyncio.Event()
        self._worker_task: asyncio.Task | None = None

    def register_listener(self, task_id: str) -> asyncio.Queue[dict]:
        """Register a new event listener for a task with size limit to prevent memory leaks."""
        queue: asyncio.Queue[dict] = asyncio.Queue(maxsize=100)
        self.event_queues.setdefault(task_id, []).append(queue)
        return queue

    def remove_listener(self, task_id: str, queue: asyncio.Queue[dict]) -> None:
        queues = self.event_queues.get(task_id, [])
        if queue in queues:
            queues.remove(queue)
        if not queues:
            self.event_queues.pop(task_id, None)

    def publish_event(self, task_id: str, event_type: str, payload: dict) -> None:
        message = {"event": event_type, "data": payload}
        for queue in self.event_queues.get(task_id, []):
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                continue

    def enqueue(self, task_id: str) -> None:
        state = self.tasks.get(task_id) or TaskState(task_id=task_id, stage=STAGES[0])
        state.status = STATUS_QUEUED
        state.stage = STAGES[0]
        state.progress = 0.0
        self.tasks[task_id] = state
        self.job_queue.put_nowait(task_id)
        self._update_db_status(task_id, status=STATUS_QUEUED, stage=STAGES[0])
        self.publish_event(
            task_id, "task_status", {"task_id": task_id, "status": state.status, "stage": state.stage}
        )

    def start(self) -> None:
        if self._worker_task is None:
            self._stop_event.clear()
            self._worker_task = asyncio.create_task(self.worker_loop())

    async def stop(self) -> None:
        self._stop_event.set()
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
            self._worker_task = None

    async def worker_loop(self) -> None:
        """Main worker loop that processes tasks from the queue."""
        while not self._stop_event.is_set():
            try:
                # Use timeout to allow periodic checking of stop event
                task_id = await asyncio.wait_for(self.job_queue.get(), timeout=1.0)
            except asyncio.TimeoutError:
                continue  # No task available, check stop event again
            try:
                await self.process_task(task_id)
            finally:
                self.job_queue.task_done()

    async def run_once(self) -> None:
        task_id = await self.job_queue.get()
        try:
            await self.process_task(task_id)
        finally:
            self.job_queue.task_done()

    async def process_task(self, task_id: str) -> None:
        state = self.tasks.get(task_id) or TaskState(task_id=task_id)
        state.status = STATUS_RUNNING
        self.tasks[task_id] = state
        self._update_db_status(task_id, status=STATUS_RUNNING, stage=state.stage or STAGES[0])
        self.publish_event(
            task_id, "task_status", {"task_id": task_id, "status": state.status, "stage": state.stage}
        )

        total_stages = len(STAGES)
        for idx, stage in enumerate(STAGES):
            state.stage = stage
            # Progress calculation: current stage is half-done
            state.progress = (idx + 0.5) / total_stages
            self._update_db_status(task_id, status=STATUS_RUNNING, stage=stage)
            self.publish_event(
                task_id,
                "task_progress",
                {"task_id": task_id, "status": state.status, "stage": stage, "progress": state.progress},
            )
            start_ts = time.perf_counter()
            try:
                await self._run_stage(stage, task_id)
            except Exception as exc:
                elapsed_ms = int((time.perf_counter() - start_ts) * 1000)
                self._record_timing(task_id, stage, elapsed_ms)
                self._mark_failed(task_id, stage, exc)
                return
            elapsed_ms = int((time.perf_counter() - start_ts) * 1000)
            self._record_timing(task_id, stage, elapsed_ms)

        state.status = STATUS_FINISHED
        state.progress = 1.0
        self._update_db_status(task_id, status=STATUS_FINISHED, stage=STAGES[-1])
        self.publish_event(
            task_id, "task_result", {"task_id": task_id, "status": state.status, "stage": state.stage}
        )

    async def _run_stage(self, stage: str, task_id: str) -> None:
        handler = self._stage_handlers.get(stage)
        if handler is None:
            raise RuntimeError(f"No handler registered for stage: {stage}")
        result = handler(task_id, self)
        if asyncio.iscoroutine(result):
            await result

    def _update_db_status(self, task_id: str, status: str, stage: str | None = None) -> None:
        try:
            with self._session_factory() as db:
                update_task_status(db, task_id, status=status, stage=stage)
        except Exception as e:
            logger.error(f"Failed to update task {task_id} status to {status}: {e}")

    def _record_timing(self, task_id: str, stage: str, elapsed_ms: int) -> None:
        try:
            with self._session_factory() as db:
                save_task_timing(db, task_id, stage, elapsed_ms)
        except Exception as e:
            logger.error(f"Failed to record timing for task {task_id} stage {stage}: {e}")

    def _mark_failed(self, task_id: str, stage: str, exc: Exception) -> None:
        state = self.tasks.get(task_id)
        if state:
            state.status = STATUS_FAILED
            state.error = str(exc)
        try:
            with self._session_factory() as db:
                update_task_status(db, task_id, status=STATUS_FAILED, stage=stage, error=str(exc))
                save_task_log(db, task_id, "error", f"{stage} failed: {exc}")
        except Exception:
            pass
        self.publish_event(
            task_id,
            "task_status",
            {"task_id": task_id, "status": STATUS_FAILED, "stage": stage, "error": str(exc)},
        )

    def set_stage_handlers(self, stage_handlers: Dict[str, StageHandler]) -> None:
        self._stage_handlers = stage_handlers

    def list_stages(self) -> Iterable[str]:
        return list(STAGES)
