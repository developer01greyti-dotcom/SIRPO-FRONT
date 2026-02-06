import { apiClient } from './client';

export interface ConvocatoriaListFilters {
  oficinaCoordinacion?: string;
  perfil?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  busqueda?: string;
}

export interface ConvocatoriaListItem {
  id: number | string;
  idConvocatoria?: number | string;
  nombre: string;
  oficinaCoordinacion: string;
  perfil: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  estado: string;
  estadoId?: number | string;
  pdfUrl?: string;
  idOficinaCoordinacion?: number | string;
  tipoContrato?: string;
  numeroVacantes?: number;
  requisitosMinimos?: string;
  funcionesPrincipales?: string;
  salarioMin?: number;
  salarioMax?: number;
  archivoGuid?: string;
}

export interface ConvocatoriaUpsertPayload {
  idConvocatoria: number;
  titulo: string;
  idPerfil: number;
  idOficinaCoordinacion: number;
  tipoContrato: string;
  numeroVacantes: number;
  fechaInicio: string;
  fechaFin: string;
  requisitosMinimos: string;
  funcionesPrincipales: string;
  salarioMin: number;
  salarioMax: number;
  estado: string;
  idArchivoBases: number;
  usuarioAccion: number;
}

export const fetchConvocatoriasList = async (
  filters: ConvocatoriaListFilters = {},
): Promise<ConvocatoriaListItem[]> => {
  const response = await apiClient.post<ConvocatoriaListItem[] | ConvocatoriaListItem>(
    '/conv/list',
    {
      estructura: {
        oficinaCoordinacion: filters.oficinaCoordinacion ?? '',
        perfil: filters.perfil ?? '',
        estado: filters.estado ?? '',
        fechaInicio: filters.fechaInicio ?? '',
        fechaFin: filters.fechaFin ?? '',
        busqueda: filters.busqueda ?? '',
      },
    },
  );
  const data = response.data;
  const items = Array.isArray(data) ? data : data ? [data] : [];
  return items.map((item: any) => ({
    id: item.id,
    idConvocatoria: item.idConvocatoria ?? item.id_convocatoria ?? '',
    nombre: item.nombre,
    oficinaCoordinacion: item.oficinaCoordinacion ?? '',
    perfil: item.perfil ?? '',
    fechaInicio: item.fechaInicio ?? '',
    fechaFin: item.fechaFin ?? '',
    diasRestantes: Number(item.diasRestantes ?? 0),
    estado: item.estado ?? '',
    estadoId: item.estadoId ?? '',
    pdfUrl: item.pdfUrl ?? '',
    idOficinaCoordinacion: item.idOficinaCoordinacion ?? '',
    tipoContrato: item.tipoContrato ?? item.tipoCOntrato ?? '',
    numeroVacantes: item.numeroVacantes ?? 0,
    requisitosMinimos: item.requisitosMinimos ?? item.clob1 ?? '',
    funcionesPrincipales: item.funcionesPrincipales ?? item.clob2 ?? '',
    salarioMin: item.salarioMin ?? 0,
    salarioMax: item.salarioMax ?? 0,
    archivoGuid: item.archivoGuid ?? '',
  }));
};

export const upsertConvocatoria = async (
  payload: ConvocatoriaUpsertPayload,
): Promise<number> => {
  const response = await apiClient.post<Array<{ idConvocatoria: number }>>(
    '/conv_upsert/list',
    {
      estructura: {
        idConvocatoria: payload.idConvocatoria,
        titulo: payload.titulo,
        idPerfil: payload.idPerfil,
        idOficinaCoordinacion: payload.idOficinaCoordinacion,
        tipoContrato: payload.tipoContrato,
        numeroVacantes: payload.numeroVacantes,
        fechaInicio: payload.fechaInicio,
        fechaFin: payload.fechaFin,
        clob1: payload.requisitosMinimos,
        clob2: payload.funcionesPrincipales,
        salarioMin: payload.salarioMin,
        salarioMax: payload.salarioMax,
        estado: payload.estado,
        idArchivoBases: payload.idArchivoBases,
        usuarioAccion: payload.usuarioAccion,
      },
    },
  );
  const data = response.data;
  if (Array.isArray(data) && data.length > 0 && data[0]?.idConvocatoria) {
    return Number(data[0].idConvocatoria);
  }
  return 0;
};

export const deleteConvocatoria = async (
  idConvocatoria: number,
  usuarioAccion: number,
): Promise<boolean> => {
  const response = await apiClient.delete<boolean>('/conv', {
    data: { estructura: { idConvocatoria, usuarioAccion } },
  });
  return Boolean(response.data);
};
