'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getMe } from '@/lib/api/user';

/**
 * 앱 최초 로드 시 refreshToken 쿠키를 이용해 accessToken과 닉네임을 자동으로 복구한다.
 * 페이지 새로고침으로 Zustand 메모리가 초기화되어도 로그인 상태가 유지된다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setNickname = useAuthStore((s) => s.setNickname);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/refresh', { method: 'POST' });
        if (!res.ok) return;

        const { accessToken } = await res.json();
        setAccessToken(accessToken);

        // accessToken이 Zustand에 저장된 후 /me를 호출해야 interceptor가 토큰을 첨부한다.
        // /me 실패 시에도 로그인 상태(accessToken)는 유지한다.
        try {
          const { nickname } = await getMe();
          setNickname(nickname);
        } catch {
          // 닉네임 조회 실패는 치명적이지 않으므로 조용히 무시
        }
      } catch {
        // refreshToken 쿠키 없음 → 비로그인 상태로 유지
      }
    };

    restoreSession();
  }, [setAccessToken, setNickname]);

  return <>{children}</>;
}
