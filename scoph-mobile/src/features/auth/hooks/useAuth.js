// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\auth\hooks\useAuth.js
import { useState, useCallback } from "react";
import authClient from "../../../shared/api/authClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, logout } = useAuthStore();

  const handleLogin = useCallback(
    async (values) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authClient.post("/login", values);
        const payload = response.data ?? response;
        const accessToken = payload.accessToken || payload.token || null;
        const refreshToken = payload.refreshToken || payload.refresh_token || null;
        const user = payload.userDetails || payload.user || null;

        if (!accessToken || !refreshToken) {
          throw new Error("No se recibió un token válido del servidor.");
        }

        login(accessToken, user, refreshToken);
        return payload;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || "Error al iniciar sesión.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login],
  );

  const handleRegister = useCallback(
    async (values) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authClient.post("/register", values);
        return response.data;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || "Error al registrar usuario.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { handleLogin, handleRegister, loading, error, logout };
};
