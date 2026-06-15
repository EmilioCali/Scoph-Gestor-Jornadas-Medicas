// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\auth\hooks\useAuth.js
import { useState, useCallback } from 'react';
import authClient from '../../../shared/api/authClient.js';
import { ENDPOINTS } from '../../../shared/constants/endpoints.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);

  const normalizeLoginCredentials = useCallback((credentials) => {
    const identifier = credentials.emailOrUsername?.trim() || credentials.username?.trim() || credentials.correo?.trim();
    const password = credentials.password?.trim();

    return identifier?.includes('@')
      ? { correo: identifier, password }
      : { username: identifier, password };
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authClient.post(ENDPOINTS.LOGIN, normalizeLoginCredentials(credentials));
      const accessToken = response.data?.accessToken || response.data?.token || response.data?.access_token;
      const refreshToken = response.data?.refreshToken || response.data?.refresh_token;
      const user = response.data?.userDetails || response.data?.user || response.data?.user_details || response.data?.userData || response.data?.userData;

      if (!accessToken || !user) {
        throw new Error('Respuesta de autenticación inválida');
      }

      await loginStore(accessToken, user, refreshToken);
      return response.data;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loginStore, normalizeLoginCredentials]);

  const handleRegister = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authClient.post(ENDPOINTS.REGISTER, data);
      return response.data;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error al registrar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutStore();
  }, [logoutStore]);

  return {
    handleLogin,
    handleRegister,
    loading,
    error,
    logout
  };
}
