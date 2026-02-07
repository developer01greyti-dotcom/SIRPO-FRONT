import { AlertCircle, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface PostularModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToHojaVida: () => void;
  hojaVidaCompleta: boolean;
  nombreConvocatoria: string;
}

export function PostularModal({
  isOpen,
  onClose,
  onGoToHojaVida,
  hojaVidaCompleta,
  nombreConvocatoria,
}: PostularModalProps) {
  if (hojaVidaCompleta) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Confirmar Registro</DialogTitle>
              </div>
            </div>
            <DialogDescription>
              Estás a punto de registrarte al servicio: {nombreConvocatoria}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Se enviará tu hoja de vida registrada. ¿Deseas continuar?
            </p>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Confirmar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Hoja de Vida Incompleta</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            Para registrarte debes completar tu hoja de vida primero.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-gray-700">
            Servicio: <span className="font-semibold text-gray-900">{nombreConvocatoria}</span>
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-900 font-medium mb-2">
              Antes de registrarte, debes completar todas las pestañas de tu hoja de vida:
            </p>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Datos Personales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Formación Académica</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Experiencia Profesional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Declaraciones Juradas</span>
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onGoToHojaVida} className="gap-2">
            <FileText className="w-4 h-4" />
            Ir a Registro de Hoja de Vida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
