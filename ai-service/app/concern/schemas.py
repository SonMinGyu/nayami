from pydantic import BaseModel, Field, field_validator


class ConcernCheckRequest(BaseModel):
    concern_content: str = Field(min_length=1)

    @field_validator("concern_content", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v


class ConcernCheckResponse(BaseModel):
    is_safe: bool
    reason: str