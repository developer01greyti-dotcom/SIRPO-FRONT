import { useEffect, useState } from 'react';
import { X, Save, Upload, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  fetchOficinaCoordinacionList, 
  fetchEstadoConvocatoriaDropdown,
  fetchPerfilDropdown, 
  fetchTipoContratoDropdown, 
  type DropdownItem, 
  type OficinaZonalCoordinacionItem, 
} from '../../api/catalogos'; 
import { upsertConvocatoria, type ConvocatoriaUpsertPayload } from '../../api/convocatorias';
import { saveHvRefArchivo } from '../../api/hvRefArchivo';
import { type AdminRole } from '../../utils/roles';

interface Convocatoria {
  id?: string | number;
  idConvocatoria?: string | number;
  nombre?: string;
  titulo?: string;
  oficinaCoordinacion?: string;
  oficinaZonal?: string;
  perfil?: string;
  fechaInicio?: string;
  fechaFin?: string;
  pdfUrl?: string;
  archivoGuid?: string;
  idPerfil?: number | string;
  idOficinaZonal?: number | string;
  idOficinaCoordinacion?: number | string;
  tipoContrato?: string;
  numeroVacantes?: number;
  requisitosMinimos?: string;
  funcionesPrincipales?: string;
  salarioMin?: number;
  salarioMax?: number;
  estado?: string;
  estadoId?: number | string;
  idArchivoBases?: number;
}

interface ConvocatoriaFormProps {
  convocatoria: Convocatoria | null;
  isEditing: boolean;
  usuarioAccion: number;
  adminRole?: AdminRole;
  onGuardar: () => void;
  onCancelar: () => void;
}

