from pathlib import Path

from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    gemini_timeout: int = 30

    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "ap-northeast-2"
    sqs_reply_check_request_queue_url: str
    sqs_reply_check_result_queue_url: str

    model_config = {"env_file": str(_ENV_FILE)}


settings = Settings()