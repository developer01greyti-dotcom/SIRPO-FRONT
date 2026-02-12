import { Users, Briefcase, Mail, LogOut, ChevronLeft, ChevronRight, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { getRoleLabel, type AdminRole } from '../../utils/roles';

interface AdminSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  userRole?: AdminRole | null;
  userName?: string;
}

export function AdminSidebar({
  activeSection,
  onNavigate,
  onLogout,
  userRole,
  userName,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'registros', icon: Users, label: 'Registros', roles: ['gestor', 'superadmin', 'date', 'uaba'] },
    { id: 'servicios', icon: Briefcase, label: 'Servicios', roles: ['gestor', 'superadmin', 'date', 'uaba'] },
    { id: 'plantillas', icon: Mail, label: 'Plantillas de Correo', roles: ['gestor', 'superadmin'] },
    { id: 'usuarios', icon: Shield, label: 'Gestión de Usuarios', roles: ['superadmin'] },
  ];

  const filteredMenuItems = menuItems.filter((item) => !userRole || item.roles.includes(userRole));

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-green-700 to-green-800 text-white transition-all duration-300 ease-in-out z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-green-600">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">SIRPO Admin</h1>
              <p className="text-xs text-green-200">Panel de Administración</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-green-600 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'text-white hover:bg-green-600'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-600 space-y-2">
        {userName && (
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-green-600/50 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? userName : ''}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-green-200">{getRoleLabel(userRole)}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-red-600 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Cerrar Sesión' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
