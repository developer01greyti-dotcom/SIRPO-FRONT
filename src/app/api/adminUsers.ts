import { apiClient } from './client';

export interface AdminUserListItem {
  id: string;
  usuarioAD: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  rolId: string | number;
  estado: string;
  fechaCreacion: string;
  ultimoAcceso: string;
}

export interface AdminUserListFilters {
  usuario?: string;
  email?: string;
  rol?: string;
  estado?: string;
}

export interface AdminUserUpsertPayload {
  idAdmin: number;
  usuario: string;
  nombreCompleto: string;
  email: string;
  idAdminRol: number;
  estado: string;
  usuarioAccion: number;
}

export interface AdminUserStatusPayload {
  idAdmin: number;
  estado: number;
  usuarioAccion: number;
}

export const fetchAdminUsers = async (
  filters: AdminUserListFilters = {},
): Promise<AdminUserListItem[]> => {
  const response = await apiClient.post<AdminUserListItem[] | AdminUserListItem>(
    '/adminusr/list',
    {
      estructura: {
        usuario: filters.usuario ?? '',
        email: filters.email ?? '',
        rol: filters.rol ?? '',
        estado: filters.estado ?? '',
      },
    },
  );
  const data = response.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const upsertAdminUser = async (
  payload: AdminUserUpsertPayload,
): Promise<boolean> => {
  const response = await apiClient.put<boolean>('/adminUsr', {
    estructura: {
      idAdmin: payload.idAdmin,
      usuario: payload.usuario,
      nombreCompleto: payload.nombreCompleto,
      email: payload.email,
      idAdminRol: payload.idAdminRol,
      estado: payload.estado,
      usuarioAccion: payload.usuarioAccion,
    },
  });
  return Boolean(response.data);
};

export const updateAdminUserStatus = async (
  payload: AdminUserStatusPayload,
): Promise<boolean> => {
  const response = await apiClient.put<boolean>('/adminusr_estado', {
    estructura: {
      idAdmin: payload.idAdmin,
      estado: payload.estado,
      usuarioAccion: payload.usuarioAccion,
    },
  });
  return Boolean(response.data);
};
