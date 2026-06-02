import apiClient from './client';
import type { UserResponse } from '@/types/user';

/** 현재 로그인한 사용자의 닉네임을 조회한다. */
export const getMe = async (): Promise<UserResponse> => {
  const res = await apiClient.get<UserResponse>('/api/users/me');
  return res.data;
};
