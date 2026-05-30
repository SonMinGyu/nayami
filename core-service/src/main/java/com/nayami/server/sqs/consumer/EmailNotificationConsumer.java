package com.nayami.server.sqs.consumer;

import com.nayami.server.global.mail.MailService;
import com.nayami.server.sqs.dto.EmailNotificationMessage;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationConsumer {

  private final MailService mailService;

  @SqsListener("${sqs.email-notification-queue-url}")
  public void consume(EmailNotificationMessage message) {
    log.info("이메일 알림 수신: to={}", message.toEmail());
    mailService.sendReplyNotification(message.toEmail(), message.nickname(), message.concernContent(), message.replyContent());
  }
}