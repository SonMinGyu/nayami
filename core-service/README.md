# Core Service

나야미 서비스의 메인 백엔드. 사용자 인증, 고민·답변 관리, AI 유해성 검사 연동, 이메일 알림을 담당한다.

## Tech Stack

| 항목 | 기술 |
|---|---|
| 언어 | Java 21 |
| 프레임워크 | Spring Boot 3.5 |
| 데이터베이스 | MySQL (운영) / H2 (로컬·테스트) |
| 캐시·세션 | Redis |
| 메시지 큐 | AWS SQS (Spring Cloud AWS) |
| 이메일 | AWS SES (SMTP) |
| 인증 | JWT (JJWT) |
| ORM | Spring Data JPA |
| 빌드 | Gradle |

---

## 시스템 내 역할

```
User → Web (Next.js) → Core Service (this) → AI Service (FastAPI) → Gemini API
```

- Web에서 REST API 요청을 받아 고민·답변·인증을 처리한다.
- 고민·답변 등록 시 SQS로 AI Service에 유해성 검사를 비동기 요청한다.
- 안전한 답변이 등록되면 고민 작성자에게 이메일 알림을 보낸다.

---

## 프로젝트 구조

```
src/main/java/com/nayami/server/
├── auth/
│   ├── controller/AuthController.java
│   ├── dto/                              # OTP, Signup, Login, Token DTO
│   └── service/AuthService.java
├── concern/
│   ├── controller/ConcernController.java
│   ├── dto/ConcernCreateRequest.java
│   ├── dto/ConcernResponse.java
│   ├── entity/Concern.java
│   ├── entity/ConcernStatus.java         # PENDING / ACTIVE / REJECTED
│   ├── repository/ConcernRepository.java
│   └── service/ConcernService.java
├── reply/
│   ├── controller/ReplyController.java
│   ├── dto/ReplyCreateRequest.java
│   ├── dto/ReplyResponse.java
│   ├── entity/Reply.java
│   ├── entity/ReplyStatus.java           # PENDING / SAFE / UNSAFE
│   ├── repository/ReplyRepository.java
│   └── service/ReplyService.java
├── user/
│   ├── controller/UserController.java
│   ├── dto/UserResponse.java
│   ├── entity/User.java
│   ├── repository/UserRepository.java
│   └── service/UserService.java
├── sqs/
│   ├── config/SqsProperties.java
│   ├── consumer/ConcernCheckResultConsumer.java
│   ├── consumer/ReplyCheckResultConsumer.java
│   ├── consumer/EmailNotificationConsumer.java
│   ├── dto/                              # SQS 메시지 DTO
│   ├── publisher/ConcernCheckRequestPublisher.java   # 인터페이스
│   ├── publisher/SqsConcernCheckRequestPublisher.java
│   ├── publisher/ReplyCheckRequestPublisher.java     # 인터페이스
│   └── publisher/SqsReplyCheckRequestPublisher.java
└── global/
    ├── config/                           # JPA, Security, SQS, JWT, Redis 설정
    ├── dto/ErrorResponse.java
    ├── entity/BaseEntity.java
    ├── exception/                        # 도메인별 예외 + GlobalExceptionHandler
    ├── jwt/                              # JwtProvider, JwtAuthenticationFilter
    ├── mail/MailService.java
    └── outbox/                           # Transactional Outbox Pattern

src/main/resources/
├── application.yaml           # 공통 설정
├── application-local.yaml     # 로컬 (H2, Redis localhost)
└── application-prod.yaml      # 운영 (MySQL RDS)
```

---

## API 명세

### 인증 (`/api/auth`)

| 메서드 | 경로 | 설명 | 인증 필요 |
|---|---|---|---|
| POST | `/api/auth/email/send` | 회원가입용 OTP 발송 | 불필요 |
| POST | `/api/auth/email/verify` | 회원가입용 OTP 검증 | 불필요 |
| POST | `/api/auth/nickname/check` | 닉네임 중복 확인 | 불필요 |
| POST | `/api/auth/signup` | 회원가입 완료 및 토큰 발급 | 불필요 |
| POST | `/api/auth/login` | 로그인용 OTP 발송 | 불필요 |
| POST | `/api/auth/login/verify` | 로그인용 OTP 검증 및 토큰 발급 | 불필요 |
| POST | `/api/auth/refresh` | Access Token 갱신 | 불필요 |
| POST | `/api/auth/logout` | 로그아웃 | 필요 |

### 고민 / 답변 (`/api/concerns`)

| 메서드 | 경로 | 설명 | 인증 필요 |
|---|---|---|---|
| POST | `/api/concerns` | 고민 등록 | 필요 |
| GET | `/api/concerns/random` | 랜덤 고민 1건 조회 | 필요 |
| POST | `/api/concerns/{concernId}/replies` | 답변 등록 | 필요 |

