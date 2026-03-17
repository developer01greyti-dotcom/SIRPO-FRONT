import { ArrowLeft, CheckCircle, KeyRound, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { changePasswordWithToken } from '../../api/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import devidaLogo from '../../../images/devida-logo.png';

interface ChangePasswordFormProps {
  onNavigateToLogin: () => void;
}

export function ChangePasswordForm({ onNavigateToLogin }: ChangePasswordFormProps) {
  const location = useLocation();
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }, [location.search]);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError('');

    if (!token) {
      setFormError('El enlace de recuperación no es válido o ya expiró.');
      return;
    }
    if (!tempPassword.trim()) {
      setFormError('Ingresa la contraseña temporal.');
      return;
    }
    if (!newPassword.trim()) {
      setFormError('Ingresa una nueva contraseña.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await changePasswordWithToken({
        token,
        passwordTemporal: tempPassword.trim(),
        passwordNueva: newPassword,
      });
      if (!response?.ok) {
        setFormError(response?.mensaje || 'No se pudo actualizar la contraseña.');
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError('No se pudo actualizar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contraseña actualizada</h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.
            </p>
            <Button onClick={onNavigateToLogin} className="w-full bg-green-600 hover:bg-green-700">
              Volver al inicio de sesión
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">
            © 2026 DEVIDA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onNavigateToLogin}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <ImageWithFallback
              src={devidaLogo}
              alt="DEVIDA - Comisión Nacional para el Desarrollo y Vida sin Drogas"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#04a25c' }}>
            Cambiar contraseña
          </h1>
          <p className="text-sm mt-2 font-bold" style={{ color: '#108cc9' }}>
            Ingresa la contraseña temporal y crea una nueva contraseña
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tempPassword">Contraseña temporal</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="tempPassword"
                  type="password"
                  className="pl-10"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  className="pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 DEVIDA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
