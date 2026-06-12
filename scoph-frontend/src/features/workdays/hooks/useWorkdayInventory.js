import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getWorkdays,
  createWorkday,
  deleteWorkday,
} from "../../../shared/apis/workdayService";
import {
  getCentralInventory,
  getWorkdayInventory,
  registerTransfer,
  registerConsumption,
  registerReturn,
} from "../../../shared/apis/coreService";
import { getUsers } from "../../../shared/apis/authService.js";

function normalizeWorkdayInventoryItem(item) {
  const medicine =
    item.medicineId && typeof item.medicineId === "object"
      ? item.medicineId
      : {};
  const medicineId = medicine._id ?? item.medicineId;

  return {
    ...item,
    inventoryId: item._id,
    medicineId,
    name: medicine.name ?? item.name ?? "Medicamento sin nombre",
    compound: medicine.compound ?? "",
    category: medicine.category ?? "",
    unitOfMeasure: medicine.unitOfMeasure ?? "uds.",
    totalStock: Number(item.totalStock ?? 0),
    lots: (item.lots ?? []).map((lot) => ({
      ...lot,
      stock: Number(lot.stock ?? 0),
    })),
  };
}

async function getNormalizedWorkdayInventory(workdayId) {
  const { data } = await getWorkdayInventory(workdayId);
  return (data.data ?? []).map(normalizeWorkdayInventoryItem);
}

export function useWorkdayInventory() {
  const [workdays, setWorkdays] = useState([]);
  const [users, setUsers] = useState([]);
  const [centralInventory, setCentralInventory] = useState([]);
  const [workdayInventoryById, setWorkdayInventoryById] = useState({});
  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBaseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [workdaysRes, centralRes, userRes] = await Promise.all([
        getWorkdays(),
        getCentralInventory(),
        getUsers(),
      ]);
      const loadedWorkdays = workdaysRes.data.data ?? [];
      const inventoryEntries = await Promise.all(
        loadedWorkdays.map(async (workday) => [
          workday._id,
          await getNormalizedWorkdayInventory(workday._id),
        ]),
      );

      setWorkdays(loadedWorkdays);
      setCentralInventory(centralRes.data.data ?? []);
      const usersList =
        userRes.data?.data || userRes.data?.users || userRes.data || [];
      setUsers(Array.isArray(usersList) ? usersList : []);
      setWorkdayInventoryById(Object.fromEntries(inventoryEntries));
    } catch (err) {
      setError(
        err.response?.data?.message ?? "No se pudieron cargar las jornadas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWorkdayInventory = useCallback(async (workdayId) => {
    if (!workdayId) return [];
    setInventoryLoading(true);
    setError(null);
    try {
      const inventory = await getNormalizedWorkdayInventory(workdayId);
      setWorkdayInventoryById((prev) => ({ ...prev, [workdayId]: inventory }));
      return inventory;
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "No se pudo cargar el inventario de la jornada",
      );
      return [];
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  const createNewWorkday = useCallback(
    async (payload) => {
      const { data } = await createWorkday(payload);
      await fetchBaseData();
      return data.data;
    },
    [fetchBaseData],
  );

  const removeWorkday = useCallback(
    async (workdayId) => {
      const { data } = await deleteWorkday(workdayId);
      await fetchBaseData();
      return data.data;
    },
    [fetchBaseData],
  );

  const assignMedicine = useCallback(
    async ({ workday, medicineId, batch, quantity }) => {
      const selected = centralInventory.find(
        (item) => String(item.medicineId) === String(medicineId),
      );
      const lot = selected?.lots?.find((item) => item.batch === batch);

      let formattedExpirationDate = "";
      if (lot?.expirationDate) {
        formattedExpirationDate = new Date(lot.expirationDate)
          .toISOString()
          .split("T")[0];
      }

      const body = {
        jornadaId: workday._id,
        jornadaNombre: workday.name,
        detalle: [
          {
            medicineId,
            batch,
            quantity: Number(quantity),
            expirationDate: formattedExpirationDate,
          },
        ],
      };

      const { data } = await registerTransfer(body);
      await Promise.all([fetchBaseData(), fetchWorkdayInventory(workday._id)]);
      return data.data;
    },
    [centralInventory, fetchBaseData, fetchWorkdayInventory],
  );

  const registerWorkdayConsumption = useCallback(
    async ({ item, quantity }) => {
      const { data } = await registerConsumption({
        productoId: String(item.medicineId),
        cantidad: Number(quantity),
      });
      await fetchWorkdayInventory(item.workdayId);
      return data.data;
    },
    [fetchWorkdayInventory],
  );

  const registerWorkdayReturn = useCallback(
    async ({ item, quantity }) => {
      const { data } = await registerReturn({
        productoId: String(item.medicineId),
        cantidad: Number(quantity),
      });
      await fetchWorkdayInventory(item.workdayId);
      return data.data;
    },
    [fetchWorkdayInventory],
  );

  const activeCentralInventory = useMemo(
    () =>
      centralInventory.filter(
        (item) =>
          item.totalStock > 0 && item.lots?.some((lot) => lot.stock > 0),
      ),
    [centralInventory],
  );

  return {
    workdays,
    users,
    centralInventory: activeCentralInventory,
    workdayInventoryById,
    loading,
    inventoryLoading,
    error,
    refetch: fetchBaseData,
    fetchWorkdayInventory,
    createNewWorkday,
    removeWorkday,
    assignMedicine,
    registerWorkdayConsumption,
    registerWorkdayReturn,
  };
}
