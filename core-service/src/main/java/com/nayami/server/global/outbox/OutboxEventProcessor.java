package com.nayami.server.global.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nayami.server.sqs.config.SqsProperties;
import com.nayami.server.sqs.dto.EmailNotificationMessage;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventProcessor {

  private static final int MAX_RETRY = 3;

  private final OutboxEventRepository outboxEventRepository;
  private final SqsTemplate sqsTemplate;
  private final SqsProperties sqsProperties;
  private final ObjectMapper objectMapper;

  @Transactional
  public void process() {
    List<OutboxEvent> events = outboxEventRepository.findByStatus(OutboxEventStatus.PENDING);
    for (OutboxEvent event : events) {
      try {
        EmailNotificationPayload payload = objectMapper.readValue(
            event.getPayload(), EmailNotificationPayload.class);
        sqsTemplate.send(sqsProperties.emailNotificationQueueUrl(),
            new EmailNotificationMessage(payload.toEmail(), payload.nickname(), payload.concernContent(), payload.replyContent()));
        event.markProcessed();
        log.info("Outbox 이벤트 발행 완료: id={}, type={}", event.getId(), event.getEventType());
      } catch (Exception e) {
        log.error("Outbox 이벤트 발행 실패: id={}, type={}, retryCount={}",
            event.getId(), event.getEventType(), event.getRetryCount(), e);
        event.incrementRetry(MAX_RETRY);
      }
    }
  }
}