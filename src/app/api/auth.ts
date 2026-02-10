import { apiClient } from './client';

export interface RegisterPayload {
  tipoDocumento: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  email: string;
  password: string;
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
}

export const registerPostulante = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const send = async (url: string) => {
    const response = await apiClient.post<RegisterResponse | RegisterResponse[]>(url, {
      estructura: payload,
    });
    const data = response.data;
    return Array.isArray(data) ? data[0] : data;
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
  return Array.isArray(data) ? data[0] : data;
};
