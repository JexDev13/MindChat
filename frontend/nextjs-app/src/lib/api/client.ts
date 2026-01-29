import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080',
  timeout: 10000,
});

// Log the baseURL for debugging
if (typeof window !== 'undefined') {
  console.log('[API Client] Base URL:', apiClient.defaults.baseURL);
}

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  console.log('[API Client] Request:', config.method?.toUpperCase(), config.url, 'Full URL:', `${config.baseURL}${config.url}`);
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
  (response) => {
    console.log('[API Client] Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('[API Client] Error:', error.message, error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      // Token expired, attempt refresh logic here
      // For now, we just reject
    }
    return Promise.reject(error);
  }
);

export default apiClient;
