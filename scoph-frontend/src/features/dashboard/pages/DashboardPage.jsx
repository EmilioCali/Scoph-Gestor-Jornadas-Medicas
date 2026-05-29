import {
    ArchiveBoxIcon,
    MapPinIcon,
    BellAlertIcon,
    ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// Componentes reutilizables heredados
import StatCard from "../../../shared/components/ui/StatCard";
import Badge from "../../../shared/components/ui/Badge";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import { useAuth } from "../../auth/store/AuthContext";

// Datos mock - se reemplazarán por llamadas axios al ReportesService
// Endpoint: GET /api/v1/reportes/dashboard
import {
    mockDashboardMetrics,
    mockMovementsChart,
    mockExpirationAlerts,
    mockRecentWorkdays,
} from "../../../shared/utils/mockData";

// Badge según estado de la jornadas
function getStatusBadge(status) {
    const map = {
        IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
        PLANNED: <Badge variant="info">Planificada</Badge>,
        COMPLETED: <Badge variant="gray">Finalizada</Badge>,
    };
    return map[status] || <Badge>{status}</Badge>;
}

// Badge según días restantes para vencimiento
function getExpirationBadge(days) {
    if (days <= 15) return <Badge variant="danger">{days} días</Badge>;
    if (days <= 30) return <Badge variant="warning">{days} días</Badge>;
    return <Badge variant="info">{days} días</Badge>;
}

// Columnas para la tabla de alertas de vencimiento
const expirationColumns = [
    { key: "name", label: "Medicamento" },
    { key: "batch", label: "Lote" },
    { key: "currentStock", label: "Stock" },
    {
        key: "expirationDate", label: "Vencimiento",
        render: (row) => new Date(row.expirationDate).toLocaleDateString("es-GT"),
    },
    {
        key: "daysRemaining", label: "Días Restantes",
        render: (row) => getExpirationBadge(row.daysRemaining),
    },
];

// Columnas para la tabla de jornadas recientes
const workdayColumns = [
    { key: "name", label: "Jornada" },
    {
        key: "startDate", label: "Fecha",
        render: (row) => new Date(row.startDate).toLocaleDateString("es-GT"),
    },
    { key: "location", label: "Ubicación" },
    { key: "manager", label: "Responsable" },
    {
        key: "status", label: "Estado",
        render: (row) => getStatusBadge(row.status),
    },
];

export default function DashboardPage() {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                subtitle="Resumen general del sistema de jornadas médicas"
            />
            <h1 className="text-2xl font-bold">
                {user?.rol}
            </h1>

            {/*   Tarjetas de métricas  */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Medicamentos"
                    value={mockDashboardMetrics.totalMedicines}
                    subtitle="En inventario central"
                    icon={ArchiveBoxIcon}
                    variant="primary"
                />
                <StatCard
                    title="Jornadas Activas"
                    value={mockDashboardMetrics.activeWorkdays}
                    subtitle="En curso actualmente"
                    icon={MapPinIcon}
                    variant="success"
                />
                <StatCard
                    title="Alertas Vencimiento"
                    value={mockDashboardMetrics.expirationAlerts}
                    subtitle="Próximos 60 días"
                    icon={BellAlertIcon}
                    variant="warning"
                />
                <StatCard
                    title="Movimientos del Mes"
                    value={mockDashboardMetrics.monthlyMovements}
                    subtitle="Entradas y salidas"
                    icon={ArrowTrendingUpIcon}
                    variant="danger"
                />
            </div>

            {/*  Gráfica de movimientos  */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-extrabold text-gray-800 mb-1">Movimientos por Mes</h2>
                <p className="text-gray-400 text-xs mb-5">Entradas y salidas de medicamentos durante el año</p>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={mockMovementsChart} barSize={18} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                            cursor={{ fill: "#f9fafb" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                        <Bar dataKey="entries" name="Entradas" fill="#F27405" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="exits" name="Salidas" fill="#F2BB77" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/*   Tablas inferiores  */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Alertas de vencimiento */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-base font-extrabold text-gray-800 mb-1">Alertas de Vencimiento</h2>
                    <p className="text-gray-400 text-xs mb-4">Medicamentos próximos a vencer</p>
                    <Table
                        columns={expirationColumns}
                        data={mockExpirationAlerts}
                        emptyMessage="No hay alertas de vencimiento"
                    />
                </div>

                {/* Jornadas recientes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-base font-extrabold text-gray-800 mb-1">Jornadas Recientes</h2>
                    <p className="text-gray-400 text-xs mb-4">Últimas jornadas registradas en el sistema</p>
                    <Table
                        columns={workdayColumns}
                        data={mockRecentWorkdays}
                        emptyMessage="No hay jornadas registradas"
                    />
                </div>

            </div>
        </div>
    );
}