package com.nayami.server.reply.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nayami.server.concern.entity.Concern;
import com.nayami.server.concern.repository.ConcernRepository;
import com.nayami.server.global.exception.NotFoundException;
import com.nayami.server.global.outbox.EmailNotificationPayload;
import com.nayami.server.global.outbox.OutboxEvent;
import com.nayami.server.global.outbox.OutboxEventRepository;
import com.nayami.server.global.outbox.OutboxEventType;
import com.nayami.server.reply.dto.ReplyCreateRequest;
import com.nayami.server.reply.dto.ReplyResponse;
import com.nayami.server.reply.entity.Reply;
import com.nayami.server.reply.repository.ReplyRepository;
import com.nayami.server.sqs.dto.ReplyCheckRequestMessage;
import com.nayami.server.sqs.publisher.ReplyCheckRequestPublisher;
import com.nayami.server.user.entity.User;
import com.nayami.server.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReplyService {

  private final ReplyRepository replyRepository;
  private final ConcernRepository concernRepository;
  private final UserService userService;
  private final ReplyCheckRequestPublisher replyCheckRequestPublisher;
  private final OutboxEventRepository outboxEventRepository;
  private final ObjectMapper objectMapper;

  // 인증된 사용자를 조회하고 지정된 고민에 답변을 저장한다.
  @Transactional
  public ReplyResponse create(Long userId, Long concernId, ReplyCreateRequest request) {
    Concern concern = concernRepository.findById(concernId)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 고민입니다. id=" + concernId));
    User author = userService.findById(userId);
    Reply reply = replyRepository.save(Reply.of(concern, author, request.content()));
    return ReplyResponse.from(reply);
  }

  // AI 서비스에 답변 내용 유해성 검사를 요청하는 SQS 메시지를 발행한다.
  // 트랜잭션 밖에서 호출 — DB 커밋 이후 SQS 발행 보장
  public void publishCheckRequest(ReplyResponse reply, String concernContent) {
    replyCheckRequestPublisher.publish(new ReplyCheckRequestMessage(
        reply.id(),
        concernContent,
        reply.content()
    ));
  }

  // AI 서비스의 검사 결과를 받아 답변 상태를 업데이트하고, 안전한 답변이면 이메일 알림 Outbox 이벤트를 저장한다.
  @Transactional
  public void handleCheckResult(Long replyId, boolean isSafe, String reason) {
    Reply reply = replyRepository.findByIdWithConcern(replyId)
        .orElseThrow(() -> new NotFoundException("존재하지 않는 답변입니다. id=" + replyId));
    reply.updateCheckResult(isSafe, reason);
    if (isSafe) {
      reply.getConcern().recordSafeReply();
      saveEmailOutboxEvent(reply);
    }
  }

  // 고민 작성자에게 보낼 이메일 알림 정보를 직렬화해 Outbox 이벤트로 저장한다.
  private void saveEmailOutboxEvent(Reply reply) {
    try {
      String payload = objectMapper.writeValueAsString(new EmailNotificationPayload(
          reply.getConcern().getAuthor().getEmail(),
          reply.getConcern().getAuthor().getNickname(),
          reply.getConcern().getContent(),
          reply.getContent()
      ));
      outboxEventRepository.save(OutboxEvent.pending(OutboxEventType.REPLY_MAIL_NOTIFICATION_EVENT, payload));
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Outbox 이벤트 payload 직렬화 실패", e);
    }
  }
}