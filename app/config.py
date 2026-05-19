from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    gemini_timeout: int = 30

    model_config = {"env_file": ".env"}


settings = Settings()