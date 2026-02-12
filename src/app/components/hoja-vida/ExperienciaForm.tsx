import { Upload, Eye, X, Save, Search } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useEffect, useRef, useState } from 'react';
import {
  fetchMotivoCeseDropdown,
  fetchTipoEntidadDropdown,
  fetchTipoExperienciaDropdown,
  fetchUbigeoDistritoList,
  type DropdownItem,
} from '../../api/catalogos';
import { upsertHvExp } from '../../api/hojaVida';
import { deleteHvRefArchivo, fetchHvRefArchivo, saveHvRefArchivo } from '../../api/hvRefArchivo';
import { pedirRUC } from '../../api/pide';

interface Experiencia {
  id?: string;
  tipoExperiencia: string;
  tipoExperienciaId?: string;
  tipoEntidad: string;
  tipoEntidadId?: string;
  nombreEntidad: string;
  ruc?: string;
  distritoId?: string;
  distritoDescripcion?: string;
  area: string;
  cargo: string;
  funcionesPrincipales: string;
  motivoCese: string;
  motivoCeseId?: string;
  fechaInicio: string;
  fechaFin: string;
  certificadoPreview: string | null;
  experienciaEspecifica?: boolean;
}

interface ExperienciaFormProps {
  modo: 'crear' | 'editar';
  experiencia: Experiencia | null;
  idHojaVida: number;
  usuarioAccion: number;
  rucPersona?: string;
  onGuardar: () => void;
  onCancelar: () => void;
}

