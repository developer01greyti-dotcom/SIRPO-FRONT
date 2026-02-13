import axios from 'axios';
import { toast } from 'sonner';

const baseURL =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
  'http://localhost:8087/sirpo/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
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
    config.headers['X-Auth-Token'] = token;
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

const isPublicRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname || '';
  return (
    path.endsWith('/login') ||
    path.endsWith('/registroUsuario') ||
    path.endsWith('/recuperarContrasena') ||
    path.endsWith('/admin/login')
  );
};

const getBasePath = () => {
  const base = (import.meta as { env?: { BASE_URL?: string } })?.env?.BASE_URL || '/';
  if (!base.endsWith('/')) return `${base}/`;
  return base;
};

const resolveWithBase = (path: string) => {
  const base = getBasePath();
  if (path.startsWith('/')) return `${base}${path.replace(/^\//, '')}`;
  return `${base}${path}`;
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  const userType =
    localStorage.getItem('sirpo.userType') || sessionStorage.getItem('sirpo.userType') || '';
  const isAdminPath = window.location.pathname.includes('/admin');
  const target = resolveWithBase(
    userType === 'admin' || isAdminPath ? 'admin/login' : 'login',
  );
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
    if (status === 401 && !isAuthEndpoint(url) && !isPublicRoute()) {
      markSessionExpired();
      toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
      clearStoredAuth();
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);
