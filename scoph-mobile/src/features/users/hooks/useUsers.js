// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\users\hooks\useUsers.js
import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../../../shared/api/usersService.js';

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getUsers();
      const payload = response?.data;
      setUsers(payload?.users ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    loading,
    error,
    users,
    refreshUsers: fetchUsers
  };
}
