// Componente Badge para mostrar estados con colores
export default function Badge({ children, variant = "gray" }) {
    const variants = {
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
        gray: "bg-gray-100 text-gray-600",
        primary: "bg-orange-100 text-primary",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
            {children}
        </span>
    );
}