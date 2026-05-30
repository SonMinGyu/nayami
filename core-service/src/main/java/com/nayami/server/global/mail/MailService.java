package com.nayami.server.global.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

  private final JavaMailSender mailSender;

  @Value("${spring.mail.username}")
  private String fromEmail;

  public void sendReplyNotification(String toEmail, String nickname, String concernContent, String replyContent) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromEmail);
    message.setTo(toEmail);
    message.setSubject("나야미 - 고민에 새로운 답변이 도착했습니다");
    message.setText("""
        %s님 안녕하세요.
        나야미 입니다.

        고민에 새로운 답변이 도착했습니다.

        ———

        [내 고민]
        %s

        [답변 내용]
        %s

        ———

        %s님이 항상 행복하시길 진심으로 기원합니다.
        나야미 드림.
        """.formatted(nickname, concernContent, replyContent, nickname));
    mailSender.send(message);
    log.info("이메일 발송 완료: to={}", toEmail);
  }
}