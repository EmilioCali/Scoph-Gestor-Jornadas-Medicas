import { workdayAPI } from "./axios.config";

// GET /api/v1/workdays
export const getWorkdays = () =>
  workdayAPI.get("/api/v1/workdays");

// GET /api/v1/workdays/:id
export const getWorkday = (id) =>
  workdayAPI.get(`/api/v1/workdays/${id}`);

// POST /api/v1/workdays
// Body: name, dates, location, manager{userId,name}, doctors[{userId,name}], estimates, status
export const createWorkday = (data) =>
  workdayAPI.post("/api/v1/workdays", data);

// PUT /api/v1/workdays/:id
export const updateWorkday = (id, data) =>
  workdayAPI.put(`/api/v1/workdays/${id}`, data);

// PATCH /api/v1/workdays/:id/status
export const changeWorkdayStatus = (id, status) =>
  workdayAPI.patch(`/api/v1/workdays/${id}/status`, { status });

// DELETE /api/v1/workdays/:id
export const deleteWorkday = (id) =>
  workdayAPI.delete(`/api/v1/workdays/${id}`);
