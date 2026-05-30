package com.nayami.server.global.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtProvider {

  private final SecretKey secretKey;
  private final long accessTokenExpiry;
  private final long refreshTokenExpiry;

  public JwtProvider(JwtProperties properties) {
    this.secretKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    this.accessTokenExpiry = properties.accessTokenExpiry();
    this.refreshTokenExpiry = properties.refreshTokenExpiry();
  }

  public String generateAccessToken(Long userId) {
    return generate(userId, accessTokenExpiry);
  }

  public String generateRefreshToken(Long userId) {
    return generate(userId, refreshTokenExpiry);
  }

  public Long getUserId(String token) {
    return Long.parseLong(parseClaims(token).getSubject());
  }

  // 토큰 만료 시각까지 남은 시간(ms) — 블랙리스트 TTL을 잔여 만료시간으로 설정해
  // 토큰이 자연 만료된 이후에도 Redis 항목이 남아 메모리를 낭비하지 않도록 한다.
  public long getRemainingExpiry(String token) {
    return parseClaims(token).getExpiration().getTime() - System.currentTimeMillis();
  }

  public boolean validate(String token) {
    try {
      parseClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      log.debug("Invalid JWT: {}", e.getMessage());
      return false;
    }
  }

  private String generate(Long userId, long expiry) {
    Date now = new Date();
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .issuedAt(now)
        .expiration(new Date(now.getTime() + expiry))
        .signWith(secretKey)
        .compact();
  }

  private Claims parseClaims(String token) {
    return Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}