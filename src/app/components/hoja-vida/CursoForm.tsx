import { Upload, Eye, X, Search, Save } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect, useRef, useState } from 'react';
import {
  fetchTipoEstudioDropdown,
  fetchTipoInstitucionDropdown,
  fetchUbigeoDistritoList,
  type DropdownItem,
} from '../../api/catalogos';
import { upsertHvCur } from '../../api/hojaVida';
import { deleteHvRefArchivo, fetchHvRefArchivo, saveHvRefArchivo } from '../../api/hvRefArchivo';
import { PAISES_CATALOGO } from '../../data/paises';
import { pedirRUC } from '../../api/pide';

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
  distrito?: string;
  distritoId?: string;
  distritoDescripcion?: string;
  pais?: string;
  fechaInicio: string;
  fechaFin: string;
  horasLectivas: string;
  documento: string;
}

interface CursoFormProps {
  modo: 'crear' | 'editar';
  curso: Curso | null;
  idHojaVida: number;
  usuarioAccion: number;
  onGuardar: () => void;
  onCancelar: () => void;
}

export function CursoForm({
  modo,
  curso,
  idHojaVida,
  usuarioAccion,
  onGuardar,
  onCancelar,
}: CursoFormProps) {
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(curso?.documento || null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [documentoEliminado, setDocumentoEliminado] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error' | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);
  const todayIso = new Date().toISOString().split('T')[0];
  const [tipoInstitucion, setTipoInstitucion] = useState<string>('');
  const [rucValue, setRucValue] = useState<string>(curso?.ruc || '');
  const [institucionValue, setInstitucionValue] = useState<string>(curso?.institucion || '');
  const [isSearchingRuc, setIsSearchingRuc] = useState(false);
  const [isRucLocked, setIsRucLocked] = useState<boolean>(Boolean(curso?.ruc));
  const [tipoEstudio, setTipoEstudio] = useState<string>(curso?.tipoEstudio || '');
  const [distritoValue, setDistritoValue] = useState<string>(curso?.distrito || '');
  const [ubigeoQuery, setUbigeoQuery] = useState<string>(curso?.distrito || '');
  const [ubigeoOptions, setUbigeoOptions] = useState<DropdownItem[]>([]);
  const [isUbigeoLoading, setIsUbigeoLoading] = useState(false);
  const [tipoInstitucionOptions, setTipoInstitucionOptions] = useState<DropdownItem[]>([]);
  const [tipoEstudioOptions, setTipoEstudioOptions] = useState<DropdownItem[]>([]);
  const [paisValue, setPaisValue] = useState<string>('');
  const [paisQuery, setPaisQuery] = useState<string>('');
  const [pendingUbigeoId, setPendingUbigeoId] = useState('');
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
  const resolveTipoInstitucionValue = (raw: string) => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return '';
    const byId = tipoInstitucionOptions.find((item) => String(item.id) === raw);
    if (byId) return String(byId.id);
    const byDesc = tipoInstitucionOptions.find(
      (item) => item.descripcion.toLowerCase() === normalized,
    );
    return byDesc ? String(byDesc.id) : '';
  };
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
  const resolveTipoEstudioValue = (raw: string) => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return '';
    const byId = tipoEstudioOptions.find((item) => String(item.id) === raw);
    if (byId) return String(byId.id);
    const byDesc = tipoEstudioOptions.find(
      (item) => item.descripcion.toLowerCase() === normalized,
    );
    return byDesc ? String(byDesc.id) : '';
  };

  const pickValue = (data: any, keys: string[]) => {
    if (!data) return '';
    for (const key of keys) {
      const value = data?.[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return '';
  };

  const extractPayload = (data: any) => {
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    if (data?.datosPrincipales) return data.datosPrincipales;
    if (data?.data?.datosPrincipales) return data.data.datosPrincipales;
    if (data?.resultado?.datosPrincipales) return data.resultado.datosPrincipales;
    if (data?.data) return data.data;
    if (data?.resultado) return data.resultado;
    return data ?? {};
  };

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
    if (modo === 'crear') {
      setTipoInstitucion('');
      setTipoEstudio('');
      setRucValue('');
      setInstitucionValue('');
      setDistritoValue('');
      setUbigeoQuery('');
      setPendingUbigeoId('');
      setPaisValue('');
      setPaisQuery('');
      setDocumentoPreview(null);
      setDocumentoFile(null);
      setDocumentoEliminado(false);
      setSaveMessage(null);
      setSaveMessageType(null);
      setIsRucLocked(false);
      return;
    }

    setTipoInstitucion(resolveTipoInstitucionValue(curso?.tipoInstitucionId || curso?.tipoInstitucion || ''));
    setTipoEstudio(resolveTipoEstudioValue(curso?.tipoEstudioId || curso?.tipoEstudio || ''));
    setRucValue(curso?.ruc || '');
    setInstitucionValue(curso?.institucion || '');
    const distritoId = String(curso?.distritoId || '');
    const distritoDesc = curso?.distritoDescripcion || curso?.distrito || '';
    setDistritoValue('');
    setPendingUbigeoId(distritoId);
    setUbigeoQuery(distritoDesc.length >= 3 ? distritoDesc : '');
    const paisInicial = resolvePaisValue(curso?.pais || '');
    setPaisValue(paisInicial);
    const rawPais = curso?.pais || '';
    setPaisQuery(paisInicial ? getPaisDescripcion(paisInicial) : rawPais.toUpperCase());
    setDocumentoPreview(curso?.documento || null);
    setDocumentoFile(null);
    setDocumentoEliminado(false);
    setSaveMessage(null);
    setSaveMessageType(null);
    setIsRucLocked(Boolean(curso?.ruc));
  }, [modo, curso, tipoInstitucionOptions]);

  useEffect(() => {
    let isActive = true;
    const loadDropdowns = async () => {
      try {
        const [tiposInst, tiposEst] = await Promise.all([
          fetchTipoInstitucionDropdown(),
          fetchTipoEstudioDropdown(),
        ]);
        if (isActive) {
          setTipoInstitucionOptions(tiposInst);
          setTipoEstudioOptions(tiposEst);
        }
      } catch (error) {
        if (isActive) {
          setTipoInstitucionOptions([]);
          setTipoEstudioOptions([]);
        }
      }
    };
    loadDropdowns();
    return () => {
      isActive = false;
    };
  }, []);

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
    setDocumentoEliminado(Boolean(curso?.documento));
    const fileInput = document.getElementById('documento-curso') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const openDocumentoPreview = () => {
    if (!documentoPreview) return;
    window.open(documentoPreview, '_blank', 'noopener,noreferrer');
  };

  const handleBuscarRuc = async () => {
    setSaveMessage(null);
    setSaveMessageType(null);
    if (!rucValue.trim()) {
      setSaveMessage('Ingrese el número de RUC.');
      setSaveMessageType('error');
      return;
    }
    try {
      setIsSearchingRuc(true);
      const data = await pedirRUC(rucValue.trim());
      const payload = extractPayload(data);
      const razon =
        pickValue(payload, [
          'razonSocial',
          'razon_social',
          'nombre_o_razon_social',
          'razonSocialEmpresa',
          'nombreORazonSocial',
          'nombre',
        ]) ||
        pickValue(data, ['razonSocial', 'razon_social', 'nombre_o_razon_social']);
      if (!razon) {
        setSaveMessage('No se encontró razón social para el RUC.');
        setSaveMessageType('error');
        return;
      }
      setInstitucionValue(razon);
      setIsRucLocked(true);
    } catch (error) {
      setSaveMessage('No se pudo consultar el RUC. Intente nuevamente.');
      setSaveMessageType('error');
    } finally {
      setIsSearchingRuc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idHojaVida) {
      return;
    }
    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    setSaveMessage('Guardando...');
    setSaveMessageType(null);
    const formData = new FormData(e.target as HTMLFormElement);
    const descripcionValue = String(formData.get('descripcion') || '').trim();
    const fechaInicioValue = String(formData.get('fechaInicio') || '').trim();
    const fechaFinValue = String(formData.get('fechaFin') || '').trim();
    const horasLectivasValue = String(formData.get('horasLectivas') || '').trim();
    const hasArchivo = !documentoEliminado && Boolean(documentoFile || documentoPreview);
    const missingFields: string[] = [];
    if (!tipoInstitucion) missingFields.push('Tipo de institución');
    if (!tipoEstudio) missingFields.push('Tipo de estudio');
    if (!descripcionValue) missingFields.push('Descripción');
    if (!institucionValue.trim()) missingFields.push('Institución');
    if (!fechaInicioValue) missingFields.push('Fecha inicio');
    if (!fechaFinValue) missingFields.push('Fecha fin');
    if (!horasLectivasValue) missingFields.push('Horas lectivas');
    if (isNacional) {
      if (!rucValue.trim()) missingFields.push('RUC');
      if (!distritoValue) missingFields.push('Ubigeo');
    } else if (isInternacional) {
      if (!paisValue) missingFields.push('País');
    }
    if (!hasArchivo) missingFields.push('Documento de evidencia');
    if (missingFields.length > 0) {
      setSaveMessage(`Complete los campos obligatorios: ${missingFields.join(', ')}.`);
      setSaveMessageType('error');
      return;
    }
    const tipoEstudioDescripcion =
      tipoEstudioOptions.find((item) => String(item.id) === tipoEstudio)?.descripcion || tipoEstudio;
    const nuevoCurso: Omit<Curso, 'id'> = {
      tipoEstudio: tipoEstudioDescripcion,
      descripcion: descripcionValue,
      tipoInstitucion,
      institucion: institucionValue,
      fechaInicio: fechaInicioValue,
      fechaFin: fechaFinValue,
      horasLectivas: horasLectivasValue,
      documento: documentoPreview || '',
    };

    if (nuevoCurso.fechaInicio && nuevoCurso.fechaFin) {
      const start = new Date(nuevoCurso.fechaInicio);
      const end = new Date(nuevoCurso.fechaFin);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        setSaveMessage('La fecha fin debe ser mayor a la fecha inicio.');
        setSaveMessageType('error');
        return;
      }
    }

    if (nuevoCurso.fechaInicio) {
      const start = new Date(nuevoCurso.fechaInicio);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!Number.isNaN(start.getTime()) && start > today) {
        setSaveMessage('La fecha inicio no puede ser mayor a la fecha actual.');
        setSaveMessageType('error');
        return;
      }
    }

    if (nuevoCurso.fechaFin) {
      const end = new Date(nuevoCurso.fechaFin);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!Number.isNaN(end.getTime()) && end > today) {
        setSaveMessage('La fecha fin no puede ser mayor a la fecha actual.');
        setSaveMessageType('error');
        return;
      }
    }

    if (isNacional) {
      nuevoCurso.ruc = rucValue.trim();
      nuevoCurso.distrito = distritoValue;
    } else {
      nuevoCurso.pais = paisValue;
    }

    const payload = {
      idHvCurso: Number(curso?.idHvCurso || curso?.id || 0),
      idHojaVida,
      tipoEstudio,
      descripcion: nuevoCurso.descripcion,
      tipoInstitucion,
      institucion: nuevoCurso.institucion,
      ruc: nuevoCurso.ruc || curso?.ruc || '',
      idUbigeo: Number(distritoValue || 0),
      pais: nuevoCurso.pais || '',
      fechaInicio: nuevoCurso.fechaInicio,
      fechaFin: nuevoCurso.fechaFin,
      horasLectivas: Number(nuevoCurso.horasLectivas || 0),
      idArchivo: hasArchivo ? 1 : 0,
      usuarioAccion,
    };

    try {
      const idHvCurso = await upsertHvCur(payload);
      if (!idHvCurso) {
        setSaveMessage('No se pudo guardar el curso.');
        setSaveMessageType('error');
        return;
      }

    if (documentoEliminado && (curso?.idHvCurso || curso?.id)) {
      const entityId = Number(curso?.idHvCurso || curso?.id || 0);
      const archivos = await fetchHvRefArchivo('HV_CUR', entityId);
      const actual = archivos.find((item) => item.tipoArchivo === 'HV_CUR_EVIDENCIA');
      if (actual?.idHvRefArchivo) {
        await deleteHvRefArchivo(actual.idHvRefArchivo, usuarioAccion);
      }
    }

      if (documentoFile) {
        const extension = documentoFile.name.split('.').pop() || '';
        const payloadArchivo = {
          idHvRefArchivo: 0,
          idHojaVida,
          entidad: 'HV_CUR',
        idEntidad: idHvCurso,
          tipoArchivo: 'HV_CUR_EVIDENCIA',
          nombreOrig: documentoFile.name,
          ext: extension,
          mime: documentoFile.type || 'application/octet-stream',
          sizeBytes: documentoFile.size,
          ruta: 'hv',
          usuarioAccion,
        };
        await saveHvRefArchivo(documentoFile, payloadArchivo);
      }

      setSaveMessage('Curso guardado correctamente.');
      setSaveMessageType('success');
      onGuardar();
    } catch (error) {
      setSaveMessage('No se pudo guardar el curso.');
      setSaveMessageType('error');
    } finally {
      messageTimeoutRef.current = window.setTimeout(() => {
        setSaveMessage(null);
        setSaveMessageType(null);
        messageTimeoutRef.current = null;
      }, 20000);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#04a25c' }}>
                {modo === 'crear' ? 'Registrar Curso o Especialización' : 'Editar Curso o Especialización'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {modo === 'crear'
                  ? 'Completa los datos de tu curso o especialización'
                  : 'Modifica los datos de tu curso o especialización'}
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
          {isNacional ? (
            <>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoInstitucion">
                    Tipo de institución <span className="text-red-500">*</span>
                  </Label>
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
                  <Label htmlFor="ruc">
                    RUC <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="ruc"
                      name="ruc"
                      type="text"
                      placeholder=""
                    maxLength={11}
                    value={rucValue}
                    onChange={(e) => {
                      setRucValue(e.target.value);
                      if (isRucLocked) {
                        setIsRucLocked(false);
                      }
                    }}
                  />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 whitespace-nowrap"
                      onClick={handleBuscarRuc}
                      disabled={isSearchingRuc}
                    >
                      <Search className="w-4 h-4" />
                      {isSearchingRuc ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institucion">
                    Institución <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institucion"
                    name="institucion"
                    type="text"
                    placeholder=""
                    value={institucionValue}
                    onChange={(e) => setInstitucionValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="distrito">
                  Ubigeo (Departamento / Provincia / Distrito) <span className="text-red-500">*</span>
                </Label>
            <Select
              name="distrito"
              value={distritoValue}
              onValueChange={(value) => {
                setDistritoValue(value);
                const selected = ubigeoOptions.find((item) => String(item.id) === value);
                if (selected) {
                  setUbigeoQuery(selected.descripcion);
                } else if (value) {
                  setUbigeoQuery(value);
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
                          id="ubigeoSearchCurso"
                          type="text"
                          placeholder="Escribe al menos 3 caracteres"
                          value={ubigeoQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            setUbigeoQuery(value);
                            if (distritoValue) {
                              setDistritoValue('');
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
                            const input = document.getElementById('ubigeoSearchCurso') as HTMLInputElement | null;
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
                  <>
                    {/^\d{6}$/.test(ubigeoQuery.trim()) ? (
                      <SelectItem value={ubigeoQuery.trim()}>
                        Usar codigo {ubigeoQuery.trim()}
                      </SelectItem>
                    ) : (
                      <SelectItem value="empty" disabled>
                        Sin resultados
                      </SelectItem>
                    )}
                  </>
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
          ) : (
            <div className="space-y-2">
              <Label htmlFor="tipoInstitucion">
                Tipo de institución <span className="text-red-500">*</span>
              </Label>
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
          )}

          {isInternacional && (
            <>
              <div className="space-y-2">
                <Label htmlFor="institucion">
                  Nombre de institución <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="institucion"
                  name="institucion"
                  type="text"
                  placeholder=""
                  value={institucionValue}
                  onChange={(e) => setInstitucionValue(e.target.value)}
                  readOnly={isRucLocked}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">
                  País <span className="text-red-500">*</span>
                </Label>
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
                          id="paisSearchCurso"
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
                          className="w-[75%]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-[25%]"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setPaisQuery('');
                            setPaisValue('');
                            const input = document.getElementById('paisSearchCurso') as HTMLInputElement | null;
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
            <Label htmlFor="tipoEstudio">
              Tipo de estudio <span className="text-red-500">*</span>
            </Label>
            <Select
              name="tipoEstudio"
              value={tipoEstudio || undefined}
              onValueChange={(value) => setTipoEstudio(value)}
            >
              <SelectTrigger id="tipoEstudio">
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {tipoEstudioOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descripcion"
              name="descripcion"
              type="text"
              placeholder=""
              defaultValue={curso?.descripcion || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">
              Fecha inicio (dd/mm/aaaa) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              lang="es-PE"
              defaultValue={curso?.fechaInicio || ''}
              max={todayIso}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">
              Fecha fin (dd/mm/aaaa) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fechaFin"
              name="fechaFin"
              type="date"
              lang="es-PE"
              defaultValue={curso?.fechaFin || ''}
              max={todayIso}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horasLectivas">
              Horas lectivas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="horasLectivas"
              name="horasLectivas"
              type="number"
              min={0}
              defaultValue={curso?.horasLectivas || ''}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="documento-curso">
              Documento de evidencia <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              <label
                htmlFor="documento-curso"
                className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {documentoPreview ? 'Cambiar documento' : 'Seleccionar documento'}
                </span>
              </label>
              <input
                id="documento-curso"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleDocumentoChange}
              />

              {documentoPreview && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Documento adjuntado correctamente</p>
                    <p className="text-xs text-green-700">Click en "Ver" para visualizar el archivo</p>
                  </div>
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
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 md:flex-row md:items-center md:justify-end">
          {saveMessage && (
            <p
              className={`text-sm ${
                saveMessageType === 'error' ? 'text-red-700' : saveMessageType === 'success' ? 'text-green-800' : 'text-gray-600'
              }`}
            >
              {saveMessage}
            </p>
          )}
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
