// Componente ConfirmDialog para confirmar acciones destructivas
// - isOpen: controla visibilidad
// - onClose: función para cancelar
// - onConfirm: función para confirmar
// - titulo: título del diálogo
// - mensaje: mensaje descriptivo de la acción
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "¿Estás seguro?", message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                {/* Ícono de advertencia */}
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                </div>

                <h2 className="text-lg font-extrabold text-gray-800 mb-2">{title}</h2>
                <p className="text-gray-400 text-sm mb-6">{message}</p>

                {/* Botones de acción */}
                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="danger" onClick={onConfirm}>Confirmar</Button>
                </div>
            </div>
        </div>
    );
}