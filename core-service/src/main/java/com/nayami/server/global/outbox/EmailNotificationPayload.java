package com.nayami.server.global.outbox;

public record EmailNotificationPayload(
    String toEmail,
    String nickname,
    String concernContent,
    String replyContent
) {

}