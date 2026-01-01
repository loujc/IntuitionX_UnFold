from __future__ import annotations

from app.core.config import AppConfig
from app.prompts.llm_prompts import build_keyword_prompt
from app.services.llm_client import call_llm_json
from app.services.llm_pipeline import normalize_keywords


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
