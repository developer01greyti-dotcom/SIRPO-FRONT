import { X, Send, MapPin, Calendar, Briefcase, CheckCircle2, Edit3 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { VistaPrevia } from './hoja-vida/VistaPrevia';
import type { LoginResponse } from '../api/auth';

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
}: InterfazPostulacionProps) {
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
              Registro del Perfil
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

      {/* Información del Perfil */}
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
          >
            <CheckCircle2 className="w-4 h-4" />
            Completar registro
          </Button>
        </div>
      </div>

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
        >
          <CheckCircle2 className="w-4 h-4" />
          Completar registro
        </Button>
      </div>
    </div>
  );
}
