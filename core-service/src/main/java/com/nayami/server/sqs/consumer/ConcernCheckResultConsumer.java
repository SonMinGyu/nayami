package com.nayami.server.sqs.consumer;

import com.nayami.server.concern.service.ConcernService;
import com.nayami.server.sqs.dto.ConcernCheckResultMessage;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ConcernCheckResultConsumer {

  private final ConcernService concernService;

  @SqsListener("${sqs.concern-check-result-queue-url}")
  public void consume(ConcernCheckResultMessage message) {
    log.info("고민 AI 검사 결과 수신: concernId={} isSafe={}", message.concernId(), message.isSafe());
    concernService.handleCheckResult(message.concernId(), message.isSafe());
  }
}