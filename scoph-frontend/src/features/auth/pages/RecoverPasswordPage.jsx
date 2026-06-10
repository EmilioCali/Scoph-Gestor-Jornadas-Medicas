import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnvelopeIcon, KeyIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { forgotPassword, resetPassword } from "../../../shared/apis/authService";
import { useUIStore } from "../../../shared/store/uiStore";
import logo from "../../../assets/logo.png";
import personalMedico from "../../../assets/PersonalMedico.jpeg";

function FloatingElements() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-l-3xl">
            <svg className="absolute top-8 left-8 opacity-15 animate-pulse" width="35" height="35" viewBox="0 0 40 40">
                <rect x="15" y="0" width="10" height="40" rx="3" fill="white" />
                <rect x="0" y="15" width="40" height="10" rx="3" fill="white" />
            </svg>
            <svg className="absolute bottom-10 right-6 opacity-10 animate-pulse" style={{ animationDelay: "1s" }} width="25" height="25" viewBox="0 0 40 40">
                <rect x="15" y="0" width="10" height="40" rx="3" fill="white" />
                <rect x="0" y="15" width="40" height="10" rx="3" fill="white" />
            </svg>
            <svg className="absolute top-12 left-0 right-0 opacity-[0.12]" width="100%" height="50" viewBox="0 0 400 50" preserveAspectRatio="none">
                <polyline points="0,25 40,25 55,25 63,5 72,45 80,12 88,38 96,25 160,25 175,25 183,8 191,42 199,15 207,35 215,25 280,25 295,25 303,6 311,44 319,16 327,38 335,25 400,25"
                    fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg className="absolute top-16 right-8 opacity-[0.12]" width="70" height="70" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="6" fill="white" />
                <circle cx="15" cy="25" r="4" fill="white" />
                <circle cx="65" cy="25" r="4" fill="white" />
                <circle cx="15" cy="55" r="4" fill="white" />
                <circle cx="65" cy="55" r="4" fill="white" />
                <line x1="40" y1="40" x2="15" y2="25" stroke="white" strokeWidth="1.5" opacity="0.6" />
                <line x1="40" y1="40" x2="65" y2="25" stroke="white" strokeWidth="1.5" opacity="0.6" />
                <line x1="40" y1="40" x2="15" y2="55" stroke="white" strokeWidth="1.5" opacity="0.6" />
                <line x1="40" y1="40" x2="65" y2="55" stroke="white" strokeWidth="1.5" opacity="0.6" />
            </svg>
        </div>
    );
}

function BackgroundElements() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, #F2BB77, transparent)" }} />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, #F29863, transparent)" }} />
        </div>
    );
}

