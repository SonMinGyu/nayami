from pathlib import Path

from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    gemini_timeout: int = 30

    model_config = {"env_file": str(_ENV_FILE)}


settings = Settings()