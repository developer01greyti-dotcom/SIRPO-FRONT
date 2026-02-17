import { useRef, useState } from 'react';
import { FileText, Save, Eye, RotateCcw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

type DeclaracionItem = {
  id: string;
  titulo: string;
  contenido: string;
};

const DEFAULT_DECLARACIONES: DeclaracionItem[] = [
  {
    id: 'declaracion-1',
    titulo: 'Declaracion Jurada 1',
    contenido:
      '<p>Yo {{nombre}} {{apellidos}} declaro bajo juramento que la informacion consignada es veridica y comprobable.</p>' +
      '<p>Respecto a la convocatoria {{convocatoria}} del anio {{anio}}, oficina zonal {{oficina zonal}} y oficina de coordinacion {{oficinaCoordinacion}}, me comprometo a notificar cualquier cambio relevante en los datos proporcionados.</p>',
  },
  {
    id: 'declaracion-2',
    titulo: 'Declaracion Jurada 2',
    contenido:
      '<p>Yo {{nombre}} {{apellidos}} declaro no tener impedimento legal ni administrativo para participar en la convocatoria {{convocatoria}} de la oficina zonal {{oficina zonal}}.</p>' +
      '<p>Autorizo la verificacion de la informacion brindada en cualquier etapa del proceso {{anio}} en la oficina de coordinacion {{oficinaCoordinacion}}.</p>',
  },
  {
    id: 'declaracion-3',
    titulo: 'Declaracion Jurada 3',
    contenido:
      '<p>Yo {{nombre}} {{apellidos}} declaro conocer las bases y condiciones de la convocatoria {{convocatoria}}, y acepto sus terminos.</p>' +
      '<p>Me responsabilizo por la documentacion presentada a la fecha {{fecha}} para la oficina zonal {{oficina zonal}}.</p>',
  },
];

const buildNewDeclaracion = (index: number): DeclaracionItem => ({
  id: `declaracion-${index}-${Date.now()}`,
  titulo: `Declaracion Jurada ${index}`,
  contenido:
    '<p>Yo {{nombre}} {{apellidos}} declaro bajo juramento que...</p>' +
    '<p>Convocatoria: {{convocatoria}} - Anio {{anio}} - Oficina zonal {{oficina zonal}} - Oficina de coordinacion {{oficinaCoordinacion}}.</p>',
});

export function DeclaracionesJuradasAdmin() {
  const [declaraciones, setDeclaraciones] = useState<DeclaracionItem[]>(DEFAULT_DECLARACIONES);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_DECLARACIONES[0].id);
  const selected = declaraciones.find((item) => item.id === selectedId) ?? declaraciones[0];
  const [editedTitulo, setEditedTitulo] = useState(selected.titulo);
  const [editedContenido, setEditedContenido] = useState(selected.contenido);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const previewVariableMap: Record<string, string> = {
    nombre: 'Juan',
    apellidos: 'Perez',
    convocatoria: 'Servicio Extensionista - Lima Norte 2026',
    anio: '2026',
    ano: '2026',
    fecha: '16/02/2026',
    documento: 'DNI 12345678',
    perfil: 'Extensionista',
    'oficina zonal': 'Lima',
    oficina_zonal: 'Lima',
    oficinazonal: 'Lima',
    'oficina coordinacion': 'Lima Norte',
    oficina_coordinacion: 'Lima Norte',
    oficinacoordinacion: 'Lima Norte',
  };

  const applyVariables = (text: string) =>
    text.replace(/{{\s*([^}]+?)\s*}}/g, (match, rawKey) => {
      const key = String(rawKey || '').trim().toLowerCase();
      return previewVariableMap[key] ?? match;
    });

  const setEditorContent = (html: string) => {
    setEditedContenido(html);
    setEditorKey((prev) => prev + 1);
  };

  const handleCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false);
    setEditedContenido(editorRef.current.innerHTML);
  };

  const handleSelect = (id: string) => {
    const current = declaraciones.find((item) => item.id === id);
    if (!current) return;
    setSelectedId(id);
    setEditedTitulo(current.titulo);
    setEditorContent(current.contenido);
    setShowPreview(false);
  };

  const handleGuardar = () => {
    if (isSaving) return;
    setIsSaving(true);
    setDeclaraciones((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, titulo: editedTitulo, contenido: editedContenido }
          : item,
      ),
    );
    toast.success('Declaracion guardada exitosamente');
    setIsSaving(false);
  };

  const handleRestaurar = () => {
    if (confirm('Estas seguro de restaurar la declaracion a su valor anterior?')) {
      const current = declaraciones.find((item) => item.id === selectedId);
      if (!current) return;
      setEditedTitulo(current.titulo);
      setEditorContent(current.contenido);
    }
  };

  const handleAgregar = () => {
    const nextIndex = declaraciones.length + 1;
    const nueva = buildNewDeclaracion(nextIndex);
    setDeclaraciones((prev) => [...prev, nueva]);
    setSelectedId(nueva.id);
    setEditedTitulo(nueva.titulo);
    setEditorContent(nueva.contenido);
    setShowPreview(false);
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
            Configurar declaraciones juradas para postulantes
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
                  Editor de Declaracion
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
                  Contenido
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleCommand('bold')}>
                    Negrita
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleCommand('italic')}>
                    Cursiva
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleCommand('underline')}>
                    Subrayado
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleCommand('insertUnorderedList')}>
                    Lista
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleCommand('insertOrderedList')}>
                    Lista numerada
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleCommand('removeFormat')}>
                    Limpiar formato
                  </Button>
                </div>
                <div
                  key={editorKey}
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => {
                    const html = event.currentTarget.innerHTML;
                    setEditedContenido(html);
                  }}
                  className="w-full min-h-[320px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  dangerouslySetInnerHTML={{ __html: editedContenido }}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">Variables disponibles:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>• {'{'}{'nombre'}{'}'} - Nombre del postulante</div>
                  <div>• {'{'}{'apellidos'}{'}'} - Apellidos del postulante</div>
                  <div>• {'{'}{'convocatoria'}{'}'} - Nombre de la convocatoria</div>
                  <div>• {'{'}{'anio'}{'}'} - Anio de la convocatoria</div>
                  <div>• {'{'}{'fecha'}{'}'} - Fecha actual</div>
                  <div>• {'{'}{'documento'}{'}'} - Documento del postulante</div>
                  <div>• {'{'}{'perfil'}{'}'} - Perfil o cargo</div>
                  <div>• {'{'}{'oficina zonal'}{'}'} - Oficina zonal</div>
                  <div>• {'{'}{'oficinaCoordinacion'}{'}'} - Oficina de coordinacion</div>
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

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#04a25c' }}>
              Vista Previa
            </h3>

            {showPreview ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Titulo:</p>
                  <p className="font-semibold text-gray-900">{applyVariables(editedTitulo)}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200 min-h-[400px]">
                  <div
                    className="whitespace-pre-wrap font-sans text-sm text-gray-800"
                    dangerouslySetInnerHTML={{ __html: applyVariables(editedContenido) }}
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Nota:</strong> Esta es una vista previa. El texto se mostrara al
                    postulante tal como lo configures aqui.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <Eye className="w-16 h-16 mb-4" />
                <p className="text-sm">Haz clic en "Ver Vista Previa" para visualizar</p>
              </div>
            )}
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
