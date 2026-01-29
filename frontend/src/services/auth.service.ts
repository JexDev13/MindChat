import api from "./axios";
import { AxiosError } from "axios";
import {
  LoginRequest,
  RegisterPatientRequest,
  RegisterPsychologistRequest,
  AuthResponse,
} from "@/types";

const AUTH_ENDPOINTS = {
  PATIENT_LOGIN: "/api/auth/patient/login",
  PATIENT_REGISTER: "/api/auth/patient/register",
  PSYCHOLOGIST_LOGIN: "/api/auth/psychologist/login",
  PSYCHOLOGIST_REGISTER: "/api/auth/psychologist/register",
};

// Helper to extract AuthResponse from error
const handleAuthError = (error: unknown): AuthResponse => {
  if (error instanceof AxiosError && error.response?.data) {
    // Backend returns AuthResponse format on 400 errors
    return error.response.data as AuthResponse;
  }
  return {
    success: false,
    errors: ["Error de conexión. Por favor, intenta de nuevo."],
  };
};

export const authService = {
  // Login methods
  async loginPatient(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ENDPOINTS.PATIENT_LOGIN,
        data
      );
      return response.data;
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async loginPsychologist(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ENDPOINTS.PSYCHOLOGIST_LOGIN,
        data
      );
      return response.data;
    } catch (error) {
      return handleAuthError(error);
    }
  },

  // Generic login - tries both endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Try patient login first
    const patientResponse = await this.loginPatient(data);
    if (patientResponse.success) {
      return patientResponse;
    }

    // Try psychologist login if patient fails
    const psychologistResponse = await this.loginPsychologist(data);
    return psychologistResponse;
  },

  // Registration methods
  async registerPatient(
    data: RegisterPatientRequest
  ): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ENDPOINTS.PATIENT_REGISTER,
        data
      );
      return response.data;
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async registerPsychologist(
    data: RegisterPsychologistRequest
  ): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ENDPOINTS.PSYCHOLOGIST_REGISTER,
        data
      );
      return response.data;
    } catch (error) {
      return handleAuthError(error);
    }
  },
};

export default authService;
