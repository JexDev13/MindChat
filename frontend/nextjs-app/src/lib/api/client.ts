import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
  timeout: 10000,
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, attempt refresh logic here
      // For now, we just reject
    }
    return Promise.reject(error);
  }
);

export default apiClient;
