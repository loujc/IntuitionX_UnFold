from __future__ import annotations

from fastapi import FastAPI

from app.core.config import get_config
from app.core.logging import setup_logging


def create_app() -> FastAPI:
    setup_logging()
    app = FastAPI(title="IntuitionX API")
    app.state.config = get_config()

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()

