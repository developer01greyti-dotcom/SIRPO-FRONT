import { useEffect, useState } from 'react';
import { X, Calendar, Briefcase, Building2, User, Mail, Save, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { VistaPrevia } from '../hoja-vida/VistaPrevia';
import { apiClient } from '../../api/client';
import { updatePostulacion } from '../../api/postulaciones';
import {
  fetchHojaVidaDatos,
  fetchHvCurList,
  fetchHvDeclList,
  fetchHvExpList,
  fetchHvFormList,
} from '../../api/hojaVida';
import { fetchDeclaracionTipos } from '../../api/declaraciones';
import { fetchHvRefArchivo } from '../../api/hvRefArchivo';

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

interface DetallePostulacionAdminProps {
  postulacion: Postulacion;
  adminUserId: number;
  onClose: () => void;
  onActualizarEstado: (postulacionId: string, nuevoEstado: string, observacion: string) => void;
  canEditEstado?: boolean;
}

export function DetallePostulacionAdmin({
  postulacion,
  adminUserId,
  onClose,
  onActualizarEstado,
  canEditEstado = true,
}: DetallePostulacionAdminProps) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(postulacion.estado);
  const [comentario, setComentario] = useState(postulacion.observacion ?? '');
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hvLoading, setHvLoading] = useState(false);
  const [hvError, setHvError] = useState<string | null>(null);
  const [hvDatos, setHvDatos] = useState<any | null>(null);
  const [hvFormaciones, setHvFormaciones] = useState<any[]>([]);
  const [hvCursos, setHvCursos] = useState<any[]>([]);
  const [hvExperiencias, setHvExperiencias] = useState<any[]>([]);
  const [hvDeclaraciones, setHvDeclaraciones] = useState<any[]>([]);

  const handleGuardarEstado = async () => {
    if (!adminUserId) {
      setSaveError('No se encontró el usuario administrador.');
      return;
    }
    if (!postulacion.id) {
      setSaveError('No se encontró la postulación.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const ok = await updatePostulacion({
        idPostulacion: Number(postulacion.id),
        idPersona: Number(postulacion.idPersona || 0),
        idConvocatoria: Number(postulacion.idConvocatoria || 0),
        idHojaVida: Number(postulacion.idHojaVida || 0),
        numeroPostulacion: postulacion.numeroPostulacion || '',
        estado: estadoSeleccionado,
        observacion: comentario || '',
        usuarioAccion: adminUserId,
      });
      if (!ok) {
        setSaveError('No se pudo actualizar el estado.');
        return;
      }
      onActualizarEstado(postulacion.id, estadoSeleccionado, comentario || '');
      setShowConfirmacion(true);
      setTimeout(() => setShowConfirmacion(false), 3000);
    } catch (error) {
      setSaveError('No se pudo actualizar el estado.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    const loadHojaVida = async () => {
      const idHojaVida = Number(postulacion.idHojaVida || 0);
      if (!idHojaVida) {
        if (isActive) {
          setHvError('No se encontro la hoja de vida del postulante.');
        }
        return;
      }
      setHvLoading(true);
      setHvError(null);
      try {
        const [datos, formacionesData, cursosData, experienciasData, declaracionesData, declaracionTipos] = await Promise.all([
          fetchHojaVidaDatos(idHojaVida),
          fetchHvFormList(idHojaVida),
          fetchHvCurList(idHojaVida),
          fetchHvExpList(idHojaVida),
          fetchHvDeclList(idHojaVida),
          fetchDeclaracionTipos(),
        ]);
        if (!isActive) return;
        setHvDatos(datos);
        setHvFormaciones(Array.isArray(formacionesData) ? formacionesData : formacionesData ? [formacionesData] : []);
        setHvCursos(Array.isArray(cursosData) ? cursosData : cursosData ? [cursosData] : []);
        setHvExperiencias(Array.isArray(experienciasData) ? experienciasData : experienciasData ? [experienciasData] : []);
        const declList = Array.isArray(declaracionesData)
          ? declaracionesData
          : declaracionesData
            ? [declaracionesData]
            : [];
        const tipos = Array.isArray(declaracionTipos) ? declaracionTipos : [];
        const tipoMap = new Map<number, { nombre?: string; descripcion?: string }>();
        tipos.forEach((tipo: any) => {
          const id = Number(tipo.idDeclaracionTipo ?? tipo.id_declaracion_tipo ?? tipo.id ?? 0);
          if (!Number.isFinite(id) || id <= 0) return;
          tipoMap.set(id, {
            nombre: tipo.nombre ?? '',
            descripcion: tipo.descripcion ?? '',
          });
        });
        const declEnriched = await Promise.all(
          declList.map(async (item: any) => {
            const idHvDecl = Number(item.idHvDecl ?? item.idHvDeclaracion ?? item.id ?? 0);
            const idDeclaracionTipo = Number(
              item.idDeclaracionTipo ?? item.id_declaracion_tipo ?? 0,
            );
            let archivoGuid = item.archivoGuid ?? '';
            if (!archivoGuid && idHvDecl) {
              try {
                const archivos = await fetchHvRefArchivo('HV_DECL', idHvDecl);
                const actual = archivos.find(
                  (archivo) => String(archivo?.tipoArchivo || '').toUpperCase() === 'HV_DECL',
                );
                archivoGuid = actual?.guid ?? '';
              } catch {
                // ignore
              }
            }
            const tipo = tipoMap.get(idDeclaracionTipo);
            return {
              ...item,
              idDeclaracionTipo,
              nombre: item.nombre ?? tipo?.nombre ?? '',
              descripcion: item.descripcion ?? tipo?.descripcion ?? '',
              archivoGuid,
            };
          }),
        );
        setHvDeclaraciones(declEnriched);
      } catch (error) {
        if (isActive) {
          setHvError('No se pudo cargar la hoja de vida.');
        }
      } finally {
        if (isActive) {
          setHvLoading(false);
        }
      }
    };

    loadHojaVida();
    return () => {
      isActive = false;
    };
  }, [postulacion.idHojaVida]);

  const buildFileUrl = (guid: string) => {
    const apiBaseUrl =
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
      'http://localhost:8087/sirpo/v1';
    const params = new URLSearchParams({ guid });
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`;
  };

  const mapDatosPersonales = (datos: any) => {
    if (!datos) return null;
    return {
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
      departamento: datos.departamento ?? datos.departamentoDescripcion ?? '',
      provincia: datos.provincia ?? datos.provinciaDescripcion ?? '',
      distrito: datos.distrito ?? datos.distritoDescripcion ?? '',
    };
  };

  const mapFormaciones = (items: any[]) =>
    items.map((item) => ({
      id: String(item.id ?? item.idHvFormacion ?? ''),
      nivelEstudio: item.nivelEstudio ?? '',
      carrera: item.carrera ?? '',
      tipoInstitucion: item.tipoInstitucion ?? '',
      tipoEntidad: item.tipoEntidad ?? '',
      institucion: item.institucion ?? '',
      ruc: item.ruc ?? '',
      departamento: item.departamentoDescripcion ?? item.departamento ?? '',
      provincia: item.provinciaDescripcion ?? item.provincia ?? '',
      distrito: item.distritoDescripcion ?? item.distrito ?? '',
      pais: item.pais ?? '',
      fecha: item.fechaObtencion ?? item.fecha ?? '',
      documento: item.archivoGuid ?? '',
    }));

  const mapCursos = (items: any[]) =>
    items.map((item) => ({
      id: String(item.id ?? item.idHvCurso ?? ''),
      tipoEstudio: item.tipoEstudio ?? '',
      descripcion: item.descripcion ?? '',
      tipoInstitucion: item.tipoInstitucion ?? '',
      institucion: item.institucion ?? '',
      ruc: item.ruc ?? '',
      departamento: item.departamentoDescripcion ?? item.departamento ?? '',
      provincia: item.provinciaDescripcion ?? item.provincia ?? '',
      distrito: item.distritoDescripcion ?? item.distrito ?? '',
      pais: item.pais ?? '',
      fechaInicio: item.fechaInicio ?? '',
      fechaFin: item.fechaFin ?? '',
      horasLectivas: String(item.horasLectivas ?? ''),
      documento: item.archivoGuid ?? '',
    }));

  const mapExperiencias = (items: any[]) =>
    items.map((item) => ({
      id: String(item.id ?? item.idHvExperiencia ?? ''),
      tipoExperiencia: item.tipoExperiencia ?? '',
      tipoEntidad: item.tipoEntidad ?? '',
      nombreEntidad: item.nombreEntidad ?? '',
      departamento: item.departamentoDescripcion ?? item.departamento ?? '',
      provincia: item.provinciaDescripcion ?? item.provincia ?? '',
      distrito: item.distritoDescripcion ?? item.distrito ?? '',
      area: item.area ?? '',
      cargo: item.cargo ?? '',
      funcionesPrincipales: item.funcionesPrincipales ?? '',
      motivoCese: item.motivoCese ?? '',
      fechaInicio: item.fechaInicio ?? '',
      fechaFin: item.fechaFin ?? '',
      certificadoPreview: item.archivoGuid ? buildFileUrl(String(item.archivoGuid)) : null,
    }));

  const mapDeclaraciones = (items: any[]) =>
    items.map((item: any, index: number) => ({
      id: String(item.id ?? item.idDeclaracionTipo ?? index),
      nombre: item.nombre ?? '',
      descripcion: item.descripcion ?? '',
      archivoAdjunto: null,
      archivoGuid: item.archivoGuid ?? '',
    }));

  const anexosGuid =
    mapDeclaraciones(hvDeclaraciones).find((item) => item.archivoGuid)?.archivoGuid || '';

  const handleVerAnexos = async () => {
    if (!anexosGuid) {
      return;
    }
    try {
      const response = await apiClient.get('/hv_ref_archivo/file', {
        params: { guid: anexosGuid },
        responseType: 'blob',
      });
      const blob = response.data as Blob;
      if (!blob || blob.size === 0) {
        return;
      }
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      // ignore
    }
  };

  const getEstadoBadge = (estado: string) => {
    const normalized = (estado || '').toLowerCase().trim();
    if (normalized === '1') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Cumple</Badge>;
    }
    if (normalized === '2') {
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">No cumple</Badge>;
    }
    if (normalized === '0') {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Registrado</Badge>;
    }
    if (normalized.replace(/[-\s]/g, '').includes('nocumple')) {
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">No cumple</Badge>;
    }
    if (normalized.includes('cumple')) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Cumple</Badge>;
    }
    if (normalized.includes('registr') || normalized.includes('revision')) {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Registrado</Badge>;
    }
    switch (normalized) {
      case 'cumple':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Cumple</Badge>;
      case 'no cumple':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">No cumple</Badge>;
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
      {canEditEstado && saveError && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm font-medium text-red-700">{saveError}</p>
        </Card>
      )}
      {postulacion.contratoActivo && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">No Disponible</p>
              <p className="text-sm text-red-700 mt-1">
                El ciudadano seleccionado se encuentra actualmente contratado por DEVIDA.
                {postulacion.numeroContrato ? ` Contrato: ${postulacion.numeroContrato}.` : ''}
                {postulacion.oficinaZonalContrato ? ` Oficina Zonal: ${postulacion.oficinaZonalContrato}.` : ''}
                {postulacion.fechaFinContrato ? ` Fecha fin: ${postulacion.fechaFinContrato}.` : ''}
              </p>
            </div>
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

      {/* Información del Servicio */}
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
                  {postulacion.oficinaCoordinacion || postulacion.oficinaZonal}
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

      {/* Ver anexos */}
      <Card className="p-5 border-blue-200 bg-blue-50">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Declaraciones Juradas</p>
              <p className="text-sm text-gray-600">
                Anexos 02, 03 y 04 en un solo PDF.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={handleVerAnexos}
            disabled={!anexosGuid}
          >
            <FileText className="w-4 h-4" />
            Ver anexos
          </Button>
        </div>
        {!anexosGuid && (
          <p className="text-xs text-blue-700 mt-3">
            Aún no se ha generado el PDF de anexos para este registro.
          </p>
        )}
      </Card>

      {/* Gestión de Estado */}
      {canEditEstado && (
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
                  <option value="registrado">Registrado</option>
                  <option value="cumple">Cumple</option>
                  <option value="no cumple">No cumple</option>
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
                disabled={isSaving || estadoSeleccionado === postulacion.estado}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar Estado'}
              </Button>
              {estadoSeleccionado !== postulacion.estado && (
                <p className="text-sm text-amber-700 font-medium">
                  ⚠ Hay cambios sin guardar
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Al cambiar el estado, el registro quedará actualizado para el seguimiento interno.
              </p>
            </div>
          </div>
        </Card>
      )}

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
        {hvLoading ? (
          <div className="text-sm text-gray-600">Cargando hoja de vida...</div>
        ) : hvError ? (
          <div className="text-sm text-red-600">{hvError}</div>
        ) : (
          <VistaPrevia
            datosPersonales={mapDatosPersonales(hvDatos) || undefined}
            formaciones={mapFormaciones(hvFormaciones)}
            cursos={mapCursos(hvCursos)}
            experiencias={mapExperiencias(hvExperiencias)}
          declaraciones={[]}
            hideHeader={true}
          />
        )}
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
