'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const COOLDOWN_SECONDS = 180; // 3분 (서버 재전송 쿨다운)

/**
 * OTP 재전송 쿨다운 타이머 훅
 * - remaining: 재전송 가능까지 남은 초
 * - canResend: 재전송 가능 여부 (remaining === 0)
 * - reset: 타이머를 3분으로 초기화 (OTP 발송 후 호출)
 * - restore: 남은 시간을 지정해 타이머 복원 (페이지 복귀 시 호출)
 */
export function useOtpTimer() {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback((startFrom: number) => {
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

  /** OTP 발송 후 호출 — 3분 카운트다운 시작 */
  const reset = useCallback(() => {
    startTimer(COOLDOWN_SECONDS);
  }, [startTimer]);

  /** 페이지 복귀 시 호출 — 남은 시간으로 카운트다운 복원 */
  const restore = useCallback((remainingSeconds: number) => {
    startTimer(Math.max(0, remainingSeconds));
  }, [startTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    remaining,
    canResend: remaining === 0,
    reset,
    restore,
  };
}
