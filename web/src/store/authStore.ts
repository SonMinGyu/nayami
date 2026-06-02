'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  nickname: string | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void;
  setNickname: (nickname: string) => void;
  clearAuth: () => void;
}

/**
 * 인증 상태 스토어
 * - accessToken: 메모리에만 보관 (XSS 공격으로 탈취 불가)
 * - refreshToken은 httpOnly 쿠키에 보관 (이 스토어에서 관리하지 않음)
 * - persist로 감싸되 accessToken은 partialize로 제외해 메모리 전용으로 유지
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      nickname: null,
      isAuthenticated: false,

      /** accessToken을 메모리에 저장하고 인증 상태를 true로 설정한다. */
      setAccessToken: (token: string) =>
        set({ accessToken: token, isAuthenticated: true }),

      /** 닉네임을 메모리에 저장한다. */
      setNickname: (nickname: string) => set({ nickname }),

      /** accessToken과 닉네임을 메모리에서 제거하고 인증 상태를 false로 설정한다. */
      clearAuth: () => set({ accessToken: null, nickname: null, isAuthenticated: false }),
    }),
    {
      name: 'nayami-auth',
      // accessToken은 localStorage에 저장하지 않음 (메모리 전용)
      partialize: () => ({}),
    }
  )
);
