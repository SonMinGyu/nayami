from pydantic import BaseModel


class ContentCheckRequest(BaseModel):
    text: str


class ContentCheckResponse(BaseModel):
    is_safe: bool
    reason: str