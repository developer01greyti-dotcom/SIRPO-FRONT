import { apiClient } from './client';

export interface PlantillaCorreoItem {
  idPlantilla: number;
  codigo: string;
  nombre: string;
  asunto: string;
  cuerpo: string;
  activo: number;
  version: number;
}

export interface PlantillaCorreoUpsertPayload {
  idPlantilla: number;
  codigo: string;
  nombre: string;
  asunto: string;
  cuerpo: string;
  activo: number;
  version: number;
  usuarioAccion: number;
}

export interface PlantillaCorreoSaveResult {
  ok: boolean;
  idPlantilla?: number;
  version?: number;
}

const normalizeNumber = (value: any, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizePlantillaCorreo = (raw: any): PlantillaCorreoItem | null => {
  if (!raw) return null;
  const idPlantilla = normalizeNumber(
    raw.idPlantilla ?? raw.id_plantilla ?? raw.idPlantillaCorreo ?? raw.id ?? 0,
  );
  const codigo = String(raw.codigo ?? raw.codPlantilla ?? raw.cod ?? '');
  const nombre = String(raw.nombre ?? raw.nom ?? raw.descripcion ?? '');
  const asunto = String(raw.asunto ?? raw.subject ?? '');
  const cuerpo = String(raw.cuerpo ?? raw.contenido ?? raw.body ?? '');
  const activo = normalizeNumber(raw.activo ?? raw.estado ?? raw.act ?? 1, 1);
  const version = normalizeNumber(raw.version ?? raw.ver ?? raw.versionPlantilla ?? 1, 1);

  if (!idPlantilla && !codigo && !nombre) return null;

  return { idPlantilla, codigo, nombre, asunto, cuerpo, activo, version };
};

const toArray = <T,>(data: T | T[] | null | undefined): T[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

export const fetchPlantillasCorreo = async (): Promise<PlantillaCorreoItem[]> => {
  const response = await apiClient.post<PlantillaCorreoItem[] | PlantillaCorreoItem>(
    '/plantilla_correo/list',
    { estructura: {} },
  );
  return toArray(response.data)
    .map(normalizePlantillaCorreo)
    .filter(Boolean) as PlantillaCorreoItem[];
};

export const upsertPlantillaCorreo = async (
  payload: PlantillaCorreoUpsertPayload,
): Promise<PlantillaCorreoSaveResult> => {
  const estructura = {
    idPlantilla: payload.idPlantilla,
    codigo: payload.codigo,
    nombre: payload.nombre,
    asunto: payload.asunto,
    cuerpo: payload.cuerpo,
    activo: payload.activo,
    version: payload.version,
    usuarioAccion: payload.usuarioAccion,
  };

  const send = async () => {
    const response = await apiClient.request<any>({
      method: 'put',
      url: '/plantilla_correo',
      data: { estructura },
    });
    const data = response.data;
    if (typeof data === 'boolean') {
      return { ok: data };
    }
    const normalized = Array.isArray(data) ? data[0] : data;
    const idPlantilla = normalizeNumber(
      normalized?.idPlantilla ?? normalized?.id_plantilla ?? normalized?.id ?? 0,
    );
    const version = normalizeNumber(
      normalized?.version ?? normalized?.ver ?? normalized?.versionPlantilla ?? payload.version,
      payload.version,
    );
    return { ok: Boolean(idPlantilla), idPlantilla: idPlantilla || undefined, version };
  };

  return await send();
};
