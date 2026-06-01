# Nayami

## Project Overview
익명 고민 공유 서비스. 사용자가 고민을 올리면 다른 사용자가 답변하고, AI가 콘텐츠 유해성을 자동으로 검사한다.

## Architecture
```
User
 │
 ▼
Web (Next.js)          ← 프론트엔드
 │  REST API (JWT)
 ▼
Core Service (Spring Boot)   ← 메인 백엔드
 │  SQS (비동기)
 ▼
AI Service (FastAPI)         ← 콘텐츠 유해성 검사
 │  HTTP
 ▼
LLM API (Google Gemini)
```

## Services
| 서비스 | 위치 | 역할 |
|---|---|---|
| Web | `web/` | 프론트엔드 (Next.js 15) |
| Core Service | `core-service/` | 메인 백엔드, 고민·답변·인증 관리 |
| AI Service | `ai-service/` | LLM 기반 콘텐츠 유해성 검사 |

## SQS 비동기 처리 흐름
```
Core Service → [nayami-concern-check-request] → AI Service → [nayami-concern-check-result] → Core Service
Core Service → [nayami-reply-check-request]   → AI Service → [nayami-reply-check-result]   → Core Service
```
고민·답변 등록 즉시 API 응답을 반환하고, AI 검사는 백그라운드에서 비동기로 처리된다.

## Git 컨벤션 (공통)
- Conventional Commits 형식: `<type>(<scope>): <subject>`
- subject는 한국어로, 명령형/현재형
- 각 서비스별로 커밋과 푸시 범위를 분리한다 (아래 각 서비스 CLAUDE.md 참고)
- Co-Authored-By 등 공동 작업자 정보는 커밋 메시지에 포함하지 않음

---

## Service Details

@core-service/CLAUDE.md

@ai-service/CLAUDE.md

@web/CLAUDE.md
