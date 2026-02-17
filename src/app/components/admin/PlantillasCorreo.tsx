import { useEffect, useState } from 'react';
import { Mail, Save, Eye, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  fetchPlantillasCorreo,
  upsertPlantillaCorreo,
  type PlantillaCorreoItem,
} from '../../api/plantillasCorreo';

type PlantillaKey = 'bienvenida' | 'confirmacionPostulacion' | 'cambioEstado' | 'resultadoFinal';

type PlantillaState = {
  idPlantilla?: number;
  codigo: string;
  nombre: string;
  asunto: string;
  contenido: string;
  activo: number;
  version: number;
};

const DEFAULT_PLANTILLAS: Record<PlantillaKey, PlantillaState> = {
  bienvenida: {
    codigo: 'BIENVENIDA',
    nombre: 'Bienvenida',
    asunto: 'Bienvenido a SIRPO - DEVIDA',
    contenido: `Estimado/a {{nombre}},

Bienvenido al Sistema de Registro de Profesionales y/o Técnicos para Trabajo de Campo en el Marco del PP PIRDAIS (SIRPO) de DEVIDA.

Tu cuenta ha sido creada exitosamente. Ahora puedes:
- Completar tu hoja de vida
- Registrarte a servicios
- Hacer seguimiento a tus registros

Para comenzar, ingresa al sistema con las credenciales que registraste.

Atentamente,
Equipo DEVIDA`,
    activo: 1,
    version: 1,
  },
  confirmacionPostulacion: {
    codigo: 'CONFIRMACION_POSTULACION',
    nombre: 'Confirmación de Postulación',
    asunto: 'Confirmación de Registro - {{convocatoria}}',
    contenido: `Estimado/a {{nombre}},

Hemos recibido tu registro al servicio:
{{convocatoria}}

Número de registro: {{numeroPostulacion}}
Fecha de registro: {{fechaPostulacion}}

Tu registro está en estado: EN REVISIÓN

Recibirás notificaciones sobre cualquier cambio en el estado de tu registro.

Atentamente,
Equipo DEVIDA`,
    activo: 1,
    version: 1,
  },
  cambioEstado: {
    codigo: 'CAMBIO_ESTADO',
    nombre: 'Cambio de Estado',
    asunto: 'Actualización de Estado - {{convocatoria}}',
    contenido: `Estimado/a {{nombre}},

Te informamos que el estado de tu registro ha sido actualizado:

Servicio: {{convocatoria}}
Nuevo estado: {{nuevoEstado}}
Fecha de actualización: {{fecha}}

{{mensaje}}

Para más información, ingresa a tu cuenta en SIRPO.

Atentamente,
Equipo DEVIDA`,
    activo: 1,
    version: 1,
  },
  resultadoFinal: {
    codigo: 'RESULTADO_FINAL',
    nombre: 'Resultado Final',
    asunto: 'Resultado Final - {{convocatoria}}',
    contenido: `Estimado/a {{nombre}},

Te informamos el resultado final de tu registro al servicio:
{{convocatoria}}

Estado: {{estadoFinal}}

{{mensajeResultado}}

Agradecemos tu participación en el proceso de selección.

Atentamente,
Equipo DEVIDA`,
    activo: 1,
    version: 1,
  },
};

const cloneDefaultPlantillas = (): Record<PlantillaKey, PlantillaState> => ({
  bienvenida: { ...DEFAULT_PLANTILLAS.bienvenida },
  confirmacionPostulacion: { ...DEFAULT_PLANTILLAS.confirmacionPostulacion },
  cambioEstado: { ...DEFAULT_PLANTILLAS.cambioEstado },
  resultadoFinal: { ...DEFAULT_PLANTILLAS.resultadoFinal },
});

