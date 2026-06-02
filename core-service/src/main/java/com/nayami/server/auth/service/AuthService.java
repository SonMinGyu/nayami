package com.nayami.server.auth.service;

import com.nayami.server.auth.dto.NicknameCheckRequest;
import com.nayami.server.auth.dto.NicknameCheckResponse;
import com.nayami.server.auth.dto.OtpSendRequest;
import com.nayami.server.auth.dto.OtpVerifyRequest;
import com.nayami.server.auth.dto.RefreshRequest;
import com.nayami.server.auth.dto.SignupRequest;
import com.nayami.server.auth.dto.TokenResponse;
import com.nayami.server.global.exception.BadRequestException;
import com.nayami.server.global.exception.ConflictException;
import com.nayami.server.global.exception.NotFoundException;
import com.nayami.server.global.exception.TooManyRequestsException;
import com.nayami.server.global.exception.UnauthorizedException;
import com.nayami.server.global.jwt.JwtProvider;
import com.nayami.server.global.mail.MailService;
import com.nayami.server.user.entity.User;
import com.nayami.server.user.repository.UserRepository;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private static final String OTP_PREFIX = "otp:";
  // 회원가입·로그인 쿨다운을 분리해 한쪽 OTP 발송이 다른 쪽을 차단하지 않도록 한다.
  private static final String SIGNUP_OTP_COOLDOWN_PREFIX = "signup-otp-cooldown:";
  private static final String LOGIN_OTP_COOLDOWN_PREFIX = "login-otp-cooldown:";
  private static final String EMAIL_VERIFIED_PREFIX = "email-verified:";
  private static final String REFRESH_PREFIX = "refresh:";
  private static final String BLACKLIST_PREFIX = "blacklist:";

  private static final long OTP_TTL_SECONDS = 300;            // 5분
  private static final long OTP_COOLDOWN_SECONDS = 180;       // 3분
  private static final long EMAIL_VERIFIED_TTL_SECONDS = 600; // 10분
  private static final long REFRESH_TTL_SECONDS = 604800;     // 7일

  private final UserRepository userRepository;
  private final JwtProvider jwtProvider;
  private final StringRedisTemplate redisTemplate;
  private final MailService mailService;
  // SecureRandom: Math.random()은 예측 가능한 패턴이 있어 OTP에 부적합. 암호학적으로 안전한 난수 생성기 사용.
  private final SecureRandom secureRandom = new SecureRandom();

  // 이메일 중복 여부를 확인하고 회원가입용 OTP를 발송한다.
  public void sendSignupOtp(OtpSendRequest request) {
    // OTP 발송 전 중복 이메일을 먼저 차단해 불필요한 메일 발송 비용을 방지한다.
    if (userRepository.existsByEmail(request.email())) {
      throw new ConflictException("이미 가입된 이메일입니다.");
    }
    checkCooldown(SIGNUP_OTP_COOLDOWN_PREFIX, request.email());
    String otp = generateAndSaveOtp(SIGNUP_OTP_COOLDOWN_PREFIX, request.email());
    mailService.sendSignupOtp(request.email(), otp);
  }

  // 회원가입용 OTP를 검증하고 이메일 인증 완료 상태를 Redis에 저장한다.
  public void verifySignupOtp(OtpVerifyRequest request) {
    verifyOtp(request.email(), request.code());
    // OTP 확인 후 닉네임 입력 단계가 남아있으므로, 인증 완료 상태를 별도 보관해 회원가입 완료 시 검증에 사용한다.
    redisTemplate.opsForValue().set(
        EMAIL_VERIFIED_PREFIX + request.email(), "true",
        EMAIL_VERIFIED_TTL_SECONDS, TimeUnit.SECONDS
    );
  }

  // 닉네임 사용 가능 여부를 반환한다.
  public NicknameCheckResponse checkNickname(NicknameCheckRequest request) {
    boolean available = !userRepository.existsByNickname(request.nickname());
    return new NicknameCheckResponse(available);
  }

  // 이메일 인증 완료 여부를 확인하고 사용자를 생성한 뒤 토큰을 발급한다.
  @Transactional
  public TokenResponse signup(SignupRequest request) {
    if (!Boolean.TRUE.equals(redisTemplate.hasKey(EMAIL_VERIFIED_PREFIX + request.email()))) {
      throw new BadRequestException("이메일 인증이 완료되지 않았습니다.");
    }
    if (userRepository.existsByEmail(request.email())) {
      throw new ConflictException("이미 가입된 이메일입니다.");
    }
    if (userRepository.existsByNickname(request.nickname())) {
      throw new ConflictException("이미 사용 중인 닉네임입니다.");
    }
    User user = userRepository.save(User.of(request.nickname(), request.email()));
    redisTemplate.delete(EMAIL_VERIFIED_PREFIX + request.email());
    return issueTokens(user.getId());
  }

  // 가입된 이메일인지 확인하고 로그인용 OTP를 발송한다.
  public void sendLoginOtp(OtpSendRequest request) {
    // 미가입 이메일에는 OTP를 발송하지 않도록 존재 여부를 먼저 확인한다.
    userRepository.findByEmail(request.email())
        .orElseThrow(() -> new NotFoundException("가입되지 않은 이메일입니다."));
    checkCooldown(LOGIN_OTP_COOLDOWN_PREFIX, request.email());
    String otp = generateAndSaveOtp(LOGIN_OTP_COOLDOWN_PREFIX, request.email());
    mailService.sendLoginOtp(request.email(), otp);
  }

  // 로그인용 OTP를 검증하고 Access Token과 Refresh Token을 발급한다.
  public TokenResponse verifyLoginOtp(OtpVerifyRequest request) {
    verifyOtp(request.email(), request.code());
    User user = userRepository.findByEmail(request.email())
        .orElseThrow(() -> new NotFoundException("가입되지 않은 이메일입니다."));
    return issueTokens(user.getId());
  }

  // Refresh Token의 유효성을 검증하고 새 Access Token을 발급한다.
  public TokenResponse refresh(RefreshRequest request) {
    String token = request.refreshToken();
    if (!jwtProvider.validate(token)) {
      throw new UnauthorizedException("유효하지 않은 Refresh Token입니다.");
    }
    Long userId = jwtProvider.getUserId(token);
    String stored = redisTemplate.opsForValue().get(REFRESH_PREFIX + userId);
    // JWT 서명 검증만으로는 로그아웃된 Refresh Token을 차단할 수 없으므로 Redis 저장값과 비교한다.
    if (!token.equals(stored)) {
      throw new UnauthorizedException("유효하지 않은 Refresh Token입니다.");
    }
    return new TokenResponse(jwtProvider.generateAccessToken(userId), token);
  }

  // Access Token을 블랙리스트에 등록하고 Refresh Token을 삭제해 로그아웃 처리한다.
  public void logout(String accessToken) {
    long remainingExpiry = jwtProvider.getRemainingExpiry(accessToken);
    redisTemplate.opsForValue().set(
        BLACKLIST_PREFIX + accessToken, "true",
        remainingExpiry, TimeUnit.MILLISECONDS
    );
    Long userId = jwtProvider.getUserId(accessToken);
    redisTemplate.delete(REFRESH_PREFIX + userId);
  }

  // OTP 재전송 간격(3분)을 초과하지 않았는지 확인한다.
  private void checkCooldown(String cooldownPrefix, String email) {
    if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownPrefix + email))) {
      throw new TooManyRequestsException("이미 발송된 OTP가 있습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  // 6자리 OTP를 생성하고 유효기간(5분), 재전송 제한(3분)과 함께 Redis에 저장한다.
  private String generateAndSaveOtp(String cooldownPrefix, String email) {
    String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
    redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, OTP_TTL_SECONDS, TimeUnit.SECONDS);
    redisTemplate.opsForValue().set(cooldownPrefix + email, "true", OTP_COOLDOWN_SECONDS, TimeUnit.SECONDS);
    return otp;
  }

  // Redis에 저장된 OTP와 비교해 검증하고, 인증 성공 후 즉시 삭제해 재사용을 방지한다.
  private void verifyOtp(String email, String code) {
    String stored = redisTemplate.opsForValue().get(OTP_PREFIX + email);
    if (!code.equals(stored)) {
      throw new BadRequestException("인증 코드가 올바르지 않거나 만료되었습니다.");
    }
    redisTemplate.delete(OTP_PREFIX + email);
  }

  // Access Token과 Refresh Token을 발급하고 Refresh Token을 Redis에 저장한다.
  private TokenResponse issueTokens(Long userId) {
    String accessToken = jwtProvider.generateAccessToken(userId);
    String refreshToken = jwtProvider.generateRefreshToken(userId);
    redisTemplate.opsForValue().set(
        REFRESH_PREFIX + userId, refreshToken,
        REFRESH_TTL_SECONDS, TimeUnit.SECONDS
    );
    return new TokenResponse(accessToken, refreshToken);
  }
}