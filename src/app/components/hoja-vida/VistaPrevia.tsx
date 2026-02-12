import { useEffect, useState } from 'react';
import { User, MapPin, FileText, GraduationCap, Briefcase, Download, Eye, Phone, Mail, Calendar, Building2, Award, Home, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import type { LoginResponse } from '../../api/auth';
import { downloadHojaVidaPdf, fetchHojaVidaActual, fetchHojaVidaDatos, fetchHvCurList, fetchHvDeclList, fetchHvExpList, fetchHvFormList, updateHojaVidaEstado, type HojaVidaActual } from '../../api/hojaVida'; 
import { PAISES_CATALOGO } from '../../data/paises';

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
  ruc?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  area: string;
  cargo: string;
  funcionesPrincipales: string;
  motivoCese: string;
  fechaInicio: string;
  fechaFin: string;
  certificadoPreview: string | null;
  experienciaEspecifica?: boolean;
}

interface Declaracion {
  id: string;
  nombre: string;
  descripcion: string;
  archivoAdjunto: { file: File; preview: string } | null;
  archivoGuid?: string;
}

interface DatosPersonalesData {
  tipoDocumento: string;
  estadoCivil: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  fechaNacimiento: string;
  nacionalidad: string;
  correo: string;
  correoSecundario?: string;
  ruc: string;
  celular: string;
  cuentaBn: string;
  cciBn: string;
  direccion: string;
  referencia: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

interface VistaPreviaProps {
  user?: LoginResponse | null;
  datosPersonales?: DatosPersonalesData;
  formaciones?: Formacion[];
  cursos?: Curso[];
  experiencias?: Experiencia[];
  declaraciones?: Declaracion[];
  hideHeader?: boolean;
}

export function VistaPrevia({
  user,
  datosPersonales: datosPersonalesProp,
  formaciones: formacionesProp,
  cursos: cursosProp,
  experiencias: experienciasProp,
  declaraciones: declaracionesProp,
  hideHeader,
}: VistaPreviaProps) {
  const [datosPersonalesState, setDatosPersonalesState] = useState<DatosPersonalesData | null>(null);
  const [formacionesState, setFormacionesState] = useState<Formacion[]>([]);
  const [cursosState, setCursosState] = useState<Curso[]>([]);
  const [experienciasState, setExperienciasState] = useState<Experiencia[]>([]); 
  const [declaracionesState, setDeclaracionesState] = useState<Declaracion[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [hojaVidaActual, setHojaVidaActual] = useState<HojaVidaActual | null>(null); 
  const [isCompleting, setIsCompleting] = useState(false); 
  const [completionMessage, setCompletionMessage] = useState<string | null>(null); 
  const [completionError, setCompletionError] = useState<string | null>(null); 
  const [loadError, setLoadError] = useState<string | null>(null); 
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  // Helper function para mostrar valores o placeholder
  const displayValue = (value: string | undefined, placeholder = 'Sin información') => {
    return value || placeholder;
  };

  const buildFileUrl = (guid: string) => {
    const apiBaseUrl =
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
      'http://localhost:8087/sirpo/v1';
    const params = new URLSearchParams({ guid });
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`;
  };

  const downloadFile = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const previewFile = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

  const formatFecha = (fecha: string) => {
    if (!fecha) return '-';
    const parsed = parseFecha(fecha);
    if (!parsed) return fecha;
    return parsed.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatUbigeo = (departamento?: string, provincia?: string, distrito?: string) => {
    return [departamento, provincia, distrito].filter(Boolean).join(' / ');
  };
  const getPaisDescripcion = (pais?: string) => {
    if (!pais) return '';
    const normalized = pais.trim().toUpperCase();
    const match = PAISES_CATALOGO.find(
      (item) => item.id === normalized || item.descripcion === normalized,
    );
    return match ? match.descripcion : pais;
  };


  const hasProvidedData = Boolean(
    datosPersonalesProp ||
      (formacionesProp && formacionesProp.length) ||
      (cursosProp && cursosProp.length) ||
      (experienciasProp && experienciasProp.length) ||
      (declaracionesProp && declaracionesProp.length),
  );

  useEffect(() => {
    let isActive = true;

    const loadVistaPrevia = async () => {
      if (!user?.idPersona || !user?.idUsuario || hasProvidedData) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const hvActual = await fetchHojaVidaActual(user.idPersona, user.idUsuario); 
        if (isActive) { 
          setHojaVidaActual(hvActual); 
        } 
        const idHojaVida = hvActual?.idHojaVida;
        if (!idHojaVida) {
          if (isActive) {
            setDatosPersonalesState(null);
            setFormacionesState([]);
            setCursosState([]);
            setExperienciasState([]);
            setDeclaracionesState([]);
            setLoadError('No se encontró una Hoja de Vida registrada para este usuario.');
          }
          return;
        }

        const [datos, formacionesData, cursosData, experienciasData, declaracionesData] = await Promise.all([
          fetchHojaVidaDatos(idHojaVida),
          fetchHvFormList(idHojaVida),
          fetchHvCurList(idHojaVida),
          fetchHvExpList(idHojaVida),
          fetchHvDeclList(idHojaVida),
        ]);

        if (!isActive) {
          return;
        }

        if (datos) {
          setDatosPersonalesState({
            tipoDocumento: datos.tipoDocumento || String(datos.tipoDocumentoId ?? ''),
            estadoCivil: datos.estadoCivil || '',
            numeroDocumento: datos.numeroDocumento || '',
            nombres: datos.nombres || '',
            apellidoPaterno: datos.apellidoPaterno || '',
            apellidoMaterno: datos.apellidoMaterno || '',
            sexo: typeof datos.sexo === 'string' ? datos.sexo : String(datos.sexo ?? ''),
            fechaNacimiento: datos.fechaNacimiento || '',
            nacionalidad: datos.nacionalidad || '',
            correo: datos.correo || '',
            correoSecundario: datos.correoSecundario || '',
            ruc: datos.ruc || '',
            celular: datos.telefonoCelular || '',
            cuentaBn: datos.cuentaBn || '',
            cciBn: datos.cciBn || '',
            direccion: datos.direccion || '',
            referencia: datos.referencia || '',
            departamento: '',
            provincia: '',
            distrito: datos.distrito || '',
          });
        } else {
          setDatosPersonalesState(null);
        }

        setFormacionesState(
          formacionesData.map((item) => ({
            id: String(item.id ?? item.idHvFormacion ?? ''),
            nivelEstudio: item.nivelEstudio ?? '',
            carrera: item.carrera ?? '',
            tipoInstitucion: item.tipoInstitucion ?? '',
            tipoEntidad: item.tipoEntidad ?? '',
            institucion: item.institucion ?? '',
            ruc: item.ruc ?? '',
            distrito: item.distritoDescripcion ?? item.distrito ?? '',
            pais: item.pais ?? '',
            fecha: item.fecha ?? item.fechaObtencion ?? '',
            documento: item.archivoGuid ?? '',
          })),
        );

        setCursosState(
          cursosData.map((item) => ({
            id: String(item.id ?? item.idHvCurso ?? ''),
            tipoEstudio: item.tipoEstudio ?? '',
            descripcion: item.descripcion ?? '',
            tipoInstitucion: item.tipoInstitucion ?? '',
            institucion: item.institucion ?? '',
            ruc: item.ruc ?? '',
            distrito: item.distritoDescripcion ?? item.distrito ?? '',
            pais: item.pais ?? '',
            fechaInicio: item.fechaInicio ?? '',
            fechaFin: item.fechaFin ?? '',
            horasLectivas: String(item.horasLectivas ?? ''),
            documento: item.archivoGuid ?? '',
          })),
        );

        setExperienciasState(
          experienciasData.map((item) => ({
            id: String(item.id ?? item.idHvExperiencia ?? ''),
            tipoExperiencia: item.tipoExperiencia ?? '',
            tipoEntidad: item.tipoEntidad ?? '',
            nombreEntidad: item.nombreEntidad ?? '',
            distrito: item.distritoDescripcion ?? item.distrito ?? '',
            area: item.area ?? '',
            cargo: item.cargo ?? '',
            funcionesPrincipales: item.funcionesPrincipales ?? '',
            motivoCese: item.motivoCese ?? '',
            fechaInicio: item.fechaInicio ?? '',
            fechaFin: item.fechaFin ?? '',
            certificadoPreview: item.archivoGuid ? buildFileUrl(String(item.archivoGuid)) : null,
            experienciaEspecifica:
              item.experienciaEspecifica ??
              item.experiencia_especifica ??
              item.especifica ??
              false,
          })),
        );

        setDeclaracionesState(
          declaracionesData.map((item, index) => ({
            id: String(item.id ?? item.idDeclaracionTipo ?? index),
            nombre: item.nombre ?? '',
            descripcion: item.descripcion ?? '',
            archivoAdjunto: null,
            archivoGuid: item.archivoGuid ?? '',
          })),
        );
      } catch (error) {
        if (isActive) {
          setLoadError('No se pudo cargar la vista previa.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadVistaPrevia();

    return () => {
      isActive = false;
    };
  }, [user?.idPersona, user?.idUsuario, hasProvidedData]);

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

  const renderExperiencias = (items: Experiencia[], emptyText: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{emptyText}</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {items.map((exp, index) => (
          <div key={`${exp.id}-${index}`}>
            {index > 0 && <Separator className="my-6" />}
            <div className="relative pl-6 border-l-4 border-teal-600">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-teal-600 rounded-full"></div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h5 className="text-base font-semibold text-gray-900">
                      {exp.cargo || 'Sin cargo'}
                    </h5>
                    <p className="text-sm text-teal-600 font-medium">{exp.nombreEntidad || 'Sin entidad'}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full flex-shrink-0">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {exp.fechaInicio && exp.fechaFin
                        ? `${formatFecha(exp.fechaInicio)} - ${exp.motivoCese === 'actualidad' ? 'Actualidad' : formatFecha(exp.fechaFin)}`
                        : 'Sin fechas'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Tipo de Experiencia</p>
                    <p className="text-sm font-medium text-gray-900">{getTipoExperienciaLabel(exp.tipoExperiencia)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Tipo de Entidad</p>
                    <p className="text-sm font-medium text-gray-900">{getTipoEntidadLabel(exp.tipoEntidad)}</p>
                  </div>
                  {exp.area && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Área</p>
                      <p className="text-sm font-medium text-gray-900">{exp.area}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Motivo de Cese</p>
                    <p className="text-sm font-medium text-gray-900">{getMotivoCeseLabel(exp.motivoCese)}</p>
                  </div>
                </div>

                {(exp.departamento || exp.provincia || exp.distrito) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 flex-1">
                      <p className="text-xs text-gray-500">Ubigeo</p>
                      <p className="text-sm text-gray-600">
                        {formatUbigeo(exp.departamento, exp.provincia, exp.distrito)}
                      </p>
                    </div>
                  </div>
                )}

                {exp.funcionesPrincipales && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Funciones Principales:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{exp.funcionesPrincipales}</p>
                  </div>
                )}

                {exp.certificadoPreview && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      <FileText className="w-3 h-3" />
                      Certificado adjuntado
                    </div>
                    <button
                      type="button"
                      onClick={() => previewFile(exp.certificadoPreview)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors print:hidden"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(exp.certificadoPreview, `experiencia_${exp.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors print:hidden"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const datosPersonales = datosPersonalesProp ?? datosPersonalesState ?? {
    tipoDocumento: '',
    estadoCivil: '',
    numeroDocumento: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    sexo: '',
    fechaNacimiento: '',
    nacionalidad: '',
    correo: '',
    correoSecundario: '',
    ruc: '',
    celular: '',
    cuentaBn: '',
    cciBn: '',
    direccion: '',
    referencia: '',
    departamento: '',
    provincia: '',
    distrito: '',
  };

  const toBool = (value: any) => {
    if (value === true || value === 'true' || value === '1') return true;
    const numeric = Number(value);
    return !Number.isNaN(numeric) ? numeric > 0 : false;
  };

  const formaciones = formacionesProp ?? formacionesState;
  const cursos = cursosProp ?? cursosState;
  const experienciasBase = experienciasProp ?? experienciasState;
  const experiencias = experienciasBase.map((exp) => ({
    ...exp,
    experienciaEspecifica: toBool(
      exp.experienciaEspecifica ?? exp.experiencia_especifica ?? exp.especifica ?? false,
    ),
  }));
  const declaraciones = declaracionesProp ?? declaracionesState;
  const calcularTotalExperiencia = (items: Experiencia[]) => {
    let totalDays = 0;
    items.forEach((exp) => {
      const start = parseFecha(exp.fechaInicio);
      if (!start) return;
      const motivo = (exp.motivoCese || '').toLowerCase();
      const end = motivo.includes('actual')
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
  const hasPersonalData = Boolean(
    datosPersonales.nombres ||
      datosPersonales.apellidoPaterno ||
      datosPersonales.apellidoMaterno ||
      datosPersonales.numeroDocumento ||
      datosPersonales.correo,
  );
  const hasContent = Boolean(
    hasPersonalData ||
      formaciones.length ||
      cursos.length ||
      experiencias.length ||
      declaraciones.length,
  );
  const canDownload = hasContent && !loadError;

  const nombreCompleto = `${datosPersonales.nombres} ${datosPersonales.apellidoPaterno} ${datosPersonales.apellidoMaterno}`.trim(); 
  const isHojaVidaCompleta = hojaVidaActual?.estado?.toUpperCase() === 'COMPLETO'; 

  const handleCompletarHojaVida = async () => { 
    if (!user?.idUsuario) { 
      setCompletionError('No se pudo completar la Hoja de Vida.'); 
      return; 
    } 
    if (!hojaVidaActual?.idHojaVida) { 
      setCompletionError('No se encontr\u00f3 la Hoja de Vida.'); 
      return; 
    } 
    setIsCompleting(true); 
    setCompletionMessage(null); 
    setCompletionError(null); 
    try { 
      const ok = await updateHojaVidaEstado({ 
        idHojaVida: hojaVidaActual.idHojaVida, 
        idPersona: user?.idPersona ?? 0, 
        version: hojaVidaActual.version ?? 0, 
        estado: 'COMPLETO', 
        usuarioAccion: user.idUsuario, 
      }); 
      if (ok) { 
        setCompletionMessage('Se ha completado la Hoja de Vida.'); 
        setHojaVidaActual({ ...hojaVidaActual, estado: 'COMPLETO' }); 
      } else { 
        setCompletionError('No se pudo completar la Hoja de Vida.'); 
      } 
    } catch { 
      setCompletionError('No se pudo completar la Hoja de Vida.'); 
    } finally { 
      setIsCompleting(false); 
    } 
  }; 

  const handleDownload = () => {
    if (isLoading) {
      setDownloadError('La vista previa esta cargando, intenta nuevamente.');
      return;
    }
    if (isDownloading) {
      return;
    }
    if (!canDownload) {
      setDownloadError('No hay informacion disponible para descargar.');
      return;
    }
    if (!hojaVidaActual?.idHojaVida) {
      setDownloadError('No se encontró la Hoja de Vida para descargar.');
      return;
    }
    setDownloadError(null);
    setIsDownloading(true);
    downloadHojaVidaPdf(hojaVidaActual.idHojaVida)
      .then((blob) => {
        if (!blob || blob.size === 0) {
          setDownloadError('No se pudo generar el PDF.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const doc = datosPersonales.numeroDocumento?.trim();
        const filename = doc ? `hoja_vida_${doc}.pdf` : `hoja_vida_${hojaVidaActual.idHojaVida}.pdf`;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      })
      .catch(() => {
        setDownloadError('No se pudo descargar el PDF.');
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  useEffect(() => {
    if (canDownload) {
      setDownloadError(null);
    }
  }, [canDownload]);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      {!hideHeader && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold print:hidden" style={{ color: '#04a25c' }}>
                Vista Previa de Hoja de Vida
              </h3>
              <h3 className="hidden print:block text-xl font-bold" style={{ color: '#04a25c' }}>
                Hoja de Vida
              </h3>
              <p className="text-sm text-gray-600 mt-1">{'Informaci\u00f3n de tu Hoja de Vida'}</p>
              {isLoading && (
                <p className="text-xs text-gray-500 mt-2">{'Cargando informaci\u00f3n...'}</p>
              )}
              {loadError && (
                <p className="text-xs text-red-600 mt-2">{loadError}</p>
              )}
              {downloadError && (
                <p className="text-xs text-red-600 mt-2">{downloadError}</p>
              )}
              {completionMessage && (
                <p className="text-xs text-green-700 mt-2">{completionMessage}</p>
              )}
              {completionError && (
                <p className="text-xs text-red-600 mt-2">{completionError}</p>
              )}
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button
                type="button"
                variant="outline"
                className="gap-1 text-xs"
                onClick={handleCompletarHojaVida}
                disabled={isCompleting || isHojaVidaCompleta}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completado
              </Button>
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownload}
                disabled={isLoading || isDownloading}
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloading ? 'Descargando...' : 'Descargar'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Datos Personales */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="text-lg font-bold" style={{ color: '#04a25c' }}>Datos Personales</h4>
        </div>

        {/* Información Principal */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre Completo</p>
              <p className="text-base font-semibold text-gray-900">{nombreCompleto}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Documento de Identidad</p>
              <p className="text-base font-medium text-gray-900">
                {datosPersonales.tipoDocumento}: {datosPersonales.numeroDocumento}
              </p>
            </div>
          </div>

          <Separator />

          {/* Información Personal */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              Información Personal
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                <p className="text-sm font-medium text-gray-900">{formatFecha(datosPersonales.fechaNacimiento)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Sexo</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.sexo)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Estado civil</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.estadoCivil)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Nacionalidad</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.nacionalidad)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información de Contacto */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              Información de Contacto
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Celular</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.celular)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Correo electrónico principal</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.correo)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Correo electrónico secundario</p>
                <p className="text-sm font-medium text-gray-900">
                  {displayValue(datosPersonales.correoSecundario)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">RUC</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.ruc, 'No registrado')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Bancaria */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              Información Bancaria
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Nro. Cuenta de Ahorros - BN</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.cuentaBn, 'No registrado')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">CCI - Banco de la Nación</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.cciBn)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Domicilio */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-green-600" />
              Domicilio
            </h5>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.direccion, 'No registrado')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Referencia</p>
                <p className="text-sm font-medium text-gray-900">{displayValue(datosPersonales.referencia, 'No registrado')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Ubigeo</p>
                <p className="text-sm font-medium text-gray-900">
                  {displayValue(formatUbigeo(datosPersonales.departamento, datosPersonales.provincia, datosPersonales.distrito))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Formación Académica */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-orange-600" />
          </div>
          <h4 className="text-lg font-bold" style={{ color: '#04a25c' }}>Formación Académica</h4>
        </div>

        {formaciones.length > 0 ? (
          <div className="space-y-6">
            {formaciones.map((formacion, index) => (
              <div key={formacion.id}>
                {index > 0 && <Separator className="my-6" />}
                <div className="relative pl-6 border-l-4 border-orange-600">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-600 rounded-full"></div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-base font-semibold text-gray-900">
                        {formacion.carrera || 'Sin especificar'}
                      </h5>
                      <p className="text-sm text-orange-600 font-medium">{formacion.nivelEstudio || 'Sin nivel'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Institución</p>
                        <p className="text-sm font-medium text-gray-900">{formacion.institucion || 'Sin institución'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Tipo de Institución</p>
                        <p className="text-sm font-medium text-gray-900">{formacion.tipoInstitucion || 'Sin tipo'}</p>
                      </div>
                      {formacion.tipoEntidad && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Tipo de Entidad</p>
                          <p className="text-sm font-medium text-gray-900">{formacion.tipoEntidad}</p>
                        </div>
                      )}
                      {formacion.ruc && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">RUC</p>
                          <p className="text-sm font-medium text-gray-900">{formacion.ruc}</p>
                        </div>
                      )}
                      {formacion.fecha && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Extensión Diploma</p>
                          <p className="text-sm font-medium text-gray-900">{formacion.fecha}</p>
                        </div>
                      )}
                    </div>

                    {formacion.tipoInstitucion === 'Nacional' && (formacion.departamento || formacion.provincia || formacion.distrito) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <p className="text-xs text-gray-500">Ubigeo</p>
                          <p className="text-sm text-gray-600">
                            {formatUbigeo(formacion.departamento, formacion.provincia, formacion.distrito)}
                          </p>
                        </div>
                      </div>
                    )}

                    {formacion.pais && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">País</p>
                        <p className="text-sm font-medium text-gray-900">{getPaisDescripcion(formacion.pais)}</p>
                      </div>
                    )}

                    {formacion.documento && (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <FileText className="w-3 h-3" />
                          Documento adjuntado
                        </div>
                        <button
                          type="button"
                          onClick={() => previewFile(buildFileUrl(formacion.documento))}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors print:hidden"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFile(buildFileUrl(formacion.documento), `formacion_${formacion.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors print:hidden"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No se ha registrado formación académica</p>
          </div>
        )}
      </Card>

      {/* Cursos o Programas de Especialización */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="text-lg font-bold" style={{ color: '#04a25c' }}>Cursos o Programas de Especialización</h4>
        </div>

        {cursos.length > 0 ? (
          <div className="space-y-6">
            {cursos.map((curso, index) => (
              <div key={curso.id}>
                {index > 0 && <Separator className="my-6" />}
                <div className="relative pl-6 border-l-4 border-purple-600">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-600 rounded-full"></div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-base font-semibold text-gray-900">
                        {curso.descripcion || 'Sin especificar'}
                      </h5>
                      <p className="text-sm text-purple-600 font-medium">{curso.tipoEstudio || 'Sin tipo'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Institución</p>
                        <p className="text-sm font-medium text-gray-900">{curso.institucion || 'Sin institución'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Tipo de Institución</p>
                        <p className="text-sm font-medium text-gray-900">{curso.tipoInstitucion || 'Sin tipo'}</p>
                      </div>
                      {curso.ruc && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">RUC</p>
                          <p className="text-sm font-medium text-gray-900">{curso.ruc}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Horas Lectivas</p>
                        <p className="text-sm font-medium text-gray-900">{curso.horasLectivas || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Fecha Inicio</p>
                        <p className="text-sm font-medium text-gray-900">{curso.fechaInicio || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Fecha Fin</p>
                        <p className="text-sm font-medium text-gray-900">{curso.fechaFin || '-'}</p>
                      </div>
                    </div>

                    {curso.tipoInstitucion === 'Nacional' && (curso.departamento || curso.provincia || curso.distrito) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <p className="text-xs text-gray-500">Ubigeo</p>
                          <p className="text-sm text-gray-600">
                            {formatUbigeo(curso.departamento, curso.provincia, curso.distrito)}
                          </p>
                        </div>
                      </div>
                    )}

                    {curso.pais && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">País</p>
                        <p className="text-sm font-medium text-gray-900">{getPaisDescripcion(curso.pais)}</p>
                      </div>
                    )}

                    {curso.documento && (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <FileText className="w-3 h-3" />
                          Documento adjuntado
                        </div>
                        <button
                          type="button"
                          onClick={() => previewFile(buildFileUrl(curso.documento))}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors print:hidden"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFile(buildFileUrl(curso.documento), `curso_${curso.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors print:hidden"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No se han registrado cursos o especializaciones</p>
          </div>
        )}
      </Card>

      {/* Experiencia Profesional */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-teal-600" />
            </div>
            <h4 className="text-lg font-bold" style={{ color: '#04a25c' }}>Experiencia Profesional</h4>
          </div>
        <div className="flex flex-col gap-3">
          {totalExperienciaGeneral.totalDays > 0 && (
            <p className="text-sm text-gray-700 whitespace-nowrap">
              Total experiencia general: {totalExperienciaGeneral.years} años, {totalExperienciaGeneral.months} meses, {totalExperienciaGeneral.days} días
            </p>
          )}
          {totalExperienciaEspecifica.totalDays > 0 && (
            <p className="text-sm text-gray-700 whitespace-nowrap">
              Total experiencia específica: {totalExperienciaEspecifica.years} años, {totalExperienciaEspecifica.months} meses, {totalExperienciaEspecifica.days} días
            </p>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h5 className="text-base font-semibold text-gray-900 mb-4">Experiencia General</h5>
          {renderExperiencias(experienciasGenerales, 'No se ha registrado experiencia profesional')}
        </div>
        <div>
          <h5 className="text-base font-semibold text-gray-900 mb-4">Experiencia Específica</h5>
          {renderExperiencias(experienciasEspecificas, 'No se ha registrado experiencia específica')}
        </div>
      </div>
      </Card>

      {/* Declaraciones */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-lg font-bold" style={{ color: '#04a25c' }}>Declaraciones Juradas</h4>
        </div>

        {declaraciones.length > 0 ? (
          <div className="space-y-6">
            {declaraciones.map((decl, index) => (
              <div key={decl.id}>
                {index > 0 && <Separator className="my-6" />}
                <div className="relative pl-6 border-l-4 border-blue-600">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-base font-semibold text-gray-900">
                        {decl.nombre || 'Sin especificar'}
                      </h5>
                      <p className="text-sm text-blue-600 font-medium">{decl.descripcion || 'Sin plantilla'}</p>
                    </div>

                    {(decl.archivoAdjunto || decl.archivoGuid) && (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <FileText className="w-3 h-3" />
                          Documento adjuntado
                        </div>
                        {decl.archivoGuid && (
                          <>
                            <button
                              type="button"
                              onClick={() => previewFile(buildFileUrl(decl.archivoGuid))}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors print:hidden"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadFile(buildFileUrl(decl.archivoGuid), `declaracion_${decl.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors print:hidden"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Descargar
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No se han registrado declaraciones</p>
          </div>
        )}
      </Card>

      {/* Footer Information */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 mb-1">Documento generado por SIRPO</h5>
            <p className="text-sm text-gray-600">
              Este documento muestra la información registrada en el Sistema de Registro de Profesionales y/o Técnicos para Trabajo de Campo en el Marco del PP PIRDAIS.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
