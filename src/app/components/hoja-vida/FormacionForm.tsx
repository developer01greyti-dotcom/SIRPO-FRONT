import { Upload, Eye, X, Search, Save } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect, useState } from 'react';
import {
  fetchNivelEstudioDropdown,
  fetchTipoEntidadDropdown,
  fetchTipoInstitucionDropdown,
  fetchUbigeoDistritoList,
  type DropdownItem,
} from '../../api/catalogos';
import { upsertHvForm } from '../../api/hojaVida';
import { deleteHvRefArchivo, fetchHvRefArchivo, saveHvRefArchivo } from '../../api/hvRefArchivo';
import { PAISES_CATALOGO } from '../../data/paises';

interface Formacion {
  id: string;
  nivelEstudio: string;
  carrera: string;
  tipoInstitucion: string;
  tipoEntidad?: string;
  institucion: string;
  ruc?: string;
  distrito?: string;
  pais?: string;
  fecha: string;
  documento: string;
}

interface FormacionFormProps {
  modo: 'crear' | 'editar';
  formacion: Formacion | null;
  idHojaVida: number;
  usuarioAccion: number;
  onGuardar: () => void;
  onCancelar: () => void;
}

export function FormacionForm({
  modo,
  formacion,
  idHojaVida,
  usuarioAccion,
  onGuardar,
  onCancelar,
}: FormacionFormProps) {
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(formacion?.documento || null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [documentoEliminado, setDocumentoEliminado] = useState(false);
  const [tipoInstitucion, setTipoInstitucion] = useState<string>(formacion?.tipoInstitucionId || '');
  const [tipoEntidad, setTipoEntidad] = useState<string>(formacion?.tipoEntidadId || '');
  const [nivelEstudio, setNivelEstudio] = useState<string>(formacion?.nivelEstudioId || '');
  const [distritoValue, setDistritoValue] = useState<string>(formacion?.distrito || '');
  const [ubigeoQuery, setUbigeoQuery] = useState<string>(formacion?.distrito || '');
  const [ubigeoOptions, setUbigeoOptions] = useState<DropdownItem[]>([]);
  const [isUbigeoLoading, setIsUbigeoLoading] = useState(false);
  const [pendingUbigeoId, setPendingUbigeoId] = useState('');
  const [tipoInstitucionOptions, setTipoInstitucionOptions] = useState<DropdownItem[]>([]);
  const [tipoEntidadOptions, setTipoEntidadOptions] = useState<DropdownItem[]>([]);
  const [nivelEstudioOptions, setNivelEstudioOptions] = useState<DropdownItem[]>([]);
  const [fechaValue, setFechaValue] = useState<string>(formacion?.fecha || '');
  const [paisValue, setPaisValue] = useState<string>('');
  const [paisQuery, setPaisQuery] = useState<string>('');
  const revokePreviewUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };
  const tipoInstitucionDescripcion = tipoInstitucionOptions.find(
    (item) => String(item.id) === tipoInstitucion,
  )?.descripcion?.toLowerCase() || '';
  const tipoInstitucionLower = tipoInstitucion.toLowerCase();
  const isInternacional =
    tipoInstitucionDescripcion.includes('internacional') || tipoInstitucionLower === 'internacional';
  const isNacional =
    !isInternacional &&
    (tipoInstitucionDescripcion.includes('nacional') || tipoInstitucionLower === 'nacional');
  const resolvePaisValue = (raw: string) => {
    const normalized = raw.trim().toUpperCase();
    if (!normalized) return '';
    const byCode = PAISES_CATALOGO.find((item) => item.id === normalized);
    if (byCode) return byCode.id;
    const byName = PAISES_CATALOGO.find((item) => item.descripcion === normalized);
    return byName?.id || '';
  };
  const getPaisDescripcion = (value: string) =>
    PAISES_CATALOGO.find((item) => item.id === value)?.descripcion || '';

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | undefined;

    const loadUbigeo = async () => {
      if (ubigeoQuery.trim().length < 3) {
        if (isActive) {
          setUbigeoOptions([]);
        }
        return;
      }

      setIsUbigeoLoading(true);
      try {
        const items = await fetchUbigeoDistritoList(ubigeoQuery.trim());
        if (isActive) {
          setUbigeoOptions(items);
        }
      } catch (error) {
        if (isActive) {
          setUbigeoOptions([]);
        }
      } finally {
        if (isActive) {
          setIsUbigeoLoading(false);
        }
      }
    };

    timeoutId = window.setTimeout(loadUbigeo, 300);

    return () => {
      isActive = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [ubigeoQuery]);

  useEffect(() => {
    if (!pendingUbigeoId || ubigeoOptions.length === 0) return;
    const selected = ubigeoOptions.find(
      (item) => String(item.id) === pendingUbigeoId,
    );
    if (selected) {
      setDistritoValue(String(selected.id));
      setUbigeoQuery(selected.descripcion);
      setPendingUbigeoId('');
    }
  }, [pendingUbigeoId, ubigeoOptions]);

  useEffect(() => {
    let isActive = true;
    const loadDropdowns = async () => {
      try {
        const [tiposInst, tiposEnt, niveles] = await Promise.all([
          fetchTipoInstitucionDropdown(),
          fetchTipoEntidadDropdown(),
          fetchNivelEstudioDropdown(),
        ]);

        if (isActive) {
          setTipoInstitucionOptions(tiposInst);
          setTipoEntidadOptions(tiposEnt);
          setNivelEstudioOptions(niveles);
        }
      } catch (error) {
        if (isActive) {
          setTipoInstitucionOptions([]);
          setTipoEntidadOptions([]);
          setNivelEstudioOptions([]);
        }
      }
    };

    loadDropdowns();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (modo === 'crear') {
      setTipoInstitucion('');
      setTipoEntidad('');
      setNivelEstudio('');
      setDistritoValue('');
      setUbigeoQuery('');
      setPendingUbigeoId('');
      setFechaValue('');
      setPaisValue('');
      setPaisQuery('');
      setDocumentoFile(null);
      setDocumentoPreview(null);
      setDocumentoEliminado(false);
      return;
    }

    setTipoInstitucion(formacion?.tipoInstitucionId || '');
    setTipoEntidad(formacion?.tipoEntidadId || '');
    setNivelEstudio(formacion?.nivelEstudioId || '');
    const distritoId = String(formacion?.distritoId || '');
    const distritoDesc = formacion?.distritoDescripcion || '';
    setDistritoValue('');
    setPendingUbigeoId(distritoId);
    setUbigeoQuery(distritoDesc.length >= 3 ? distritoDesc : '');
    setFechaValue(formatFechaDisplay(formacion?.fecha || ''));
    const paisInicial = resolvePaisValue(formacion?.pais || '');
    setPaisValue(paisInicial);
    const rawPais = formacion?.pais || '';
    setPaisQuery(paisInicial ? getPaisDescripcion(paisInicial) : rawPais.toUpperCase());
    setDocumentoPreview(formacion?.documento || null);
    setDocumentoFile(null);
    setDocumentoEliminado(false);
  }, [modo, formacion]);

  const formatFechaDisplay = (value: string) => {
    if (!value) return '';
    if (value.includes('-')) return value;
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return value;
    return `${match[3]}-${match[2]}-${match[1]}`;
  };

  const normalizeFechaToApi = (value: string) => {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return value;
    return `${match[3]}-${match[2]}-${match[1]}`;
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      revokePreviewUrl(documentoPreview);
      setDocumentoFile(file);
      setDocumentoEliminado(false);
      setDocumentoPreview(URL.createObjectURL(file));
    }
  };

  const removeDocumento = () => {
    revokePreviewUrl(documentoPreview);
    setDocumentoPreview(null);
    setDocumentoFile(null);
    setDocumentoEliminado(Boolean(formacion?.documento));
    const fileInput = document.getElementById('documento-formacion') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const openDocumentoPreview = () => {
    if (!documentoPreview) return;
    window.open(documentoPreview, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idHojaVida) {
      return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const nuevaFormacion: Omit<Formacion, 'id'> = {
      nivelEstudio,
      carrera: formData.get('carrera') as string,
      tipoInstitucion,
      tipoEntidad,
      institucion: formData.get('institucion') as string,
      fecha: fechaValue,
      documento: documentoPreview || '',
    };

    if (isNacional) {
      nuevaFormacion.ruc = formData.get('ruc') as string;
      nuevaFormacion.distrito = distritoValue;
    } else {
      nuevaFormacion.pais = paisValue;
    }

    const hasArchivo = !documentoEliminado && Boolean(documentoFile || documentoPreview);
    const payload = {
      idHvFormacion: Number(formacion?.id || 0),
      idHojaVida,
      nivelEstudio,
      carrera: nuevaFormacion.carrera,
      tipoInstitucion,
      tipoEntidad,
      institucion: nuevaFormacion.institucion,
      ruc: nuevaFormacion.ruc || formacion?.ruc || '',
      idUbigeo: Number(distritoValue || 0),
      pais: nuevaFormacion.pais || '',
      fechaObtencion: normalizeFechaToApi(fechaValue),
      idArchivo: hasArchivo ? 1 : 0,
      usuarioAccion,
    };

    const idHvFormacion = await upsertHvForm(payload);
    if (!idHvFormacion) {
      return;
    }

    if (documentoEliminado && formacion?.id) {
      const archivos = await fetchHvRefArchivo('HV_FORM', Number(formacion.id));
      const actual = archivos.find((item) => item.tipoArchivo === 'HV_FORM_EVIDENCIA');
      if (actual?.idHvRefArchivo) {
        await deleteHvRefArchivo(actual.idHvRefArchivo, usuarioAccion);
      }
    }

    if (documentoFile) {
      const extension = documentoFile.name.split('.').pop() || '';
      const payloadArchivo = {
        idHvRefArchivo: 0,
        idHojaVida,
        entidad: 'HV_FORM',
        idEntidad: idHvFormacion,
        tipoArchivo: 'HV_FORM_EVIDENCIA',
        nombreOrig: documentoFile.name,
        ext: extension,
        mime: documentoFile.type || 'application/octet-stream',
        sizeBytes: documentoFile.size,
        ruta: 'hv',
        usuarioAccion,
      };
      await saveHvRefArchivo(documentoFile, payloadArchivo);
    }

    onGuardar();
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#04a25c' }}>
                {modo === 'crear' ? 'Registrar Formación Académica' : 'Editar Formación Académica'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {modo === 'crear'
                  ? 'Completa los datos de tu formación académica'
                  : 'Modifica los datos de tu formación académica'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-blue-600 hover:text-blue-700"
              onClick={onCancelar}
            >
              <X className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoInstitucion">Tipo de institución</Label>
            <Select
              name="tipoInstitucion"
              value={tipoInstitucion || undefined}
              onValueChange={(value) => setTipoInstitucion(value)}
            >
              <SelectTrigger id="tipoInstitucion">
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {tipoInstitucionOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoEntidad">Tipo de Entidad</Label>
            <Select name="tipoEntidad" value={tipoEntidad || undefined} onValueChange={(value) => setTipoEntidad(value)}>
              <SelectTrigger id="tipoEntidad">
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {tipoEntidadOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isNacional && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <div className="flex gap-2">
                  <Input
                    id="ruc"
                    name="ruc"
                    type="text"
                    placeholder=""
                    maxLength={11}
                    defaultValue={formacion?.ruc || ''}
                  />
                  <Button type="button" variant="outline" className="gap-2 whitespace-nowrap">
                    <Search className="w-4 h-4" />
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institucion">Institución</Label>
                <Input
                  id="institucion"
                  name="institucion"
                  type="text"
                  placeholder=""
                  defaultValue={formacion?.institucion || ''}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="distrito">Ubigeo (Departamento / Provincia / Distrito)</Label>
                <Select
                  name="distrito"
                  value={distritoValue}
                  onValueChange={(value) => {
                    setDistritoValue(value);
                    const selected = ubigeoOptions.find((item) => String(item.id) === value);
                    if (selected) {
                      setUbigeoQuery(selected.descripcion);
                    }
                  }}
                >
                  <SelectTrigger id="distrito">
                    <SelectValue placeholder="Buscar ubigeo" />
                  </SelectTrigger>
                  <SelectContent
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onCloseAutoFocus={(event) => event.preventDefault()}
                  >
                    <div className="p-2">
                      <div className="flex gap-2">
                        <Input
                          id="ubigeoSearchFormacion"
                          type="text"
                          placeholder="Escribe al menos 3 caracteres"
                          value={ubigeoQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            setUbigeoQuery(value);
                            if (distritoValue) {
                              setDistritoValue('');
                            }
                            if (pendingUbigeoId) {
                              setPendingUbigeoId('');
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
                            setUbigeoQuery('');
                            setDistritoValue('');
                            setUbigeoOptions([]);
                            const input = document.getElementById('ubigeoSearchFormacion') as HTMLInputElement | null;
                            input?.focus();
                          }}
                        >
                          Limpiar Búsqueda
                        </Button>
                      </div>
                    </div>
                    {ubigeoQuery.trim().length < 3 ? (
                      <SelectItem value="min" disabled>
                        Ingrese al menos 3 caracteres
                      </SelectItem>
                    ) : isUbigeoLoading ? (
                      <SelectItem value="loading" disabled>
                        Buscando...
                      </SelectItem>
                    ) : ubigeoOptions.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Sin resultados
                      </SelectItem>
                    ) : (
                      ubigeoOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.descripcion}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {isInternacional && (
            <>
              <div className="space-y-2">
                <Label htmlFor="institucion">Nombre de institución</Label>
                <Input
                  id="institucion"
                  name="institucion"
                  type="text"
                  placeholder=""
                  defaultValue={formacion?.institucion || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Select
                  name="pais"
                  value={paisValue || undefined}
                  onValueChange={(value) => {
                    setPaisValue(value);
                    setPaisQuery(getPaisDescripcion(value));
                  }}
                >
                  <SelectTrigger id="pais">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onCloseAutoFocus={(event) => event.preventDefault()}
                  >
                    <div className="p-2">
                      <div className="flex gap-2">
                        <Input
                          id="paisSearchFormacion"
                          type="text"
                          placeholder="Escribe al menos 3 caracteres"
                          value={paisQuery}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            setPaisQuery(value);
                            if (paisValue) {
                              setPaisValue('');
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
                            setPaisQuery('');
                            setPaisValue('');
                            const input = document.getElementById('paisSearchFormacion') as HTMLInputElement | null;
                            input?.focus();
                          }}
                        >
                          Limpiar Búsqueda
                        </Button>
                      </div>
                    </div>
                    {(paisQuery.trim().length >= 3
                      ? PAISES_CATALOGO.filter((item) =>
                          item.descripcion.includes(paisQuery.trim().toUpperCase()),
                        )
                      : PAISES_CATALOGO
                    )
                      .slice(0, 20)
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.descripcion} — {item.id}
                        </SelectItem>
                      ))}
                    {paisQuery.trim().length >= 3 &&
                      PAISES_CATALOGO.filter((item) =>
                        item.descripcion.includes(paisQuery.trim().toUpperCase()),
                      ).length === 0 && (
                        <SelectItem value="empty" disabled>
                          Sin resultados
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="nivelEstudio">Nivel de estudio</Label>
            <Select name="nivelEstudio" value={nivelEstudio || undefined} onValueChange={(value) => setNivelEstudio(value)}>
              <SelectTrigger id="nivelEstudio">
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {nivelEstudioOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrera">Carrera</Label>
            <Input
              id="carrera"
              name="carrera"
              type="text"
              placeholder=""
              defaultValue={formacion?.carrera || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Extensión del Diploma (dd/mm/aaaa)</Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              lang="es-PE"
              value={fechaValue}
              onChange={(e) => setFechaValue(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="documento-formacion">Documento de evidencia</Label>
            <div className="space-y-2">
              <label
                htmlFor="documento-formacion"
                className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {documentoPreview ? 'Cambiar documento' : 'Seleccionar documento'}
                </span>
              </label>
              <input
                id="documento-formacion"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleDocumentoChange}
              />
              <p className="text-xs text-gray-500">Elija un documento de extensión PDF o imagen y de tamaño menor a 100 MB</p>

              {documentoPreview && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Documento adjuntado correctamente</p>
                    <p className="text-xs text-green-700">Click en "Ver" para visualizar el archivo</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={openDocumentoPreview}
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={removeDocumento}
                    >
                      <X className="w-4 h-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4" />
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  );
}
