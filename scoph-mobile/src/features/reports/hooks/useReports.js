// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\reports\hooks\useReports.js
import { useState, useEffect, useCallback } from 'react';
import {
  getDashboardMetrics,
  getStockReport,
  getMovementsReport,
  getExpirationAlerts,
} from '../../../shared/api/reportsService.js';

const emptyMetrics = {
  totalMovements: 0,
  totalInventory: 0,
  totalWorkdays: 0,
  expirationAlerts: 0,
  movimientosPorMes: [],
};

function normalizeMovement(movement) {
  const firstDetail = movement.detail?.[0] || {};
  return {
    _id: movement._id,
    type: movement.type,
    subType: movement.subType,
    medicine: firstDetail.medicationSnapshot?.name || 'Medicamento desconocido',
    concentration: firstDetail.medicationSnapshot?.concentration || '',
    batch: firstDetail.batch || '',
    quantity: movement.quantity ?? 0,
    user: movement.userId || 'Desconocido',
    motive: movement.metadata?.reason || movement.metadata?.deliveryType || '',
    createdAt: movement.createdAt || movement.appliedAt || movement.updatedAt,
  };
}

function normalizeStockItem(item) {
  return {
    _id: item.medicineId || `${item.nombre}-${item.batch}`,
    name: item.nombre || 'Medicamento desconocido',
    compound: item.concentracion || '',
    totalStock: item.stockTotal ?? 0,
    minimumStock: item.stockMinimo ?? 0,
    lots: item.lotes ?? [],
  };
}

function normalizeAlert(alert) {
  return {
    _id: `${alert.medicineId}-${alert.batch}`,
    name: alert.nombre || 'Medicamento desconocido',
    batch: alert.batch,
    currentStock: alert.stock ?? 0,
    expirationDate: alert.expirationDate,
    daysRemaining: alert.diasRestantes ?? 0,
  };
}

function normalizeWorkday(workday) {
  return {
    _id: workday._id,
    name: workday.name,
    location: workday.location || 'Sin ubicación',
    manager: workday.manager || 'Sin responsable',
    status: workday.status,
    startDate: workday.startDate,
  };
}

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [stockItems, setStockItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentWorkdays, setRecentWorkdays] = useState([]);
  const [movements, setMovements] = useState([]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, stockRes, expirationRes] = await Promise.all([
        getDashboardMetrics(),
        getStockReport(),
        getExpirationAlerts(60),
      ]);

      const dashboard = dashboardRes.data.data || {};

      setMetrics({
        totalMovements: dashboard.totalMovimientos ?? 0,
        totalInventory: stockRes.data.data?.length ?? 0,
        totalWorkdays: dashboard.totalJornadas ?? 0,
        expirationAlerts: expirationRes.data.data?.length ?? 0,
        movimientosPorMes: dashboard.movimientosPorMes || [],
      });
      setStockItems((stockRes.data.data || []).map(normalizeStockItem));
      setAlerts((expirationRes.data.data || []).map(normalizeAlert));
      setRecentWorkdays((dashboard.jornadasRecientes || []).map(normalizeWorkday));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovements = useCallback(async () => {
    try {
      const response = await getMovementsReport({ page: 1, limit: 100 });
      setMovements((response.data.data || []).map(normalizeMovement));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar movimientos');
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchMovements();
  }, [fetchReports, fetchMovements]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchReports(), fetchMovements()]);
    } catch (err) {
      // Errors are already handled in individual fetch functions.
    } finally {
      setLoading(false);
    }
  }, [fetchReports, fetchMovements]);

  return {
    loading,
    error,
    metrics,
    stockItems,
    alerts,
    recentWorkdays,
    movements,
    refresh,
  };
}
