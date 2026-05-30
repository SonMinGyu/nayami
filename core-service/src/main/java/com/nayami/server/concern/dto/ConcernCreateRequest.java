package com.nayami.server.concern.dto;

import jakarta.validation.constraints.NotBlank;

public record ConcernCreateRequest(
    @NotBlank String content
) {

}