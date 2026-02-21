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
  contratoActivo?: boolean;
  numeroContrato?: string;
  oficinaZonalContrato?: string;
  fechaFinContrato?: string;
}

export interface PostulacionAdminListItem extends PostulacionListItem {
  convocatoria?: string;
  perfil?: string;
  postulanteNombre?: string;
  postulanteDocumento?: string;
  postulanteEmail?: string;
}

const parseBoolean = (value: any): boolean => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) return numeric > 0;
  return false;
};

const parseString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
};

const extractContratoInfo = (item: any) => {
  const contratoActivo = parseBoolean(
    item?.contratoActivo ??
      item?.contrato_activo ??
      item?.tieneContrato ??
      item?.contratoVigente ??
      item?.contrato_vigente ??
      item?.esContratado ??
      item?.es_contratado ??
      item?.contratoActual,
  );
  const numeroContrato = parseString(
    item?.numeroContrato ??
      item?.nroContrato ??
      item?.contratoNumero ??
      item?.contrato_numero ??
      item?.contrato ??
      item?.nro_contrato ??
      '',
  );
  const oficinaZonalContrato = parseString(
    item?.oficinaZonalContrato ??
      item?.oficina_zonal_contrato ??
      item?.oficinaZonalActual ??
      item?.oficina_zonal_actual ??
      item?.oficinaZonalServicio ??
      item?.oficina_zonal_servicio ??
      '',
  );
  const fechaFinContrato = parseString(
    item?.fechaFinContrato ??
      item?.fecha_fin_contrato ??
      item?.fechaFinServicio ??
      item?.fecha_fin_servicio ??
      '',
  );
  return { contratoActivo, numeroContrato, oficinaZonalContrato, fechaFinContrato };
};

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
    ...extractContratoInfo(item),
    idPostulacion: Number(item.idPostulacion ?? item.id_postulacion ?? item.id ?? 0),
    idPersona: Number(item.idPersona ?? item.id_persona ?? idPersona ?? 0),
    idConvocatoria: Number(item.idConvocatoria ?? item.id_convocatoria ?? 0),
    idHojaVida: Number(item.idHojaVida ?? item.id_hoja_vida ?? 0),
    numeroPostulacion: item.numeroPostulacion ?? item.numero_postulacion ?? '',
    estado: item.estado ?? '',
    observacion: item.observacion ?? item.observacion_postulacion ?? '',
    fechaPostulacion: item.fechaPostulacion ?? item.fecha_postulacion ?? '',
    idOficinaCoordinacion:
      item.idOficinaCoordinacion ?? item.id_oficina_coordinacion ?? item.ID_OFICINA_COORDINACION ?? undefined,
    oficinaCoordinacion:
      item.oficinaCoordinacion ?? item.nombreOficinaCoordinacion ?? item.OFICINA_COORDINACION ?? '',
    idOficinaZonal: item.idOficinaZonal ?? item.id_oficina_zonal ?? item.ID_OFICINA_ZONAL ?? undefined,
    oficinaZonal:
      item.oficinaZonal ?? item.nombreOficinaZonal ?? item.OFICINA_ZONAL ?? item.NOMBRE_OFICINA_ZONAL ?? '',
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
    ...extractContratoInfo(item),
    idPostulacion: Number(item.idPostulacion ?? item.id_postulacion ?? item.id ?? 0),
    idPersona: Number(item.idPersona ?? item.id_persona ?? 0),
    idConvocatoria: Number(item.idConvocatoria ?? item.id_convocatoria ?? idConvocatoria ?? 0),
    idHojaVida: Number(item.idHojaVida ?? item.id_hoja_vida ?? 0),
    numeroPostulacion: item.numeroPostulacion ?? item.numero_postulacion ?? '',
    estado: item.estado ?? '',
    observacion: item.observacion ?? item.observacion_postulacion ?? '',
    fechaPostulacion: item.fechaPostulacion ?? item.fecha_postulacion ?? '',
    idOficinaCoordinacion:
      item.idOficinaCoordinacion ?? item.id_oficina_coordinacion ?? item.ID_OFICINA_COORDINACION ?? undefined,
    oficinaCoordinacion:
      item.oficinaCoordinacion ?? item.nombreOficinaCoordinacion ?? item.OFICINA_COORDINACION ?? '',
    idOficinaZonal: item.idOficinaZonal ?? item.id_oficina_zonal ?? item.ID_OFICINA_ZONAL ?? undefined,
    oficinaZonal:
      item.oficinaZonal ?? item.nombreOficinaZonal ?? item.OFICINA_ZONAL ?? item.NOMBRE_OFICINA_ZONAL ?? '',
    convocatoria: item.convocatoria ?? item.titulo ?? item.nombre ?? '',
    perfil: item.perfil ?? item.nombrePerfil ?? item.categoria ?? '',
    postulanteNombre: item.postulanteNombre ?? item.nombreCompleto ?? item.nombres ?? '',
    postulanteDocumento: item.postulanteDocumento ?? item.documento ?? item.nroDocumento ?? '',
    postulanteEmail: item.postulanteEmail ?? item.correo ?? item.email ?? '',
  }));
};
