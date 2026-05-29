// Componente Modal reutilizable padre
//  onClose: función para cerrar el modal
// title: título del modal
// children: contenido interno del modal
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
    };

    return (
        // Overlay oscuro detrás del modal
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Contenedor del modal */}
            <div className={`relative z-10 w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl overflow-hidden`}>

                {/* Header del modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-extrabold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido del modal - los hijos lo llenan */}
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}