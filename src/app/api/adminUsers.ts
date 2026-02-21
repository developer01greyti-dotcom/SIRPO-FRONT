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
  idOficinaZonal?: number | string;
  oficinaZonal?: string;
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
  estadoNuevo: number;
  usuarioAccion: number;
  idOficinaZonal?: number | string;
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
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items.map((item: any) => ({
    id: String(item.id ?? item.idAdmin ?? item.id_admin ?? ''),
    usuarioAD: String(item.usuarioAD ?? item.usuario ?? item.user ?? ''),
    nombreCompleto: String(item.nombreCompleto ?? item.nombre_completo ?? item.nombre ?? ''),
    email: String(item.email ?? item.correo ?? item.mail ?? ''),
    rol: String(item.rol ?? item.rolNombre ?? item.rol_nombre ?? ''),
    rolId: item.rolId ?? item.idRol ?? item.id_rol ?? '',
    estado: String(item.estado ?? item.estadoActual ?? item.estado_actual ?? ''),
    fechaCreacion: String(item.fechaCreacion ?? item.fecha_creacion ?? ''),
    ultimoAcceso: String(item.ultimoAcceso ?? item.ultimo_acceso ?? ''),
    idOficinaZonal:
      item.idOficinaZonal ?? item.id_oficina_zonal ?? item.ID_OFICINA_ZONAL ?? undefined,
    oficinaZonal:
      item.oficinaZonal ??
      item.nombreOficinaZonal ??
      item.nombre_zonal ??
      item.OFICINA_ZONAL ??
      '',
  }));
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
      estadoNuevo: payload.estadoNuevo,
      usuarioAccion: payload.usuarioAccion,
      idOficinaZonal: payload.idOficinaZonal ?? 0,
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
