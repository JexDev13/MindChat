// Appointment Types
export interface Appointment {
  id: string;
  psychologistId: string;
  patientId: string;
  scheduledAt: string;
  notes?: string;
  isCancelled: boolean;
  // Extended fields for display
  psychologistName?: string;
  patientName?: string;
}

export interface CreateAppointmentRequest {
  psychologistId: string;
  patientId: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledAt?: string;
  notes?: string;
  isCancelled?: boolean;
}
