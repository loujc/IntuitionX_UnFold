from __future__ import annotations

import json
import os
from typing import Any

from openai import OpenAI

from app.core.config import AppConfig


_CLIENT: OpenAI | None = None
_GEMINI_CLIENT: Any | None = None


def get_llm_client(config: AppConfig) -> OpenAI:
    global _CLIENT
    if _CLIENT is None:
        api_key = config.llm.api_key or os.getenv("LLM_API_KEY", "")
        _CLIENT = OpenAI(base_url=config.llm.base_url, api_key=api_key)
    return _CLIENT


def get_gemini_client(config: AppConfig) -> Any:
    global _GEMINI_CLIENT
    if _GEMINI_CLIENT is None:
        try:
            from google import genai
        except ImportError as exc:
            raise RuntimeError(
                "google-genai is not installed. Run `pip install google-genai`."
            ) from exc
        api_key = (
            config.llm.api_key
            or os.getenv("GEMINI_API_KEY", "")
            or os.getenv("LLM_API_KEY", "")
        )
        if not api_key:
            raise RuntimeError("Missing Gemini API key. Set GEMINI_API_KEY or LLM_API_KEY.")
        _GEMINI_CLIENT = genai.Client(api_key=api_key)
    return _GEMINI_CLIENT


def reset_llm_client() -> None:
    """Reset the global client. For testing only."""
    global _CLIENT, _GEMINI_CLIENT
    _CLIENT = None
    _GEMINI_CLIENT = None


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


def _build_prompt(messages: list[dict]) -> str:
    parts: list[str] = []
    for message in messages:
        content = message.get("content")
        if content:
            parts.append(str(content))
    return "\n\n".join(parts).strip()


def _call_openai_json(
    config: AppConfig,
    messages: list[dict],
    temperature: float,
    client: OpenAI | None,
) -> dict[str, Any]:
    llm_client = client or get_llm_client(config)
    response_format = (config.llm.response_format or "").strip()
    if response_format:
        response = llm_client.chat.completions.create(
            model=config.llm.model_name,
            messages=messages,
            temperature=temperature,
            response_format={"type": response_format},
        )
    else:
        response = llm_client.chat.completions.create(
            model=config.llm.model_name,
            messages=messages,
            temperature=temperature,
        )
    content = response.choices[0].message.content or ""
    return _extract_json(content)


def _call_gemini_json(
    config: AppConfig,
    messages: list[dict],
    temperature: float,
) -> dict[str, Any]:
    prompt = _build_prompt(messages)
    if not prompt:
        return {}

    client = get_gemini_client(config)
    response_format = (config.llm.response_format or "").strip()
    response_mime_type = "application/json" if response_format else None

    gen_config = None
    if response_mime_type or temperature is not None:
        try:
            from google import genai

            gen_config = genai.types.GenerateContentConfig(
                temperature=temperature,
                response_mime_type=response_mime_type,
            )
        except Exception:
            gen_config = None

    if gen_config is not None:
        response = client.models.generate_content(
            model=config.llm.model_name,
            contents=prompt,
            config=gen_config,
        )
    else:
        response = client.models.generate_content(
            model=config.llm.model_name,
            contents=prompt,
        )

    text = getattr(response, "text", None)
    if not text:
        try:
            text = response.candidates[0].content.parts[0].text
        except Exception:
            text = ""
    return _extract_json(text or "")


def call_llm_json(
    config: AppConfig,
    messages: list[dict],
    temperature: float = 0.3,
    client: OpenAI | None = None,
) -> dict[str, Any]:
    provider = (config.llm.provider or "openai_compat").strip().lower()
    if provider in {"openai", "openai_compat", "openai-compatible"}:
        return _call_openai_json(config, messages, temperature, client)
    if provider in {"gemini", "google", "google-genai"}:
        return _call_gemini_json(config, messages, temperature)
    raise ValueError(f"Unsupported LLM provider: {config.llm.provider}")
