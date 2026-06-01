export interface ReplyResponse {
  id: number;
  concernId: number;
  nickname: string;
  content: string;
  createdAt: string;
}

export interface ReplyCreateRequest {
  content: string;
}
