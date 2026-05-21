package com.nayami.server.sqs.consumer;

import com.nayami.server.reply.service.ReplyService;
import com.nayami.server.sqs.dto.ReplyCheckResultMessage;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReplyCheckResultConsumer {

  private final ReplyService replyService;

  @SqsListener("${sqs.reply-check-result-queue-url}")
  public void consume(ReplyCheckResultMessage message) {
    log.info("AI 검사 결과 수신: replyId={} isSafe={}", message.replyId(), message.isSafe());
    replyService.handleCheckResult(message.replyId(), message.isSafe(), message.reason());
  }
}