import { Filter, GraduationCap, Briefcase, Eye, Send, ChevronLeft, ChevronRight, Save, FileText, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { FilterCard } from './components/FilterCard';
import { ConvocatoriasTable } from './components/ConvocatoriasTable';
import { PostularModal } from './components/PostularModal';
import { MisPostulaciones } from './components/MisPostulaciones';
import { DetallePostulacion } from './components/DetallePostulacion';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { RecoveryForm } from './components/auth/RecoveryForm';
import { DatosPersonales } from './components/hoja-vida/DatosPersonales';
import { FormacionAcademica } from './components/hoja-vida/FormacionAcademica';
import { ExperienciaProfesional } from './components/hoja-vida/ExperienciaProfesional';
import { DeclaracionesJuradas } from './components/hoja-vida/DeclaracionesJuradas';
import { VistaPrevia } from './components/hoja-vida/VistaPrevia';
import { ConfirmacionPostulacion } from './components/ConfirmacionPostulacion';
import { InterfazPostulacion } from './components/InterfazPostulacion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Shield } from 'lucide-react';
// Admin components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { GestionPostulaciones } from './components/admin/GestionPostulaciones';
import { GestionConvocatorias } from './components/admin/GestionConvocatorias';
import { PlantillasCorreo } from './components/admin/PlantillasCorreo';
import { DeclaracionesJuradasAdmin } from './components/admin/DeclaracionesJuradasAdmin';
import { GestionUsuariosAdmin } from './components/admin/GestionUsuariosAdmin';
import type { LoginResponse } from './api/auth';
import { fetchConvocatoriasList } from './api/convocatorias';
import { fetchHojaVidaActual } from './api/hojaVida';
import { fetchPostulacionesByPersona, upsertPostulacion, type PostulacionListItem } from './api/postulaciones';
import { mapTipoUsuarioToRole, type AdminRole } from './utils/roles';

interface Convocatoria {
  id: string;
  nombre: string;
  oficinaZonal: string;
  oficinaCoordinacion: string;
  idOficinaZonal?: number;
  perfil: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  estado: 'abierta' | 'cerrada' | 'proxima';
  pdfUrl: string;
  archivoGuid?: string;
  estadoId?: number;
}

// Interfaces para Hoja de Vida
export interface DatosPersonalesData {
  tipoDocumento: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  sexo: string;
  estadoCivil: string;
  fechaNacimiento: string;
  nacionalidad: string;
  telefonoFijo: string;
  telefonoCelular: string;
  email: string;
  cciBn: string;
  voucherFile: { file: File; preview: string } | null;
}

export interface InformacionComplementariaData {
  licenciadoFFAA: string;
  seguroActual: string;
  tipoSeguro: string;
  personaDiscapacidad: string;
  tipoDiscapacidad: string;
  tieneSCTR: string;
}

// Interfaces para Formación y Experiencia
export interface Formacion {
  id: string;
  nivelEstudio: string;
  carrera: string;
  tipoInstitucion: string;
  tipoEntidad?: string;
  institucion: string;
  ruc?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  pais?: string;
  fecha: string;
  documento: string;
}

export interface Curso {
  id: string;
  tipoEstudio: string;
  descripcion: string;
  tipoInstitucion: string;
  institucion: string;
  ruc?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  pais?: string;
  fechaInicio: string;
  fechaFin: string;
  horasLectivas: string;
  documento: string;
}

export interface Experiencia {
  id: string;
  tipoExperiencia: string;
  tipoEntidad: string;
  nombreEntidad: string;
  departamento: string;
  provincia: string;
  distrito: string;
  area: string;
  cargo: string;
  funcionesPrincipales: string;
  motivoCese: string;
  fechaInicio: string;
  fechaFin: string;
  certificadoPreview: string | null;
}

export interface FormacionAcademicaData {
  estudios: Array<{
    id: string;
    tipoInstitucion: string;
    tipoEntidad: string;
    ruc: string;
    institucion: string;
    departamento: string;
    provincia: string;
    distrito: string;
    nivelEstudio: string;
    grupoCarrera: string;
    listaCarrera: string;
    denominacionCarrera: string;
    extensionDiploma: string;
    evidenciaFile: { file: File; preview: string } | null;
  }>;
}

export interface ExperienciaProfesionalData {
  experiencias: Array<{
    id: string;
    cargo: string;
    entidad: string;
    sector: string;
    fechaInicio: string;
    fechaFin: string;
    trabajoActual: boolean;
    funciones: string;
  }>;
}

const STORAGE_KEYS = {
  userType: 'sirpo.userType',
  postulanteUser: 'sirpo.postulanteUser',
  adminAuth: 'sirpo.adminAuth',
  authToken: 'sirpo.authToken',
  remember: 'sirpo.remember',
  activeSection: 'sirpo.activeSection',
  activeTab: 'sirpo.activeTab',
  adminSection: 'sirpo.adminSection',
};

type StoredAdminAuth = {
  role: AdminRole;
  userName: string;
  userId: number;
  oficinaZonalId?: number;
  oficinaZonal?: string;
  token?: string;
};

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const getStoredValue = (key: string) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
};

