import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmacionPostulacionProps {
  convocatoriaNombre: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmacionPostulacion({
  convocatoriaNombre,
  onConfirmar,
  onCancelar,
}: ConfirmacionPostulacionProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Confirmar Registro</h3>
          </div>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                ¿Deseas registrarte a este servicio?
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Se mostrará la vista previa de tu hoja de vida antes de confirmar
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Servicio</p>
            <p className="text-sm font-medium text-gray-900">{convocatoriaNombre}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-800 mb-2">Importante:</p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Podrás revisar tu hoja de vida antes de registrarte al servicio</li>
              <li>• Si necesitas hacer cambios, podrás regresar a editar tu información</li>
              <li>• Recuerda que solo puedes registrarte a 2 servicios por cada Oficina Zonal</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onCancelar}
            className="border-gray-300 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirmar}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            Sí, continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
