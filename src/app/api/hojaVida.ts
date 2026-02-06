import { apiClient } from './client';

export interface HojaVidaActual { 
  idHojaVida: number; 
  version: number; 
  estado: string; 
  fechaRegistro: string; 
} 

export interface HojaVidaUpdatePayload { 
  idHojaVida: number; 
  idPersona: number; 
  version: number; 
  estado: string; 
  usuarioAccion: number; 
} 

export interface HojaVidaDatos {
  idHvDatos?: number;
  tipoDocumentoId?: string | number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexoId?: string | number;
  sexo: string;
  estadoCivilId?: string | number;
  estadoCivil: string;
  fechaNacimiento: string;
  nacionalidad: string;
  telefonoCelular: string;
  correo: string;
  ruc: string;
  cuentaBn: string;
  cciBn: string;
  direccion: string;
  referencia: string;
  distrito?: string;
  distritoId?: string | number;
}

export interface HojaVidaDatosPayload {
  idHvDatos: number;
  idHojaVida: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  estadoCivil: string;
  fechaNacimiento: string;
  nacionalidad: string;
  telefonoCelular: string;
  correo: string;
  ruc: string;
  cuentaBn: string;
  cciBn: string;
  direccion: string;
  referencia: string;
  idUbigeo: number;
  usuarioAccion: number;
}

export interface HvFormListItem {
  id: string;
  nivelEstudio: string;
  carrera: string;
  tipoInstitucion: string;
  institucion: string;
  fecha: string;
  documento: string;
}

export interface HvFormPayload {
  idHvFormacion: number;
  idHojaVida: number;
  nivelEstudio: string;
  carrera: string;
  tipoInstitucion: string;
  tipoEntidad: string;
  institucion: string;
  ruc: string;
  idUbigeo: number;
  pais: string;
  fechaObtencion: string;
  idArchivo: number;
  usuarioAccion: number;
}

export interface HvFormUpsertPayload {
  idHvFormacion: number;
  idHojaVida: number;
  nivelEstudio: string;
  carrera: string;
  tipoInstitucion: string;
  tipoEntidad: string;
  institucion: string;
  ruc: string;
  idUbigeo: number;
  pais: string;
  fechaObtencion: string;
  idArchivo: number;
  usuarioAccion: number;
}

export interface HvCurListItem {
  id: string;
  tipoEstudio: string;
  descripcion: string;
  tipoInstitucion: string;
  institucion: string;
  fechaInicio: string;
  fechaFin: string;
  horasLectivas: string;
  documento: string;
}

export interface HvCurUpsertPayload {
  idHvCurso: number;
  idHojaVida: number;
  tipoEstudio: string;
  descripcion: string;
  tipoInstitucion: string;
  institucion: string;
  ruc: string;
  idUbigeo: number;
  pais: string;
  fechaInicio: string;
  fechaFin: string;
  horasLectivas: number;
  idArchivo: number;
  usuarioAccion: number;
}

export interface HvExpUpsertPayload {
  idHvExperiencia: number;
  idHojaVida: number;
  tipoExperiencia: string;
  tipoEntidad: string;
  nombreEntidad: string;
  idUbigeo: number;
  area: string;
  cargo: string;
  funcionesPrincipales: string;
  motivoCese: string;
  fechaInicio: string;
  fechaFin: string;
  idArchivo: number;
  usuarioAccion: number;
}

export const fetchHojaVidaActual = async ( 
  idPersona: number, 
  idUsuario: number, 
): Promise<HojaVidaActual | null> => { 
  const response = await apiClient.post<HojaVidaActual | HojaVidaActual[]>(
    '/hv_actual/list',
    {
      estructura: { idPersona, idUsuario },
    },
  );
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data; 
  return normalized ?? null; 
}; 

export const updateHojaVidaEstado = async ( 
  payload: HojaVidaUpdatePayload, 
): Promise<boolean> => { 
  const response = await apiClient.put<boolean>('/hv', { 
    estructura: payload, 
  }); 
  return Boolean(response.data); 
}; 

export const fetchHojaVidaDatos = async (
  idHojaVida: number,
): Promise<HojaVidaDatos | null> => {
  const response = await apiClient.post<HojaVidaDatos | HojaVidaDatos[]>(
    '/hv_datos/list',
    {
      estructura: { idHojaVida },
    },
  );
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  return normalized ?? null;
};

