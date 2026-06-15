// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\inventory\hooks\useInventory.js
import { useState, useEffect, useCallback } from 'react';
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  toggleMedicineStatus
} from '../../../shared/api/coreService.js';

export function useInventory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [central, setCentral] = useState([]);
  const [movements, setMovements] = useState([]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getMedicines();
      setCatalog(data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const create = useCallback(async (payload) => {
    const { data } = await createMedicine(payload);
    setCatalog((prev) => [...prev, data.data]);
    return data.data;
  }, []);

  const update = useCallback(async (id, payload) => {
    const { data } = await updateMedicine(id, payload);
    setCatalog((prev) => prev.map((item) => (item._id === id ? data.data : item)));
    return data.data;
  }, []);

  const toggleStatus = useCallback(async (id, status) => {
    const { data } = await toggleMedicineStatus(id, status);
    setCatalog((prev) => prev.map((item) => (item._id === id ? data.data : item)));
    return data.data;
  }, []);

  return {
    loading,
    error,
    catalog,
    central,
    movements,
    refetch: fetchInventory,
    create,
    update,
    toggleStatus
  };
}
