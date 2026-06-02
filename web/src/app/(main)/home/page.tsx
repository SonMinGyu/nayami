'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const nickname = useAuthStore((s) => s.nickname);

  return (
    <div className="max-w-container-max-width mx-auto pt-12 pb-8 px-margin-sm md:px-margin-md flex flex-col items-center">
      {/* 인사말 */}
      <section className="w-full text-center mb-margin-lg mt-margin-md">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
          안녕하세요,{' '}
          <span className="text-primary">{nickname ?? '익명'}</span>님
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
          오늘 하루도 수고 많으셨어요.
          <br />
          이곳에서 편안하게 마음을 나누어 보세요.
        </p>
      </section>

      {/* 메뉴 카드 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-gutter max-w-2xl">
        {/* 고민 던지기 */}
        <button
          onClick={() => router.push('/post')}
          className="group w-full bg-surface-container-lowest rounded-[32px] p-8 md:p-10 flex flex-col items-center text-center shadow-[0_4px_24px_0_rgba(147,74,46,0.04)] hover:shadow-[0_12px_40px_0_rgba(147,74,46,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out border border-transparent hover:border-primary-container/20"
        >
          <div className="w-20 h-20 rounded-full bg-surface-container-high group-hover:bg-primary-container/20 flex items-center justify-center mb-6 transition-colors duration-300">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}
            >
              mail
            </span>
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3 group-hover:text-primary transition-colors">
            고민 던지기
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            마음속 무거운 고민을 편지지에 담아
            <br className="hidden md:block" /> 조용히 털어놓아 보세요.
          </p>
        </button>

        {/* 고민 들어주기 */}
        <button
          onClick={() => router.push('/reply')}
          className="group w-full bg-surface-container-lowest rounded-[32px] p-8 md:p-10 flex flex-col items-center text-center shadow-[0_4px_24px_0_rgba(147,74,46,0.04)] hover:shadow-[0_12px_40px_0_rgba(147,74,46,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out border border-transparent hover:border-tertiary-container/30"
        >
          <div className="w-20 h-20 rounded-full bg-surface-container-high group-hover:bg-tertiary-container/20 flex items-center justify-center mb-6 transition-colors duration-300">
            <span
              className="material-symbols-outlined text-tertiary"
              style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}
            >
              hearing
            </span>
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3 group-hover:text-tertiary transition-colors">
            고민 들어주기
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            누군가의 익명 편지를 읽고
            <br className="hidden md:block" /> 따뜻한 위로의 답장을 보내주세요.
          </p>
        </button>
      </div>

      {/* 장식 요소 */}
      <div className="mt-margin-lg opacity-30 pointer-events-none">
        <span className="material-symbols-outlined text-primary/40" style={{ fontSize: 48 }}>
          local_florist
        </span>
      </div>
    </div>
  );
}
