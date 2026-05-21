# AI Service

## Project Overview
LLM 기반 콘텐츠 검사 서비스.

**역할:** `Spring Boot → AI Service (this) → LLM API`

Spring Boot에서 사용자 입력을 받아 LLM API로 콘텐츠 유해성을 검사하고 결과를 반환한다.

## Tech Stack
- Python 3.12
- FastAPI
- Pydantic v2 / pydantic-settings
- httpx (LLM API 호출, async)
- pytest / pytest-asyncio (테스트)
- uvicorn (ASGI 서버)

## Project Structure
```
app/
├── main.py          # FastAPI 앱 진입점, 라우터 등록, SQS 컨슈머 lifespan 등록
├── config.py        # 환경변수 설정 (pydantic-settings)
├── common/          # 공통 코드
│   └── exceptions.py
├── llm/             # LLM 호출 인프라
│   └── client.py    # Gemini httpx 클라이언트
├── health/          # 헬스체크 도메인
│   └── router.py    # GET /health
├── reply/           # 답변 검사 도메인
│   ├── router.py    # POST /reply/check
│   ├── service.py
│   └── schemas.py
├── concern/         # 고민 검사 도메인
│   ├── service.py
│   └── schemas.py
└── sqs/             # SQS 메시지 처리
    └── consumer.py  # 답변·고민 요청 큐 polling, 결과 큐 발행
tests/
```

## Setup
```bash
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# .env에 GEMINI_API_KEY 입력
```

## Run
```bash
uvicorn app.main:app --reload
```

## Environment Variables
| 변수 | 기본값 | 설명 |
|---|---|---|
| `GEMINI_API_KEY` | 필수 | Gemini API 키 |
| `GEMINI_MODEL` | `gemini-2.5-flash` | 사용할 모델명 |
| `GEMINI_TIMEOUT` | `30` | API 호출 타임아웃 (초) |
| `AWS_ACCESS_KEY_ID` | 필수 | AWS 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | 필수 | AWS 시크릿 키 |
| `AWS_REGION` | `ap-northeast-2` | AWS 리전 |
| `SQS_REPLY_CHECK_REQUEST_QUEUE_URL` | 필수 | 답변 검사 요청 수신 큐 URL |
| `SQS_REPLY_CHECK_RESULT_QUEUE_URL` | 필수 | 답변 검사 결과 발행 큐 URL |
| `SQS_CONCERN_CHECK_REQUEST_QUEUE_URL` | 필수 | 고민 검사 요청 수신 큐 URL |
| `SQS_CONCERN_CHECK_RESULT_QUEUE_URL` | 필수 | 고민 검사 결과 발행 큐 URL |

## Coding Conventions
- 모든 외부 호출은 async, timeout 필수
- 요청/응답 스키마는 Pydantic 모델로 정의
- 로깅은 표준 logging 모듈 사용, print() 금지

## 협업 규칙
- 어떤 작업이든 실행 전에 무엇을 하는 작업인지, 사용하는 명령어가 어떤 의미인지 먼저 설명할 것
- 코드를 추가하거나 수정할 때는 변경 내용과 그 이유를 설명할 것
- 설명 시 문법·개념·동작 원리를 포함하고, 비유나 예시를 활용해 이해하기 쉽게 설명할 것
- 특정 값이나 옵션을 사용한 경우 그 값을 선택한 이유와 다른 선택지와의 차이도 설명할 것
- 외부 시스템(Spring Boot 등)과 주고받는 데이터가 있을 경우 누가 어떤 값을 생성하고 어떻게 연동되는지도 함께 설명할 것
- 주석은 핵심 내용이나 코드만으로 의도를 알기 어려운 경우에만 추가하고, 과도한 주석은 지양할 것

## Code Style
- Format with Black before committing.

## Git 규칙
- 커밋과 푸시는 ai-service 디렉토리 내 변경사항만 대상으로 한다
- `git add` 시 `ai-service/` 경로 밖의 파일(예: `core-service/`)은 포함하지 않는다

## Git 컨벤션
### 커밋 메시지
- Conventional Commits 형식 사용: `<type>(<scope>): <subject>`
- type: feat, fix, refactor, chore, docs, test
- subject는 한국어로, 명령형/현재형 (예: "사용자 검증 로직 추가")
- 본문은 한 줄 띄우고, 왜 변경했는지 기술
- Co-Authored-By 등 공동 작업자 정보는 커밋 메시지에 포함하지 않음

예시:
```
feat(content): LLM 응답 파싱 로직 추가

Gemini 응답이 markdown 코드블록으로 감싸진 경우가 있어
파싱 전 전처리 로직 추가
```