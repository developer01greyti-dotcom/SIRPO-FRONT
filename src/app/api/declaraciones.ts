import { apiClient } from './client';

export interface DeclaracionTipo {
  idDeclaracionTipo: number;
  nombre: string;
  descripcion: string;
}

const normalizeDeclaracionTipo = (raw: any): DeclaracionTipo | null => {
  if (!raw) return null;
  const id = Number(raw.idDeclaracionTipo ?? raw.id_declaracion_tipo ?? raw.id ?? 0);
  const nombre = String(raw.nombre ?? raw.titulo ?? raw.descripcion ?? '').trim();
  const descripcion = String(raw.descripcion ?? raw.detalle ?? '').trim();
  if (!id) return null;
  return { idDeclaracionTipo: id, nombre, descripcion };
};

export const fetchDeclaracionTipos = async (): Promise<DeclaracionTipo[]> => {
  const response = await apiClient.post<any[] | any>('/declaracion_tipo/list', {
    estructura: {},
  });
  const data = response.data;
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items
    .map(normalizeDeclaracionTipo)
    .filter((item): item is DeclaracionTipo => Boolean(item));
};

export const updateDeclaracionTipo = async (
  payload: {
    idDeclaracionTipo: number;
    nombre: string;
    descripcion: string;
    usuarioAccion: number;
  },
): Promise<boolean> => {
  const response = await apiClient.put<boolean>('/declaracion_tipo/update', {
    estructura: payload,
  });
  return Boolean(response.data);
};
