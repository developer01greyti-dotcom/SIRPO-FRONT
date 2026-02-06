import { useState } from 'react';
import { Mail, Save, Eye, RotateCcw } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function PlantillasCorreo() {
  const [plantillas, setPlantillas] = useState({
    bienvenida: {
      asunto: 'Bienvenido a SIRPO - DEVIDA',
      contenido: `Estimado/a {{nombre}},

Bienvenido al Sistema de Registro de Profesionales y/o Técnicos para Trabajo de Campo en el Marco del PP PIRDAIS (SIRPO) de DEVIDA.

Tu cuenta ha sido creada exitosamente. Ahora puedes:
- Completar tu hoja de vida
- Registrarte a perfiles laborales
- Hacer seguimiento a tus registros

Para comenzar, ingresa al sistema con las credenciales que registraste.

Atentamente,
Equipo DEVIDA`,
    },
    confirmacionPostulacion: {
      asunto: 'Confirmación de Registro - {{convocatoria}}',
      contenido: `Estimado/a {{nombre}},

Hemos recibido tu registro al perfil:
{{convocatoria}}

Número de registro: {{numeroPostulacion}}
Fecha de registro: {{fechaPostulacion}}

Tu registro está en estado: EN REVISIÓN

Recibirás notificaciones sobre cualquier cambio en el estado de tu registro.

Atentamente,
Equipo DEVIDA`,
    },
    cambioEstado: {
      asunto: 'Actualización de Estado - {{convocatoria}}',
      contenido: `Estimado/a {{nombre}},

Te informamos que el estado de tu registro ha sido actualizado:

Perfil: {{convocatoria}}
Nuevo estado: {{nuevoEstado}}
Fecha de actualización: {{fecha}}

{{mensaje}}

Para más información, ingresa a tu cuenta en SIRPO.

Atentamente,
Equipo DEVIDA`,
    },
    resultadoFinal: {
      asunto: 'Resultado Final - {{convocatoria}}',
      contenido: `Estimado/a {{nombre}},

Te informamos el resultado final de tu registro a:
{{convocatoria}}

Estado: {{estadoFinal}}

{{mensajeResultado}}

Agradecemos tu participación en el proceso de selección.

Atentamente,
Equipo DEVIDA`,
    },
  });

  const [selectedPlantilla, setSelectedPlantilla] = useState<keyof typeof plantillas>('bienvenida');
  const [editedAsunto, setEditedAsunto] = useState(plantillas.bienvenida.asunto);
  const [editedContenido, setEditedContenido] = useState(plantillas.bienvenida.contenido);
  const [showPreview, setShowPreview] = useState(false);

  const handlePlantillaChange = (key: keyof typeof plantillas) => {
    setSelectedPlantilla(key);
    setEditedAsunto(plantillas[key].asunto);
    setEditedContenido(plantillas[key].contenido);
    setShowPreview(false);
  };

  const handleGuardar = () => {
    setPlantillas({
      ...plantillas,
      [selectedPlantilla]: {
        asunto: editedAsunto,
        contenido: editedContenido,
      },
    });
    alert('Plantilla guardada exitosamente');
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
        .replace('{{convocatoria}}', 'Perfil Extensionista Agrícola - Lima Norte 2026')
        .replace('{{numeroPostulacion}}', 'POST-2026-001')
        .replace('{{fechaPostulacion}}', '11/01/2026')
        .replace('{{nuevoEstado}}', 'PRESELECCIONADO')
        .replace('{{fecha}}', '11/01/2026')
        .replace('{{estadoFinal}}', 'FINALISTA'),
      contenido: editedContenido
        .replace(/{{nombre}}/g, 'Juan Pérez')
        .replace(/{{convocatoria}}/g, 'Perfil Extensionista Agrícola - Lima Norte 2026')
        .replace(/{{numeroPostulacion}}/g, 'POST-2026-001')
        .replace(/{{fechaPostulacion}}/g, '11/01/2026')
        .replace(/{{nuevoEstado}}/g, 'PRESELECCIONADO')
        .replace(/{{fecha}}/g, '11/01/2026')
        .replace(/{{mensaje}}/g, 'Felicitaciones, has sido preseleccionado para la siguiente etapa.')
        .replace(/{{estadoFinal}}/g, 'FINALISTA')
        .replace(/{{mensajeResultado}}/g, 'Has sido seleccionado como finalista. Pronto nos pondremos en contacto contigo.'),
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

      {/* Tabs de plantillas */}
      <Tabs value={selectedPlantilla} onValueChange={(value) => handlePlantillaChange(value as keyof typeof plantillas)}>
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
                  <div>• {'{'}{'convocatoria'}{'}'} - Nombre del perfil</div>
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
                    <strong>Nota:</strong> Esta es una vista previa con datos de ejemplo. Los valores reales se insertarán automáticamente al enviar el correo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <Eye className="w-16 h-16 mb-4" />
                <p className="text-sm">Haz clic en "Ver Vista Previa" para visualizar el correo</p>
              </div>
            )}
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
