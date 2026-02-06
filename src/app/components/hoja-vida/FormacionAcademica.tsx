import { Plus, Edit2, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { FormacionForm } from './FormacionForm';
import { CursoForm } from './CursoForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { PdfViewer } from '../PdfViewer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { LoginResponse } from '../../api/auth';
import {
  fetchHojaVidaActual,
  fetchHvCurList,
  fetchHvFormList,
  deleteHvForm,
} from '../../api/hojaVida';

interface Formacion {
  id: string;
  nivelEstudio: string;
  nivelEstudioId?: string;
  carrera: string;
  tipoInstitucion: string;
  tipoInstitucionId?: string;
  tipoEntidad?: string;
  tipoEntidadId?: string;
  institucion: string;
  ruc?: string;
  fecha: string;
  documento: string;
  distritoId?: string;
  distritoDescripcion?: string;
  pais?: string;
}

interface Curso {
  id: string;
  idHvCurso?: string;
  tipoEstudio: string;
  tipoEstudioId?: string;
  descripcion: string;
  tipoInstitucion: string;
  tipoInstitucionId?: string;
  institucion: string;
  ruc?: string;
  fechaInicio: string;
  fechaFin: string;
  horasLectivas: string;
  documento: string;
  distritoId?: string;
  distritoDescripcion?: string;
  pais?: string;
}

interface FormacionAcademicaProps {
  user: LoginResponse | null;
}

export function FormacionAcademica({ user }: FormacionAcademicaProps) {
  const [vistaActual, setVistaActual] = useState<'listados' | 'formacion-form' | 'curso-form' | 'pdf-viewer'>('listados');
  const [modoEdicion, setModoEdicion] = useState<'crear' | 'editar'>('crear');
  const [formacionSeleccionada, setFormacionSeleccionada] = useState<Formacion | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hojaVidaId, setHojaVidaId] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [formacionAEliminar, setFormacionAEliminar] = useState<Formacion | null>(null);

  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');

  const [formaciones, setFormaciones] = useState<Formacion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  const buildFileUrl = (guid: string) => {
    const apiBaseUrl =
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
      'http://localhost:8087/sirpo/v1';
    const params = new URLSearchParams({ guid });
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`;
  };

  const normalizeFormaciones = (items: any[]): Formacion[] => {
    return items.map((item, index) => ({
      id: String(item.idFormacion ?? item.id ?? item.idHvFormacion ?? index),
      nivelEstudio: item.nivelEstudio ?? item.nivel ?? item.nivelEstudioDesc ?? '',
      nivelEstudioId: item.nivelEstudioId ?? item.nivelEstudioid ?? item.nivelEstudioID ?? item.nivelEstudioId,
      carrera: item.carrera ?? item.descripcion ?? '',
      tipoInstitucion: item.tipoInstitucion ?? item.tipoInstitucionDesc ?? '',
      tipoInstitucionId: item.tipoInstitucionId ?? item.tipoInstitucionid ?? item.tipoInstitucionID ?? item.tipoInstitucionId,
      tipoEntidad: item.tipoEntidad ?? item.tipoEntidadDesc ?? '',
      tipoEntidadId: item.tipoEntidadId ?? item.tipoEntidadid ?? item.tipoEntidadID ?? item.tipoEntidadId,
      institucion: item.institucion ?? item.nombreInstitucion ?? '',
      ruc: item.ruc ?? '',
      fecha: item.fechaObtencion ?? item.fecha ?? '',
      documento: item.documento ?? item.nombreArchivo ?? (item.archivoGuid ? buildFileUrl(String(item.archivoGuid)) : ''),
      distritoId: item.distritoId ?? item.idUbigeo ?? '',
      distritoDescripcion: item.distritoDescripcion ?? '',
      pais: item.pais ?? '',
    }));
  };

  const normalizeCursos = (items: any[]): Curso[] => {
    return items.map((item, index) => ({
      id: String(item.id ?? item.idCurso ?? item.idHvCurso ?? index),
      idHvCurso: String(item.idHvCurso ?? item.idCurso ?? ''),
      tipoEstudio: item.tipoEstudio ?? item.tipo ?? item.tipoEstudioDesc ?? '',
      tipoEstudioId: item.tipoEstudioId ?? item.tipoEstudioid ?? item.tipoEstudioID ?? '',
      descripcion: item.descripcion ?? item.curso ?? '',
      tipoInstitucion: item.tipoInstitucion ?? item.tipoInstitucionDesc ?? '',
      tipoInstitucionId: item.tipoInstitucionId ?? item.tipoInstitucionid ?? item.tipoInstitucionID ?? '',
      institucion: item.institucion ?? item.nombreInstitucion ?? '',
      ruc: item.ruc ?? '',
      fechaInicio: item.fechaInicio ?? item.fecha_ini ?? '',
      fechaFin: item.fechaFin ?? item.fecha_fin ?? '',
      horasLectivas: String(item.horasLectivas ?? item.horas ?? ''),
      documento: item.documento ?? item.nombreArchivo ?? (item.archivoGuid ? buildFileUrl(String(item.archivoGuid)) : ''),
      distritoId: item.distritoId ?? item.idUbigeo ?? '',
      distritoDescripcion: item.distritoDescripcion ?? item.distrito ?? '',
      pais: item.pais ?? '',
    }));
  };

  useEffect(() => {
    let isActive = true;

    const loadListados = async () => {
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
            setFormaciones([]);
            setCursos([]);
          }
          return;
        }
        setHojaVidaId(idHojaVida);

        const [formacionData, cursoData] = await Promise.all([
          fetchHvFormList(idHojaVida),
          fetchHvCurList(idHojaVida),
        ]);

        if (!isActive) {
          return;
        }

        const formacionItems = Array.isArray(formacionData) ? formacionData : formacionData ? [formacionData] : [];
        const cursoItems = Array.isArray(cursoData) ? cursoData : cursoData ? [cursoData] : [];

        setFormaciones(normalizeFormaciones(formacionItems));
        setCursos(normalizeCursos(cursoItems));
      } catch (error) {
        if (isActive) {
          setLoadError('No se pudo cargar la información.');
          setFormaciones([]);
          setCursos([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadListados();

    return () => {
      isActive = false;
    };
  }, [user?.idPersona, user?.idUsuario, refreshKey]);

  const handleFormacionGuardada = () => {
    setRefreshKey((prev) => prev + 1);
    handleVolverAListados();
  };

  const handleCursoGuardado = () => {
    setRefreshKey((prev) => prev + 1);
    handleVolverAListados();
  };

  const handleAgregarFormacion = () => {
    setModoEdicion('crear');
    setFormacionSeleccionada(null);
    setVistaActual('formacion-form');
  };

  const handleEditarFormacion = (formacion: Formacion) => {
    setModoEdicion('editar');
    setFormacionSeleccionada(formacion);
    setVistaActual('formacion-form');
  };

  const handleEliminarFormacion = (id: string) => {
    const seleccionada = formaciones.find((item) => item.id === id) || null;
    setFormacionAEliminar(seleccionada);
    setDialogEliminar(true);
  };

  const confirmarEliminarFormacion = async () => {
    if (!formacionAEliminar) {
      setDialogEliminar(false);
      return;
    }
    if (!user?.idUsuario) {
      setLoadError('No se pudo eliminar la formación.');
      setDialogEliminar(false);
      return;
    }

    try {
      const ok = await deleteHvForm(Number(formacionAEliminar.id), user.idUsuario);
      if (ok) {
        setRefreshKey((prev) => prev + 1);
        setDialogEliminar(false);
        setFormacionAEliminar(null);
      } else {
        setLoadError('No se pudo eliminar la formación.');
        setDialogEliminar(false);
      }
    } catch (error) {
      setLoadError('No se pudo eliminar la formación.');
      setDialogEliminar(false);
    }
  };

  const handleAgregarCurso = () => {
    setModoEdicion('crear');
    setCursoSeleccionado(null);
    setVistaActual('curso-form');
  };

  const handleEditarCurso = (curso: Curso) => {
    setModoEdicion('editar');
    setCursoSeleccionado(curso);
    setVistaActual('curso-form');
  };

  const handleEliminarCurso = (id: string) => {
    if (window.confirm('Está seguro que desea eliminar este curso?')) {
      setCursos(cursos.filter(c => c.id !== id));
    }
  };

  const handleVolverAListados = () => {
    setVistaActual('listados');
    setFormacionSeleccionada(null);
    setCursoSeleccionado(null);
  };

  if (vistaActual === 'formacion-form') {
    return (
      <FormacionForm
        modo={modoEdicion}
        formacion={formacionSeleccionada}
        idHojaVida={hojaVidaId}
        usuarioAccion={user?.idUsuario || 0}
        onGuardar={handleFormacionGuardada}
        onCancelar={handleVolverAListados}
      />
    );
  }

  if (vistaActual === 'curso-form') {
    return (
      <CursoForm
        modo={modoEdicion}
        curso={cursoSeleccionado}
        idHojaVida={hojaVidaId}
        usuarioAccion={user?.idUsuario || 0}
        onGuardar={handleCursoGuardado}
        onCancelar={handleVolverAListados}
      />
    );
  }

  if (vistaActual === 'pdf-viewer') {
    return (
      <PdfViewer
        url={pdfUrl}
        title={pdfTitle}
        onVolver={handleVolverAListados}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#04a25c' }}>
                Formación Académica
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Registra tus estudios universitarios, técnicos y de postgrado
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAgregarFormacion}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Nivel de Estudio</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Carrera</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Tipo de Institución</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Institución</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      Cargando formación académica...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-red-600">
                      {loadError}
                    </td>
                  </tr>
                ) : formaciones.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      No hay registros de formación académica. Haz click en "Agregar" para registrar tu formación.
                    </td>
                  </tr>
                ) : (
                  formaciones.map((formacion, index) => (
                    <tr key={formacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formacion.nivelEstudio}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formacion.carrera}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formacion.tipoInstitucion}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formacion.institucion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formacion.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formacion.documento ? (
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
                            <DropdownMenuItem onClick={() => handleEditarFormacion(formacion)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEliminarFormacion(formacion.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                            {formacion.documento && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setPdfUrl(formacion.documento);
                                  setPdfTitle(formacion.carrera);
                                  setVistaActual('pdf-viewer');
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#04a25c' }}>
                Cursos o Programas de Especialización
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Registra cursos, diplomados, talleres y especializaciones relevantes
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAgregarCurso}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Tipo de Estudio</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Tipo de Institución</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Institución</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Fecha Inicio</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Fecha Fin</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Horas Lectivas</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-gray-500">
                      Cargando cursos...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-red-600">
                      {loadError}
                    </td>
                  </tr>
                ) : cursos.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-gray-500">
                      No hay registros de cursos. Haz click en "Agregar" para registrar un curso o especialización.
                    </td>
                  </tr>
                ) : (
                  cursos.map((curso, index) => (
                    <tr key={curso.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{curso.tipoEstudio}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{curso.descripcion}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{curso.tipoInstitucion}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{curso.institucion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{curso.fechaInicio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{curso.fechaFin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{curso.horasLectivas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {curso.documento ? (
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
                            <DropdownMenuItem onClick={() => handleEditarCurso(curso)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEliminarCurso(curso.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                            {curso.documento && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setPdfUrl(curso.documento);
                                  setPdfTitle(curso.descripcion);
                                  setVistaActual('pdf-viewer');
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogEliminar} onOpenChange={setDialogEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar formación académica?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro seleccionado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEliminar(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={confirmarEliminarFormacion}>
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
