import json
import logging

from app.reply.schemas import ReplyCheckRequest, ReplyCheckResponse
from app.llm.client import gemini_client

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = """아래 고민 글에 대한 답변을 검토해주세요. 다음 세 가지 기준을 모두 통과해야 안전한 답변입니다.

1. 부적절한 내용 없음: 욕설, 혐오, 폭력, 장난, 비난, 비판 등이 없어야 합니다.
2. 고민과 관련성: 답변이 고민 내용과 관련된 내용이어야 합니다.
3. 실질적인 도움: 감정 공감만으로 이루어지거나 "배운 점을 정리하세요", "포기하지 마세요", "응원합니다" 같은 형식적이고 뻔한 말에 그치면 안 됩니다. 아래 중 하나 이상을 포함해야 합니다.
   - 답변자의 유사한 개인적 경험
   - 고민 해결에 실제로 도움이 될 구체적인 방법이나 절차
   - 고민을 바라보는 새로운 시각이나 인사이트

[고민 내용]
{concern_content}

[답변 내용]
{reply_content}

아래 JSON 형식으로만 응답해주세요. 다른 내용은 절대 포함하지 마세요.
{{"is_safe": true/false, "reason": "판단 이유"}}"""


class ReplyService:
    async def check(self, request: ReplyCheckRequest) -> ReplyCheckResponse:
        prompt = _PROMPT_TEMPLATE.format(
            concern_content=request.concern_content,
            reply_content=request.reply_content,
        )
        raw = await gemini_client.generate(prompt)

        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        return ReplyCheckResponse(**data)


reply_service = ReplyService()