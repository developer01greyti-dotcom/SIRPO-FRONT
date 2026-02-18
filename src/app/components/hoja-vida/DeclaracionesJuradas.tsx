import { useEffect, useState } from "react";
import { Download, Eye, Trash2, Upload } from "lucide-react";
import { Button } from "../ui/button";
import type { LoginResponse } from "../../api/auth";
import { deleteHvDecl, fetchHojaVidaActual, fetchHvDeclList, upsertHvDecl } from "../../api/hojaVida";
import { deleteHvRefArchivo, fetchHvRefArchivo, saveHvRefArchivo } from "../../api/hvRefArchivo";

export interface DeclaracionJurada {
  id: string;
  idDeclaracionTipo?: string;
  idHvDeclaracion?: string;
  nombre: string;
  descripcion: string;
  archivoAdjunto: { file: File; preview: string } | null;
  plantillaUrl: string;
  archivoGuid?: string;
}

export function DeclaracionesJuradas({ user }: { user: LoginResponse | null }) {
  const [declaraciones, setDeclaraciones] = useState<DeclaracionJurada[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hojaVidaId, setHojaVidaId] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<DeclaracionJurada | null>(null);

  const revokePreviewUrl = (url: string | null | undefined) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const buildFileUrl = (guid: string) => {
    const apiBaseUrl =
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
      "http://localhost:8087/sirpo/v1";
    const params = new URLSearchParams({ guid });
    return `${apiBaseUrl}/hv_ref_archivo/file?${params.toString()}`;
  };

  const normalizeDeclaraciones = (items: any[]): DeclaracionJurada[] => {
    return items.map((item, index) => ({
      id: String(item.id ?? item.idDeclaracionTipo ?? index),
      idDeclaracionTipo: String(item.idDeclaracionTipo ?? ""),
      idHvDeclaracion: String(item.idHvDeclaracion ?? ""),
      nombre: item.nombre ?? "",
      descripcion: item.descripcion ?? "",
      plantillaUrl: item.plantillaUrl ?? "",
      archivoGuid: item.archivoGuid ?? "",
      archivoAdjunto: null,
    }));
  };

  useEffect(() => {
    let isActive = true;

    const loadDeclaraciones = async () => {
      if (!user?.idPersona || !user?.idUsuario) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const hvActual = await fetchHojaVidaActual(user.idPersona, user.idUsuario);
        const idHojaVida = Array.isArray(hvActual)
          ? hvActual[0]?.idHojaVida
          : hvActual?.idHojaVida;

        if (!idHojaVida) {
          if (isActive) {
            setDeclaraciones([]);
          }
          return;
        }
        setHojaVidaId(idHojaVida);

        const data = await fetchHvDeclList(idHojaVida);
        if (!isActive) {
          return;
        }
        const items = Array.isArray(data) ? data : data ? [data] : [];
        setDeclaraciones(normalizeDeclaraciones(items));
      } catch (error) {
        if (isActive) {
          setLoadError("No se pudo cargar las declaraciones juradas.");
          setDeclaraciones([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDeclaraciones();

    return () => {
      isActive = false;
    };
  }, [user?.idPersona, user?.idUsuario, refreshKey]);

  const handleFileChange = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!user?.idUsuario || !hojaVidaId) {
        return;
      }
      const declaracionActual = declaraciones.find((d) => d.id === id);
      if (!declaracionActual) {
        return;
      }

      setDeclaraciones((prev) =>
        prev.map((d) => {
          if (d.id !== id) {
            return d;
          }
          revokePreviewUrl(d.archivoAdjunto?.preview);
          return { ...d, archivoAdjunto: { file, preview: URL.createObjectURL(file) } };
        }),
      );

      const idHvDecl = await upsertHvDecl({
        idHvDecl: Number(declaracionActual.idHvDeclaracion || 0),
        idHojaVida: hojaVidaId,
        idDeclaracionTipo: Number(declaracionActual.idDeclaracionTipo || 0),
        idArchivo: 1,
        estado: "ACTIVO",
        usuarioAccion: user.idUsuario,
      });

      if (!idHvDecl) {
        return;
      }

      const extension = file.name.split(".").pop() || "";
      await saveHvRefArchivo(file, {
        idHvRefArchivo: 0,
        idHojaVida: hojaVidaId,
        entidad: "HV_DECL",
        idEntidad: idHvDecl,
        tipoArchivo: "HV_DECL",
        nombreOrig: file.name,
        ext: extension,
        mime: file.type || "application/octet-stream",
        sizeBytes: file.size,
        ruta: "hv",
        usuarioAccion: user.idUsuario,
      });

      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleDownloadArchivo = (declaracion: DeclaracionJurada) => {
    if (declaracion.archivoAdjunto) {
      const link = document.createElement("a");
      link.href = declaracion.archivoAdjunto.preview;
      link.download = declaracion.archivoAdjunto.file.name || `${declaracion.nombre}.docx`;
      link.click();
    }
  };

  const handleEliminarDeclaracion = async () => {
    if (!confirmDelete) {
      setConfirmDelete(null);
      return;
    }

    const idHvDecl = Number(confirmDelete.idHvDeclaracion || 0);
    if (!idHvDecl || !user?.idUsuario) {
      setDeclaraciones((prev) =>
        prev.map((d) => {
          if (d.id !== confirmDelete.id) {
            return d;
          }
          revokePreviewUrl(d.archivoAdjunto?.preview);
          return { ...d, archivoAdjunto: null };
        }),
      );
      setConfirmDelete(null);
      return;
    }

    const archivos = await fetchHvRefArchivo("HV_DECL", idHvDecl);
    const actual = archivos.find((item) => item.tipoArchivo === "HV_DECL");
    if (actual?.idHvRefArchivo) {
      await deleteHvRefArchivo(actual.idHvRefArchivo, user.idUsuario);
    }

    await deleteHvDecl(idHvDecl, user.idUsuario);
    setConfirmDelete(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold" style={{ color: "#04a25c" }}>
              Declaraciones Juradas
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sube el archivo Word con variables para que el sistema complete tus datos automaticamente.
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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

          {isLoading ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed text-gray-600">
              Cargando declaraciones juradas...
            </div>
          ) : loadError ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed text-red-600">
              {loadError}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Declaracion Jurada</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Descripcion</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Plantilla</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Archivo Adjunto</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {declaraciones.map((declaracion, index) => (
                    <tr key={declaracion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{declaracion.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{declaracion.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {declaracion.plantillaUrl ? (
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = declaracion.plantillaUrl;
                              link.download = `Plantilla_${declaracion.nombre}.docx`;
                              link.click();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Descargar
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Sin plantilla</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {declaracion.archivoGuid ? (
                            <span className="text-sm text-green-600 font-medium">Con archivo</span>
                          ) : (
                            <span className="text-sm text-gray-400">Sin archivo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id={`file-${declaracion.id}`}
                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => handleFileChange(declaracion.id, e)}
                            className="hidden"
                          />
                          <label
                            htmlFor={`file-${declaracion.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Adjuntar
                          </label>
                          {declaracion.archivoGuid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!declaracion.archivoGuid) return;
                                const url = buildFileUrl(declaracion.archivoGuid);
                                window.open(url, "_blank", "noopener,noreferrer");
                              }}
                              className="gap-1 h-7 px-2"
                              title="Ver archivo adjunto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {declaracion.archivoAdjunto && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadArchivo(declaracion)}
                              className="gap-1 h-7 px-2"
                              title="Descargar archivo adjunto"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {(declaracion.idHvDeclaracion || declaracion.archivoAdjunto) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmDelete(declaracion)}
                              className="gap-1 h-7 px-2 text-red-600 hover:text-red-700 hover:border-red-300"
                              title="Eliminar declaracion"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900">Eliminar declaracion jurada?</h4>
            <p className="mt-2 text-sm text-gray-600">
              Esta accion no se puede deshacer. Se eliminara el registro seleccionado.
            </p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                No
              </Button>
              <Button variant="destructive" onClick={handleEliminarDeclaracion}>
                Si, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
