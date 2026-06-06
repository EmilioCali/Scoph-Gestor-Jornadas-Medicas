import { useState, useEffect, useCallback } from "react";
import {
    getMedicines,
    createMedicine,
    updateMedicine,
    toggleMedicineStatus,
} from "../../../shared/apis/coreService";

export function useMedicines() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicines = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await getMedicines();
            setMedicines(data.data);
        } catch (err) {
            setError(err.response?.data?.message ?? "Error al cargar medicamentos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const create = useCallback(async (formData) => {
        const { data } = await createMedicine(formData);
        setMedicines((prev) => [...prev, data.data]);
        return data.data;
    }, []);

    const update = useCallback(async (id, formData) => {
        const { data } = await updateMedicine(id, formData);
        setMedicines((prev) =>
            prev.map((m) => (m._id === id ? data.data : m))
        );
        return data.data;
    }, []);

    const toggleStatus = useCallback(async (id, status) => {
        const { data } = await toggleMedicineStatus(id, status);
        setMedicines((prev) =>
            prev.map((m) => (m._id === id ? data.data : m))
        );
        return data.data;
    }, []);

    return { medicines, loading, error, refetch: fetchMedicines, create, update, toggleStatus };
}