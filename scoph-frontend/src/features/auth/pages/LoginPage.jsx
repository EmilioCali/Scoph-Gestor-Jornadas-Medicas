import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../store/authStore.js";
//import { login } from "../../../shared/apis/authService";
import logo from "../../../assets/logo.png";
import personalMedico from "../../../assets/PersonalMedico.jpeg";

// Elementos SVG flotantes médicos dentro del card izquierdo
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-l-3xl">
      <svg
        className="absolute top-8 left-8 opacity-15 animate-pulse"
        width="35"
        height="35"
        viewBox="0 0 40 40"
      >
        <rect x="15" y="0" width="10" height="40" rx="3" fill="white" />
        <rect x="0" y="15" width="40" height="10" rx="3" fill="white" />
      </svg>
      <svg
        className="absolute bottom-10 right-6 opacity-10 animate-pulse"
        style={{ animationDelay: "1s" }}
        width="25"
        height="25"
        viewBox="0 0 40 40"
      >
        <rect x="15" y="0" width="10" height="40" rx="3" fill="white" />
        <rect x="0" y="15" width="40" height="10" rx="3" fill="white" />
      </svg>
      <svg
        className="absolute top-1/2 left-1/3 opacity-[0.08] animate-pulse"
        style={{ animationDelay: "2s" }}
        width="18"
        height="18"
        viewBox="0 0 40 40"
      >
        <rect x="15" y="0" width="10" height="40" rx="3" fill="white" />
        <rect x="0" y="15" width="40" height="10" rx="3" fill="white" />
      </svg>
      <svg
        className="absolute top-12 left-0 right-0 opacity-[0.12]"
        width="100%"
        height="50"
        viewBox="0 0 400 50"
        preserveAspectRatio="none"
      >
        <polyline
          points="0,25 40,25 55,25 63,5 72,45 80,12 88,38 96,25 160,25 175,25 183,8 191,42 199,15 207,35 215,25 280,25 295,25 303,6 311,44 319,16 327,38 335,25 400,25"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="absolute bottom-16 left-0 right-0 opacity-[0.10]"
        width="100%"
        height="40"
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
      >
        <polyline
          points="0,20 40,20 52,20 60,4 68,36 76,10 84,30 92,20 150,20 165,20 173,6 181,34 189,12 197,28 205,20 270,20 285,20 293,5 301,35 309,13 317,30 325,20 400,20"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="absolute top-16 right-8 opacity-[0.12]"
        width="70"
        height="70"
        viewBox="0 0 80 80"
      >
        <circle cx="40" cy="40" r="6" fill="white" />
        <circle cx="15" cy="25" r="4" fill="white" />
        <circle cx="65" cy="25" r="4" fill="white" />
        <circle cx="15" cy="55" r="4" fill="white" />
        <circle cx="65" cy="55" r="4" fill="white" />
        <circle cx="40" cy="10" r="3" fill="white" />
        <circle cx="40" cy="70" r="3" fill="white" />
        <line
          x1="40"
          y1="40"
          x2="15"
          y2="25"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="65"
          y2="25"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="15"
          y2="55"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="65"
          y2="55"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="40"
          y2="10"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="40"
          y2="70"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>
      <svg
        className="absolute bottom-20 left-8 opacity-[0.10]"
        width="50"
        height="50"
        viewBox="0 0 80 80"
      >
        <circle cx="40" cy="40" r="6" fill="white" />
        <circle cx="15" cy="25" r="4" fill="white" />
        <circle cx="65" cy="25" r="4" fill="white" />
        <circle cx="15" cy="55" r="4" fill="white" />
        <circle cx="65" cy="55" r="4" fill="white" />
        <line
          x1="40"
          y1="40"
          x2="15"
          y2="25"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="65"
          y2="25"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="15"
          y2="55"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="40"
          y1="40"
          x2="65"
          y2="55"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>
      <svg
        className="absolute top-1/3 left-6 opacity-[0.10]"
        width="40"
        height="40"
        viewBox="0 0 24 24"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        <line x1="3" y1="9" x2="21" y2="9" stroke="white" strokeWidth="1.5" />
        <line
          x1="8"
          y1="2"
          x2="8"
          y2="6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="2"
          x2="16"
          y2="6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="7"
          y="12"
          width="3"
          height="3"
          rx="0.5"
          fill="white"
          opacity="0.6"
        />
        <rect
          x="11"
          y="12"
          width="3"
          height="3"
          rx="0.5"
          fill="white"
          opacity="0.6"
        />
        <rect
          x="15"
          y="12"
          width="3"
          height="3"
          rx="0.5"
          fill="white"
          opacity="0.6"
        />
        <rect
          x="7"
          y="16"
          width="3"
          height="3"
          rx="0.5"
          fill="white"
          opacity="0.6"
        />
        <rect
          x="11"
          y="16"
          width="3"
          height="3"
          rx="0.5"
          fill="white"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

