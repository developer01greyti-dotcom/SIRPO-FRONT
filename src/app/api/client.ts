import axios from 'axios';
import { toast } from 'sonner';

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

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return (
    url.includes('/usrpost_login') ||
    url.includes('/usrpost_reg') ||
    url.includes('/admLogin') ||
    url.includes('/adm_login')
  );
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  const userType =
    localStorage.getItem('sirpo.userType') || sessionStorage.getItem('sirpo.userType') || '';
  const target = userType === 'admin' ? '/admin/login' : '/login';
  if (window.location.pathname !== target) {
    window.location.assign(target);
  }
};

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  const keys = [
    'sirpo.userType',
    'sirpo.postulanteUser',
    'sirpo.adminAuth',
    'sirpo.authToken',
    'sirpo.activeSection',
    'sirpo.activeTab',
    'sirpo.adminSection',
    'sirpo.remember',
  ];
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const markSessionExpired = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    'sirpo.toast',
    JSON.stringify({
      type: 'error',
      message: 'Tu sesión expiró. Inicia sesión nuevamente.',
    }),
  );
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url as string | undefined;
    if (status === 401 && !isAuthEndpoint(url)) {
      markSessionExpired();
      toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
      clearStoredAuth();
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);
