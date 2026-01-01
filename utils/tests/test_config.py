from pathlib import Path

from app.core.config import load_config


def test_config_env_override(tmp_path: Path, monkeypatch) -> None:
    config_path = tmp_path / "config.yaml"
    config_path.write_text(
        "\n".join(
            [
                "processing:",
                "  chunk_duration: 300",
                "llm:",
                '  api_key: "${LLM_API_KEY}"',
            ]
        )
        + "\n"
    )
    env_path = tmp_path / ".env"
    env_path.write_text("LLM_API_KEY=env_key\n")

    monkeypatch.delenv("LLM_API_KEY", raising=False)
    monkeypatch.setenv("CONFIG__PROCESSING__CHUNK_DURATION", "120")
    config = load_config(config_path=config_path, env_path=env_path)

    assert config.processing.chunk_duration == 120
    assert config.llm.api_key == "env_key"
