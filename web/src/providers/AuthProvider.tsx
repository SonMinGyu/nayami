'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * 앱 최초 로드 시 refreshToken 쿠키를 이용해 accessToken을 자동으로 복구한다.
 * 페이지 새로고침으로 Zustand 메모리가 초기화되어도 로그인 상태가 유지된다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/refresh', { method: 'POST' });
        if (res.ok) {
          const { accessToken } = await res.json();
          setAccessToken(accessToken);
        }
      } catch {
        // refreshToken 쿠키 없음 → 비로그인 상태로 유지
      }
    };

    restoreSession();
  }, [setAccessToken]);

  return <>{children}</>;
}
