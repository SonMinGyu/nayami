import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/home', '/post', '/reply'];
const AUTH_PATHS = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // 인증이 필요한 페이지인데 refreshToken 없음 → 랜딩으로 리다이렉트
  if (isProtected && !refreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 이미 로그인된 상태에서 인증 페이지 접근 → 홈으로 리다이렉트
  if (isAuthPage && refreshToken) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // 루트(/) 접근 시 로그인 상태이면 홈으로 리다이렉트
  if (pathname === '/' && refreshToken) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
