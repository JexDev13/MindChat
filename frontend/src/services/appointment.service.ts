import api from "./axios";
import {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "@/types";

const APPOINTMENT_ENDPOINTS = {
  GET_ALL: "/api/appointments",
  GET_BY_ID: (id: string) => `/api/appointments/${id}`,
  GET_BY_PSYCHOLOGIST: (psychologistId: string) =>
    `/api/appointments/psychologist/${psychologistId}`,
  GET_BY_PATIENT: (patientId: string) =>
    `/api/appointments/patient/${patientId}`,
  CREATE: "/api/appointments",
  UPDATE: (id: string) => `/api/appointments/${id}`,
  CANCEL: (id: string) => `/api/appointments/${id}/cancel`,
  DELETE: (id: string) => `/api/appointments/${id}`,
};

export const appointmentService = {
  // Get appointments
  async getAll(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>(APPOINTMENT_ENDPOINTS.GET_ALL);
    return response.data;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(
      APPOINTMENT_ENDPOINTS.GET_BY_ID(id)
    );
    return response.data;
  },

  async getByPsychologist(psychologistId: string): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>(
      APPOINTMENT_ENDPOINTS.GET_BY_PSYCHOLOGIST(psychologistId)
    );
    return response.data;
  },

  async getByPatient(patientId: string): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>(
      APPOINTMENT_ENDPOINTS.GET_BY_PATIENT(patientId)
    );
    return response.data;
  },

  // Create appointment
  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>(
      APPOINTMENT_ENDPOINTS.CREATE,
      data
    );
    return response.data;
  },

  // Update appointment
  async update(id: string, data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await api.put<Appointment>(
      APPOINTMENT_ENDPOINTS.UPDATE(id),
      data
    );
    return response.data;
  },

  // Cancel appointment
  async cancel(id: string): Promise<Appointment> {
    const response = await api.patch<Appointment>(
      APPOINTMENT_ENDPOINTS.CANCEL(id)
    );
    return response.data;
  },

  // Delete appointment
  async delete(id: string): Promise<void> {
    await api.delete(APPOINTMENT_ENDPOINTS.DELETE(id));
  },
};

export default appointmentService;
