package com.nayami.server.concern.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ConcernCreateRequest(
    @NotBlank String nickname,
    @NotBlank @Email String email,
    @NotBlank String content
) {

}