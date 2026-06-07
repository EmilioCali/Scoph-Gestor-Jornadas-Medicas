import { useState } from "react";
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowsRightLeftIcon,
    ArrowPathIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import { useMovimientos } from "../hooks/useMovimientos";

// ── Helpers visuales ──────────────────────────────────────────────────────────

function getTypeBadge(type) {
    if (type === "ENTRADA") return <Badge variant="success"><span className="flex items-center gap-1"><ArrowUpIcon className="w-3 h-3" />Entrada</span></Badge>;
    if (type === "SALIDA") return <Badge variant="danger"><span className="flex items-center gap-1"><ArrowDownIcon className="w-3 h-3" />Salida</span></Badge>;
    return <Badge variant="info"><span className="flex items-center gap-1"><ArrowsRightLeftIcon className="w-3 h-3" />Transferencia</span></Badge>;
}

function getSubTypeBadge(subType) {
    const map = {
        DONACION: { variant: "success", label: "Donación" },
        COMPRA: { variant: "primary", label: "Compra" },
        RECETA: { variant: "warning", label: "Receta" },
        CONSUMO_JORNADA: { variant: "warning", label: "Consumo Jornada" },
        ASIGNACION_JORNADA: { variant: "info", label: "Asignación Jornada" },
        RETORNO_JORNADA: { variant: "success", label: "Retorno Jornada" },
    };
    const config = map[subType] ?? { variant: "gray", label: subType };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getStatusBadge(status) {
    if (status === "APLICADO") return <Badge variant="success">Aplicado</Badge>;
    if (status === "CANCELADO") return <Badge variant="danger">Cancelado</Badge>;
    return <Badge variant="warning">Pendiente</Badge>;
}

// ── Detalle de movimiento ─────────────────────────────────────────────────────

function DetalleModal({ movimiento, onClose }) {
    if (!movimiento) return null;
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Tipo</p>
                    <div className="mt-1">{getTypeBadge(movimiento.type)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Subtipo</p>
                    <div className="mt-1">{getSubTypeBadge(movimiento.subType)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Estado</p>
                    <div className="mt-1">{getStatusBadge(movimiento.status)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Usuario</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{movimiento.userId}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Origen</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{movimiento.origin?.type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Destino</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{movimiento.destination?.type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 col-span-2">
                    <p className="text-xs text-gray-400">Fecha aplicación</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                        {movimiento.appliedAt
                            ? new Date(movimiento.appliedAt).toLocaleString("es-GT")
                            : "—"}
                    </p>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Detalle de medicamentos</p>
                <div className="space-y-2">
                    {movimiento.detail?.map((d, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">{d.medicationSnapshot?.name}</p>
                                <p className="text-xs text-gray-400">
                                    {d.medicationSnapshot?.concentration} · Lote: {d.batch}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Vence: {new Date(d.expirationDate).toLocaleDateString("es-GT")}
                                </p>
                            </div>
                            <p className="text-lg font-extrabold text-gray-700">{d.quantity} uds.</p>
                        </div>
                    ))}
                </div>
            </div>

            {movimiento.metadata?.reason && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Observación</p>
                    <p className="text-sm text-gray-700 mt-1">{movimiento.metadata.reason}</p>
                </div>
            )}

            <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={onClose}>Cerrar</Button>
            </div>
        </div>
    );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function MovimientosPage() {
    const { movimientos, total, loading, error, filtros, refetch, aplicarFiltros, cambiarPagina } = useMovimientos();

    const [modalDetalle, setModalDetalle] = useState(false);
    const [selectedMovimiento, setSelectedMovimiento] = useState(null);

    const [busqueda, setBusqueda] = useState("");
    const [filtroType, setFiltroType] = useState("");
    const [filtroSubType, setFiltroSubType] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");

    const totalPaginas = Math.ceil(total / filtros.limit);

    const handleBuscar = () => {
        aplicarFiltros({
            type: filtroType || undefined,
            subType: filtroSubType || undefined,
            fecha: filtroFecha || undefined,
        });
    };

    const handleLimpiar = () => {
        setFiltroType("");
        setFiltroSubType("");
        setFiltroFecha("");
        setBusqueda("");
        aplicarFiltros({ type: undefined, subType: undefined, fecha: undefined });
    };

    const columnas = [
        {
            key: "createdAt", label: "Fecha",
            render: (row) => (
                <div>
                    <p className="text-sm font-semibold text-gray-700">
                        {new Date(row.createdAt).toLocaleDateString("es-GT")}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(row.createdAt).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
            ),
        },
        { key: "type", label: "Tipo", render: (row) => getTypeBadge(row.type) },
        { key: "subType", label: "Subtipo", render: (row) => getSubTypeBadge(row.subType) },
        {
            key: "detail", label: "Medicamento",
            render: (row) => (
                <div>
                    <p className="text-sm font-semibold text-gray-700">
                        {row.detail?.[0]?.medicationSnapshot?.name ?? "—"}
                    </p>
                    {row.detail?.length > 1 && (
                        <p className="text-xs text-gray-400">+{row.detail.length - 1} más</p>
                    )}
                </div>
            ),
        },
        {
            key: "quantity", label: "Cantidad",
            render: (row) => (
                <p className="font-semibold text-gray-700">
                    {row.detail?.reduce((acc, d) => acc + d.quantity, 0) ?? 0} uds.
                </p>
            ),
        },
        { key: "status", label: "Estado", render: (row) => getStatusBadge(row.status) },
        {
            key: "acciones", label: "Detalle",
            render: (row) => (
                <Button variant="outline" size="sm"
                    onClick={() => { setSelectedMovimiento(row); setModalDetalle(true); }}>
                    Ver
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Movimientos de Inventario"
                subtitle="Historial de entradas, salidas y transferencias"
                action={
                    <Button variant="outline" size="md" onClick={refetch} disabled={loading} title="Recargar">
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                }
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={refetch}>Reintentar</Button>
                </div>
            )}

            {/* Tarjetas resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Total</p>
                    <p className="text-2xl font-extrabold text-gray-800">{total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Entradas</p>
                    <p className="text-2xl font-extrabold text-green-500">
                        {movimientos.filter((m) => m.type === "ENTRADA").length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Salidas</p>
                    <p className="text-2xl font-extrabold text-red-500">
                        {movimientos.filter((m) => m.type === "SALIDA").length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Transferencias</p>
                    <p className="text-2xl font-extrabold text-blue-500">
                        {movimientos.filter((m) => m.type === "TRANSFERENCIA").length}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400 font-medium">Tipo</label>
                        <select value={filtroType} onChange={(e) => setFiltroType(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-primary transition">
                            <option value="">Todos</option>
                            <option value="ENTRADA">Entrada</option>
                            <option value="SALIDA">Salida</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400 font-medium">Subtipo</label>
                        <select value={filtroSubType} onChange={(e) => setFiltroSubType(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-primary transition">
                            <option value="">Todos</option>
                            <option value="DONACION">Donación</option>
                            <option value="COMPRA">Compra</option>
                            <option value="RECETA">Receta</option>
                            <option value="CONSUMO_JORNADA">Consumo Jornada</option>
                            <option value="ASIGNACION_JORNADA">Asignación Jornada</option>
                            <option value="RETORNO_JORNADA">Retorno Jornada</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400 font-medium">Fecha</label>
                        <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-primary transition"
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button variant="primary" size="md" onClick={handleBuscar} disabled={loading}>
                            <FunnelIcon className="w-4 h-4" /> Filtrar
                        </Button>
                        <Button variant="ghost" size="md" onClick={handleLimpiar} disabled={loading}>
                            Limpiar
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    Mostrando <span className="font-semibold text-gray-600">{movimientos.length}</span> de{" "}
                    <span className="font-semibold text-gray-600">{total}</span> movimientos
                    {" · "}Página <span className="font-semibold text-gray-600">{filtros.page}</span> de{" "}
                    <span className="font-semibold text-gray-600">{totalPaginas || 1}</span>
                </p>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Table
                    columns={columnas}
                    data={movimientos}
                    loading={loading}
                    emptyMessage="No se encontraron movimientos con los filtros aplicados"
                />

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Button variant="outline" size="sm"
                            onClick={() => cambiarPagina(filtros.page - 1)}
                            disabled={filtros.page <= 1 || loading}>
                            Anterior
                        </Button>
                        <span className="text-sm text-gray-500">
                            {filtros.page} / {totalPaginas}
                        </span>
                        <Button variant="outline" size="sm"
                            onClick={() => cambiarPagina(filtros.page + 1)}
                            disabled={filtros.page >= totalPaginas || loading}>
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal detalle */}
            <Modal isOpen={modalDetalle} onClose={() => setModalDetalle(false)}
                title={`Movimiento — ${selectedMovimiento?.subType}`} size="md">
                <DetalleModal movimiento={selectedMovimiento} onClose={() => setModalDetalle(false)} />
            </Modal>
        </div>
    );
}