export default function RecoverPasswordPage() {
    const [step, setStep] = useState(1);
    const [correo, setCorreo] = useState("");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { showSuccess, showError } = useUIStore();
    const navigate = useNavigate();

    // Maneja cambio en cada campo del código de verificación
    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        if (value && index < 5) document.getElementById(`code-${index + 1}`).focus();
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus();
        }
    };

    // Paso 1: envía el correo al backend para recibir el código
    // POST /api/auth/forgot-password { correo }
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await forgotPassword(correo);
            setSuccessMessage("Si el correo existe recibirás un código de verificación.");
            showSuccess("Código de verificación enviado");
            setStep(2);
        } catch (err) {
            const message = err.response?.data?.message || "Error al enviar el correo. Intenta de nuevo.";
            setError(message);
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: verifica el código y restablece la contraseña
    // POST /api/auth/reset-password { correo, code, newPassword }
    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            const message = "Las contraseñas no coinciden.";
            setError(message);
            showError(message);
            return;
        }
        if (newPassword.length < 8) {
            const message = "La contraseña debe tener al menos 8 caracteres.";
            setError(message);
            showError(message);
            return;
        }

        setLoading(true);
        try {
            await resetPassword({
                correo,
                code: code.join(""),
                newPassword,
            });
            setSuccessMessage("Contraseña restablecida correctamente. Ahora puedes iniciar sesión.");
            showSuccess("Contraseña restablecida correctamente");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            const message = err.response?.data?.message || "Código inválido o expirado. Intenta de nuevo.";
            setError(message);
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    // Panel izquierdo reutilizado del Login
    const LeftPanel = () => (
        <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #F27405 0%, #D97236 60%, #8B3A0F 100%)" }}>
            <div className="absolute inset-0">
                <img src={personalMedico} alt="Personal Médico" className="w-full h-full object-cover opacity-15" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #F27405CC 0%, #D97236CC 60%, #8B3A0FCC 100%)" }} />
            </div>
            <FloatingElements />
            <div className="relative z-10 flex flex-col items-center text-center px-10">
                <div className="bg-white rounded-full shadow-2xl overflow-hidden w-28 h-28 flex items-center justify-center mb-5">
                    <img src={logo} alt="SCOPH URL" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-white text-3xl font-extrabold tracking-wide mb-2 drop-shadow-lg">SCOPH - URL</h1>
                <p className="text-orange-100 text-base font-medium mb-5">Gestor de Jornadas Médicas</p>
                <div className="w-12 h-1 bg-white/40 rounded-full mb-5" />
                <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                    Optimizando la salud, <br />
                    <span className="text-white font-semibold">organizando el futuro.</span>
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
    );

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative"
            style={{ background: "linear-gradient(135deg, #F2F2F0 0%, #F2BB77 100%)" }}>
            <BackgroundElements />

            <div className="relative z-10 w-full max-w-4xl min-h-[580px] flex rounded-3xl shadow-2xl overflow-hidden">
                <LeftPanel />

                <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-10">
                    <div className="w-full max-w-sm">

                        {/* Paso 1 - Ingresar correo */}
                        {step === 1 && (
                            <div>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border-2 border-primary bg-transparent">
                                    <EnvelopeIcon className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-gray-800 text-2xl font-extrabold mb-1">Recuperar contraseña</h2>
                                <p className="text-gray-400 text-sm mb-7">Ingresa tu correo registrado y te enviaremos un código de verificación.</p>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                                        <p className="text-xs text-red-500 font-medium">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleEmailSubmit} className="space-y-5">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-gray-600">Correo electrónico</label>
                                        <input type="email" value={correo} onChange={(e) => { setCorreo(e.target.value); setError(""); }}
                                            placeholder="ejemplo@scoph.org"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                                            required />
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full text-white font-bold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-xl active:scale-95 text-base disabled:opacity-60"
                                        style={{ background: "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)" }}>
                                        {loading ? "Enviando..." : "Enviar código de verificación"}
                                    </button>
                                    <button type="button" onClick={() => navigate("/login")}
                                        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-400 hover:text-primary transition font-medium">
                                        <ArrowLeftIcon className="w-4 h-4" />Volver al inicio de sesión
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Paso 2 - Ingresar código y nueva contraseña */}
                        {step === 2 && (
                            <div>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border-2 border-primary bg-transparent">
                                    <KeyIcon className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-gray-800 text-2xl font-extrabold mb-1">Código de verificación</h2>
                                <p className="text-gray-400 text-sm mb-2">Ingresa el código de 6 dígitos enviado a:</p>
                                <p className="text-primary font-semibold text-sm mb-5 truncate">{correo}</p>

                                {successMessage && (
                                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
                                        <p className="text-xs text-green-600 font-medium">{successMessage}</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                                        <p className="text-xs text-red-500 font-medium">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleCodeSubmit} className="space-y-5">
                                    {/* Campos del código */}
                                    <div className="flex gap-2 justify-between">
                                        {code.map((digit, index) => (
                                            <input key={index} id={`code-${index}`} type="text" inputMode="numeric"
                                                maxLength={1} value={digit}
                                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                                className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
                                            />
                                        ))}
                                    </div>

                                    {/* Nueva contraseña */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-gray-600">Nueva contraseña</label>
                                        <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                                            placeholder="Mínimo 8 caracteres"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                                            required />
                                    </div>

                                    {/* Confirmar contraseña */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-gray-600">Confirmar contraseña</label>
                                        <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 placeholder-gray-300 transition"
                                            required />
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full text-white font-bold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-xl active:scale-95 text-base disabled:opacity-60"
                                        style={{ background: "linear-gradient(135deg, #F27405 0%, #D97236 60%, #F29863 100%)" }}>
                                        {loading ? "Verificando..." : "Restablecer contraseña"}
                                    </button>

                                    <div className="flex flex-col items-center gap-2">
                                        <button type="button" onClick={() => { setStep(1); setError(""); setSuccessMessage(""); }}
                                            className="text-sm text-gray-400 hover:text-primary transition font-medium">
                                            ¿No recibiste el código? <span className="text-primary font-semibold">Reenviar</span>
                                        </button>
                                        <button type="button" onClick={() => navigate("/login")}
                                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition font-medium">
                                            <ArrowLeftIcon className="w-4 h-4" />Volver al inicio de sesión
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <p className="absolute bottom-4 left-0 right-0 text-center text-gray-400/60 text-xs">
                © 2025 SCOPH - URL · Todos los derechos reservados
            </p>
        </div>
    );
}