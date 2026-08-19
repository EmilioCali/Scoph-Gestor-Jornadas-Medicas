import { useState, useEffect, useCallback } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../shared/apis/coreService";

export function useCategories(enabled = true) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCategories();
      setCategories(data.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al cargar categorías");
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
    fetchCategories();
  }, [enabled, fetchCategories]);

  const create = useCallback(async (formData) => {
    const { data } = await createCategory(formData);
    setCategories((prev) => [...prev, data.data]);
    return data.data;
  }, []);

  const update = useCallback(async (id, formData) => {
    const { data } = await updateCategory(id, formData);
    setCategories((prev) =>
      prev.map((item) => (item._id === id ? data.data : item)),
    );
    return data.data;
  }, []);

  const remove = useCallback(async (id) => {
    const { data } = await deleteCategory(id);
    setCategories((prev) => prev.filter((item) => item._id !== id));
    return data.data;
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    create,
    update,
    remove,
  };
}