const resolvePlantillaKey = (item: PlantillaCorreoItem): PlantillaKey | null => {
  const raw = `${item.codigo || ''} ${item.nombre || ''}`.toLowerCase();
  if (raw.includes('bienven')) return 'bienvenida';
  if (raw.includes('confirm') || raw.includes('registro')) return 'confirmacionPostulacion';
  if (raw.includes('cambio') || raw.includes('estado')) return 'cambioEstado';
  if (raw.includes('resultado') || raw.includes('final')) return 'resultadoFinal';
  return null;
};

const mergePlantillasFromApi = (
  items: PlantillaCorreoItem[],
): Record<PlantillaKey, PlantillaState> => {
  const next = cloneDefaultPlantillas();
  items.forEach((item) => {
    const key = resolvePlantillaKey(item);
    if (!key) return;
    const base = next[key];
    next[key] = {
      ...base,
      idPlantilla: item.idPlantilla > 0 ? item.idPlantilla : base.idPlantilla,
      codigo: item.codigo || base.codigo,
      nombre: item.nombre || base.nombre,
      asunto: item.asunto || base.asunto,
      contenido: item.cuerpo || base.contenido,
      activo: Number.isFinite(item.activo) ? item.activo : base.activo,
      version: item.version > 0 ? item.version : base.version,
    };
  });
  return next;
};

interface PlantillasCorreoProps {
  adminUserId?: number;
}

