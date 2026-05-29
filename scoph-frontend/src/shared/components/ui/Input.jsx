// Componente Input reutilizable con label y mensaje de error
// Props:
//  label: texto del label
// error: mensaje de error a mostrar
// el resto de props se pasan directo al input
export default function Input({ label, error, className = "", ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-semibold text-gray-600">{label}</label>
            )}
            <input
                className={`w-full px-4 py-3 rounded-xl border ${error ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-primary focus:ring-primary/20"
                    } bg-gray-50 focus:outline-none focus:ring-2 text-gray-700 placeholder-gray-300 transition ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}