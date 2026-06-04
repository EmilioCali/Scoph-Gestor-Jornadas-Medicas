import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../store/authStore.js";
import { changePassword } from "../../../shared/apis/authService";
import logo from "../../../assets/logo.png";
import personalMedico from "../../../assets/PersonalMedico.jpeg";

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
      {/* ... (Tus otros SVGs se mantienen igual) ... */}
    </div>
  );
}

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // EXTRAEMOS SOLO ZUSTAND
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      // Esto cambia el valor y fuerza el guardado en localStorage
      updateUser({ mustChangePassword: false });

      // Ahora el router leerá el localStorage actualizado y nos dejará pasar
      navigate("/dashboard");
    } catch (err) {
      // CAPTURAMOS EL ERROR 400 DE FASTIFY
      setError(
        err.response?.data?.message ||
          "Error al cambiar la contraseña. Revisa tu contraseña actual.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{
        background: "linear-gradient(135deg, #F2F2F0 0%, #F2BB77 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #F2BB77, transparent)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #F29863, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl min-h-[580px] flex rounded-3xl shadow-2xl overflow-hidden">
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
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-10">
          <div className="w-full max-w-sm">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border-2 border-primary bg-transparent">
              <KeyIcon className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-gray-800 text-2xl font-extrabold mb-1">
              Cambiar contraseña
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              Por seguridad debes cambiar tu contraseña temporal antes de
              continuar.
            </p>

            {user && (
              <div className="bg-orange-50 rounded-xl px-4 py-3 border border-orange-100 mb-6">
                <p className="text-xs text-gray-400">Usuario activo</p>
                <p className="text-sm font-semibold text-gray-700 capitalize">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-400">{user.correo}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-red-500 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
                  >
                    {showCurrent ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
                  >
                    {showNew ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
                  >
                    {showConfirm ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-xl active:scale-95 text-base mt-2 disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)",
                }}
              >
                {loading ? "Cambiando..." : "Cambiar contraseña"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
