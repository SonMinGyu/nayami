import apiClient from './client';
import type { ReplyCreateRequest, ReplyResponse } from '@/types/reply';

/** 특정 고민에 대한 답변을 등록한다. 등록 후 AI 유해성 검사가 비동기로 진행된다. */
export const postReply = async (
  concernId: number,
  data: ReplyCreateRequest
): Promise<ReplyResponse> => {
  const res = await apiClient.post<ReplyResponse>(
    `/api/concerns/${concernId}/replies`,
    data
  );
  return res.data;
};
