import { User, Calendar, Phone, Mail, Upload, CreditCard, X, Eye, Save } from 'lucide-react';

import { Card } from '../ui/card';

import { Input } from '../ui/input';

import { Label } from '../ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '../ui/button';

import {

  fetchEstadoCivilDropdown,

  fetchSexoDropdown,

  fetchTipoDocDropdown,

  fetchUbigeoDistritoList,

  type DropdownItem,

} from '../../api/catalogos';

import { fetchHojaVidaActual, fetchHojaVidaDatos, upsertHojaVidaDatos } from '../../api/hojaVida';

import type { LoginResponse } from '../../api/auth';

import {

  deleteHvRefArchivo,

  fetchHvRefArchivo,

  saveHvRefArchivo,

} from '../../api/hvRefArchivo';



interface DatosPersonalesProps {

  user: LoginResponse | null;

}



type DatosPersonalesForm = {

  tipoDocumento: string;

  numeroDocumento: string;

  nombres: string;

  apellidoPaterno: string;

  apellidoMaterno: string;

  sexo: string;

  estadoCivil: string;

  fechaNacimiento: string;

  nacionalidad: string;

  telefonoCelular: string;

  correo: string;
  correoSecundario: string;

  ruc: string;

  cuentaBn: string;

  cciBn: string;

  direccion: string;

  referencia: string;

  distrito: string;

};



const emptyForm: DatosPersonalesForm = {

  tipoDocumento: '',

  numeroDocumento: '',

  nombres: '',

  apellidoPaterno: '',

  apellidoMaterno: '',

  sexo: '',

  estadoCivil: '',

  fechaNacimiento: '',

  nacionalidad: '',

  telefonoCelular: '',

  correo: '',
  correoSecundario: '',

  ruc: '',

  cuentaBn: '',

  cciBn: '',

  direccion: '',

  referencia: '',

  distrito: '',

};



