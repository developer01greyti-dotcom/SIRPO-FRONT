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
    const email = (formData.get('email') as string) || '';
    const confirmarCorreo = (formData.get('confirmarCorreo') as string) || '';
    const password = (formData.get('password') as string) || '';
    const confirmarPassword = (formData.get('confirmarPassword') as string) || '';

    if (email.trim() !== confirmarCorreo.trim()) {
      setFormError('El correo y su confirmación no coinciden.');
      return;
    }

    if (password !== confirmarPassword) {
      setFormError('La contraseña y su confirmación no coinciden.');
      return;
    }

    if (!tipoDocumento) {
      setFormError('Seleccione un tipo de documento.');
      return;
    }

    const payload = {
      tipoDocumento,
      numeroDocumento: (formData.get('numeroDocumento') as string) || '',
      apellidoPaterno: (formData.get('apellidoPaterno') as string) || '',
      apellidoMaterno: (formData.get('apellidoMaterno') as string) || '',
      nombres: (formData.get('nombres') as string) || '',
      email: email.trim(),
      password,
    };

    try {
      setIsSubmitting(true);
      const response = await registerPostulante(payload);
      onRegister(response);
    } catch (error) {
      console.error('Error al registrar', error);
      setFormError('Error al registrar. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
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
                  required
                />
                </div>
                <Button type="button" variant="outline" className="gap-2 h-9" style={{ marginBottom: '6pt' }}>
                  <Search className="w-4 h-4" />
                  Buscar
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
                    type="text"
                    placeholder=""
                    maxLength={11}
                  />
                </div>
                <Button type="button" variant="outline" className="gap-2 h-9">
                  <Search className="w-4 h-4" />
                  Buscar
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="razonSocial">
                  Razón Social
                </Label>
                <Input
                  id="razonSocial"
                  type="text"
                  placeholder=""
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


