import authClient from './authClient.js';

export const getUsers = () => authClient.get('/api/auth/users');
export const createUser = (data) => authClient.post('/api/auth/register', data);
export const updateUser = (id, data) => authClient.patch(`/api/auth/users/${id}`, data);
export const deleteUser = (id) => authClient.delete(`/api/auth/users/${id}`);
export const updateUserStatus = (id, isActive) =>
  authClient.patch(`/api/auth/users/${id}`, { isActive });
