import axios from 'axios';
import { apiClient } from './client';

export interface AdminLoginResponse {
  idAdmin: number;
  usuario: string;
  nombreCompleto: string;
  rol: string;
  rolId: number;
  email: string;
  idOficinaZonal?: number;
  oficinaZonal?: string;
  tipoUsuario?: number | string;
  token?: string;
}

const extractToken = (raw: any): string => {
  if (!raw || typeof raw !== 'object') return '';
  const candidates = [raw, raw?.data, raw?.resultado, raw?.result];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const token =
      candidate.token ||
      candidate.accessToken ||
      candidate.jwt ||
      candidate.bearer ||
      candidate.bearerToken ||
      candidate.token_access ||
      candidate.tokenAccess;
    if (typeof token === 'string' && token.trim()) {
      return token.trim();
    }
  }
  return '';
};

const normalizeAdminResponse = (raw: any): AdminLoginResponse | null => {
  if (!raw) return null;
  const idAdmin = Number(
    raw.idAdmin ??
      raw.id_admin ??
      raw.ID_ADMIN ??
      raw.idUsuario ??
      raw.id_usuario ??
      raw.ID_USUARIO ??
      raw.idAdminUsuario ??
      raw.ID_ADMIN_USUARIO ??
      raw.id ??
      0,
  );
  if (!idAdmin) return null;
  return {
    idAdmin,
    usuario: String(raw.usuario ?? raw.USUARIO ?? raw.username ?? raw.user ?? ''),
    nombreCompleto: String(
      raw.nombreCompleto ?? raw.nombre_completo ?? raw.NOMBRE_COMPLETO ?? raw.nombre ?? raw.NOMBRE ?? '',
    ),
    rol: String(
      raw.rol ??
        raw.ROL ??
        raw.rolNombre ??
        raw.rol_nombre ??
        raw.rolDesc ??
        raw.rol_desc ??
        raw.ROL_NOMBRE ??
        raw.ROL_DESC ??
        '',
    ),
    rolId: Number(raw.rolId ?? raw.ROLID ?? raw.idRol ?? raw.ID_ROL ?? raw.id_rol ?? raw.IDROL ?? 0),
    email: String(raw.email ?? raw.correo ?? raw.CORREO ?? raw.mail ?? raw.MAIL ?? ''),
    idOficinaZonal:
      Number(
        raw.idOficinaZonal ??
          raw.id_oficina_zonal ??
          raw.ID_OFICINA_ZONAL ??
          raw.idZonal ??
          raw.ID_ZONAL ??
          raw.IDZONAL ??
          0,
      ) || undefined,
    oficinaZonal: String(
      raw.oficinaZonal ??
        raw.nombreOficinaZonal ??
        raw.nombre_zonal ??
        raw.oficina_zonal ??
        raw.OFICINA_ZONAL ??
        raw.NOMBRE_OFICINA_ZONAL ??
        raw.NOMBRE_ZONAL ??
        raw.ZONAL ??
        '',
    ),
    tipoUsuario:
      raw.tipoUsuario ??
      raw.tipo_usuario ??
      raw.tipoUsuarioId ??
      raw.idTipoUsuario ??
      raw.id_tipo_usuario ??
      raw.TIPOUSUARIO ??
      raw.TIPO_USUARIO ??
      raw.ID_TIPO_USUARIO ??
      undefined,
  };
};

export const loginAdmin = async (
  usuario: string,
  password: string,
): Promise<AdminLoginResponse | null> => {
  const endpoints = ['/admLogin/list', '/adm_login/list', '/admLogin', '/adm_login'];
  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.post<AdminLoginResponse | AdminLoginResponse[]>(
        endpoint,
        {
          estructura: {
            usuario,
            password,
          },
        },
        { timeout: 7000 },
      );
      const data = response.data;
      const normalized = Array.isArray(data) ? data[0] : data;
      const parsed = normalizeAdminResponse(normalized);
      if (parsed) {
        const headerToken =
          (response.headers?.authorization as string | undefined) ||
          (response.headers?.Authorization as string | undefined) ||
          (response.headers?.['x-auth-token'] as string | undefined);
        const tokenFromHeader = headerToken?.replace(/^Bearer\s+/i, '').trim() || '';
        const token = tokenFromHeader || extractToken(response.data);
        return token ? { ...parsed, token } : parsed;
      }
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400 || status === 401 || status === 404) {
          continue;
        }
      }
      throw error;
    }
  }
  return null;
};
