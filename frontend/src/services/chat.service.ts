import api from "./axios";
import {
  SessionRequest,
  CreateSessionRequestRequest,
  UpdateSessionStatusRequest,
  Chat,
  ChatDetail,
  ChatMessage,
  SendMessageRequest,
} from "@/types";

// Session Request Endpoints
const SESSION_REQUEST_ENDPOINTS = {
  GET_ALL: "/api/session-requests",
  GET_BY_ID: (id: string) => `/api/session-requests/${id}`,
  GET_BY_PATIENT: (patientId: string) =>
    `/api/session-requests/patient/${patientId}`,
  GET_BY_PSYCHOLOGIST: (psychologistId: string) =>
    `/api/session-requests/psychologist/${psychologistId}`,
  GET_PENDING: "/api/session-requests/pending",
  CREATE: "/api/session-requests",
  UPDATE_STATUS: (id: string) => `/api/session-requests/${id}/status`,
  ASSIGN: (id: string) => `/api/session-requests/${id}/assign`,
};

// Chat Endpoints
const CHAT_ENDPOINTS = {
  GET_ALL: "/api/chats",
  GET_BY_ID: (id: string) => `/api/chats/${id}`,
  GET_BY_USER: (userId: string) => `/api/chats/user/${userId}`,
  CREATE: "/api/chats",
  CLOSE: (id: string) => `/api/chats/${id}/close`,
};

// Message Endpoints
const MESSAGE_ENDPOINTS = {
  GET_BY_CHAT: (chatId: string) => `/api/messages/chat/${chatId}`,
  SEND: "/api/messages",
};

export const chatService = {
  // Session Requests
  async getAllSessionRequests(): Promise<SessionRequest[]> {
    const response = await api.get<SessionRequest[]>(
      SESSION_REQUEST_ENDPOINTS.GET_ALL
    );
    return response.data;
  },

  async getSessionRequestById(id: string): Promise<SessionRequest> {
    const response = await api.get<SessionRequest>(
      SESSION_REQUEST_ENDPOINTS.GET_BY_ID(id)
    );
    return response.data;
  },

  async getSessionRequestsByPatient(patientId: string): Promise<SessionRequest[]> {
    const response = await api.get<SessionRequest[]>(
      SESSION_REQUEST_ENDPOINTS.GET_BY_PATIENT(patientId)
    );
    return response.data;
  },

  async getSessionRequestsByPsychologist(
    psychologistId: string
  ): Promise<SessionRequest[]> {
    const response = await api.get<SessionRequest[]>(
      SESSION_REQUEST_ENDPOINTS.GET_BY_PSYCHOLOGIST(psychologistId)
    );
    return response.data;
  },

  async getPendingSessionRequests(): Promise<SessionRequest[]> {
    const response = await api.get<SessionRequest[]>(
      SESSION_REQUEST_ENDPOINTS.GET_PENDING
    );
    return response.data;
  },

  async createSessionRequest(
    data: CreateSessionRequestRequest
  ): Promise<SessionRequest> {
    const response = await api.post<SessionRequest>(
      SESSION_REQUEST_ENDPOINTS.CREATE,
      data
    );
    return response.data;
  },

  async updateSessionStatus(
    id: string,
    data: UpdateSessionStatusRequest
  ): Promise<SessionRequest> {
    const response = await api.patch<SessionRequest>(
      SESSION_REQUEST_ENDPOINTS.UPDATE_STATUS(id),
      data
    );
    return response.data;
  },

  async assignPsychologist(
    sessionRequestId: string,
    psychologistId: string
  ): Promise<SessionRequest> {
    const response = await api.patch<SessionRequest>(
      SESSION_REQUEST_ENDPOINTS.ASSIGN(sessionRequestId),
      { psychologistId }
    );
    return response.data;
  },

  // Chats
  async getAllChats(): Promise<Chat[]> {
    const response = await api.get<Chat[]>(CHAT_ENDPOINTS.GET_ALL);
    return response.data;
  },

  async getChatById(id: string): Promise<ChatDetail> {
    const response = await api.get<ChatDetail>(CHAT_ENDPOINTS.GET_BY_ID(id));
    return response.data;
  },

  async getChatsByUser(userId: string): Promise<Chat[]> {
    const response = await api.get<Chat[]>(CHAT_ENDPOINTS.GET_BY_USER(userId));
    return response.data;
  },

  async createChat(sessionRequestId: string): Promise<Chat> {
    const response = await api.post<Chat>(CHAT_ENDPOINTS.CREATE, {
      sessionRequestId,
    });
    return response.data;
  },

  async closeChat(id: string): Promise<Chat> {
    const response = await api.patch<Chat>(CHAT_ENDPOINTS.CLOSE(id));
    return response.data;
  },

  // Messages
  async getMessagesByChat(chatId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(
      MESSAGE_ENDPOINTS.GET_BY_CHAT(chatId)
    );
    return response.data;
  },

  async sendMessage(data: SendMessageRequest): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>(MESSAGE_ENDPOINTS.SEND, data);
    return response.data;
  },
};

export default chatService;
