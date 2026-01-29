// Session Request Types
export type SessionRequestStatus = "Pending" | "Accepted" | "Rejected";

export interface SessionRequest {
  id: string;
  patientId: string;
  assignedPsychologistId?: string;
  status: SessionRequestStatus;
  initialMessage?: string;
  createdAt: string;
  chatId?: string;
  // Extended for display
  patientName?: string;
}

export interface CreateSessionRequestRequest {
  patientId: string;
  initialMessage: string;
}

export interface AssignPsychologistRequest {
  psychologistId: string;
}

export interface UpdateSessionStatusRequest {
  status: SessionRequestStatus;
}

// Chat Types
export interface Chat {
  id: string;
  sessionRequestId: string;
  isClosed: boolean;
  createdAt: string;
  messageCount: number;
  // Extended for display
  participantName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface ChatDetail {
  id: string;
  sessionRequestId: string;
  isClosed: boolean;
  createdAt: string;
  messages: ChatMessage[];
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  chatId: string;
  senderUserId: string;
  message: string;
  sentAt: string;
  // Extended for display
  senderName?: string;
  isOwnMessage?: boolean;
}

export interface SendMessageRequest {
  chatId: string;
  senderUserId: string;
  message: string;
}

// SignalR Events
export interface SignalRMessage {
  id: string;
  chatId: string;
  senderUserId: string;
  message: string;
  sentAt: string;
}
