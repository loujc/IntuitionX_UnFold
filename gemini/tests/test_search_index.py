from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Keyword, Segment, Task
from app.db.search import (
    _search_keywords_like,
    _search_segments_like,
    index_keywords,
    index_segments,
    search_keywords,
    search_segments,
)
from app.db.session import Base


def test_search_indexing(tmp_path: Path) -> None:
    db_path = tmp_path / "search.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        task = Task(status="running", stage="merge")
        session.add(task)
        session.commit()
        session.refresh(task)

        segment = Segment(
            task_id=task.id,
            segment_id="seg_0",
            index=0,
            start=0.0,
            end=1.2,
            text="hello world",
        )
        keyword = Keyword(task_id=task.id, term="Saber", definition="legendary sword")
        session.add_all([segment, keyword])
        session.commit()
        session.refresh(keyword)

        index_segments(session, task.id, [{"segment_id": "seg_0", "text": "hello world"}])
        index_keywords(
            session,
            task.id,
            [{"keyword_id": keyword.id, "term": "Saber", "definition": "legendary sword"}],
        )
        session.commit()  # Commit the FTS index changes

        segments = search_segments(session, task.id, "hello")
        assert any(result.segment_id == "seg_0" for result in segments)

        keywords = search_keywords(session, task.id, "Saber")
        assert any(result.term == "Saber" for result in keywords)

        like_segments = _search_segments_like(session, task.id, "world", limit=5)
        assert any(result.segment_id == "seg_0" for result in like_segments)

        like_keywords = _search_keywords_like(session, task.id, "legendary", limit=5)
        assert any(result.term == "Saber" for result in like_keywords)


def test_search_edge_cases(tmp_path: Path) -> None:
    """Test edge cases: empty query, non-existent task, FTS fallback."""
    db_path = tmp_path / "edge.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        task = Task(status="running", stage="merge")
        session.add(task)
        session.commit()
        session.refresh(task)

        segment = Segment(
            task_id=task.id,
            segment_id="seg_0",
            index=0,
            start=0.0,
            end=1.2,
            text="test content",
        )
        session.add(segment)
        session.commit()

        # Test empty query
        results = search_segments(session, task.id, "")
        assert len(results) == 0

        results = search_keywords(session, task.id, "")
        assert len(results) == 0

        # Test non-existent task
        results = search_segments(session, "non-existent-task-id", "test")
        assert len(results) == 0

        # Test keyword with missing ID (should be skipped)
        index_keywords(session, task.id, [{"term": "NoID", "definition": "no id"}])
        session.commit()
        # Should not raise error, just skip the invalid entry
