'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const COOLDOWN_SECONDS = 180; // 3분 (서버 재전송 쿨다운)

/**
 * OTP 재전송 쿨다운 타이머 훅
 * - remaining: 재전송 가능까지 남은 초
 * - canResend: 재전송 가능 여부 (remaining === 0)
 * - reset: 타이머를 다시 3분으로 초기화 (OTP 발송 후 호출)
 * - initialRemaining: 페이지 복귀 시 남은 시간으로 타이머를 복원할 때 사용
 */
export function useOtpTimer(initialRemaining?: number) {
  const [remaining, setRemaining] = useState(initialRemaining ?? COOLDOWN_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback((startFrom: number = COOLDOWN_SECONDS) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(startFrom);

    if (startFrom <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    startTimer(COOLDOWN_SECONDS);
  }, [startTimer]);

  // initialRemaining이 0보다 크면 즉시 타이머 시작 (복원 모드)
  useEffect(() => {
    if (initialRemaining !== undefined && initialRemaining > 0) {
      startTimer(initialRemaining);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    remaining,
    canResend: remaining === 0,
    reset,
  };
}
