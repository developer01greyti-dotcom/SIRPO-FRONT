import { Calendar, MapPin, Briefcase, FileText, Clock, CheckCircle, XCircle, Send, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Postulacion {
  id: string;
  convocatoria: string;
  oficinaZonal: string;
  oficinaCoordinacion: string;
  perfil: string;
  fechaPostulacion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

interface MisPostulacionesProps {
  onVerDetalle: (postulacion: Postulacion) => void;
}

const mockPostulaciones: Postulacion[] = [
  {
    id: '1',
    convocatoria: 'Convocatoria Extensionista Agrícola - Lima Norte 2026',
    oficinaZonal: 'Lima',
    oficinaCoordinacion: 'Lima Norte',
    perfil: 'Extensionista',
    fechaPostulacion: '05/01/2026',
    fechaInicio: '01/02/2026',
    fechaFin: '31/03/2026',
    estado: 'registrado',
  },
  {
    id: '2',
    convocatoria: 'Convocatoria Coordinador Regional - Huánuco',
    oficinaZonal: 'Huánuco',
    oficinaCoordinacion: 'Huánuco Central',
    perfil: 'Coordinador',
    fechaPostulacion: '03/01/2026',
    fechaInicio: '01/02/2026',
    fechaFin: '31/03/2026',
    estado: 'preseleccionado',
  },
  {
    id: '3',
    convocatoria: 'Convocatoria Técnico de Campo - Cusco',
    oficinaZonal: 'Cusco',
    oficinaCoordinacion: 'Cusco Sur',
    perfil: 'Técnico de Campo',
    fechaPostulacion: '28/12/2025',
    fechaInicio: '01/02/2026',
    fechaFin: '31/03/2026',
    estado: 'rechazado',
  },
];

export function MisPostulaciones({ onVerDetalle }: MisPostulacionesProps) {
  const normalizeEstado = (estado: string) => {
    const normalized = (estado || '').toLowerCase().trim();
    if (normalized === '1') return 'cumple';
    if (normalized === '2') return 'no cumple';
    if (normalized === '0') return 'registrado';
    const compact = normalized.replace(/[-\s]/g, '');
    if (compact.includes('nocumple')) return 'no cumple';
    if (compact.includes('cumple')) return 'cumple';
    if (compact.includes('registr') || compact.includes('revision')) return 'registrado';
    return normalized;
  };

  const getEstadoBadge = (estado: string) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case 'registrado':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="w-3 h-3" />
            Registrado
          </Badge>
        );
      case 'cumple':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Cumple
          </Badge>
        );
      case 'no cumple':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1">
            <XCircle className="w-3 h-3" />
            No cumple
          </Badge>
        );
      case 'preseleccionado':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Preseleccionado
          </Badge>
        );
      case 'finalista':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Finalista
          </Badge>
        );
      case 'rechazado':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1">
            <XCircle className="w-3 h-3" />
            No Seleccionado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
          <Send className="w-8 h-8" />
          Mis Postulaciones
        </h1>
        <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>Seguimiento de todas tus postulaciones realizadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-600">Registrado</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-600">Preseleccionado</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-600">No Seleccionado</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-6">
        <div className="space-y-4">
          <h4 className="text-lg font-bold" style={{ color: '#04a25c' }}>Historial de Postulaciones</h4>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Convocatoria</TableHead>
                  <TableHead className="font-semibold">Oficina Zonal</TableHead>
                  <TableHead className="font-semibold">Oficina Coordinación</TableHead>
                  <TableHead className="font-semibold">Perfil</TableHead>
                  <TableHead className="font-semibold">Fecha de Postulación</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPostulaciones.map((postulacion) => (
                  <TableRow key={postulacion.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium max-w-xs">
                      {postulacion.convocatoria}
                    </TableCell>
                    <TableCell>{postulacion.oficinaZonal}</TableCell>
                    <TableCell>{postulacion.oficinaCoordinacion}</TableCell>
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
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => onVerDetalle(postulacion)}>
                          <Eye className="w-4 h-4" />
                          Ver Detalles
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
