# AI Service

## Project Overview
LLM 기반 콘텐츠 검사 서비스. 메인 서버(Spring)에서 사용자 입력을
받아 이 서비스로 보내면, 필요한 AI 활용하여 처리 한다.

## Tech Stack
- Python 3.12
- FastAPI
- Pydantic v2
- httpx (LLM API 호출, async)
- pytest (테스트)

## Coding Conventions
- 언어에 따른 기본 컨벤션 적용
- 모든 외부 호출은 async, timeout 필수
- 요청/응답 스키마는 Pydantic 모델로 정의
- 로깅은 표준 logging 모듈 사용, print() 금지

## Setup
```bash
source .venv/bin/activate
pip install -r requirements.txt   # once a requirements file exists
```

## Code Style
- Format with Black before committing.

## Git 컨벤션
### 커밋 메시지
- Conventional Commits 형식 사용: `<type>(<scope>): <subject>`
- type: feat, fix, refactor, chore, docs, test
- subject는 한국어로, 명령형/현재형 (예: "사용자 검증 로직 추가")
- 본문은 한 줄 띄우고, 왜 변경했는지 기술

예시:
feat(ai-service): LLM 응답 파싱 로직 추가

OpenAI 응답이 비정형 JSON을 반환하는 경우가 있어
파싱 실패 시 재시도하도록 변경gi