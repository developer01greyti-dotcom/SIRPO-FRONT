import { Search, X, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  fetchOficinaCoordinacionList, 
  fetchPerfilDropdown, 
  type DropdownItem, 
  type OficinaZonalCoordinacionItem, 
} from '../api/catalogos'; 

interface FilterCardProps {
  onSearch: (filters: any) => void;
  onClear: () => void;
}

export function FilterCard({ onSearch, onClear }: FilterCardProps) {
  const [perfilOptions, setPerfilOptions] = useState<DropdownItem[]>([]);
  const [oficinaOptions, setOficinaOptions] = useState<OficinaZonalCoordinacionItem[]>([]); 
  const [oficinaQuery, setOficinaQuery] = useState(''); 
  const [isOficinaLoading, setIsOficinaLoading] = useState(false); 
  const [showFilters, setShowFilters] = useState(true); 
  const [filters, setFilters] = useState({
    oficinaCoordinacion: '',
    perfil: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    busqueda: '',
  });

  useEffect(() => {
    let isActive = true;
    const loadCatalogs = async () => {
      try {
        const [perfiles] = await Promise.all([ 
          fetchPerfilDropdown(), 
        ]); 
        if (!isActive) return; 
        setPerfilOptions(perfiles || []); 
      } catch { 
        if (!isActive) return; 
        setPerfilOptions([]); 
      } 
    };
    loadCatalogs();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | undefined;

    const loadOficinas = async () => {
      if (oficinaQuery.trim().length < 3) {
        if (isActive) {
          setOficinaOptions([]);
        }
        return;
      }
      setIsOficinaLoading(true);
      try {
        const items = await fetchOficinaCoordinacionList(oficinaQuery.trim());
        if (isActive) {
          setOficinaOptions(items || []);
        }
      } catch {
        if (isActive) {
          setOficinaOptions([]);
        }
      } finally {
        if (isActive) {
          setIsOficinaLoading(false);
        }
      }
    };

    timeoutId = window.setTimeout(loadOficinas, 300);
    return () => {
      isActive = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [oficinaQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      oficinaCoordinacion: '',
      perfil: '',
      estado: '',
      fechaInicio: '',
      fechaFin: '',
      busqueda: '',
    });
    setOficinaQuery('');
    setOficinaOptions([]);
    onClear();
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4"> 
            <div> 
              <h2 className="text-lg font-bold" style={{ color: '#04a25c' }}>Filtros de Búsqueda</h2> 
              <p className="text-sm text-gray-500 mt-1">Refina tu búsqueda de perfiles</p>  
            </div> 
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters((prev) => !prev)} 
            > 
              {showFilters ? "Ocultar filtro de búsqueda" : "Mostrar filtro de búsqueda"} 
            </Button> 
          </div> 

          {showFilters && (  
          <> 
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">  
            <div className="space-y-2 md:col-span-4">  
              <Label htmlFor="oficinaCoordinacion">Oficina de Coordinación</Label>
              <Select
                value={filters.oficinaCoordinacion}
                onValueChange={(value) => {
                  const selected = oficinaOptions.find(
                    (item) => String(item.idOficinaCoordinacion) === value,
                  );
                  setFilters((prev) => ({ ...prev, oficinaCoordinacion: value }));
                  if (selected) {
                    setOficinaQuery(selected.oficinaCoordinacion);
                  }
                }}
              >
                <SelectTrigger id="oficinaCoordinacion">
                  <SelectValue placeholder="Buscar oficina de coordinación" />
                </SelectTrigger>
                <SelectContent
                  onOpenAutoFocus={(event) => event.preventDefault()}
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  <div className="p-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Escribe al menos 3 caracteres"
                        value={oficinaQuery}
                        onChange={(e) => {
                          const value = e.target.value;
                          setOficinaQuery(value);
                          if (filters.oficinaCoordinacion) {
                            setFilters((prev) => ({ ...prev, oficinaCoordinacion: '' }));
                          }
                        }}
                        autoFocus
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-[85%]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-[15%]"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setOficinaQuery('');
                          setFilters((prev) => ({ ...prev, oficinaCoordinacion: '' }));
                          setOficinaOptions([]);
                        }}
                      >
                        Limpiar
                      </Button>
                    </div>
                  </div>
                  {oficinaQuery.trim().length < 3 ? (
                    <SelectItem value="min" disabled>
                      Ingrese al menos 3 caracteres
                    </SelectItem>
                  ) : isOficinaLoading ? (
                    <SelectItem value="loading" disabled>
                      Buscando...
                    </SelectItem>
                  ) : oficinaOptions.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Sin resultados
                    </SelectItem>
                  ) : (
                    oficinaOptions.map((item) => (
                      <SelectItem key={item.idOficinaCoordinacion} value={String(item.idOficinaCoordinacion)}>
                        {item.oficinaCoordinacion}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-4"> 
              <Label htmlFor="perfil">Categoría</Label> 
              <Select
                value={filters.perfil || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, perfil: value === 'all' ? '' : value }))
                }
              >
                <SelectTrigger id="perfil">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {perfilOptions.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2"> 
              <Label htmlFor="fechaInicio">Fecha Inicio</Label> 
              <div className="relative"> 
                <Input 
                  type="date"
                  id="fechaInicio"
                  name="fechaInicio"
                  className="pl-10"
                  value={filters.fechaInicio}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2"> 
              <Label htmlFor="fechaFin">Fecha Fin</Label> 
              <div className="relative"> 
                <Input 
                  type="date"
                  id="fechaFin"
                  name="fechaFin"
                  className="pl-10"
                  value={filters.fechaFin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fechaFin: e.target.value }))}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2"> 
            <Label htmlFor="busqueda">Perfil</Label> 
            <div className="relative"> 
              <Input 
                type="text" 
                id="busqueda" 
                name="busqueda" 
                placeholder="Buscar por título de perfil..." 
                className="pl-10" 
                value={filters.busqueda}
                onChange={(e) => setFilters((prev) => ({ ...prev, busqueda: e.target.value }))}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2"> 
            <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700"> 
              <Search className="w-4 h-4" /> 
              Buscar 
            </Button> 
            <Button type="button" variant="outline" onClick={handleClear} className="gap-2"> 
              <X className="w-4 h-4" /> 
              Limpiar filtros 
            </Button> 
          </div>  
          </> 
          )}  
        </div>
      </form>
    </Card>
  );
}
