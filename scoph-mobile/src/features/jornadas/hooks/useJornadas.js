// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\jornadas\hooks\useJornadas.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getWorkdays } from '../../../shared/api/workdayService.js';

function normalizeWorkday(workday) {
  return {
    _id: workday._id,
    name: workday.name,
    description: workday.description || '',
    startDate: workday.startDate,
    endDate: workday.endDate,
    location: workday.location,
    manager: workday.manager,
    doctors: workday.doctors || [],
    status: workday.status,
    estimatedPatients: workday.estimatedPatients ?? 0,
    estimatedMedicines: workday.estimatedMedicines ?? 0
  };
}

export function useJornadas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jornadas, setJornadas] = useState([]);

  const fetchJornadas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getWorkdays();
      const workdays = response.data?.data ?? [];
      setJornadas(workdays.map(normalizeWorkday));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar jornadas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJornadas();
  }, [fetchJornadas]);

  const summary = useMemo(() => {
    const total = jornadas.length;
    const activas = jornadas.filter((j) => j.status === 'IN_PROGRESS').length;
    const planificadas = jornadas.filter((j) => j.status === 'PLANNED').length;
    const finalizadas = jornadas.filter((j) => j.status === 'FINISHED' || j.status === 'COMPLETED').length;
    const canceladas = jornadas.filter((j) => j.status === 'CANCELLED').length;

    return { total, activas, planificadas, finalizadas, canceladas };
  }, [jornadas]);

  return {
    loading,
    error,
    jornadas,
    summary,
    refetch: fetchJornadas
  };
}
