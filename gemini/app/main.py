from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.config import AppConfig, get_config
from app.core.logging import setup_logging
from app.db.init_db import init_db


def create_app(config: AppConfig | None = None) -> FastAPI:
    setup_logging()
    cfg = config or get_config()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        init_db(cfg)
        yield

    app = FastAPI(title="IntuitionX API", lifespan=lifespan)
    app.state.config = cfg

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
