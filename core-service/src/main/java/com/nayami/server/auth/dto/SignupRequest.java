package com.nayami.server.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignupRequest(
    @NotBlank @Email String email,
    @NotBlank String nickname
) {

}