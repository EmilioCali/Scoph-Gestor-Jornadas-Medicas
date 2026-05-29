export default function StatCard({ title, value, subtitle, icon: Icon, variant = "primary" }) {

    // Fondo suave y color del ícono según variante
    const styles = {
        primary: { bg: "bg-orange-50", icon: "text-orange-500", value: "text-orange-500" },
        success: { bg: "bg-green-50", icon: "text-green-500", value: "text-green-500" },
        warning: { bg: "bg-yellow-50", icon: "text-yellow-500", value: "text-yellow-500" },
        danger: { bg: "bg-red-50", icon: "text-red-500", value: "text-red-500" },
    };

    const style = styles[variant] || styles.primary;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition">
            {/* Ícono con fondo suave del color de la variante */}
            {Icon && (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                    <Icon className={`w-6 h-6 ${style.icon}`} />
                </div>
            )}

            {/* Información de la métrica */}
            <div>
                <p className="text-gray-400 text-xs font-medium">{title}</p>
                <p className={`text-2xl font-extrabold leading-tight ${style.value}`}>{value}</p>
                {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}