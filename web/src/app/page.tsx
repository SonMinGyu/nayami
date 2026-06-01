import Link from 'next/link';
import { WatercolorBackground } from '@/components/WatercolorBackground';
import { LANDING_HERO_URL } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface relative overflow-hidden">
      <WatercolorBackground opacity={0.6} />

      <main className="relative z-10 w-full max-w-container-max-width px-margin-sm md:px-margin-md flex flex-col items-center text-center">
        {/* 영웅 일러스트 */}
        <div className="mb-margin-lg">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-surface-container-lowest shadow-[0_8px_32px_0_rgba(147,74,46,0.08)] flex items-center justify-center overflow-hidden">
            <img
              src={LANDING_HERO_URL}
              alt="나야미 일러스트"
              className="w-full h-full object-cover opacity-90 mix-blend-multiply"
            />
          </div>
        </div>

        {/* 브랜딩 */}
        <div className="flex flex-col items-center space-y-margin-xs mb-section-padding">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight">나야미</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xs mt-unit">
            오늘의 고민을 살짝 던져보세요
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col items-center w-full max-w-sm space-y-margin-sm">
          <Link
            href="/signup"
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-title-md text-title-md py-4 px-8 rounded-full shadow-[0_4px_20px_0_rgba(147,74,46,0.15)] hover:shadow-[0_6px_24px_0_rgba(147,74,46,0.2)] transition-all duration-300 flex items-center justify-center group"
          >
            시작하기
            <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
          <Link
            href="/login"
            className="w-full text-primary font-label-sm text-label-sm py-3 px-8 rounded-full hover:bg-surface-container-low transition-colors duration-200"
          >
            로그인
          </Link>
        </div>
      </main>
    </div>
  );
}