---

## 도메인 모델

### User
| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| nickname | String | 고유 닉네임 |
| email | String | 고유 이메일 |

### Concern (고민)
| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| author | User | 작성자 |
| content | TEXT | 고민 내용 |
| status | ConcernStatus | `PENDING` / `ACTIVE` / `REJECTED` |
| safeReplyCount | int | 안전한 답변 수 |
| firstSafeReplyAt | LocalDateTime | 첫 안전 답변 시각 |

### Reply (답변)
| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| concern | Concern | 대상 고민 |
| author | User | 작성자 |
| content | TEXT | 답변 내용 |
| status | ReplyStatus | `PENDING` / `SAFE` / `UNSAFE` |
| reason | TEXT | AI 판단 근거 |

---

## 인증 설계

### 방식: 이메일 OTP + JWT + Redis

비밀번호 없이 이메일 OTP로 인증하고, JWT로 API 접근을 제어한다.

**OTP 방식을 선택한 이유:**
- Magic Link는 모바일에서 앱 → 브라우저 → 앱 이동 문제와 Deep Link 복잡도가 있어 부적합
- OTP는 웹·앱 공통으로 동작하며, iOS는 SMS/이메일 OTP 자동 감지까지 지원한다

**JWT를 선택한 이유:**
- 모바일 앱 확장 시 쿠키 없이 `Authorization` 헤더만으로 인증 가능
- Session 방식도 결국 Redis가 필요하므로 인프라 차이가 없다
- 단, 순수 JWT는 즉시 로그아웃이 불가능하므로 Redis 블랙리스트로 보완한다

**OTP 보안 설계:**
- `Math.random()` 대신 `SecureRandom` 사용 — 예측 가능한 패턴을 배제해 OTP 추측 공격을 방어한다

### OTP 파라미터

| 항목 | 값 | 이유 |
|---|---|---|
| 자리수 | 6자리 | 표준적인 OTP 길이 |
| OTP TTL | 5분 | 만료 전 입력 여유 |
| 재전송 쿨다운 | 3분 | 스팸·비용 방지 |
| 이메일 인증 완료 TTL | 10분 | OTP 인증 후 닉네임 입력까지의 여유 |

### JWT 파라미터

| 항목 | 값 |
|---|---|
| Access Token 만료 | 1시간 |
| Refresh Token 만료 | 7일 |
| 로그아웃 처리 | Access Token → Redis 블랙리스트 + Refresh Token 삭제 |

### 회원가입 플로우

```
이메일 입력 → 중복 검사 → OTP 발송 → OTP 인증 → 닉네임 입력 → 닉네임 중복 검사 → 회원가입 완료 + JWT 발급
```

### 로그인 플로우

```
이메일 입력 → OTP 발송 → OTP 인증 → JWT 발급
```

---

## SQS 연동: AI 유해성 검사

고민·답변 등록 즉시 API 응답을 반환하고, AI 검사는 SQS를 통해 비동기로 처리된다.

```
Core Service → [nayami-concern-check-request] → AI Service → [nayami-concern-check-result] → Core Service
Core Service → [nayami-reply-check-request]   → AI Service → [nayami-reply-check-result]   → Core Service
```

| 큐 | 방향 | 메시지 필드 |
|---|---|---|
| `nayami-concern-check-request` | 발행 | `concern_id`, `concern_content` |
| `nayami-concern-check-result` | 수신 | `concern_id`, `is_safe`, `reason` |
| `nayami-reply-check-request` | 발행 | `reply_id`, `concern_content`, `reply_content` |
| `nayami-reply-check-result` | 수신 | `reply_id`, `is_safe`, `reason` |

**SQS 발행 시점 — 트랜잭션 외부 호출:**

SQS 발행은 DB 트랜잭션 커밋 이후에 실행된다. 트랜잭션 내부에서 발행하면 DB 롤백 후에도 메시지가 이미 SQS에 들어간 상태가 될 수 있기 때문이다.

**랜덤 고민 조회 조건:**

`GET /api/concerns/random`은 다음 조건을 모두 충족하는 고민 중 1건을 랜덤 반환한다.
- 상태가 `ACTIVE` (AI 검사 통과)
- 안전한 답변이 3개 미만 (`safe_reply_count < 3`)
- 최초 안전 답변으로부터 2주 이내 (오래된 고민 제외)
- 본인이 작성한 고민이 아님
- 본인이 이미 답변한 고민이 아님

---

## 이메일 알림: Transactional Outbox Pattern

답변 등록 후 고민 작성자에게 이메일로 알림을 보낸다. DB 커밋과 이메일 발송의 원자성을 보장하기 위해 **Transactional Outbox Pattern**을 사용한다.

