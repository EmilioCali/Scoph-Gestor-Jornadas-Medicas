// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\dashboard\hooks\useDashboard.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getDashboardMetrics,
  getLowStockAlerts,
  getExpirationAlerts,
} from '../../../shared/api/reportsService.js';

const emptyMetrics = {
  totalMedicamentos: 0,
  jornadasActivas: 0,
  stockBajo: 0,
  alertasVencimiento: 0,
  movimientosMes: 0,
  estadisticasJornadas: {
    total: 0,
    activas: 0,
    planificadas: 0,
    finalizadas: 0,
  },
};

function normalizeStockAlert(alert) {
  return {
    _id: alert.medicineId,
    name: alert.nombre || "Medicamento sin nombre",
    concentration: alert.concentracion || "",
    currentStock: Number(alert.stockTotal ?? 0),
    minimumStock: Number(alert.stockMinimo ?? 0),
  };
}

function normalizeExpirationAlert(alert) {
  return {
    _id: `${alert.medicineId}-${alert.batch}`,
    name: alert.nombre || "Medicamento sin nombre",
    batch: alert.batch,
    currentStock: Number(alert.stock ?? 0),
    expirationDate: alert.expirationDate,
    daysRemaining: Number(alert.diasRestantes ?? 0),
  };
}

function normalizeWorkday(workday) {
  return {
    _id: workday._id,
    name: workday.name,
    startDate: workday.startDate,
    location: workday.location || "Sin ubicacion",
    manager: workday.manager || "Sin responsable",
    status: workday.status,
  };
}

export function useDashboard(enabled = true) {
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [expirationAlerts, setExpirationAlerts] = useState([]);
  const [recentWorkdays, setRecentWorkdays] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [dashboardResult, stockResult, expirationResult] = await Promise.allSettled([
        getDashboardMetrics(),
        getLowStockAlerts(),
        getExpirationAlerts(60),
      ]);

      if (dashboardResult.status === "rejected") {
        throw dashboardResult.reason;
      }

      const dashboardRes = dashboardResult.value;
      const dashboard = dashboardRes.data.data ?? {};
      const stockData =
        stockResult.status === "fulfilled"
          ? stockResult.value.data.data ?? dashboard.alertasStock ?? []
          : dashboard.alertasStock ?? [];
      const expirationData =
        expirationResult.status === "fulfilled"
          ? expirationResult.value.data.data ?? dashboard.vencimientosProximos ?? []
          : dashboard.vencimientosProximos ?? [];

      setMetrics({
        ...emptyMetrics,
        ...dashboard,
        alertasVencimiento: expirationData.length,
        stockBajo: stockData.length,
      });
      setStockAlerts(stockData.map(normalizeStockAlert));
      setExpirationAlerts(expirationData.map(normalizeExpirationAlert));
      setRecentWorkdays((dashboard.jornadasRecientes ?? []).map(normalizeWorkday));
      setUpdatedAt(dashboard.actualizadoEn ?? new Date().toISOString());
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const workdayStats = useMemo(
    () => metrics.estadisticasJornadas ?? emptyMetrics.estadisticasJornadas,
    [metrics]
  );

  return {
    metrics,
    stockAlerts,
    expirationAlerts,
    recentWorkdays,
    workdayStats,
    updatedAt,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
