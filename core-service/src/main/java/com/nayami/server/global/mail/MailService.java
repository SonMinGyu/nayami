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

  public void sendSignupOtp(String toEmail, String otp) {
    sendOtpEmail(toEmail, "나야미 - 회원가입 인증 코드", otp);
  }

  public void sendLoginOtp(String toEmail, String otp) {
    sendOtpEmail(toEmail, "나야미 - 로그인 인증 코드", otp);
  }

  private void sendOtpEmail(String toEmail, String subject, String otp) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromEmail);
    message.setTo(toEmail);
    message.setSubject(subject);
    message.setText("""
        나야미 이메일 인증 코드입니다.

        인증 코드: %s

        인증 코드는 5분간 유효합니다.
        본인이 요청하지 않은 경우 이 메일을 무시하세요.
        """.formatted(otp));
    mailSender.send(message);
    log.info("OTP 이메일 발송 완료: to={}", toEmail);
  }

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