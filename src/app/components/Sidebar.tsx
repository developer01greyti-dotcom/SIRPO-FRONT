import { FileText, Briefcase, Send, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import devidaLogo from '../../images/devida-logo.png';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout?: () => void;
  collapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  user?: {
    nombres: string;
    apellidoPaterno: string;
    email: string;
  } | null;
}

export function Sidebar({
  activeSection,
  onNavigate,
  onLogout,
  collapsed,
  onToggleCollapse,
  user,
}: SidebarProps) {
  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.nombres.trim().split(' ')[0] || '';
    const lastName = user.apellidoPaterno.trim().split(' ')[0] || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return initials || 'U';
  };

  const displayName = user
    ? `${user.nombres.trim().split(' ')[0] || ''} ${user.apellidoPaterno}`.trim()
    : 'Usuario';
  const displayEmail = user?.email || 'usuario@ejemplo.com';

  const menuItems = [
    {
      id: 'hoja-vida',
      label: 'Registro de Hoja de Vida',
      icon: FileText,
    },
    {
      id: 'convocatorias',
      label: 'Servicios Disponibles',
      icon: Briefcase,
    },
  ];

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        print:hidden
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 relative">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <ImageWithFallback
              src={devidaLogo}
              alt="DEVIDA Logo" 
              className="h-10 w-auto"
            />
          </div>
          <div 
            className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}
          >
            <h1 className="font-semibold text-gray-900 text-sm whitespace-nowrap">DEVIDA</h1>
            <p className="text-xs text-gray-500 whitespace-nowrap">SIRPO</p>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => onToggleCollapse(!collapsed)}
          className={`
            absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full 
            flex items-center justify-center shadow-sm hover:shadow-md
            transition-all duration-200 hover:bg-green-50 hover:border-green-200
            z-10
          `}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${collapsed ? 'justify-center' : ''}
                    ${
                      isActive
                        ? 'bg-green-50 text-green-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span 
                    className={`
                      transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap
                      ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-medium text-xs">{getInitials()}</span>
          </div>
          <div 
            className={`
              flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden
              ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}
          >
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className={`
              text-gray-500 hover:text-gray-900 flex-shrink-0
              ${collapsed ? 'hidden' : ''}
            `}
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Logout button for collapsed state */}
        {collapsed && (
          <button
            onClick={onLogout}
            className="w-full mt-2 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
