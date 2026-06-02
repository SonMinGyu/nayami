'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { postConcern } from '@/lib/api/concern';
import axios from 'axios';

type PageState = 'writing' | 'success';

const MAX_LENGTH = 5000;

export default function PostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>('writing');

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      await postConcern({ content: content.trim() });
      setPageState('success');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/');
      } else {
        toast.error('고민 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageState === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-margin-sm">
        <div className="w-full max-w-container-max-width mx-auto flex flex-col items-center text-center z-10">
          <div className="mb-margin-lg relative">
            <div
              className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-surface-container flex items-center justify-center shadow-[0_20px_40px_rgba(147,74,46,0.08)]"
              style={{ animation: 'float 4s ease-in-out infinite' }}
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: 100, fontVariationSettings: "'FILL' 0" }}
              >
                send
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-unit mb-margin-lg max-w-md mx-auto">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
              고민이 전달됐어요
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              누군가 읽고 답변을 보내드릴 거예요.
              <br className="hidden md:block" /> 이메일을 확인해보세요 :)
            </p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="bg-primary text-on-primary font-title-md text-title-md py-4 px-8 rounded-full shadow-[0_8px_20px_rgba(147,74,46,0.15)] hover:shadow-[0_12px_24px_rgba(147,74,46,0.2)] hover:-translate-y-0.5 transition-all duration-300 min-w-[200px]"
          >
            메인으로 돌아가기
          </button>
        </div>

        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 서브 헤더 — 메인 헤더와 동일한 max-width/padding 기준으로 정렬 */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md">
        <div className="max-w-container-max-width mx-auto px-margin-sm h-14 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            aria-label="뒤로가기"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
            고민 던지기
          </h1>
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* 작성 영역 */}
      <main className="flex-1 flex flex-col w-full max-w-container-max-width mx-auto px-margin-sm pt-[7.5rem] pb-28">
        <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_0_rgba(147,74,46,0.04)] p-6 md:p-8 relative min-h-[300px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="오늘 어떤 고민이 있으신가요? 편하게 적어보세요..."
            autoFocus
            className="w-full flex-1 bg-transparent border-none focus:ring-0 resize-none font-body-lg text-body-lg text-on-surface placeholder:text-outline/60 outline-none min-h-[250px]"
          />
          <div className="flex justify-end mt-2">
            <span className={`font-label-sm text-label-sm ${content.length >= MAX_LENGTH ? 'text-error' : 'text-on-surface-variant/70'}`}>
              {content.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>
      </main>

      {/* 하단 버튼 — 하단 네비 제거로 bottom-0 통일 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-surface via-surface to-transparent pt-8 pb-6">
        <div className="max-w-container-max-width mx-auto px-margin-sm">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="w-full h-14 bg-primary text-on-primary rounded-full font-title-md text-title-md flex items-center justify-center hover:bg-surface-tint transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '등록 중...' : '던지기'}
          </button>
        </div>
      </div>
    </div>
  );
}
