package com.nayami.server.sqs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ConcernCheckRequestMessage(
    @JsonProperty("concern_id") Long concernId,
    @JsonProperty("concern_content") String concernContent
) {

}