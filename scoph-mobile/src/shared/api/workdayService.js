import authClient from './authClient.js';
import Constants from 'expo-constants';

const WORKDAY_BASE_URL = (
  Constants?.expoConfig?.extra?.WORKDAY_SERVICE_URL ||
  process.env.WORKDAY_SERVICE_URL ||
  process.env.API_URL ||
  'http://localhost:3021'
);

// GET /api/v1/workdays
export const getWorkdays = () => authClient.get(`${WORKDAY_BASE_URL}/api/v1/workdays`);

// GET /api/v1/workdays/:id
export const getWorkday = (id) => authClient.get(`${WORKDAY_BASE_URL}/api/v1/workdays/${id}`);

// POST /api/v1/workdays
export const createWorkday = (payload) => authClient.post(`${WORKDAY_BASE_URL}/api/v1/workdays`, payload);

// PUT /api/v1/workdays/:id
export const updateWorkday = (id, payload) =>
  authClient.put(`${WORKDAY_BASE_URL}/api/v1/workdays/${id}`, payload);

// PATCH /api/v1/workdays/:id/status
export const changeWorkdayStatus = (id, status) =>
  authClient.patch(`${WORKDAY_BASE_URL}/api/v1/workdays/${id}/status`, { status });

// DELETE /api/v1/workdays/:id
export const deleteWorkday = (id) => authClient.delete(`${WORKDAY_BASE_URL}/api/v1/workdays/${id}`);

export default authClient;
