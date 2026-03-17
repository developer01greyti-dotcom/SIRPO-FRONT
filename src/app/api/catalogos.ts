import { apiClient, publicApiClient } from './client';

export interface DropdownItem {
  id: number | string;
  descripcion: string;
}

const pickUbigeoId = (raw: any): string => {
  if (!raw) return '';
  const candidates = [
    raw.codigo,
    raw.CODIGO,
    raw.ubigeo,
    raw.UBIGEO,
    raw.idUbigeo,
    raw.id_ubigeo,
    raw.distritoId,
    raw.distrito_id,
    raw.id,
    raw.ID,
  ];
  let fallback = '';
  for (const candidate of candidates) {
    const value = candidate === null || candidate === undefined ? '' : String(candidate).trim();
    if (!value) continue;
    if (!fallback) fallback = value;
    if (/^\d{6}$/.test(value)) return value;
    if (/^\d{5}$/.test(value)) return value.padStart(6, '0');
    if (/^\d+$/.test(value)) return value;
  }
  return fallback;
};

const pickUbigeoDescripcion = (raw: any, fallback: string): string => {
  if (!raw) return fallback;
  const descCandidates = [
    raw.descripcion,
    raw.DESCRIPCION,
    raw.descripcionUbigeo,
    raw.descripcion_ubigeo,
    raw.distrito_desc,
    raw.distrito,
    raw.nombreDistrito,
    raw.distritoNombre,
    raw.nombre,
  ];
  for (const candidate of descCandidates) {
    const value = candidate === null || candidate === undefined ? '' : String(candidate).trim();
    if (value) return value;
  }

  const departamento =
    raw.departamento ??
    raw.departamento_desc ??
    raw.region ??
    raw.nombreDepartamento ??
    raw.departamentoNombre ??
    '';
  const provincia =
    raw.provincia ??
    raw.provincia_desc ??
    raw.nombreProvincia ??
    raw.provinciaNombre ??
    '';
  const distrito =
    raw.distrito ??
    raw.distrito_desc ??
    raw.nombreDistrito ??
    raw.distritoNombre ??
    '';
  const parts = [departamento, provincia, distrito]
    .map((part) => (part === null || part === undefined ? '' : String(part).trim()))
    .filter(Boolean);
  if (parts.length) {
    return parts.join(' / ');
  }

  return fallback;
};

const normalizeUbigeoItem = (raw: any): DropdownItem | null => {
  if (!raw) return null;
  const id = pickUbigeoId(raw);
  const descripcion = pickUbigeoDescripcion(raw, id);
  if (!id && !descripcion) return null;
  return { id: id || descripcion, descripcion: descripcion || id };
};

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
  const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
  return data.map(normalizeUbigeoItem).filter(Boolean) as DropdownItem[];
};

export const fetchUbigeoDistritoById = async (id: string): Promise<DropdownItem | null> => {
  if (!id) return null;
  try {
    const response = await apiClient.get(`/ubidist/${encodeURIComponent(id)}`);
    return normalizeUbigeoItem(response.data);
  } catch {
    return null;
  }
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

export interface OficinaZonalItem {
  idOficinaZonal: number | string;
  oficinaZonal: string;
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

export const fetchOficinaZonalList = async (
  zonal: string,
): Promise<OficinaZonalItem[]> => {
  const response = await apiClient.post<OficinaZonalItem[] | DropdownItem[]>(
    '/ofzonal/list',
    { estructura: { zonal } },
  );
  const data = response.data || [];
  return (Array.isArray(data) ? data : [data]).map((item: any) => ({
    idOficinaZonal:
      item.idOficinaZonal ?? item.id_oficina_zonal ?? item.ID_OFICINA_ZONAL ?? item.id ?? '',
    oficinaZonal: item.oficinaZonal ?? item.nombre ?? item.nombreZonal ?? item.OFICINA_ZONAL ?? '',
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
