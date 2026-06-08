import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Modal reutilizable con scroll interno.
 * - Bloquea el scroll del body mientras está abierto.
 * - El contenido interno hace scroll si supera el viewport.
 */
export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  // Bloquea scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenedor del modal — flex column para que el body haga scroll */}
      <div
        className={`relative z-10 w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl flex flex-col`}
        style={{ maxHeight: "calc(100vh - 3rem)" }}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-extrabold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
