export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface OtpSendRequest {
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  code: string;
}

export interface NicknameCheckRequest {
  nickname: string;
}

export interface NicknameCheckResponse {
  available: boolean;
}

export interface SignupRequest {
  email: string;
  nickname: string;
}

export interface RefreshRequest {
  refreshToken: string;
}
