export type AdminRole = 'gestor' | 'superadmin' | 'date' | 'uaba';

export const parseTipoUsuario = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? null : numeric;
  }
  return null;
};

export const mapTipoUsuarioToRole = (value: unknown): AdminRole | null => {
  const tipoUsuario = parseTipoUsuario(value);
  if (tipoUsuario === null) return null;
  if (tipoUsuario === 1) return 'superadmin';
  if (tipoUsuario === 2) return 'date';
  if (tipoUsuario === 3) return 'uaba';
  return null;
};

export const getRoleLabel = (role?: AdminRole | null) => {
  switch (role) {
    case 'superadmin':
      return 'Admin';
    case 'gestor':
      return 'Coordinador';
    case 'date':
      return 'DATE';
    case 'uaba':
      return 'UABA';
    default:
      return 'Usuario';
  }
};

export const canManageServicios = (role?: AdminRole | null) =>
  role === 'superadmin' || role === 'date';

export const canCreateServicios = (role?: AdminRole | null) =>
  role === 'superadmin' || role === 'date';

export const canDeleteServicios = (role?: AdminRole | null) =>
  role === 'superadmin' || role === 'date';

export const canEvaluatePostulaciones = (role?: AdminRole | null) =>
  role === 'superadmin' || role === 'date';

export const isCumpleOnlyRole = (role?: AdminRole | null) =>
  role === 'date' || role === 'uaba';
