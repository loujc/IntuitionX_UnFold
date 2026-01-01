from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any, Dict

import yaml
from pydantic import BaseModel

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parents[2] / "config.yaml"
DEFAULT_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
_ENV_VAR_PATTERN = re.compile(r"\$\{([^}]+)\}")
_ENV_OVERRIDE_PREFIX = "CONFIG__"


class RuntimeConfig(BaseModel):
    max_llm_concurrency: int = 10


class SystemConfig(BaseModel):
    video_types: list[str] = ["History", "Anime", "Finance", "Course"]
    default_mode: str = "simple"


class ProcessingConfig(BaseModel):
    enable_chunking: bool = True
    chunk_duration: int = 300
    max_asr_workers: int = 1
    llm_concurrency: int = 5


class ASRConfig(BaseModel):
    model_config = {"protected_namespaces": ()}

    backend: str = "auto"
    model_size: str = "medium"


class LLMConfig(BaseModel):
    model_config = {"protected_namespaces": ()}

    provider: str = "openai_compat"
    base_url: str = "http://127.0.0.1:8045/v1"
    model_name: str = "gemini-3-flash"
    api_key: str = ""
    response_format: str | None = "json_object"


class DBConfig(BaseModel):
    url: str = "sqlite:///./data/intuitionx.db"


class StorageConfig(BaseModel):
    temp_dir: str = "./temp"
    max_upload_size_mb: int | None = 500


class AppConfig(BaseModel):
    runtime: RuntimeConfig = RuntimeConfig()
    system: SystemConfig = SystemConfig()
    processing: ProcessingConfig = ProcessingConfig()
    asr: ASRConfig = ASRConfig()
    llm: LLMConfig = LLMConfig()
    db: DBConfig = DBConfig()
    storage: StorageConfig = StorageConfig()


def _load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"')
        os.environ.setdefault(key, value)


def _expand_env_vars(value: Any) -> Any:
    if isinstance(value, str):
        return _ENV_VAR_PATTERN.sub(
            lambda match: os.environ.get(match.group(1), match.group(0)), value
        )
    if isinstance(value, list):
        return [_expand_env_vars(item) for item in value]
    if isinstance(value, dict):
        return {key: _expand_env_vars(item) for key, item in value.items()}
    return value


def _parse_env_value(raw: str) -> Any:
    try:
        parsed = yaml.safe_load(raw)
    except Exception:
        return raw
    return raw if parsed is None else parsed


def _set_nested(data: Dict[str, Any], path: list[str], value: Any) -> None:
    current = data
    for part in path[:-1]:
        if part not in current or not isinstance(current[part], dict):
            current[part] = {}
        current = current[part]
    current[path[-1]] = value


def _apply_env_overrides(data: Dict[str, Any]) -> Dict[str, Any]:
    for key, value in os.environ.items():
        if not key.startswith(_ENV_OVERRIDE_PREFIX):
            continue
        path = key[len(_ENV_OVERRIDE_PREFIX) :].lower().split("__")
        if not path:
            continue
        _set_nested(data, path, _parse_env_value(value))
    return data


def _validate_config(data: Dict[str, Any]) -> AppConfig:
    try:
        return AppConfig.model_validate(data)
    except AttributeError:
        return AppConfig.parse_obj(data)


def load_config(
    config_path: Path | None = None, env_path: Path | None = None
) -> AppConfig:
    config_path = config_path or DEFAULT_CONFIG_PATH
    env_path = env_path or DEFAULT_ENV_PATH

    _load_env_file(env_path)

    raw_data: Dict[str, Any] = {}
    if config_path.exists():
        loaded = yaml.safe_load(config_path.read_text()) or {}
        if not isinstance(loaded, dict):
            raise ValueError("config.yaml must be a mapping at top level.")
        raw_data = loaded

    raw_data = _expand_env_vars(raw_data)
    raw_data = _apply_env_overrides(raw_data)
    return _validate_config(raw_data)


_CONFIG: AppConfig | None = None


def get_config() -> AppConfig:
    global _CONFIG
    if _CONFIG is None:
        _CONFIG = load_config()
    return _CONFIG
