import { useState } from 'react';
import { Users, Eye, Filter, X, Search } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DetallePostulacionAdmin } from './DetallePostulacionAdmin';

interface Postulacion {
  id: string;
  postulante: {
    nombre: string;
    documento: string;
    email: string;
  };
  convocatoria: string;
  oficinaZonal: string;
  perfil: string;
  fechaPostulacion: string;
  fechaInicioConvocatoria: string;
  fechaFinConvocatoria: string;
  estadoConvocatoria: 'abierta' | 'proxima' | 'cerrada';
  estado: 'en-revision' | 'preseleccionado' | 'rechazado' | 'finalista';
}

const mockPostulaciones: Postulacion[] = [
  {
    id: '1',
    postulante: {
      nombre: 'Juan Carlos Pérez García',
      documento: '12345678',
      email: 'juan.perez@email.com',
    },
    convocatoria: 'Convocatoria Extensionista Agrícola - Lima Norte 2026',
    oficinaZonal: 'Lima',
    perfil: 'Extensionista',
    fechaPostulacion: '05/01/2026',
    fechaInicioConvocatoria: '01/01/2026',
    fechaFinConvocatoria: '31/01/2026',
    estadoConvocatoria: 'abierta',
    estado: 'en-revision',
  },
  {
    id: '2',
    postulante: {
      nombre: 'María Elena López Sánchez',
      documento: '87654321',
      email: 'maria.lopez@email.com',
    },
    convocatoria: 'Convocatoria Coordinador Regional - Huánuco',
    oficinaZonal: 'Huánuco',
    perfil: 'Coordinador',
    fechaPostulacion: '03/01/2026',
    fechaInicioConvocatoria: '01/01/2026',
    fechaFinConvocatoria: '31/01/2026',
    estadoConvocatoria: 'abierta',
    estado: 'preseleccionado',
  },
  {
    id: '3',
    postulante: {
      nombre: 'Carlos Alberto Rodríguez Mena',
      documento: '45678912',
      email: 'carlos.rodriguez@email.com',
    },
    convocatoria: 'Convocatoria Técnico de Campo - Cusco',
    oficinaZonal: 'Cusco',
    perfil: 'Técnico de Campo',
    fechaPostulacion: '28/12/2025',
    fechaInicioConvocatoria: '01/01/2026',
    fechaFinConvocatoria: '31/01/2026',
    estadoConvocatoria: 'abierta',
    estado: 'rechazado',
  },
  {
    id: '4',
    postulante: {
      nombre: 'Ana Patricia Torres Vega',
      documento: '78945612',
      email: 'ana.torres@email.com',
    },
    convocatoria: 'Convocatoria Extensionista Agrícola - Lima Norte 2026',
    oficinaZonal: 'Lima',
    perfil: 'Extensionista',
    fechaPostulacion: '06/01/2026',
    fechaInicioConvocatoria: '01/01/2026',
    fechaFinConvocatoria: '31/01/2026',
    estadoConvocatoria: 'abierta',
    estado: 'finalista',
  },
  {
    id: '5',
    postulante: {
      nombre: 'Roberto Miguel Díaz Castro',
      documento: '32165498',
      email: 'roberto.diaz@email.com',
    },
    convocatoria: 'Convocatoria Promotor Social - Ayacucho',
    oficinaZonal: 'Ayacucho',
    perfil: 'Promotor',
    fechaPostulacion: '02/01/2026',
    fechaInicioConvocatoria: '01/01/2026',
    fechaFinConvocatoria: '31/01/2026',
    estadoConvocatoria: 'abierta',
    estado: 'en-revision',
  },
];

interface GestionPostulacionesProps {
  convocatorias: any[];
}

