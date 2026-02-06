import { apiClient } from './client';

export interface HvRefArchivo {
  idHvRefArchivo: number;
  idHojaVida: number;
  entidad: string;
  idEntidad: number;
  tipoArchivo: string;
  guid: string;
  nombreOriginal?: string;
  extension?: string;
  mime?: string;
  sizeBytes?: number;
  ruta?: string;
}

export interface HvRefArchivoPayload {
  idHvRefArchivo: number;
  idHojaVida: number;
  entidad: string;
  idEntidad: number;
  tipoArchivo: string;
  nombreOrig: string;
  ext: string;
  mime: string;
  sizeBytes: number;
  ruta: string;
  usuarioAccion: number;
  guid?: string;
}

export const fetchHvRefArchivo = async (
  entidad: string,
  idEntidad: number,
): Promise<HvRefArchivo[]> => {
  const response = await apiClient.post<HvRefArchivo[]>('/hv_ref_archivo/list', {
    estructura: { entidad, idEntidad },
  });
  return response.data || [];
};

export const saveHvRefArchivo = async (
  file: File,
  payload: HvRefArchivoPayload,
): Promise<boolean> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('idHvRefArchivo', String(payload.idHvRefArchivo));
  formData.append('idHojaVida', String(payload.idHojaVida));
  formData.append('entidad', payload.entidad);
  formData.append('idEntidad', String(payload.idEntidad));
  formData.append('tipoArchivo', payload.tipoArchivo);
  formData.append('guid', payload.guid || '');
  formData.append('nombreOrig', payload.nombreOrig);
  formData.append('ext', payload.ext);
  formData.append('mime', payload.mime);
  formData.append('sizeBytes', String(payload.sizeBytes));
  formData.append('ruta', payload.ruta);
  formData.append('usuarioAccion', String(payload.usuarioAccion));

  const response = await apiClient.post<boolean>('/hv_ref_archivo', formData);
  return Boolean(response.data);
};

export const deleteHvRefArchivo = async (
  idHvRefArchivo: number,
  usuarioAccion: number,
): Promise<boolean> => {
  const response = await apiClient.delete<boolean>('/hv_ref_archivo', {
    data: { estructura: { idHvRefArchivo, usuarioAccion } },
  });
  return Boolean(response.data);
};
