import json
import logging

from app.content.schemas import ContentCheckRequest, ContentCheckResponse
from app.llm.client import gemini_client

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = """아래 고민 글에 대한 답변을 검토해주세요. 다음 두 가지 기준을 모두 통과해야 안전한 답변입니다.

1. 부적절한 내용 없음: 욕설, 혐오, 폭력, 장난, 비난, 비판 등이 없어야 합니다.
2. 고민과 관련성: 답변이 고민 내용에 실질적으로 도움이 되는 내용이어야 합니다.

[고민 내용]
{concern_content}

[답변 내용]
{reply_content}

아래 JSON 형식으로만 응답해주세요. 다른 내용은 절대 포함하지 마세요.
{{"is_safe": true/false, "reason": "판단 이유"}}"""


class ContentService:
    async def check(self, request: ContentCheckRequest) -> ContentCheckResponse:
        prompt = _PROMPT_TEMPLATE.format(
            concern_content=request.concern_content,
            reply_content=request.reply_content,
        )
        raw = await gemini_client.generate(prompt)

        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        return ContentCheckResponse(**data)


content_service = ContentService()