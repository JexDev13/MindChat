import apiClient from './client';

// ============= PATIENT INTERFACES =============
export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
}

export interface CreatePatientRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}

// ============= PSYCHOLOGIST INTERFACES =============
export interface PsychologistProfile {
  profileId: string;
  userId: string;
  professionalLicense?: string;
  university?: string;
  graduationDate?: string;
  bio?: string;
  isVerified: boolean;
  isProfileVisible: boolean;
  tags: string[];
  firstName?: string;
  lastName?: string;
  specialization?: string;
  profileImageUrl?: string;
}

export interface CreatePsychologistRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  tags?: string[];
}

export interface UpdatePsychologistRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  tags?: string[];
  isVisible?: boolean;
  profileImageUrl?: string;
}

// ============= PATIENTS SERVICE =============
export const patientsService = {
  // Create patient profile
  create: async (data: CreatePatientRequest): Promise<PatientProfile> => {
    const response = await apiClient.post('/api/clinical/patients', data);
    return response.data;
  },

  // Get patient by user ID
  getByUserId: async (userId: string): Promise<PatientProfile> => {
    const response = await apiClient.get(`/api/clinical/patients/user/${userId}`);
    return response.data;
  },

  // Get patient by profile ID
  getById: async (profileId: string): Promise<PatientProfile> => {
    const response = await apiClient.get(`/api/clinical/patients/${profileId}`);
    return response.data;
  },

  // Update patient profile
  update: async (userId: string, data: UpdatePatientRequest): Promise<PatientProfile> => {
    const response = await apiClient.put(`/api/clinical/patients/user/${userId}`, data);
    return response.data;
  },

  // Delete patient profile
  delete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/clinical/patients/user/${userId}`);
  },
};

// ============= PSYCHOLOGISTS SERVICE =============
export const psychologistsService = {
  // Create psychologist profile
  create: async (data: CreatePsychologistRequest): Promise<PsychologistProfile> => {
    const response = await apiClient.post('/api/clinical/psychologists', data);
    return response.data;
  },

  // Get all visible psychologists (for recommendations)
  getAll: async (): Promise<PsychologistProfile[]> => {
    const response = await apiClient.get('/api/clinical/psychologists');
    return response.data;
  },

  // Get psychologist by user ID
  getByUserId: async (userId: string): Promise<PsychologistProfile> => {
    const response = await apiClient.get(`/api/clinical/psychologists/user/${userId}`);
    return response.data;
  },

  // Get psychologist by profile ID
  getById: async (profileId: string): Promise<PsychologistProfile> => {
    const response = await apiClient.get(`/api/clinical/psychologists/${profileId}`);
    return response.data;
  },

  // Search psychologists by tags
  searchByTags: async (tags: string[]): Promise<PsychologistProfile[]> => {
    const params = new URLSearchParams();
    tags.forEach(tag => params.append('tags', tag));
    const response = await apiClient.get(`/api/clinical/psychologists/search/tags?${params.toString()}`);
    return response.data;
  },

  // Update psychologist profile
  update: async (userId: string, data: UpdatePsychologistRequest): Promise<PsychologistProfile> => {
    const response = await apiClient.put(`/api/clinical/psychologists/user/${userId}`, data);
    return response.data;
  },

  // Delete psychologist profile
  delete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/clinical/psychologists/user/${userId}`);
  },
};