export function DatosPersonales({ user }: DatosPersonalesProps) {

  const [tipoDocumentoOptions, setTipoDocumentoOptions] = useState<DropdownItem[]>([]);

  const [sexoOptions, setSexoOptions] = useState<DropdownItem[]>([]);

  const [estadoCivilOptions, setEstadoCivilOptions] = useState<DropdownItem[]>([]);

  const [ubigeoQuery, setUbigeoQuery] = useState('');

  const [ubigeoOptions, setUbigeoOptions] = useState<DropdownItem[]>([]);

  const [isUbigeoLoading, setIsUbigeoLoading] = useState(false);

  const [pendingUbigeoId, setPendingUbigeoId] = useState('');

  const [formData, setFormData] = useState<DatosPersonalesForm>(emptyForm);

  const [isLoading, setIsLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error' | null>(null);

  const [hojaVidaId, setHojaVidaId] = useState<number>(0);

  const [hvDatosId, setHvDatosId] = useState<number>(0);

  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);

  const [voucherFile, setVoucherFile] = useState<File | null>(null);

  const [voucherRefId, setVoucherRefId] = useState<number>(0);

  const [voucherFileUrl, setVoucherFileUrl] = useState<string | null>(null);

  const [voucherMime, setVoucherMime] = useState<string | null>(null);

  const [voucherDeleted, setVoucherDeleted] = useState(false);

  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [rnpPreview, setRnpPreview] = useState<string | null>(null);
  const [rnpFile, setRnpFile] = useState<File | null>(null);
  const [rnpRefId, setRnpRefId] = useState<number>(0);
  const [rnpFileUrl, setRnpFileUrl] = useState<string | null>(null);
  const [rnpMime, setRnpMime] = useState<string | null>(null);
  const [rnpDeleted, setRnpDeleted] = useState(false);
  const [showRnpModal, setShowRnpModal] = useState(false);

  const [seguroSaludPreview, setSeguroSaludPreview] = useState<string | null>(null);

  const [seguroSaludFile, setSeguroSaludFile] = useState<File | null>(null);

  const [seguroRefId, setSeguroRefId] = useState<number>(0);

  const [seguroFileUrl, setSeguroFileUrl] = useState<string | null>(null);

  const [seguroMime, setSeguroMime] = useState<string | null>(null);

  const [seguroDeleted, setSeguroDeleted] = useState(false);

  const [showSeguroSaludModal, setShowSeguroSaludModal] = useState(false);

  const [sctrPreview, setSctrPreview] = useState<string | null>(null);

  const [sctrFile, setSctrFile] = useState<File | null>(null);

  const [sctrRefId, setSctrRefId] = useState<number>(0);

  const [sctrFileUrl, setSctrFileUrl] = useState<string | null>(null);

  const [sctrMime, setSctrMime] = useState<string | null>(null);

  const [sctrDeleted, setSctrDeleted] = useState(false);

  const [showSctrModal, setShowSctrModal] = useState(false);

  const revokePreviewUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };



  const authDefaults = useMemo<DatosPersonalesForm>(() => {

    if (!user) return emptyForm;

    return {

      ...emptyForm,

      tipoDocumento: user.tipoDocumento || '',

      numeroDocumento: user.numeroDocumento || '',

      nombres: user.nombres || '',

      apellidoPaterno: user.apellidoPaterno || '',

      apellidoMaterno: user.apellidoMaterno || '',

      correo: user.email || '',

      ruc: user.ruc || '',

    };

  }, [user]);



  useEffect(() => {

    let isActive = true;



    const loadDropdowns = async () => {

      try {

        const [tipoDocs, sexos, estados] = await Promise.all([

          fetchTipoDocDropdown(),

          fetchSexoDropdown(),

          fetchEstadoCivilDropdown(),

        ]);



        if (isActive) {

          setTipoDocumentoOptions(tipoDocs);

          setSexoOptions(sexos);

          setEstadoCivilOptions(estados);

        }

      } catch (error) {

        console.error('Error loading dropdowns', error);

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

        setUbigeoOptions([]);

        return;

      }

      setIsUbigeoLoading(true);

      try {

        const items = await fetchUbigeoDistritoList(ubigeoQuery.trim());

        if (isActive) {

          setUbigeoOptions(items);

        }

      } catch (error) {

        console.error('Error loading ubigeo', error);

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

      updateField('distrito', String(selected.id));

      setUbigeoQuery(selected.descripcion);

      setPendingUbigeoId('');

    }

  }, [pendingUbigeoId, ubigeoOptions]);



  useEffect(() => {

    let isActive = true;

    const loadArchivos = async () => {

      if (!hvDatosId) return;

      try {

        const items = await fetchHvRefArchivo('HV_DATOS_PERSONALES', hvDatosId);

        if (!isActive) return;

        const voucher = items.find((i) => i.tipoArchivo === 'HV_VOUCHER_BN');

        const rnp = items.find((i) => i.tipoArchivo === 'HV_RNP_CONSTANCIA');

        const seguro = items.find((i) => i.tipoArchivo === 'HV_SEGURO_SALUD');

        const sctr = items.find((i) => i.tipoArchivo === 'HV_SCTR');

        setVoucherRefId(voucher?.idHvRefArchivo || 0);

        setRnpRefId(rnp?.idHvRefArchivo || 0);

        setSeguroRefId(seguro?.idHvRefArchivo || 0);

        setSctrRefId(sctr?.idHvRefArchivo || 0);

        setVoucherFileUrl(voucher ? buildFileUrl(voucher.guid) : null);

        setRnpFileUrl(rnp ? buildFileUrl(rnp.guid) : null);

        setSeguroFileUrl(seguro ? buildFileUrl(seguro.guid) : null);

        setSctrFileUrl(sctr ? buildFileUrl(sctr.guid) : null);

        setVoucherMime(
          resolveMime(voucher?.mime, voucher?.nombreOriginal || voucher?.nombreOrig, voucher?.extension || voucher?.ext) || null,
        );

        setRnpMime(resolveMime(rnp?.mime, rnp?.nombreOriginal || rnp?.nombreOrig, rnp?.extension || rnp?.ext) || null);

        setSeguroMime(
          resolveMime(seguro?.mime, seguro?.nombreOriginal || seguro?.nombreOrig, seguro?.extension || seguro?.ext) || null,
        );

        setSctrMime(resolveMime(sctr?.mime, sctr?.nombreOriginal || sctr?.nombreOrig, sctr?.extension || sctr?.ext) || null);

      } catch (error) {

        console.error('Error loading archivos', error);

      }

    };

    loadArchivos();

    return () => {

      isActive = false;

    };

  }, [hvDatosId]);



  useEffect(() => {

    let isActive = true;



    const loadDatos = async () => {

      if (!user?.idPersona || !user?.idUsuario) {

        setFormData(authDefaults);

        return;

      }

      setIsLoading(true);

      try {

        const hojaVida = await fetchHojaVidaActual(user.idPersona, user.idUsuario);

        if (!isActive) return;

        if (!hojaVida?.idHojaVida) {

          setHojaVidaId(0);

          setFormData(authDefaults);

          return;

        }

        setHojaVidaId(hojaVida.idHojaVida);

        const datos = await fetchHojaVidaDatos(hojaVida.idHojaVida);

        if (!isActive) return;

        if (!datos) {

          setFormData(authDefaults);

          return;

        }

        setFormData((prev) => ({

          ...prev,

          ...datos,

          tipoDocumento: String(datos.tipoDocumentoId ?? datos.tipoDocumento ?? ''),

          sexo: String(datos.sexoId ?? datos.sexo ?? ''),

          estadoCivil: String(datos.estadoCivilId ?? datos.estadoCivil ?? ''),

          fechaNacimiento: normalizeFechaFromApi(datos.fechaNacimiento),

        }));

        setHvDatosId(datos.idHvDatos ? Number(datos.idHvDatos) : 0);

        const distritoValue = String(datos.distritoId || '');

        const distritoText = String(datos.distrito || '');

        setPendingUbigeoId(distritoValue);

        setUbigeoQuery(distritoText.length >= 3 ? distritoText : '');

      } catch (error) {

        console.error('Error loading hoja de vida', error);

        if (isActive) {

          setFormData(authDefaults);

        }

      } finally {

        if (isActive) {

          setIsLoading(false);

        }

      }

    };



    loadDatos();

    return () => {

      isActive = false;

    };

  }, [authDefaults, user?.idPersona]);



  const updateField = (field: keyof DatosPersonalesForm, value: string) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

  };



  const normalizeFechaFromApi = (value: string) => {

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

      return value;

    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {

      const [day, month, year] = value.split('/');

      return `${year}-${month}-${day}`;

    }

    return value;

  };



  const toApiFecha = (value: string) => {

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {

      const [day, month, year] = value.split('/');

      return `${year}-${month}-${day}`;

    }

    return value;

  };



  const getFileExt = (file: File) => {

    const parts = file.name.split('.');

    return parts.length > 1 ? parts.pop() || '' : '';

  };

  const getExtFromName = (value?: string | null) => {
    if (!value) return '';
    const parts = value.split('.');
    return (parts.length > 1 ? parts.pop() : parts[0])?.toLowerCase() || '';
  };

  const resolveMime = (
    mime?: string | null,
    nombreOriginal?: string | null,
    extension?: string | null,
  ) => {
    const normalized = mime?.toLowerCase() || '';
    if (normalized.includes('pdf')) return mime || 'application/pdf';
    const ext = getExtFromName(extension) || getExtFromName(nombreOriginal);
    if (ext === 'pdf') return 'application/pdf';
    return mime || '';
  };



  const apiBaseUrl =

    (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||

    'http://localhost:8087/sirpo/v1';



  const buildFileUrl = (guid: string) => {
    const params = new URLSearchParams({ guid });
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`;
  };



  const openFile = (

    url: string | null,

    mime: string | null,

    type: 'voucher' | 'seguro' | 'sctr' | 'rnp',

  ) => {

    if (!url) return;

    if (mime && mime.toLowerCase().includes('pdf')) {

      window.open(url, '_blank', 'noopener,noreferrer');

      return;

    }

    if (type === 'seguro') {

      setSeguroSaludPreview(url);

      setShowSeguroSaludModal(true);

      return;

    }

    if (type === 'sctr') {

      setSctrPreview(url);

      setShowSctrModal(true);

      return;

    }
    if (type === 'rnp') {

      setRnpPreview(url);

      setShowRnpModal(true);

      return;

    }

    setVoucherPreview(url);

    setShowVoucherModal(true);

  };



  const upsertArchivo = async (

    file: File,

    tipoArchivo: string,

    refId: number,

    idEntidad: number,

  ) => {

    const payload = {

      idHvRefArchivo: refId || 0,

      idHojaVida: hojaVidaId || 0,

      entidad: 'HV_DATOS_PERSONALES',

      idEntidad,

      tipoArchivo,

      guid: '',

      nombreOrig: file.name,

      ext: getFileExt(file),

      mime: file.type,

      sizeBytes: file.size,

      ruta: '',

      usuarioAccion: user?.idUsuario || 0,

    };

    await saveHvRefArchivo(file, payload);

  };



  const deleteArchivo = async (refId: number) => {

    if (!user?.idUsuario) return;

    await deleteHvRefArchivo(refId, user.idUsuario);

  };



  const handleSave = async () => {

    if (!user?.idUsuario) {

      setSaveMessage('No se encontró el usuario autenticado.');

      return;

    }

    setIsSaving(true);

    setSaveMessage('Guardando...');

    setSaveMessageType(null);

    try {

      const isUpdate = hvDatosId > 0;

      const payload = {

        idHvDatos: hvDatosId || 0,

        idHojaVida: hojaVidaId || 0,

        tipoDocumento: formData.tipoDocumento,

        numeroDocumento: formData.numeroDocumento,

        nombres: formData.nombres,

        apellidoPaterno: formData.apellidoPaterno,

        apellidoMaterno: formData.apellidoMaterno,

        sexo: formData.sexo,

        estadoCivil: formData.estadoCivil,

        fechaNacimiento: toApiFecha(formData.fechaNacimiento),

        nacionalidad: formData.nacionalidad,

        telefonoCelular: formData.telefonoCelular,

        correo: formData.correo,
        correoSecundario: formData.correoSecundario,

        ruc: formData.ruc,

        cuentaBn: formData.cuentaBn,

        cciBn: formData.cciBn,

        direccion: formData.direccion,

        referencia: formData.referencia,

        idUbigeo: Number(formData.distrito) || 0,

        usuarioAccion: user.idUsuario,

      };

      const upsertedId = await upsertHojaVidaDatos(payload);

      if (upsertedId) {

        const currentHvDatosId = upsertedId || hvDatosId || 0;

        if (!hvDatosId && currentHvDatosId) {
          setHvDatosId(currentHvDatosId);
        }



        if (currentHvDatosId) {

          if (voucherFile) {

            await upsertArchivo(voucherFile, 'HV_VOUCHER_BN', voucherRefId, currentHvDatosId);

            setVoucherDeleted(false);

          } else if (voucherDeleted && voucherRefId) {

            await deleteArchivo(voucherRefId);

            setVoucherDeleted(false);

          }

          if (rnpFile) {
            await upsertArchivo(rnpFile, 'HV_RNP_CONSTANCIA', rnpRefId, currentHvDatosId);
            setRnpDeleted(false);
          } else if (rnpDeleted && rnpRefId) {
            await deleteArchivo(rnpRefId);
            setRnpDeleted(false);
          }



          if (seguroSaludFile) {

            await upsertArchivo(seguroSaludFile, 'HV_SEGURO_SALUD', seguroRefId, currentHvDatosId);

            setSeguroDeleted(false);

          } else if (seguroDeleted && seguroRefId) {

            await deleteArchivo(seguroRefId);

            setSeguroDeleted(false);

          }



          if (sctrFile) {

            await upsertArchivo(sctrFile, 'HV_SCTR', sctrRefId, currentHvDatosId);

            setSctrDeleted(false);

          } else if (sctrDeleted && sctrRefId) {

            await deleteArchivo(sctrRefId);

            setSctrDeleted(false);

          }

        }



        setSaveMessage(isUpdate ? 'Datos personales actualizados.' : 'Datos personales registrados.');

        setSaveMessageType('success');

      } else {

        setSaveMessage('No se pudo guardar.');

        setSaveMessageType('error');

      }

    } catch (error) {

      console.error('Error al guardar datos personales', error);

      setSaveMessage('Error al guardar. Intente nuevamente.');

      setSaveMessageType('error');

    } finally {

      setIsSaving(false);

    }

  };



  useEffect(() => {

    if (!saveMessage) return;

    const timeoutId = window.setTimeout(() => {

      setSaveMessage(null);

      setSaveMessageType(null);

    }, 20000);

    return () => window.clearTimeout(timeoutId);

  }, [saveMessage]);



  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {

      setVoucherFile(file);

      setVoucherDeleted(false);

      setVoucherMime(resolveMime(file.type, file.name, getFileExt(file)) || null);

      revokePreviewUrl(voucherPreview);
      setVoucherPreview(URL.createObjectURL(file));

    }

  };



  const removeVoucher = () => {

    revokePreviewUrl(voucherPreview);
    setVoucherPreview(null);

    setVoucherFile(null);

    setVoucherFileUrl(null);

    setVoucherMime(null);

    if (voucherRefId) {

      setVoucherDeleted(true);

    }

    const fileInput = document.getElementById('voucher') as HTMLInputElement;

    if (fileInput) {

      fileInput.value = '';

    }

  };


  const handleRnpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRnpFile(file);
      setRnpDeleted(false);
      setRnpMime(resolveMime(file.type, file.name, getFileExt(file)) || null);
      revokePreviewUrl(rnpPreview);
      setRnpPreview(URL.createObjectURL(file));
    }
  };

  const removeRnp = () => {
    revokePreviewUrl(rnpPreview);
    setRnpPreview(null);
    setRnpFile(null);
    setRnpFileUrl(null);
    setRnpMime(null);
    if (rnpRefId) {
      setRnpDeleted(true);
    }
    const fileInput = document.getElementById('rnpConstancia') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };


  const handleSeguroSaludChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {

      setSeguroSaludFile(file);

      setSeguroDeleted(false);

      setSeguroMime(resolveMime(file.type, file.name, getFileExt(file)) || null);

      revokePreviewUrl(seguroSaludPreview);
      setSeguroSaludPreview(URL.createObjectURL(file));

    }

  };



  const removeSeguroSalud = () => {

    revokePreviewUrl(seguroSaludPreview);
    setSeguroSaludPreview(null);

    setSeguroSaludFile(null);

    setSeguroFileUrl(null);

    setSeguroMime(null);

    if (seguroRefId) {

      setSeguroDeleted(true);

    }

    const fileInput = document.getElementById('seguroSalud') as HTMLInputElement;

    if (fileInput) {

      fileInput.value = '';

    }

  };



  const handleSctrChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {

      setSctrFile(file);

      setSctrDeleted(false);

      setSctrMime(resolveMime(file.type, file.name, getFileExt(file)) || null);

      revokePreviewUrl(sctrPreview);
      setSctrPreview(URL.createObjectURL(file));

    }

  };



  const removeSctr = () => {

    revokePreviewUrl(sctrPreview);
    setSctrPreview(null);

    setSctrFile(null);

    setSctrFileUrl(null);

    setSctrMime(null);

    if (sctrRefId) {

      setSctrDeleted(true);

    }

    const fileInput = document.getElementById('sctr') as HTMLInputElement;

    if (fileInput) {

      fileInput.value = '';

    }

  };



  return (

    <>

      <Card className="p-6">

        <div className="space-y-6">

          <div>

            <h3 className="text-xl font-bold" style={{ color: '#04a25c' }}>Datos Personales</h3>

            <p className="text-sm text-gray-600 mt-1">Completa tu información personal básica</p>

          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Tipo de Documento */}

            <div className="space-y-2">

              <Label htmlFor="tipoDocumento">Tipo de documento *</Label>

              <Select

                name="tipoDocumento"

                value={formData.tipoDocumento}

                onValueChange={(value) => updateField('tipoDocumento', value)}

                required

              >

                <SelectTrigger id="tipoDocumento">

                  <SelectValue placeholder="Seleccionar..." />

                </SelectTrigger>

                <SelectContent

                  onOpenAutoFocus={(event) => event.preventDefault()}

                  onCloseAutoFocus={(event) => event.preventDefault()}

                >

                  {tipoDocumentoOptions.length === 0 ? (

                    <SelectItem value="loading" disabled>

                      Cargando...

                    </SelectItem>

                  ) : (

                    tipoDocumentoOptions.map((item) => (

                      <SelectItem key={item.id} value={String(item.id)}>

                        {item.descripcion}

                      </SelectItem>

                    ))

                  )}

                </SelectContent>

              </Select>

            </div>



            {/* Número de Documento */}

            <div className="space-y-2">

              <Label htmlFor="numeroDocumento">Nro. de documento *</Label>

              <Input

                id="numeroDocumento"

                type="text"

                placeholder=""

                maxLength={8}

                value={formData.numeroDocumento}

                onChange={(e) => updateField('numeroDocumento', e.target.value)}

                required

              />

            </div>



            {/* Nombres */}

            <div className="space-y-2">

              <Label htmlFor="nombres">Nombres *</Label>

              <Input

                id="nombres"

                type="text"

                placeholder=""

                value={formData.nombres}

                onChange={(e) => updateField('nombres', e.target.value)}

                required

              />

            </div>



            {/* Apellido Paterno */}

            <div className="space-y-2">

              <Label htmlFor="apellidoPaterno">Apellido paterno *</Label>

              <Input

                id="apellidoPaterno"

                type="text"

                placeholder=""

                value={formData.apellidoPaterno}

                onChange={(e) => updateField('apellidoPaterno', e.target.value)}

                required

              />

            </div>



            {/* Apellido Materno */}

            <div className="space-y-2">

              <Label htmlFor="apellidoMaterno">Apellido materno *</Label>

              <Input

                id="apellidoMaterno"

                type="text"

                placeholder=""

                value={formData.apellidoMaterno}

                onChange={(e) => updateField('apellidoMaterno', e.target.value)}

                required

              />

            </div>



            {/* Sexo */}

            <div className="space-y-2">

              <Label htmlFor="sexo">Sexo *</Label>

              <Select

                name="sexo"

                value={formData.sexo}

                onValueChange={(value) => updateField('sexo', value)}

                required

              >

                <SelectTrigger id="sexo">

                  <SelectValue placeholder="Seleccione" />

                </SelectTrigger>

                <SelectContent>

                  {sexoOptions.length === 0 ? (

                    <SelectItem value="loading" disabled>

                      Cargando...

                    </SelectItem>

                  ) : (

                    sexoOptions.map((item) => (

                      <SelectItem key={item.id} value={String(item.id)}>

                        {item.descripcion}

                      </SelectItem>

                    ))

                  )}

                </SelectContent>

              </Select>

            </div>



            {/* Estado Civil */}

            <div className="space-y-2">

              <Label htmlFor="estadoCivil">Estado civil *</Label>

              <Select

                name="estadoCivil"

                value={formData.estadoCivil}

                onValueChange={(value) => updateField('estadoCivil', value)}

                required

              >

                <SelectTrigger id="estadoCivil">

                  <SelectValue placeholder="Seleccione" />

                </SelectTrigger>

                <SelectContent>

                  {estadoCivilOptions.length === 0 ? (

                    <SelectItem value="loading" disabled>

                      Cargando...

                    </SelectItem>

                  ) : (

                    estadoCivilOptions.map((item) => (

                      <SelectItem key={item.id} value={String(item.id)}>

                        {item.descripcion}

                      </SelectItem>

                    ))

                  )}

                </SelectContent>

              </Select>

            </div>



            {/* Fecha de Nacimiento */}

            <div className="space-y-2">

              <Label htmlFor="fechaNacimiento">Fecha nacimiento *</Label>

              <Input
                id="fechaNacimiento"
                type="date"
                placeholder="dd/mm/aaaa"
                lang="es-PE"
                value={formData.fechaNacimiento}
                onChange={(e) => updateField('fechaNacimiento', e.target.value)}
                required
              />

            </div>



            {/* Nacionalidad */}

            <div className="space-y-2">

              <Label htmlFor="nacionalidad">Nacionalidad *</Label>

              <Input

                id="nacionalidad"

                type="text"

                placeholder=""

                value={formData.nacionalidad}

                onChange={(e) => updateField('nacionalidad', e.target.value)}

                required

              />

            </div>



            {/* Correo electrónico principal - Ocupa toda la fila */}

            <div className="space-y-2">

              <Label htmlFor="correo">Correo electrónico principal *</Label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <Input

                  id="correo"

                  type="email"

                  placeholder=""

                  className="pl-10"

                  value={formData.correo}

                  onChange={(e) => updateField('correo', e.target.value)}

                  required

                />

              </div>

            </div>

            {/* Correo electrónico secundario */}

            <div className="space-y-2">

              <Label htmlFor="correoSecundario">Correo electrónico secundario *</Label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <Input

                  id="correoSecundario"

                  type="email"

                  placeholder=""

                  className="pl-10"

                  value={formData.correoSecundario}

                  onChange={(e) => updateField('correoSecundario', e.target.value)}

                  required

                />

              </div>

            </div>



            {/* RUC */}

            <div className="space-y-2">

              <Label htmlFor="ruc">RUC</Label>

              <Input

                id="ruc"

                type="text"

                placeholder=""

                maxLength={11}

                value={formData.ruc}

                onChange={(e) => updateField('ruc', e.target.value)}

              />

            </div>



            {/* Celular */}

            <div className="space-y-2">

              <Label htmlFor="celular">Celular *</Label>

              <div className="relative">

                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <Input

                  id="celular"

                  type="tel"

                  placeholder=""

                  className="pl-10"

                  value={formData.telefonoCelular}

                  onChange={(e) => updateField('telefonoCelular', e.target.value)}

                  required

                />

              </div>

            </div>



            {/* Nro cuenta de ahorros-Banco de la Nación - Ocupa toda la fila */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="cuentaBn">Nro cuenta de ahorros-Banco de la Nación</Label>

              <div className="relative">

                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <Input

                  id="cuentaBn"

                  type="text"

                  placeholder=""

                  className="pl-10"

                  maxLength={20}

                  value={formData.cuentaBn}

                  onChange={(e) => updateField('cuentaBn', e.target.value)}

                />

              </div>

            </div>



            {/* CCI-Banco de la Nación - Ocupa toda la fila */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="cciBn">CCI-Banco de la Nación *</Label>

              <div className="relative">

                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <Input

                  id="cciBn"

                  type="text"

                  placeholder=""

                  className="pl-10"

                  maxLength={20}

                  value={formData.cciBn}

                  onChange={(e) => updateField('cciBn', e.target.value)}

                  required

                />

              </div>

              <p className="text-xs text-gray-500">Ingresa tu número de cuenta interbancaria del Banco de la Nación (20 dígitos)</p>

            </div>



            {/* Voucher Banco de la Nación - Ocupa toda la fila */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="voucher">Voucher Banco de la Nación</Label>

              <div className="space-y-2">

                <label

                  htmlFor="voucher"

                  className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"

                >

                  <Upload className="w-5 h-5 text-gray-400" />

                  <span className="text-sm text-gray-600">

                    {voucherPreview ? 'Cambiar documento' : 'Seleccionar documento'}

                  </span>

                </label>

                <input

                  id="voucher"

                  type="file"

                  accept="image/*,application/pdf"

                  className="hidden"

                  onChange={handleVoucherChange}

                />

                <p className="text-xs text-gray-500">Elija un documento de extensión PDF o imagen y de tamaño menor a 100 MB</p>

                

                {(Boolean(voucherPreview) || voucherRefId > 0) && (

                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">

                    <div className="flex-1">

                      <p className="text-sm font-medium text-green-900">Voucher adjuntado correctamente</p>

                      <p className="text-xs text-green-700">Click en "Ver" para visualizar el archivo</p>

                    </div>

                    <div className="flex gap-2">

                      {(voucherPreview || voucherFileUrl) && (

                        <Button

                          type="button"

                          variant="outline"

                          size="sm"

                          className="gap-2"

                          onClick={() => openFile(voucherPreview || voucherFileUrl, voucherMime || (voucherFile?.type ?? null), 'voucher')}

                        >

                          <Eye className="w-4 h-4" />

                          Ver

                        </Button>

                      )}

                      <Button

                        type="button"

                        variant="outline"

                        size="sm"

                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"

                        onClick={removeVoucher}

                      >

                        <X className="w-4 h-4" />

                        Eliminar

                      </Button>

                    </div>

                  </div>

                )}

              </div>

            </div>


            {/* Registro Nacional de Proveedores (constancia) */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="rnpConstancia">Registro Nacional de Proveedores (constancia)</Label>

              <div className="space-y-2">

                <label

                  htmlFor="rnpConstancia"

                  className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"

                >

                  <Upload className="w-5 h-5 text-gray-400" />

                  <span className="text-sm text-gray-600">

                    {rnpPreview ? 'Cambiar documento' : 'Seleccionar documento'}

                  </span>

                </label>

                <input

                  id="rnpConstancia"

                  type="file"

                  accept="image/*,application/pdf"

                  className="hidden"

                  onChange={handleRnpChange}

                />

                <p className="text-xs text-gray-500">Elija un documento de extensión PDF o imagen y de tamaño menor a 100 MB</p>

                

                {(Boolean(rnpPreview) || rnpRefId > 0) && (

                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">

                    <div className="flex-1">

                      <p className="text-sm font-medium text-green-900">Constancia adjuntada correctamente</p>

                      <p className="text-xs text-green-700">Click en "Ver" para visualizar el archivo</p>

                    </div>

                    <div className="flex gap-2">

                      {(rnpPreview || rnpFileUrl) && (

                        <Button

                          type="button"

                          variant="outline"

                          size="sm"

                          className="gap-2"

                          onClick={() => openFile(rnpPreview || rnpFileUrl, rnpMime || (rnpFile?.type ?? null), 'rnp')}

                        >

                          <Eye className="w-4 h-4" />

                          Ver

                        </Button>

                      )}

                      <Button

                        type="button"

                        variant="outline"

                        size="sm"

                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"

                        onClick={removeRnp}

                      >

                        <X className="w-4 h-4" />

                        Eliminar

                      </Button>

                    </div>

                  </div>

                )}

              </div>

            </div>


            {/* Seguro de Salud - Ocupa toda la fila */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="seguroSalud">Seguro de salud</Label>

              <div className="space-y-2">

                <label

                  htmlFor="seguroSalud"

                  className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"

                >

                  <Upload className="w-5 h-5 text-gray-400" />

                  <span className="text-sm text-gray-600">

                    {seguroSaludPreview ? 'Cambiar documento' : 'Seleccionar documento'}

                  </span>

                </label>

                <input

                  id="seguroSalud"

                  type="file"

                  accept="image/*,application/pdf"

                  className="hidden"

                  onChange={handleSeguroSaludChange}

                />

                <p className="text-xs text-gray-500">Elija un documento de extensión PDF o imagen y de tamaño menor a 100 MB</p>

                

                {(Boolean(seguroSaludPreview) || seguroRefId > 0) && (

                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">

                    <div className="flex-1">

                      <p className="text-sm font-medium text-green-900">Seguro de salud adjuntado correctamente</p>

                      <p className="text-xs text-green-700">Click en "Ver" para visualizar el archivo</p>

                    </div>

                    <div className="flex gap-2">

                      {(seguroSaludPreview || seguroFileUrl) && (

                        <Button

                          type="button"

                          variant="outline"

                          size="sm"

                          className="gap-2"

                          onClick={() => openFile(seguroSaludPreview || seguroFileUrl, seguroMime || (seguroSaludFile?.type ?? null), 'seguro')}

                        >

                          <Eye className="w-4 h-4" />

                          Ver

                        </Button>

                      )}

                      <Button

                        type="button"

                        variant="outline"

                        size="sm"

                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"

                        onClick={removeSeguroSalud}

                      >

                        <X className="w-4 h-4" />

                        Eliminar

                      </Button>

                    </div>

                  </div>

                )}

              </div>

            </div>



            {/* SCTR - Seguro Complementario de Trabajo de Riesgo - Ocupa toda la fila */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="sctr">SCTR - Seguro Complementario de Trabajo de Riesgo</Label>

              <div className="space-y-2">

                <label

                  htmlFor="sctr"

                  className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"

                >

                  <Upload className="w-5 h-5 text-gray-400" />

                  <span className="text-sm text-gray-600">

                    {sctrPreview ? 'Cambiar documento' : 'Seleccionar documento'}

                  </span>

                </label>

                <input

                  id="sctr"

                  type="file"

                  accept="image/*,application/pdf"

                  className="hidden"

                  onChange={handleSctrChange}

                />

                <p className="text-xs text-gray-500">Elija un documento de extensión PDF o imagen y de tamaño menor a 100 MB</p>

                

                {(Boolean(sctrPreview) || sctrRefId > 0) && (

                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">

                    <div className="flex-1">

                      <p className="text-sm font-medium text-green-900">SCTR adjuntado correctamente</p>

                      <p className="text-xs text-green-700">Click en "Ver" para visualizar el archivo</p>

                    </div>

                    <div className="flex gap-2">

                      {(sctrPreview || sctrFileUrl) && (

                        <Button

                          type="button"

                          variant="outline"

                          size="sm"

                          className="gap-2"

                          onClick={() => openFile(sctrPreview || sctrFileUrl, sctrMime || (sctrFile?.type ?? null), 'sctr')}

                        >

                          <Eye className="w-4 h-4" />

                          Ver

                        </Button>

                      )}

                      <Button

                        type="button"

                        variant="outline"

                        size="sm"

                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"

                        onClick={removeSctr}

                      >

                        <X className="w-4 h-4" />

                        Eliminar

                      </Button>

                    </div>

                  </div>

                )}

              </div>

            </div>



            {/* Separador visual para Domicilio */}

            <div className="md:col-span-2 pt-6">

              <div className="border-t border-gray-200"></div>

            </div>



            {/* Título de sección Domicilio */}

            <div className="md:col-span-2">

              <h4 className="text-lg font-bold" style={{ color: '#04a25c' }}>Domicilio</h4>

              <p className="text-sm text-gray-600 mt-1">Ingresa tu dirección de residencia actual</p>

            </div>



            {/* Dirección - Ocupa toda la fila */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="direccionDomicilio">Dirección</Label>

              <Input

                id="direccionDomicilio"

                type="text"

                placeholder=""

                value={formData.direccion}

                onChange={(e) => updateField('direccion', e.target.value)}

              />

            </div>



            {/* Referencia - Ocupa toda la fila */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="referenciaDomicilio">Referencia</Label>

              <Input

                id="referenciaDomicilio"

                type="text"

                placeholder=""

                value={formData.referencia}

                onChange={(e) => updateField('referencia', e.target.value)}

              />

            </div>



            {/* Ubigeo */}

            <div className="space-y-2 md:col-span-2">

              <Label htmlFor="ubigeoSearch">Ubigeo (Departamento / Provincia / Distrito)</Label>

              <Select

                name="ubigeo"

                value={formData.distrito}

                onValueChange={(value) => {

                  updateField('distrito', value);

                  const selected = ubigeoOptions.find((item) => String(item.id) === value);

                  if (selected) {

                    setUbigeoQuery(selected.descripcion);

                  }

                }}

              >

                <SelectTrigger id="ubigeoSelect">

                  <SelectValue placeholder="Buscar ubigeo" />

                </SelectTrigger>

                <SelectContent>

                  <div className="p-2">

                    <div className="flex gap-2">

                      <Input

                        id="ubigeoSearch"

                        type="text"

                        placeholder="Escribe al menos 3 caracteres"

                        value={ubigeoQuery}

                        onChange={(e) => {

                          const value = e.target.value;

                          setUbigeoQuery(value);

                          if (formData.distrito) {

                            updateField('distrito', '');

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

                          updateField('distrito', '');

                          setUbigeoOptions([]);

                          const input = document.getElementById('ubigeoSearch') as HTMLInputElement | null;

                          input?.focus();

                        }}

                      >

                        Limpiar Busqueda

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

          </div>



          {/* Botón de Guardar */}

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">

            {saveMessage && (

              <div

                className={`flex-1 rounded-md border px-3 py-2 text-sm ${

                  saveMessageType === 'success'

                    ? 'border-green-200 bg-green-50 text-green-800'

                    : saveMessageType === 'error'

                      ? 'border-red-200 bg-red-50 text-red-700'

                      : 'border-gray-200 bg-gray-50 text-gray-700'

                }`}

              >

                {saveMessage}

              </div>

            )}

            <div className="ml-auto">

              <Button

                type="button"

                className="gap-2 bg-green-600 hover:bg-green-700"

                onClick={handleSave}

                disabled={isSaving}

              >

                <Save className="w-4 h-4" />

                {isSaving ? 'Guardando...' : 'Guardar'}

              </Button>

            </div>

          </div>

        </div>

      </Card>



      {/* Modal para ver el voucher */}

      {showVoucherModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

          <div className="relative max-w-2xl bg-white p-6">

            <button

              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"

              onClick={() => setShowVoucherModal(false)}

            >

              <X className="h-5 w-5" />

            </button>

            <img

              src={voucherPreview}

              alt="Voucher"

              className="max-h-96 w-full object-contain"

            />

          </div>

        </div>

      )}


      {/* Modal para ver constancia RNP */}

      {showRnpModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

          <div className="relative max-w-2xl bg-white p-6">

            <button

              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"

              onClick={() => setShowRnpModal(false)}

            >

              <X className="h-5 w-5" />

            </button>

            <img

              src={rnpPreview}

              alt="Constancia RNP"

              className="max-h-96 w-full object-contain"

            />

          </div>

        </div>

      )}


      {/* Modal para ver el seguro de salud */}

      {showSeguroSaludModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

          <div className="relative max-w-2xl bg-white p-6">

            <button

              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"

              onClick={() => setShowSeguroSaludModal(false)}

            >

              <X className="h-5 w-5" />

            </button>

            <img

              src={seguroSaludPreview}

              alt="Seguro de Salud"

              className="max-h-96 w-full object-contain"

            />

          </div>

        </div>

      )}



      {/* Modal para ver el SCTR */}

      {showSctrModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

          <div className="relative max-w-2xl bg-white p-6">

            <button

              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"

              onClick={() => setShowSctrModal(false)}

            >

              <X className="h-5 w-5" />

            </button>

            <img

              src={sctrPreview}

              alt="SCTR"

              className="max-h-96 w-full object-contain"

            />

          </div>

        </div>

      )}

    </>

  );

}







