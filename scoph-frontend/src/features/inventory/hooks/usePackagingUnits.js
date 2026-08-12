import { useState, useEffect, useCallback } from "react";
import {
  getPackagingUnits,
  createPackagingUnit,
  updatePackagingUnit,
  deletePackagingUnit,
} from "../../../shared/apis/coreService";

export function usePackagingUnits() {
  const [packagingUnits, setPackagingUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPackagingUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getPackagingUnits();
      setPackagingUnits(data.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al cargar unidades de empaquetado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchPackagingUnits();
  }, [fetchPackagingUnits]);

  const create = useCallback(async (formData) => {
    const { data } = await createPackagingUnit(formData);
    setPackagingUnits((prev) => [...prev, data.data]);
    return data.data;
  }, []);

  const update = useCallback(async (id, formData) => {
    const { data } = await updatePackagingUnit(id, formData);
    setPackagingUnits((prev) => prev.map((item) => (item._id === id ? data.data : item)));
    return data.data;
  }, []);

  const remove = useCallback(async (id) => {
    const { data } = await deletePackagingUnit(id);
    setPackagingUnits((prev) => prev.filter((item) => item._id !== id));
    return data.data;
  }, []);

  return {
    packagingUnits,
    loading,
    error,
    refetch: fetchPackagingUnits,
    create,
    update,
    remove,
  };
}
