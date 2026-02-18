import { useEffect, useState } from 'react';
import { X, Send, MapPin, Calendar, Briefcase, CheckCircle2, Edit3, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { VistaPrevia } from './hoja-vida/VistaPrevia';
import type { LoginResponse } from '../api/auth';
import { fetchHojaVidaActual, downloadDeclaracionesPdf } from '../api/hojaVida';

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
  const [declaracionPdfUrl, setDeclaracionPdfUrl] = useState('');
  const [declaracionHojaVidaId, setDeclaracionHojaVidaId] = useState<number | null>(null);
  const [aceptaDeclaracion, setAceptaDeclaracion] = useState(false);

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
        const apiBaseUrl =
          (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
          'http://localhost:8087/sirpo/v1';
        const url = `${apiBaseUrl}/hv_decl_pdf?idHojaVida=${idHojaVida}`;
        setDeclaracionPdfUrl(url);
        setDeclaracionHojaVidaId(idHojaVida);
      } catch {
        if (isActive) {
          setDeclaracionPdfUrl('');
          setDeclaracionHojaVidaId(null);
        }
      }
    };

    loadDeclaracionUrl();

    return () => {
      isActive = false;
    };
  }, [user?.idPersona, user?.idUsuario]);

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
            onClick={onCompletarPostulacion}
            disabled={!aceptaDeclaracion || isSubmitting}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Registrando...' : 'Completar registro'}
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
                const { blob, contentType } = await downloadDeclaracionesPdf(declaracionHojaVidaId);
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

      {/* Vista Previa de la Hoja de Vida */}
      <VistaPrevia {...vistaPreviaProps} />

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
          onClick={onCompletarPostulacion}
          disabled={!aceptaDeclaracion || isSubmitting}
        >
          <CheckCircle2 className="w-4 h-4" />
          {isSubmitting ? 'Registrando...' : 'Completar registro'}
        </Button>
      </div>
    </div>
  );
}
