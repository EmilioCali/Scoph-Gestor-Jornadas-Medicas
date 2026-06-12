// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\inventory\hooks\useMedicines.js
import { useState, useCallback } from "react";
import { coreClient } from "../../../shared/api/userClient.js";

export const useMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await coreClient.get("/api/medicines");
      const data = response.data.data || response.data;
      setMedicines(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Error al cargar medicamentos.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { medicines, loading, error, fetchMedicines };
};
