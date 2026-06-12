// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\workdays\hooks\useWorkdays.js
import { useState, useCallback } from "react";
import { workdayClient } from "../../../shared/api/userClient.js";

export const useWorkdays = () => {
  const [workdays, setWorkdays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkdays = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await workdayClient.get("/api/workdays");
      const data = response.data.data || response.data;
      setWorkdays(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error al cargar jornadas.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { workdays, loading, error, fetchWorkdays };
};
