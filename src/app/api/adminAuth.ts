import axios from 'axios';
import { apiClient } from './client';

export interface AdminLoginResponse {
  idAdmin: number;
  usuario: string;
  nombreCompleto: string;
  rol: string;
  rolId: number;
  email: string;
  token?: string;
}

const extractToken = (raw: any): string => {
  if (!raw || typeof raw !== 'object') return '';
  const candidates = [raw, raw?.data, raw?.resultado, raw?.result];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const token =
      candidate.token ||
      candidate.accessToken ||
      candidate.jwt ||
      candidate.bearer ||
      candidate.bearerToken ||
      candidate.token_access ||
      candidate.tokenAccess;
    if (typeof token === 'string' && token.trim()) {
      return token.trim();
    }
  }
  return '';
};

const normalizeAdminResponse = (raw: any): AdminLoginResponse | null => {
  if (!raw) return null;
  const idAdmin = Number(
    raw.idAdmin ??
      raw.id_admin ??
      raw.idUsuario ??
      raw.id_usuario ??
      raw.idAdminUsuario ??
      raw.id ??
      0,
  );
  if (!idAdmin) return null;
  return {
    idAdmin,
    usuario: String(raw.usuario ?? raw.username ?? raw.user ?? ''),
    nombreCompleto: String(raw.nombreCompleto ?? raw.nombre_completo ?? raw.nombre ?? ''),
    rol: String(raw.rol ?? raw.rolNombre ?? raw.rol_nombre ?? raw.rolDesc ?? raw.rol_desc ?? ''),
    rolId: Number(raw.rolId ?? raw.idRol ?? raw.id_rol ?? 0),
    email: String(raw.email ?? raw.correo ?? raw.mail ?? ''),
  };
};

export const loginAdmin = async (
  usuario: string,
  password: string,
): Promise<AdminLoginResponse | null> => {
  const endpoints = ['/admLogin/list', '/adm_login/list', '/admLogin', '/adm_login'];
  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.post<AdminLoginResponse | AdminLoginResponse[]>(
        endpoint,
        {
          estructura: {
            usuario,
            password,
          },
        },
      );
      const data = response.data;
      const normalized = Array.isArray(data) ? data[0] : data;
      const parsed = normalizeAdminResponse(normalized);
      if (parsed) {
        const token = extractToken(response.data);
        return token ? { ...parsed, token } : parsed;
      }
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400 || status === 401 || status === 404) {
          continue;
        }
      }
      throw error;
    }
  }
  return null;
};
