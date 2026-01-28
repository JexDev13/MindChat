import apiClient from './client';

// ============= SESSION REQUESTS INTERFACES =============
export interface SessionRequest {
  id: string;
  patientId: string;
  assignedPsychologistId?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  initialMessage: string;
  createdAt: string;
}

export interface CreateSessionRequestRequest {
  patientId: string;
  initialMessage: string;
}

export interface AssignPsychologistRequest {
  psychologistId: string;
}

export interface UpdateSessionRequestStatusRequest {
  status: 'Pending' | 'Accepted' | 'Rejected';
}

// ============= CHATS INTERFACES =============
export interface Chat {
  id: string;
  sessionRequestId: string;
  isClosed: boolean;
  createdAt: string;
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}

export interface CreateChatRequest {
  sessionRequestId: string;
}

// ============= CHAT MESSAGES INTERFACES =============
export interface ChatMessage {
  id: string;
  chatId: string;
  senderUserId: string;
  message: string;
  sentAt: string;
}

export interface SendMessageRequest {
  chatId: string;
  senderUserId: string;
  message: string;
}

// ============= SESSION REQUESTS SERVICE (REST) =============
export const sessionRequestsService = {
  // Get all session requests
  getAll: async (): Promise<SessionRequest[]> => {
    const response = await apiClient.get('/api/session-requests');
    return response.data;
  },

  // Get pending session requests
  getPending: async (): Promise<SessionRequest[]> => {
    const response = await apiClient.get('/api/session-requests/pending');
    return response.data;
  },

  // Get session request by ID
  getById: async (id: string): Promise<SessionRequest> => {
    const response = await apiClient.get(`/api/session-requests/${id}`);
    return response.data;
  },

  // Get session requests by patient
  getByPatient: async (patientId: string): Promise<SessionRequest[]> => {
    const response = await apiClient.get(`/api/session-requests/patient/${patientId}`);
    return response.data;
  },

  // Get session requests by psychologist
  getByPsychologist: async (psychologistId: string): Promise<SessionRequest[]> => {
    const response = await apiClient.get(`/api/session-requests/psychologist/${psychologistId}`);
    return response.data;
  },

  // Create session request
  create: async (data: CreateSessionRequestRequest): Promise<SessionRequest> => {
    const response = await apiClient.post('/api/session-requests', data);
    return response.data;
  },

  // Assign psychologist to session request
  assignPsychologist: async (id: string, data: AssignPsychologistRequest): Promise<SessionRequest> => {
    const response = await apiClient.put(`/api/session-requests/${id}/assign-psychologist`, data);
    return response.data;
  },

  // Update session request status
  updateStatus: async (id: string, data: UpdateSessionRequestStatusRequest): Promise<SessionRequest> => {
    const response = await apiClient.patch(`/api/session-requests/${id}/status`, data);
    return response.data;
  },

  // Delete session request
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/session-requests/${id}`);
  },
};

// ============= CHATS SERVICE (REST) =============
export const chatsService = {
  // Get chat by ID
  getById: async (id: string): Promise<Chat> => {
    const response = await apiClient.get(`/api/chats/${id}`);
    return response.data;
  },

  // Get chat with all messages
  getWithMessages: async (id: string): Promise<ChatWithMessages> => {
    const response = await apiClient.get(`/api/chats/${id}/with-messages`);
    return response.data;
  },

  // Get chat by session request
  getBySessionRequest: async (sessionRequestId: string): Promise<Chat> => {
    const response = await apiClient.get(`/api/chats/session-request/${sessionRequestId}`);
    return response.data;
  },

  // Create chat
  create: async (data: CreateChatRequest): Promise<Chat> => {
    const response = await apiClient.post('/api/chats', data);
    return response.data;
  },

  // Close chat
  close: async (id: string): Promise<Chat> => {
    const response = await apiClient.patch(`/api/chats/${id}/close`);
    return response.data;
  },

  // Delete chat
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/chats/${id}`);
  },
};

// ============= MESSAGES SERVICE (REST) =============
export const messagesService = {
  // Get messages by chat
  getByChatId: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/api/messages/chat/${chatId}`);
    return response.data;
  },

  // Send message (usar SignalR en su lugar para tiempo real)
  send: async (data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post('/api/messages', data);
    return response.data;
  },

  // Delete message
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/messages/${id}`);
  },
};
