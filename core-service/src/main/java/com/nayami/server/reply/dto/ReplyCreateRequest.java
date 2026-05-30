package com.nayami.server.reply.dto;

import jakarta.validation.constraints.NotBlank;

public record ReplyCreateRequest(
    @NotBlank String content
) {

}