import json
import logging

from app.content.schemas import ContentCheckRequest, ContentCheckResponse
from app.llm.client import gemini_client

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = """다음 텍스트가 부적절한 내용(욕설, 혐오, 폭력 등)을 포함하는지 검사해주세요.

텍스트: {text}

아래 JSON 형식으로만 응답해주세요. 다른 내용은 절대 포함하지 마세요.
{{"is_safe": true/false, "reason": "판단 이유"}}"""


class ContentService:
    async def check(self, request: ContentCheckRequest) -> ContentCheckResponse:
        prompt = _PROMPT_TEMPLATE.format(text=request.text)
        raw = await gemini_client.generate(prompt)

        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        return ContentCheckResponse(**data)


content_service = ContentService()