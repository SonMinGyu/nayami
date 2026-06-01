'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const COOLDOWN_SECONDS = 180; // 3분 (서버 재전송 쿨다운)

/**
 * OTP 재전송 쿨다운 타이머 훅
 * - remaining: 재전송 가능까지 남은 초
 * - canResend: 재전송 가능 여부 (remaining === 0)
 * - reset: 타이머를 다시 3분으로 초기화 (OTP 발송 후 호출)
 */
export function useOtpTimer() {
  const [remaining, setRemaining] = useState(COOLDOWN_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(COOLDOWN_SECONDS);

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
    startTimer();
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
  };
}
