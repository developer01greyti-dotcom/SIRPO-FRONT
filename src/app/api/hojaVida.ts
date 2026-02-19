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
  correoSecundario?: string;
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
  correoSecundario: string;
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
  experienciaEspecifica: number;
}

const normalizeHojaVidaActual = (raw: any): HojaVidaActual | null => {
  if (!raw) return null;
  const idHojaVida = Number(
    raw.idHojaVida ??
      raw.id_hoja_vida ??
      raw.idHojaVidaActual ??
      raw.id_hoja_vida_actual ??
      raw.idHv ??
      raw.id_hv ??
      raw.id ??
      0,
  );
  const version = Number(
    raw.version ??
      raw.versionHv ??
      raw.version_hv ??
      raw.versionHojaVida ??
      raw.version_hoja_vida ??
      0,
  );
  const estado =
    raw.estado ?? raw.estadoHv ?? raw.estado_hv ?? raw.estadoHojaVida ?? raw.estado_hoja_vida ?? '';
  const fechaRegistro =
    raw.fechaRegistro ?? raw.fecha_registro ?? raw.fechaRegistroHv ?? raw.fecha_registro_hv ?? '';
  if (!idHojaVida) return null;
  return { idHojaVida, version, estado: String(estado || ''), fechaRegistro: String(fechaRegistro || '') };
};

