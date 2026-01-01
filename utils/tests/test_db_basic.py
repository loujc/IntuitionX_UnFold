from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.db.models import Keyword, KeywordLink, KeywordMention, Segment, Task
from app.db.session import Base


def test_db_basic(tmp_path: Path) -> None:
    db_path = tmp_path / "basic.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    with SessionLocal() as session:
        task = Task(status="queued", stage="slicing", mode="simple")
        session.add(task)
        session.commit()
        session.refresh(task)

        loaded = session.get(Task, task.id)
        assert loaded is not None
        assert loaded.status == "queued"

        loaded.status = "running"
        session.commit()
        session.refresh(loaded)
        assert loaded.status == "running"

        segment = Segment(
            task_id=task.id,
            segment_id="seg_0",
            index=0,
            start=0.0,
            end=1.2,
            text="hello",
        )
        keyword = Keyword(task_id=task.id, term="Saber", definition="test")
        session.add_all([segment, keyword])
        session.commit()
        session.refresh(keyword)

        mention = KeywordMention(
            task_id=task.id, keyword_id=keyword.id, segment_id="seg_0"
        )
        link = KeywordLink(
            keyword_id=keyword.id,
            title="Doc",
            url="https://example.com",
            source="llm",
        )
        session.add_all([mention, link])
        session.commit()

        found_segment = session.execute(
            select(Segment).where(
                Segment.task_id == task.id, Segment.segment_id == "seg_0"
            )
        ).scalar_one()
        assert found_segment.text == "hello"

        found_keyword = session.execute(
            select(Keyword).where(Keyword.task_id == task.id, Keyword.term == "Saber")
        ).scalar_one()
        assert found_keyword.definition == "test"

        # Test lookup by index
        segment_by_index = session.execute(
            select(Segment).where(Segment.task_id == task.id, Segment.index == 0)
        ).scalar_one()
        assert segment_by_index.segment_id == "seg_0"

        # Test KeywordMention -> Segment jump
        mentions = session.execute(
            select(KeywordMention).where(KeywordMention.segment_id == "seg_0")
        ).scalars().all()
        assert len(mentions) == 1
        assert mentions[0].keyword_id == keyword.id
