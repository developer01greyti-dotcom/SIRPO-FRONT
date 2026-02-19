import { useEffect, useState } from 'react';
import { X, Send, MapPin, Calendar, Briefcase, CheckCircle2, Edit3, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { VistaPrevia } from './hoja-vida/VistaPrevia';
import type { LoginResponse } from '../api/auth';
import { fetchHojaVidaActual, fetchHojaVidaDatos, downloadDeclaracionesPdf } from '../api/hojaVida';
import { fetchConvocatoriaConocimientos } from '../api/convocatoriaConocimientos';

interface Convocatoria {
  id: string;
  nombre: string;
  oficinaZonal: string;
  oficinaCoordinacion: string;
  perfil: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  estado: 'abierta' | 'cerrada' | 'proxima';
  pdfUrl: string;
  conocimientos?: string[];
}

interface FamiliarDevida {
  id: number;
  apellidos: string;
  nombres: string;
  relacion: string;
  unidad: string;
}

interface Formacion {
  id: string;
  nivelEstudio: string;
  carrera: string;
  tipoInstitucion: string;
  tipoEntidad?: string;
  institucion: string;
  ruc?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  pais?: string;
  fecha: string;
  documento: string;
}

interface Curso {
  id: string;
  tipoEstudio: string;
  descripcion: string;
  tipoInstitucion: string;
  institucion: string;
  ruc?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  pais?: string;
  fechaInicio: string;
  fechaFin: string;
  horasLectivas: string;
  documento: string;
}

interface Experiencia {
  id: string;
  tipoExperiencia: string;
  tipoEntidad: string;
  nombreEntidad: string;
  departamento: string;
  provincia: string;
  distrito: string;
  area: string;
  cargo: string;
  funcionesPrincipales: string;
  motivoCese: string;
  fechaInicio: string;
  fechaFin: string;
  certificadoPreview: string | null;
}

interface InterfazPostulacionProps {
  convocatoria: Convocatoria;
  formaciones?: Formacion[];
  cursos?: Curso[];
  experiencias?: Experiencia[];
  user?: LoginResponse | null;
  onClose: () => void;
  onCompletarPostulacion: () => void;
  onRealizarCambios: () => void;
  isSubmitting?: boolean;
}

export function InterfazPostulacion({
  convocatoria,
  formaciones,
  cursos,
  experiencias,
  user,
  onClose,
  onCompletarPostulacion,
  onRealizarCambios,
  isSubmitting = false,
}: InterfazPostulacionProps) {
  const [declaracionHojaVidaId, setDeclaracionHojaVidaId] = useState<number | null>(null);
  const [aceptaDeclaracion, setAceptaDeclaracion] = useState(false);
  const [conocimientosAsignados, setConocimientosAsignados] = useState<string[]>([]);
  const [conocimientosConfirmados, setConocimientosConfirmados] = useState<boolean[]>([]);
  const [isConocimientosLoading, setIsConocimientosLoading] = useState(false);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [anexo02TieneFamiliares, setAnexo02TieneFamiliares] = useState<boolean | null>(null);
  const [anexo03Completo, setAnexo03Completo] = useState(false);
  const [anexo04Completo, setAnexo04Completo] = useState(false);
  const [familiaresDevida, setFamiliaresDevida] = useState<FamiliarDevida[]>([]);
  const [showFamiliarModal, setShowFamiliarModal] = useState(false);
  const [familiarError, setFamiliarError] = useState('');
  const [familiarDraft, setFamiliarDraft] = useState({
    apellidos: '',
    nombres: '',
    relacion: '',
    unidad: '',
  });

  useEffect(() => {
    let isActive = true;

    const loadDeclaracionUrl = async () => {
      if (!user?.idPersona || !user?.idUsuario) {
        return;
      }
      try {
        const hvActual = await fetchHojaVidaActual(user.idPersona, user.idUsuario);
        const idHojaVida = Array.isArray(hvActual)
          ? hvActual[0]?.idHojaVida
          : hvActual?.idHojaVida;
        if (!idHojaVida || !isActive) {
          return;
        }
        setDeclaracionHojaVidaId(idHojaVida);
      } catch {
        if (isActive) {
          setDeclaracionHojaVidaId(null);
        }
      }
    };

    loadDeclaracionUrl();

    return () => {
      isActive = false;
    };
  }, [user?.idPersona, user?.idUsuario]);

  useEffect(() => {
    let isActive = true;
    const loadConocimientos = async () => {
      setIsConocimientosLoading(true);
      const idConvocatoria = Number(convocatoria.id || 0);
      if (!idConvocatoria) {
        if (isActive) {
          setConocimientosAsignados(convocatoria.conocimientos ?? []);
        }
        setIsConocimientosLoading(false);
        return;
      }
      try {
        const items = await fetchConvocatoriaConocimientos(idConvocatoria, true);
        if (!isActive) return;
        const nombres = items
          .map((item) => item.conocimiento || '')
          .map((item) => item.trim())
          .filter(Boolean);
        setConocimientosAsignados(nombres);
      } catch {
        if (isActive) {
          setConocimientosAsignados(convocatoria.conocimientos ?? []);
        }
      } finally {
        if (isActive) {
          setIsConocimientosLoading(false);
        }
      }
    };
    loadConocimientos();
    return () => {
      isActive = false;
    };
  }, [convocatoria.id, convocatoria.conocimientos?.join('|')]);

  useEffect(() => {
    setConocimientosConfirmados(conocimientosAsignados.map(() => false));
  }, [conocimientosAsignados.join('|')]);

  const handleAnexo02Change = (value: boolean) => {
    setAnexo02TieneFamiliares(value);
    if (!value) {
      setFamiliaresDevida([]);
      setShowFamiliarModal(false);
      return;
    }
    setShowFamiliarModal(true);
  };

  const handleAgregarFamiliar = () => {
    const apellidos = familiarDraft.apellidos.trim();
    const nombres = familiarDraft.nombres.trim();
    const relacion = familiarDraft.relacion.trim();
    const unidad = familiarDraft.unidad.trim();
    if (!apellidos || !nombres || !relacion || !unidad) {
      setFamiliarError('Complete todos los campos del familiar.');
      return;
    }
    setFamiliaresDevida((prev) => [
      ...prev,
      {
        id: Date.now(),
        apellidos,
        nombres,
        relacion,
        unidad,
      },
    ]);
    setFamiliarDraft({
      apellidos: '',
      nombres: '',
      relacion: '',
      unidad: '',
    });
    setFamiliarError('');
    setShowFamiliarModal(false);
  };

  const handleEliminarFamiliar = (id: number) => {
    setFamiliaresDevida((prev) => prev.filter((item) => item.id !== id));
  };

  const anexo02Completo =
    anexo02TieneFamiliares !== null &&
    (!anexo02TieneFamiliares || familiaresDevida.length > 0);
  const anexosCompletos = anexo02Completo && anexo03Completo && anexo04Completo;
  const conocimientosRequeridos = conocimientosAsignados;
  const conocimientosCompletos =
    conocimientosRequeridos.length === 0 ||
    (conocimientosConfirmados.length === conocimientosRequeridos.length &&
      conocimientosConfirmados.every(Boolean));
  const showConocimientosCard = isConocimientosLoading || conocimientosRequeridos.length > 0;
  const requisitosCompletos =
    aceptaDeclaracion && anexosCompletos && conocimientosCompletos && !isConocimientosLoading;
  const isSubmittingEffective = isSubmitting || isLocalSubmitting;
  const handleCompletar = () => {
    if (isSubmittingEffective) return;
    setIsLocalSubmitting(true);
    onCompletarPostulacion();
  };

  useEffect(() => {
    if (!isSubmitting) {
      setIsLocalSubmitting(false);
    }
  }, [isSubmitting]);

  const vistaPreviaProps = {
    user,
    hideHeader: true,
    ...(formaciones ? { formaciones } : {}),
    ...(cursos ? { cursos } : {}),
    ...(experiencias ? { experiencias } : {}),
    ...(formaciones || cursos || experiencias ? { declaraciones: [] } : {}),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
              <Send className="w-8 h-8" />
              Registro del Servicio
            </h1>
            <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
              Revisa tu información y completa tu registro
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
        </div>
      </div>

      {/* Información del Servicio */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {convocatoria.nombre}
                  </h3>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
                    {convocatoria.perfil}
                  </Badge>
                  {conocimientosRequeridos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {conocimientosRequeridos.map((conocimiento) => (
                        <span
                          key={conocimiento}
                          className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                        >
                          {conocimiento}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Oficina de Coordinación</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {convocatoria.oficinaCoordinacion}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Fecha Inicio</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {convocatoria.fechaInicio}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Fecha Fin</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {convocatoria.fechaFin}
                    </p>
                    {convocatoria.diasRestantes <= 3 && (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        ⚠ Quedan {convocatoria.diasRestantes}{' '}
                        {convocatoria.diasRestantes === 1 ? 'día' : 'días'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Botones de Acción Superiores */}
      <div className="flex items-center justify-between gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-500 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Revisa tu información</p>
            <p className="text-sm text-gray-600">
              Verifica que todos tus datos sean correctos antes de completar tu registro
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button
            variant="outline"
            className="gap-2 border-gray-300 hover:bg-gray-50"
            onClick={onRealizarCambios}
          >
            <Edit3 className="w-4 h-4" />
            Realizar cambios
          </Button>
          <Button
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={handleCompletar}
            disabled={!requisitosCompletos || isSubmittingEffective}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmittingEffective ? 'Registrando...' : 'Completar registro'}
          </Button>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <div className="p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Leer declaracion jurada</p>
              <p className="text-sm text-gray-600">
                Se mostrara el PDF con tus datos completos antes de continuar.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={async () => {
              if (!declaracionHojaVidaId) return;
              try {
                let distrito = '';
                let provincia = '';
                let departamento = '';
                let idUbigeo: string | number | undefined;
                let correo2 = '';
                try {
                  const datos = await fetchHojaVidaDatos(declaracionHojaVidaId);
                  if (datos) {
                    distrito = String(datos.distrito || '').trim();
                    idUbigeo = datos.distritoId;
                    correo2 = String(datos.correoSecundario || '').trim();
                    if (distrito.includes('/')) {
                      const parts = distrito.split('/').map((item) => item.trim()).filter(Boolean);
                      if (parts.length >= 3) {
                        departamento = parts[0] || '';
                        provincia = parts[1] || '';
                        distrito = parts[2] || distrito;
                      } else if (parts.length === 2) {
                        provincia = parts[0] || '';
                        distrito = parts[1] || distrito;
                      }
                    }
                  }
                } catch {
                  // No-op: fallback to backend resolution.
                }
                const oficinaZonal =
                  convocatoria.oficinaZonal?.trim() ||
                  (convocatoria.oficinaCoordinacion || '').split('/')[0]?.trim() ||
                  '';
                const { blob, contentType } = await downloadDeclaracionesPdf(declaracionHojaVidaId, {
                  idConvocatoria: Number(convocatoria.id || 0) || undefined,
                  idPersona: user?.idPersona ? Number(user.idPersona) : undefined,
                  oficinaZonal: oficinaZonal || undefined,
                  oficinaCoordinacion: convocatoria.oficinaCoordinacion,
                  distrito: distrito || undefined,
                  provincia: provincia || undefined,
                  departamento: departamento || undefined,
                  idUbigeo: idUbigeo,
                  correo2: correo2 || undefined,
                  familiares: familiaresDevida.map((familiar) => ({
                    apellidos: familiar.apellidos,
                    nombres: familiar.nombres,
                    relacion: familiar.relacion,
                    unidad: familiar.unidad,
                  })),
                });
                if (!contentType.toLowerCase().includes('pdf')) {
                  toast.error('No se pudo cargar el PDF de declaracion jurada.');
                  return;
                }
                const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                if (pdfBlob.size === 0) {
                  toast.error('El PDF de declaracion jurada llego vacio.');
                  return;
                }
                const url = window.URL.createObjectURL(pdfBlob);
                window.open(url, '_blank', 'noopener,noreferrer');
                setTimeout(() => window.URL.revokeObjectURL(url), 30000);
              } catch {
                toast.error('No se pudo cargar el PDF de declaracion jurada.');
              }
            }}
            disabled={!declaracionHojaVidaId}
          >
            <FileText className="w-4 h-4" />
            Ver PDF
          </Button>
        </div>
        <div className="px-5 pb-5">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox
              checked={aceptaDeclaracion}
              onCheckedChange={(value) => setAceptaDeclaracion(Boolean(value))}
            />
            Acepto declaracion jurada
          </label>
        </div>
      </Card>

      {showConocimientosCard && (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Confirmo tener conocimiento en:
                </p>
                <p className="text-sm text-gray-600">
                  Marca cada conocimiento requerido para continuar.
                </p>
              </div>
            </div>
            {isConocimientosLoading ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                Cargando conocimientos...
              </div>
            ) : conocimientosRequeridos.length === 0 ? (
              <p className="text-sm text-gray-600">
                No hay conocimientos requeridos para este servicio.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {conocimientosRequeridos.map((conocimiento, index) => (
                  <label
                    key={`${conocimiento}-${index}`}
                    className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-700"
                  >
                    <Checkbox
                      checked={Boolean(conocimientosConfirmados[index])}
                      onCheckedChange={(value) => {
                        setConocimientosConfirmados((prev) => {
                          const next = [...prev];
                          next[index] = Boolean(value);
                          return next;
                        });
                      }}
                    />
                    <span>{conocimiento}</span>
                  </label>
                ))}
              </div>
            )}
            {!conocimientosCompletos && (
              <p className="text-sm text-amber-700 font-medium">
                Debes confirmar todos los conocimientos para completar el registro.
              </p>
            )}
          </div>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50">
        <div className="p-5 space-y-5">
          <div>
            <p className="font-semibold text-gray-900">Llenado de Anexos</p>
            <p className="text-sm text-gray-600">
              Completa los anexos 02, 03 y 04 para habilitar el envío.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Anexo 02: Declaración de familiares en DEVIDA</p>
                <p className="text-sm text-gray-600">
                  Indica si tienes familiares trabajando en DEVIDA.
                </p>
              </div>
              <Badge className={anexo02Completo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {anexo02Completo ? 'Completo' : 'Pendiente'}
              </Badge>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="anexo02"
                  checked={anexo02TieneFamiliares === true}
                  onChange={() => handleAnexo02Change(true)}
                />
                Sí, tengo familiares
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="anexo02"
                  checked={anexo02TieneFamiliares === false}
                  onChange={() => handleAnexo02Change(false)}
                />
                No tengo familiares
              </label>
            </div>
            {anexo02TieneFamiliares && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Familiares registrados: {familiaresDevida.length}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setShowFamiliarModal(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar familiar
                  </Button>
                </div>
                {familiaresDevida.length > 0 ? (
                  <div className="overflow-x-auto rounded-md border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Apellidos</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Nombres</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Relación</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Unidad</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {familiaresDevida.map((familiar) => (
                          <tr key={familiar.id} className="border-t border-gray-200">
                            <td className="px-3 py-2 text-gray-700">{familiar.apellidos}</td>
                            <td className="px-3 py-2 text-gray-700">{familiar.nombres}</td>
                            <td className="px-3 py-2 text-gray-700">{familiar.relacion}</td>
                            <td className="px-3 py-2 text-gray-700">{familiar.unidad}</td>
                            <td className="px-3 py-2 text-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-red-600 hover:text-red-700 hover:border-red-300"
                                onClick={() => handleEliminarFamiliar(familiar.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    Debes registrar al menos un familiar para completar el Anexo 02.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Anexo 03: Declaración de veracidad</p>
                <p className="text-sm text-gray-600">
                  Confirmo que la información registrada es veraz y verificable.
                </p>
              </div>
              <Badge className={anexo03Completo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {anexo03Completo ? 'Completo' : 'Pendiente'}
              </Badge>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={anexo03Completo}
                onCheckedChange={(value) => setAnexo03Completo(Boolean(value))}
              />
              Completar Anexo 03
            </label>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Anexo 04: Declaración de compromiso</p>
                <p className="text-sm text-gray-600">
                  Acepto el compromiso y autorizo la validación de esta declaración.
                </p>
              </div>
              <Badge className={anexo04Completo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {anexo04Completo ? 'Completo' : 'Pendiente'}
              </Badge>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={anexo04Completo}
                onCheckedChange={(value) => setAnexo04Completo(Boolean(value))}
              />
              Completar Anexo 04
            </label>
          </div>

          {!anexosCompletos && (
            <p className="text-sm text-amber-700">
              Debes completar los anexos 02, 03 y 04 para continuar.
            </p>
          )}
        </div>
      </Card>

      {/* Vista Previa de la Hoja de Vida */}
      <VistaPrevia {...vistaPreviaProps} />

      <Card className="border-slate-200 bg-slate-50">
        <div className="p-5 space-y-2">
          <p className="font-semibold text-gray-900">Declaración Jurada junto al CV</p>
          <p className="text-sm text-gray-600">
            El resumen de la DJ (anexos 02, 03 y 04) viajará con tu CV al final del registro.
          </p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              Anexo 02:{' '}
              {anexo02TieneFamiliares === null
                ? 'Pendiente'
                : anexo02TieneFamiliares
                ? `Familiares registrados (${familiaresDevida.length})`
                : 'Sin familiares en DEVIDA'}
            </li>
            <li>Anexo 03: {anexo03Completo ? 'Completo' : 'Pendiente'}</li>
            <li>Anexo 04: {anexo04Completo ? 'Completo' : 'Pendiente'}</li>
          </ul>
        </div>
      </Card>

      {/* Botones de Acción Inferiores */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="gap-2 border-gray-300 hover:bg-gray-50"
          onClick={onRealizarCambios}
        >
          <Edit3 className="w-4 h-4" />
          Realizar cambios
        </Button>
        <Button
          className="gap-2 bg-green-600 hover:bg-green-700"
          onClick={handleCompletar}
          disabled={!requisitosCompletos || isSubmittingEffective}
        >
          <CheckCircle2 className="w-4 h-4" />
          {isSubmittingEffective ? 'Registrando...' : 'Completar registro'}
        </Button>
      </div>

      {showFamiliarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900">Registrar familiar en DEVIDA</h4>
            <p className="mt-1 text-sm text-gray-600">
              Completa los datos requeridos para el Anexo 02.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Apellidos</label>
                <input
                  type="text"
                  value={familiarDraft.apellidos}
                  onChange={(event) =>
                    setFamiliarDraft((prev) => ({ ...prev, apellidos: event.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nombres</label>
                <input
                  type="text"
                  value={familiarDraft.nombres}
                  onChange={(event) =>
                    setFamiliarDraft((prev) => ({ ...prev, nombres: event.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Relación</label>
                <input
                  type="text"
                  value={familiarDraft.relacion}
                  onChange={(event) =>
                    setFamiliarDraft((prev) => ({ ...prev, relacion: event.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Unidad en la que labora</label>
                <input
                  type="text"
                  value={familiarDraft.unidad}
                  onChange={(event) =>
                    setFamiliarDraft((prev) => ({ ...prev, unidad: event.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {familiarError && <p className="mt-3 text-sm text-red-600">{familiarError}</p>}

            <div className="mt-5 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFamiliarModal(false);
                  setFamiliarError('');
                }}
              >
                Cancelar
              </Button>
              <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handleAgregarFamiliar}>
                Guardar familiar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