export const fetchHvFormList = async (
  idHojaVida: number,
): Promise<HvFormListItem[]> => {
  const response = await apiClient.post<HvFormListItem[] | HvFormListItem>(
    '/hv_form/list',
    {
      estructura: { idHojaVida },
    },
  );
  const data = response.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const fetchHvCurList = async (
  idHojaVida: number,
): Promise<HvCurListItem[]> => {
  const response = await apiClient.post<HvCurListItem[] | HvCurListItem>(
    '/hv_cur/list',
    {
      estructura: { idHojaVida },
    },
  );
  const data = response.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const fetchHvExpList = async (
  idHojaVida: number,
): Promise<any[]> => {
  const response = await apiClient.post<any[] | any>('/hv_exp/list', {
    estructura: { idHojaVida },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const fetchHvDeclList = async (
  idHojaVida: number,
): Promise<any[]> => {
  const response = await apiClient.post<any[] | any>('/hv_decl/list', {
    estructura: { idHojaVida },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const upsertHvDecl = async (
  payload: {
    idHvDecl: number;
    idHojaVida: number;
    idDeclaracionTipo: number;
    idArchivo: number;
    estado: string;
    usuarioAccion: number;
  },
): Promise<number> => {
  const response = await apiClient.post<any>('/hv_decl_upsert/list', {
    estructura: payload,
  });
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  const idHvDecl = normalized?.idHvDecl ?? normalized?.idHvDeclaracion ?? normalized?.id ?? 0;
  return Number(idHvDecl) || 0;
};

export const deleteHvDecl = async (
  idHvDecl: number,
  usuarioAccion: number,
): Promise<boolean> => {
  const response = await apiClient.delete<boolean>('/hv_decl', {
    data: { estructura: { idHvDecl, usuarioAccion } },
  });
  return Boolean(response.data);
};

export const upsertHojaVidaDatos = async (
  payload: HojaVidaDatosPayload,
): Promise<number> => {
  const response = await apiClient.post<any>('/hv_datos_upsert/list', {
    estructura: payload,
  });
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  const idHvDatos = normalized?.idHvDatos ?? normalized?.id ?? 0;
  return Number(idHvDatos) || 0;
};

export const saveHojaVidaDatos = async (
  payload: HojaVidaDatosPayload,
): Promise<boolean> => {
  const idHvDatos = await upsertHojaVidaDatos(payload);
  return idHvDatos > 0;
};

export const saveHvForm = async (
  payload: HvFormPayload,
): Promise<boolean> => {
  const response = await apiClient.put<boolean>('/hv_form/update', {
    estructura: payload,
  });
  return Boolean(response.data);
};

export const upsertHvForm = async (
  payload: HvFormUpsertPayload,
): Promise<number> => {
  const response = await apiClient.post<any>('/hv_form_upsert/list', {
    estructura: payload,
  });
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  const idHvFormacion = normalized?.idHvFormacion ?? normalized?.id ?? 0;
  return Number(idHvFormacion) || 0;
};

export const upsertHvCur = async (
  payload: HvCurUpsertPayload,
): Promise<number> => {
  const response = await apiClient.post<any>('/hv_cur_upsert/list', {
    estructura: payload,
  });
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  const idHvCurso = normalized?.idHvCurso ?? normalized?.id ?? 0;
  return Number(idHvCurso) || 0;
};

export const upsertHvExp = async (
  payload: HvExpUpsertPayload,
): Promise<number> => {
  const response = await apiClient.post<any>('/hv_exp_upsert/list', {
    estructura: payload,
  });
  const data = response.data;
  const normalized = Array.isArray(data) ? data[0] : data;
  const idHvExperiencia = normalized?.idHvExperiencia ?? normalized?.id ?? 0;
  return Number(idHvExperiencia) || 0;
};

export const deleteHvForm = async (
  idHvFormacion: number,
  usuarioAccion: number,
): Promise<boolean> => {
  const response = await apiClient.delete<boolean>('/hv_form', {
    data: { estructura: { idHvFormacion, usuarioAccion } },
  });
  return Boolean(response.data);
};
