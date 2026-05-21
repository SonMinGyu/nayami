package com.nayami.server.sqs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ReplyCheckResultMessage(
    @JsonProperty("reply_id") Long replyId,
    @JsonProperty("is_safe") boolean isSafe,
    String reason
) {

}