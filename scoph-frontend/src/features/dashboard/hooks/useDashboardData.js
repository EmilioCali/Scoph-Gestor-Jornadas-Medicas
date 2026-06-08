import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDashboardMetrics,
  getLowStockAlerts,
  getExpirationAlerts,
} from "../../../shared/apis/reportsService";

const emptyMetrics = {
  totalMedicamentos: 0,
  jornadasActivas: 0,
  alertasVencimiento: 0,
  movimientosMes: 0,
  estadisticasJornadas: {
    total: 0,
    activas: 0,
    planificadas: 0,
    finalizadas: 0,
  },
};

const emptyChart = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
].map((month) => ({ month, entries: 0, exits: 0 }));

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

export function useDashboardData() {
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [movementsChart, setMovementsChart] = useState(emptyChart);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [expirationAlerts, setExpirationAlerts] = useState([]);
  const [recentWorkdays, setRecentWorkdays] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, stockRes, expirationRes] = await Promise.all([
        getDashboardMetrics(),
        getLowStockAlerts(),
        getExpirationAlerts(60),
      ]);

      const dashboard = dashboardRes.data.data ?? {};
      const stockData = stockRes.data.data ?? dashboard.alertasStock ?? [];
      const expirationData = expirationRes.data.data ?? dashboard.vencimientosProximos ?? [];

      setMetrics({
        ...emptyMetrics,
        ...dashboard,
        alertasVencimiento: expirationData.length,
        stockBajo: stockData.length,
      });
      setMovementsChart(dashboard.movimientosPorMes?.length ? dashboard.movimientosPorMes : emptyChart);
      setStockAlerts(stockData.map(normalizeStockAlert));
      setExpirationAlerts(expirationData.map(normalizeExpirationAlert));
      setRecentWorkdays((dashboard.jornadasRecientes ?? []).map(normalizeWorkday));
      setUpdatedAt(dashboard.actualizadoEn ?? new Date().toISOString());
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const workdayStats = useMemo(() => metrics.estadisticasJornadas ?? emptyMetrics.estadisticasJornadas, [metrics]);

  return {
    metrics,
    movementsChart,
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
