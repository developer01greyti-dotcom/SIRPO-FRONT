import axios from 'axios';

const baseURL =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
  'http://localhost:8087/sirpo/v1';

export const apiClient = axios.create({
  baseURL,
});

const getStoredAuthToken = () => {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('sirpo.authToken') ||
    sessionStorage.getItem('sirpo.authToken') ||
    ''
  );
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
