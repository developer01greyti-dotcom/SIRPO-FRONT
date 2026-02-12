import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Plus, Edit, Power, Shield, UserCheck, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { fetchAdminUsers, updateAdminUserStatus, upsertAdminUser } from '../../api/adminUsers';
import { fetchRolDropdown, type DropdownItem } from '../../api/catalogos';

const ROLE_OPTIONS: DropdownItem[] = [
  { id: 0, descripcion: 'Usuario (sin acceso admin)' },
  { id: 1, descripcion: 'Admin (total acceso)' },
  { id: 2, descripcion: 'DATE' },
  { id: 3, descripcion: 'UABA' },
];

interface UsuarioAdmin {
  id: string;
  usuarioAD: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  rolId: string | number;
  estado: string;
  fechaCreacion: string;
  ultimoAcceso: string;
}

interface GestionUsuariosAdminProps {
  adminUserId?: number;
}

export function GestionUsuariosAdmin({ adminUserId = 0 }: GestionUsuariosAdminProps) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioAdmin | null>(null);
  const [rolOptions, setRolOptions] = useState<DropdownItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    usuario: UsuarioAdmin | null;
  }>({ open: false, usuario: null });

  const [formData, setFormData] = useState({
    usuarioAD: '',
    nombreCompleto: '',
    email: '',
    rolId: '',
    estado: 'ACTIVO',
  });

  const loadUsuarios = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminUsers();
      setUsuarios(data);
    } catch (error) {
      setUsuarios([]);
      setLoadError('No se pudo cargar el listado de usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadInitial = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [users, roles] = await Promise.all([fetchAdminUsers(), fetchRolDropdown()]);
        if (!isActive) return;
        setUsuarios(users);
        const normalizedRoles = roles?.length ? roles : ROLE_OPTIONS;
        const roleIds = new Set(normalizedRoles.map((item) => String(item.id)));
        const hasExpected = ROLE_OPTIONS.every((item) => roleIds.has(String(item.id)));
        setRolOptions(hasExpected ? normalizedRoles : ROLE_OPTIONS);
      } catch (error) {
        if (!isActive) return;
        setUsuarios([]);
        setRolOptions(ROLE_OPTIONS);
        setLoadError('No se pudo cargar el listado de usuarios.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      isActive = false;
    };
  }, []);

  const getNormalizedRole = (rol: string, rolId?: string | number) => {
    const rolText = (rol || '').toLowerCase();
    if (rolId === 1 || rolId === '1' || rolText.includes('admin') || rolText.includes('super')) {
      return 'admin';
    }
    if (rolId === 2 || rolId === '2' || rolText.includes('date')) {
      return 'date';
    }
    if (rolId === 3 || rolId === '3' || rolText.includes('uaba')) {
      return 'uaba';
    }
    if (rolId === 0 || rolId === '0' || rolText.includes('usuario')) {
      return 'usuario';
    }
    return 'usuario';
  };

  const isActiveUser = (estado: string) => {
    const normalized = (estado || '').toLowerCase();
    return normalized.startsWith('a') || normalized === '1' || normalized === 'true';
  };

  const stats = useMemo(() => {
    const activos = usuarios.filter((u) => isActiveUser(u.estado));
    const admins = usuarios.filter((u) => getNormalizedRole(u.rol, u.rolId) === 'admin');
    return {
      total: usuarios.length,
      activos: activos.length,
      admins: admins.length,
    };
  }, [usuarios]);

  const handleNuevoUsuario = () => {
    setIsEditing(false);
    setSelectedUsuario(null);
    setFormData({
      usuarioAD: '',
      nombreCompleto: '',
      email: '',
      rolId: '',
      estado: 'ACTIVO',
    });
    setShowForm(true);
  };

  const handleEditarUsuario = (usuario: UsuarioAdmin) => {
    setIsEditing(true);
    setSelectedUsuario(usuario);
    setFormData({
      usuarioAD: usuario.usuarioAD,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      rolId: String(usuario.rolId ?? ''),
      estado: usuario.estado || 'ACTIVO',
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!formData.usuarioAD || !formData.nombreCompleto || !formData.email || !formData.rolId) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await upsertAdminUser({
        idAdmin: isEditing && selectedUsuario ? Number(selectedUsuario.id) : 0,
        usuario: formData.usuarioAD,
        nombreCompleto: formData.nombreCompleto,
        email: formData.email,
        idAdminRol: Number(formData.rolId),
        estado: formData.estado,
        usuarioAccion: adminUserId,
      });

      if (!ok) {
        alert('No se pudo guardar el usuario.');
        return;
      }

      await loadUsuarios();
      setShowForm(false);
      setSelectedUsuario(null);
    } catch (error) {
      alert('No se pudo guardar el usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelar = () => {
    setShowForm(false);
    setSelectedUsuario(null);
    setFormData({
      usuarioAD: '',
      nombreCompleto: '',
      email: '',
      rolId: '',
      estado: 'ACTIVO',
    });
  };

  const handleCambiarEstado = (usuario: UsuarioAdmin) => {
    setConfirmState({ open: true, usuario });
  };

  const handleConfirmEstado = async () => {
    const usuario = confirmState.usuario;
    if (!usuario) return;

    const willDeactivate = isActiveUser(usuario.estado);
    try {
      const ok = await updateAdminUserStatus({
        idAdmin: Number(usuario.id),
        estado: willDeactivate ? 0 : 1,
        usuarioAccion: adminUserId,
      });
      if (!ok) {
        alert('No se pudo actualizar el estado del usuario.');
        return;
      }
      await loadUsuarios();
      setConfirmState({ open: false, usuario: null });
    } catch (error) {
      alert('No se pudo actualizar el estado del usuario.');
    }
  };

  const getRolBadge = (rol: string, rolId?: string | number) => {
    const normalized = getNormalizedRole(rol, rolId);
    if (normalized === 'admin') {
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Admin</Badge>;
    }
    if (normalized === 'date') {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">DATE</Badge>;
    }
    if (normalized === 'uaba') {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">UABA</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Usuario</Badge>;
  };

  const getEstadoBadge = (estado: string) => {
    if (isActiveUser(estado)) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Inactivo</Badge>;
  };

  const selectedRoleName =
    rolOptions.find((item) => String(item.id) === String(formData.rolId))?.descripcion || '';

  // Vista de Formulario (Crear/Editar)
  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
              <Shield className="w-8 h-8" />
              {isEditing ? 'Editar Usuario Administrativo' : 'Nuevo Usuario Administrativo'}
            </h1>
            <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
              {isEditing ? 'Modificar información y rol del usuario' : 'Registrar nuevo usuario del sistema'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleCancelar}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        {/* Formulario */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Usuario Active Directory *
                </label>
                <input
                  type="text"
                  value={formData.usuarioAD}
                  onChange={(e) => setFormData({ ...formData, usuarioAD: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: jperez"
                  disabled={isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500">El usuario de Active Directory no puede modificarse</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Juan Pérez García"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Institucional *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: juan.perez@devida.gob.pe"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Rol del Usuario *
              </label>
              <select
                value={formData.rolId}
                onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccione un rol</option>
                {rolOptions.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.descripcion}
                  </option>
                ))}
              </select>
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Permisos del rol seleccionado:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  {getNormalizedRole(selectedRoleName, formData.rolId) === 'admin' ? (
                    <>
                      <li>Gestión de Registros</li>
                      <li>Gestión de Servicios</li>
                      <li>Plantillas de Correo</li>
                      <li>Gestión de Usuarios Administrativos</li>
                    </>
                  ) : getNormalizedRole(selectedRoleName, formData.rolId) === 'date' ? (
                    <>
                      <li>Gestión de Registros</li>
                      <li>Gestión de Servicios</li>
                    </>
                  ) : getNormalizedRole(selectedRoleName, formData.rolId) === 'uaba' ? (
                    <li>Gestión de Registros</li>
                  ) : (
                    <li>Sin acceso al panel administrativo</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 pt-6 border-t">
            <Button
              onClick={handleGuardar}
              className="bg-green-600 hover:bg-green-700 gap-2"
              disabled={isSaving}
            >
              <UserCheck className="w-4 h-4" />
              {isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelar}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Vista de Listado
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
            <Shield className="w-8 h-8" />
            Gestión de Usuarios Administrativos
          </h1>
          <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
            Administrar roles y accesos de usuarios del sistema
          </p>
        </div>
        <Button
          onClick={handleNuevoUsuario}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold text-blue-700">Total Usuarios</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-semibold text-green-700">Usuarios Activos</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.activos}</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-sm font-semibold text-purple-700">Admins</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.admins}</p>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-bold" style={{ color: '#04a25c' }}>
            Listado de Usuarios
          </h2>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Usuario AD</TableHead>
                  <TableHead className="font-semibold">Nombre Completo</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Último Acceso</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : loadError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-red-600 py-6">
                      {loadError}
                    </TableCell>
                  </TableRow>
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{usuario.usuarioAD}</TableCell>
                      <TableCell>{usuario.nombreCompleto}</TableCell>
                      <TableCell className="text-sm text-gray-600">{usuario.email}</TableCell>
                      <TableCell>{getRolBadge(usuario.rol, usuario.rolId)}</TableCell>
                      <TableCell>{getEstadoBadge(usuario.estado)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{usuario.ultimoAcceso}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarUsuario(usuario)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant={isActiveUser(usuario.estado) ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => handleCambiarEstado(usuario)}
                            className={
                              isActiveUser(usuario.estado)
                                ? 'gap-2 border-red-300 text-red-700 hover:bg-red-50'
                                : 'gap-2 bg-green-600 hover:bg-green-700'
                            }
                          >
                            <Power className="w-4 h-4" />
                            {isActiveUser(usuario.estado) ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AlertDialog
        open={confirmState.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmState({ open: false, usuario: null });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState.usuario
                ? `¿Está seguro de ${isActiveUser(confirmState.usuario.estado) ? 'desactivar' : 'activar'} el acceso de ${confirmState.usuario.nombreCompleto}?`
                : '¿Está seguro de continuar?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmEstado}
            >
              Sí
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
