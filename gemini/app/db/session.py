from __future__ import annotations

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_config


class Base(DeclarativeBase):
    pass


_ENGINE: Engine | None = None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False)


def init_engine(db_url: str | None = None) -> Engine:
    global _ENGINE
    url = db_url or get_config().db.url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    _ENGINE = create_engine(url, future=True, connect_args=connect_args)
    SessionLocal.configure(bind=_ENGINE)
    return _ENGINE


def get_engine() -> Engine:
    if _ENGINE is None:
        return init_engine()
    return _ENGINE


def get_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
