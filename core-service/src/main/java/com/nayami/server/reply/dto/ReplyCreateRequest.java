package com.nayami.server.reply.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ReplyCreateRequest(
    @NotBlank String nickname,
    @NotBlank @Email String email,
    @NotBlank String content
) {

}