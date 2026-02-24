import { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Briefcase, Building2, Clock, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { VistaPrevia } from './hoja-vida/VistaPrevia';
import { downloadHojaVidaPdf, fetchHojaVidaActual } from '../api/hojaVida';
import type { LoginResponse } from '../api/auth';

interface Postulacion {
  id: string;
  idHojaVida?: number;
  convocatoria: string;
  oficinaZonal: string;
  oficinaCoordinacion: string;
  perfil: string;
  fechaPostulacion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

interface Formacion {
  id: string;
  nivelEstudio: string;
  carrera: string;
  tipoInstitucion: string;
  tipoEntidad: string;
  institucion: string;
  ruc: string;
  departamento: string;
  provincia: string;
  distrito: string;
  fecha: string;
  documento: string;
}

interface Curso {
  id: string;
  nombre: string;
  institucion: string;
  horas: string;
  fecha: string;
  documento: string;
}

interface Experiencia {
  id: string;
  nombreEntidad: string;
  ruc: string;
  departamento: string;
  provincia: string;
  distrito: string;
  cargo: string;
  fechaInicio: string;
  fechaFin: string;
  funciones: string;
  certificadoPreview?: string;
}

interface Declaracion {
  id: string;
  nombre: string;
  descripcion: string;
  archivoAdjunto: { file: File; preview: string } | null;
  archivoGuid?: string;
}

interface DetallePostulacionProps {
  user?: LoginResponse | null;
  postulacion: Postulacion;
  formaciones: Formacion[];
  cursos: Curso[];
  experiencias: Experiencia[];
  declaraciones?: Declaracion[];
  onClose: () => void;
}

export function DetallePostulacion({
  user,
  postulacion,
  formaciones,
  cursos,
  experiencias,
  declaraciones = [],
  onClose,
}: DetallePostulacionProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [hojaVidaId, setHojaVidaId] = useState<number>(Number(postulacion.idHojaVida ?? 0));

  const normalizeEstado = (estado: string) => {
    const normalized = (estado || '').toLowerCase().trim();
    if (normalized === '1') return 'en revision';
    if (normalized === '2') return 'en revision';
    if (normalized === '0') return 'registrado';
    const compact = normalized.replace(/[-\s]/g, '');
    if (compact.includes('nocumple')) return 'en revision';
    if (compact.includes('cumple')) return 'en revision';
    if (compact.includes('preseleccion') || compact.includes('final') || compact.includes('rechaz')) {
      return 'en revision';
    }
    if (compact.includes('registr')) return 'registrado';
    if (compact.includes('revision')) return 'en revision';
    return normalized;
  };

  useEffect(() => {
    let isActive = true;
    if (postulacion.idHojaVida) {
      setHojaVidaId(Number(postulacion.idHojaVida));
      return;
    }
    if (!user?.idPersona || !user?.idUsuario) {
      return;
    }
    fetchHojaVidaActual(user.idPersona, user.idUsuario)
      .then((hv) => {
        if (!isActive) return;
        setHojaVidaId(Number(hv?.idHojaVida ?? 0));
      })
      .catch(() => {
        // ignore
      });
    return () => {
      isActive = false;
    };
  }, [postulacion.idHojaVida, user?.idPersona, user?.idUsuario]);

  const handleDescargarPdf = async () => {
    if (!hojaVidaId) {
      setDownloadError('No se encontró la Hoja de Vida para descargar.');
      return;
    }
    if (isDownloadingPdf) {
      return;
    }
    setDownloadError(null);
    setIsDownloadingPdf(true);
    try {
      const blob = await downloadHojaVidaPdf(Number(hojaVidaId));
      if (!blob || blob.size === 0) {
        setDownloadError('No se pudo generar el PDF.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const filename = `hoja_vida_${hojaVidaId}.pdf`;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError('No se pudo descargar el PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case 'registrado':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="w-3 h-3" />
            Registrado
          </Badge>
        );
      case 'en revision':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="w-3 h-3" />
            En revisión
          </Badge>
        );
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
              <Briefcase className="w-8 h-8" />
              Detalle de Postulación
            </h1>
            <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
              Información completa de tu postulación
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </div>

      {/* Información de la Convocatoria */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {postulacion.convocatoria}
                </h3>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
                  {postulacion.perfil}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Estado de postulación</p>
              {getEstadoBadge(postulacion.estado)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Oficina Zonal</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {postulacion.oficinaZonal}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Oficina de Coordinación</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {postulacion.oficinaCoordinacion}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Fecha de Postulación</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {postulacion.fechaPostulacion}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Fecha Inicio Convocatoria</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {postulacion.fechaInicio}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Fecha Fin Convocatoria</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {postulacion.fechaFin}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Información de la Hoja de Vida Enviada */}
      <div>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#108cc9' }}>
              Hoja de Vida Enviada
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Esta es la información que fue enviada con tu postulación
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDescargarPdf}
              disabled={isDownloadingPdf}
            >
              <Download className="w-4 h-4" />
              {isDownloadingPdf ? 'Descargando...' : 'Descargar PDF'}
            </Button>
            {downloadError && (
              <p className="text-xs text-red-600">{downloadError}</p>
            )}
          </div>
        </div>
        
        <VistaPrevia
          formaciones={formaciones}
          cursos={cursos}
          experiencias={experiencias}
          declaraciones={declaraciones}
          hideHeader={true}
        />
      </div>

      {/* Botón inferior */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClose}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Volver al historial
        </Button>
      </div>
    </div>
  );
}
