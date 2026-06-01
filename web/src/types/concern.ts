export interface ConcernResponse {
  id: number;
  nickname: string;
  content: string;
  createdAt: string;
}

export interface ConcernCreateRequest {
  content: string;
}
