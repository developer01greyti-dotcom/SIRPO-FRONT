import { useEffect, useMemo, useState } from 'react';
import { Users, Eye, Filter, X, Search, Trash2 } from 'lucide-react';
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
import { DetallePostulacionAdmin } from './DetallePostulacionAdmin';
import { deleteConvocatoria } from '../../api/convocatorias';
import { fetchPostulacionesByConvocatoria, type PostulacionAdminListItem } from '../../api/postulaciones';
import { canDeleteServicios, canEvaluatePostulaciones, isCumpleOnlyRole, type AdminRole } from '../../utils/roles';

interface ServicioItem {
  id: string;
  nombre: string;
  oficinaCoordinacion: string;
  oficinaZonal: string;
  perfil: string;
}

interface Postulacion {
  id: string;
  idPersona: number;
  idConvocatoria: string;
  idHojaVida: number;
  numeroPostulacion?: string;
  contratoActivo?: boolean;
  numeroContrato?: string;
  oficinaZonalContrato?: string;
  fechaFinContrato?: string;
  postulante: {
    nombre: string;
    documento: string;
    email: string;
  };
  convocatoria: string;
  oficinaCoordinacion: string;
  oficinaZonal: string;
  perfil: string;
  fechaPostulacion: string;
  estado: string;
  observacion?: string;
}

interface GestionPostulacionesProps {
  convocatorias: any[];
  adminUserId?: number;
  adminRole?: AdminRole;
  adminOficinaZonalId?: number;
  adminOficinaZonal?: string;
}

const defaultListFilters = {
  busqueda: '',
  oficinaCoordinacion: '',
  perfil: '',
};

const defaultPostFilters = {
  busqueda: '',
  estadoPostulacion: '',
  oficinaZonal: '',
  oficinaCoordinacion: '',
  perfil: '',
  anio: '',
};