export function PlantillasCorreo({ adminUserId = 0 }: PlantillasCorreoProps) {
  const [plantillas, setPlantillas] = useState<Record<PlantillaKey, PlantillaState>>(
    () => cloneDefaultPlantillas(),
  );

  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaKey>('bienvenida');
  const [editedAsunto, setEditedAsunto] = useState(DEFAULT_PLANTILLAS.bienvenida.asunto);
  const [editedContenido, setEditedContenido] = useState(DEFAULT_PLANTILLAS.bienvenida.contenido);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const loadPlantillas = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchPlantillasCorreo();
        if (!isActive) return;
        if (data.length === 0) {
          setIsLoading(false);
          return;
        }
        const merged = mergePlantillasFromApi(data);
        setPlantillas(merged);
        const current = merged[selectedPlantilla] ?? merged.bienvenida;
        setEditedAsunto(current.asunto);
        setEditedContenido(current.contenido);
      } catch (error) {
        if (!isActive) return;
        setLoadError('No se pudieron cargar las plantillas.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };
    loadPlantillas();
    return () => {
      isActive = false;
    };
  }, []);

  const handlePlantillaChange = (key: PlantillaKey) => {
    setSelectedPlantilla(key);
    setEditedAsunto(plantillas[key].asunto);
    setEditedContenido(plantillas[key].contenido);
    setShowPreview(false);
  };

  const handleGuardar = async () => {
    if (isSaving) return;
    const current = plantillas[selectedPlantilla];
    setIsSaving(true);
    try {
      const result = await upsertPlantillaCorreo({
        idPlantilla: current.idPlantilla ?? 0,
        codigo: current.codigo,
        nombre: current.nombre,
        asunto: editedAsunto,
        cuerpo: editedContenido,
        activo: current.activo ?? 1,
        version: current.version ?? 1,
        usuarioAccion: adminUserId,
      });
      if (!result.ok) {
        toast.error('No se pudo guardar la plantilla.');
        return;
      }
      setPlantillas((prev) => ({
        ...prev,
        [selectedPlantilla]: {
          ...prev[selectedPlantilla],
          asunto: editedAsunto,
          contenido: editedContenido,
          idPlantilla: result.idPlantilla ?? prev[selectedPlantilla].idPlantilla,
          version: result.version ?? prev[selectedPlantilla].version,
        },
      }));
      toast.success('Plantilla guardada exitosamente');
    } catch (error) {
      toast.error('No se pudo guardar la plantilla.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestaurar = () => {
    if (confirm('¿Estás seguro de restaurar la plantilla por defecto?')) {
      setEditedAsunto(plantillas[selectedPlantilla].asunto);
      setEditedContenido(plantillas[selectedPlantilla].contenido);
    }
  };

  const getPreview = () => {
    return {
      asunto: editedAsunto
        .replace('{{nombre}}', 'Juan Pérez')
        .replace('{{convocatoria}}', 'Servicio Extensionista Agrícola - Lima Norte 2026')
        .replace('{{numeroPostulacion}}', 'POST-2026-001')
        .replace('{{fechaPostulacion}}', '11/01/2026')
        .replace('{{nuevoEstado}}', 'PRESELECCIONADO')
        .replace('{{fecha}}', '11/01/2026')
        .replace('{{estadoFinal}}', 'FINALISTA'),
      contenido: editedContenido
        .replace(/{{nombre}}/g, 'Juan Pérez')
        .replace(/{{convocatoria}}/g, 'Servicio Extensionista Agrícola - Lima Norte 2026')
        .replace(/{{numeroPostulacion}}/g, 'POST-2026-001')
        .replace(/{{fechaPostulacion}}/g, '11/01/2026')
        .replace(/{{nuevoEstado}}/g, 'PRESELECCIONADO')
        .replace(/{{fecha}}/g, '11/01/2026')
        .replace(/{{mensaje}}/g, 'Felicitaciones, has sido preseleccionado para la siguiente etapa.')
        .replace(/{{estadoFinal}}/g, 'FINALISTA')
        .replace(
          /{{mensajeResultado}}/g,
          'Has sido seleccionado como finalista. Pronto nos pondremos en contacto contigo.',
        ),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#04a25c' }}>
          <Mail className="w-8 h-8" />
          Plantillas de Correo
        </h1>
        <p className="mt-2 font-bold" style={{ color: '#108cc9' }}>
          Configurar plantillas de notificaciones por correo electrónico
        </p>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Cargando plantillas...</p>}
      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {/* Tabs de plantillas */}
      <Tabs
        value={selectedPlantilla}
        onValueChange={(value) => handlePlantillaChange(value as PlantillaKey)}
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="bienvenida">Bienvenida</TabsTrigger>
          <TabsTrigger value="confirmacionPostulacion">Confirmación</TabsTrigger>
          <TabsTrigger value="cambioEstado">Cambio de Estado</TabsTrigger>
          <TabsTrigger value="resultadoFinal">Resultado Final</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
                  Editor de Plantilla
                </h3>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Asunto del Correo
                </label>
                <input
                  type="text"
                  value={editedAsunto}
                  onChange={(e) => setEditedAsunto(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contenido del Correo
                </label>
                <textarea
                  value={editedContenido}
                  onChange={(e) => setEditedContenido(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">Variables disponibles:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>• {'{'}{'nombre'}{'}'} - Nombre del usuario</div>
                  <div>• {'{'}{'convocatoria'}{'}'} - Nombre del servicio</div>
                  <div>• {'{'}{'numeroPostulacion'}{'}'} - Número de registro</div>
                  <div>• {'{'}{'fechaPostulacion'}{'}'} - Fecha de registro</div>
                  <div>• {'{'}{'nuevoEstado'}{'}'} - Nuevo estado</div>
                  <div>• {'{'}{'fecha'}{'}'} - Fecha actual</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={handleGuardar}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  disabled={isSaving || isLoading}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  onClick={handleRestaurar}
                  variant="outline"
                  className="gap-2"
                  disabled={isSaving}
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Defecto
                </Button>
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="gap-2 ml-auto"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Ocultar' : 'Ver'} Vista Previa
                </Button>
              </div>
            </div>
          </Card>

          {/* Vista Previa */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
              Vista Previa
            </h3>

            {showPreview ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Asunto:</p>
                  <p className="font-semibold text-gray-900">{getPreview().asunto}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200 min-h-[400px]">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                    {getPreview().contenido}
                  </pre>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Nota:</strong> Esta es una vista previa con datos de ejemplo. Los
                    valores reales se insertarán automáticamente al enviar el correo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <Eye className="w-16 h-16 mb-4" />
                <p className="text-sm">
                  Haz clic en "Ver Vista Previa" para visualizar el correo
                </p>
              </div>
            )}
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
