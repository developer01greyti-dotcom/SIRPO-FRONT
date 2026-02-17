import { apiClient, publicApiClient } from './client';

export interface DropdownItem {
  id: number | string;
  descripcion: string;
}

export const fetchSexoDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/sexo/dropdown');
  return response.data;
};

export const fetchTipoDocDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/tipodoc/dropdown');
  return response.data;
};

export const fetchTipoDocDropdownPublic = async (): Promise<DropdownItem[]> => {
  const response = await publicApiClient.get<DropdownItem[]>('/tipodoc/dropdown');
  return response.data;
};

export const fetchUbigeoDistritoList = async (codigo: string): Promise<DropdownItem[]> => {
  const response = await apiClient.post<DropdownItem[]>('/ubidist/list', {
    estructura: { codigo: codigo.toUpperCase() },
  });
  return response.data;
};

export const fetchEstadoCivilDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/estciv/dropdown');
  return response.data;
};

export const fetchTipoInstitucionDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/tipoinst/dropdown');
  return response.data;
};

export const fetchTipoEntidadDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/tipoent/dropdown');
  return response.data;
};

export const fetchNivelEstudioDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/nivest/dropdown');
  return response.data;
};

export const fetchTipoEstudioDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/tipoest/dropdown');
  return response.data;
};

export const fetchTipoExperienciaDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/tipoexp/dropdown');
  return response.data;
};

export const fetchMotivoCeseDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/motcese/dropdown');
  return response.data;
};

export const fetchRolDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/rol/dropdown');
  return response.data;
};

export const fetchPerfilDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/perfil/dropdown');
  return response.data;
};

export interface OficinaZonalCoordinacionItem {
  idOficinaZonal: number | string;
  oficinaZonal: string;
  idOficinaCoordinacion: number | string;
  oficinaCoordinacion: string;
}

export const fetchOficinaCoordinacionList = async (
  zonCord: string,
): Promise<OficinaZonalCoordinacionItem[]> => {
  const response = await apiClient.post<OficinaZonalCoordinacionItem[] | DropdownItem[]>(
    '/ofzoncord/list',
    { estructura: { zonCord } },
  );
  const data = response.data || [];

  return (Array.isArray(data) ? data : [data]).map((item: any) => ({
    idOficinaZonal:
      item.idOficinaZonal ?? item.idZonal ?? item.id_oficina_zonal ?? item.idZonalCoord ?? '',
    oficinaZonal: item.oficinaZonal ?? item.zonal ?? item.nombreZonal ?? '',
    idOficinaCoordinacion:
      item.idOficinaCoordinacion ?? item.idCoordinacion ?? item.id_coord ?? item.id ?? '',
    oficinaCoordinacion:
      item.oficinaCoordinacion ?? item.coordinacion ?? item.nombre ?? item.descripcion ?? '',
  }));
};

export const fetchTipoContratoDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/tipcontr/dropdown');
  return response.data;
};

export const fetchEstadoConvocatoriaDropdown = async (): Promise<DropdownItem[]> => {
  const response = await apiClient.get<DropdownItem[]>('/estconv/dropdown');
  return response.data;
};
