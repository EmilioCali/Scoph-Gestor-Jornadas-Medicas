// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\inventory\hooks\useMovements.js
import { useState, useCallback } from "react";
import { coreClient } from "../../../shared/api/userClient.js";

export const useMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await coreClient.get("/api/movements");
      const data = response.data.data || response.data;
      setMovements(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error al cargar movimientos.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { movements, loading, error, fetchMovements };
};
