from __future__ import annotations

from pathlib import Path

from sqlalchemy.engine import make_url

from app.core.config import AppConfig, get_config
from app.db.session import Base, init_engine
from app.db import models  # noqa: F401
from app.db.search import ensure_fts_tables


def _ensure_sqlite_dir(db_url: str) -> None:
    url = make_url(db_url)
    if not url.drivername.startswith("sqlite"):
        return
    if not url.database or url.database == ":memory:":
        return
    db_path = Path(url.database)
    if not db_path.is_absolute():
        db_path = Path.cwd() / db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)


def init_db(config: AppConfig | None = None) -> None:
    cfg = config or get_config()
    _ensure_sqlite_dir(cfg.db.url)
    engine = init_engine(cfg.db.url)
    Base.metadata.create_all(bind=engine)
    ensure_fts_tables(engine)
