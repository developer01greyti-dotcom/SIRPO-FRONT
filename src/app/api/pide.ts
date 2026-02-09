import { apiClient } from './client';

export const pedirDNI = async (dniConsulta: string): Promise<any> => {
  const response = await apiClient.post<any>('/pide/reniec/consultar-dni', {
    dniConsulta,
  });
  return response.data;
};

export const pedirRUC = async (rucConsulta: string): Promise<any> => {
  const response = await apiClient.post<any>('/pide/sunat/consultar-ruc', {
    rucConsulta,
  });
  return response.data;
};

export const pedirSUNEDU = async (docConsulta: string): Promise<any> => {
  const response = await apiClient.post<any>('/pide/sunedu/consultar-rngt', {
    docConsulta,
  });
  return response.data;
};

export const pedirAntecedentes = async (payload: {
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre1: string;
  nombre2?: string;
  nombre3?: string;
  usuario?: string;
}): Promise<any> => {
  const response = await apiClient.post<any>('/pide/pj/antecedentes', payload);
  return response.data;
};

export const pedirMigraciones = async (cee: string): Promise<any> => {
  const response = await apiClient.get<any>(`/pide/migraciones/cee/${cee}`);
  return response.data;
};

export const pedirPNP = async (dni: string): Promise<any> => {
  const response = await apiClient.get<any>(`/pide/pnp/persona/${dni}`);
  return response.data;
};
