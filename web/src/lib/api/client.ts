import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10_000,
});

/** 동시 401 응답 발생 시 refresh 호출을 1번으로 제한하는 상태 변수들 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** 대기 중이던 요청들에게 새 토큰을 전달하거나 에러를 전파한다. */
const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

/** Zustand에서 accessToken을 읽어 Authorization 헤더에 자동 첨부한다. */
apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * 401 응답 수신 시 refreshToken 쿠키로 토큰을 자동 갱신하고 원본 요청을 재시도한다.
 * - 여러 요청이 동시에 401을 받으면 isRefreshing 플래그로 refresh 중복 호출을 방지한다.
 * - refresh 자체가 실패하면 로그아웃 후 랜딩 페이지로 리다이렉트한다.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await fetch('/api/refresh', { method: 'POST' });
        if (!response.ok) throw new Error('토큰 갱신 실패');

        const { accessToken } = await response.json();
        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
