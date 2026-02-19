import { apiClient } from './client';

export interface ConvocatoriaConocimientoItem {
  idConvocatoriaConocimiento: number;
  idConvocatoria: number;
  idConocimiento: number;
  conocimiento?: string;
  estado?: string;
}

const normalizeConvConocimiento = (raw: any): ConvocatoriaConocimientoItem | null => {
  if (!raw) return null;
  const id = Number(
    raw.idConvocatoriaConocimiento ??
      raw.id_convocatoria_conocimiento ??
      raw.ID_CONVOCATORIA_CONOCIMIENTO ??
      raw.ID_CONVOCATORIA_CONOC ??
      raw.id ??
      0,
  );
  const idConvocatoria = Number(
    raw.idConvocatoria ?? raw.id_convocatoria ?? raw.ID_CONVOCATORIA ?? 0,
  );
  const idConocimiento = Number(
    raw.idConocimiento ?? raw.id_conocimiento ?? raw.ID_CONOCIMIENTO ?? 0,
  );
  if (!idConvocatoria || !idConocimiento) return null;
  return {
    idConvocatoriaConocimiento: id || 0,
    idConvocatoria,
    idConocimiento,
    conocimiento:
      String(raw.conocimiento ?? raw.CONOCIMIENTO ?? raw.nombre ?? raw.NOMBRE ?? '').trim() ||
      undefined,
    estado: String(raw.estado ?? raw.ESTADO ?? '').trim() || undefined,
  };
};

export const fetchConvocatoriaConocimientos = async (
  idConvocatoria: number,
  soloActivos = true,
): Promise<ConvocatoriaConocimientoItem[]> => {
  if (!Number.isFinite(idConvocatoria) || idConvocatoria <= 0) {
    return [];
  }
  const response = await apiClient.post<any[] | any>('/conv_conoc/list', {
    estructura: {
      idConvocatoria,
      soloActivos: soloActivos ? 1 : 0,
    },
  });
  const data = response.data;
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items
    .map(normalizeConvConocimiento)
    .filter((item): item is ConvocatoriaConocimientoItem => Boolean(item));
};

export const setConvocatoriaConocimientos = async (
  idConvocatoria: number,
  idsConocimiento: number[],
  usuarioAccion: number,
): Promise<boolean> => {
  const idsCsv = idsConocimiento.filter(Boolean).join(',');
  const response = await apiClient.put<boolean>('/conv_conoc_set/update', {
    estructura: {
      idConvocatoria,
      idsCsv,
      usuarioAccion,
    },
  });
  return Boolean(response.data);
};
