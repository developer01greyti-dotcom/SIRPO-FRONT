import { X, Calendar, MapPin, Briefcase, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { VistaPrevia } from './hoja-vida/VistaPrevia';

interface Postulacion {
  id: string;
  convocatoria: string;
  oficinaZonal: string;
  oficinaCoordinacion: string;
  perfil: string;
  fechaPostulacion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'en-revision' | 'preseleccionado' | 'rechazado' | 'finalista';
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

interface DetallePostulacionProps {
  postulacion: Postulacion;
  formaciones: Formacion[];
  cursos: Curso[];
  experiencias: Experiencia[];
  onClose: () => void;
}

export function DetallePostulacion({
  postulacion,
  formaciones,
  cursos,
  experiencias,
  onClose,
}: DetallePostulacionProps) {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en-revision':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="w-3 h-3" />
            En Revisión
          </Badge>
        );
      case 'preseleccionado':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Preseleccionado
          </Badge>
        );
      case 'finalista':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Finalista
          </Badge>
        );
      case 'rechazado':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1">
            <XCircle className="w-3 h-3" />
            No Seleccionado
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
        <div className="mb-4">
          <h3 className="text-xl font-bold" style={{ color: '#108cc9' }}>
            Hoja de Vida Enviada
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Esta es la información que fue enviada con tu postulación
          </p>
        </div>
        
        <VistaPrevia
          formaciones={formaciones}
          cursos={cursos}
          experiencias={experiencias}
          declaraciones={[]}
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
