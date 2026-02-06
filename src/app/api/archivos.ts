import { apiClient } from './client';

export interface UploadArchivoResponse {
  guid: string;
  ruta?: string;
  nombreOrig?: string;
  ext?: string;
  mime?: string;
  sizeBytes?: number;
}

export const uploadArchivo = async (file: File): Promise<UploadArchivoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<UploadArchivoResponse>('/archivo/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
