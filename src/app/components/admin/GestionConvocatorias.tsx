import { useEffect, useState } from "react";
import { Briefcase, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ConvocatoriaForm } from "./ConvocatoriaForm";
import { deleteConvocatoria, fetchConvocatoriasList, type ConvocatoriaListItem } from "../../api/convocatorias";
import { fetchEstadoConvocatoriaDropdown, fetchOficinaCoordinacionList, fetchPerfilDropdown, type DropdownItem, type OficinaZonalCoordinacionItem } from "../../api/catalogos";

interface ConvocatoriaAdmin extends ConvocatoriaListItem {
  codigo?: string;
  titulo?: string;
  idPerfil?: number | string;
  idOficinaZonal?: number | string;
  idOficinaCoordinacion?: number | string;
  tipoContrato?: string;
  ubicacion?: string;
  numeroVacantes?: number;
  requisitosMinimos?: string;
  funcionesPrincipales?: string;
  salarioMin?: number;
  salarioMax?: number;
  idArchivoBases?: number;
}

interface GestionConvocatoriasProps {
  adminUserId?: number;
}

export function GestionConvocatorias({ adminUserId = 0 }: GestionConvocatoriasProps) {
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<ConvocatoriaAdmin | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [perfilOptions, setPerfilOptions] = useState<DropdownItem[]>([]);
  const [estadoOptions, setEstadoOptions] = useState<DropdownItem[]>([]);
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
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    convocatoria: ConvocatoriaAdmin | null;
  }>({ open: false, convocatoria: null });

  const loadConvocatorias = async (overrideFilters = filters) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchConvocatoriasList(overrideFilters);
      setConvocatorias(data);
    } catch (error) {
      setConvocatorias([]);
      setLoadError("No se pudo cargar el listado de perfiles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConvocatorias();
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadCatalogs = async () => {
      try {
        const [perfiles, estados] = await Promise.all([
          fetchPerfilDropdown(),
          fetchEstadoConvocatoriaDropdown(),
        ]);
        if (!isActive) return;
        setPerfilOptions(perfiles || []);
        setEstadoOptions(estados || []);
      } catch (error) {
        if (!isActive) return;
        setPerfilOptions([]);
        setEstadoOptions([]);
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
      } catch (error) {
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

  const normalizeEstado = (estado: string) => {
    const value = (estado || "").toLowerCase();
    if (value.includes("abier")) return "abierta";
    if (value.includes("cerr")) return "cerrada";
    if (value.includes("prox") || value.includes("próx")) return "proxima";
    return value;
  };

  const handleNuevaConvocatoria = () => {
    setSelectedConvocatoria(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditarConvocatoria = (convocatoria: ConvocatoriaAdmin) => {
    setSelectedConvocatoria(convocatoria);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleEliminarConvocatoria = (convocatoria: ConvocatoriaAdmin) => {
    setConfirmState({ open: true, convocatoria });
  };

  const handleConfirmDelete = async () => {
    const convocatoria = confirmState.convocatoria;
    if (!convocatoria) return;
    const idConvocatoria = Number(
      convocatoria.idConvocatoria ?? convocatoria.id,
    );
    try {
      const ok = await deleteConvocatoria(idConvocatoria, adminUserId);
      if (!ok) {
        alert("No se pudo eliminar el perfil.");
        return;
      }
      await loadConvocatorias();
      setConfirmState({ open: false, convocatoria: null });
    } catch (error) {
      alert("No se pudo eliminar el perfil.");
    }
  };

  const getEstadoBadge = (estado: string) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case "abierta":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Abierta</Badge>;
      case "cerrada":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Cerrada</Badge>;
      case "proxima":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">próxima</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const handleBuscar = async () => {
    await loadConvocatorias(filters);
  };

  const handleLimpiar = async () => {
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
    await loadConvocatorias({
      oficinaCoordinacion: '',
      perfil: '',
      estado: '',
      fechaInicio: '',
      fechaFin: '',
      busqueda: '',
    });
  };

  if (showForm) {
    return (
      <ConvocatoriaForm
        convocatoria={selectedConvocatoria}
        isEditing={isEditing}
        usuarioAccion={adminUserId}
        onGuardar={async () => {
          await loadConvocatorias();
          setShowForm(false);
          setSelectedConvocatoria(null);
        }}
        onCancelar={() => {
          setShowForm(false);
          setSelectedConvocatoria(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "#04a25c" }}>
            <Briefcase className="w-8 h-8" />
            Gestión de Perfiles
          </h1>
          <p className="mt-2 font-bold" style={{ color: "#108cc9" }}>
            Administrar perfiles laborales de DEVIDA
          </p>
        </div>
        <Button onClick={handleNuevaConvocatoria} className="bg-green-600 hover:bg-green-700 gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Perfil
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "#04a25c" }}>
              Listado de Perfiles
            </h2>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                {showFilters ? "Ocultar filtro de búsqueda" : "Mostrar filtro de búsqueda"} 
              </Button>
              <p className="text-sm text-gray-500">
                {convocatorias.length} {convocatorias.length === 1 ? "perfil" : "perfiles"}
              </p>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Oficina de Coordinación</label>
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
                  <SelectTrigger>
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
                            const input = document.querySelector('input[placeholder="Escribe al menos 3 caracteres"]') as HTMLInputElement | null;
                            input?.focus();
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

              <div className="space-y-2"> 
                <label className="block text-sm font-semibold text-gray-700">Categoría de Perfil</label>
                <select
                  value={filters.perfil}
                  onChange={(e) => setFilters((prev) => ({ ...prev, perfil: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos</option>
                  {perfilOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Estado</label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos</option>
                  {estadoOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Fecha inicio</label>
                <Input
                  type="date"
                  value={filters.fechaInicio}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Fecha fin</label>
                <Input
                  type="date"
                  value={filters.fechaFin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fechaFin: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Búsqueda (Título)</label>
                <Input
                  type="text"
                  value={filters.busqueda}
                  onChange={(e) => setFilters((prev) => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Ej: Extensionista"
                />
              </div>
            </div>
          )}

          {showFilters && (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={handleLimpiar}>
                Limpiar filtros
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleBuscar}>
                Buscar
              </Button>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50"> 
                  <TableHead className="font-semibold">Perfil</TableHead> 
                  <TableHead className="font-semibold">Categoría</TableHead> 
                  <TableHead className="font-semibold">Oficina de Coordinación</TableHead> 
                  <TableHead className="font-semibold">Fecha Inicio</TableHead> 
                  <TableHead className="font-semibold">Fecha Fin</TableHead> 
                  <TableHead className="font-semibold">Estado</TableHead> 
                  <TableHead className="font-semibold text-center">Acciones</TableHead> 
                </TableRow> 
              </TableHeader> 
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">
                      Cargando perfiles...
                    </TableCell>
                  </TableRow>
                ) : loadError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-red-600 py-6">
                      {loadError}
                    </TableCell>
                  </TableRow>
                ) : convocatorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">
                      No se encontraron perfiles.
                    </TableCell>
                  </TableRow>
                ) : (
                  convocatorias.map((conv) => (
                    <TableRow key={conv.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium max-w-xs"> 
                        <div className="truncate">{conv.nombre}</div> 
                      </TableCell> 
                      <TableCell> 
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700"> 
                          {conv.perfil} 
                        </span> 
                      </TableCell> 
                      <TableCell>{conv.oficinaCoordinacion}</TableCell> 
                      <TableCell className="text-sm text-gray-600">{conv.fechaInicio}</TableCell> 
                      <TableCell className="text-sm text-gray-600">{conv.fechaFin}</TableCell> 
                      <TableCell>{getEstadoBadge(conv.estado)}</TableCell> 
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {conv.pdfUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(conv.pdfUrl, "_blank", "noopener,noreferrer")}
                              className="h-8 w-8 p-0"
                              title="Ver bases"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarConvocatoria(conv)}
                            className="h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarConvocatoria(conv)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      <AlertDialog
        open={confirmState.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmState({ open: false, convocatoria: null });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState.convocatoria
                ? `¿Está seguro de eliminar el perfil "${confirmState.convocatoria.nombre}"? Esta acción no se puede deshacer.`
                : "¿Está seguro de eliminar este perfil? Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmDelete}
            >
              Sí
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


