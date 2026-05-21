package com.nayami.server.sqs.dto;

public record ReplyCheckResultMessage(
    Long replyId,
    boolean isSafe,
    String reason
) {

}