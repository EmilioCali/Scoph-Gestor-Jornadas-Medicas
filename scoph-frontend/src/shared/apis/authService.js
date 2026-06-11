import { authAPI } from "./axios.config";

// AUTH SERVICE
// POST /api/auth/login
export const login = (credentials) =>
  authAPI.post("/api/auth/login", credentials);

// POST /api/auth/change-password
export const changePassword = (data) =>
  authAPI.post("/api/auth/change-password", data);

// POST /api/auth/forgot-password
export const forgotPassword = (correo) =>
  authAPI.post("/api/auth/forgot-password", { correo });

// POST /api/auth/reset-password
export const resetPassword = (data) =>
  authAPI.post("/api/auth/reset-password", data);

// POST /api/auth/verify-email
export const verifyEmail = ({ correo, code }) =>
  authAPI.post("/api/auth/verify-email", { correo, code });

// POST /api/auth/resend-verification
export const resendVerification = (correo) =>
  authAPI.post("/api/auth/resend-verification", { correo });

// ENDPOINTS DE USUARIOS (SOLO ADMINS)
// GET /api/auth/users
export const getUsers = () => authAPI.get("/api/auth/users");

// POST /api/auth/register
export const createUser = (data) => authAPI.post("/api/auth/register", data);

// PATCH /api/auth/users/:id
export const updateUser = (id, data) =>
  authAPI.patch(`/api/auth/users/${id}`, data);

// DELETE /api/auth/users/:id
export const deleteUser = (id) => authAPI.delete(`/api/auth/users/${id}`);

// PATCH /api/auth/users/:id/status
export const updateUserStatus = (id, isActive) =>
  authAPI.patch(`/api/auth/users/${id}/status`, { isActive });
