package com.nayami.server.auth.controller;

import com.nayami.server.auth.dto.OtpSendRequest;
import com.nayami.server.auth.dto.NicknameCheckRequest;
import com.nayami.server.auth.dto.NicknameCheckResponse;
import com.nayami.server.auth.dto.OtpVerifyRequest;
import com.nayami.server.auth.dto.RefreshRequest;
import com.nayami.server.auth.dto.SignupRequest;
import com.nayami.server.auth.dto.TokenResponse;
import com.nayami.server.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/email/send")
  public ResponseEntity<Void> sendSignupOtp(@Valid @RequestBody OtpSendRequest request) {
    authService.sendSignupOtp(request);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/email/verify")
  public ResponseEntity<Void> verifySignupOtp(@Valid @RequestBody OtpVerifyRequest request) {
    authService.verifySignupOtp(request);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/nickname/check")
  public ResponseEntity<NicknameCheckResponse> checkNickname(
      @Valid @RequestBody NicknameCheckRequest request) {
    return ResponseEntity.ok(authService.checkNickname(request));
  }

  @PostMapping("/signup")
  public ResponseEntity<TokenResponse> signup(@Valid @RequestBody SignupRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
  }

  @PostMapping("/login")
  public ResponseEntity<Void> sendLoginOtp(@Valid @RequestBody OtpSendRequest request) {
    authService.sendLoginOtp(request);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/login/verify")
  public ResponseEntity<TokenResponse> verifyLoginOtp(@Valid @RequestBody OtpVerifyRequest request) {
    return ResponseEntity.ok(authService.verifyLoginOtp(request));
  }

  @PostMapping("/refresh")
  public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
    return ResponseEntity.ok(authService.refresh(request));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletRequest request) {
    String token = request.getHeader("Authorization").substring("Bearer ".length());
    authService.logout(token);
    return ResponseEntity.noContent().build();
  }
}