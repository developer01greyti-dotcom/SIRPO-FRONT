import { apiClient } from './client';

export interface RegisterPayload {
  tipoDocumento: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  email: string;
  password: string;
  ruc?: string;
}

export interface RegisterResponse {
  idUsuario: number;
  idPersona: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  ruc?: string;
  nacionalidad?: string;
  sexo?: string;
  estadoCivil?: string;
  tipoUsuario?: number | string;
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

export const registerPostulante = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const send = async (url: string) => {
    const response = await apiClient.post<RegisterResponse | RegisterResponse[]>(url, {
      estructura: payload,
    });
    const data = response.data;
    const normalized = Array.isArray(data) ? data[0] : data;
    const token = extractToken(response.data);
    return token ? { ...normalized, token } : normalized;
  };

  try {
    return await send('/usrpost_reg/list');
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404) {
      return await send('/usrpost_reg');
    }
    throw error;
  }
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  idUsuario: number;
  idPersona: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  ruc?: string;
  nacionalidad?: string;
  sexo?: string;
  estadoCivil?: string;
  tipoUsuario?: number | string;
  token?: string;
}

export const loginPostulante = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse | LoginResponse[]>(
    '/usrpost_login/list',
    {
    estructura: payload,
    },
  );
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  const token = extractToken(response.data);
  return token ? { ...normalized, token } : normalized;
};
