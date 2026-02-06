import axios from 'axios';

const baseURL =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
  'http://localhost:8087/sirpo/v1';

export const apiClient = axios.create({
  baseURL,
});
