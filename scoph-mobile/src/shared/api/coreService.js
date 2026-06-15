import Constants from 'expo-constants';
import authClient from './authClient.js';

const CORE_BASE_URL = (
  Constants?.expoConfig?.extra?.CORE_SERVICE_URL ||
  process.env.CORE_SERVICE_URL ||
  process.env.API_URL ||
  'http://localhost:3022'
);

export const getMedicines = () => authClient.get(`${CORE_BASE_URL}/api/v1/medicines`);

export const createMedicine = (payload) =>
  authClient.post(`${CORE_BASE_URL}/api/v1/medicines`, payload);

export const updateMedicine = (id, payload) =>
  authClient.put(`${CORE_BASE_URL}/api/v1/medicines/${id}`, payload);

export const toggleMedicineStatus = (id, status) =>
  authClient.patch(`${CORE_BASE_URL}/api/v1/medicines/${id}/status`, { status });

export const getCentralInventory = () =>
  authClient.get(`${CORE_BASE_URL}/api/v1/inventario-central`);

export const addToCentralInventory = (payload) =>
  authClient.post(`${CORE_BASE_URL}/api/v1/inventario-central`, payload);

export const registerEntry = (payload) =>
  authClient.post(`${CORE_BASE_URL}/api/v1/movimientos/entrada`, payload);

export const registerSalidaReceta = (payload) =>
  authClient.post(`${CORE_BASE_URL}/api/v1/movimientos/salida-receta`, payload);
