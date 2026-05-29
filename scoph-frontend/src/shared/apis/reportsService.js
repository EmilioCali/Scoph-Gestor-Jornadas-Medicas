import { reportsAPI } from "./axios.config";

//  REPORTS 
// GET /api/v1/reportes/dashboard
export const getDashboardMetrics = () =>
  reportsAPI.get("/api/v1/reportes/dashboard");

// GET /api/v1/reportes/stock
export const getStockReport = () =>
  reportsAPI.get("/api/v1/reportes/stock");

// GET /api/v1/reportes/vencimientos?dias=30
export const getExpirationReport = (dias = 30) =>
  reportsAPI.get("/api/v1/reportes/vencimientos", { params: { dias } });

// GET /api/v1/reportes/movimientos (con filtros y paginación)
export const getMovementsReport = (params) =>
  reportsAPI.get("/api/v1/reportes/movimientos", { params });

// GET /api/v1/reportes/consumo-jornada/:id
export const getWorkdayConsumption = (id) =>
  reportsAPI.get(`/api/v1/reportes/consumo-jornada/${id}`);

// GET /api/v1/reportes/jornada/:jornadaId
export const getWorkdayReport = (jornadaId) =>
  reportsAPI.get(`/api/v1/reportes/jornada/${jornadaId}`);

// GET /api/v1/reportes/alertas/stock-bajo
export const getLowStockAlerts = () =>
  reportsAPI.get("/api/v1/reportes/alertas/stock-bajo");

// GET /api/v1/reportes/alertas/vencimientos?dias=30
export const getExpirationAlerts = (dias = 30) =>
  reportsAPI.get("/api/v1/reportes/alertas/vencimientos", { params: { dias } });

// GET /api/v1/reportes/auditoria
export const getAuditReport = (params) =>
  reportsAPI.get("/api/v1/reportes/auditoria", { params });

// GET /api/v1/reportes/consistencia
export const getConsistencyReport = () =>
  reportsAPI.get("/api/v1/reportes/consistencia");

//  Exportaciones 
// El backend genera los archivos, el frontend simplemente los descarga como blob.

// Función de utilidad para descargar archivos desde el backend.
const downloadFile = async (url, fileName) => {
  const response = await reportsAPI.get(url, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

// Exportar movimientos
export const exportMovementsExcel = () =>
  downloadFile("/api/v1/reportes/exportar/movimientos/Excel", "movements.xlsx");
export const exportMovementsPDF = () =>
  downloadFile("/api/v1/reportes/exportar/movimientos/pdf", "movements.pdf");

// Exportar  stock
export const exportStockExcel = () =>
  downloadFile("/api/v1/reportes/exportar/stock/Excel", "stock.xlsx");
export const exportStockPDF = () =>
  downloadFile("/api/v1/reportes/exportar/stock/pdf", "stock.pdf");

// Exportar jornadas
export const exportWorkdaysExcel = () =>
  downloadFile("/api/v1/reportes/exportar/jornadas/Excel", "workdays.xlsx");
export const exportWorkdaysPDF = () =>
  downloadFile("/api/v1/reportes/exportar/jornadas/pdf", "workdays.pdf");

// Exportar consumo
export const exportConsumptionExcel = () =>
  downloadFile("/api/v1/reportes/exportar/consumo/Excel", "consumption.xlsx");
export const exportConsumptionPDF = () =>
  downloadFile("/api/v1/reportes/exportar/consumo/pdf", "consumption.pdf");