from pydantic import BaseModel


class ContentCheckRequest(BaseModel):
    concern_content: str
    reply_content: str


class ContentCheckResponse(BaseModel):
    is_safe: bool
    reason: str