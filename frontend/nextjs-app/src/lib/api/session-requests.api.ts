import apiClient from './client';

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

export const sessionRequestsApi = {
  create: (data: CreateSessionRequestRequest) =>
    apiClient.post('/api/session-requests', data),

  getAll: () =>
    apiClient.get('/api/session-requests'),

  getPending: () =>
    apiClient.get('/api/session-requests/pending'),

  getByPatient: (patientId: string) =>
    apiClient.get(`/api/session-requests/patient/${patientId}`),

  getByPsychologist: (psychologistId: string) =>
    apiClient.get(`/api/session-requests/psychologist/${psychologistId}`),

  assignPsychologist: (id: string, data: AssignPsychologistRequest) =>
    apiClient.put(`/api/session-requests/${id}/assign-psychologist`, data),

  updateStatus: (id: string, data: UpdateSessionRequestStatusRequest) =>
    apiClient.patch(`/api/session-requests/${id}/status`, data),
};