// Elementos decorativos del fondo detrás del card
function BackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #F2BB77, transparent)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #F29863, transparent)" }}
      />
      <svg
        className="absolute top-16 right-24 opacity-[0.05]"
        width="50"
        height="50"
        viewBox="0 0 40 40"
      >
        <rect x="15" y="0" width="10" height="40" rx="3" fill="#F27405" />
        <rect x="0" y="15" width="40" height="10" rx="3" fill="#F27405" />
      </svg>
      <svg
        className="absolute bottom-20 left-20 opacity-[0.05]"
        width="35"
        height="35"
        viewBox="0 0 40 40"
      >
        <rect x="15" y="0" width="10" height="40" rx="3" fill="#D97236" />
        <rect x="0" y="15" width="40" height="10" rx="3" fill="#D97236" />
      </svg>
    </div>
  );
}
//
export default function LoginPage() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await login({
      username: form.username,
      password: form.password,
    });

    // Zustand nos devuelve un objeto indicando si tuvo éxito
    if (response.success) {
      const currentUser = useAuthStore.getState().user;

      if (currentUser?.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #F2F2F0 0%, #ffffff 100%)",
      }}
    >
      <BackgroundElements />
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          background: `radial-gradient(
        circle 700px at ${cursorPosition.x}px ${cursorPosition.y}px,
        rgba(242, 187, 119, 0.4) 0%,
        rgba(242, 187, 119, 0.15) 50%,
        transparent 80%
    )`,
        }}
      />
      {/* Card central flotante */}
      <div className="relative z-10 w-full max-w-4xl min-h-[580px] flex rounded-3xl shadow-2xl overflow-hidden">
        {/* Lado izquierdo - Identidad visual */}
        <div
          className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #F27405 0%, #D97236 60%, #8B3A0F 100%)",
          }}
        >
          <div className="absolute inset-0">
            <img
              src={personalMedico}
              alt="Personal Médico"
              className="w-full h-full object-cover opacity-15"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #F27405CC 0%, #D97236CC 60%, #8B3A0FCC 100%)",
              }}
            />
          </div>
          <FloatingElements />
          <div className="relative z-10 flex flex-col items-center text-center px-10">
            <div className="bg-white rounded-full shadow-2xl overflow-hidden w-28 h-28 flex items-center justify-center mb-5">
              <img
                src={logo}
                alt="SCOPH URL"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-white text-3xl font-extrabold tracking-wide mb-2 drop-shadow-lg">
              SCOPH - URL
            </h1>
            <p className="text-orange-100 text-base font-medium mb-5">
              Gestor de Jornadas Médicas
            </p>
            <div className="w-12 h-1 bg-white/40 rounded-full mb-5" />
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              Optimizando la salud, <br />
              <span className="text-white font-semibold">
                organizando el futuro.
              </span>
            </p>
            <div className="flex gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-white opacity-80" />
              <div className="w-6 h-2 rounded-full bg-white opacity-50" />
              <div className="w-2 h-2 rounded-full bg-white opacity-30" />
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-white/30 text-xs">© 2025 SCOPH - URL</p>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-10">
          <div className="w-full max-w-sm">
            {/* Logo visible solo en mobile */}
            <div className="flex lg:hidden flex-col items-center mb-8">
              <div className="bg-white rounded-full shadow-lg overflow-hidden w-20 h-20 flex items-center justify-center mb-3 border-2 border-primary">
                <img
                  src={logo}
                  alt="SCOPH URL"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-primary text-xl font-bold">SCOPH - URL</h1>
            </div>

            <div className="mb-7">
              <h2 className="text-gray-800 text-2xl font-extrabold mb-1">
                Bienvenido
              </h2>
              <p className="text-gray-400 text-sm">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Mensaje de error del backend */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-red-500 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username o correo */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Usuario o correo
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="dgomez o daniel@scoph.org"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Recordar y olvidé contraseña */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">
                    Recordar contraseña
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/recover-password")}
                  className="text-sm text-primary hover:text-primary-dark transition font-semibold"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón submit con estado de carga */}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-xl active:scale-95 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #D97236 0%, #8B3A0F 60%, #D97236 100%)";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)";
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            <p className="lg:hidden text-center text-gray-300 text-xs mt-8">
              © 2025 SCOPH - URL · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-center text-gray-400/60 text-xs">
        © 2025 SCOPH - URL · Todos los derechos reservados
      </p>
    </div>
  );
}
