import apiClient from './client';

export interface Chat {
  id: string;
  sessionRequestId: string;
  isClosed: boolean;
  createdAt: string;
}

export const chatsApi = {
  getBySessionRequest: (sessionRequestId: string) =>
    apiClient.get(`/api/chats/session-request/${sessionRequestId}`),

  getById: (id: string) =>
    apiClient.get(`/api/chats/${id}`),
};
