'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/lib/api/auth';
import { WatercolorBackground } from '@/components/WatercolorBackground';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  /** 로그아웃 후 쿠키를 삭제하고 랜딩으로 이동한다. */
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 서버 오류가 있어도 클라이언트 측 로그아웃은 진행
    } finally {
      await fetch('/api/clear-token', { method: 'POST' });
      clearAuth();
      router.push('/');
    }
  };

  return (
    // bg-background 제거 → 워터컬러 배경이 보이도록
    <div className="min-h-screen">
      <WatercolorBackground opacity={0.35} />

      {/* 상단 헤더 */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md">
        <div className="max-w-container-max-width mx-auto px-margin-sm h-16 flex justify-between items-center">
          <div className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight">
            나야미
          </div>

          {/* 계정 버튼 → 드롭다운 메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="계정 메뉴"
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                account_circle
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-error focus:text-error"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">logout</span>
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 페이지 콘텐츠 */}
      <main className="pt-16 min-h-screen">{children}</main>
    </div>
  );
}
