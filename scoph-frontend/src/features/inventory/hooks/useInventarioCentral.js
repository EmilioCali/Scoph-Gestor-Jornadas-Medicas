import { useState, useEffect, useCallback } from "react";
import { getMedicines } from "../../../shared/apis/coreService";
import {
    getCentralInventory,
    addToCentralInventory,
    registerEntry,
    registerSalidaReceta,
} from "../../../shared/apis/coreService";

export function useInventarioCentral() {
    const [inventory, setInventory] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carga en paralelo el inventario y el catálogo de medicamentos
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [invRes, medRes] = await Promise.all([
                getCentralInventory(),
                getMedicines(),
            ]);
            setInventory(invRes.data.data);
            setMedicines(medRes.data.data);
        } catch (err) {
            setError(err.response?.data?.message ?? "Error al cargar el inventario");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAll();
    }, [fetchAll]);

    // Medicamentos activos que aún no tienen registro en inventario central
    const availableMedicines = medicines.filter(
        (m) => m.status === "ACTIVO" && !inventory.some((i) => String(i.medicineId) === String(m._id))
    );

    // Agrega medicamento al inventario (con o sin stock inicial)
    const addToInventory = useCallback(async (formData) => {
        const { data } = await addToCentralInventory(formData);
        await fetchAll(); // Recargar para obtener el registro completo con populate
        return data.data;
    }, [fetchAll]);

    // Entrada de stock (COMPRA o DONACION)
    const registrarEntrada = useCallback(async ({ item, tipoEntrada, batch, expirationDate, quantity }) => {
        const body = {
            tipoEntrada,
            destination: { type: "INVENTARIO_CENTRAL", id: null },
            detalle: [{
                medicineId: String(item.medicineId),
                batch,
                quantity: Number(quantity),
                expirationDate,
            }],
        };
        const { data } = await registerEntry(body);
        // Actualizar el item en el array local con los nuevos totales
        await fetchAll();
        return data.data;
    }, [fetchAll]);

    // Salida por receta
    const registrarSalida = useCallback(async ({ item, batch, quantity }) => {
        const body = {
            detalle: [{
                medicineId: String(item.medicineId),
                batch,
                quantity: Number(quantity),
            }],
        };
        const { data } = await registerSalidaReceta(body);
        await fetchAll();
        return data.data;
    }, [fetchAll]);

    return {
        inventory,
        loading,
        error,
        refetch: fetchAll,
        availableMedicines,
        addToInventory,
        registrarEntrada,
        registrarSalida,
    };
}
