package com.nayami.server.sqs.dto;

public record ConcernCheckResultMessage(
    Long concernId,
    boolean isSafe,
    String reason
) {

}