export function ConvocatoriaForm({
  convocatoria,
  isEditing,
  usuarioAccion,
  adminRole,
  onGuardar,
  onCancelar,
}: ConvocatoriaFormProps) {
  const detailLabels =
    adminRole === 'date'
      ? {
          requisitos: 'Perfil requerido del profesional',
          funciones: 'Actividades a desarrollar',
        }
      : {
          requisitos: 'Requisitos mínimos',
          funciones: 'Funciones principales',
        };
  const [perfilOptions, setPerfilOptions] = useState<DropdownItem[]>([]);
  const [tipoContratoOptions, setTipoContratoOptions] = useState<DropdownItem[]>([]);
  const [estadoOptions, setEstadoOptions] = useState<DropdownItem[]>([]);
  const [oficinaOptions, setOficinaOptions] = useState<OficinaZonalCoordinacionItem[]>([]);
  const [oficinaQuery, setOficinaQuery] = useState('');
  const [isOficinaLoading, setIsOficinaLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const buildFileUrl = (guid: string) => {
    const apiBaseUrl =
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
      'http://localhost:8087/sirpo/v1';
    const params = new URLSearchParams({ guid });
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`;
  };

  const toInputDate = (value?: string) => { 
    if (!value) return ''; 
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    if (trimmed.includes('/')) {
      const [dd, mm, yyyy] = trimmed.split('/');
      if (yyyy && mm && dd) {
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
    }
    return trimmed; 
  }; 

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultDates = () => {
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3);
    return {
      fechaInicio: formatDate(start),
      fechaFin: formatDate(end),
    };
  };

  const [formData, setFormData] = useState({ 
    idConvocatoria: Number(convocatoria?.idConvocatoria ?? convocatoria?.id ?? 0), 
    titulo: convocatoria?.titulo || convocatoria?.nombre || '', 
    idPerfil: String(convocatoria?.idPerfil ?? ''), 
    idOficinaZonal: String(convocatoria?.idOficinaZonal ?? ''), 
    idOficinaCoordinacion: String(convocatoria?.idOficinaCoordinacion ?? ''), 
    oficinaZonal:
      convocatoria?.oficinaZonal ||
      (convocatoria?.oficinaCoordinacion
        ? convocatoria.oficinaCoordinacion.split('/')[0]?.trim() || ''
        : ''), 
    tipoContrato: convocatoria?.tipoContrato || '', 
    numeroVacantes: convocatoria?.numeroVacantes ? String(convocatoria.numeroVacantes) : '', 
    fechaInicio: convocatoria ? toInputDate(convocatoria?.fechaInicio) : getDefaultDates().fechaInicio, 
    fechaFin: convocatoria ? toInputDate(convocatoria?.fechaFin) : getDefaultDates().fechaFin, 
    requisitosMinimos: convocatoria?.requisitosMinimos || '',
    funcionesPrincipales: convocatoria?.funcionesPrincipales || '',
    salarioMin: convocatoria?.salarioMin ? String(convocatoria.salarioMin) : '',
    salarioMax: convocatoria?.salarioMax ? String(convocatoria.salarioMax) : '',
    estado: convocatoria?.estadoId ? String(convocatoria.estadoId) : convocatoria?.estado || '',
    idArchivoBases:
      convocatoria?.idArchivoBases ?? (convocatoria?.archivoGuid || convocatoria?.pdfUrl ? 1 : 0),
    archivoGuid: convocatoria?.archivoGuid || '',
    pdfUrl: convocatoria?.pdfUrl || (convocatoria?.archivoGuid ? buildFileUrl(String(convocatoria.archivoGuid)) : ''),
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => { 
    if (!convocatoria) { 
      const defaults = getDefaultDates();
      setFormData({ 
        idConvocatoria: 0, 
        titulo: '', 
        idPerfil: '', 
        idOficinaZonal: '', 
        idOficinaCoordinacion: '', 
        oficinaZonal: '', 
        tipoContrato: '', 
        numeroVacantes: '', 
        fechaInicio: defaults.fechaInicio, 
        fechaFin: defaults.fechaFin, 
        requisitosMinimos: '', 
        funcionesPrincipales: '', 
        salarioMin: '', 
        salarioMax: '', 
        estado: '', 
        idArchivoBases: 0,
        archivoGuid: '',
        pdfUrl: '',
      });
      setPdfFile(null);
      setOficinaQuery('');
      setOficinaOptions([]);
      return;
    }

    setFormData({
      idConvocatoria: Number(convocatoria?.idConvocatoria ?? convocatoria?.id ?? 0),
      titulo: convocatoria?.titulo || convocatoria?.nombre || '',
      idPerfil: String(convocatoria?.idPerfil ?? ''),
      idOficinaZonal: String(convocatoria?.idOficinaZonal ?? ''),
      idOficinaCoordinacion: String(convocatoria?.idOficinaCoordinacion ?? ''),
      oficinaZonal:
        convocatoria?.oficinaZonal ||
        (convocatoria?.oficinaCoordinacion
          ? convocatoria.oficinaCoordinacion.split('/')[0]?.trim() || ''
          : ''),
      tipoContrato: convocatoria?.tipoContrato || '',
      numeroVacantes: convocatoria?.numeroVacantes ? String(convocatoria.numeroVacantes) : '',
      fechaInicio: toInputDate(convocatoria?.fechaInicio),
      fechaFin: toInputDate(convocatoria?.fechaFin),
      requisitosMinimos: convocatoria?.requisitosMinimos || '',
      funcionesPrincipales: convocatoria?.funcionesPrincipales || '',
      salarioMin: convocatoria?.salarioMin ? String(convocatoria.salarioMin) : '',
      salarioMax: convocatoria?.salarioMax ? String(convocatoria.salarioMax) : '',
      estado: convocatoria?.estadoId ? String(convocatoria.estadoId) : convocatoria?.estado || '',
      idArchivoBases:
        convocatoria?.idArchivoBases ?? (convocatoria?.archivoGuid || convocatoria?.pdfUrl ? 1 : 0),
      archivoGuid: convocatoria?.archivoGuid || '',
      pdfUrl: convocatoria?.pdfUrl || (convocatoria?.archivoGuid ? buildFileUrl(String(convocatoria.archivoGuid)) : ''),
    });
    setPdfFile(null);
  }, [convocatoria]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [perfiles, tiposContrato, estados] = await Promise.all([
          fetchPerfilDropdown(),
          fetchTipoContratoDropdown(),
          fetchEstadoConvocatoriaDropdown(),
        ]);
        setPerfilOptions(perfiles || []);
        setTipoContratoOptions(tiposContrato || []);
        setEstadoOptions(estados || []);
      } catch (err) {
        setError('No se pudieron cargar los catálogos.');
      }
    };

    loadCatalogs();
  }, []);

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | undefined;

    const loadOficinas = async () => {
      if (oficinaQuery.trim().length < 3) {
        if (isActive) {
          setOficinaOptions((prev) => {
            if (!formData.idOficinaCoordinacion || !oficinaQuery) return [];
            const exists = prev.some(
              (item) => String(item.idOficinaCoordinacion) === String(formData.idOficinaCoordinacion),
            );
            if (exists) return prev;
            return [
              {
                idOficinaZonal: '',
                oficinaZonal: '',
                idOficinaCoordinacion: formData.idOficinaCoordinacion,
                oficinaCoordinacion: oficinaQuery,
              },
            ];
          });
        }
        return;
      }

      setIsOficinaLoading(true);
      try {
        const items = await fetchOficinaCoordinacionList(oficinaQuery.trim());
        if (isActive) {
          const selectedId = formData.idOficinaCoordinacion;
          const selectedLabel = oficinaQuery;
          let nextItems = items || [];
          if (selectedId && selectedLabel) {
            const exists = nextItems.some(
              (item) => String(item.idOficinaCoordinacion) === String(selectedId),
            );
            if (!exists) {
              nextItems = [
                {
                  idOficinaZonal: '',
                  oficinaZonal: '',
                  idOficinaCoordinacion: selectedId,
                  oficinaCoordinacion: selectedLabel,
                },
                ...nextItems,
              ];
            }
          }
          setOficinaOptions(nextItems);
        }
      } catch (err) {
        if (isActive) {
          setOficinaOptions([]);
        }
      } finally {
        if (isActive) {
          setIsOficinaLoading(false);
        }
      }
    };

    timeoutId = window.setTimeout(loadOficinas, 300);

    return () => {
      isActive = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [oficinaQuery, formData.idOficinaCoordinacion]);

  useEffect(() => {
    if (!convocatoria) return;
    const currentId = convocatoria.idOficinaCoordinacion;
    const currentLabel = convocatoria.oficinaCoordinacion;
    if (!currentId || !currentLabel) return;
    setFormData((prev) => ({
      ...prev,
      idOficinaCoordinacion: prev.idOficinaCoordinacion || String(currentId),
    }));
    setOficinaQuery(currentLabel);
    setOficinaOptions((prev) => {
      const exists = prev.some(
        (item) => String(item.idOficinaCoordinacion) === String(currentId),
      );
      if (exists) return prev;
      return [
        {
          idOficinaZonal: '',
          oficinaZonal: '',
          idOficinaCoordinacion: currentId,
          oficinaCoordinacion: currentLabel,
        },
        ...prev,
      ];
    });
  }, [convocatoria]);

  useEffect(() => {
    if (!perfilOptions.length) return;
    if (!formData.idPerfil && convocatoria?.perfil) {
      const match = perfilOptions.find(
        (item) => item.descripcion?.toUpperCase() === convocatoria.perfil?.toUpperCase(),
      );
      if (match) {
        setFormData((prev) => ({ ...prev, idPerfil: String(match.id ?? '') }));
      }
    }
  }, [perfilOptions, convocatoria, formData.idPerfil]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setFormData((prev) => ({
        ...prev,
        pdfUrl: URL.createObjectURL(file),
        archivoGuid: '',
        idArchivoBases: 1,
      }));
    }
  };

  const getFileExtension = (fileName: string) => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.titulo || !formData.idPerfil || !formData.estado) {
      setError('Complete los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ConvocatoriaUpsertPayload = {
        idConvocatoria: Number(formData.idConvocatoria || 0),
        titulo: formData.titulo,
        idPerfil: Number(formData.idPerfil),
        idOficinaCoordinacion: Number(formData.idOficinaCoordinacion || 0),
        tipoContrato: formData.tipoContrato || '',
        numeroVacantes: Number(formData.numeroVacantes || 0),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        requisitosMinimos: formData.requisitosMinimos || '',
        funcionesPrincipales: formData.funcionesPrincipales || '',
        estado: String(formData.estado || ''),
        idArchivoBases: formData.idArchivoBases ? 1 : 0,
        usuarioAccion,
      };

      const idConvocatoria = await upsertConvocatoria(payload);
      if (!idConvocatoria) {
        setError('No se pudo guardar el Servicio.');
        return;
      }

      if (pdfFile) {
        const ext = getFileExtension(pdfFile.name);
        const ok = await saveHvRefArchivo(pdfFile, {
          idHvRefArchivo: 0,
          idHojaVida: 0,
          entidad: 'CONV',
          idEntidad: idConvocatoria,
          tipoArchivo: 'CONVOCATORIA',
          nombreOrig: pdfFile.name,
          ext: ext || 'pdf',
          mime: pdfFile.type || 'application/pdf',
          sizeBytes: pdfFile.size,
          ruta: 'conv',
          usuarioAccion,
        });
        if (!ok) {
          setError('El Servicio se guardó, pero no se pudo subir el archivo.');
        }
      }

      onGuardar();
    } catch (err) {
      setError('No se pudo guardar el Servicio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#04a25c' }}>
            {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h1>
          <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
            {isEditing
              ? 'Actualizar información del Servicio'
              : 'Crear un nuevo Servicio laboral'}
          </p>
        </div>
        <Button variant="outline" onClick={onCancelar} className="gap-2">
          <X className="w-4 h-4" />
          Cancelar
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
            Información General
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Título del Servicio *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Extensionista Agrícola - Lima Norte 2026"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
              <div className="space-y-2"> 
                <label className="block text-sm font-semibold text-gray-700">Categoría de Servicio *</label> 
                <select 
                  value={formData.idPerfil} 
                  onChange={(e) => setFormData({ ...formData, idPerfil: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  required 
                > 
                  <option value="">Seleccione...</option> 
                  {perfilOptions.map((item) => ( 
                    <option key={item.id} value={item.id}> 
                      {item.descripcion} 
                    </option> 
                  ))} 
                </select> 
              </div> 
              <div className="space-y-2"> 
                <label className="block text-sm font-semibold text-gray-700"> 
                  OZ / Oficina de Coordinación
                </label> 
                <Select 
                  name="idOficinaCoordinacion" 
                  value={formData.idOficinaCoordinacion} 
                  onValueChange={(value) => { 
                    const selected = oficinaOptions.find( 
                      (item) => String(item.idOficinaCoordinacion) === value, 
                    ); 
                    setFormData((prev) => ({ 
                      ...prev, 
                      idOficinaCoordinacion: value, 
                      idOficinaZonal: selected?.idOficinaZonal ? String(selected.idOficinaZonal) : prev.idOficinaZonal,
                      oficinaZonal: selected?.oficinaZonal ?? prev.oficinaZonal,
                    })); 
                    if (selected) { 
                      setOficinaQuery(selected.oficinaCoordinacion); 
                    } 
                  }} 
                > 
                  <SelectTrigger id="oficinaCoordinacion"> 
                    <SelectValue placeholder="Buscar oficina de Coordinación" /> 
                  </SelectTrigger> 
                  <SelectContent 
                    onOpenAutoFocus={(event) => event.preventDefault()} 
                    onCloseAutoFocus={(event) => event.preventDefault()} 
                  > 
                    <div className="p-2"> 
                      <div className="flex gap-2"> 
                        <Input 
                          id="oficinaCoordSearch" 
                          type="text" 
                          placeholder="Escribe al menos 3 caracteres" 
                          value={oficinaQuery} 
                          onChange={(e) => { 
                            const value = e.target.value; 
                            setOficinaQuery(value); 
                            if (formData.idOficinaCoordinacion) { 
                              setFormData((prev) => ({ 
                                ...prev, 
                                idOficinaCoordinacion: '', 
                                idOficinaZonal: '', 
                                oficinaZonal: '',
                              })); 
                            } 
                          }} 
                          autoFocus 
                          onKeyDown={(e) => e.stopPropagation()} 
                          className="w-[85%]" 
                        /> 
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="w-[15%]" 
                          onMouseDown={(event) => event.preventDefault()} 
                          onClick={() => { 
                            setOficinaQuery(''); 
                            setFormData((prev) => ({ 
                              ...prev, 
                              idOficinaCoordinacion: '', 
                              idOficinaZonal: '', 
                              oficinaZonal: '',
                            })); 
                            setOficinaOptions([]); 
                            const input = document.getElementById('oficinaCoordSearch') as HTMLInputElement | null; 
                            input?.focus(); 
                          }} 
                        > 
                          Limpiar 
                        </Button> 
                      </div> 
                    </div> 
                    {oficinaQuery.trim().length < 3 ? ( 
                      <SelectItem value="min" disabled> 
                        Ingrese al menos 3 caracteres 
                      </SelectItem> 
                    ) : isOficinaLoading ? ( 
                      <SelectItem value="loading" disabled> 
                        Buscando... 
                      </SelectItem> 
                    ) : oficinaOptions.length === 0 ? ( 
                      <SelectItem value="empty" disabled> 
                        Sin resultados 
                      </SelectItem> 
                    ) : ( 
                      oficinaOptions.map((item) => ( 
                        <SelectItem key={item.idOficinaCoordinacion} value={String(item.idOficinaCoordinacion)}> 
                          {item.oficinaCoordinacion} 
                        </SelectItem> 
                      )) 
                    )} 
                  </SelectContent> 
                </Select> 
              </div> 
            </div> 

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
              <div className="space-y-2"> 
                <label className="block text-sm font-semibold text-gray-700">Tipo de proceso</label> 
                <select 
                  value={formData.tipoContrato} 
                  onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                > 
                  <option value="">Seleccione...</option> 
                  {tipoContratoOptions.map((item) => ( 
                    <option key={item.id} value={item.id}> 
                      {item.descripcion} 
                    </option> 
                  ))} 
                </select> 
              </div> 

              <div className="space-y-2"> 
                <label className="block text-sm font-semibold text-gray-700">Número de Vacantes</label> 
                <input 
                  type="number" 
                  value={formData.numeroVacantes} 
                  onChange={(e) => setFormData({ ...formData, numeroVacantes: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                /> 
              </div> 
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Estado *</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Seleccione...</option>
                  {estadoOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div> 
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
            Período del Servicio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Fecha de Inicio *</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Fecha de Fin *</label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>

        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
            Detalle del Servicio
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{detailLabels.requisitos}</label>
              <textarea
                value={formData.requisitosMinimos}
                onChange={(e) => setFormData({ ...formData, requisitosMinimos: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{detailLabels.funciones}</label>
              <textarea
                value={formData.funcionesPrincipales}
                onChange={(e) => setFormData({ ...formData, funcionesPrincipales: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[120px]"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
            Bases del Servicio
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Archivo PDF de las Bases</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {pdfFile ? pdfFile.name : 'Seleccionar archivo PDF'}
                    </span>
                  </div>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-500">Formato: PDF | Tamaño máximo: 5MB</p>
            </div>

            {(formData.pdfUrl || formData.archivoGuid || pdfFile) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Archivo cargado correctamente</p>
                  <p className="text-xs text-green-600">
                    {pdfFile?.name || 'bases_servicio.pdf'}
                  </p>
                </div>
                {(formData.pdfUrl || formData.archivoGuid) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.pdfUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Ver archivo
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancelar} className="gap-2">
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-2" disabled={isSubmitting}>
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}
          </Button>
        </div>
      </form>
    </div>
  );
}


