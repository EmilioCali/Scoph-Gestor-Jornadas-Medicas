import {
  ArchiveBoxIcon,
  MapPinIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Componentes reutilizables heredados
import StatCard from "../../../shared/components/ui/StatCard";
import Badge from "../../../shared/components/ui/Badge";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Button from "../../../shared/components/ui/Button";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuthStore } from "../../auth/store/authStore.js";

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
    key: "expirationDate",
    label: "Vencimiento",
    render: (row) => new Date(row.expirationDate).toLocaleDateString("es-GT"),
  },
  {
    key: "daysRemaining",
    label: "Días Restantes",
    render: (row) => getExpirationBadge(row.daysRemaining),
  },
];
//
// Columnas para la tabla de jornadas recientes
const workdayColumns = [
  { key: "name", label: "Jornada" },
  {
    key: "startDate",
    label: "Fecha",
    render: (row) => new Date(row.startDate).toLocaleDateString("es-GT"),
  },
  { key: "location", label: "Ubicación" },
  { key: "manager", label: "Responsable" },
  {
    key: "status",
    label: "Estado",
    render: (row) => getStatusBadge(row.status),
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    metrics,
    movementsChart,
    stockAlerts,
    expirationAlerts,
    recentWorkdays,
    workdayStats,
    updatedAt,
    loading,
    error,
    refetch,
  } = useDashboardData();

  const fechaActualizacion = updatedAt
    ? new Date(updatedAt).toLocaleString("es-GT")
    : "-";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general del sistema de jornadas médicas"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user?.rol || "Administrador"}</h1>
          <p className="text-sm text-gray-500">Última actualización: {fechaActualizacion}</p>
        </div>
        <Button
          variant="secondary"
          onClick={refetch}
          loading={loading}
        >
          Actualizar datos
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error cargando datos del dashboard</p>
          <p>{error}</p>
        </div>
      ) : null}

      {/*   Tarjetas de métricas  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Medicamentos"
          value={metrics.totalMedicamentos}
          subtitle="En inventario central"
          icon={ArchiveBoxIcon}
          variant="primary"
        />
        <StatCard
          title="Jornadas Activas"
          value={metrics.jornadasActivas}
          subtitle="En curso actualmente"
          icon={MapPinIcon}
          variant="success"
        />
        <StatCard
          title="Alertas Stock"
          value={metrics.stockBajo}
          subtitle="Medicamentos con stock bajo"
          icon={BellAlertIcon}
          variant="warning"
        />
        <StatCard
          title="Alertas Vencimiento"
          value={metrics.alertasVencimiento}
          subtitle="Próximos 60 días"
          icon={ArrowTrendingUpIcon}
          variant="danger"
        />
      </div>

      {/* Estadísticas de jornadas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-gray-800">Estadísticas de Jornadas</h2>
            <p className="text-gray-400 text-xs">Resumen de estado de las jornadas médicas</p>
          </div>
          <p className="text-sm text-gray-500">Total jornadas: {workdayStats.total}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">Activas</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{workdayStats.activas}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">Planificadas</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{workdayStats.planificadas}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">Finalizadas</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{workdayStats.finalizadas}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">Movimientos este mes</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{metrics.movimientosMes}</p>
          </div>
        </div>
      </div>

      {/*  Gráfica de movimientos  */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-extrabold text-gray-800 mb-1">
          Movimientos por Mes
        </h2>
        <p className="text-gray-400 text-xs mb-5">
          Entradas y salidas de medicamentos durante el año
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={movementsChart} barSize={18} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
              cursor={{ fill: "#f9fafb" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
            <Bar
              dataKey="entries"
              name="Entradas"
              fill="#F27405"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="exits"
              name="Salidas"
              fill="#F2BB77"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/*   Tablas inferiores  */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alertas de stock bajo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-extrabold text-gray-800 mb-1">
            Alertas de Stock Bajo
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            Medicamentos con stock igual o menor al mínimo
          </p>
          <Table
            columns={[
              { key: "name", label: "Medicamento" },
              { key: "currentStock", label: "Stock" },
              { key: "minimumStock", label: "Mínimo" },
            ]}
            data={stockAlerts}
            loading={loading}
            emptyMessage="No hay alertas de stock bajo"
          />
        </div>

        {/* Alertas de vencimiento */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-extrabold text-gray-800 mb-1">
            Alertas de Vencimiento
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            Medicamentos próximos a vencer
          </p>
          <Table
            columns={expirationColumns}
            data={expirationAlerts}
            loading={loading}
            emptyMessage="No hay alertas de vencimiento"
          />
        </div>

        {/* Jornadas recientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-extrabold text-gray-800 mb-1">
            Jornadas Recientes
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            Últimas jornadas registradas en el sistema
          </p>
          <Table
            columns={workdayColumns}
            data={recentWorkdays}
            loading={loading}
            emptyMessage="No hay jornadas registradas"
          />
        </div>
      </div>
    </div>
  );
}
