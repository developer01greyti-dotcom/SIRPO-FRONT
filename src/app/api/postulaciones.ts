import { apiClient } from './client';

export interface PostulacionUpsertPayload {
  idPostulacion: number;
  idPersona: number;
  idConvocatoria: number;
  idHojaVida: number;
  numeroPostulacion: string;
  estado: string;
  observacion: string;
  usuarioAccion: number;
}

export interface PostulacionListItem {
  idPostulacion: number;
  idPersona: number;
  idConvocatoria: number;
  idHojaVida: number;
  numeroPostulacion?: string;
  estado: string;
  observacion?: string;
  fechaPostulacion?: string;
  idOficinaCoordinacion?: number;
  oficinaCoordinacion?: string;
  idOficinaZonal?: number;
  oficinaZonal?: string;
}

export interface PostulacionAdminListItem extends PostulacionListItem {
  convocatoria?: string;
  perfil?: string;
  postulanteNombre?: string;
  postulanteDocumento?: string;
  postulanteEmail?: string;
}

const extractNumeroPostulacion = (data: any): string => {
  const normalized = Array.isArray(data) ? data[0] : data;
  if (!normalized) return '';
  const candidates = [
    'numeroPostulacion',
    'numero_postulacion',
    'oNumeroPostulacion',
    'o_numero_postulacion',
    'oNumero',
  ];
  for (const key of candidates) {
    const value = normalized?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

export const upsertPostulacion = async (
  payload: PostulacionUpsertPayload,
): Promise<string> => {
  const response = await apiClient.post<any>('/post_upsert/list', {
    estructura: {
      idPostulacion: payload.idPostulacion,
      idPersona: payload.idPersona,
      idConvocatoria: payload.idConvocatoria,
      idHojaVida: payload.idHojaVida,
      numeroPostulacion: payload.numeroPostulacion,
      estado: payload.estado,
      observacion: payload.observacion,
      usuarioAccion: payload.usuarioAccion,
    },
  });
  return extractNumeroPostulacion(response.data);
};

export const updatePostulacion = async (
  payload: PostulacionUpsertPayload,
): Promise<boolean> => {
  const requestBody = {
    estructura: {
      idPostulacion: payload.idPostulacion,
      idPersona: payload.idPersona,
      idConvocatoria: payload.idConvocatoria,
      idHojaVida: payload.idHojaVida,
      numeroPostulacion: payload.numeroPostulacion,
      estado: payload.estado,
      observacion: payload.observacion,
      usuarioAccion: payload.usuarioAccion,
    },
  };
  try {
    const response = await apiClient.put<boolean>('/post/update', requestBody);
    return Boolean(response.data);
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 405 || status === 404) {
      try {
        const fallback = await apiClient.post<boolean>('/post/update', requestBody);
        return Boolean(fallback.data);
      } catch (fallbackError: any) {
        const fallbackStatus = fallbackError?.response?.status;
        if (fallbackStatus === 405 || fallbackStatus === 404) {
          const upsertResponse = await apiClient.post<any>('/post_upsert/list', requestBody);
          const numero = extractNumeroPostulacion(upsertResponse.data);
          return Boolean(numero || upsertResponse.data);
        }
        throw fallbackError;
      }
    }
    throw error;
  }
};

export const fetchPostulacionesByPersona = async (
  idPersona: number,
): Promise<PostulacionListItem[]> => {
  const response = await apiClient.post<PostulacionListItem[] | PostulacionListItem>(
    '/post_by_persona/list',
    {
      estructura: { idPersona },
    },
  );
  const data = response.data;
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items.map((item: any) => ({
    idPostulacion: Number(item.idPostulacion ?? item.id_postulacion ?? item.id ?? 0),
    idPersona: Number(item.idPersona ?? item.id_persona ?? idPersona ?? 0),
    idConvocatoria: Number(item.idConvocatoria ?? item.id_convocatoria ?? 0),
    idHojaVida: Number(item.idHojaVida ?? item.id_hoja_vida ?? 0),
    numeroPostulacion: item.numeroPostulacion ?? item.numero_postulacion ?? '',
    estado: item.estado ?? '',
    observacion: item.observacion ?? item.observacion_postulacion ?? '',
    fechaPostulacion: item.fechaPostulacion ?? item.fecha_postulacion ?? '',
    idOficinaCoordinacion: item.idOficinaCoordinacion ?? item.id_oficina_coordinacion ?? undefined,
    oficinaCoordinacion: item.oficinaCoordinacion ?? item.nombreOficinaCoordinacion ?? '',
    idOficinaZonal: item.idOficinaZonal ?? item.id_oficina_zonal ?? undefined,
    oficinaZonal: item.oficinaZonal ?? item.nombreOficinaZonal ?? '',
  }));
};

export const fetchPostulacionesByConvocatoria = async (
  idConvocatoria: number,
): Promise<PostulacionAdminListItem[]> => {
  const response = await apiClient.post<PostulacionAdminListItem[] | PostulacionAdminListItem>(
    '/post_by_conv/list',
    {
      estructura: { idConvocatoria },
    },
  );
  const data = response.data;
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items.map((item: any) => ({
    idPostulacion: Number(item.idPostulacion ?? item.id_postulacion ?? item.id ?? 0),
    idPersona: Number(item.idPersona ?? item.id_persona ?? 0),
    idConvocatoria: Number(item.idConvocatoria ?? item.id_convocatoria ?? idConvocatoria ?? 0),
    idHojaVida: Number(item.idHojaVida ?? item.id_hoja_vida ?? 0),
    numeroPostulacion: item.numeroPostulacion ?? item.numero_postulacion ?? '',
    estado: item.estado ?? '',
    observacion: item.observacion ?? item.observacion_postulacion ?? '',
    fechaPostulacion: item.fechaPostulacion ?? item.fecha_postulacion ?? '',
    idOficinaCoordinacion: item.idOficinaCoordinacion ?? item.id_oficina_coordinacion ?? undefined,
    oficinaCoordinacion: item.oficinaCoordinacion ?? item.nombreOficinaCoordinacion ?? '',
    idOficinaZonal: item.idOficinaZonal ?? item.id_oficina_zonal ?? undefined,
    oficinaZonal: item.oficinaZonal ?? item.nombreOficinaZonal ?? '',
    convocatoria: item.convocatoria ?? item.titulo ?? item.nombre ?? '',
    perfil: item.perfil ?? item.nombrePerfil ?? item.categoria ?? '',
    postulanteNombre: item.postulanteNombre ?? item.nombreCompleto ?? item.nombres ?? '',
    postulanteDocumento: item.postulanteDocumento ?? item.documento ?? item.nroDocumento ?? '',
    postulanteEmail: item.postulanteEmail ?? item.correo ?? item.email ?? '',
  }));
};
