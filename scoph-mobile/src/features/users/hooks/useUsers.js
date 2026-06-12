// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\users\hooks\useUsers.js
import { useState, useCallback } from "react";
import { authClient } from "../../../shared/api/userClient.js";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authClient.get("/api/auth/users");
      const data = response.data.data || response.data;
      setUsers(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error al cargar usuarios.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, loading, error, fetchUsers };
};
