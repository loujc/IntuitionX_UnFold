from __future__ import annotations

import json
import os
from typing import Any

from openai import OpenAI

from app.core.config import AppConfig


_CLIENT: OpenAI | None = None


def get_llm_client(config: AppConfig) -> OpenAI:
    global _CLIENT
    if _CLIENT is None:
        api_key = config.llm.api_key or os.getenv("LLM_API_KEY", "")
        _CLIENT = OpenAI(base_url=config.llm.base_url, api_key=api_key)
    return _CLIENT


def reset_llm_client() -> None:
    """Reset the global client. For testing only."""
    global _CLIENT
    _CLIENT = None


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    if not cleaned:
        return {}
    try:
        result = json.loads(cleaned)
        if isinstance(result, list):
            return {"items": result}
        return result
    except json.JSONDecodeError:
        # Try to find {} or [] in the response
        for start_char, end_char in [("{", "}"), ("[", "]")]:
            start = cleaned.find(start_char)
            end = cleaned.rfind(end_char)
            if start != -1 and end != -1 and end > start:
                try:
                    result = json.loads(cleaned[start : end + 1])
                    if isinstance(result, list):
                        return {"items": result}
                    return result
                except json.JSONDecodeError:
                    continue
        raise ValueError(f"Could not extract valid JSON from: {cleaned[:100]}")


def call_llm_json(
    config: AppConfig,
    messages: list[dict],
    temperature: float = 0.3,
    client: OpenAI | None = None,
) -> dict[str, Any]:
    llm_client = client or get_llm_client(config)
    response = llm_client.chat.completions.create(
        model=config.llm.model_name,
        messages=messages,
        temperature=temperature,
    )
    content = response.choices[0].message.content or ""
    return _extract_json(content)
