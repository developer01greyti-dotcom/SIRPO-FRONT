import { apiClient } from './client';

export interface ConocimientoItem {
  idConocimiento: number;
  nombre: string;
  estado?: string;
}

const normalizeConocimiento = (raw: any): ConocimientoItem | null => {
  if (!raw) return null;
  const id = Number(
    raw.idConocimiento ??
      raw.id_conocimiento ??
      raw.id ??
      raw.ID_CONOCIMIENTO ??
      raw.ID ??
      0,
  );
  const nombre = String(
    raw.nombre ??
      raw.descripcion ??
      raw.NOMBRE ??
      raw.DESCRIPCION ??
      raw.descripcion ??
      '',
  ).trim();
  if (!id || !nombre) return null;
  return {
    idConocimiento: id,
    nombre,
    estado: String(raw.estado ?? raw.ESTADO ?? '').trim() || undefined,
  };
};

export const fetchConocimientosList = async (
  filters: { nombre?: string; estado?: string } = {},
): Promise<ConocimientoItem[]> => {
  const response = await apiClient.post<any[] | any>('/conocimiento/list', {
    estructura: {
      nombre: filters.nombre?.trim() ?? '',
      estado: filters.estado?.trim() ?? '',
    },
  });
  const data = response.data;
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items
    .map(normalizeConocimiento)
    .filter((item): item is ConocimientoItem => Boolean(item));
};

export const fetchConocimientosDropdown = async (): Promise<ConocimientoItem[]> => {
  const response = await apiClient.get<any[] | any>('/conocimiento/dropdown');
  const data = response.data;
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items
    .map(normalizeConocimiento)
    .filter((item): item is ConocimientoItem => Boolean(item));
};

export const upsertConocimiento = async (
  payload: {
    idConocimiento: number;
    nombre: string;
    estado?: string;
  },
): Promise<number> => {
  const response = await apiClient.post<any>('/conocimiento_upsert/list', {
    estructura: {
      idConocimiento: Number(payload.idConocimiento || 0),
      nombre: payload.nombre,
      estado: payload.estado ?? 'ACTIVO',
    },
  });
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  const id =
    normalized?.idConocimiento ??
    normalized?.id_conocimiento ??
    normalized?.id ??
    normalized?.ID_CONOCIMIENTO ??
    normalized?.ID ??
    0;
  return Number(id) || 0;
};

export const deleteConocimiento = async (
  idConocimiento: number,
  fisico = 0,
): Promise<boolean> => {
  const response = await apiClient.delete<boolean>('/conocimiento', {
    data: {
      estructura: {
        idConocimiento,
        fisico,
      },
    },
  });
  return Boolean(response.data);
};
