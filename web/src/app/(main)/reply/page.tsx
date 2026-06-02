'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getRandomConcern } from '@/lib/api/concern';
import { postReply } from '@/lib/api/reply';
import type { ConcernResponse } from '@/types/concern';
import { EMPTY_MAILBOX_URL } from '@/lib/constants';
import axios from 'axios';

type PageState = 'loading' | 'empty' | 'replying' | 'sent';

const MAX_LENGTH = 5000;

export default function ReplyPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [concern, setConcern] = useState<ConcernResponse | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchConcern = async () => {
      try {
        const data = await getRandomConcern();
        if (data) {
          setConcern(data);
          setPageState('replying');
        } else {
          setPageState('empty');
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push('/');
        } else {
          toast.error('고민을 불러오는 데 실패했습니다.');
          setPageState('empty');
        }
      }
    };

    fetchConcern();
  }, [router]);

  const handleSubmitReply = async () => {
    if (!concern || !replyContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      await postReply(concern.id, { content: replyContent.trim() });
      setPageState('sent');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/');
      } else {
        toast.error('답변 전달에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** 로딩 상태 */
  if (pageState === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: 48 }}>
            progress_activity
          </span>
          <p className="font-body-md text-body-md">고민을 찾고 있어요...</p>
        </div>
      </div>
    );
  }

  /** 고민 없음 상태 */
  if (pageState === 'empty') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-margin-sm">
        <div className="bg-surface-container-lowest rounded-xl p-margin-lg flex flex-col items-center text-center shadow-[0_4px_20px_0_rgba(147,74,46,0.04)] w-full max-w-[480px]">
          <div className="w-48 h-48 mb-margin-md rounded-full overflow-hidden flex items-center justify-center bg-surface-container-low">
            <img src={EMPTY_MAILBOX_URL} alt="빈 우편함" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-margin-xs">
            지금은 답변할 고민이 없어요
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-margin-lg">
            잠시 후 다시 확인해보세요
          </p>
          <button
            onClick={() => router.push('/home')}
            className="bg-primary text-on-primary font-label-sm text-label-sm rounded-full px-8 py-4 min-w-[200px] hover:opacity-80 transition-opacity shadow-sm"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  /** 답변 전달 완료 */
  if (pageState === 'sent') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-margin-sm">
        <div className="w-full max-w-container-max-width mx-auto flex flex-col items-center text-center z-10">
          <div className="mb-margin-lg">
            <div className="w-48 h-48 rounded-full bg-surface-container flex items-center justify-center shadow-[0_20px_40px_rgba(147,74,46,0.08)]">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 80, fontVariationSettings: "'FILL' 0" }}>
                send
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-unit mb-margin-lg max-w-md mx-auto">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              답변이 전달됐어요
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              누군가에게 따뜻한 한마디를 보냈어요.
            </p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="bg-primary text-on-primary font-title-md text-title-md py-4 px-8 rounded-full shadow-[0_8px_20px_rgba(147,74,46,0.15)] hover:-translate-y-0.5 transition-all duration-300 min-w-[200px]"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  /** 답변 작성 화면 */
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 서브 헤더 — 메인 헤더와 동일한 max-width/padding 기준으로 정렬 */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md">
        <div className="max-w-container-max-width mx-auto px-margin-sm h-14 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>arrow_back</span>
          </button>
          <h1 className="font-title-md text-title-md text-on-surface">고민 들어주기</h1>
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow w-full max-w-container-max-width mx-auto px-margin-sm pt-[7.5rem] pb-28 flex flex-col relative z-10">
        {/* 고민 카드 */}
        <article className="w-full bg-surface-container-lowest rounded-xl p-6 md:p-8 mb-margin-md shadow-[0_4px_20px_0_rgba(147,74,46,0.04)] flex flex-col max-h-[40vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">익명의 누군가</span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface whitespace-pre-wrap leading-relaxed">
            {concern?.content}
          </p>
        </article>

        {/* 구분선 */}
        <div className="w-full flex items-center justify-center mb-margin-md opacity-30">
          <div className="h-px bg-outline-variant flex-grow" />
          <span className="material-symbols-outlined mx-4 text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <div className="h-px bg-outline-variant flex-grow" />
        </div>

        {/* 답변 작성 */}
        <section className="w-full flex-grow flex flex-col relative">
          <label className="sr-only" htmlFor="reply-content">답장 작성</label>
          <textarea
            id="reply-content"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="따뜻한 한마디를 건네보세요..."
            className="w-full flex-grow min-h-[160px] bg-transparent border-0 resize-none font-body-lg text-body-lg text-on-surface placeholder:text-outline-variant focus:ring-0 p-0 leading-relaxed outline-none"
          />
          <div className="flex justify-end mt-2">
            <span className={`font-label-sm text-label-sm ${replyContent.length >= MAX_LENGTH ? 'text-error' : 'text-on-surface-variant/50'}`}>
              {replyContent.length}/{MAX_LENGTH}
            </span>
          </div>
        </section>
      </main>

      {/* 하단 버튼 — 하단 네비 제거로 bottom-0 통일 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-surface via-surface to-transparent pt-12 pb-6">
        <div className="max-w-container-max-width mx-auto px-margin-sm">
          <button
            onClick={handleSubmitReply}
            disabled={!replyContent.trim() || submitting}
            className="w-full h-14 bg-primary text-on-primary font-title-md text-title-md rounded-full flex items-center justify-center gap-2 shadow-[0_4px_20px_0_rgba(147,74,46,0.12)] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">send</span>
            {submitting ? '전달 중...' : '전달하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
