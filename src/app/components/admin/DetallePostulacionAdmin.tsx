import { useState } from 'react';
import { X, Calendar, Briefcase, Building2, User, Mail, Save, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { VistaPrevia } from '../hoja-vida/VistaPrevia';

interface Postulacion {
  id: string;
  postulante: {
    nombre: string;
    documento: string;
    email: string;
  };
  convocatoria: string;
  oficinaZonal: string;
  perfil: string;
  fechaPostulacion: string;
  estado: 'en-revision' | 'preseleccionado' | 'rechazado' | 'finalista';
}

interface DetallePostulacionAdminProps {
  postulacion: Postulacion;
  onClose: () => void;
  onActualizarEstado: (postulacionId: string, nuevoEstado: string) => void;
}

export function DetallePostulacionAdmin({
  postulacion,
  onClose,
  onActualizarEstado,
}: DetallePostulacionAdminProps) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(postulacion.estado);
  const [comentario, setComentario] = useState('');
  const [showConfirmacion, setShowConfirmacion] = useState(false);

  const handleGuardarEstado = () => {
    onActualizarEstado(postulacion.id, estadoSeleccionado);
    setShowConfirmacion(true);
    setTimeout(() => setShowConfirmacion(false), 3000);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en-revision':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En Revisión</Badge>;
      case 'preseleccionado':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Preseleccionado</Badge>;
      case 'finalista':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Finalista</Badge>;
      case 'rechazado':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">No Seleccionado</Badge>;
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
              <User className="w-8 h-8" />
              Detalle del Registro
            </h1>
            <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
              Revisar información completa y actualizar estado
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </div>

      {/* Mensaje de confirmación */}
      {showConfirmacion && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Estado actualizado exitosamente
            </p>
          </div>
        </Card>
      )}

      {/* Información del Usuario */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
          Información del Usuario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Nombre Completo</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {postulacion.postulante.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">DNI</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {postulacion.postulante.documento}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Correo Electrónico</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {postulacion.postulante.email}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Información del Perfil */}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Oficina de Coordinación</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {postulacion.oficinaZonal}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Fecha de Registro</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {postulacion.fechaPostulacion}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Estado Actual</p>
                <div className="mt-1">
                  {getEstadoBadge(postulacion.estado)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Gestión de Estado */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
          Actualizar Estado del Registro
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nuevo Estado *
              </label>
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="en-revision">En Revisión</option>
                <option value="preseleccionado">Preseleccionado</option>
                <option value="finalista">Finalista</option>
                <option value="rechazado">No Seleccionado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Comentarios (Opcional)
              </label>
              <input
                type="text"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agregar comentario interno..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGuardarEstado}
              disabled={estadoSeleccionado === postulacion.estado}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Estado
            </Button>
            {estadoSeleccionado !== postulacion.estado && (
              <p className="text-sm text-amber-700 font-medium">
                ⚠ Hay cambios sin guardar
              </p>
            )}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Al cambiar el estado, el usuario recibirá una notificación por correo electrónico informándole sobre la actualización y que no implica contratación automática.
            </p>
          </div>
        </div>
      </Card>

      {/* Hoja de Vida */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold" style={{ color: '#108cc9' }}>
            Hoja de Vida
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Información registrada en el sistema
          </p>
        </div>

        <VistaPrevia
          formaciones={[
            {
              id: '1',
              nivelEstudio: 'Titulado',
              carrera: 'Ingeniería Forestal',
              tipoInstitucion: 'Nacional',
              tipoEntidad: 'Pública',
              institucion: 'Universidad Mayor de San Marcos',
              ruc: '20123456789',
              departamento: 'Lima',
              provincia: 'Lima',
              distrito: 'Lima',
              fecha: '2008-12-12',
              documento: 'diploma_forestal.pdf',
            },
          ]}
          cursos={[
            {
              id: '1',
              tipoEstudio: 'Especialización',
              descripcion: 'Gestión Pública y Desarrollo Sostenible',
              tipoInstitucion: 'Nacional',
              institucion: 'Universidad Mayor de San Marcos',
              ruc: '20123456789',
              departamento: 'Lima',
              provincia: 'Lima',
              distrito: 'Lima',
              fechaInicio: '2021-01-15',
              fechaFin: '2021-06-15',
              horasLectivas: '90',
              documento: 'certificado_gestion.pdf',
            },
          ]}
          experiencias={[
            {
              id: '1',
              tipoExperiencia: 'empleo',
              tipoEntidad: 'publico',
              nombreEntidad: 'Ministerio de Agricultura y Riego',
              departamento: 'Lima',
              provincia: 'Lima',
              distrito: 'Miraflores',
              area: 'Proyectos Agrícolas',
              cargo: 'Extensionista Agrícola',
              funcionesPrincipales: 'Capacitación y asistencia técnica a productores agrícolas.',
              motivoCese: 'fin-contrato',
              fechaInicio: '2022-01-15',
              fechaFin: '2024-12-31',
              certificadoPreview: 'certificado_minagri.pdf',
            },
          ]}
          declaraciones={[]}
          hideHeader={true}
        />
      </div>

      {/* Botón inferior */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose} className="gap-2">
          <X className="w-4 h-4" />
          Volver al listado
        </Button>
      </div>
    </div>
  );
}
