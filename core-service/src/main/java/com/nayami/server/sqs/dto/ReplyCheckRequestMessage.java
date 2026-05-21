package com.nayami.server.sqs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ReplyCheckRequestMessage(
    @JsonProperty("reply_id") Long replyId,
    @JsonProperty("concern_content") String concernContent,
    @JsonProperty("reply_content") String replyContent
) {

}