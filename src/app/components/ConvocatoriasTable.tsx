import { FileDown, AlertCircle, Send } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface Convocatoria {
  id: string;
  nombre: string;
  oficinaCoordinacion: string;
  perfil: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number; 
  estado: 'abierta' | 'cerrada' | 'proxima'; 
  pdfUrl: string; 
  archivoGuid?: string; 
  estadoId?: number;
} 

interface ConvocatoriasTableProps { 
  convocatorias: Convocatoria[]; 
  onPostular: (convocatoria: Convocatoria) => void; 
  hojaVidaCompleta?: boolean; 
} 

export function ConvocatoriasTable({ convocatorias, onPostular, hojaVidaCompleta = false }: ConvocatoriasTableProps) { 
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierta':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Abierta</Badge>;
      case 'cerrada':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Cerrada</Badge>;
      case 'proxima':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Próxima</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const getDiasRestantesBadge = (dias: number, estado: string) => {
    if (estado === 'cerrada') {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Finalizada</Badge>;
    }
    if (estado === 'proxima') {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Por iniciar</Badge>;
    }
    if (dias <= 3) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          {dias} {dias === 1 ? 'día' : 'días'}
        </Badge>
      );
    }
    if (dias <= 7) {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{dias} días</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{dias} días</Badge>;
  };

  const buildFileUrl = (guid: string) => { 
    const apiBaseUrl = 
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 
      'http://localhost:8087/sirpo/v1'; 
    const params = new URLSearchParams({ guid }); 
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`; 
  }; 

  const handleVerBases = (pdfUrl: string, archivoGuid?: string) => { 
    const url = pdfUrl || (archivoGuid ? buildFileUrl(archivoGuid) : ''); 
    if (!url) return; 
    window.open(url, '_blank', 'noopener,noreferrer'); 
  }; 

  const parseDate = (value: string) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.split('-');
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    if (value.includes('/')) {
      const [dd, mm, yyyy] = value.split('/');
      if (dd && mm && yyyy) {
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
    }
    return null;
  };

  const isWithinRange = (inicio: string, fin: string) => {
    const startDate = parseDate(inicio);
    const endDate = parseDate(fin);
    if (!startDate || !endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return today >= start && today <= end;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#04a25c' }}>Perfiles Disponibles</h2>
            <p className="text-sm text-gray-500 mt-1">
              Se encontraron {convocatorias.length} {convocatorias.length === 1 ? 'perfil' : 'perfiles'}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Perfil</TableHead>
                <TableHead className="font-semibold">Oficina de Coordinación</TableHead>
                <TableHead className="font-semibold">Categoría</TableHead>
                <TableHead className="font-semibold">Fecha Inicio</TableHead>
                <TableHead className="font-semibold">Fecha Fin</TableHead>
                <TableHead className="font-semibold text-center">Acciones</TableHead> 
              </TableRow>
            </TableHeader>
            <TableBody>
              {convocatorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12"> 
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-gray-400" />
                      <div>
                        <p className="text-gray-900 font-medium">No se encontraron perfiles</p>
                        <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                convocatorias.map((conv) => (
                  <TableRow key={conv.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{conv.nombre}</TableCell>
                    <TableCell>{conv.oficinaCoordinacion}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {conv.perfil}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{conv.fechaInicio}</TableCell>
                    <TableCell className="text-sm text-gray-600">{conv.fechaFin}</TableCell>
                    <TableCell> 
                      <div className="flex items-center justify-center gap-2">
                        {(conv.pdfUrl || conv.archivoGuid) && ( 
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleVerBases(conv.pdfUrl, conv.archivoGuid)} 
                            className="h-8 w-8 p-0" 
                            title="Ver bases del perfil" 
                          > 
                            <FileDown className="w-4 h-4" /> 
                          </Button> 
                        )} 

                        {conv.estadoId === 1 && isWithinRange(conv.fechaInicio, conv.fechaFin) && hojaVidaCompleta ? ( 
                          <Button 
                            size="sm" 
                            onClick={() => onPostular(conv)} 
                            className="h-8 px-3 bg-green-600 hover:bg-green-700 gap-2" 
                          > 
                            <Send className="w-3.5 h-3.5" /> 
                            Registrarse  
                          </Button>  
                        ) : ( 
                          <TooltipProvider> 
                            <Tooltip> 
                              <TooltipTrigger asChild> 
                                <div className="inline-block"> 
                                  <Button 
                                    size="sm" 
                                    disabled 
                                    className="h-8 px-3 gap-2" 
                                  > 
                                    <Send className="w-3.5 h-3.5" /> 
                                    Registrarse 
                                  </Button> 
                                </div> 
                              </TooltipTrigger> 
                              <TooltipContent> 
                                <p> 
                                  {!hojaVidaCompleta
                                    ? 'Completa tu Hoja de Vida para registrarte'
                                    : conv.estadoId !== 1
                                    ? 'Este perfil está inactivo'
                                    : 'Este perfil está fuera de vigencia'} 
                                </p> 
                              </TooltipContent> 
                            </Tooltip> 
                          </TooltipProvider> 
                        )} 
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
