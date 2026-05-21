package com.nayami.server.sqs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ConcernCheckResultMessage(
    @JsonProperty("concern_id") Long concernId,
    @JsonProperty("is_safe") boolean isSafe,
    String reason
) {

}