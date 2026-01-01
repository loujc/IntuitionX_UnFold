from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.config import AppConfig, get_config
from app.core.logging import setup_logging
from app.core.job_manager import JobManager
from app.api.tasks import router as tasks_router
from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.workers.stage_handlers import build_stage_handlers


def create_app(config: AppConfig | None = None, start_job_manager: bool = True) -> FastAPI:
    setup_logging()
    cfg = config or get_config()
    job_manager = JobManager(
        session_factory=SessionLocal,
        stage_handlers=build_stage_handlers(cfg, SessionLocal),
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        init_db(cfg)
        if start_job_manager:
            job_manager.start()
        yield
        if start_job_manager:
            await job_manager.stop()

    app = FastAPI(title="IntuitionX API", lifespan=lifespan)
    app.state.config = cfg
    app.state.job_manager = job_manager
    app.include_router(tasks_router)

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
