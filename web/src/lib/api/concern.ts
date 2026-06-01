import apiClient from './client';
import type { ConcernCreateRequest, ConcernResponse } from '@/types/concern';

/** 새 고민을 등록한다. 등록 후 AI 유해성 검사가 비동기로 진행된다. */
export const postConcern = async (data: ConcernCreateRequest): Promise<ConcernResponse> => {
  const res = await apiClient.post<ConcernResponse>('/api/concerns', data);
  return res.data;
};

/**
 * 답변하지 않은 랜덤 고민 하나를 조회한다.
 * 답변할 고민이 없으면 null을 반환한다. (서버 204 응답)
 */
export const getRandomConcern = async (): Promise<ConcernResponse | null> => {
  const res = await apiClient.get<ConcernResponse>('/api/concerns/random', {
    validateStatus: (status) => status === 200 || status === 204,
  });
  return res.status === 204 ? null : res.data;
};
