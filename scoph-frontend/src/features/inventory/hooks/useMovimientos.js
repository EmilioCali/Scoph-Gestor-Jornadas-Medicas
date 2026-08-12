import { useState, useEffect, useCallback } from "react";
import { getMovements } from "../../../shared/apis/coreService";
import { getUsers } from "../../../shared/apis/authService.js";

export function useMovimientos(filtrosIniciales = {}) {
    const [movimientos, setMovimientos] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [filtros, setFiltros] = useState({ page: 1, limit: 15, ...filtrosIniciales });

    const fetchMovimientos = useCallback(async (params = filtros) => {
        setLoading(true);
        setError(null);
        try {
            const [{ data: movimientosData }, { data: usersData }] = await Promise.all([
                getMovements(params),
                getUsers(),
            ]);

            const profileList = usersData?.data ?? usersData?.users ?? usersData ?? [];
            setMovimientos(movimientosData.data);
            setTotal(movimientosData.total);
            setUsers(Array.isArray(profileList) ? profileList : []);
        } catch (err) {
            setError(err.response?.data?.message ?? "Error al cargar movimientos");
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMovimientos(filtros);
    }, [fetchMovimientos, filtros]);

    const aplicarFiltros = useCallback((nuevosFiltros) => {
        setFiltros((prev) => ({ ...prev, ...nuevosFiltros, page: 1 }));
    }, []);

    const cambiarPagina = useCallback((page) => {
        setFiltros((prev) => ({ ...prev, page }));
    }, []);

    return {
        movimientos,
        total,
        loading,
        error,
        filtros,
        users,
        refetch: () => fetchMovimientos(filtros),
        aplicarFiltros,
        cambiarPagina,
    };
}
