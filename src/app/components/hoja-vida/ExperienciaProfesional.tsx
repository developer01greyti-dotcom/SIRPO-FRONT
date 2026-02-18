import { Briefcase, Plus, Edit2, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { ExperienciaForm } from './ExperienciaForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { PdfViewer } from '../PdfViewer';
import { fetchHojaVidaActual, fetchHojaVidaDatos, fetchHvExpList, deleteHvExp } from '../../api/hojaVida';
import type { LoginResponse } from '../../api/auth';

interface Experiencia {
  id: string;
  idHvExperiencia?: string;
  tipoExperiencia: string;
  tipoExperienciaId?: string;
  tipoEntidad: string;
  tipoEntidadId?: string;
  nombreEntidad: string;
  ruc?: string;
  distritoId?: string;
  distritoDescripcion?: string;
  area: string;
  cargo: string;
  funcionesPrincipales: string;
  motivoCese: string;
  motivoCeseId?: string;
  fechaInicio: string;
  fechaFin: string;
  certificadoPreview: string | null;
  experienciaEspecifica?: boolean;
}

export function ExperienciaProfesional({ user }: { user: LoginResponse | null }) {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hojaVidaId, setHojaVidaId] = useState(0);
  const [rucPersona, setRucPersona] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [vistaActual, setVistaActual] = useState<'lista' | 'formulario' | 'pdf-viewer'>('lista');
  const [modoFormulario, setModoFormulario] = useState<'crear' | 'editar'>('crear');
  const [experienciaToEdit, setExperienciaToEdit] = useState<Experiencia | null>(null);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [experienciaToDelete, setExperienciaToDelete] = useState<string | null>(null);
  
  // Estados para el visor de PDF
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');

  const buildFileUrl = (guid: string) => {
    const apiBaseUrl =
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
      'http://localhost:8087/sirpo/v1';
    const params = new URLSearchParams({ guid });
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`;
  };

  const normalizeEspecifica = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    if (value === 0 || value === '0') return true;
    if (value === 1 || value === '1') return false;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return false;
  };

  const normalizeExperiencias = (items: any[]): Experiencia[] => {
    return items.map((item, index) => {
      const especificaRaw =
        item.experienciaEspecifica ??
        item.experiencia_especifica ??
        item.especifica ??
        false;
      const experienciaEspecifica = normalizeEspecifica(especificaRaw);
      return {
        id: String(item.id ?? item.idHvExperiencia ?? index),
        idHvExperiencia: String(item.idHvExperiencia ?? ''),
        tipoExperiencia: item.tipoExperiencia ?? '',
        tipoExperienciaId: item.tipoExperienciaId ?? '',
        tipoEntidad: item.tipoEntidad ?? '',
        tipoEntidadId: item.tipoEntidadId ?? '',
        nombreEntidad: item.nombreEntidad ?? '',
        ruc: item.ruc ?? '',
        distritoId: item.distritoId ?? '',
        distritoDescripcion: item.distritoDescripcion ?? '',
        area: item.area ?? '',
        cargo: item.cargo ?? '',
        funcionesPrincipales: item.funcionesPrincipales ?? '',
        motivoCese: item.motivoCese ?? '',
        motivoCeseId: item.motivoCeseId ?? '',
        fechaInicio: item.fechaInicio ?? '',
        fechaFin: item.fechaFin ?? '',
        certificadoPreview: item.archivoGuid ? buildFileUrl(String(item.archivoGuid)) : null,
        experienciaEspecifica,
      };
    });
  };

  const parseFecha = (value: string): Date | null => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.split('-');
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    if (value.includes('/')) {
      const [dd, mm, yyyy] = value.split('/');
      if (dd && mm && yyyy) {
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
    }
    const normalized = value.toLowerCase();
    if (normalized.includes(' de ')) {
      const match = normalized.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})/i);
      if (match) {
        const day = Number(match[1]);
        const monthName = match[2];
        const year = Number(match[3]);
        const monthMap: Record<string, number> = {
          enero: 0,
          febrero: 1,
          marzo: 2,
          abril: 3,
          mayo: 4,
          junio: 5,
          julio: 6,
          agosto: 7,
          septiembre: 8,
          setiembre: 8,
          octubre: 9,
          noviembre: 10,
          diciembre: 11,
        };
        const monthIndex = monthMap[monthName];
        if (monthIndex !== undefined) {
          return new Date(year, monthIndex, day);
        }
      }
    }
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  };

  const handleAgregarExperiencia = () => {
    setModoFormulario('crear');
    setExperienciaToEdit(null);
    setVistaActual('formulario');
  };

  const handleEditarExperiencia = (experiencia: Experiencia) => {
    setModoFormulario('editar');
    setExperienciaToEdit(experiencia);
    setVistaActual('formulario');
  };

  const handleEliminarExperiencia = (id: string) => {
    setExperienciaToDelete(id);
    setDialogEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (!experienciaToDelete) {
      setDialogEliminar(false);
      return;
    }
    if (!user?.idUsuario) {
      setLoadError('No se pudo eliminar la experiencia profesional.');
      setDialogEliminar(false);
      setExperienciaToDelete(null);
      return;
    }
    const idHvExperiencia = Number(experienciaToDelete || 0);
    if (!idHvExperiencia) {
      setLoadError('No se pudo eliminar la experiencia profesional.');
      setDialogEliminar(false);
      setExperienciaToDelete(null);
      return;
    }
    try {
      const ok = await deleteHvExp(idHvExperiencia, user.idUsuario);
      if (ok) {
        setRefreshKey((prev) => prev + 1);
      } else {
        setLoadError('No se pudo eliminar la experiencia profesional.');
      }
    } catch (error) {
      setLoadError('No se pudo eliminar la experiencia profesional.');
    } finally {
      setDialogEliminar(false);
      setExperienciaToDelete(null);
    }
  };

  const handleSaveExperiencia = () => {
    setRefreshKey((prev) => prev + 1);
    setVistaActual('lista');
    setExperienciaToEdit(null);
  };

  useEffect(() => {
    let isActive = true;

    const loadExperiencias = async () => {
      if (!user?.idPersona || !user?.idUsuario) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const hvActual = await fetchHojaVidaActual(user.idPersona, user.idUsuario);
        const idHojaVida = Array.isArray(hvActual)
          ? hvActual[0]?.idHojaVida
          : hvActual?.idHojaVida;

        if (!idHojaVida) {
          if (isActive) {
            setExperiencias([]);
          }
          return;
        }
        setHojaVidaId(idHojaVida);
        const [expData, datosHv] = await Promise.all([
          fetchHvExpList(idHojaVida),
          fetchHojaVidaDatos(idHojaVida),
        ]);
        if (!isActive) {
          return;
        }
        setRucPersona(String(datosHv?.ruc ?? user?.ruc ?? '').trim());
        const items = Array.isArray(expData) ? expData : expData ? [expData] : [];
        setExperiencias(normalizeExperiencias(items));
      } catch (error) {
        if (isActive) {
          setLoadError('No se pudo cargar la experiencia profesional.');
          setExperiencias([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadExperiencias();
    return () => {
      isActive = false;
    };
  }, [user?.idPersona, user?.idUsuario, refreshKey]);

  const formatFecha = (fecha: string) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcularTotalExperiencia = (items: Experiencia[]) => {
    let totalDays = 0;
    items.forEach((exp) => {
      const start = parseFecha(exp.fechaInicio);
      if (!start) return;
      const motivo = (exp.motivoCese || '').toLowerCase();
      const end =
        motivo.includes('actual')
          ? new Date()
          : parseFecha(exp.fechaFin) ?? new Date();
      if (end < start) return;
      const diffDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
      totalDays += diffDays;
    });
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    return { years, months, days, totalDays };
  };

  const experienciasEspecificas = experiencias.filter((exp) => exp.experienciaEspecifica);
  const experienciasGenerales = experiencias.filter((exp) => !exp.experienciaEspecifica);
  const totalExperienciaGeneral = calcularTotalExperiencia(experienciasGenerales);
  const totalExperienciaEspecifica = calcularTotalExperiencia(experienciasEspecificas);
  const totalExperienciaTotal = calcularTotalExperiencia(experiencias);

  const getTipoExperienciaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'empleo': 'Empleo',
      'practicas-profesionales': 'Prácticas profesionales',
      'practicas-pre-profesionales': 'Prácticas pre-profesionales',
    };
    return labels[tipo] || tipo;
  };

  const getTipoEntidadLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'publico': 'Público',
      'privado': 'Privado',
    };
    return labels[tipo] || tipo;
  };

  const getMotivoCeseLabel = (motivo: string) => {
    const labels: Record<string, string> = {
      'despido': 'Despido',
      'fin-contrato': 'Fin del contrato',
      'renuncia': 'Renuncia',
      'actualidad': 'Hasta la actualidad',
    };
    return labels[motivo] || motivo;
  };

  const renderExperienciasTable = (items: Experiencia[], emptyText: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">{emptyText}</p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Entidad</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Tipo Experiencia</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Tipo Entidad</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Periodo</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Motivo de Cese</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Certificado</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((experiencia, index) => (
              <tr key={`${experiencia.id}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{experiencia.cargo || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{experiencia.nombreEntidad || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getTipoExperienciaLabel(experiencia.tipoExperiencia)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getTipoEntidadLabel(experiencia.tipoEntidad)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {experiencia.motivoCese === 'actualidad'
                    ? `${formatFecha(experiencia.fechaInicio)} - Actualidad`
                    : `${formatFecha(experiencia.fechaInicio)} - ${formatFecha(experiencia.fechaFin)}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getMotivoCeseLabel(experiencia.motivoCese)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {experiencia.certificadoPreview ? (
                    <span className="text-green-600 font-medium">Con archivo</span>
                  ) : (
                    'Sin archivo'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditarExperiencia(experiencia)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEliminarExperiencia(experiencia.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                      {experiencia.certificadoPreview && (
                        <DropdownMenuItem
                          onClick={() => {
                            setVistaActual('pdf-viewer');
                            setPdfUrl(experiencia.certificadoPreview || '');
                            setPdfTitle(`Certificado - ${experiencia.cargo}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {vistaActual === 'lista' ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#04a25c' }}>
                  Experiencia Profesional
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Detalla tu experiencia laboral relevante
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Button
                  type="button"
                  onClick={handleAgregarExperiencia}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Listado de Experiencias */}
            {isLoading ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed text-gray-600">
                Cargando experiencia profesional...
              </div>
            ) : loadError ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed text-red-600">
                {loadError}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Totales:</span>
                  <span>
                    General: {totalExperienciaGeneral.years} años, {totalExperienciaGeneral.months} meses, {totalExperienciaGeneral.days} días
                  </span>
                  <span>
                    Específica: {totalExperienciaEspecifica.years} años, {totalExperienciaEspecifica.months} meses, {totalExperienciaEspecifica.days} días
                  </span>
                  <span className="font-semibold text-gray-900">
                    Total: {totalExperienciaTotal.years} años, {totalExperienciaTotal.months} meses, {totalExperienciaTotal.days} días
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-900">Experiencia General</h4>
                    {totalExperienciaGeneral.totalDays > 0 && (
                      <p className="text-sm text-gray-700 whitespace-nowrap">
                        Total: {totalExperienciaGeneral.years} años, {totalExperienciaGeneral.months} meses, {totalExperienciaGeneral.days} días
                      </p>
                    )}
                  </div>
                  {renderExperienciasTable(experienciasGenerales, 'No hay experiencias profesionales registradas')}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-900">Experiencia Específica</h4>
                    {totalExperienciaEspecifica.totalDays > 0 && (
                      <p className="text-sm text-gray-700 whitespace-nowrap">
                        Total: {totalExperienciaEspecifica.years} años, {totalExperienciaEspecifica.months} meses, {totalExperienciaEspecifica.days} días
                      </p>
                    )}
                  </div>
                  {renderExperienciasTable(experienciasEspecificas, 'No hay experiencias específicas registradas')}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : vistaActual === 'formulario' ? (
        <ExperienciaForm
          modo={modoFormulario}
          experiencia={experienciaToEdit}
          onGuardar={handleSaveExperiencia}
          idHojaVida={hojaVidaId}
          usuarioAccion={user?.idUsuario || 0}
          rucPersona={rucPersona || user?.ruc}
          onCancelar={() => {
            setVistaActual('lista');
            setExperienciaToEdit(null);
          }}
        />
      ) : (
        <PdfViewer
          url={pdfUrl}
          title={pdfTitle}
          onVolver={() => setVistaActual('lista')}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={dialogEliminar} onOpenChange={setDialogEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar experiencia profesional?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este registro de experiencia profesional.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEliminar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminar}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
