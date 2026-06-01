import apiClient from './client';
import type {
  NicknameCheckRequest,
  NicknameCheckResponse,
  OtpSendRequest,
  OtpVerifyRequest,
  SignupRequest,
  TokenResponse,
} from '@/types/auth';

/** 회원가입용 OTP를 이메일로 발송한다. */
export const sendSignupOtp = async (data: OtpSendRequest): Promise<void> => {
  await apiClient.post('/api/auth/email/send', data);
};

/** 회원가입용 OTP를 검증한다. */
export const verifySignupOtp = async (data: OtpVerifyRequest): Promise<void> => {
  await apiClient.post('/api/auth/email/verify', data);
};

/** 닉네임 사용 가능 여부를 확인한다. */
export const checkNickname = async (
  data: NicknameCheckRequest
): Promise<NicknameCheckResponse> => {
  const res = await apiClient.post<NicknameCheckResponse>('/api/auth/nickname/check', data);
  return res.data;
};

/** 회원가입을 완료하고 JWT 토큰을 발급받는다. */
export const signup = async (data: SignupRequest): Promise<TokenResponse> => {
  const res = await apiClient.post<TokenResponse>('/api/auth/signup', data);
  return res.data;
};

/** 로그인용 OTP를 이메일로 발송한다. */
export const sendLoginOtp = async (data: OtpSendRequest): Promise<void> => {
  await apiClient.post('/api/auth/login', data);
};

/** 로그인용 OTP를 검증하고 JWT 토큰을 발급받는다. */
export const verifyLoginOtp = async (data: OtpVerifyRequest): Promise<TokenResponse> => {
  const res = await apiClient.post<TokenResponse>('/api/auth/login/verify', data);
  return res.data;
};

/** 로그아웃하고 서버에서 토큰을 무효화한다. */
export const logout = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');
};
