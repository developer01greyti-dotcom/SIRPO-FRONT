import { Send, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import devidaLogo from '../../../images/devida-logo.png';
import { requestPasswordRecovery } from '../../api/auth';

interface RecoveryFormProps {
  onNavigateToLogin: () => void;
}

export function RecoveryForm({ onNavigateToLogin }: RecoveryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setFormError('Ingrese su correo electrónico.');
      return;
    }
    try {
      setIsSubmitting(true);
      const ok = await requestPasswordRecovery(trimmed);
      if (!ok) {
        setFormError('No se pudo enviar el correo de recuperación.');
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError('No se pudo enviar el correo de recuperación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Correo Enviado</h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado las instrucciones para restablecer tu contraseña al correo electrónico proporcionado.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Si no recibes el correo en los próximos minutos, verifica tu carpeta de spam.
            </p>
            <Button onClick={onNavigateToLogin} className="w-full bg-green-600 hover:bg-green-700">
              Volver al inicio de sesión
            </Button>
          </div>

          {/* Footer */}
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
          <h1 className="text-2xl font-bold" style={{ color: '#04a25c' }}>Recuperar contraseña</h1>
          <p className="text-sm mt-2 font-bold" style={{ color: '#108cc9' }}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
          </p>
        </div>

        {/* Recovery Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Te enviaremos un enlace a tu correo electrónico para que puedas crear una nueva contraseña.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
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

