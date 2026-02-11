import { UserPlus, Search, X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import devidaLogo from '../../../images/devida-logo.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useEffect, useState } from 'react';
import { fetchTipoDocDropdown, type DropdownItem } from '../../api/catalogos';
import { registerPostulante, type RegisterResponse } from '../../api/auth';
import { pedirDNI, pedirMigraciones, pedirRUC } from '../../api/pide';

interface RegisterFormProps {
  onRegister: (user: RegisterResponse) => void;
  onNavigateToLogin: () => void;
}

export function RegisterForm({ onRegister, onNavigateToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [tipoDocumentoDesc, setTipoDocumentoDesc] = useState<string>('');
  const [tipoDocumentoOptions, setTipoDocumentoOptions] = useState<DropdownItem[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingDoc, setIsSearchingDoc] = useState(false);
  const [isSearchingRuc, setIsSearchingRuc] = useState(false);

  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [numeroRuc, setNumeroRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadTipoDocumento = async () => {
      try {
        const items = await fetchTipoDocDropdown();
        if (!isActive) return;
        setTipoDocumentoOptions(items);
        if (items.length > 0) {
          setTipoDocumento(String(items[0].id));
          setTipoDocumentoDesc(items[0].descripcion);
        }
      } catch (error) {
        console.error('Error loading tipoDocumento', error);
      }
    };

    loadTipoDocumento();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.target as HTMLFormElement);
    const email = ((formData.get('email') as string) || '').trim();
    const confirmarCorreo = ((formData.get('confirmarCorreo') as string) || '').trim();
    const password = (formData.get('password') as string) || '';
    const confirmarPassword = (formData.get('confirmarPassword') as string) || '';
    const numeroDocumentoValue =
      ((formData.get('numeroDocumento') as string) || numeroDocumento || '').trim();
    const nombresValue = ((formData.get('nombres') as string) || nombres || '').trim();
    const apellidoPaternoValue =
      ((formData.get('apellidoPaterno') as string) || apellidoPaterno || '').trim();
    const apellidoMaternoValue =
      ((formData.get('apellidoMaterno') as string) || apellidoMaterno || '').trim();

    const requiredFields: Array<[string, string]> = [
      ['Tipo de documento', String(tipoDocumento || '').trim()],
      ['Número de documento', numeroDocumentoValue],
      ['Nombres', nombresValue],
      ['Apellido paterno', apellidoPaternoValue],
      ['Apellido materno', apellidoMaternoValue],
      ['Correo electrónico', email],
      ['Confirmar correo', confirmarCorreo],
      ['Contraseña', String(password || '').trim()],
      ['Confirmar contraseña', String(confirmarPassword || '').trim()],
    ];

    const missing = requiredFields
      .filter(([, value]) => !value)
      .map(([label]) => label);

    if (missing.length > 0) {
      setFormError(`Complete los campos obligatorios: ${missing.join(', ')}.`);
      return;
    }

    if (email.trim() !== confirmarCorreo.trim()) {
      setFormError('El correo y su confirmación no coinciden.');
      return;
    }

    if (password !== confirmarPassword) {
      setFormError('La contraseña y su confirmación no coinciden.');
      return;
    }

    const payload = {
      tipoDocumento,
      numeroDocumento: numeroDocumentoValue,
      apellidoPaterno: apellidoPaternoValue,
      apellidoMaterno: apellidoMaternoValue,
      nombres: nombresValue,
      email,
      password,
    };

    try {
      setIsSubmitting(true);
      const response = await registerPostulante(payload);
      onRegister(response);
    } catch (error) {
      console.error('Error al registrar', error);
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error ||
        (error as any)?.message ||
        '';
      if (typeof message === 'string' && message.toLowerCase().includes('documento ya registrado')) {
        setFormError('Documento ya registrado.');
      } else {
        setFormError('Error al registrar. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeDocDesc = (value: string) => value.trim().toLowerCase();

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
    if (data?.datosPrincipales) {
      return data.datosPrincipales;
    }
    if (data?.data?.datosPrincipales) {
      return data.data.datosPrincipales;
    }
    if (data?.resultado?.datosPrincipales) {
      return data.resultado.datosPrincipales;
    }
    if (data?.datosPersona) {
      return data.datosPersona;
    }
    if (data?.data?.datosPersona) {
      return data.data.datosPersona;
    }
    if (data?.resultado?.datosPersona) {
      return data.resultado.datosPersona;
    }
    if (data?.result?.datosPersona) {
      return data.result.datosPersona;
    }
    const candidates = [
      data?.data,
      data?.datos,
      data?.resultado,
      data?.result,
      data?.data?.datos,
      data?.data?.resultado,
      data?.data?.result,
      data?.data?.data,
      data?.persona,
      data?.reniec,
      data?.pide,
      data,
    ];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'object') {
        return candidate;
      }
    }
    return data ?? {};
  };

  const handleBuscarDocumento = async () => {
    setFormError('');
    if (!numeroDocumento.trim()) {
      setFormError('Ingrese el numero de documento.');
      return;
    }
    if (!tipoDocumentoDesc) {
      setFormError('Seleccione un tipo de documento.');
      return;
    }
    const desc = normalizeDocDesc(tipoDocumentoDesc);
    try {
      setIsSearchingDoc(true);
      if (desc.includes('dni')) {
        const data = await pedirDNI(numeroDocumento.trim());
        const payload = extractPayload(data);
        const nombresResp =
          pickValue(payload, [
            'nombres',
            'prenombres',
            'preNombres',
            'nombre',
            'nombresCompletos',
            'nombreCompleto',
            'nombre_completo',
            'nombres_completos',
          ]) || pickValue(data, ['nombres', 'prenombres', 'preNombres']);
        const apellidoPatResp =
          pickValue(payload, [
            'apellidoPaterno',
            'apePaterno',
            'apPaterno',
            'apellido_paterno',
            'apPrimer',
            'primerApellido',
            'apellido1',
          ]) || pickValue(data, ['apellidoPaterno', 'apellido_paterno', 'apPrimer']);
        const apellidoMatResp =
          pickValue(payload, [
            'apellidoMaterno',
            'apeMaterno',
            'apMaterno',
            'apellido_materno',
            'apSegundo',
            'segundoApellido',
            'apellido2',
          ]) || pickValue(data, ['apellidoMaterno', 'apellido_materno', 'apSegundo']);
        if (!nombresResp && !apellidoPatResp && !apellidoMatResp) {
          setFormError('No se encontraron datos para el DNI.');
          return;
        }
        if (nombresResp) setNombres(nombresResp);
        if (apellidoPatResp) setApellidoPaterno(apellidoPatResp);
        if (apellidoMatResp) setApellidoMaterno(apellidoMatResp);
        return;
      }
      if (desc.includes('carnet') || desc.includes('extranjer') || desc.includes('ce')) {
        const data = await pedirMigraciones(numeroDocumento.trim());
        const payload = extractPayload(data);
        const nombresResp =
          pickValue(payload, ['nombres', 'nombre', 'nombresCompletos', 'nombreCompleto']) ||
          pickValue(data, ['nombres', 'nombre']);
        const apellidoPatResp =
          pickValue(payload, [
            'apellidoPaterno',
            'apPaterno',
            'apellido_paterno',
            'primerApellido',
            'apellido1',
          ]) || pickValue(data, ['apellidoPaterno', 'primerApellido']);
        const apellidoMatResp =
          pickValue(payload, [
            'apellidoMaterno',
            'apMaterno',
            'apellido_materno',
            'segundoApellido',
            'apellido2',
          ]) || pickValue(data, ['apellidoMaterno', 'segundoApellido']);
        if (!nombresResp && !apellidoPatResp && !apellidoMatResp) {
          setFormError('No se encontraron datos para el carnet de extranjeria.');
          return;
        }
        if (nombresResp) setNombres(nombresResp);
        if (apellidoPatResp) setApellidoPaterno(apellidoPatResp);
        if (apellidoMatResp) setApellidoMaterno(apellidoMatResp);
        return;
      }
      setFormError('Tipo de documento no soportado para busqueda.');
    } catch (error) {
      console.error('Error al consultar documento', error);
      setFormError('No se pudo consultar el documento. Intente nuevamente.');
    } finally {
      setIsSearchingDoc(false);
    }
  };

  const handleBuscarRuc = async () => {
    setFormError('');
    if (!numeroRuc.trim()) {
      setFormError('Ingrese el numero de RUC.');
      return;
    }
    try {
      setIsSearchingRuc(true);
      const data = await pedirRUC(numeroRuc.trim());
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
        setFormError('No se encontro razon social para el RUC.');
        return;
      }
      setRazonSocial(razon);
    } catch (error) {
      console.error('Error al consultar RUC', error);
      setFormError('No se pudo consultar el RUC. Intente nuevamente.');
    } finally {
      setIsSearchingRuc(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={onNavigateToLogin}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </button>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <ImageWithFallback 
              src={devidaLogo} 
              alt="DEVIDA - Comisión Nacional para el Desarrollo y Vida sin Drogas" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#04a25c' }}>Registro de Usuario</h1>
          <p className="text-sm mt-2 font-bold" style={{ color: '#108cc9' }}>Completa tus datos para crear una cuenta</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              Complete los campos obligatorios marcados con un asterisco (*) para finalizar su registro.
            </p>
            <p className="text-sm text-gray-700 mt-1">
              El correo electrónico será utilizado para notificaciones y recuperación de contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
            {/* Tipo de Documento y Número */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">
                  Tipo de documento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={tipoDocumento}
                  onValueChange={(value) => {
                    setTipoDocumento(value);
                    const selected = tipoDocumentoOptions.find((item) => String(item.id) === value);
                    setTipoDocumentoDesc(selected?.descripcion || '');
                  }}
                >
                  <SelectTrigger className="h-9 py-1">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div className="space-y-2" style={{ marginBottom: '6pt' }}>
                  <Label htmlFor="numeroDocumento">
                    Número de documento <span className="text-red-500">*</span>
                  </Label>
                <Input
                  id="numeroDocumento"
                  name="numeroDocumento"
                  type="text"
                  placeholder=""
                  className="h-9"
                  maxLength={tipoDocumentoDesc.toLowerCase().includes('dni') ? 8 : 12}
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  required
                />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 h-9"
                  style={{ marginBottom: '6pt' }}
                  onClick={handleBuscarDocumento}
                  disabled={isSearchingDoc}
                >
                  <Search className="w-4 h-4" />
                  {isSearchingDoc ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>

            {/* Nombres y Apellido paterno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">
                  Nombres <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombres"
                  name="nombres"
                  type="text"
                  placeholder=""
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno">
                  Apellido paterno <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  type="text"
                  placeholder=""
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Apellido Materno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno">
                  Apellido materno <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  type="text"
                  placeholder=""
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Número de RUC y Razón Social */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div className="space-y-2">
                  <Label htmlFor="numeroRuc">
                    Número de RUC
                  </Label>
                  <Input
                    id="numeroRuc"
                    name="numeroRuc"
                    type="text"
                    placeholder=""
                    maxLength={11}
                    value={numeroRuc}
                    onChange={(e) => setNumeroRuc(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 h-9"
                  onClick={handleBuscarRuc}
                  disabled={isSearchingRuc}
                >
                  <Search className="w-4 h-4" />
                  {isSearchingRuc ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="razonSocial">
                  Razón Social
                </Label>
                <Input
                  id="razonSocial"
                  name="razonSocial"
                  type="text"
                  placeholder=""
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                />
              </div>
            </div>

            {/* Correo electrónico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Correo electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder=""
                  required
                />
                <p className="text-xs text-gray-500">Este correo será su usuario de acceso al sistema.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarCorreo">
                  Confirmar correo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmarCorreo"
                  name="confirmarCorreo"
                  type="email"
                  placeholder=""
                  required
                />
                <p className="text-xs text-gray-500">Debe coincidir con el correo ingresado.</p>
              </div>
            </div>

            {/* contraseña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Mínimo 8 caracteres, incluir letras y Números.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarPassword">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmarPassword"
                    name="confirmarPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder=""
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Debe coincidir con la contraseña ingresada.</p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="gap-2"
                onClick={onNavigateToLogin}
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 DEVIDA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}


