import apiClient from './client';

// ============= AUTH INTERFACES =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterPatientRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RegisterPsychologistRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string | null;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
  profileId: string | null;
  message: string | null;
  errors: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ============= AUTH SERVICE =============
export const authService = {
  // Patient login
  loginPatient: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/patient/login', data);
    return response.data;
  },

  // Psychologist login
  loginPsychologist: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/psychologist/login', data);
    return response.data;
  },

  // Patient registration
  registerPatient: async (data: RegisterPatientRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/patient/register', data);
    return response.data;
  },

  // Psychologist registration
  registerPsychologist: async (data: RegisterPsychologistRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/psychologist/register', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('authToken');
    document.cookie = 'authToken=; path=/; max-age=0';
  },
};
