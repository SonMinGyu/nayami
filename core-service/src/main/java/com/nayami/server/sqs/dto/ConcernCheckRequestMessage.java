package com.nayami.server.sqs.dto;

public record ConcernCheckRequestMessage(
    Long concernId,
    String concernContent
) {

}