const pickFirstValue = (raw: any, keys: string[]) => {
  if (!raw) return undefined;
  for (const key of keys) {
    const value = raw?.[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return undefined;
};

const normalizeHojaVidaDatos = (raw: any): HojaVidaDatos | null => {
  if (!raw) return null;

  const idHvDatos = Number(
    pickFirstValue(raw, ['idHvDatos', 'id_hv_datos', 'idHvDatosPersonales', 'id_hv_datos_personales', 'id']) ?? 0,
  );
  const tipoDocumentoId = pickFirstValue(raw, [
    'tipoDocumentoId',
    'tipo_documento',
    'id_tipo_documento',
    'tipoDoc',
    'tipo_doc',
  ]);
  const tipoDocumento = pickFirstValue(raw, [
    'tipoDocumento',
    'tipo_documento_desc',
    'tipoDocumentoDescripcion',
    'tipo_doc_desc',
  ]);
  const numeroDocumento = pickFirstValue(raw, [
    'numeroDocumento',
    'nroDocumento',
    'numero_documento',
    'nro_documento',
    'documento',
  ]);
  const nombres = pickFirstValue(raw, ['nombres', 'nombre', 'nombres_completos']);
  const apellidoPaterno = pickFirstValue(raw, [
    'apellidoPaterno',
    'apePaterno',
    'ape_paterno',
    'apellido_paterno',
    'apPrimer',
    'primerApellido',
  ]);
  const apellidoMaterno = pickFirstValue(raw, [
    'apellidoMaterno',
    'apeMaterno',
    'ape_materno',
    'apellido_materno',
    'apSegundo',
    'segundoApellido',
  ]);
  const sexoId = pickFirstValue(raw, ['sexoId', 'sexo_id', 'id_sexo']);
  const sexo = pickFirstValue(raw, ['sexo', 'sexo_desc', 'sexoDescripcion']);
  const estadoCivilId = pickFirstValue(raw, ['estadoCivilId', 'estado_civil', 'id_estado_civil']);
  const estadoCivil = pickFirstValue(raw, ['estadoCivil', 'estado_civil_desc', 'estadoCivilDescripcion']);
  const fechaNacimiento = pickFirstValue(raw, ['fechaNacimiento', 'fecha_nacimiento', 'fechaNacimientoTexto']);
  const nacionalidad = pickFirstValue(raw, ['nacionalidad', 'nacionalidad_desc']);
  const telefonoCelular = pickFirstValue(raw, [
    'telefonoCelular',
    'telefono_celular',
    'celular',
    'telefono',
  ]);
  const correo = pickFirstValue(raw, ['correo', 'email', 'correo_electronico']);
  const correoSecundario = pickFirstValue(raw, ['correoSecundario', 'correo_secundario', 'emailSecundario']);
  const ruc = pickFirstValue(raw, ['ruc', 'nroRuc']);
  const cuentaBn = pickFirstValue(raw, ['cuentaBn', 'cuenta_bn', 'numeroCuentaBn']);
  const cciBn = pickFirstValue(raw, ['cciBn', 'cci_bn', 'cci']);
  const direccion = pickFirstValue(raw, ['direccion', 'direccion_domicilio']);
  const referencia = pickFirstValue(raw, ['referencia', 'referencia_domicilio']);
  const distritoId = pickFirstValue(raw, ['distritoId', 'idUbigeo', 'id_ubigeo', 'ubigeoId']);
  const distrito = pickFirstValue(raw, ['distrito', 'distrito_desc', 'nombreDistrito', 'ubigeo']);

  return {
    idHvDatos: idHvDatos || undefined,
    tipoDocumentoId,
    tipoDocumento: String(tipoDocumento ?? tipoDocumentoId ?? ''),
    numeroDocumento: String(numeroDocumento ?? ''),
    nombres: String(nombres ?? ''),
    apellidoPaterno: String(apellidoPaterno ?? ''),
    apellidoMaterno: String(apellidoMaterno ?? ''),
    sexoId,
    sexo: String(sexo ?? sexoId ?? ''),
    estadoCivilId,
    estadoCivil: String(estadoCivil ?? estadoCivilId ?? ''),
    fechaNacimiento: String(fechaNacimiento ?? ''),
    nacionalidad: String(nacionalidad ?? ''),
    telefonoCelular: String(telefonoCelular ?? ''),
    correo: String(correo ?? ''),
    correoSecundario: correoSecundario ? String(correoSecundario) : '',
    ruc: String(ruc ?? ''),
    cuentaBn: String(cuentaBn ?? ''),
    cciBn: String(cciBn ?? ''),
    direccion: String(direccion ?? ''),
    referencia: String(referencia ?? ''),
    distritoId,
    distrito: String(distrito ?? ''),
  };
};

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
  return normalizeHojaVidaActual(normalized); 
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
  return normalizeHojaVidaDatos(normalized);
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

export const downloadHojaVidaPdf = async (idHojaVida: number): Promise<Blob> => {
  const response = await apiClient.get('/hv_pdf', {
    params: { idHojaVida },
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });
  return response.data as Blob;
};


export const downloadDeclaracionesPdf = async (
  idHojaVida: number,
  options?: {
    idConvocatoria?: number;
    idPersona?: number;
    oficinaZonal?: string;
    oficinaCoordinacion?: string;
    distrito?: string;
    provincia?: string;
    departamento?: string;
    idUbigeo?: string | number;
    correo2?: string;
    familiares?: Array<{
      apellidos: string;
      nombres: string;
      relacion: string;
      unidad: string;
    }>;
  },
): Promise<{ blob: Blob; contentType: string }> => {
  const params: Record<string, any> = { idHojaVida, _ts: Date.now() };
  if (options?.idConvocatoria) {
    params.idConvocatoria = options.idConvocatoria;
  }
  if (options?.idPersona) {
    params.idPersona = options.idPersona;
  }
  if (options?.oficinaZonal) {
    params.oficinaZonal = options.oficinaZonal;
  }
  if (options?.oficinaCoordinacion) {
    params.oficinaCoordinacion = options.oficinaCoordinacion;
  }
  if (options?.distrito) {
    params.distrito = options.distrito;
  }
  if (options?.provincia) {
    params.provincia = options.provincia;
  }
  if (options?.departamento) {
    params.departamento = options.departamento;
  }
  if (options?.idUbigeo) {
    params.idUbigeo = options.idUbigeo;
  }
  if (options?.correo2) {
    params.correo2 = options.correo2;
  }
  if (options?.familiares?.length) {
    const max = Math.min(options.familiares.length, 3);
    for (let i = 0; i < max; i += 1) {
      const familiar = options.familiares[i];
      const index = i + 1;
      params[`familiar${index}Apellidos`] = familiar.apellidos;
      params[`familiar${index}Nombres`] = familiar.nombres;
      params[`familiar${index}Relacion`] = familiar.relacion;
      params[`familiar${index}Unidad`] = familiar.unidad;
    }
  }

  const response = await apiClient.get('/hv_decl_pdf', {
    params,
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
      'Cache-Control': 'no-cache',
    },
  });
  const contentType = String(response.headers?.['content-type'] || '');
  return { blob: response.data as Blob, contentType };
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
  const requestBody = { estructura: payload };
  try {
    const response = await apiClient.post<any>('/hv_datos_upsert/list', requestBody);
    const data = response.data;
    const normalized = Array.isArray(data) ? data[0] : data;
    const idHvDatos = normalized?.idHvDatos ?? normalized?.id ?? 0;
    return Number(idHvDatos) || 0;
  } catch (error: any) {
    const rawData = error?.response?.data;
    const message =
      typeof rawData === 'string' ? rawData : rawData ? JSON.stringify(rawData) : '';
    const shouldRetryLegacy =
      message.includes('PLS-00306') || message.includes('ORA-06550');

    if (shouldRetryLegacy && Object.prototype.hasOwnProperty.call(payload, 'correoSecundario')) {
      const { correoSecundario, ...legacyPayload } = payload;
      const fallback = await apiClient.post<any>('/hv_datos_upsert/list', {
        estructura: legacyPayload,
      });
      const data = fallback.data;
      const normalized = Array.isArray(data) ? data[0] : data;
      const idHvDatos = normalized?.idHvDatos ?? normalized?.id ?? 0;
      return Number(idHvDatos) || 0;
    }
    throw error;
  }
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
  const orderedPayload: HvExpUpsertPayload = {
    idHvExperiencia: payload.idHvExperiencia,
    idHojaVida: payload.idHojaVida,
    tipoExperiencia: payload.tipoExperiencia,
    tipoEntidad: payload.tipoEntidad,
    nombreEntidad: payload.nombreEntidad,
    idUbigeo: payload.idUbigeo,
    area: payload.area,
    cargo: payload.cargo,
    funcionesPrincipales: payload.funcionesPrincipales,
    motivoCese: payload.motivoCese,
    fechaInicio: payload.fechaInicio,
    fechaFin: payload.fechaFin,
    idArchivo: payload.idArchivo,
    experienciaEspecifica: payload.experienciaEspecifica ?? 0,
    usuarioAccion: payload.usuarioAccion,
  };

  const send = async (url: string) => {
    const response = await apiClient.post<any>(url, { estructura: orderedPayload });
    const data = response.data;
    const normalized = Array.isArray(data) ? data[0] : data;
    const idHvExperiencia = normalized?.idHvExperiencia ?? normalized?.id ?? 0;
    return Number(idHvExperiencia) || 0;
  };

  try {
    return await send('/hv_exp_upsert/list');
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404) {
      return await send('/hv_exp_upsert');
    }
    throw error;
  }
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

export const deleteHvCur = async (
  idHvCurso: number,
  usuarioAccion: number,
): Promise<boolean> => {
  const response = await apiClient.delete<boolean>('/hv_cur', {
    data: { estructura: { idHvCurso, usuarioAccion } },
  });
  return Boolean(response.data);
};

export const deleteHvExp = async (
  idHvExperiencia: number,
  usuarioAccion: number,
): Promise<boolean> => {
  const response = await apiClient.delete<boolean>('/hv_exp', {
    data: { estructura: { idHvExperiencia, usuarioAccion } },
  });
  return Boolean(response.data);
};
