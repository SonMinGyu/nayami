import { NextRequest, NextResponse } from 'next/server';

/**
 * refreshToken 쿠키를 읽어 core-service에 토큰 갱신을 요청하고 새 accessToken을 반환한다.
 * 클라이언트가 refreshToken 값을 직접 다루지 않아도 되도록 프록시 역할을 한다.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: '인증 정보가 없습니다.' }, { status: 401 });
  }

  try {
    const coreServiceUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
    const res = await fetch(`${coreServiceUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: '토큰 갱신 실패' }, { status: 401 });
    }

    const data: { accessToken: string; refreshToken: string } = await res.json();

    // refresh 성공 시 새 refreshToken도 쿠키에 업데이트
    const response = NextResponse.json({ accessToken: data.accessToken });
    response.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