export function ExperienciaForm({
  modo,
  experiencia,
  idHojaVida,
  usuarioAccion,
  rucPersona,
  onGuardar,
  onCancelar,
}: ExperienciaFormProps) {
  const [tipoExperiencia, setTipoExperiencia] = useState<string>(experiencia?.tipoExperienciaId || '');
  const [tipoEntidad, setTipoEntidad] = useState<string>(experiencia?.tipoEntidadId || '');
  const [motivoCese, setMotivoCese] = useState(experiencia?.motivoCeseId || '');
  const [nombreEntidadValue, setNombreEntidadValue] = useState<string>(experiencia?.nombreEntidad || '');
  const [rucValue, setRucValue] = useState<string>(rucPersona || experiencia?.ruc || '');
  const [experienciaEspecifica, setExperienciaEspecifica] = useState<boolean>(
    Boolean(experiencia?.experienciaEspecifica),
  );
  const [isSearchingRuc, setIsSearchingRuc] = useState(false);
  const [fechaInicioValue, setFechaInicioValue] = useState(experiencia?.fechaInicio || '');
  const [fechaFinValue, setFechaFinValue] = useState(experiencia?.fechaFin || '');
  const [distritoValue, setDistritoValue] = useState<string>(experiencia?.distritoId || '');
  const [ubigeoQuery, setUbigeoQuery] = useState<string>(experiencia?.distritoDescripcion || '');
  const [ubigeoOptions, setUbigeoOptions] = useState<DropdownItem[]>([]);
  const [isUbigeoLoading, setIsUbigeoLoading] = useState(false);
  const [pendingUbigeoId, setPendingUbigeoId] = useState('');
  const [tipoExperienciaOptions, setTipoExperienciaOptions] = useState<DropdownItem[]>([]);
  const [tipoEntidadOptions, setTipoEntidadOptions] = useState<DropdownItem[]>([]);
  const [motivoCeseOptions, setMotivoCeseOptions] = useState<DropdownItem[]>([]);
  const [certificadoPreview, setDocumentoPreview] = useState<string | null>(
    experiencia?.certificadoPreview || null,
  );
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [documentoEliminado, setDocumentoEliminado] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error' | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);

  const revokePreviewUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const resolveDropdownValue = (raw: string, options: DropdownItem[]) => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return '';
    const byId = options.find((item) => String(item.id) === raw);
    if (byId) return String(byId.id);
    const byDesc = options.find((item) => item.descripcion.toLowerCase() === normalized);
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
  const motivoCeseDescripcion = motivoCeseOptions.find(
    (item) => String(item.id) === motivoCese,
  )?.descripcion?.toLowerCase() || '';
  const isActualidad = motivoCeseDescripcion.includes('actualidad');
  const todayIso = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let isActive = true;
    const loadDropdowns = async () => {
      try {
        const [tiposExp, tiposEnt, motivos] = await Promise.all([
          fetchTipoExperienciaDropdown(),
          fetchTipoEntidadDropdown(),
          fetchMotivoCeseDropdown(),
        ]);
        if (isActive) {
          setTipoExperienciaOptions(tiposExp);
          setTipoEntidadOptions(tiposEnt);
          setMotivoCeseOptions(motivos);
        }
      } catch (error) {
        if (isActive) {
          setTipoExperienciaOptions([]);
          setTipoEntidadOptions([]);
          setMotivoCeseOptions([]);
        }
      }
    };
    loadDropdowns();
    return () => {
      isActive = false;
    };
  }, []);

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
      setTipoExperiencia('');
      setTipoEntidad('');
      setMotivoCese('');
      setNombreEntidadValue('');
      setRucValue('');
      setExperienciaEspecifica(false);
      setDistritoValue('');
      setUbigeoQuery('');
      setPendingUbigeoId('');
      setDocumentoPreview(null);
      setCertificadoFile(null);
      setDocumentoEliminado(false);
      setSaveMessage(null);
      setSaveMessageType(null);
      setFechaInicioValue('');
      setFechaFinValue('');
      if (rucPersona) {
        setRucValue(rucPersona);
      }
      return;
    }

    setTipoExperiencia(
      resolveDropdownValue(experiencia?.tipoExperienciaId || experiencia?.tipoExperiencia || '', tipoExperienciaOptions),
    );
    setTipoEntidad(
      resolveDropdownValue(experiencia?.tipoEntidadId || experiencia?.tipoEntidad || '', tipoEntidadOptions),
    );
    setMotivoCese(
      resolveDropdownValue(experiencia?.motivoCeseId || experiencia?.motivoCese || '', motivoCeseOptions),
    );
    setNombreEntidadValue(experiencia?.nombreEntidad || '');
    setRucValue(rucPersona || experiencia?.ruc || '');
    setExperienciaEspecifica(Boolean(experiencia?.experienciaEspecifica));
    const distritoId = String(experiencia?.distritoId || '');
    const distritoDesc = experiencia?.distritoDescripcion || '';
    setDistritoValue('');
    setPendingUbigeoId(distritoId);
    setUbigeoQuery(distritoDesc.length >= 3 ? distritoDesc : '');
    setDocumentoPreview(experiencia?.certificadoPreview || null);
    setCertificadoFile(null);
    setDocumentoEliminado(false);
    setSaveMessage(null);
    setSaveMessageType(null);
    setFechaInicioValue(experiencia?.fechaInicio || '');
    setFechaFinValue(experiencia?.fechaFin || '');
  }, [modo, experiencia, tipoExperienciaOptions, tipoEntidadOptions, motivoCeseOptions, rucPersona]);

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      revokePreviewUrl(certificadoPreview);
      setCertificadoFile(file);
      setDocumentoEliminado(false);
      setDocumentoPreview(URL.createObjectURL(file));
    }
  };

  const removeDocumento = () => {
    revokePreviewUrl(certificadoPreview);
    setDocumentoPreview(null);
    setCertificadoFile(null);
    setDocumentoEliminado(Boolean(experiencia?.certificadoPreview));
    const fileInput = document.getElementById('certificado-experiencia') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const buscarRuc = async (value: string) => {
    setSaveMessage(null);
    setSaveMessageType(null);
    if (!value.trim()) {
      setSaveMessage('Ingrese el número de RUC.');
      setSaveMessageType('error');
      return;
    }
    try {
      setIsSearchingRuc(true);
      const data = await pedirRUC(value.trim());
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
      setNombreEntidadValue(razon);
    } catch (error) {
      setSaveMessage('No se pudo consultar el RUC. Intente nuevamente.');
      setSaveMessageType('error');
    } finally {
      setIsSearchingRuc(false);
    }
  };

  const handleBuscarRuc = async () => {
    await buscarRuc(rucValue.trim());
  };

  useEffect(() => {
    if (!rucPersona) return;
    const normalized = rucPersona.trim();
    if (!normalized) return;
    setRucValue(normalized);
    if (!nombreEntidadValue) {
      buscarRuc(normalized);
    }
  }, [rucPersona, nombreEntidadValue]);

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
    const hasArchivo = !documentoEliminado && Boolean(certificadoFile || certificadoPreview);
    const missingFields: string[] = [];
    if (!tipoExperiencia) missingFields.push('Tipo de experiencia');
    if (!tipoEntidad) missingFields.push('Tipo de entidad');
    if (!rucValue.trim()) missingFields.push('RUC');
    if (!nombreEntidadValue.trim()) missingFields.push('Nombre de la entidad');
    if (!distritoValue) missingFields.push('Ubigeo');
    const formData = new FormData(e.target as HTMLFormElement);
    const areaValue = String(formData.get('area') || '').trim();
    const cargoValue = String(formData.get('cargo') || '').trim();
    const funcionesValue = String(formData.get('funcionesPrincipales') || '').trim();
    if (!areaValue) missingFields.push('Área');
    if (!cargoValue) missingFields.push('Cargo');
    if (!funcionesValue) missingFields.push('Funciones principales');
    if (!motivoCese) missingFields.push('Motivo de cese');
    if (!fechaInicioValue) missingFields.push('Fecha inicio');
    if (!isActualidad && !fechaFinValue) missingFields.push('Fecha fin');
    if (!hasArchivo) missingFields.push('Certificado de trabajo');

    if (missingFields.length > 0) {
      setSaveMessage(`Complete los campos obligatorios: ${missingFields.join(', ')}.`);
      setSaveMessageType('error');
      return;
    }
    const nuevaExperiencia: Omit<Experiencia, 'id'> = {
      tipoExperiencia: tipoExperiencia,
      tipoEntidad: tipoEntidad,
      nombreEntidad: nombreEntidadValue,
      ruc: rucValue.trim(),
      distritoId: distritoValue,
      distritoDescripcion: ubigeoQuery,
      area: areaValue,
      cargo: cargoValue,
      funcionesPrincipales: funcionesValue,
      motivoCese: motivoCese,
      fechaInicio: fechaInicioValue,
      fechaFin: isActualidad ? '' : fechaFinValue,
      certificadoPreview: certificadoPreview,
      experienciaEspecifica: experienciaEspecifica,
    };

    if (!isActualidad && nuevaExperiencia.fechaInicio && nuevaExperiencia.fechaFin) {
      const start = new Date(nuevaExperiencia.fechaInicio);
      const end = new Date(nuevaExperiencia.fechaFin);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        setSaveMessage('La fecha fin debe ser mayor a la fecha inicio.');
        setSaveMessageType('error');
        return;
      }
    }

    if (nuevaExperiencia.fechaInicio) {
      const start = new Date(nuevaExperiencia.fechaInicio);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!Number.isNaN(start.getTime()) && start > today) {
        setSaveMessage('La fecha inicio no puede ser mayor a la fecha actual.');
        setSaveMessageType('error');
        return;
      }
    }

    const payload = {
      idHvExperiencia: Number(experiencia?.idHvExperiencia || experiencia?.id || 0),
      idHojaVida,
      tipoExperiencia,
      tipoEntidad,
      nombreEntidad: nuevaExperiencia.nombreEntidad,
      idUbigeo: Number(distritoValue || 0),
      area: nuevaExperiencia.area,
      cargo: nuevaExperiencia.cargo,
      funcionesPrincipales: nuevaExperiencia.funcionesPrincipales,
      motivoCese,
      fechaInicio: nuevaExperiencia.fechaInicio,
      fechaFin: nuevaExperiencia.fechaFin,
      idArchivo: hasArchivo ? 1 : 0,
      experienciaEspecifica: experienciaEspecifica ? 1 : 0,
      usuarioAccion,
    };

    try {
      const idHvExperiencia = await upsertHvExp(payload);
      if (!idHvExperiencia) {
        setSaveMessage('No se pudo guardar la experiencia.');
        setSaveMessageType('error');
        return;
      }

      if (documentoEliminado && (experiencia?.idHvExperiencia || experiencia?.id)) {
        const entityId = Number(experiencia?.idHvExperiencia || experiencia?.id || 0);
        const archivos = await fetchHvRefArchivo('HV_EXP', entityId);
        const actual = archivos.find((item) => item.tipoArchivo === 'HV_EXP');
        if (actual?.idHvRefArchivo) {
          await deleteHvRefArchivo(actual.idHvRefArchivo, usuarioAccion);
        }
      }

      if (certificadoFile) {
        const extension = certificadoFile.name.split('.').pop() || '';
        const payloadArchivo = {
          idHvRefArchivo: 0,
          idHojaVida,
          entidad: 'HV_EXP',
          idEntidad: idHvExperiencia,
          tipoArchivo: 'HV_EXP',
          nombreOrig: certificadoFile.name,
          ext: extension,
          mime: certificadoFile.type || 'application/octet-stream',
          sizeBytes: certificadoFile.size,
          ruta: 'hv',
          usuarioAccion,
        };
        await saveHvRefArchivo(certificadoFile, payloadArchivo);
      }

      setSaveMessage('Experiencia guardada correctamente.');
      setSaveMessageType('success');
      onGuardar();
    } catch (error) {
      setSaveMessage('No se pudo guardar la experiencia.');
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
                {modo === 'crear' ? 'Registrar Experiencia Profesional' : 'Editar Experiencia Profesional'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {modo === 'crear' ? 'Completa los datos de tu experiencia profesional' : 'Modifica los datos de tu experiencia profesional'}
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
          {/* Tipo de experiencia */}
          <div className="space-y-2">
            <Label htmlFor="tipoExperiencia">
              Tipo de experiencia <span className="text-red-500">*</span>
            </Label>
            <Select
              name="tipoExperiencia"
              value={tipoExperiencia || undefined}
              onValueChange={(value) => setTipoExperiencia(value)}
            >
              <SelectTrigger id="tipoExperiencia">
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {tipoExperienciaOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Entidad */}
          <div className="space-y-2">
            <Label htmlFor="tipoEntidad">
              Tipo de Entidad <span className="text-red-500">*</span>
            </Label>
            <Select
              name="tipoEntidad"
              value={tipoEntidad || undefined}
              onValueChange={(value) => setTipoEntidad(value)}
            >
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

          {/* Nombre de la entidad */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rucExperiencia">
              RUC <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="rucExperiencia"
                name="rucExperiencia"
                type="text"
                placeholder=""
                maxLength={11}
                value={rucValue}
                onChange={(e) => setRucValue(e.target.value)}
                readOnly={Boolean(rucPersona)}
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombreEntidad">
              Nombre de la entidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreEntidad"
              name="nombreEntidad"
              type="text"
              value={nombreEntidadValue}
              onChange={(e) => setNombreEntidadValue(e.target.value)}
              placeholder=""
            />
          </div>

          {/* Ubigeo */}
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
                      id="ubigeoSearchExperiencia"
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
                        const input = document.getElementById('ubigeoSearchExperiencia') as HTMLInputElement | null;
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

          {/* Área */}
          <div className="space-y-2">
            <Label htmlFor="area">
              Área <span className="text-red-500">*</span>
            </Label>
            <Input
              id="area"
              name="area"
              type="text"
              defaultValue={experiencia?.area || ''}
              placeholder=""
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cargo">
              Cargo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cargo"
              name="cargo"
              type="text"
              defaultValue={experiencia?.cargo || ''}
              placeholder=""
            />
          </div>

          {/* Funciones principales */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="funcionesPrincipales">
              Funciones principales <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="funcionesPrincipales"
              name="funcionesPrincipales"
              defaultValue={experiencia?.funcionesPrincipales || ''}
              placeholder=""
              rows={4}
              maxLength={256}
            />
            <p className="text-xs text-gray-500">Ingrese una breve descripción no mayor a 256 caracteres</p>
          </div>

          {/* Motivo de cese */}
          <div className="space-y-2">
            <Label htmlFor="motivoCese">
              Motivo de cese <span className="text-red-500">*</span>
            </Label>
            <Select
              name="motivoCese"
              value={motivoCese || undefined}
              onValueChange={(value) => setMotivoCese(value)}
            >
              <SelectTrigger id="motivoCese">
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {motivoCeseOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha inicio */}
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">
              Fecha inicio <span className="text-red-500">*</span>
            </Label>
          <Input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              lang="es-PE"
              value={fechaInicioValue}
              onChange={(e) => setFechaInicioValue(e.target.value)}
              max={todayIso}
            />
          </div>

          {/* Fecha fin - Solo si NO es "Hasta la actualidad" */}
          {!isActualidad && (
            <div className="space-y-2">
              <Label htmlFor="fechaFin">
                Fecha fin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fechaFin"
                name="fechaFin"
                type="date"
                lang="es-PE"
                value={fechaFinValue}
                onChange={(e) => setFechaFinValue(e.target.value)}
                min={fechaInicioValue || undefined}
              />
            </div>
          )}

          <div className="flex items-center gap-2 md:col-span-2">
            <Checkbox
              id="experienciaEspecifica"
              checked={experienciaEspecifica}
              onCheckedChange={(checked) => setExperienciaEspecifica(Boolean(checked))}
            />
            <Label htmlFor="experienciaEspecifica" className="text-sm">
              Esta experiencia también cuenta como experiencia específica
            </Label>
          </div>

          {/* Certificado de trabajo */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="certificado-experiencia">
              Certificado de trabajo <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              <label
                htmlFor="certificado-experiencia"
                className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {certificadoPreview ? 'Cambiar documento' : 'Seleccionar documento'}
                </span>
              </label>
              <input
                id="certificado-experiencia"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleDocumentoChange}
              />
              <p className="text-xs text-gray-500">Elija un documento de extensión PDF y de tamaño menor a 100 MB</p>

              {certificadoPreview && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Certificado adjuntado correctamente</p>
                    <p className="text-xs text-green-700">Click en "Ver" para visualizar el archivo</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(certificadoPreview || '', '_blank')}
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

          {/* Botones de acción */}
          <div className="md:col-span-2 flex flex-col gap-3 pt-4 border-t md:flex-row md:items-center md:justify-end">
            {saveMessage && (
              <p
                className={`text-sm ${
                  saveMessageType === 'error' ? 'text-red-700' : saveMessageType === 'success' ? 'text-green-800' : 'text-gray-600'
                }`}
              >
                {saveMessage}
              </p>
            )}
            <Button type="button" variant="outline" className="gap-2" onClick={onCancelar}>
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" />
              Grabar
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
