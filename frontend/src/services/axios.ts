import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Token management
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mindchat_auth_token");
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
// Note: We don't auto-logout on 401 because it could be a specific endpoint issue
// The AuthProvider will handle session expiry properly
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Just reject the error - let individual components handle it
    // Don't force logout on 401 as it may be a specific endpoint issue
    return Promise.reject(error);
  }
);

export default api;