export function GestionPostulaciones({
  convocatorias,
  adminUserId = 0,
  adminRole,
  adminOficinaZonalId,
  adminOficinaZonal,
}: GestionPostulacionesProps) {
  const cumpleOnly = isCumpleOnlyRole(adminRole);
  const canEvaluar = canEvaluatePostulaciones(adminRole);
  const canEliminarServicio = canDeleteServicios(adminRole);
  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [listFilters, setListFilters] = useState(defaultListFilters);
  const [appliedListFilters, setAppliedListFilters] = useState(defaultListFilters);
  const [showListFilters, setShowListFilters] = useState(true);

  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [filteredPostulaciones, setFilteredPostulaciones] = useState<Postulacion[]>([]);
  const [postFilters, setPostFilters] = useState(defaultPostFilters);
  const [showDetailFilters, setShowDetailFilters] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedServicioId, setSelectedServicioId] = useState<string | null>(null);
  const [selectedServicioNombre, setSelectedServicioNombre] = useState<string | null>(null);
  const [selectedPostulacion, setSelectedPostulacion] = useState<Postulacion | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    servicio: ServicioItem | null;
  }>({ open: false, servicio: null });

  const [resumenByConv, setResumenByConv] = useState<
    Record<string, { total: number; cumple: number; noCumple: number }>
  >({});
  const [resumenLoadingIds, setResumenLoadingIds] = useState<string[]>([]);

  const normalizeOz = (value?: string) => (value || '').trim().toUpperCase();
  const matchesAdminOz = (item: any) => {
    if (!adminOficinaZonalId && !adminOficinaZonal) return true;
    const itemOzId = item?.idOficinaZonal ?? item?.id_oficina_zonal ?? item?.idZonal ?? '';
    if (adminOficinaZonalId && String(itemOzId) === String(adminOficinaZonalId)) {
      return true;
    }
    const itemOzName =
      item?.oficinaZonal ??
      item?.nombreOficinaZonal ??
      (String(item?.oficinaCoordinacion ?? '').includes('/')
        ? String(item?.oficinaCoordinacion ?? '').split('/')[0]?.trim()
        : '');
    if (adminOficinaZonal) {
      return normalizeOz(itemOzName) === normalizeOz(adminOficinaZonal);
    }
    return false;
  };

  useEffect(() => {
    const map = new Map<string, ServicioItem>();
    (convocatorias || []).filter(matchesAdminOz).forEach((item: any) => {
      const id = String(item?.idConvocatoria ?? item?.id ?? '').trim();
      const nombre = String(item?.nombre ?? item?.titulo ?? '').trim();
      if (!id || !nombre) return;
      const oficinaZonal =
        String(item?.oficinaZonal ?? item?.nombreOficinaZonal ?? '').trim() ||
        (String(item?.oficinaCoordinacion ?? '').includes('/')
          ? String(item?.oficinaCoordinacion ?? '').split('/')[0]?.trim()
          : '');
      if (!map.has(id)) {
        map.set(id, {
          id,
          nombre,
          oficinaCoordinacion: String(item?.oficinaCoordinacion ?? '').trim(),
          oficinaZonal,
          perfil: String(item?.perfil ?? '').trim(),
        });
      }
    });
    setServicios(Array.from(map.values()));
  }, [convocatorias, adminOficinaZonalId, adminOficinaZonal]);

  const listOficinaOptions = useMemo(() => {
    const values = servicios
      .map((item) => item.oficinaCoordinacion)
      .filter((value) => value && value.trim().length > 0);
    return Array.from(new Set(values));
  }, [servicios]);

  const listPerfilOptions = useMemo(() => {
    const values = servicios
      .map((item) => item.perfil)
      .filter((value) => value && value.trim().length > 0);
    return Array.from(new Set(values));
  }, [servicios]);

  const filteredServicios = useMemo(() => {
    let items = [...servicios];
    if (appliedListFilters.busqueda) {
      const term = appliedListFilters.busqueda.toLowerCase();
      items = items.filter((item) => item.nombre.toLowerCase().includes(term));
    }
    if (appliedListFilters.oficinaCoordinacion) {
      items = items.filter(
        (item) => item.oficinaCoordinacion === appliedListFilters.oficinaCoordinacion,
      );
    }
    if (appliedListFilters.perfil) {
      items = items.filter((item) => item.perfil === appliedListFilters.perfil);
    }
    return items;
  }, [servicios, appliedListFilters]);

  const oficinaZonalOptions = useMemo(() => {
    const values = postulaciones
      .map((p) => p.oficinaZonal)
      .filter((value) => value && value.trim().length > 0);
    return Array.from(new Set(values));
  }, [postulaciones]);

  const oficinaCoordinacionOptions = useMemo(() => {
    const values = postulaciones
      .map((p) => p.oficinaCoordinacion)
      .filter((value) => value && value.trim().length > 0);
    return Array.from(new Set(values));
  }, [postulaciones]);

  const perfilOptions = useMemo(() => {
    const values = postulaciones
      .map((p) => p.perfil)
      .filter((value) => value && value.trim().length > 0);
    return Array.from(new Set(values));
  }, [postulaciones]);

  const normalizeEstadoValue = (value: string) => {
    const normalized = (value || '').toLowerCase().trim();
    if (!normalized) return '';
    if (normalized === '1') return 'cumple';
    if (normalized === '2') return 'no cumple';
    if (normalized === '0') return 'registrado';
    const compact = normalized.replace(/[-\s]/g, '');
    if (compact.includes('nocumple')) return 'no cumple';
    if (compact.includes('cumple')) return 'cumple';
    if (compact.includes('registr')) return 'registrado';
    if (compact.includes('revision') || compact.includes('revisi')) return 'registrado';
    return normalized;
  };

  const mapPostulacion = (item: PostulacionAdminListItem): Postulacion => ({
    id: String(item.idPostulacion ?? ''),
    idPersona: Number(item.idPersona ?? 0),
    idConvocatoria: String(item.idConvocatoria ?? ''),
    idHojaVida: Number(item.idHojaVida ?? 0),
    numeroPostulacion: item.numeroPostulacion ?? '',
    contratoActivo: item.contratoActivo ?? false,
    numeroContrato: item.numeroContrato ?? '',
    oficinaZonalContrato: item.oficinaZonalContrato ?? '',
    fechaFinContrato: item.fechaFinContrato ?? '',
    postulante: {
      nombre: item.postulanteNombre ?? '',
      documento: item.postulanteDocumento ?? '',
      email: item.postulanteEmail ?? '',
    },
    convocatoria: item.convocatoria ?? '',
    oficinaCoordinacion: item.oficinaCoordinacion ?? '',
    oficinaZonal: item.oficinaZonal ?? '',
    perfil: item.perfil ?? '',
    fechaPostulacion: item.fechaPostulacion ?? '',
    estado: normalizeEstadoValue(item.estado ?? ''),
    observacion: item.observacion ?? '',
  });

  const normalizeEstado = (value: string) => normalizeEstadoValue(value || '');

  const buildResumen = (items: PostulacionAdminListItem[]) => {
    let cumple = 0;
    let noCumple = 0;
    items.forEach((item) => {
      const estado = normalizeEstado(item.estado ?? '');
      if (!estado) return;
      if (estado === 'no cumple') {
        noCumple += 1;
      } else if (estado === 'cumple') {
        cumple += 1;
      }
    });
    if (cumpleOnly) {
      return { total: cumple, cumple, noCumple: 0 };
    }
    return { total: items.length, cumple, noCumple };
  };

  const buildResumenFromMapped = (items: Postulacion[]) => {
    let cumple = 0;
    let noCumple = 0;
    items.forEach((item) => {
      const estado = normalizeEstado(item.estado ?? '');
      if (!estado) return;
      if (estado === 'no cumple') {
        noCumple += 1;
      } else if (estado === 'cumple') {
        cumple += 1;
      }
    });
    if (cumpleOnly) {
      return { total: cumple, cumple, noCumple: 0 };
    }
    return { total: items.length, cumple, noCumple };
  };
  const loadResumen = async (idConvocatoria: string) => {
    if (!idConvocatoria) return;
    if (resumenByConv[idConvocatoria]) return;
    if (resumenLoadingIds.includes(idConvocatoria)) return;
    setResumenLoadingIds((prev) => [...prev, idConvocatoria]);
    try {
      const data = await fetchPostulacionesByConvocatoria(Number(idConvocatoria));
      const resumen = buildResumen(data);
      setResumenByConv((prev) => ({ ...prev, [idConvocatoria]: resumen }));
    } catch (error) {
      setResumenByConv((prev) => ({
        ...prev,
        [idConvocatoria]: { total: 0, cumple: 0, noCumple: 0 },
      }));
    } finally {
      setResumenLoadingIds((prev) => prev.filter((id) => id !== idConvocatoria));
    }
  };

  useEffect(() => {
    filteredServicios.forEach((servicio) => {
      void loadResumen(servicio.id);
    });
  }, [filteredServicios]);

  const loadPostulaciones = async (idConvocatoria: string) => {
    if (!idConvocatoria) {
      setPostulaciones([]);
      setFilteredPostulaciones([]);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchPostulacionesByConvocatoria(Number(idConvocatoria));
      const mapped = data.map(mapPostulacion);
      const roleFiltered = cumpleOnly
        ? mapped.filter((item) => normalizeEstado(item.estado) === 'cumple')
        : mapped;
      setPostulaciones(roleFiltered);
      setFilteredPostulaciones(roleFiltered);
    } catch (error) {
      setPostulaciones([]);
      setFilteredPostulaciones([]);
      setLoadError('No se pudieron cargar los registros.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchPostulaciones = () => {
    let filtered = [...postulaciones];

    if (postFilters.busqueda) {
      const searchTerm = postFilters.busqueda.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.convocatoria.toLowerCase().includes(searchTerm) ||
          p.postulante.nombre.toLowerCase().includes(searchTerm) ||
          p.postulante.documento.toLowerCase().includes(searchTerm),
      );
    }

    if (postFilters.oficinaZonal) {
      filtered = filtered.filter((p) => p.oficinaZonal === postFilters.oficinaZonal);
    }

    if (postFilters.oficinaCoordinacion) {
      filtered = filtered.filter((p) => p.oficinaCoordinacion === postFilters.oficinaCoordinacion);
    }

    if (postFilters.perfil) {
      filtered = filtered.filter((p) => p.perfil === postFilters.perfil);
    }

    if (postFilters.estadoPostulacion) {
      filtered = filtered.filter((p) => p.estado === postFilters.estadoPostulacion);
    }

    if (postFilters.anio) {
      filtered = filtered.filter((p) => {
        if (!p.fechaPostulacion) return false;
        const match = String(p.fechaPostulacion).match(/\b(\d{4})\b/);
        return match ? match[1] === postFilters.anio : false;
      });
    }

    if (cumpleOnly) {
      filtered = filtered.filter((p) => normalizeEstado(p.estado) === 'cumple');
    }

    setFilteredPostulaciones(filtered);
  };

  const handleClearPostFilters = () => {
    const nextFilters = cumpleOnly
      ? { ...defaultPostFilters, estadoPostulacion: 'cumple' }
      : defaultPostFilters;
    setPostFilters(nextFilters);
    setFilteredPostulaciones(
      cumpleOnly
        ? postulaciones.filter((p) => normalizeEstado(p.estado) === 'cumple')
        : postulaciones,
    );
  };

  const handleSearchServicios = () => {
    setAppliedListFilters({ ...listFilters });
  };

  const handleClearServicios = () => {
    setListFilters(defaultListFilters);
    setAppliedListFilters(defaultListFilters);
  };

  const handleVerDetalleServicio = (servicio: ServicioItem) => {
    setSelectedServicioId(servicio.id);
    setSelectedServicioNombre(servicio.nombre);
    setShowDetailFilters(true);
    setPostFilters(
      cumpleOnly ? { ...defaultPostFilters, estadoPostulacion: 'cumple' } : defaultPostFilters,
    );
    loadPostulaciones(servicio.id);
  };

  const handleVerDetallePostulacion = (postulacion: Postulacion) => {
    setSelectedPostulacion(postulacion);
    setShowDetalle(true);
  };

  const handleActualizarEstado = (postulacionId: string, nuevoEstado: string, observacion: string) => {
    const updated = postulaciones.map((p) =>
      p.id === postulacionId ? { ...p, estado: nuevoEstado, observacion } : p,
    );
    setPostulaciones(updated);
    setFilteredPostulaciones(updated);

    if (selectedPostulacion && selectedPostulacion.id === postulacionId) {
      setSelectedPostulacion({ ...selectedPostulacion, estado: nuevoEstado, observacion });
    }
    if (selectedServicioId) {
      setResumenByConv((prev) => ({
        ...prev,
        [selectedServicioId]: buildResumenFromMapped(updated),
      }));
    }
  };

  const handleEliminarServicio = (servicio: ServicioItem) => {
    setConfirmState({ open: true, servicio });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.servicio) return;
    try {
      const ok = await deleteConvocatoria(Number(confirmState.servicio.id), adminUserId);
      if (!ok) {
        alert('No se pudo eliminar el servicio.');
        return;
      }
      setServicios((prev) => prev.filter((item) => item.id !== confirmState.servicio?.id));
      setConfirmState({ open: false, servicio: null });
    } catch (error) {
      alert('No se pudo eliminar el servicio.');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case 'registrado':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Registrado</Badge>;
      case 'cumple':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Cumple</Badge>;
      case 'no cumple':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">No cumple</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  useEffect(() => {
    if (!cumpleOnly) return;
    setPostFilters((prev) => ({ ...prev, estadoPostulacion: 'cumple' }));
  }, [cumpleOnly]);

  if (showDetalle && selectedPostulacion) {
    return (
      <DetallePostulacionAdmin
        postulacion={selectedPostulacion}
        adminUserId={adminUserId}
        canEditEstado={canEvaluar}
        onClose={() => {
          setShowDetalle(false);
          setSelectedPostulacion(null);
        }}
        onActualizarEstado={handleActualizarEstado}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
            <Users className="w-8 h-8" />
            Gestión de Registros
          </h1>
          <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
            Administrar y seleccionar los registros recibidos
          </p>
        </div>
        {selectedServicioId ? (
          <Button onClick={() => setShowDetailFilters((prev) => !prev)} variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {showDetailFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        ) : (
          <Button onClick={() => setShowListFilters((prev) => !prev)} variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {showListFilters ? 'Ocultar filtro de búsqueda' : 'Mostrar filtro de búsqueda'}
          </Button>
        )}
      </div>

      {!selectedServicioId ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: '#04a25c' }}>
                Listado de Servicios
              </h2>
              <p className="text-sm text-gray-500">
                {filteredServicios.length} {filteredServicios.length === 1 ? 'servicio' : 'servicios'}
              </p>
            </div>

            {showListFilters && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Oficina de Coordinación
                    </label>
                    <select
                      value={listFilters.oficinaCoordinacion}
                      onChange={(e) =>
                        setListFilters((prev) => ({ ...prev, oficinaCoordinacion: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Todas</option>
                      {listOficinaOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Categoría de Servicio
                    </label>
                    <select
                      value={listFilters.perfil}
                      onChange={(e) => setListFilters((prev) => ({ ...prev, perfil: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Todas</option>
                      {listPerfilOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Búsqueda (Servicio)</label>
                    <input
                      type="text"
                      value={listFilters.busqueda}
                      onChange={(e) => setListFilters((prev) => ({ ...prev, busqueda: e.target.value }))}
                      placeholder="Ej: Extensionista"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={handleClearServicios}>
                    Limpiar filtros
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSearchServicios}>
                    Buscar
                  </Button>
                </div>
              </>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Servicio</TableHead>
                    <TableHead className="font-semibold">Categoría</TableHead>
                    <TableHead className="font-semibold">Oficina de Coordinación</TableHead>
                    <TableHead className="font-semibold">Oficina Zonal</TableHead>
                    <TableHead className="font-semibold text-center">Inscritos</TableHead>
                    <TableHead className="font-semibold text-center">Cumple</TableHead>
                    {!cumpleOnly && (
                      <TableHead className="font-semibold text-center">No cumple</TableHead>
                    )}
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServicios.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={cumpleOnly ? 7 : 8}
                        className="text-center text-sm text-gray-500 py-6"
                      >
                        No se encontraron servicios.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServicios.map((servicio) => {
                      const resumen = resumenByConv[servicio.id];
                      const isResumenLoading = resumenLoadingIds.includes(servicio.id);
                      return (
                        <TableRow key={servicio.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate">{servicio.nombre}</div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                              {servicio.perfil || '-'}
                            </span>
                          </TableCell>
                          <TableCell>{servicio.oficinaCoordinacion || '-'}</TableCell>
                          <TableCell>{servicio.oficinaZonal || '-'}</TableCell>
                          <TableCell className="text-center">
                            {isResumenLoading ? '...' : resumen?.total ?? 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {isResumenLoading ? '...' : resumen?.cumple ?? 0}
                          </TableCell>
                          {!cumpleOnly && (
                            <TableCell className="text-center">
                              {isResumenLoading ? '...' : resumen?.noCumple ?? 0}
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerDetalleServicio(servicio)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Ver detalle
                              </Button>
                              {canEliminarServicio && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEliminarServicio(servicio)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Servicio seleccionado</p>
              <p className="text-base font-semibold text-gray-900">{selectedServicioNombre}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedServicioId(null);
                setSelectedServicioNombre(null);
                setShowDetailFilters(true);
                setPostulaciones([]);
                setFilteredPostulaciones([]);
                setLoadError(null);
              }}
            >
              Cambiar servicio
            </Button>
          </div>

          {showDetailFilters && (
            <Card className="p-6 bg-white border-gray-200">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#04a25c' }}>
                    Filtros de Búsqueda
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Refina tu búsqueda de registros
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Oficina Zonal
                    </label>
                    <select
                      value={postFilters.oficinaZonal}
                      onChange={(e) => setPostFilters({ ...postFilters, oficinaZonal: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                    >
                      <option value="">Seleccionar...</option>
                      {oficinaZonalOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Oficina de Coordinación
                    </label>
                    <select
                      value={postFilters.oficinaCoordinacion}
                      onChange={(e) => setPostFilters({ ...postFilters, oficinaCoordinacion: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                    >
                      <option value="">Seleccionar...</option>
                      {oficinaCoordinacionOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Categoría
                    </label>
                    <select
                      value={postFilters.perfil}
                      onChange={(e) => setPostFilters({ ...postFilters, perfil: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                    >
                      <option value="">Seleccionar...</option>
                      {perfilOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!cumpleOnly && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Estado Registro
                      </label>
                      <select
                        value={postFilters.estadoPostulacion}
                        onChange={(e) => setPostFilters({ ...postFilters, estadoPostulacion: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="registrado">Registrado</option>
                        <option value="cumple">Cumple</option>
                        <option value="no cumple">No cumple</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Año de registro
                    </label>
                    <select
                      value={postFilters.anio}
                      onChange={(e) => setPostFilters({ ...postFilters, anio: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                    >
                      <option value="">Todos</option>
                      {Array.from(
                        new Set(
                          postulaciones
                            .map((p) => {
                              const match = String(p.fechaPostulacion ?? '').match(/\b(\d{4})\b/);
                              return match ? match[1] : '';
                            })
                            .filter(Boolean),
                        ),
                      )
                        .sort()
                        .map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Servicio
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={postFilters.busqueda}
                      onChange={(e) => setPostFilters({ ...postFilters, busqueda: e.target.value })}
                      placeholder="Buscar por nombre de servicio o persona..."
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSearchPostulaciones} className="bg-green-600 hover:bg-green-700 gap-2 px-6">
                    <Search className="w-4 h-4" />
                    Buscar
                  </Button>
                  <Button variant="ghost" onClick={handleClearPostFilters} className="gap-2 text-gray-700 hover:text-gray-900">
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className={`grid grid-cols-1 ${cumpleOnly ? '' : 'md:grid-cols-2'} gap-4`}>
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-sm font-semibold text-green-700">Cumple</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {filteredPostulaciones.filter((p) => p.estado === 'cumple').length}
              </p>
            </Card>
            {!cumpleOnly && (
              <Card className="p-4 bg-gray-50 border-gray-200">
                <p className="text-sm font-semibold text-gray-700">No cumple</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredPostulaciones.filter((p) => p.estado === 'no cumple').length}
                </p>
              </Card>
            )}
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: '#04a25c' }}>
                  Listado de Usuarios Registrados
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredPostulaciones.length} {filteredPostulaciones.length === 1 ? 'registro' : 'registros'}
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Persona</TableHead>
                    <TableHead className="font-semibold">DNI</TableHead>
                    <TableHead className="font-semibold">Servicio</TableHead>
                    <TableHead className="font-semibold">Oficina Zonal</TableHead>
                    <TableHead className="font-semibold">Oficina de Coordinación</TableHead>
                    <TableHead className="font-semibold">Categoría</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-gray-500 py-6">
                        Cargando registros...
                      </TableCell>
                    </TableRow>
                  ) : loadError ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-red-600 py-6">
                        {loadError}
                      </TableCell>
                    </TableRow>
                  ) : filteredPostulaciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-gray-500 py-6">
                        No se encontraron registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                      filteredPostulaciones.map((postulacion) => (
                        <TableRow key={postulacion.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{postulacion.postulante.nombre}</TableCell>
                          <TableCell>{postulacion.postulante.documento}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">{postulacion.convocatoria}</div>
                          </TableCell>
                          <TableCell>{postulacion.oficinaZonal || '-'}</TableCell>
                          <TableCell>
                            {postulacion.oficinaCoordinacion || postulacion.oficinaZonal}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                              {postulacion.perfil}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {postulacion.fechaPostulacion}
                          </TableCell>
                          <TableCell>{getEstadoBadge(postulacion.estado)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerDetallePostulacion(postulacion)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Ver Detalle
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
        </>
      )}

      <AlertDialog
        open={confirmState.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmState({ open: false, servicio: null });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState.servicio
                ? `¿Está seguro de eliminar el servicio "${confirmState.servicio.nombre}"? Esta acción no se puede deshacer.`
                : '¿Está seguro de eliminar este servicio? Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmDelete}
            >
              Sí
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
