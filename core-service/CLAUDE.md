# Core Service

## Project Overview
나야미 서비스의 메인 백엔드.

**역할:** `Client → Core Service (this) → AI Service`

사용자의 고민 글과 답변을 관리하고, 답변 등록 시 SQS를 통해 AI Service에 콘텐츠 유해성 검사를 비동기로 요청한다.

## Tech Stack
- Java 21
- Spring Boot 3.5.14
- Spring Data JPA
- MySQL
- Spring Cloud AWS (`io.awspring`) — SQS 연동 (의존성 추가 필요, 아래 Setup 참고)
- Lombok
- Validation (Bean Validation)
- Gradle

## SQS 연동 구조
```
core-service →  [SQS: nayami-concern-check-request] → ai-service
core-service ←  [SQS: nayami-concern-check-result]  ← ai-service
core-service →  [SQS: nayami-reply-check-request]   → ai-service
core-service ←  [SQS: nayami-reply-check-result]    ← ai-service
```

| 큐 | 방향 | 메시지 필드 |
|---|---|---|
| `nayami-concern-check-request` | 발행 | `concern_id`, `concern_content` |
| `nayami-concern-check-result` | 수신 | `concern_id`, `is_safe`, `reason` |
| `nayami-reply-check-request` | 발행 | `reply_id`, `concern_content`, `reply_content` |
| `nayami-reply-check-result` | 수신 | `reply_id`, `is_safe`, `reason` |

## Project Structure
```
src/main/java/com/nayami/server/
├── ServerApplication.java
├── concern/
│   ├── controller/ConcernController.java
│   ├── dto/ConcernCreateRequest.java
│   ├── dto/ConcernResponse.java
│   ├── entity/Concern.java
│   ├── entity/ConcernStatus.java          # PENDING / ACTIVE / REJECTED
│   ├── repository/ConcernRepository.java
│   └── service/ConcernService.java
├── reply/
│   ├── controller/ReplyController.java
│   ├── dto/ReplyCreateRequest.java
│   ├── dto/ReplyResponse.java
│   ├── entity/Reply.java
│   ├── entity/ReplyStatus.java            # PENDING / SAFE / UNSAFE
│   ├── repository/ReplyRepository.java
│   └── service/ReplyService.java
├── user/
│   ├── entity/User.java
│   ├── repository/UserRepository.java
│   └── service/UserService.java
├── sqs/
│   ├── config/SqsProperties.java
│   ├── consumer/ConcernCheckResultConsumer.java
│   ├── consumer/ReplyCheckResultConsumer.java
│   ├── dto/ConcernCheckRequestMessage.java
│   ├── dto/ConcernCheckResultMessage.java
│   ├── dto/ReplyCheckRequestMessage.java
│   ├── dto/ReplyCheckResultMessage.java
│   ├── publisher/ConcernCheckRequestPublisher.java
│   ├── publisher/SqsConcernCheckRequestPublisher.java
│   ├── publisher/ReplyCheckRequestPublisher.java
│   └── publisher/SqsReplyCheckRequestPublisher.java
└── global/
    ├── config/JpaConfig.java
    ├── config/SqsConfig.java
    ├── dto/ErrorResponse.java
    ├── entity/BaseEntity.java
    ├── exception/GlobalExceptionHandler.java
    └── exception/NotFoundException.java

src/main/resources/
├── application.yaml           # 공통 설정 (AWS, SQS)
├── application-local.yaml     # 로컬 개발 (H2)
└── application-prod.yaml      # 운영 (MySQL)

src/test/resources/
└── application-test.yaml      # 테스트 (H2, SQS 더미)
```

## Setup

### 로컬 실행
```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```
H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:nayami`, username: `sa`)

### 빌드
```bash
./gradlew build
```

## Environment Variables
`application.yaml` 또는 환경변수로 관리.

| 변수 | 설명 |
|---|---|
| `SPRING_DATASOURCE_URL` | MySQL 접속 URL |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자명 |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 |
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 |
| `AWS_REGION` | AWS 리전 (기본: ap-northeast-2) |
| `SQS_CONCERN_CHECK_REQUEST_QUEUE_URL` | 고민 검사 요청 발행 큐 URL |
| `SQS_CONCERN_CHECK_RESULT_QUEUE_URL` | 고민 검사 결과 수신 큐 URL |
| `SQS_REPLY_CHECK_REQUEST_QUEUE_URL` | 답변 검사 요청 발행 큐 URL |
| `SQS_REPLY_CHECK_RESULT_QUEUE_URL` | 답변 검사 결과 수신 큐 URL |

## Coding Conventions
- 도메인형 패키지 구조 사용: `com.nayami.server.{domain}.{layer}`
- 요청/응답 DTO는 `record` 또는 Lombok `@Value` 사용
- JPA Entity는 `@NoArgsConstructor(access = PROTECTED)`, 정적 팩토리 메서드로 생성
- 외부 시스템 호출(SQS 등)은 인터페이스로 추상화

## 협업 규칙
- 어떤 작업이든 실행 전에 무엇을 하는 작업인지, 사용하는 명령어가 어떤 의미인지 먼저 설명할 것
- 코드를 추가하거나 수정할 때는 변경 내용과 그 이유를 설명할 것
- 설명 시 문법·개념·동작 원리를 포함하고, 비유나 예시를 활용해 이해하기 쉽게 설명할 것
- 특정 값이나 옵션을 사용한 경우 그 값을 선택한 이유와 다른 선택지와의 차이도 설명할 것
- 외부 시스템(AI Service, SQS 등)과 주고받는 데이터가 있을 경우 누가 어떤 값을 생성하고 어떻게 연동되는지도 함께 설명할 것
- 주석은 핵심 내용이나 코드만으로 의도를 알기 어려운 경우에만 추가하고, 과도한 주석은 지양할 것

## Code Style
- Google Java Style Guide 준수
- 포맷은 IDE formatter 사용

## Git 컨벤션
### 커밋 및 푸시 범위
- 이 프로젝트는 모노레포(`nayami/`) 안에 위치하지만, **커밋과 푸시는 core-service 변경사항만** 대상으로 한다
- `git add` 시 `core-service/` 경로 밖의 파일(예: `ai-service/`)은 포함하지 않는다

### 커밋 메시지
- Conventional Commits 형식 사용: `<type>(<scope>): <subject>`
- type: feat, fix, refactor, chore, docs, test
- subject는 한국어로, 명령형/현재형 (예: "사용자 검증 로직 추가")
- 본문은 한 줄 띄우고, 왜 변경했는지 기술
- Co-Authored-By 등 공동 작업자 정보는 커밋 메시지에 포함하지 않음

예시:
```
feat(reply): 답변 등록 시 SQS 검사 요청 발행

답변 등록 후 AI Service에 콘텐츠 유해성 검사를 비동기로 요청하기 위해
SQS 요청 큐에 메시지 발행 로직 추가
```
