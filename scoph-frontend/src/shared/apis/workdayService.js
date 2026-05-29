import { workdayAPI } from "./axios.config";

// WORKDAYS 
// GET /api/v1/workdays
export const getWorkdays = () =>
    workdayAPI.get("/api/v1/workdays");

// GET /api/v1/workdays/:id
export const getWorkday = (id) =>
    workdayAPI.get(`/api/v1/workdays/${id}`);

// POST /api/v1/workdays
// Note: The manager is taken from the JWT, only the name is sent as a snapshot
export const createWorkday = (data) =>
    workdayAPI.post("/api/v1/workdays", data);

// PUT /api/v1/workdays/:id
export const updateWorkday = (id, data) =>
    workdayAPI.put(`/api/v1/workdays/${id}`, data);

// DELETE /api/v1/workdays/:id
export const deleteWorkday = (id) =>
    workdayAPI.delete(`/api/v1/workdays/${id}`);