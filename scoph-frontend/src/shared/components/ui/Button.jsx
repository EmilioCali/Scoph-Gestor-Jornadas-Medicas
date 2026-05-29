// Componente Button reutilizable con variantes de estilow
export default function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    className = "",
    ...props
}) {

    // Estilos base que siempre se aplican
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variantes de color
    const variants = {
        primary: "text-white shadow-md hover:shadow-lg",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
        ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
    };

    // Tamaños
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
    };

    // Estilo inline solo para el gradiente del primary
    const primaryStyle = variant === "primary"
        ? { background: "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)" }
        : {};

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            style={primaryStyle}
            onMouseEnter={e => {
                if (variant === "primary") {
                    e.currentTarget.style.background = "linear-gradient(135deg, #D97236 0%, #8B3A0F 60%, #D97236 100%)";
                }
            }}
            onMouseLeave={e => {
                if (variant === "primary") {
                    e.currentTarget.style.background = "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)";
                }
            }}
            disabled={loading || props.disabled}
            {...props}
        >
            {/* Spinner de carga */}
            {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            )}
            {children}
        </button>
    );
}