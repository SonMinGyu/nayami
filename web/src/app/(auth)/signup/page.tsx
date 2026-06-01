'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuthStore } from '@/store/authStore';
import { sendSignupOtp, verifySignupOtp, checkNickname, signup } from '@/lib/api/auth';
import { useOtpTimer } from '@/hooks/useOtpTimer';
import axios from 'axios';

type Step = 'email' | 'otp' | 'nickname';

export default function SignupPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [loading, setLoading] = useState(false);

  const { remaining, reset: resetTimer, canResend } = useOtpTimer();

  /** OTP 이메일 발송 */
  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await sendSignupOtp({ email });
      resetTimer();
      setStep('otp');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) toast.error('이미 가입된 이메일입니다.');
        else if (status === 429) toast.error('잠시 후 다시 시도해주세요.');
        else toast.error('인증 코드 발송에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  /** OTP 검증 */
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      await verifySignupOtp({ email, code: otp });
      setStep('nickname');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error('인증 코드가 올바르지 않거나 만료되었습니다.');
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  /** 닉네임 중복 확인 */
  const handleNicknameCheck = async () => {
    if (!nickname.trim()) return;
    try {
      const { available } = await checkNickname({ nickname: nickname.trim() });
      setNicknameStatus(available ? 'available' : 'taken');
    } catch {
      toast.error('닉네임 확인 중 오류가 발생했습니다.');
    }
  };

  /** 회원가입 완료 */
  const handleSignup = async () => {
    if (nicknameStatus !== 'available') return;
    setLoading(true);
    try {
      const tokens = await signup({ email, nickname: nickname.trim() });
      setAccessToken(tokens.accessToken);
      await fetch('/api/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      router.push('/home');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) toast.error('이미 사용 중인 닉네임입니다.');
        else if (status === 400) toast.error('이메일 인증이 만료되었습니다. 다시 시도해주세요.');
        else toast.error('회원가입에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') setStep('email');
    else if (step === 'nickname') setStep('otp');
    else router.push('/');
  };

  return (
    <>
      {/* 상단 헤더 */}
      <header className="flex items-center px-margin-sm h-16 shrink-0 w-full z-10 relative">
        <button
          onClick={handleBack}
          aria-label="뒤로가기"
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors text-on-surface"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
      </header>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col px-margin-sm pt-margin-lg pb-[120px] overflow-y-auto z-10">
        {step === 'email' && (
          <>
            <div className="flex flex-col gap-2 mb-10">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-lg md:text-display-lg text-on-background tracking-tight">
                반가워요!
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                가입할 이메일을 입력해주세요
              </p>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              className="w-full bg-surface-container-lowest border border-outline/40 rounded-xl px-4 py-4 font-body-md text-body-md text-on-background placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
            />
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="mt-margin-md mb-margin-lg">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-unit">
                이메일을 확인해주세요
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                6자리 코드를 보냈어요
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="mb-margin-md">
                <OtpInput value={otp} onChange={setOtp} />
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                <span>코드를 못 받으셨나요?</span>
                <button
                  disabled={!canResend}
                  onClick={async () => {
                    await handleSendOtp();
                  }}
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

        {step === 'nickname' && (
          <>
            <div className="space-y-unit mb-margin-lg">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background">
                어떻게 불러드릴까요?
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                나야미에서 사용할 편안한 이름을 지어주세요.
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameStatus('idle');
                }}
                onBlur={handleNicknameCheck}
                placeholder="닉네임 입력"
                className={`w-full bg-surface-container-lowest rounded-lg px-4 py-4 font-body-lg text-body-lg text-on-background placeholder:text-on-surface-variant/50 transition-all duration-200 focus:outline-none border ${
                  nicknameStatus === 'available'
                    ? 'border-green-600 focus:border-green-600'
                    : nicknameStatus === 'taken'
                      ? 'border-error focus:border-error'
                      : 'border-outline focus:border-primary'
                }`}
              />
              {nicknameStatus !== 'idle' && (
                <div
                  className={`flex items-center gap-1 font-label-sm text-label-sm ${
                    nicknameStatus === 'available' ? 'text-green-600' : 'text-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {nicknameStatus === 'available' ? 'check_circle' : 'error'}
                  </span>
                  <span>
                    {nicknameStatus === 'available'
                      ? '사용 가능한 닉네임입니다'
                      : '이미 사용 중인 닉네임입니다'}
                  </span>
                </div>
              )}
            </div>
            {/* 장식 아이콘 */}
            <div className="flex-1 min-h-[100px] flex items-center justify-center mt-margin-md opacity-20 pointer-events-none">
              <span className="material-symbols-outlined text-6xl text-primary">mail</span>
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
            className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_20px_0_rgba(147,74,46,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
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
        {step === 'nickname' && (
          <button
            onClick={handleSignup}
            disabled={nicknameStatus !== 'available' || loading}
            className="w-full h-14 bg-primary text-on-primary font-title-md text-title-md rounded-full shadow-sm hover:shadow-md hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300 flex items-center justify-center"
          >
            {loading ? '가입 중...' : '가입 완료'}
          </button>
        )}
      </div>
    </>
  );
}
