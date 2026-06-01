import { NextRequest, NextResponse } from 'next/server';

/**
 * refreshToken을 httpOnly 쿠키로 설정한다.
 * 클라이언트 JS는 httpOnly 쿠키를 직접 설정할 수 없으므로 이 Route Handler를 경유한다.
 */
export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json();

  const response = NextResponse.json({ ok: true });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7일 (서버와 동일)
    path: '/',
  });

  return response;
}
