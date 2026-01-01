from __future__ import annotations

from app.core.config import AppConfig
from app.prompts.llm_prompts import build_keyword_prompt
from app.services.llm_client import call_llm_json
from app.services.llm_pipeline import (
    normalize_chapter_ranges,
    normalize_keywords,
    normalize_quotes,
)


class _DummyResponse:
    def __init__(self, content: str) -> None:
        self.choices = [type("Choice", (), {"message": type("Msg", (), {"content": content})()})()]


class _DummyClient:
    def __init__(self, content: str) -> None:
        self._content = content

        class _Chat:
            def __init__(self, outer: _DummyClient) -> None:
                self._outer = outer

                class _Completions:
                    def __init__(self, outer_client: _DummyClient) -> None:
                        self._outer_client = outer_client

                    def create(self, **_: object) -> _DummyResponse:
                        return _DummyResponse(self._outer_client._content)

                self.completions = _Completions(outer)

        self.chat = _Chat(self)


def test_call_llm_json_parses_response() -> None:
    config = AppConfig()
    dummy = _DummyClient('{"label":"History","confidence":0.82}')
    data = call_llm_json(config, [{"role": "user", "content": "x"}], client=dummy)
    assert data["label"] == "History"
    assert data["confidence"] == 0.82


def test_keyword_prompt_mode_affects_content() -> None:
    chapters = [{"chapter_id": 0, "text": "Hello world"}]
    simple_messages = build_keyword_prompt(["History"], "simple", "simple", chapters)
    deep_messages = build_keyword_prompt(["History"], "deep", "simple", chapters)
    simple_text = simple_messages[-1]["content"]
    deep_text = deep_messages[-1]["content"]
    # 检查中文模式标识
    assert "当前模式：simple" in simple_text
    assert "当前模式：deep" in deep_text
    # 检查模式特定规则
    assert "简洁模式" in simple_text
    assert "专业模式" in deep_text


def test_normalize_keywords_maps_index_to_segment_id() -> None:
    raw = {
        "items": [
            {
                "term": "Saber",
                "definition": "A sword",
                "mentions": [{"index": 1}],
                "links": [],
            }
        ]
    }
    segments = [
        {"segment_id": "seg_000000", "index": 0, "text": "hello"},
        {"segment_id": "seg_000001", "index": 1, "text": "world"},
    ]
    normalized = normalize_keywords(raw, segments)
    assert normalized[0]["mentions"] == [{"segment_id": "seg_000001"}]


def test_normalize_quotes_spans_segments() -> None:
    raw = {"quotes": [{"segment_id": "seg_000000", "text": "hello world"}]}
    segments = [
        {"segment_id": "seg_000000", "index": 0, "start": 0.0, "end": 1.0, "text": "hello "},
        {"segment_id": "seg_000001", "index": 1, "start": 1.0, "end": 2.0, "text": "world"},
    ]
    normalized = normalize_quotes(raw, segments)
    assert normalized[0]["segment_id"] == "seg_000000"
    assert normalized[0]["text"] == "hello world"
    assert normalized[0]["start"] == 0.0
    assert normalized[0]["end"] == 2.0


def test_normalize_chapter_ranges_validates_coverage() -> None:
    """Test that normalize_chapter_ranges validates and auto-extends boundaries."""
    segments = [
        {"segment_id": "seg_000000", "index": 0, "text": "a"},
        {"segment_id": "seg_000001", "index": 1, "text": "b"},
        {"segment_id": "seg_000002", "index": 2, "text": "c"},
    ]

    # Valid: full coverage
    raw_valid = {
        "chapters": [
            {"chapter_id": 0, "start_segment_id": "seg_000000", "end_segment_id": "seg_000001"},
            {"chapter_id": 1, "start_segment_id": "seg_000002", "end_segment_id": "seg_000002"},
        ]
    }
    result = normalize_chapter_ranges(raw_valid, segments)
    assert len(result) == 2
    assert result[0]["chapter_id"] == 0
    assert result[0]["start_index"] == 0
    assert result[0]["end_index"] == 1
    assert result[1]["chapter_id"] == 1
    assert result[1]["start_index"] == 2
    assert result[1]["end_index"] == 2

    # Auto-extend: missing first segment (LLM off-by-one error)
    raw_extend_start = {
        "chapters": [
            {"chapter_id": 0, "start_segment_id": "seg_000001", "end_segment_id": "seg_000002"},
        ]
    }
    result_extend = normalize_chapter_ranges(raw_extend_start, segments)
    assert len(result_extend) == 1
    assert result_extend[0]["start_index"] == 0  # Auto-extended from 1 to 0
    assert result_extend[0]["end_index"] == 2

    # Auto-extend: missing last segment
    raw_extend_end = {
        "chapters": [
            {"chapter_id": 0, "start_segment_id": "seg_000000", "end_segment_id": "seg_000001"},
        ]
    }
    result_extend_end = normalize_chapter_ranges(raw_extend_end, segments)
    assert len(result_extend_end) == 1
    assert result_extend_end[0]["start_index"] == 0
    assert result_extend_end[0]["end_index"] == 2  # Auto-extended from 1 to 2

    # Invalid: overlapping chapters
    raw_overlap = {
        "chapters": [
            {"chapter_id": 0, "start_segment_id": "seg_000000", "end_segment_id": "seg_000001"},
            {"chapter_id": 1, "start_segment_id": "seg_000001", "end_segment_id": "seg_000002"},
        ]
    }
    result_overlap = normalize_chapter_ranges(raw_overlap, segments)
    assert result_overlap == []  # Should reject

    # Invalid: gap between chapters
    raw_gap = {
        "chapters": [
            {"chapter_id": 0, "start_segment_id": "seg_000000", "end_segment_id": "seg_000000"},
            {"chapter_id": 1, "start_segment_id": "seg_000002", "end_segment_id": "seg_000002"},
        ]
    }
    result_gap = normalize_chapter_ranges(raw_gap, segments)
    assert result_gap == []  # Should reject

