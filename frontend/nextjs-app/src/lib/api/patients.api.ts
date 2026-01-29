import apiClient from './client';

export interface PatientProfile {
  profileId: string;
  userId: string;
  emotionalState?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

export const patientsApi = {
  getByUserId: (userId: string) =>
    apiClient.get(`/api/patients/user/${userId}`),

  getById: (profileId: string) =>
    apiClient.get(`/api/patients/${profileId}`),
};