const setStoredValue = (key: string, value: string, remember: boolean) => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  }
};

const removeStoredValue = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

const isRememberEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.remember) === '1';
};

const loadStoredAuthState = () => {
  if (typeof window === 'undefined') {
    return {
      userType: null as 'postulante' | 'admin' | null,
      postulanteUser: null as LoginResponse | null,
      adminAuth: null as StoredAdminAuth | null,
      authToken: '',
      activeSection: null as string | null,
      activeTab: null as string | null,
      adminSection: null as string | null,
      isAuthenticated: false,
    };
  }
  const storedUserType = getStoredValue(STORAGE_KEYS.userType);
  const userType = (storedUserType as
    | 'postulante'
    | 'admin'
    | null) ?? null;
  const postulanteUser = safeParse<LoginResponse | null>(
    getStoredValue(STORAGE_KEYS.postulanteUser),
    null,
  );
  const adminAuth = safeParse<StoredAdminAuth | null>(
    getStoredValue(STORAGE_KEYS.adminAuth),
    null,
  );
  const authToken = getStoredValue(STORAGE_KEYS.authToken) || '';
  const activeSection = getStoredValue(STORAGE_KEYS.activeSection);
  const activeTab = getStoredValue(STORAGE_KEYS.activeTab);
  const adminSection = getStoredValue(STORAGE_KEYS.adminSection);
  const isAuthenticated =
    userType === 'postulante'
      ? Boolean(postulanteUser?.idUsuario)
      : userType === 'admin'
      ? Boolean(adminAuth?.userId)
      : false;
  return {
    userType,
    postulanteUser,
    adminAuth,
    authToken,
    activeSection,
    activeTab,
    adminSection,
    isAuthenticated,
  };
};

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return;
  removeStoredValue(STORAGE_KEYS.userType);
  removeStoredValue(STORAGE_KEYS.postulanteUser);
  removeStoredValue(STORAGE_KEYS.adminAuth);
  removeStoredValue(STORAGE_KEYS.authToken);
  removeStoredValue(STORAGE_KEYS.activeSection);
  removeStoredValue(STORAGE_KEYS.activeTab);
  removeStoredValue(STORAGE_KEYS.adminSection);
  localStorage.removeItem(STORAGE_KEYS.remember);
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/login';
  const initialUserType =
    initialPath === '/'
      ? null
      : initialPath.startsWith('/admin')
      ? 'admin'
      : 'postulante';
  const initialAuthView = initialPath === '/registroUsuario'
    ? 'register'
    : initialPath === '/recuperarContrasena'
    ? 'recovery'
    : 'login';
  const storedAuth = loadStoredAuthState();
  const toaster = <Toaster position="top-right" richColors />;
  // Estado para definir si es usuario normal o admin
  const [userType, setUserType] = useState<'postulante' | 'admin' | null>(
    storedAuth.userType ?? initialUserType,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(storedAuth.isAuthenticated);
  const [postulanteUser, setPostulanteUser] = useState<LoginResponse | null>(
    storedAuth.postulanteUser,
  );
  const [authView, setAuthView] = useState<'login' | 'register' | 'recovery'>(initialAuthView);
  const [activeSection, setActiveSection] = useState(
    storedAuth.activeSection || 'hoja-vida',
  );
  const [activeTab, setActiveTab] = useState(
    storedAuth.activeTab || 'datos-personales',
  );
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null); 
  const [hojaVidaEstado, setHojaVidaEstado] = useState<string>(''); 
  const [hojaVidaCompleta, setHojaVidaCompleta] = useState(false); // Cambiar a false para simular hoja de vida incompleta 
  const [hojaVidaId, setHojaVidaId] = useState<number>(0);
  const [postulaciones, setPostulaciones] = useState<PostulacionListItem[]>([]);
  const [isPostulacionesLoading, setIsPostulacionesLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [registroPopup, setRegistroPopup] = useState<string | null>(null);
  
  // Estados para el flujo de postulación
  const [showConfirmacionModal, setShowConfirmacionModal] = useState(false);
  const [showInterfazPostulacion, setShowInterfazPostulacion] = useState(false);

  // Estados para ver detalle de postulación
  const [selectedPostulacion, setSelectedPostulacion] = useState<any>(null);
  const [showDetallePostulacion, setShowDetallePostulacion] = useState(false);

  // Estados para admin
  const [adminSection, setAdminSection] = useState(
    storedAuth.adminSection || 'registros',
  );
  const [adminRole, setAdminRole] = useState<AdminRole | null>(
    storedAuth.adminAuth?.role ?? null,
  );
  const [adminUserName, setAdminUserName] = useState<string>(
    storedAuth.adminAuth?.userName ?? '',
  );
  const [adminUserId, setAdminUserId] = useState<number>(
    storedAuth.adminAuth?.userId ?? 0,
  );
  const [adminOficinaZonalId, setAdminOficinaZonalId] = useState<number>(
    storedAuth.adminAuth?.oficinaZonalId ?? 0,
  );
  const [adminOficinaZonal, setAdminOficinaZonal] = useState<string>(
    storedAuth.adminAuth?.oficinaZonal ?? '',
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('sirpo.toast');
    if (!raw) return;
    sessionStorage.removeItem('sirpo.toast');
    const hasAuth =
      Boolean(localStorage.getItem('sirpo.authToken')) ||
      Boolean(sessionStorage.getItem('sirpo.authToken')) ||
      Boolean(localStorage.getItem('sirpo.adminAuth')) ||
      Boolean(sessionStorage.getItem('sirpo.adminAuth')) ||
      Boolean(localStorage.getItem('sirpo.postulanteUser')) ||
      Boolean(sessionStorage.getItem('sirpo.postulanteUser'));
    if (!hasAuth) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { type?: string; message?: string };
      const message = parsed?.message || '';
      if (!message) return;
      const type = (parsed?.type || '').toLowerCase();
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'warning') {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    } catch {
      toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
    }
  }, []);

  const persistPostulanteAuth = (user: LoginResponse, remember: boolean) => {
    if (typeof window === 'undefined') return;
    setStoredValue(STORAGE_KEYS.userType, 'postulante', remember);
    setStoredValue(STORAGE_KEYS.postulanteUser, JSON.stringify(user), remember);
    if (user?.token) {
      setStoredValue(STORAGE_KEYS.authToken, user.token, remember);
    } else {
      removeStoredValue(STORAGE_KEYS.authToken);
    }
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.remember, '1');
    } else {
      localStorage.removeItem(STORAGE_KEYS.remember);
    }
  };

  const persistAdminAuth = (
    role: AdminRole,
    userName: string,
    userId: number,
    oficinaZonalId?: number,
    oficinaZonal?: string,
    token?: string,
  ) => {
    if (typeof window === 'undefined') return;
    const payload: StoredAdminAuth = { role, userName, userId, oficinaZonalId, oficinaZonal, token };
    setStoredValue(STORAGE_KEYS.userType, 'admin', true);
    setStoredValue(STORAGE_KEYS.adminAuth, JSON.stringify(payload), true);
    if (token) {
      setStoredValue(STORAGE_KEYS.authToken, token, true);
    } else {
      removeStoredValue(STORAGE_KEYS.authToken);
    }
    localStorage.setItem(STORAGE_KEYS.remember, '1');
  };

  useEffect(() => {
    const path = location.pathname || '/login';
    const isAdminPath = path.startsWith('/admin');

    if (!isAuthenticated) {
      if (path === '/') {
        setUserType(null);
        return;
      }
      if (isAdminPath) {
        setUserType('admin');
        if (path !== '/admin/login') {
          navigate('/admin/login', { replace: true });
        }
      } else {
        setUserType('postulante');
        if (path === '/registroUsuario') {
          setAuthView('register');
        } else if (path === '/recuperarContrasena') {
          setAuthView('recovery');
        } else {
          setAuthView('login');
        }
        if (path !== '/login' && path !== '/registroUsuario' && path !== '/recuperarContrasena') {
          navigate('/login', { replace: true });
        }
      }
    } else {
      if (userType === 'admin') {
        if (!isAdminPath) {
          navigate('/admin/registros', { replace: true });
        } else if (path === '/admin' || path === '/admin/') {
          navigate('/admin/registros', { replace: true });
        }
      } else {
        if (isAdminPath) {
          navigate('/hojaVida', { replace: true });
          setActiveSection('hoja-vida');
        } else if ( 
          path.startsWith('/postulaciones') || 
          path.startsWith('/postulacion') 
        ) { 
          navigate('/hojaVida', { replace: true }); 
          setActiveSection('hoja-vida'); 
        } else if ( 
          path === '/' || 
          path === '/login' || 
          path === '/registroUsuario' || 
          path === '/recuperarContrasena' 
        ) {
          navigate('/hojaVida', { replace: true });
        }
      }
    }

    if (isAdminPath) {
      let section = path.split('/')[2] || 'registros';
      if (section === 'postulaciones') {
        section = 'registros';
      } else if (section === 'convocatorias' || section === 'perfiles') {
        section = 'servicios';
      }
      const targetSection = isAdminSectionAllowed(section, adminRole)
        ? section
        : getAdminFallbackSection(adminRole);
      setAdminSection(targetSection);
      if (targetSection !== section) {
        navigate(`/admin/${targetSection}`, { replace: true });
      }
    } else if (path.startsWith('/hojaVida')) {
      setActiveSection('hoja-vida');
    } else if (path.startsWith('/postulaciones')) {
      setActiveSection('postulaciones');
    } else if (path.startsWith('/servicios')) { 
      setActiveSection('convocatorias'); 
    } else if (path.startsWith('/perfiles') || path.startsWith('/convocatorias')) { 
      setActiveSection('convocatorias'); 
      navigate('/servicios', { replace: true }); 
    } 
  }, [location.pathname, isAuthenticated, userType, adminRole, navigate]); 

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userType === 'postulante') {
      const remember = isRememberEnabled();
      setStoredValue(STORAGE_KEYS.activeSection, activeSection, remember);
    }
  }, [activeSection, userType]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userType === 'postulante') {
      const remember = isRememberEnabled();
      setStoredValue(STORAGE_KEYS.activeTab, activeTab, remember);
    }
  }, [activeTab, userType]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userType === 'admin') {
      setStoredValue(STORAGE_KEYS.adminSection, adminSection, true);
    }
  }, [adminSection, userType]);

  // Estados para Hoja de Vida
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonalesData>({
    tipoDocumento: '',
    numeroDocumento: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
    sexo: '',
    estadoCivil: '',
    fechaNacimiento: '',
    nacionalidad: '',
    telefonoFijo: '',
    telefonoCelular: '',
    email: '',
    cciBn: '',
    voucherFile: null,
  });

  const [informacionComplementaria, setInformacionComplementaria] = useState<InformacionComplementariaData>({
    licenciadoFFAA: '',
    seguroActual: '',
    tipoSeguro: '',
    personaDiscapacidad: '',
    tipoDiscapacidad: '',
    tieneSCTR: '',
  });

  const [formacionAcademica, setFormacionAcademica] = useState<FormacionAcademicaData>({
    estudios: [],
  });

  const [experienciaProfesional, setExperienciaProfesional] = useState<ExperienciaProfesionalData>({
    experiencias: [],
  });

  // Auth handlers
  const handleLogin = (user: LoginResponse, remember = true) => {
    const tipoUsuarioRaw =
      (user as any)?.tipoUsuario ??
      (user as any)?.tipo_usuario ??
      (user as any)?.tipoUsuarioId ??
      (user as any)?.idTipoUsuario;
    const adminRoleFromTipo = mapTipoUsuarioToRole(tipoUsuarioRaw);
    if (adminRoleFromTipo) {
      const displayName = [user.nombres, user.apellidoPaterno, user.apellidoMaterno]
        .filter(Boolean)
        .join(' ')
        .trim();
      const adminId = Number(user.idUsuario ?? user.idPersona ?? 0);
      setAdminRole(adminRoleFromTipo);
      setAdminUserName(displayName || user.email || user.nombres || 'Usuario');
      setAdminUserId(adminId);
      setIsAuthenticated(true);
      setUserType('admin');
      persistAdminAuth(
        adminRoleFromTipo,
        displayName || user.email || user.nombres || 'Usuario',
        adminId,
        user.token,
      );
      navigate('/admin/registros', { replace: true });
      return;
    }

    setPostulanteUser(user);
    setIsAuthenticated(true);
    setUserType('postulante');
    persistPostulanteAuth(user, remember);
    navigate('/hojaVida', { replace: true });
  };

  const handleRegister = (user: LoginResponse) => {
    setPostulanteUser(user);
    setIsAuthenticated(true);
    setUserType('postulante');
    persistPostulanteAuth(user, true);
    navigate('/hojaVida', { replace: true });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('login');
    setActiveSection('hoja-vida');
    setPostulanteUser(null);
    setHojaVidaId(0);
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  const handleAdminLogin = (
    role: AdminRole,
    username: string,
    adminId: number,
    oficinaZonalId?: number,
    oficinaZonal?: string,
    token?: string,
  ) => {
    setAdminRole(role);
    setAdminUserName(username);
    setAdminUserId(adminId);
    setAdminOficinaZonalId(oficinaZonalId ?? 0);
    setAdminOficinaZonal(oficinaZonal ?? '');
    setIsAuthenticated(true);
    setUserType('admin');
    persistAdminAuth(role, username, adminId, oficinaZonalId, oficinaZonal, token);
    navigate('/admin/registros', { replace: true });
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setAdminSection('registros');
    setAdminRole(null);
    setAdminUserName('');
    setAdminUserId(0);
    setAdminOficinaZonalId(0);
    setAdminOficinaZonal('');
    clearAuthStorage();
    navigate('/admin/login', { replace: true });
  };

  const isAdminSectionAllowed = (section: string, role?: AdminRole | null) => {
    if (!role) return true;
    if (section === 'registros') return true;
    if (section === 'servicios') return role === 'superadmin' || role === 'date';
    if (section === 'plantillas') return role === 'superadmin' || role === 'date';
    if (section === 'declaraciones') return role === 'superadmin' || role === 'date';
    if (section === 'usuarios') return role === 'superadmin' || role === 'date';
    return false;
  };

  const getAdminFallbackSection = (role?: AdminRole | null) => {
    if (!role || role === 'gestor' || role === 'superadmin') return 'registros';
    if (role === 'date') return 'registros';
    if (role === 'uaba') return 'registros';
    return 'registros';
  };

  const normalizeEstadoConvocatoria = (estado: string) => {
    const value = (estado || '').toLowerCase();
    if (value.includes('abier')) return 'abierta';
    if (value.includes('cerr')) return 'cerrada';
    if (value.includes('prox') || value.includes('próx')) return 'proxima';
    return value as Convocatoria['estado'];
  };

  const mapConvocatoria = (item: any): Convocatoria => ({
    id: String(item.idConvocatoria ?? item.id ?? ''),
    nombre: item.nombre ?? '',
    oficinaZonal: item.oficinaZonal ?? item.nombreOficinaZonal ?? '',
    oficinaCoordinacion: item.oficinaCoordinacion ?? '',
    idOficinaZonal:
      item.idOficinaZonal !== undefined && item.idOficinaZonal !== null
        ? Number(item.idOficinaZonal)
        : item.id_oficina_zonal !== undefined && item.id_oficina_zonal !== null
        ? Number(item.id_oficina_zonal)
        : undefined,
    perfil: item.perfil ?? '',
    fechaInicio: item.fechaInicio ?? '',
    fechaFin: item.fechaFin ?? '',
    diasRestantes: Number(item.diasRestantes ?? 0),
    estado: normalizeEstadoConvocatoria(item.estado ?? ''),
    pdfUrl: item.pdfUrl ?? '',
    archivoGuid: item.archivoGuid ?? '',
    estadoId: item.estadoId !== undefined && item.estadoId !== null ? Number(item.estadoId) : undefined,
  });

  const loadConvocatorias = async (filters: any = {}) => {
    try {
      const data = await fetchConvocatoriasList(filters);
      const mapped = data.map(mapConvocatoria);
      setConvocatorias(mapped);
      setFilteredConvocatorias(mapped);
    } catch {
      setFilteredConvocatorias(convocatorias);
    }
  };

  const loadPostulaciones = async (): Promise<PostulacionListItem[]> => {
    if (!postulanteUser?.idPersona) {
      setPostulaciones([]);
      return [];
    }
    setIsPostulacionesLoading(true);
    try {
      const data = await fetchPostulacionesByPersona(postulanteUser.idPersona);
      setPostulaciones(data);
      return data;
    } catch {
      setPostulaciones([]);
      return [];
    } finally {
      setIsPostulacionesLoading(false);
    }
  };

  useEffect(() => { 
    if (isAuthenticated && (userType === 'postulante' || userType === 'admin')) { 
      loadConvocatorias(); 
    } 
  }, [isAuthenticated, userType]); 

  useEffect(() => {
    if (isAuthenticated && userType === 'postulante') {
      loadPostulaciones();
    }
  }, [isAuthenticated, userType, postulanteUser?.idPersona]);

  useEffect(() => { 
    const loadHojaVidaEstado = async () => { 
      if (!isAuthenticated || userType !== 'postulante' || !postulanteUser?.idPersona || !postulanteUser?.idUsuario) { 
        return; 
      } 
      try { 
        const hvActual = await fetchHojaVidaActual(postulanteUser.idPersona, postulanteUser.idUsuario); 
        const estado = hvActual?.estado ?? ''; 
        setHojaVidaEstado(estado); 
        setHojaVidaCompleta((estado || '').toUpperCase() === 'COMPLETO'); 
        setHojaVidaId(Number(hvActual?.idHojaVida ?? 0));
      } catch { 
        setHojaVidaEstado(''); 
        setHojaVidaCompleta(false); 
        setHojaVidaId(0);
      } 
    }; 
    loadHojaVidaEstado(); 
  }, [isAuthenticated, userType, postulanteUser]); 

  useEffect(() => {
    if (!registroPopup) {
      return;
    }
    const timer = setTimeout(() => {
      setRegistroPopup(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [registroPopup]);

  // Search handlers
  const handleSearch = async (filters: any) => {
    await loadConvocatorias(filters);
  };

  const handleClear = async () => {
    await loadConvocatorias();
  };

  const handlePostular = async (convocatoria: Convocatoria) => {
    const data = await loadPostulaciones();
    const bloqueo = getBloqueoConvocatoria(convocatoria, data);
    if (bloqueo.blocked) {
      alert(bloqueo.reason || 'No puedes registrarte en este servicio.');
      return;
    }
    setSelectedConvocatoria(convocatoria);
    
    // Si la hoja de vida está completa, mostrar modal de confirmación
    if (hojaVidaCompleta) {
      setShowConfirmacionModal(true);
    } else {
      // Si no está completa, mostrar el modal anterior
      setModalOpen(true);
    }
  };

  const handleGoToHojaVida = () => {
    setModalOpen(false);
    setActiveSection('hoja-vida');
    setActiveTab('datos-personales');
    navigate('/hojaVida');
  };

  const handleConfirmarPostulacion = () => { 
    // Cerrar modal de confirmación y cambiar a la sección de postulación 
    setShowConfirmacionModal(false); 
    setActiveSection('postulacion'); 
    navigate('/servicios'); 
  }; 

  const handleCancelarConfirmacion = () => {
    setShowConfirmacionModal(false);
    setSelectedConvocatoria(null);
  };

  const handleCompletarPostulacion = async () => { 
    if (!selectedConvocatoria || !postulanteUser) { 
      alert('No se encontró información de la postulación.'); 
      return; 
    } 
    const data = await loadPostulaciones();
    const bloqueo = getBloqueoConvocatoria(selectedConvocatoria, data);
    if (bloqueo.blocked) {
      alert(bloqueo.reason || 'No puedes registrarte en este servicio.');
      return;
    }
    if (!hojaVidaId) { 
      alert('No se encontró la hoja de vida.'); 
      return; 
    } 
    const idConvocatoria = Number(selectedConvocatoria.id || 0); 
    if (!idConvocatoria) { 
      alert('No se encontró el servicio seleccionado.'); 
      return; 
    } 
    try { 
      const numeroPostulacion = await upsertPostulacion({ 
        idPostulacion: 0, 
        idPersona: postulanteUser.idPersona, 
        idConvocatoria, 
        idHojaVida: hojaVidaId, 
        numeroPostulacion: '', 
        estado: 'registrado', 
        observacion: '', 
        usuarioAccion: postulanteUser.idUsuario, 
      }); 
      setRegistroPopup(
        numeroPostulacion
          ? `Registro completado. N° ${numeroPostulacion}.`
          : 'Registro completado.',
      );
      loadPostulaciones();
      setActiveSection('convocatorias'); 
      setSelectedConvocatoria(null); 
      navigate('/servicios'); 
    } catch (error: any) { 
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'No se pudo completar el registro.';
      alert(message); 
    } 
  }; 

  const buildPostulacionesResumen = (items: PostulacionListItem[]) => {
    const byConvocatoria = new Set<string>();
    items.forEach((item) => {
      if (item.idConvocatoria) {
        byConvocatoria.add(String(item.idConvocatoria));
      }
    });
    return { byConvocatoria };
  };

  const postulacionesResumen = buildPostulacionesResumen(postulaciones);

  if (typeof window !== 'undefined') {
    (window as any).postulacionesResumen = {
      byConvocatoria: Array.from(postulacionesResumen.byConvocatoria.values()),
    };
  }

  const getBloqueoConvocatoria = (
    conv: Convocatoria,
    items: PostulacionListItem[] = postulaciones,
  ) => {
    const resumen = buildPostulacionesResumen(items);
    const convId = String(conv.id || '');
    if (resumen.byConvocatoria.has(convId)) {
      return { blocked: true, reason: 'Ya estás registrado en este servicio.' };
    }
    return { blocked: false, reason: '' };
  };

  const handleRealizarCambios = () => {
    // Volver a hoja de vida
    setActiveSection('hoja-vida');
    setActiveTab('datos-personales');
    navigate('/hojaVida');
  };

  const handleCerrarPostulacion = () => { 
    // Volver a convocatorias 
    setActiveSection('convocatorias'); 
    setSelectedConvocatoria(null); 
    navigate('/servicios'); 
  }; 

  const handleVerDetallePostulacion = (postulacion: any) => {
    setSelectedPostulacion(postulacion);
    setShowDetallePostulacion(true);
  };

  const handleCerrarDetallePostulacion = () => {
    setShowDetallePostulacion(false);
    setSelectedPostulacion(null);
  };

  // Auth screens
  if (!isAuthenticated) {
    if (userType === null) {
      return (
        <>
          {toaster}
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-8 shadow-xl">
              <div className="text-center mb-3">
                <h1
                  className="text-3xl font-bold mb-1 flex items-center justify-center gap-2"
                  style={{ color: '#04a25c' }}
                >
                  <Users className="w-8 h-8" />
                  SIRPO
                </h1>
                <p className="text-lg font-bold" style={{ color: '#108cc9' }}>
                  SISTEMA DE REGISTRO DE PROFESIONALES Y/O TÉCNICOS PARA TRABAJO DE CAMPO EN EL MARCO DEL PP PIRDAIS
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setUserType('postulante');
                    navigate('/login');
                  }}
                  className="group p-8 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-200 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <User className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Usuario</h3>
                  <p className="text-sm text-gray-600">
                    Accede para registrar tu hoja de vida
                  </p>
                </button>

                <button
                  onClick={() => {
                    setUserType('admin');
                    navigate('/admin/login');
                  }}
                  className="group p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Shield className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Administrador</h3>
                  <p className="text-sm text-gray-600">
                    Accede al panel administrativo de DEVIDA
                  </p>
                </button>
              </div>
            </Card>
          </div>
        </>
      );
    }

    // Login de Administrador
    if (userType === 'admin') {
      return (
        <>
          {toaster}
          <AdminLogin
            onLogin={(role, username, adminId, token, oficinaZonalId, oficinaZonal) => {
              handleAdminLogin(role, username, adminId, oficinaZonalId, oficinaZonal, token);
            }}
          />
        </>
      );
    }

    // Login/Registro de Postulante
    if (authView === 'register') {
      return (
        <>
          {toaster}
          <RegisterForm
            onRegister={handleRegister}
            onNavigateToLogin={() => navigate('/login')}
          />
        </>
      );
    }

    if (authView === 'recovery') {
      return (
        <>
          {toaster}
          <RecoveryForm onNavigateToLogin={() => navigate('/login')} />
        </>
      );
    }

    return (
      <>
        {toaster}
        <LoginForm
          onLogin={handleLogin}
          onNavigateToRegister={() => navigate('/registroUsuario')}
          onNavigateToRecovery={() => navigate('/recuperarContrasena')}
        />
      </>
    );
  }

  // Panel Administrativo
  if (userType === 'admin') {
    return (
      <>
        {toaster}
        <div className="min-h-screen bg-gray-50">
        <AdminSidebar 
          activeSection={adminSection} 
          onNavigate={(section) => {
            setAdminSection(section);
            navigate(`/admin/${section}`);
          }}
          userRole={adminRole}
          userName={adminUserName}
          onLogout={handleAdminLogout} 
        />

        <main className="ml-64 p-8">
          {adminSection === 'registros' && (
            <GestionPostulaciones 
              convocatorias={convocatorias}
              adminUserId={adminUserId}
              adminRole={adminRole ?? undefined}
              adminOficinaZonalId={adminOficinaZonalId || undefined}
              adminOficinaZonal={adminOficinaZonal || undefined}
            />
          )}
          {adminSection === 'servicios' && (
            <GestionConvocatorias
              adminUserId={adminUserId}
              adminRole={adminRole ?? undefined}
              adminOficinaZonalId={adminOficinaZonalId || undefined}
              adminOficinaZonal={adminOficinaZonal || undefined}
            />
          )}
          {adminSection === 'plantillas' && (
            <PlantillasCorreo adminUserId={adminUserId} />
          )}
          {adminSection === 'declaraciones' && <DeclaracionesJuradasAdmin />}
          {adminSection === 'usuarios' && (
            <GestionUsuariosAdmin adminUserId={adminUserId} adminRole={adminRole} />
          )}
        </main>
        </div>
      </>
    );
  }

  // Panel de Postulantes (código existente)
  return (
    <>
      {toaster}
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={(section) => { 
          setActiveSection(section); 
          if (section === 'convocatorias') { 
            navigate('/servicios'); 
          } else { 
            navigate('/hojaVida'); 
          } 
        }} 
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        user={postulanteUser}
      />

      {/* Main Content */}
      <main className={`p-8 transition-all duration-300 ease-in-out print:ml-0 print:p-0 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {activeSection === 'convocatorias' ? (
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
                <Briefcase className="w-8 h-8" />
                Servicios Disponibles 
              </h1> 
              <p className="mt-2 font-bold" style={{ color: '#108cc9' }}> 
                Puedes registrarte libremente en cualquier servicio publicado y en cualquier Oficina Zonal.
              </p> 
            </div> 

            {/* Filter Card */}
            <FilterCard onSearch={handleSearch} onClear={handleClear} />

            {/* Results Table */}
            <ConvocatoriasTable 
              convocatorias={filteredConvocatorias} 
              onPostular={handlePostular} 
              hojaVidaCompleta={hojaVidaCompleta} 
              getRegistroBloqueo={getBloqueoConvocatoria}
            /> 
          </div>
        ) : activeSection === 'hoja-vida' ? (
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="mb-8 print:hidden">
              <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
                <FileText className="w-8 h-8" />
                Registro de Hoja de Vida
              </h1>
              <p className="mt-2 font-bold" style={{ color: '#108cc9' }}> 
                Completa tu información personal y profesional 
              </p> 
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6 print:hidden">
                <TabsTrigger value="datos-personales">Datos Personales</TabsTrigger>
                <TabsTrigger value="formacion">Formación</TabsTrigger>
                <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
                <TabsTrigger value="declaraciones">Declaraciones Juradas</TabsTrigger>
                <TabsTrigger value="vista-previa">Vista Previa</TabsTrigger>
              </TabsList>

              <TabsContent value="datos-personales" className="space-y-6">
                <DatosPersonales user={postulanteUser} />
              </TabsContent>

              <TabsContent value="formacion" className="space-y-6">
                <FormacionAcademica user={postulanteUser} />
              </TabsContent>

              <TabsContent value="experiencia" className="space-y-6">
                <ExperienciaProfesional user={postulanteUser} />
              </TabsContent>

              <TabsContent value="declaraciones" className="space-y-6">
                <DeclaracionesJuradas user={postulanteUser} />
              </TabsContent>

              <TabsContent value="vista-previa" className="space-y-6">
                <VistaPrevia user={postulanteUser} />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t print:hidden">
              {activeTab !== 'vista-previa' ? (
                <>
                  {activeTab !== 'datos-personales' && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        const tabs = ['datos-personales', 'formacion', 'experiencia', 'declaraciones'];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1]);
                        }
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                  )}
                  <Button 
                    className="gap-2 bg-green-600 hover:bg-green-700 ml-auto"
                    onClick={() => {
                      const tabs = ['datos-personales', 'formacion', 'experiencia', 'declaraciones', 'vista-previa'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setActiveTab('declaraciones')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : activeSection === 'postulacion' ? (
          <div className="max-w-[1600px] mx-auto">
            {selectedConvocatoria && (
              <InterfazPostulacion
                convocatoria={selectedConvocatoria}
                user={postulanteUser}
                onClose={handleCerrarPostulacion}
                onCompletarPostulacion={handleCompletarPostulacion}
                onRealizarCambios={handleRealizarCambios}
              />
            )}
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto">
            {showDetallePostulacion && selectedPostulacion ? (
              <DetallePostulacion
                postulacion={selectedPostulacion}
                formaciones={[
                  {
                    id: '1',
                    nivelEstudio: 'Titulado',
                    carrera: 'Ingeniería Forestal',
                    tipoInstitucion: 'Nacional',
                    tipoEntidad: 'Pública',
                    institucion: 'Universidad Mayor de San Marcos',
                    ruc: '20123456789',
                    departamento: 'Lima',
                    provincia: 'Lima',
                    distrito: 'Lima',
                    fecha: '2008-12-12',
                    documento: 'diploma_forestal.pdf',
                  },
                  {
                    id: '2',
                    nivelEstudio: 'Egresado',
                    carrera: 'Ingeniería Alimentaria',
                    tipoInstitucion: 'Nacional',
                    tipoEntidad: 'Pública',
                    institucion: 'Universidad Nacional Agraria La Molina',
                    ruc: '20987654321',
                    departamento: 'Lima',
                    provincia: 'Lima',
                    distrito: 'La Molina',
                    fecha: '2012-06-23',
                    documento: 'certificado_alimentaria.pdf',
                  },
                ]}
                cursos={[
                  {
                    id: '1',
                    tipoEstudio: 'Especialización',
                    descripcion: 'Gestión Pública y Desarrollo Sostenible',
                    tipoInstitucion: 'Nacional',
                    institucion: 'Universidad Mayor de San Marcos',
                    ruc: '20123456789',
                    departamento: 'Lima',
                    provincia: 'Lima',
                    distrito: 'Lima',
                    fechaInicio: '2021-01-15',
                    fechaFin: '2021-06-15',
                    horasLectivas: '90',
                    documento: 'certificado_gestion.pdf',
                  },
                  {
                    id: '2',
                    tipoEstudio: 'Diplomado',
                    descripcion: 'Desarrollo Rural y Agricultura Sostenible',
                    tipoInstitucion: 'Nacional',
                    institucion: 'Pontificia Universidad Católica del Perú',
                    ruc: '20456789123',
                    departamento: 'Lima',
                    provincia: 'Lima',
                    distrito: 'San Miguel',
                    fechaInicio: '2022-03-10',
                    fechaFin: '2022-09-10',
                    horasLectivas: '120',
                    documento: 'certificado_rural.pdf',
                  },
                ]}
                experiencias={[
                  {
                    id: '1',
                    tipoExperiencia: 'empleo',
                    tipoEntidad: 'publico',
                    nombreEntidad: 'Ministerio de Agricultura y Riego',
                    departamento: 'Lima',
                    provincia: 'Lima',
                    distrito: 'Miraflores',
                    area: 'Proyectos Agrícolas',
                    cargo: 'Extensionista Agrícola',
                    funcionesPrincipales: 'Capacitación y asistencia técnica a productores Agrícolas en mejores prácticas de cultivo y manejo de recursos.',
                    motivoCese: 'fin-contrato',
                    fechaInicio: '2022-01-15',
                    fechaFin: '2024-12-31',
                    certificadoPreview: 'certificado_minagri.pdf',
                  },
                  {
                    id: '2',
                    tipoExperiencia: 'empleo',
                    tipoEntidad: 'privado',
                    nombreEntidad: 'Agroindustrias del Valle S.A.C.',
                    departamento: 'Ica',
                    provincia: 'Ica',
                    distrito: 'Ica',
                    area: 'Operaciones',
                    cargo: 'Supervisor de Campo',
                    funcionesPrincipales: 'Supervisión de actividades de campo, control de calidad de productos Agrícolas y coordinación con equipos de trabajo.',
                    motivoCese: 'renuncia',
                    fechaInicio: '2020-03-10',
                    fechaFin: '2021-11-30',
                    certificadoPreview: 'certificado_agroindustrias.pdf',
                  },
                ]}
                onClose={handleCerrarDetallePostulacion}
              />
            ) : (
              <MisPostulaciones onVerDetalle={handleVerDetallePostulacion} />
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedConvocatoria && (
        <PostularModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onGoToHojaVida={handleGoToHojaVida}
          hojaVidaCompleta={hojaVidaCompleta}
          nombreConvocatoria={selectedConvocatoria.nombre}
        />
      )}

      {/* confirmación de postulación */}
      {showConfirmacionModal && selectedConvocatoria && (
        <ConfirmacionPostulacion
          convocatoriaNombre={selectedConvocatoria.nombre}
          onConfirmar={handleConfirmarPostulacion}
          onCancelar={handleCancelarConfirmacion}
        />
      )}

      {registroPopup && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
            {registroPopup}
          </div>
        </div>
      )}
      </div>
    </>
  );
}










