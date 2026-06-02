@AGENTS.md

# Web

## Project Overview

나야미 서비스의 웹 프론트엔드.

**역할:** `User → Web (this) → Core Service`

OTP 기반 이메일 인증으로 회원가입/로그인하고, 고민을 익명으로 등록하거나 다른 사람의 고민에 답변한다.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)
- axios (HTTP 클라이언트)
- react-hook-form + zod (폼 유효성 검사)

## Project Structure

```
web/
├── src/
│   ├── proxy.ts                          # 라우트 보호 (인증 필요 경로 접근 제어)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # 랜딩 페이지
│   │   ├── api/                          # Next.js Route Handlers
│   │   │   ├── set-token/route.ts        # refreshToken httpOnly 쿠키 설정
│   │   │   ├── clear-token/route.ts      # refreshToken 쿠키 삭제 (로그아웃)
│   │   │   └── refresh/route.ts          # 쿠키 기반 토큰 갱신 프록시
│   │   ├── (auth)/                       # 인증 라우트 그룹 (레이아웃 분리)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   └── (main)/                       # 메인 라우트 그룹 (인증 필요)
│   │       ├── layout.tsx
│   │       ├── home/page.tsx             # 홈 (고민 던지기 / 고민 들어주기 메뉴)
│   │       ├── post/page.tsx             # 내 고민 등록
│   │       └── reply/page.tsx            # 랜덤 고민 조회 + 답변
│   ├── components/
│   │   ├── ui/                           # shadcn/ui 자동 생성 컴포넌트
│   │   ├── auth/
│   │   │   └── OtpInput.tsx              # 6자리 OTP 입력 컴포넌트
│   │   └── WatercolorBackground.tsx      # 워터컬러 배경 이미지 레이어
│   ├── hooks/
│   │   └── useOtpTimer.ts                # OTP 재전송 타이머 (180초)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                 # axios 인스턴스 + interceptor
│   │   │   ├── auth.ts                   # 인증 API 함수
│   │   │   ├── concern.ts                # 고민 API 함수
│   │   │   ├── reply.ts                  # 답변 API 함수
│   │   │   └── user.ts                   # 사용자 API 함수 (GET /api/users/me)
│   │   ├── constants.ts                  # 이미지 경로 등 상수
│   │   └── utils.ts                      # cn() 유틸
│   ├── providers/
│   │   ├── QueryProvider.tsx             # TanStack Query Provider
│   │   └── AuthProvider.tsx              # 앱 로드 시 토큰·닉네임 자동 복구
│   ├── store/
│   │   └── authStore.ts                  # Zustand (accessToken·nickname 메모리 보관)
│   └── types/
│       ├── auth.ts
│       ├── concern.ts
│       ├── reply.ts
│       └── user.ts
├── public/
│   └── images/                           # 앱에서 사용하는 이미지 에셋
├── .env.local
├── .env.example
└── CLAUDE.md
```

## Setup

```bash
npm install
cp .env.example .env.local
# .env.local에 NEXT_PUBLIC_API_BASE_URL 입력
npm run dev
```

## Environment Variables

| 변수                       | 기본값                  | 설명                 |
| -------------------------- | ----------------------- | -------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | core-service API URL |

## 인증 토큰 관리 전략

- **accessToken** → Zustand 메모리 저장 (JS로 직접 접근 가능한 localStorage 대신 메모리에 두어 XSS 공격으로 탈취 불가)
- **refreshToken** → httpOnly 쿠키 저장 (JS 접근 자체가 불가, SameSite=Strict으로 CSRF 차단)
- 페이지 새로고침 시 accessToken 소멸 → AuthProvider가 앱 마운트 시 `/api/refresh` 호출해 자동 재발급
- 로그인/회원가입 후 클라이언트는 `/api/set-token` Route Handler를 경유해 httpOnly 쿠키 설정
  (클라이언트 JS는 httpOnly 쿠키를 직접 설정 불가 → 서버 측 Route Handler 경유 필수)

### axios interceptor 패턴

- **Request**: Zustand에서 accessToken 읽어 `Authorization: Bearer <token>` 헤더 자동 첨부
- **Response 401**: `/api/refresh` 호출로 토큰 자동 갱신 후 원본 요청 재시도 (1회)
- **동시 401 처리**: `isRefreshing` 플래그 + `failedQueue` 패턴으로 중복 refresh 방지
- **refresh 실패**: Zustand 초기화 후 `/login`으로 리다이렉트

## Coding Conventions

- 도메인형 모듈 구조: `lib/api/{domain}.ts`, `hooks/use{Domain}.ts`
- 서버 상태(API 데이터)는 TanStack Query로만 관리
- 클라이언트 상태(인증 등)는 Zustand로 관리
- 폼 유효성 검사는 zod 스키마로 정의하고 react-hook-form과 연결
- 컴포넌트는 shadcn/ui 기반으로 작성, 커스텀 스타일은 Tailwind 클래스로 추가

## 협업 규칙

- 어떤 작업이든 실행 전에 무엇을 하는 작업인지, 사용하는 명령어가 어떤 의미인지 먼저 설명할 것
- 코드를 추가하거나 수정할 때는 변경 내용과 그 이유를 설명할 것
- 설명 시 문법·개념·동작 원리를 포함하고, 비유나 예시를 활용해 이해하기 쉽게 설명할 것
- 특정 값이나 옵션을 사용한 경우 그 값을 선택한 이유와 다른 선택지와의 차이도 설명할 것
- 외부 시스템과 주고받는 데이터가 있을 경우 누가 어떤 값을 생성하고 어떻게 연동되는지도 함께 설명할 것
- 서비스의 모든 함수에 해당 함수의 역할을 설명하는 주석을 추가할 것
- 함수 내에서는 코드만으로 의도를 알기 어려운 핵심 로직에만 주석을 추가하고, 과도한 주석은 지양할 것
- 설계 결정(컴포넌트 구조, 상태 관리 방식, API 연동 방식 등)은 구현 전에 반드시 사용자에게 먼저 물어볼 것
- 설계 토론이 마무리되면 구현 전에 결정 내용을 요약 정리하여 사용자에게 확인받을 것
- 설계·코드 고민 시 현재 과제 규모뿐 아니라 확장성도 함께 고려하여 의견을 제시할 것
- 커밋하기 적절한 양의 작업이 완료되면 커밋 여부를 사용자에게 먼저 물어볼 것

## Code Style

- ESLint + Prettier 사용
- 포맷은 IDE formatter 사용

## Git 컨벤션

### 커밋 및 푸시 범위

- 커밋과 푸시는 `web/` 디렉토리 내 변경사항만 대상으로 한다
- `git add` 시 `web/` 경로 밖의 파일(예: `core-service/`)은 포함하지 않는다

### 커밋 메시지

- Conventional Commits 형식 사용: `<type>(<scope>): <subject>`
- type: feat, fix, refactor, chore, docs, test
- subject는 한국어로, 명령형/현재형 (예: "로그인 OTP 입력 폼 추가")
- 본문은 한 줄 띄우고, 왜 변경했는지 기술
- Co-Authored-By 등 공동 작업자 정보는 커밋 메시지에 포함하지 않음

예시:

```
feat(auth): 이메일 OTP 로그인 플로우 구현

OTP 입력 후 JWT 토큰을 발급받아 메모리(Zustand)와
httpOnly 쿠키에 각각 저장하는 인증 흐름 추가
```