export function GestionPostulaciones({ convocatorias }: GestionPostulacionesProps) {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>(mockPostulaciones);
  const [filteredPostulaciones, setFilteredPostulaciones] = useState<Postulacion[]>(mockPostulaciones);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState<Postulacion | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);

  const [filters, setFilters] = useState({
    busqueda: '',
    estado: '',
    estadoPostulacion: '',
    oficinaZonal: '',
    oficinaCoordinacion: '',
    perfil: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const handleSearch = () => {
    let filtered = [...postulaciones];

    if (filters.busqueda) {
      const searchTerm = filters.busqueda.toLowerCase();
      filtered = filtered.filter((p) => p.convocatoria.toLowerCase().includes(searchTerm));
    }

    if (filters.estado && filters.estado !== 'todas') {
      filtered = filtered.filter((p) => p.estadoConvocatoria === filters.estado);
    }

    if (filters.oficinaZonal) {
      filtered = filtered.filter((p) => p.oficinaZonal === filters.oficinaZonal);
    }

    if (filters.oficinaCoordinacion) {
      // Filtro por oficina de coordinación (se puede agregar este campo al mock data)
      // filtered = filtered.filter((p) => p.oficinaCoordinacion === filters.oficinaCoordinacion);
    }

    if (filters.perfil) {
      filtered = filtered.filter((p) => p.perfil === filters.perfil);
    }

    // Filtro por estado de registro
    if (filters.estadoPostulacion) {
      filtered = filtered.filter((p) => p.estado === filters.estadoPostulacion);
    }

    // Filtros por fecha de perfil
    if (filters.fechaInicio || filters.fechaFin) {
      filtered = filtered.filter((p) => {
        const fechaInicioConv = parseFecha(p.fechaInicioConvocatoria);
        const fechaFinConv = parseFecha(p.fechaFinConvocatoria);

        if (filters.fechaInicio && filters.fechaFin) {
          const fechaInicioFiltro = new Date(filters.fechaInicio);
          const fechaFinFiltro = new Date(filters.fechaFin);

          return fechaInicioConv <= fechaFinFiltro && fechaFinConv >= fechaInicioFiltro;
        } else if (filters.fechaInicio) {
          const fechaInicioFiltro = new Date(filters.fechaInicio);
          return fechaFinConv >= fechaInicioFiltro;
        } else if (filters.fechaFin) {
          const fechaFinFiltro = new Date(filters.fechaFin);
          return fechaInicioConv <= fechaFinFiltro;
        }

        return true;
      });
    }

    setFilteredPostulaciones(filtered);
  };

  // Función auxiliar para parsear fechas en formato DD/MM/YYYY
  const parseFecha = (fecha: string): Date => {
    const [dia, mes, anio] = fecha.split('/').map(Number);
    return new Date(anio, mes - 1, dia);
  };

  const handleClearFilters = () => {
    setFilters({
      busqueda: '',
      estado: '',
      estadoPostulacion: '',
      oficinaZonal: '',
      oficinaCoordinacion: '',
      perfil: '',
      fechaInicio: '',
      fechaFin: '',
    });
    setFilteredPostulaciones(postulaciones);
  };

  const handleVerDetalle = (postulacion: Postulacion) => {
    setSelectedPostulacion(postulacion);
    setShowDetalle(true);
  };

  const handleActualizarEstado = (postulacionId: string, nuevoEstado: string) => {
    const updated = postulaciones.map((p) =>
      p.id === postulacionId ? { ...p, estado: nuevoEstado as any } : p,
    );
    setPostulaciones(updated);
    setFilteredPostulaciones(updated);

    if (selectedPostulacion && selectedPostulacion.id === postulacionId) {
      setSelectedPostulacion({ ...selectedPostulacion, estado: nuevoEstado as any });
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en-revision':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En Revisión</Badge>;
      case 'preseleccionado':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Preseleccionado</Badge>;
      case 'finalista':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Finalista</Badge>;
      case 'rechazado':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">No Seleccionado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  if (showDetalle && selectedPostulacion) {
    return (
      <DetallePostulacionAdmin
        postulacion={selectedPostulacion}
        onClose={() => {
          setShowDetalle(false);
          setSelectedPostulacion(null);
        }}
        onActualizarEstado={handleActualizarEstado}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
            <Users className="w-8 h-8" />
            Gestión de Registros
          </h1>
          <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
            Administrar y evaluar todos los registros recibidos
          </p>
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="p-6 bg-white border-gray-200">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#04a25c' }}>
                Filtros de Búsqueda
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Refina tu búsqueda de perfiles
              </p>
            </div>

            {/* Primera fila: Oficina Zonal, Oficina de Coordinación, Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Oficina Zonal
                </label>
                <select
                  value={filters.oficinaZonal}
                  onChange={(e) => setFilters({ ...filters, oficinaZonal: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Lima">Lima</option>
                  <option value="Cusco">Cusco</option>
                  <option value="Huánuco">Huánuco</option>
                  <option value="Ayacucho">Ayacucho</option>
                  <option value="Junín">Junín</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Oficina de Coordinación
                </label>
                <select
                  value={filters.oficinaCoordinacion}
                  onChange={(e) => setFilters({ ...filters, oficinaCoordinacion: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                >
                  <option value="">Seleccionar...</option>
                  <option value="OC Lima Norte">OC Lima Norte</option>
                  <option value="OC Lima Sur">OC Lima Sur</option>
                  <option value="OC Cusco">OC Cusco</option>
                  <option value="OC Huánuco">OC Huánuco</option>
                  <option value="OC Ayacucho">OC Ayacucho</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Categoría
                </label>
                <select
                  value={filters.perfil}
                  onChange={(e) => setFilters({ ...filters, perfil: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Extensionista">Extensionista</option>
                  <option value="Técnico de Campo">Técnico de Campo</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Promotor">Promotor</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
            </div>

            {/* Segunda fila: Estado, Fecha Inicio, Fecha Fin */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Estado Perfil
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                >
                  <option value="">Seleccionar...</option>
                  <option value="todas">Todas</option>
                  <option value="abierta">Abierta</option>
                  <option value="proxima">Próxima</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Estado Registro
                </label>
                <select
                  value={filters.estadoPostulacion}
                  onChange={(e) => setFilters({ ...filters, estadoPostulacion: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                >
                  <option value="">Seleccionar...</option>
                  <option value="en-revision">En Revisión</option>
                  <option value="preseleccionado">Preseleccionado</option>
                  <option value="finalista">Finalista</option>
                  <option value="rechazado">No Seleccionado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filters.fechaInicio}
                  onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
                  placeholder="dd/mm/aaaa"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filters.fechaFin}
                  onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
                  placeholder="dd/mm/aaaa"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Búsqueda por texto */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Perfil
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.busqueda}
                  onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                  placeholder="Buscar por nombre de perfil..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700 gap-2 px-6">
                <Search className="w-4 h-4" />
                Buscar
              </Button>
              <Button variant="ghost" onClick={handleClearFilters} className="gap-2 text-gray-700 hover:text-gray-900">
                <X className="w-4 h-4" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm font-semibold text-yellow-700">En Revisión</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {postulaciones.filter((p) => p.estado === 'en-revision').length}
          </p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold text-blue-700">Preseleccionados</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {postulaciones.filter((p) => p.estado === 'preseleccionado').length}
          </p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-semibold text-green-700">Finalistas</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {postulaciones.filter((p) => p.estado === 'finalista').length}
          </p>
        </Card>
        <Card className="p-4 bg-gray-50 border-gray-200">
          <p className="text-sm font-semibold text-gray-700">No Seleccionados</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {postulaciones.filter((p) => p.estado === 'rechazado').length}
          </p>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: '#04a25c' }}>
              Listado de Usuarios Registrados
            </h2>
            <p className="text-sm text-gray-500">
              {filteredPostulaciones.length} {filteredPostulaciones.length === 1 ? 'registro' : 'registros'}
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Persona</TableHead>
                  <TableHead className="font-semibold">DNI</TableHead>
                  <TableHead className="font-semibold">Perfil</TableHead>
                  <TableHead className="font-semibold">Oficina de Coordinación</TableHead>
                  <TableHead className="font-semibold">Categoría</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPostulaciones.map((postulacion) => (
                  <TableRow key={postulacion.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{postulacion.postulante.nombre}</TableCell>
                    <TableCell>{postulacion.postulante.documento}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{postulacion.convocatoria}</div>
                    </TableCell>
                    <TableCell>{postulacion.oficinaZonal}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {postulacion.perfil}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {postulacion.fechaPostulacion}
                    </TableCell>
                    <TableCell>{getEstadoBadge(postulacion.estado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerDetalle(postulacion)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
