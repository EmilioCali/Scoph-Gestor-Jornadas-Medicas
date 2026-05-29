// Componente Table reutilizable con columnas dinámicas
// - columnas: array de { key, label, render (opcional) }
// - data: array de objetos con los datos
// - loading: muestra skeleton cuando es true
// - emptyMessage: mensaje cuando no hay datos
export default function Table({ columns = [], data = [], loading = false, emptyMessage = "No hay datos disponibles" }) {
    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">

                {/* Encabezados de columnas */}
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        {columns.map((col) => (
                            <th key={col.key} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {/* Estado de carga con skeleton */}
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-50">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-5 py-4">
                                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        // Estado vacío
                        <tr>
                            <td colSpan={columns.length} className="px-5 py-10 text-center text-gray-400 text-sm">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        // Filas de datos
                        data.map((row, i) => (
                            <tr key={row._id || i} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-5 py-4 text-gray-700">
                                        {/* Si la columna tiene render personalizado lo usa, si no muestra el valor directo */}
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}