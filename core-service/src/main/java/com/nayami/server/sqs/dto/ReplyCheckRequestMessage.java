package com.nayami.server.sqs.dto;

public record ReplyCheckRequestMessage(
    Long replyId,
    String concernContent,
    String replyContent
) {

}