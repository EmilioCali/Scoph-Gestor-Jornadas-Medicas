import { useState, useCallback, useEffect } from 'react';
import { getMovementsReport } from '../../../shared/api/reportsService.js';

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 20,
    type: undefined,
    subType: undefined,
    fecha: undefined
  });

  const fetchMovimientos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: filtros.page,
        limit: filtros.limit,
        ...(filtros.type && { type: filtros.type }),
        ...(filtros.subType && { subType: filtros.subType }),
        ...(filtros.fecha && { fecha: filtros.fecha })
      };

      const { data } = await getMovementsReport(params);
      setMovimientos(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  const aplicarFiltros = useCallback((nuevosFiltros) => {
    setFiltros((prev) => ({
      ...prev,
      page: 1,
      ...nuevosFiltros
    }));
  }, []);

  const cambiarPagina = useCallback((nuevaPagina) => {
    setFiltros((prev) => ({
      ...prev,
      page: nuevaPagina
    }));
  }, []);

  return {
    movimientos,
    total,
    loading,
    error,
    filtros,
    refetch: fetchMovimientos,
    aplicarFiltros,
    cambiarPagina
  };
}
