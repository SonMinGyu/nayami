import logging

import httpx

from app.common.exceptions import LLMException
from app.config import settings

logger = logging.getLogger(__name__)

_GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/{model}:generateContent"


class GeminiClient:
    async def generate(self, prompt: str) -> str:
        url = _GEMINI_URL.format(model=settings.gemini_model)
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        try:
            async with httpx.AsyncClient(timeout=settings.gemini_timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    params={"key": settings.gemini_api_key},
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error("Gemini API error: %s", e.response.text)
            raise LLMException(f"Gemini API 호출 실패: {e.response.status_code}")
        except httpx.TimeoutException:
            logger.error("Gemini API timeout")
            raise LLMException("Gemini API 응답 시간 초과")

        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


gemini_client = GeminiClient()