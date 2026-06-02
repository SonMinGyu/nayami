'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuthStore } from '@/store/authStore';
import { sendLoginOtp, verifyLoginOtp } from '@/lib/api/auth';
import { getMe } from '@/lib/api/user';
import { useOtpTimer } from '@/hooks/useOtpTimer';
import axios from 'axios';

type Step = 'email' | 'otp';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_KEY = 'login_otp_session';
const OTP_TTL_MS = 5 * 60 * 1000; // 서버 OTP 유효기간 5분

interface OtpSession {
  email: string;
  sentAt: number;
}

/** sessionStorage에서 유효한 OTP 세션을 읽는다. */
function loadOtpSession(): OtpSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: OtpSession = JSON.parse(raw);
    if (Date.now() - session.sentAt > OTP_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setNickname = useAuthStore((s) => s.setNickname);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const { remaining, reset: resetTimer, canResend, restore } = useOtpTimer();

  // 유효한 OTP 세션이 있으면 이메일·단계·타이머를 복원한다.
  // sessionStorage 접근은 클라이언트에서만 가능하므로 useEffect 안에서 처리한다.
  useEffect(() => {
    const session = loadOtpSession();
    if (session) {
      setEmail(session.email);
      setStep('otp');
      const elapsed = Math.floor((Date.now() - session.sentAt) / 1000);
      restore(180 - elapsed);
    }
  }, [restore]);

  /** 이메일 형식 검사 */
  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('이메일을 입력해주세요.');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    setEmailError('');
    return true;
  };

  /** OTP 이메일 발송 */
  const handleSendOtp = async () => {
    if (!validateEmail(email)) return;
    setLoading(true);
    try {
      await sendLoginOtp({ email });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, sentAt: Date.now() }));
      resetTimer();
      setStep('otp');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) toast.error('가입되지 않은 이메일입니다.');
        else if (status === 429) toast.error('잠시 후 다시 시도해주세요.');
        else toast.error('인증 코드 발송에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  /** OTP 검증 + 로그인 */
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      const tokens = await verifyLoginOtp({ email, code: otp });
      setAccessToken(tokens.accessToken);
      await fetch('/api/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      const userInfo = await getMe();
      setNickname(userInfo.nickname);
      sessionStorage.removeItem(SESSION_KEY);
      router.push('/home');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error('인증 코드가 올바르지 않거나 만료되었습니다.');
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      sessionStorage.removeItem(SESSION_KEY);
      setStep('email');
      setOtp('');
    } else {
      router.push('/');
    }
  };

  return (
    <>
      {/* 상단 헤더 */}
      <header className="flex items-center px-margin-sm h-16 shrink-0 z-10 relative">
        <button
          onClick={handleBack}
          aria-label="뒤로가기"
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors text-primary"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
      </header>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col px-margin-sm pt-margin-md pb-[120px] overflow-y-auto z-10">
        {step === 'email' && (
          <>
            <div className="w-full text-center mb-margin-lg">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-margin-xs">
                다시 만났네요
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                로그인할 이메일을 입력해주세요
              </p>
            </div>
            <div className="w-full max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                onBlur={() => email && validateEmail(email)}
                placeholder="이메일 주소"
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                className={`w-full bg-surface-container-lowest border-2 rounded-xl px-4 py-4 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-colors bg-white shadow-sm ${
                  emailError ? 'border-error focus:border-error' : 'border-outline/50 focus:border-primary'
                }`}
              />
              {emailError && (
                <p className="mt-2 font-label-sm text-label-sm text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {emailError}
                </p>
              )}
              <div className="mt-margin-lg flex justify-center opacity-70 pointer-events-none">
                <span className="material-symbols-outlined text-tertiary-container" style={{ fontSize: 64, fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                  mail
                </span>
              </div>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="mt-margin-md mb-margin-lg">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-unit">
                코드를 입력해주세요
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                <span className="font-medium text-primary">{email}</span>로 전송된 6자리 코드를 입력해주세요
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="mb-margin-md">
                <OtpInput value={otp} onChange={setOtp} />
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                <span>코드를 받지 못하셨나요?</span>
                <button
                  disabled={!canResend}
                  onClick={handleSendOtp}
                  className="text-primary font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  재전송
                </button>
                {!canResend && (
                  <span className="text-tertiary font-label-sm text-label-sm">
                    ({Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')})
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="absolute bottom-0 left-0 w-full p-margin-sm pb-8 bg-gradient-to-t from-surface via-surface/90 to-transparent pt-8 z-10">
        {step === 'email' && (
          <button
            onClick={handleSendOtp}
            disabled={!email || loading}
            className="w-full bg-primary text-on-primary font-title-md text-title-md rounded-xl py-4 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '전송 중...' : '인증 코드 받기'}
          </button>
        )}
        {step === 'otp' && (
          <button
            onClick={handleVerifyOtp}
            disabled={otp.length < 6 || loading}
            className="w-full h-14 flex items-center justify-center bg-primary text-on-primary rounded-full font-title-md text-title-md shadow-[0_8px_16px_-4px_rgba(147,74,46,0.2)] hover:bg-surface-tint active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '확인 중...' : '확인'}
          </button>
        )}
      </div>
    </>
  );
}
