import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addToCentralInventory,
  getCentralInventory,
  getMedicines,
  registerEntry,
  registerSalidaReceta
} from '../../../shared/api/coreService.js';

export function useInventarioCentral() {
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [inventoryResponse, medicinesResponse] = await Promise.all([
        getCentralInventory(),
        getMedicines()
      ]);
      setInventory(inventoryResponse.data?.data ?? []);
      setMedicines(medicinesResponse.data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const availableMedicines = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.status === 'ACTIVO' &&
          !inventory.some((item) => String(item.medicineId) === String(medicine._id))
      ),
    [inventory, medicines]
  );

  const addToInventory = useCallback(
    async (formData) => {
      const { data } = await addToCentralInventory(formData);
      await fetchAll();
      return data.data;
    },
    [fetchAll]
  );

  const registrarEntrada = useCallback(
    async ({ item, tipoEntrada, batch, expirationDate, quantity }) => {
      const payload = {
        tipoEntrada,
        destination: { type: 'INVENTARIO_CENTRAL', id: null },
        detalle: [
          {
            medicineId: String(item.medicineId),
            batch,
            quantity: Number(quantity),
            expirationDate
          }
        ]
      };
      const { data } = await registerEntry(payload);
      await fetchAll();
      return data.data;
    },
    [fetchAll]
  );

  const registrarSalida = useCallback(
    async ({ item, batch, quantity }) => {
      const payload = {
        detalle: [
          {
            medicineId: String(item.medicineId),
            batch,
            quantity: Number(quantity)
          }
        ]
      };
      const { data } = await registerSalidaReceta(payload);
      await fetchAll();
      return data.data;
    },
    [fetchAll]
  );

  return {
    inventory,
    loading,
    error,
    refetch: fetchAll,
    availableMedicines,
    addToInventory,
    registrarEntrada,
    registrarSalida
  };
}
