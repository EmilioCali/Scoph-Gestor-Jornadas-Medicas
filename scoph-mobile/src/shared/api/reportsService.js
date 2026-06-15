import authClient from './authClient.js';
import Constants from 'expo-constants';

const REPORTS_BASE_URL = (
  Constants?.expoConfig?.extra?.REPORTS_SERVICE_URL ||
  process.env.REPORTS_SERVICE_URL ||
  process.env.API_URL ||
  'http://localhost:3023'
);

// GET /api/v1/reportes/dashboard
export const getDashboardMetrics = () =>
  authClient.get(`${REPORTS_BASE_URL}/api/v1/reportes/dashboard`);

// GET /api/v1/reportes/stock
export const getStockReport = () =>
  authClient.get(`${REPORTS_BASE_URL}/api/v1/reportes/stock`);

// GET /api/v1/reportes/movimientos
export const getMovementsReport = (params) =>
  authClient.get(`${REPORTS_BASE_URL}/api/v1/reportes/movimientos`, { params });

// GET /api/v1/reportes/alertas/stock-bajo
export const getLowStockAlerts = () =>
  authClient.get(`${REPORTS_BASE_URL}/api/v1/reportes/alertas/stock-bajo`);

// GET /api/v1/reportes/alertas/vencimientos?dias=60
export const getExpirationAlerts = (dias = 60) =>
  authClient.get(`${REPORTS_BASE_URL}/api/v1/reportes/alertas/vencimientos`, { params: { dias } });

export default authClient;
