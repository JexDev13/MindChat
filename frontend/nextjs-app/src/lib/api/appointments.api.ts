import apiClient from './client';

export interface Appointment {
  id: string;
  patientId: string;
  psychologistId: string;
  scheduledAt: string;
  notes?: string;
  isCancelled: boolean;
}

export interface CreateAppointmentRequest {
  psychologistId: string;
  patientId: string;
  scheduledAt: string;
  notes?: string;
}

export const appointmentsApi = {
  create: (data: CreateAppointmentRequest) =>
    apiClient.post('/api/appointments', data),

  getAll: () =>
    apiClient.get('/api/appointments'),

  getByPatient: (patientId: string) =>
    apiClient.get(`/api/appointments/patient/${patientId}`),

  getByPsychologist: (psychologistId: string) =>
    apiClient.get(`/api/appointments/psychologist/${psychologistId}`),
};
