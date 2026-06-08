import { useState, useEffect, useCallback } from "react";
import {
  getWorkdays,
  getWorkday,
  createWorkday,
  updateWorkday,
  changeWorkdayStatus,
  deleteWorkday,
} from "../../../shared/apis/workdayService";

/**
 * Hook que encapsula todo el estado y operaciones CRUD de jornadas.
 * Sigue el mismo patrón que useMedicines (TKT-60).
 */
export function useWorkdays() {
  const [workdays, setWorkdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkdays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getWorkdays();
      setWorkdays(data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al cargar jornadas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkdays();
  }, [fetchWorkdays]);

  const fetchOne = useCallback(async (id) => {
    const { data } = await getWorkday(id);
    return data.data;
  }, []);

  const create = useCallback(async (payload) => {
    const { data } = await createWorkday(payload);
    setWorkdays((prev) => [data.data, ...prev]);
    return data.data;
  }, []);

  const update = useCallback(async (id, payload) => {
    const { data } = await updateWorkday(id, payload);
    setWorkdays((prev) =>
      prev.map((w) => (w._id === id ? data.data : w))
    );
    return data.data;
  }, []);

  const changeStatus = useCallback(async (id, status) => {
    const { data } = await changeWorkdayStatus(id, status);
    setWorkdays((prev) =>
      prev.map((w) => (w._id === id ? data.data : w))
    );
    return data.data;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteWorkday(id);
    setWorkdays((prev) => prev.filter((w) => w._id !== id));
  }, []);

  return {
    workdays,
    loading,
    error,
    refetch: fetchWorkdays,
    fetchOne,
    create,
    update,
    changeStatus,
    remove,
  };
}