### 왜 다른 방식을 선택하지 않았나

| 방식 | 문제점 |
|---|---|
| `@Async` 단독 | DB 롤백 후에도 이메일이 발송될 수 있음 (원자성 없음) |
| `@TransactionalEventListener(AFTER_COMMIT)` + `@Async` | 커밋 후 발송은 보장하나, 서버 크래시 시 메모리에서 작업 소멸 (내구성 없음) |
| SQS 직접 발행 (트랜잭션 외부) | SQS 발행과 DB 커밋 사이 원자성 없음 |
| **Outbox + SQS (채택)** | 같은 트랜잭션 안에 outbox 저장 → 스케줄러가 SQS 발행 → 완전한 원자성·내구성·자동 재시도 확보 |

### 처리 흐름

```
[답변 등록 트랜잭션]
  └─ Reply 저장
  └─ OutboxEvent 저장 (PENDING)

[스케줄러, 10초 간격]
  └─ PENDING OutboxEvent 조회
  └─ SQS(nayami-email-notification) 발행
  └─ OutboxEvent → PROCESSED

[SQS Consumer]
  └─ 이메일 발송 (AWS SES)
```

### Outbox 파라미터

| 항목 | 값 | 이유 |
|---|---|---|
| 폴링 간격 | 10초 | 발송 지연과 DB 부하의 균형 |
| 스케줄 시작 시점 | `ApplicationReadyEvent` 이후 | Tomcat, SQS 리스너 등 전체 초기화 완료 후 안전하게 시작 |
| 최대 재시도 횟수 | 3회 | 3회 초과 시 `FAILED` 상태로 전환, 수동 확인 대상 |

### OutboxEvent 상태

| 상태 | 설명 |
|---|---|
| `PENDING` | 발행 대기 중 |
| `PROCESSED` | SQS 발행 완료 |
| `FAILED` | 3회 재시도 후 실패, 수동 처리 필요 |

---

## 환경변수

| 변수 | 설명 |
|---|---|
| `SPRING_DATASOURCE_URL` | MySQL 접속 URL |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자명 |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | JWT 서명 키 (32바이트 이상 필수) |
| `REDIS_HOST` | Redis 호스트 (기본: localhost) |
| `REDIS_PORT` | Redis 포트 (기본: 6379) |
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 |
| `AWS_REGION` | AWS 리전 (기본: ap-northeast-2) |
| `MAIL_HOST` | SMTP 호스트 (기본: AWS SES SMTP) |
| `MAIL_PORT` | SMTP 포트 (기본: 587) |
| `MAIL_USERNAME` | SMTP 사용자명 |
| `MAIL_PASSWORD` | SMTP 비밀번호 |
| `MAIL_FROM` | 발신자 이메일 (기본: noreply@nayamiletter.com) |
| `CORS_ALLOWED_ORIGINS` | 허용 Origin (쉼표 구분, 기본: http://localhost:3000) |
| `SQS_CONCERN_CHECK_REQUEST_QUEUE_URL` | 고민 검사 요청 발행 큐 URL |
| `SQS_CONCERN_CHECK_RESULT_QUEUE_URL` | 고민 검사 결과 수신 큐 URL |
| `SQS_REPLY_CHECK_REQUEST_QUEUE_URL` | 답변 검사 요청 발행 큐 URL |
| `SQS_REPLY_CHECK_RESULT_QUEUE_URL` | 답변 검사 결과 수신 큐 URL |
| `SQS_EMAIL_NOTIFICATION_QUEUE_URL` | 이메일 알림 발행 큐 URL |

---

## 로컬 개발

### 사전 요구사항

- Java 21
- Redis (`brew install redis && brew services start redis`)

### 실행

```bash
MAIL_USERNAME=SES_SMTP_사용자명 \
MAIL_PASSWORD=SES_SMTP_비밀번호 \
AWS_ACCESS_KEY_ID=AWS_액세스키 \
AWS_SECRET_ACCESS_KEY=AWS_시크릿키 \
./gradlew bootRun --args='--spring.profiles.active=local'
```

로컬 프로필은 H2 인메모리 DB를 사용하고, JWT Secret과 SQS URL은 application-local.yaml에 설정되어 있다.

**H2 콘솔:** `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:nayami`
- Username: `sa`

### 빌드

```bash
./gradlew build
```

---

## 운영 배포

- Core Service: AWS EC2, JAR 직접 실행
- DB: AWS RDS MySQL
- Redis: EC2 내 Redis 직접 실행
- 도메인: `api.nayamiletter.com` (Elastic IP + Nginx 리버스 프록시 + Let's Encrypt TLS)
- 이메일 발신: `noreply@nayamiletter.com` (AWS SES, `nayamiletter.com` 도메인 인증 완료)