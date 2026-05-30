package com.nayami.server.auth.dto;

public record TokenResponse(
    String accessToken,
    String refreshToken
) {

}