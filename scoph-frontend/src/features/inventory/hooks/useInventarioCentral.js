import { useState, useEffect, useCallback, useMemo } from "react";
import { getMedicines } from "../../../shared/apis/coreService";
import {
    getCentralInventory,
    addToCentralInventory,
    registerEntry,
    registerSalidaReceta,
    updateCentralInventoryLot,
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
    const availableMedicines = useMemo(
        () =>
            medicines.filter(
                (m) =>
                    m.status === "ACTIVO" &&
                    !inventory.some(
                        (i) => String(i.medicineId) === String(m._id),
                    ),
            ),
        [inventory, medicines],
    );

    // Agrega medicamento al inventario usando la cantidad y unidad seleccionadas
    const addToInventory = useCallback(async (formData) => {
        const selectedMedicine = medicines.find(
            (medicine) => String(medicine._id) === String(formData?.medicineId),
        );
        const amount = Number(formData?.entryQuantity || 0);
        const entryUnit = formData?.entryUnit;

        const payload = {
            ...formData,
            boxes: entryUnit && String(entryUnit) === String(selectedMedicine?.packageUnit) ? amount : 0,
            blisters: entryUnit && String(entryUnit) === String(selectedMedicine?.intermediateUnit) ? amount : 0,
            units: entryUnit && String(entryUnit) === String(selectedMedicine?.minimumUnit) ? amount : 0,
            entryUnitType: entryUnit || null,
            initialStock: 0,
            minimumStock: Number(formData?.minimumStock || 0),
        };

        const { data } = await addToCentralInventory(payload);
        await fetchAll();
        return data.data;
    }, [fetchAll, medicines]);

    // Entrada de stock (COMPRA o DONACION)
    const registrarEntrada = useCallback(async ({ item, tipoEntrada, batch, expirationDate, entryQuantity, entryUnit }) => {
        const body = {
            tipoEntrada,
            destination: { type: "INVENTARIO_CENTRAL", id: null },
            detalle: [{
                medicineId: String(item.medicineId),
                batch,
                quantity: Number(entryQuantity || 0),
                boxes: entryUnit && String(entryUnit) === String(item.packageUnit) ? Number(entryQuantity || 0) : 0,
                blisters: entryUnit && String(entryUnit) === String(item.intermediateUnit) ? Number(entryQuantity || 0) : 0,
                units: entryUnit && String(entryUnit) === String(item.minimumUnit) ? Number(entryQuantity || 0) : 0,
                entryUnitType: entryUnit || null,
                expirationDate,
            }],
        };
        const { data } = await registerEntry(body);
        // Actualizar el item en el array local con los nuevos totales
        await fetchAll();
        return data.data;
    }, [fetchAll]);

    // Salida por receta
    const registrarSalida = useCallback(async ({ item, batch, entryQuantity, entryUnit }) => {
        const body = {
            detalle: [{
                medicineId: String(item.medicineId),
                batch,
                quantity: Number(entryQuantity || 0),
                boxes: entryUnit && String(entryUnit) === String(item.packageUnit) ? Number(entryQuantity || 0) : 0,
                blisters: entryUnit && String(entryUnit) === String(item.intermediateUnit) ? Number(entryQuantity || 0) : 0,
                units: entryUnit && String(entryUnit) === String(item.minimumUnit) ? Number(entryQuantity || 0) : 0,
                entryUnitType: entryUnit || null,
            }],
        };
        const { data } = await registerSalidaReceta(body);
        await fetchAll();
        return data.data;
    }, [fetchAll]);

    const editarLote = useCallback(async ({ item, currentBatch, ...formData }) => {
        const { data } = await updateCentralInventoryLot(item.medicineId, currentBatch, {
            batch: formData.batch,
            expirationDate: formData.expirationDate,
            entryQuantity: Number(formData.entryQuantity || 0),
            entryUnit: formData.entryUnit,
        });
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
        editarLote,
    };
}
