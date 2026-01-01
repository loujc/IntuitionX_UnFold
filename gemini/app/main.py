from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.config import AppConfig, get_config
from app.core.logging import setup_logging
from app.core.job_manager import JobManager
from app.db.init_db import init_db
from app.db.session import SessionLocal


def create_app(config: AppConfig | None = None) -> FastAPI:
    setup_logging()
    cfg = config or get_config()
    job_manager = JobManager(session_factory=SessionLocal)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        init_db(cfg)
        job_manager.start()
        yield
        await job_manager.stop()

    app = FastAPI(title="IntuitionX API", lifespan=lifespan)
    app.state.config = cfg
    app.state.job_manager = job_manager

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
