import { useState, useEffect, useCallback } from "react";
import {
  getMeasureUnits,
  createMeasureUnit,
  updateMeasureUnit,
  deleteMeasureUnit,
} from "../../../shared/apis/coreService";

export function useMeasureUnits(enabled = true) {
  const [measureUnits, setMeasureUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeasureUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMeasureUnits();
      setMeasureUnits(data.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al cargar unidades de medida");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchMeasureUnits();
  }, [enabled, fetchMeasureUnits]);

  const create = useCallback(async (formData) => {
    const { data } = await createMeasureUnit(formData);
    setMeasureUnits((prev) => [...prev, data.data]);
    return data.data;
  }, []);

  const update = useCallback(async (id, formData) => {
    const { data } = await updateMeasureUnit(id, formData);
    setMeasureUnits((prev) => prev.map((item) => (item._id === id ? data.data : item)));
    return data.data;
  }, []);

  const remove = useCallback(async (id) => {
    const { data } = await deleteMeasureUnit(id);
    setMeasureUnits((prev) => prev.filter((item) => item._id !== id));
    return data.data;
  }, []);

  return {
    measureUnits,
    loading,
    error,
    refetch: fetchMeasureUnits,
    create,
    update,
    remove,
  };
}
