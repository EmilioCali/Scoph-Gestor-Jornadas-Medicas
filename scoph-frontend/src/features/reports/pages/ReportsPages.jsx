import { useState, useMemo, useEffect, useCallback } from "react";
import {
    DocumentArrowDownIcon, TableCellsIcon, FunnelIcon,
    ArrowsRightLeftIcon, BeakerIcon, CalendarDaysIcon, ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Table from "../../../shared/components/ui/Table";
import StatCard from "../../../shared/components/ui/StatCard";
import {
    getDashboardMetrics,
    getMovementsReport,
    getStockReport,
    getExpirationAlerts,
    exportMovementsPDF,
    exportMovementsExcel,
    exportStockPDF,
    exportStockExcel,
    exportWorkdaysPDF,
    exportWorkdaysExcel,
} from "../../../shared/apis/reportsService";

const PIE_COLORS = ["#F27405", "#F2BB77", "#D97236", "#F29863", "#8B3A0F", "#FCD9A0"];

// Badge según tipo de movimiento
function getTypeBadge(type) {
    const map = {
        ENTRADA: <Badge variant="success">Entrada</Badge>,
        SALIDA: <Badge variant="danger">Salida</Badge>,
        TRANSFERENCIA: <Badge variant="info">Transferencia</Badge>,
    };
    return map[type] || <Badge>{type}</Badge>;
}

// Badge según subtipo de movimiento
function getSubtypeBadge(subType) {
    const map = {
        DONACION: <Badge variant="success">Donación</Badge>,
        COMPRA: <Badge variant="primary">Compra</Badge>,
        RECETA: <Badge variant="danger">Receta</Badge>,
        CONSUMO_JORNADA: <Badge variant="warning">Consumo Jornada</Badge>,
        ASIGNACION_JORNADA: <Badge variant="info">Asignación Jornada</Badge>,
        RETORNO_JORNADA: <Badge variant="gray">Retorno Jornada</Badge>,
    };
    return map[subType] || <Badge>{subType}</Badge>;
}

// Badge según estado de la jornada
function getWorkdayStatusBadge(status) {
    const map = {
        IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
        PLANNED: <Badge variant="info">Planificada</Badge>,
        COMPLETED: <Badge variant="gray">Finalizada</Badge>,
    };
    return map[status] || <Badge>{status}</Badge>;
}

function normalizeMovement(movement) {
    const firstDetail = movement.detail?.[0] || {};
    return {
        _id: movement._id,
        type: movement.type,
        subType: movement.subType,
        medicine: firstDetail.medicationSnapshot?.name || "Medicamento desconocido",
        concentration: firstDetail.medicationSnapshot?.concentration || "",
        batch: firstDetail.batch || "",
        quantity: firstDetail.quantity ?? 0,
        user: movement.userId || "Desconocido",
        motive: movement.metadata?.reason || movement.metadata?.deliveryType || "",
        createdAt: movement.createdAt || movement.appliedAt || movement.updatedAt,
    };
}

function normalizeStockItem(item) {
    return {
        _id: item.medicineId || `${item.nombre}-${item.batch}`,
        name: item.nombre || "Medicamento desconocido",
        compound: item.concentracion || "",
        unitOfMeasure: item.unitOfMeasure || "",
        totalStock: item.stockTotal ?? 0,
        minimumStock: item.stockMinimo ?? 0,
        lots: item.lotes ?? [],
    };
}

function normalizeExpirationAlert(alert) {
    return {
        _id: `${alert.medicineId}-${alert.batch}`,
        name: alert.nombre || "Medicamento desconocido",
        batch: alert.batch,
        currentStock: alert.stock ?? 0,
        expirationDate: alert.expirationDate,
        daysRemaining: alert.diasRestantes ?? 0,
    };
}

function normalizeWorkdayItem(workday) {
    return {
        _id: workday._id,
        name: workday.name,
        location: workday.location || "Sin ubicación",
        manager: workday.manager || "Sin responsable",
        status: workday.status,
        startDate: workday.startDate,
    };
}

export default function ReportesPage() {
    const [activeTab, setActiveTab] = useState("movements");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
    const [filtroFechaFin, setFiltroFechaFin] = useState("");

    const [metrics, setMetrics] = useState({
        totalMovements: 0,
        totalInventory: 0,
        totalWorkdays: 0,
        expirationAlerts: 0,
        movimientosPorMes: [],
    });
    const [movements, setMovements] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [workdays, setWorkdays] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [globalLoading, setGlobalLoading] = useState(true);
    const [movementsLoading, setMovementsLoading] = useState(false);
    const [error, setError] = useState(null);

    const tabs = [
        { key: "movements", label: "Movimientos", icon: ArrowsRightLeftIcon },
        { key: "inventory", label: "Inventario", icon: BeakerIcon },
        { key: "workdays", label: "Jornadas", icon: CalendarDaysIcon },
        { key: "alerts", label: "Alertas", icon: ExclamationTriangleIcon },
    ];

    // Filtra movimientos según tipo y rango de fechas
    const filteredMovements = useMemo(() => {
        return movements.filter((m) => {
            const matchType = filtroTipo ? m.type === filtroTipo : true;
            const matchStart = filtroFechaInicio ? new Date(m.createdAt) >= new Date(filtroFechaInicio) : true;
            const matchEnd = filtroFechaFin ? new Date(m.createdAt) <= new Date(filtroFechaFin) : true;
            return matchType && matchStart && matchEnd;
        });
    }, [movements, filtroTipo, filtroFechaInicio, filtroFechaFin]);

    const categoriesPie = useMemo(() => {
        const counts = inventory.reduce((acc, item) => {
            const label = item.compound || item.name || "Otros";
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [inventory]);

    const fetchMovements = useCallback(async () => {
        setMovementsLoading(true);
        setError(null);
        try {
            const params = {
                tipo: filtroTipo || undefined,
                fecha: filtroFechaInicio || undefined,
                page: 1,
                limit: 100,
            };
            const response = await getMovementsReport(params);
            const rows = response.data.data || [];
            setMovements(rows.map(normalizeMovement));
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al cargar movimientos");
        } finally {
            setMovementsLoading(false);
        }
    }, [filtroTipo, filtroFechaInicio]);

    const loadReportData = useCallback(async () => {
        setGlobalLoading(true);
        setError(null);
        try {
            const [dashboardRes, stockRes, expirationRes] = await Promise.all([
                getDashboardMetrics(),
                getStockReport(),
                getExpirationAlerts(60),
            ]);

            const dashboard = dashboardRes.data.data || {};
            setMetrics({
                totalMovements: dashboard.totalMovimientos || 0,
                totalInventory: stockRes.data.data?.length || 0,
                totalWorkdays: dashboard.totalJornadas || 0,
                expirationAlerts: dashboard.alertasVencimiento || 0,
                movimientosPorMes: dashboard.movimientosPorMes || [],
            });
            setInventory((stockRes.data.data || []).map(normalizeStockItem));
            setAlerts((expirationRes.data.data || dashboard.vencimientosProximos || []).map(normalizeExpirationAlert));
            setWorkdays((dashboard.jornadasRecientes || []).map(normalizeWorkdayItem));
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al cargar datos de reportes");
        } finally {
            setGlobalLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReportData();
    }, [loadReportData]);

    useEffect(() => {
        if (activeTab === "movements") {
            fetchMovements();
        }
    }, [activeTab, fetchMovements]);

    const handleApplyFilters = () => {
        fetchMovements();
    };

    const handleExportMovimientosPDF = async () => {
        try {
            await exportMovementsPDF();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al descargar PDF de movimientos");
        }
    };

    const handleExportMovimientosExcel = async () => {
        try {
            await exportMovementsExcel();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al descargar Excel de movimientos");
        }
    };

    // Exportar inventario a PDF
    const handleExportInventarioPDF = async () => {
        try {
            await exportStockPDF();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al descargar PDF de inventario");
        }
    };

    // Exportar inventario a Excel
    const handleExportInventarioExcel = async () => {
        try {
            await exportStockExcel();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al descargar Excel de inventario");
        }
    };

    // Exportar jornadas a PDF
    const handleExportJornadasPDF = async () => {
        try {
            await exportWorkdaysPDF();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al descargar PDF de jornadas");
        }
    };

    // Exportar jornadas a Excel
    const handleExportJornadasExcel = async () => {
        try {
            await exportWorkdaysExcel();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al descargar Excel de jornadas");
        }
    };

    // Exportar alertas a PDF
    const handleExportAlertasPDF = async () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Reporte de Alertas de Vencimiento - SCOPH URL", 14, 15);
            doc.setFontSize(10);
            doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, 14, 22);
            autoTable(doc, {
                startY: 28,
                head: [["Medicamento", "Lote", "Stock", "Fecha Vencimiento", "Días Restantes"]],
                body: alerts.map((a) => [
                    a.name, a.batch, a.currentStock,
                    new Date(a.expirationDate).toLocaleDateString("es-GT"),
                    `${a.daysRemaining} días`,
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [242, 116, 5] },
            });
            doc.save("reporte-alertas.pdf");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al descargar PDF de alertas");
        }
    };

    // Columnas tabla movimientos
    const movementColumns = [
        { key: "type", label: "Tipo", render: (row) => getTypeBadge(row.type) },
        { key: "subType", label: "Subtipo", render: (row) => getSubtypeBadge(row.subType) },
        {
            key: "medicine", label: "Medicamento",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.medicine}</p>
                    <p className="text-xs text-gray-400">Lote: {row.batch}</p>
                </div>
            ),
        },
        { key: "quantity", label: "Cantidad" },
        { key: "user", label: "Usuario" },
        { key: "motive", label: "Motivo", render: (row) => <span className="text-xs text-gray-500">{row.motive}</span> },
        { key: "createdAt", label: "Fecha", render: (row) => new Date(row.createdAt).toLocaleDateString("es-GT") },
    ];

    // Columnas tabla inventario
    const inventoryColumns = [
        {
            key: "name", label: "Medicamento",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.compound}</p>
                </div>
            ),
        },
        { key: "unitOfMeasure", label: "Unidad" },
        { key: "totalStock", label: "Stock Total" },
        { key: "minimumStock", label: "Stock Mínimo" },
        {
            key: "status", label: "Estado",
            render: (row) => row.totalStock <= 0
                ? <Badge variant="danger">Agotado</Badge>
                : row.totalStock <= row.minimumStock
                    ? <Badge variant="warning">Bajo</Badge>
                    : <Badge variant="success">Normal</Badge>,
        },
        { key: "lots", label: "Lotes", render: (row) => <span className="text-xs text-gray-500">{row.lots.length} lote(s)</span> },
    ];

    // Columnas tabla jornadas
    const workdayColumns = [
        {
            key: "name", label: "Jornada",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.location}</p>
                </div>
            ),
        },
        {
            key: "startDate", label: "Fecha Inicio",
            render: (row) => (
                <div>
                    <p className="text-sm text-gray-700">{new Date(row.startDate).toLocaleDateString("es-GT")}</p>
                </div>
            ),
        },
        { key: "manager", label: "Responsable", render: (row) => row.manager },
        { key: "status", label: "Estado", render: (row) => getWorkdayStatusBadge(row.status) },
    ];

    // Columnas tabla alertas
    const alertColumns = [
        { key: "name", label: "Medicamento" },
        { key: "batch", label: "Lote" },
        { key: "currentStock", label: "Stock" },
        { key: "expirationDate", label: "Vencimiento", render: (row) => new Date(row.expirationDate).toLocaleDateString("es-GT") },
        {
            key: "daysRemaining", label: "Días Restantes",
            render: (row) => row.daysRemaining <= 15
                ? <Badge variant="danger">{row.daysRemaining} días</Badge>
                : row.daysRemaining <= 30
                    ? <Badge variant="warning">{row.daysRemaining} días</Badge>
                    : <Badge variant="info">{row.daysRemaining} días</Badge>,
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Reportes"
                subtitle="Consultas agregadas, métricas y exportaciones del sistema"
            />

            {/* Métricas generales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Movimientos" value={metrics.totalMovements} subtitle="Registrados en el sistema" icon={ArrowsRightLeftIcon} variant="primary" />
                <StatCard title="Medicamentos en Stock" value={metrics.totalInventory} subtitle="En inventario central" icon={BeakerIcon} variant="success" />
                <StatCard title="Jornadas Registradas" value={metrics.totalWorkdays} subtitle="Total en el sistema" icon={CalendarDaysIcon} variant="warning" />
                <StatCard title="Alertas Activas" value={metrics.expirationAlerts} subtitle="Medicamentos por vencer" icon={ExclamationTriangleIcon} variant="danger" />
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-base font-extrabold text-gray-800 mb-1">Movimientos por Mes</h2>
                    <p className="text-gray-400 text-xs mb-5">Entradas y salidas durante el año</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={metrics.movimientosPorMes || []} barSize={14}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Bar dataKey="entries" name="Entradas" fill="#F27405" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="exits" name="Salidas" fill="#F2BB77" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-base font-extrabold text-gray-800 mb-1">Medicamentos por Categoría</h2>
                    <p className="text-gray-400 text-xs mb-5">Distribución del inventario central</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={categoriesPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                {categoriesPie.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabs de reportes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition whitespace-nowrap ${activeTab === key ? "text-primary border-b-2 border-primary bg-orange-50/50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}>
                            <Icon className="w-4 h-4" />{label}
                        </button>
                    ))}
                </div>

                <div className="p-6">

                    {/* Tab Movimientos */}
                    {activeTab === "movements" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
                                        className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition appearance-none">
                                        <option value="">Todos los tipos</option>
                                        <option value="ENTRADA">Entradas</option>
                                        <option value="SALIDA">Salidas</option>
                                        <option value="TRANSFERENCIA">Transferencias</option>
                                    </select>
                                </div>
                                <input type="date" value={filtroFechaInicio} onChange={(e) => setFiltroFechaInicio(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition" />
                                <input type="date" value={filtroFechaFin} onChange={(e) => setFiltroFechaFin(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition" />
                                <div className="flex gap-2 ml-auto">
                                    <Button variant="outline" size="md" onClick={handleExportMovimientosPDF}><DocumentArrowDownIcon className="w-4 h-4" />PDF</Button>
                                    <Button variant="outline" size="md" onClick={handleExportMovimientosExcel}><TableCellsIcon className="w-4 h-4" />Excel</Button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Mostrando <span className="font-semibold text-gray-600">{filteredMovements.length}</span> movimientos</p>
                            <Table columns={movementColumns} data={filteredMovements} emptyMessage="No hay movimientos registrados" />
                        </div>
                    )}

                    {/* Tab Inventario */}
                    {activeTab === "inventory" && (
                        <div className="space-y-4">
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="md" onClick={handleExportInventarioPDF}><DocumentArrowDownIcon className="w-4 h-4" />PDF</Button>
                                <Button variant="outline" size="md" onClick={handleExportInventarioExcel}><TableCellsIcon className="w-4 h-4" />Excel</Button>
                            </div>
                            <Table columns={inventoryColumns} data={inventory} emptyMessage="No hay datos de inventario" />
                        </div>
                    )}

                    {/* Tab Jornadas */}
                    {activeTab === "workdays" && (
                        <div className="space-y-4">
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="md" onClick={handleExportJornadasPDF}><DocumentArrowDownIcon className="w-4 h-4" />PDF</Button>
                                <Button variant="outline" size="md" onClick={handleExportJornadasExcel}><TableCellsIcon className="w-4 h-4" />Excel</Button>
                            </div>
                            <Table columns={workdayColumns} data={workdays} emptyMessage="No hay jornadas registradas" />
                        </div>
                    )}

                    {/* Tab Alertas */}
                    {activeTab === "alerts" && (
                        <div className="space-y-4">
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="md" onClick={handleExportAlertasPDF}><DocumentArrowDownIcon className="w-4 h-4" />PDF</Button>
                            </div>
                            <Table columns={alertColumns} data={alerts} emptyMessage="No hay alertas de vencimiento" />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}