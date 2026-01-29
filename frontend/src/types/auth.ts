// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  profilePictureUrl?: string;
  role: "Patient" | "Psychologist";
  profileId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth Requests/Responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterPatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterPsychologistRequest {
  firstName: string;
  lastName: string;
  email: string;
  professionalLicense: string;
  university: string;
  graduationDate: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  userId?: string;
  email?: string;
  fullName?: string;
  role?: string;
  profileId?: string;
  errors: string[];
}

// JWT Token Payload
export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  profileId?: string;
  exp: number;
  iss: string;
  aud: string;
}
