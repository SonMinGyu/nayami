package com.nayami.server.sqs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EmailNotificationMessage(
    @JsonProperty("to_email") String toEmail,
    @JsonProperty("nickname") String nickname,
    @JsonProperty("concern_content") String concernContent,
    @JsonProperty("reply_content") String replyContent
) {

}