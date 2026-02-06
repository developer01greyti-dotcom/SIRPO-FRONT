import axios from 'axios';
import { apiClient } from './client';

export interface AdminLoginResponse {
  idAdmin: number;
  usuario: string;
  nombreCompleto: string;
  rol: string;
  rolId: number;
  email: string;
}

export const loginAdmin = async (
  usuario: string,
  password: string,
): Promise<AdminLoginResponse | null> => {
  try {
    const response = await apiClient.post<AdminLoginResponse | AdminLoginResponse[]>(
      '/admLogin/list',
      {
        estructura: {
          usuario,
          password,
        },
      },
    );
    const data = response.data;
    const normalized = Array.isArray(data) ? data[0] : data;
    if (!normalized || !normalized.idAdmin) {
      return null;
    }
    return normalized;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 400 || status === 404) {
        return null;
      }
    }
    throw error;
  }
};
