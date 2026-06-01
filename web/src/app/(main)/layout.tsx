'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/lib/api/auth';
import { WatercolorBackground } from '@/components/WatercolorBackground';
import { toast } from 'sonner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const navItems = [
    { icon: 'home', label: 'Home', path: '/home' },
    { icon: 'edit_note', label: 'Worry', path: '/post' },
    { icon: 'person', label: 'Profile', path: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <WatercolorBackground opacity={0.2} />

      {/* 상단 헤더 */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md">
        <div className="max-w-container-max-width mx-auto px-margin-sm h-16 flex justify-between items-center">
          <div className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight">
            Nayami
          </div>
          <button
            onClick={handleLogout}
            aria-label="프로필 및 로그아웃"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
              account_circle
            </span>
          </button>
        </div>
      </header>

      {/* 페이지 콘텐츠 */}
      <main className="pt-16 pb-20 md:pb-0 min-h-screen">{children}</main>

      {/* 모바일 하단 내비게이션 */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-margin-sm pb-4 pt-2 bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_0_rgba(147,74,46,0.04)] rounded-t-2xl">
        {navItems.map((item) => {
          const isActive = item.path ? pathname === item.path : false;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.path) router.push(item.path);
                else handleLogout();
              }}
              className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 rounded-full ${
                isActive
                  ? 'bg-primary-container text-on-primary-container px-6'
                  : 'text-on-surface-variant hover:bg-surface-container-high rounded-2xl'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
