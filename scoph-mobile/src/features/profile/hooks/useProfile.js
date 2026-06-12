// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\profile\hooks\useProfile.js
import { useState, useCallback } from "react";
import { useAuthStore } from "../../../shared/store/authStore.js";
import { authClient } from "../../../shared/api/userClient.js";

export const useProfile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        if (!user?.id) throw new Error("User ID not found");
        const response = await authClient.patch(`/api/auth/users/${user.id}`, data);
        const updatedUser = response.data.data || response.data;
        updateUser(updatedUser);
        return updatedUser;
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Error al actualizar perfil.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return { user, loading, error, updateProfile, logout: handleLogout };
};
// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\reports\hooks\useReports.js
import { useState, useCallback } from "react";
import { reportsClient } from "../../../shared/api/userClient.js";

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsClient.get("/api/reports");
      const data = response.data.data || response.data;
      setReports(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error al cargar reportes.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { reports, loading, error, fetchReports };
};
