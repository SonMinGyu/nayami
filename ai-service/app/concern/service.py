import json
import logging

from app.concern.schemas import ConcernCheckRequest, ConcernCheckResponse
from app.llm.client import gemini_client

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = """아래 내용이 진솔한 고민 글인지 검토해주세요. 다음 세 가지 기준을 모두 통과해야 안전한 고민 글입니다.

1. 부적절한 내용 없음: 욕설, 혐오, 선정적·폭력적 내용이 없어야 합니다.
2. 실제 고민 여부: 의미 없는 텍스트, 광고, 스팸, 반복 문자 등이 아닌 진짜 고민이어야 합니다.
3. 타인 비하·공격 없음: 특정인을 향한 악의적인 내용이 없어야 합니다.

[고민 내용]
{concern_content}

아래 JSON 형식으로만 응답해주세요. 다른 내용은 절대 포함하지 마세요.
{{"is_safe": true/false, "reason": "판단 이유 (한 줄 요약)"}}"""


class ConcernService:
    async def check(self, request: ConcernCheckRequest) -> ConcernCheckResponse:
        prompt = _PROMPT_TEMPLATE.format(concern_content=request.concern_content)
        raw = await gemini_client.generate(prompt)

        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        return ConcernCheckResponse(**data)


concern_service = ConcernService()