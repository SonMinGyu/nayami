package com.nayami.server.concern.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConcernCreateRequest(
    @NotBlank @Size(max = 5000) String content
) {

}