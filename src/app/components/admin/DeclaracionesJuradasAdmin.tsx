import { useEffect, useMemo, useState } from 'react';
import { FileText, Save, RotateCcw, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import type { DeclaracionTipo } from '../../api/declaraciones';
import { fetchDeclaracionTipos, updateDeclaracionTipo } from '../../api/declaraciones';
import { fetchHvRefArchivo, saveHvRefArchivo, type HvRefArchivo } from '../../api/hvRefArchivo';

type DeclaracionItem = {
  id: string;
  idDeclaracionTipo?: number;
  titulo: string;
  descripcion: string;
  plantillaNombre?: string;
  plantillaGuid?: string;
  idHvRefArchivo?: number;
  plantillaFile?: File | null;
};

const DEFAULT_DECLARACIONES: DeclaracionItem[] = [
  {
    id: 'declaracion-1',
    idDeclaracionTipo: 1,
    titulo: 'Declaracion Jurada 1',
    descripcion: 'Plantilla general para declaraciones juradas.',
    plantillaNombre: '',
  },
  {
    id: 'declaracion-2',
    idDeclaracionTipo: 2,
    titulo: 'Declaracion Jurada 2',
    descripcion: 'Plantilla para validacion de datos del postulante.',
    plantillaNombre: '',
  },
  {
    id: 'declaracion-3',
    idDeclaracionTipo: 3,
    titulo: 'Declaracion Jurada 3',
    descripcion: 'Plantilla de conformidad y compromiso.',
    plantillaNombre: '',
  },
];

const buildNewDeclaracion = (index: number): DeclaracionItem => ({
  id: `declaracion-${index}-${Date.now()}`,
  idDeclaracionTipo: 0,
  titulo: `Declaracion Jurada ${index}`,
  descripcion: 'Plantilla para declaraciones juradas.',
  plantillaNombre: '',
});

type DeclaracionesJuradasAdminProps = {
  adminUserId?: number;
};

const pickLatestArchivo = (items: HvRefArchivo[]) => {
  if (!items || items.length === 0) return null;
  let best = items[0];
  let bestId = Number(best.idHvRefArchivo || 0);
  for (const item of items) {
    const id = Number(item.idHvRefArchivo || 0);
    if (id > bestId) {
      best = item;
      bestId = id;
    }
  }
  return best;
};

const mapDeclaracionTipos = (items: DeclaracionTipo[]): DeclaracionItem[] => {
  if (!items || items.length === 0) return DEFAULT_DECLARACIONES;
  return items.map((item, index) => ({
    id: String(item.idDeclaracionTipo ?? index),
    idDeclaracionTipo: item.idDeclaracionTipo,
    titulo: item.nombre || `Declaracion Jurada ${index + 1}`,
    descripcion: item.descripcion || '',
    plantillaNombre: '',
    plantillaGuid: '',
    idHvRefArchivo: 0,
  }));
};

export function DeclaracionesJuradasAdmin({ adminUserId = 0 }: DeclaracionesJuradasAdminProps) {
  const [declaraciones, setDeclaraciones] = useState<DeclaracionItem[]>(DEFAULT_DECLARACIONES);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_DECLARACIONES[0].id);
  const selected = useMemo(
    () => declaraciones.find((item) => item.id === selectedId) ?? declaraciones[0],
    [declaraciones, selectedId],
  );
  const [editedTitulo, setEditedTitulo] = useState(selected.titulo);
  const [editedDescripcion, setEditedDescripcion] = useState(selected.descripcion);
  const [editedPlantilla, setEditedPlantilla] = useState<File | null>(selected.plantillaFile ?? null);
  const [editedPlantillaNombre, setEditedPlantillaNombre] = useState<string>(selected.plantillaNombre ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      let baseItems = DEFAULT_DECLARACIONES;
      try {
        const tipos = await fetchDeclaracionTipos();
        const mapped = mapDeclaracionTipos(tipos);
        if (mapped.length > 0) {
          baseItems = mapped;
        }
      } catch {
        baseItems = DEFAULT_DECLARACIONES;
      }

      const enriched = await Promise.all(
        baseItems.map(async (item) => {
          if (!item.idDeclaracionTipo) return item;
          try {
            const archivos = await fetchHvRefArchivo('DECL_TIPO', item.idDeclaracionTipo);
            const latest = pickLatestArchivo(archivos);
            return {
              ...item,
              plantillaNombre: latest?.nombreOrig || latest?.nombreOriginal || '',
              plantillaGuid: latest?.guid || '',
              idHvRefArchivo: latest?.idHvRefArchivo || 0,
            };
          } catch {
            return item;
          }
        }),
      );

      if (active) {
        setDeclaraciones(enriched);
        setSelectedId(enriched[0]?.id || DEFAULT_DECLARACIONES[0].id);
        setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    setEditedTitulo(selected.titulo);
    setEditedDescripcion(selected.descripcion);
    setEditedPlantilla(selected.plantillaFile ?? null);
    setEditedPlantillaNombre(selected.plantillaNombre ?? '');
  }, [selectedId, selected?.titulo, selected?.descripcion, selected?.plantillaNombre]);

  const handleSelect = (id: string) => {
    const current = declaraciones.find((item) => item.id === id);
    if (!current) return;
    setSelectedId(id);
    setEditedTitulo(current.titulo);
    setEditedDescripcion(current.descripcion);
    setEditedPlantilla(current.plantillaFile ?? null);
    setEditedPlantillaNombre(current.plantillaNombre ?? '');
  };

  const handleGuardar = async () => {
    if (isSaving) return;
    if (!selected) return;
    if (!selected.idDeclaracionTipo) {
      toast.error('No se puede guardar un nuevo espacio hasta registrarlo en la base de datos.');
      return;
    }
    setIsSaving(true);
    try {
      if (!adminUserId) {
        toast.error('No se pudo identificar al usuario administrador.');
        return;
      }

      const updated = await updateDeclaracionTipo({
        idDeclaracionTipo: selected.idDeclaracionTipo,
        nombre: editedTitulo,
        descripcion: editedDescripcion,
        usuarioAccion: adminUserId,
      });
      if (!updated) {
        toast.error('No se pudo guardar el titulo y descripcion.');
        return;
      }

      if (editedPlantilla) {
        const extension = editedPlantilla.name.split('.').pop() || '';
        await saveHvRefArchivo(editedPlantilla, {
          idHvRefArchivo: Number(selected.idHvRefArchivo || 0),
          idHojaVida: 0,
          entidad: 'DECL_TIPO',
          idEntidad: selected.idDeclaracionTipo,
          tipoArchivo: 'DECL_TIPO',
          nombreOrig: editedPlantilla.name,
          ext: extension,
          mime: editedPlantilla.type || 'application/octet-stream',
          sizeBytes: editedPlantilla.size,
          ruta: 'hv',
          usuarioAccion: adminUserId,
        });
      }

      let plantillaNombre = editedPlantillaNombre;
      let plantillaGuid = selected.plantillaGuid;
      let idHvRefArchivo = selected.idHvRefArchivo;
      try {
        const archivos = await fetchHvRefArchivo('DECL_TIPO', selected.idDeclaracionTipo);
        const latest = pickLatestArchivo(archivos);
        plantillaNombre = latest?.nombreOrig || latest?.nombreOriginal || plantillaNombre;
        plantillaGuid = latest?.guid || plantillaGuid;
        idHvRefArchivo = latest?.idHvRefArchivo || idHvRefArchivo;
      } catch {
        // ignore
      }

      setDeclaraciones((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                titulo: editedTitulo,
                descripcion: editedDescripcion,
                plantillaFile: editedPlantilla,
                plantillaNombre,
                plantillaGuid,
                idHvRefArchivo,
              }
            : item,
        ),
      );
      toast.success('Declaracion guardada exitosamente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestaurar = () => {
    if (confirm('Estas seguro de restaurar la declaracion a su valor anterior?')) {
      const current = declaraciones.find((item) => item.id === selectedId);
      if (!current) return;
      setEditedTitulo(current.titulo);
      setEditedDescripcion(current.descripcion);
      setEditedPlantilla(current.plantillaFile ?? null);
      setEditedPlantillaNombre(current.plantillaNombre ?? '');
    }
  };

  const handleAgregar = () => {
    const nextIndex = declaraciones.length + 1;
    const nueva = buildNewDeclaracion(nextIndex);
    setDeclaraciones((prev) => [...prev, nueva]);
    setSelectedId(nueva.id);
    setEditedTitulo(nueva.titulo);
    setEditedDescripcion(nueva.descripcion);
    setEditedPlantilla(null);
    setEditedPlantillaNombre('');
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
            <FileText className="w-8 h-8" />
            Declaraciones Juradas
          </h1>
          <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
            Configurar plantillas Word para declaraciones juradas
          </p>
        </div>
        <Button onClick={handleAgregar} className="bg-green-600 hover:bg-green-700 gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Espacio
        </Button>
      </div>

      <Tabs value={selectedId} onValueChange={handleSelect}>
        <TabsList className="flex flex-wrap gap-2 mb-6">
          {declaraciones.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.titulo}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
                  Plantilla de Declaracion
                </h3>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Titulo
                </label>
                <input
                  type="text"
                  value={editedTitulo}
                  onChange={(e) => setEditedTitulo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Descripcion
                </label>
                <textarea
                  rows={3}
                  value={editedDescripcion}
                  onChange={(e) => setEditedDescripcion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Plantilla Word
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id={`plantilla-${selectedId}`}
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setEditedPlantilla(file);
                      setEditedPlantillaNombre(file?.name ?? '');
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor={`plantilla-${selectedId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Cargar Word
                  </label>
                  {editedPlantillaNombre ? (
                    <span className="text-sm text-gray-600 truncate">{editedPlantillaNombre}</span>
                  ) : (
                    <span className="text-sm text-gray-400">Sin archivo</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">Variables disponibles (usar llaves):</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>- {'{'}nombre{'}'} - Nombres del postulante</div>
                  <div>- {'{'}apellidos{'}'} - Apellidos del postulante</div>
                  <div>- {'{'}apellido paterno{'}'} - Apellido paterno</div>
                  <div>- {'{'}apellido materno{'}'} - Apellido materno</div>
                  <div>- {'{'}documento{'}'} - Numero de documento</div>
                  <div>- {'{'}correo{'}'} - Correo electronico</div>
                  <div>- {'{'}ruc{'}'} - RUC</div>
                  <div>- {'{'}direccion{'}'} - Direccion</div>
                  <div>- {'{'}telefono{'}'} - Telefono / celular</div>
                  <div>- {'{'}fecha{'}'} - Fecha actual</div>
                  <div>- {'{'}anio{'}'} - Ano actual</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={handleGuardar}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </Button>
                <Button
                  onClick={handleRestaurar}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Defecto
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
              Estado de la Plantilla
            </h3>
            <div className="space-y-4">
              {isLoading && (
                <div className="text-sm text-gray-500">Cargando plantillas...</div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Titulo:</p>
                <p className="font-semibold text-gray-900">{editedTitulo}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Descripcion:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{editedDescripcion}</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Nota:</strong> Esta pantalla guarda el titulo, la descripcion y la plantilla Word.
                  El usuario cargara el Word con variables y el sistema completara los datos automaticamente.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
