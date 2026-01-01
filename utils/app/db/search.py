from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import or_, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.db.models import Keyword, Segment

# Cache for FTS5 availability check per database URL
_FTS5_CACHE: dict[str, bool] = {}


def _is_sqlite(engine: Engine) -> bool:
    return engine.dialect.name == "sqlite"


def is_fts5_available(engine: Engine) -> bool:
    """Check if SQLite FTS5 is available. Result is cached per database URL."""
    cache_key = str(engine.url)
    if cache_key in _FTS5_CACHE:
        return _FTS5_CACHE[cache_key]

    result = False
    if not _is_sqlite(engine):
        _FTS5_CACHE[cache_key] = result
        return result

    try:
        with engine.connect() as conn:
            enabled = conn.execute(
                text("SELECT sqlite_compileoption_used('ENABLE_FTS5')")
            ).scalar()
        if enabled == 1:
            result = True
            _FTS5_CACHE[cache_key] = result
            return result
    except Exception:
        pass

    try:
        with engine.connect() as conn:
            rows = conn.execute(text("PRAGMA compile_options")).fetchall()
        if any("FTS5" in row[0] for row in rows):
            result = True
            _FTS5_CACHE[cache_key] = result
            return result
    except Exception:
        pass

    try:
        with engine.begin() as conn:
            conn.execute(
                text("CREATE VIRTUAL TABLE IF NOT EXISTS __fts5_test USING fts5(content)")
            )
            conn.execute(text("DROP TABLE IF EXISTS __fts5_test"))
        result = True
    except Exception:
        result = False

    _FTS5_CACHE[cache_key] = result
    return result


def ensure_fts_tables(engine: Engine) -> bool:
    if not is_fts5_available(engine):
        return False
    with engine.begin() as conn:
        conn.execute(
            text(
                "CREATE VIRTUAL TABLE IF NOT EXISTS transcript_fts "
                "USING fts5(task_id, segment_id, text)"
            )
        )
        conn.execute(
            text(
                "CREATE VIRTUAL TABLE IF NOT EXISTS keyword_fts "
                "USING fts5(task_id, keyword_id, term, definition)"
            )
        )
    return True


def _segment_rows(task_id: str, segments: Sequence[dict | Segment]) -> list[dict]:
    rows = []
    for segment in segments:
        if isinstance(segment, Segment):
            segment_id = segment.segment_id
            text_value = segment.text or ""
        else:
            segment_id = str(segment.get("segment_id", ""))
            text_value = str(segment.get("text", "") or "")
        rows.append({"task_id": task_id, "segment_id": segment_id, "text": text_value})
    return rows


def _keyword_rows(task_id: str, keywords: Sequence[dict | Keyword]) -> list[dict]:
    rows = []
    for keyword in keywords:
        if isinstance(keyword, Keyword):
            keyword_id = keyword.id
            term = keyword.term
            definition = keyword.definition
        else:
            keyword_id = keyword.get("keyword_id") or keyword.get("id")
            if keyword_id is None:
                continue  # Skip keywords without valid ID
            term = str(keyword.get("term", ""))
            definition = str(keyword.get("definition", "") or "")
        rows.append(
            {
                "task_id": task_id,
                "keyword_id": keyword_id,
                "term": term,
                "definition": definition,
            }
        )
    return rows


def index_segments(db: Session, task_id: str, segments: Sequence[dict | Segment]) -> bool:
    """
    Index transcript segments for full-text search.

    Note: This function does NOT commit the transaction. Caller is responsible for calling db.commit().
    """
    engine = db.get_bind()
    if engine is None or not ensure_fts_tables(engine):
        return False
    db.execute(text("DELETE FROM transcript_fts WHERE task_id = :task_id"), {"task_id": task_id})
    rows = _segment_rows(task_id, segments)
    if rows:
        db.execute(
            text(
                "INSERT INTO transcript_fts (task_id, segment_id, text) "
                "VALUES (:task_id, :segment_id, :text)"
            ),
            rows,
        )
    return True


def index_keywords(db: Session, task_id: str, keywords: Sequence[dict | Keyword]) -> bool:
    """
    Index keywords for full-text search.

    Note: This function does NOT commit the transaction. Caller is responsible for calling db.commit().
    """
    engine = db.get_bind()
    if engine is None or not ensure_fts_tables(engine):
        return False
    db.execute(text("DELETE FROM keyword_fts WHERE task_id = :task_id"), {"task_id": task_id})
    rows = _keyword_rows(task_id, keywords)
    if rows:
        db.execute(
            text(
                "INSERT INTO keyword_fts (task_id, keyword_id, term, definition) "
                "VALUES (:task_id, :keyword_id, :term, :definition)"
            ),
            rows,
        )
    return True


def _search_segments_like(db: Session, task_id: str, query: str, limit: int) -> list[Segment]:
    pattern = f"%{query}%"
    return list(
        db.execute(
            select(Segment)
            .where(Segment.task_id == task_id, Segment.text.ilike(pattern))
            .limit(limit)
        ).scalars()
    )


def _search_keywords_like(db: Session, task_id: str, query: str, limit: int) -> list[Keyword]:
    pattern = f"%{query}%"
    return list(
        db.execute(
            select(Keyword)
            .where(
                Keyword.task_id == task_id,
                or_(Keyword.term.ilike(pattern), Keyword.definition.ilike(pattern)),
            )
            .limit(limit)
        ).scalars()
    )


def _search_segments_fts(db: Session, task_id: str, query: str, limit: int) -> list[Segment]:
    sql = text(
        "SELECT s.* FROM segments s "
        "JOIN transcript_fts f ON s.task_id = f.task_id AND s.segment_id = f.segment_id "
        "WHERE f.task_id = :task_id AND transcript_fts MATCH :query "
        "LIMIT :limit"
    )
    return list(
        db.execute(
            select(Segment).from_statement(sql),
            {"task_id": task_id, "query": query, "limit": limit},
        ).scalars()
    )


def _search_keywords_fts(db: Session, task_id: str, query: str, limit: int) -> list[Keyword]:
    sql = text(
        "SELECT k.* FROM keywords k "
        "JOIN keyword_fts f ON k.task_id = f.task_id AND k.id = f.keyword_id "
        "WHERE f.task_id = :task_id AND keyword_fts MATCH :query "
        "LIMIT :limit"
    )
    return list(
        db.execute(
            select(Keyword).from_statement(sql),
            {"task_id": task_id, "query": query, "limit": limit},
        ).scalars()
    )


def search_segments(db: Session, task_id: str, query: str, limit: int = 20) -> list[Segment]:
    if not query:
        return []
    engine = db.get_bind()
    if engine is not None and ensure_fts_tables(engine):
        return _search_segments_fts(db, task_id, query, limit)
    return _search_segments_like(db, task_id, query, limit)


def search_keywords(db: Session, task_id: str, query: str, limit: int = 20) -> list[Keyword]:
    if not query:
        return []
    engine = db.get_bind()
    if engine is not None and ensure_fts_tables(engine):
        return _search_keywords_fts(db, task_id, query, limit)
    return _search_keywords_like(db, task_id, query, limit)
