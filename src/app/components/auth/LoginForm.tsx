import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import devidaLogo from '../../../images/devida-logo.png';
import { useState } from 'react';
import { loginPostulante, type LoginResponse } from '../../api/auth';

interface LoginFormProps {
  onLogin: (user: LoginResponse, remember: boolean) => void;
  onNavigateToRegister: () => void;
  onNavigateToRecovery: () => void;
}

export function LoginForm({ onLogin, onNavigateToRegister, onNavigateToRecovery }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      setFormError('Ingresa correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginPostulante({ email, password });
      if (!response?.idUsuario) {
        throw new Error('Respuesta de autenticación inválida.');
      }
      onLogin(response, remember);
    } catch {
      setFormError('Credenciales inválidas o error del servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <ImageWithFallback
              src={devidaLogo}
              alt="DEVIDA - Comisión Nacional para el Desarrollo y Vida sin Drogas"
              className="h-20 w-auto"
            />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: '#04a25c' }}>
            Sistema de Registro de Profesionales y/o Técnicos para Trabajo de Campo en el Marco del PP PIRDAIS
          </h2>
          <p className="text-sm mt-2 font-bold" style={{ color: '#108cc9' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            ) : null}
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
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
            </div>

            {/* Remember and Forgot */}
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(value) => setRemember(Boolean(value))}
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Recordarme
              </label>
            </div>
              <button
                type="button"
                onClick={onNavigateToRecovery}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <button
                onClick={onNavigateToRegister}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 DEVIDA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
