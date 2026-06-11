import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, KeyIcon } from "@heroicons/react/24/outline";
import {
  resendVerification,
  verifyEmail,
} from "../../../shared/apis/authService";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../../../shared/store/uiStore";
import logo from "../../../assets/logo.png";
import personalMedico from "../../../assets/PersonalMedico.jpeg";

const emptyCode = ["", "", "", "", "", ""];

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
    </div>
  );
}

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
    </div>
  );
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const initialCorreo = useMemo(
    () => searchParams.get("correo") || "",
    [searchParams],
  );
  const [correo, setCorreo] = useState(initialCorreo);
  const [code, setCode] = useState(emptyCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const { setSession } = useAuthStore();
  const { showError, showSuccess } = useUIStore();
  const navigate = useNavigate();

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const nextCode = [...code];
    nextCode[index] = value.slice(-1);
    setCode(nextCode);
    setError("");

    if (value && index < 5) {
      document.getElementById(`activation-code-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`activation-code-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanCorreo = correo.trim();
    const cleanCode = code.join("");

    if (!cleanCorreo || cleanCode.length !== 6) {
      const message = "Debes ingresar tu correo y el codigo de 6 digitos.";
      setError(message);
      showError(message);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await verifyEmail({ correo: cleanCorreo, code: cleanCode });
      setSession({
        token: data.token,
        user: data.user,
        mustChangePassword: data.mustChangePassword,
      });
      showSuccess("Cuenta verificada correctamente");
      navigate("/change-password", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Codigo invalido o expirado.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanCorreo = correo.trim();

    if (!cleanCorreo) {
      const message = "Ingresa tu correo para reenviar el codigo.";
      setError(message);
      showError(message);
      return;
    }

    setResending(true);
    setError("");

    try {
      await resendVerification(cleanCorreo);
      setCode(emptyCode);
      showSuccess("Codigo de verificacion reenviado");
    } catch (err) {
      const message =
        err.response?.data?.message || "No se pudo reenviar el codigo.";
      setError(message);
      showError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{
        background: "linear-gradient(135deg, #F2F2F0 0%, #F2BB77 100%)",
      }}
    >
      <BackgroundElements />

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
              alt="Personal medico"
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
              Gestor de Jornadas Medicas
            </p>
            <div className="w-12 h-1 bg-white/40 rounded-full mb-5" />
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              Activa tu cuenta para acceder al sistema.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-10">
          <div className="w-full max-w-sm">
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

            <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border-2 border-primary bg-transparent">
                  <KeyIcon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-gray-800 text-2xl font-extrabold mb-1">
                  Verificar cuenta
                </h2>
                <p className="text-gray-400 text-sm mb-7">
                  Ingresa el codigo de 6 digitos enviado a tu correo.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">
                      Correo electronico
                    </label>
                    <input
                      type="email"
                      value={correo}
                      onChange={(event) => setCorreo(event.target.value)}
                      placeholder="ejemplo@scoph.org"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-between">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`activation-code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(event) =>
                          handleCodeChange(index, event.target.value)
                        }
                        onKeyDown={(event) =>
                          handleCodeKeyDown(index, event)
                        }
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white font-bold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-xl active:scale-95 text-base disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)",
                    }}
                  >
                    {loading ? "Verificando..." : "Verificar cuenta"}
                  </button>

                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-sm text-gray-400 hover:text-primary transition font-medium disabled:opacity-60"
                    >
                      {resending ? "Reenviando..." : "Reenviar codigo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition font-medium"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Volver al inicio de sesion
                    </button>
                  </div>
                </form>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
