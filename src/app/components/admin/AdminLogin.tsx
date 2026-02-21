import { useState } from 'react';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { loginAdmin } from '../../api/adminAuth';
import { mapRolIdToRole, mapTipoUsuarioToRole, type AdminRole } from '../../utils/roles';

interface AdminLoginProps {
  onLogin: (
    role: AdminRole,
    username: string,
    adminId: number,
    token?: string,
    oficinaZonalId?: number,
    oficinaZonal?: string,
  ) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usuario.trim() || !formData.password.trim()) {
      setError('Usuario y contraseña son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await loginAdmin(formData.usuario.trim(), formData.password);
      if (!result || !result.idAdmin) {
        setError('Usuario o contraseña incorrectos.');
        return;
      }

      const roleFromTipo = mapTipoUsuarioToRole(result.tipoUsuario);
      const roleFromRolId = mapRolIdToRole(result.rolId);
      const roleText = (result.rol || '').toLowerCase();
      const roleFromText =
        roleText.includes('jefe') || roleText.includes('coordinador')
          ? 'jefe'
          : roleText.includes('date')
          ? 'date'
          : roleText.includes('uaba')
          ? 'uaba'
          : roleText.includes('gestor')
          ? 'gestor'
          : roleText.includes('super') || roleText.includes('admin')
          ? 'superadmin'
          : null;
      const normalizedRole = roleFromTipo ?? roleFromRolId ?? roleFromText ?? 'gestor';
      const displayName = result.nombreCompleto || result.usuario || formData.usuario;
      onLogin(
        normalizedRole,
        displayName,
        Number(result.idAdmin),
        result.token,
        result.idOficinaZonal,
        result.oficinaZonal,
      );
    } catch (err: any) {
      if (err?.code === 'ECONNABORTED') {
        setError('El servidor tardó en responder. Inténtalo nuevamente.');
      } else {
        setError('No se pudo iniciar sesión. Inténtalo nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#04a25c' }}>
            Panel Administrativo
          </h1>
          <p className="text-gray-600 font-semibold">
            Sistema de Registro de Profesionales y/o Técnicos para Trabajo de Campo en el Marco del PP PIRDAIS
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              value={formData.usuario}
              onChange={(e) => {
                setFormData({ ...formData, usuario: e.target.value });
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingrese su contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 gap-2"
            disabled={isSubmitting}
          >
            <LogIn className="w-5 h-5" />
            {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2026 DEVIDA. Todos los derechos reservados.
          </p>
        </div>
      </Card>
    </div>
  );
}
