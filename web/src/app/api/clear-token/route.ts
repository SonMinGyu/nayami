import { NextResponse } from 'next/server';

/**
 * refreshToken 쿠키를 삭제한다. (로그아웃 시 호출)
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('refreshToken');
  return response;
}
