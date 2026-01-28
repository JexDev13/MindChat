import apiClient from './client';

// ============= APPOINTMENTS INTERFACES =============
export interface Appointment {
  id: string;
  patientId: string;
  psychologistId: string;
  scheduledDate: string;
  durationMinutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  psychologistId: string;
  scheduledDate: string;
  durationMinutes: number;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledDate?: string;
  durationMinutes?: number;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

// ============= APPOINTMENTS SERVICE =============
export const appointmentsService = {
  // Get all appointments
  getAll: async (): Promise<Appointment[]> => {
    const response = await apiClient.get('/api/appointments');
    return response.data;
  },

  // Get appointment by ID
  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/api/appointments/${id}`);
    return response.data;
  },

  // Get appointments by patient
  getByPatient: async (patientId: string): Promise<Appointment[]> => {
    const response = await apiClient.get(`/api/appointments/patient/${patientId}`);
    return response.data;
  },

  // Get appointments by psychologist
  getByPsychologist: async (psychologistId: string): Promise<Appointment[]> => {
    const response = await apiClient.get(`/api/appointments/psychologist/${psychologistId}`);
    return response.data;
  },

  // Get upcoming appointments
  getUpcoming: async (): Promise<Appointment[]> => {
    const response = await apiClient.get('/api/appointments/upcoming');
    return response.data;
  },

  // Create appointment
  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiClient.post('/api/appointments', data);
    return response.data;
  },

  // Update appointment
  update: async (id: string, data: UpdateAppointmentRequest): Promise<Appointment> => {
    const response = await apiClient.put(`/api/appointments/${id}`, data);
    return response.data;
  },

  // Update appointment status
  updateStatus: async (id: string, data: UpdateAppointmentStatusRequest): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/appointments/${id}/status`, data);
    return response.data;
  },

  // Cancel appointment
  cancel: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/appointments/${id}/cancel`);
  },

  // Delete appointment
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/appointments/${id}`);
  },
};
