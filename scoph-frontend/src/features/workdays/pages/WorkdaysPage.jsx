import { useState, useCallback, useEffect } from "react";
import { PlusIcon, EyeIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

import { useWorkdays } from "../hooks/useWorkdays";
import { getUsers } from "../../../shared/apis/authService";
import { mockDepartamentos } from "../../../shared/utils/mockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusBadge(status) {
  const map = {
    IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
    PLANNED:     <Badge variant="info">Planificada</Badge>,
    FINISHED:    <Badge variant="gray">Finalizada</Badge>,
    CANCELLED:   <Badge variant="danger">Cancelada</Badge>,
  };
  return map[status] ?? <Badge>{status}</Badge>;
}

// ─── Formulario crear / editar ────────────────────────────────────────────────

const WORKDAY_INITIAL = {
  name: "", description: "", startDate: "", endDate: "",
  department: "", municipality: "", address: "",
  managerId: "", managerName: "",
  estimatedPatients: "", estimatedMedicines: "",
  status: "PLANNED",
};

function WorkdayForm({ form, onChange, onSubmit, onClose, submitting, isEdit, users }) {
  const municipios =
    mockDepartamentos.find((d) => d.nombre === form.department)?.municipios ?? [];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre de la jornada"
        name="name" value={form.name} onChange={onChange}
        placeholder="Jornada Médica Zona 1" required
      />
      <Input
        label="Descripción"
        name="description" value={form.description} onChange={onChange}
        placeholder="Descripción de la jornada médica"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Fecha inicio" name="startDate" type="date" value={form.startDate} onChange={onChange} required />
        <Input label="Fecha fin"    name="endDate"   type="date" value={form.endDate}   onChange={onChange} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Departamento</label>
          <select
            name="department" value={form.department} onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
          >
            <option value="">Seleccionar</option>
            {mockDepartamentos.map((d) => (
              <option key={d._id} value={d.nombre}>{d.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Municipio</label>
          <select
            name="municipality" value={form.municipality} onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition disabled:opacity-50"
            required disabled={!form.department}
          >
            <option value="">Seleccionar</option>
            {municipios.map((m) => (
              <option key={m.codigo} value={m.nombre}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Dirección"
        name="address" value={form.address} onChange={onChange}
        placeholder="Centro comunitario, Salón municipal..." required
      />

      {/* Select de responsable cargado desde auth-service */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">Responsable</label>
        <select
          name="managerId" value={form.managerId} onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          required
        >
          <option value="">Seleccionar responsable</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.nombre} {u.apellido} — {u.rol}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Pacientes estimados"
          name="estimatedPatients" type="number" min="1"
          value={form.estimatedPatients} onChange={onChange}
          placeholder="100" required
        />
        <Input
          label="Medicamentos estimados"
          name="estimatedMedicines" type="number" min="1"
          value={form.estimatedMedicines} onChange={onChange}
          placeholder="300" required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">Estado</label>
        <select
          name="status" value={form.status} onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
        >
          <option value="PLANNED">Planificada</option>
          <option value="IN_PROGRESS">En Curso</option>
          {isEdit && <option value="FINISHED">Finalizada</option>}
          {isEdit && <option value="CANCELLED">Cancelada</option>}
        </select>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={submitting}>
          {isEdit ? "Guardar cambios" : "Crear jornada"}
        </Button>
      </div>
    </form>
  );
}

// ─── Vista detalle ────────────────────────────────────────────────────────────

function WorkdayDetail({ workday, onEdit, onChangeStatus, submittingStatus }) {
  const canTransition = workday.status !== "FINISHED" && workday.status !== "CANCELLED";

  const nextStatus = {
    PLANNED:     { label: "Iniciar jornada",   value: "IN_PROGRESS", variant: "primary" },
    IN_PROGRESS: { label: "Finalizar jornada", value: "FINISHED",    variant: "outline" },
  }[workday.status];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Fecha inicio</p>
          <p className="text-sm font-semibold text-gray-700">
            {new Date(workday.startDate).toLocaleDateString("es-GT")}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Fecha fin</p>
          <p className="text-sm font-semibold text-gray-700">
            {new Date(workday.endDate).toLocaleDateString("es-GT")}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Estado</p>
          <div className="mt-1">{getStatusBadge(workday.status)}</div>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Responsable</p>
          <p className="text-sm font-semibold text-gray-700">{workday.manager?.name || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Ubicación</p>
          <p className="text-sm font-semibold text-gray-700">
            {workday.location?.municipality}, {workday.location?.department}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{workday.location?.address}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Estimados</p>
          <p className="text-sm font-semibold text-gray-700">{workday.estimatedPatients} pacientes</p>
          <p className="text-xs text-gray-400 mt-0.5">{workday.estimatedMedicines} medicamentos</p>
        </div>
      </div>

      {workday.description && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Descripción</p>
          <p className="text-sm text-gray-700 mt-0.5">{workday.description}</p>
        </div>
      )}

      {canTransition && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onEdit}>
            <PencilIcon className="w-4 h-4" />
            Editar datos
          </Button>
          {nextStatus && (
            <Button
              variant={nextStatus.variant}
              loading={submittingStatus}
              onClick={() => onChangeStatus(workday._id, nextStatus.value)}
            >
              {nextStatus.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function WorkdaysPage() {
  const { workdays, loading, error, refetch, create, update, changeStatus, remove } = useWorkdays();

  const [users, setUsers]                 = useState([]);
  const [modalCrear, setModalCrear]       = useState(false);
  const [modalDetalle, setModalDetalle]   = useState(false);
  const [modalEditar, setModalEditar]     = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [selectedWorkday, setSelectedWorkday] = useState(null);
  const [form, setForm]                   = useState(WORKDAY_INITIAL);
  const [submitting, setSubmitting]       = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Carga usuarios desde auth-service al montar
  useEffect(() => {
    getUsers()
      .then(({ data }) => setUsers(data.users ?? []))
      .catch(() => toast.error("No se pudieron cargar los usuarios"));
  }, []);

  // ── Handlers de formulario ──────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "department" ? { municipality: "" } : {}),
    }));
  }, []);

  const buildPayload = (f) => {
    const selectedUser = users.find((u) => u._id === f.managerId);
    return {
      name:               f.name.trim(),
      description:        f.description.trim() || undefined,
      startDate:          new Date(f.startDate + "T00:00:00").toISOString(),
      endDate:            new Date(f.endDate   + "T00:00:00").toISOString(),
      location: {
        department:  f.department,
        municipality: f.municipality,
        address:     f.address.trim(),
      },
      manager: {
        userId: f.managerId,
        name:   selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}` : f.managerName,
      },
      estimatedPatients:  Number(f.estimatedPatients),
      estimatedMedicines: Number(f.estimatedMedicines),
      status:             f.status,
    };
  };

  // ── CREAR ───────────────────────────────────────────────────────────────────

  const handleCrear = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await create(buildPayload(form));
      toast.success("Jornada creada exitosamente");
      setModalCrear(false);
      setForm(WORKDAY_INITIAL);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Error al crear la jornada");
    } finally {
      setSubmitting(false);
    }
  }, [form, create, users]);

  // ── EDITAR ──────────────────────────────────────────────────────────────────

  const handleAbrirEditar = useCallback((workday) => {
    setSelectedWorkday(workday);
    // Busca el usuario por nombre para pre-seleccionar el select
    const matchedUser = users.find(
      (u) => `${u.nombre} ${u.apellido}` === workday.manager?.name
    );
    setForm({
      name:               workday.name,
      description:        workday.description ?? "",
      startDate:          workday.startDate?.slice(0, 10) ?? "",
      endDate:            workday.endDate?.slice(0, 10) ?? "",
      department:         workday.location?.department ?? "",
      municipality:       workday.location?.municipality ?? "",
      address:            workday.location?.address ?? "",
      managerId:          matchedUser?._id ?? workday.manager?.userId ?? "",
      managerName:        workday.manager?.name ?? "",
      estimatedPatients:  String(workday.estimatedPatients ?? ""),
      estimatedMedicines: String(workday.estimatedMedicines ?? ""),
      status:             workday.status ?? "PLANNED",
    });
    setModalDetalle(false);
    setModalEditar(true);
  }, [users]);

  const handleEditar = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await update(selectedWorkday._id, buildPayload(form));
      setSelectedWorkday(updated);
      toast.success("Jornada actualizada correctamente");
      setModalEditar(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Error al actualizar la jornada");
    } finally {
      setSubmitting(false);
    }
  }, [form, selectedWorkday, update, users]);

  // ── CAMBIAR ESTADO ──────────────────────────────────────────────────────────

  const handleChangeStatus = useCallback(async (id, status) => {
    setSubmittingStatus(true);
    try {
      await changeStatus(id, status);
      const labels = { IN_PROGRESS: "Jornada iniciada", FINISHED: "Jornada finalizada", CANCELLED: "Jornada cancelada" };
      toast.success(labels[status] ?? "Estado actualizado");
      setModalDetalle(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Error al cambiar el estado");
    } finally {
      setSubmittingStatus(false);
    }
  }, [changeStatus]);

  // ── ELIMINAR ────────────────────────────────────────────────────────────────

  const handleConfirmarEliminar = useCallback(async () => {
    try {
      await remove(selectedWorkday._id);
      toast.success("Jornada eliminada");
      setConfirmEliminar(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Error al eliminar la jornada");
      setConfirmEliminar(false);
    }
  }, [selectedWorkday, remove]);

  // ── Columnas ────────────────────────────────────────────────────────────────

  const columnas = [
    {
      key: "name", label: "Jornada",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-700">{row.name}</p>
          <p className="text-xs text-gray-400">{row.location?.municipality}, {row.location?.department}</p>
        </div>
      ),
    },
    {
      key: "startDate", label: "Fechas",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700">{new Date(row.startDate).toLocaleDateString("es-GT")}</p>
          <p className="text-xs text-gray-400">al {new Date(row.endDate).toLocaleDateString("es-GT")}</p>
        </div>
      ),
    },
    { key: "manager",  label: "Responsable", render: (row) => row.manager?.name || "—" },
    {
      key: "estimados", label: "Estimados",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700">{row.estimatedPatients} pacientes</p>
          <p className="text-xs text-gray-400">{row.estimatedMedicines} medicamentos</p>
        </div>
      ),
    },
    { key: "status", label: "Estado", render: (row) => getStatusBadge(row.status) },
    {
      key: "acciones", label: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setSelectedWorkday(row); setModalDetalle(true); }}>
            <EyeIcon className="w-4 h-4" />
          </Button>
          {(row.status === "FINISHED" || row.status === "CANCELLED") && (
            <Button variant="danger" size="sm" onClick={() => { setSelectedWorkday(row); setConfirmEliminar(true); }}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-500 font-semibold">{error}</p>
        <Button variant="outline" onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Jornadas"
        subtitle="Administra las jornadas médicas y su ciclo de vida"
        action={
          <Button variant="primary" onClick={() => { setForm(WORKDAY_INITIAL); setModalCrear(true); }}>
            <PlusIcon className="w-4 h-4" />Nueva Jornada
          </Button>
        }
      />

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Total</p>
          <p className="text-2xl font-extrabold text-gray-800">{workdays.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Planificadas</p>
          <p className="text-2xl font-extrabold text-blue-500">{workdays.filter((j) => j.status === "PLANNED").length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">En Curso</p>
          <p className="text-2xl font-extrabold text-green-500">{workdays.filter((j) => j.status === "IN_PROGRESS").length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Finalizadas</p>
          <p className="text-2xl font-extrabold text-gray-400">{workdays.filter((j) => j.status === "FINISHED").length}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table columns={columnas} data={workdays} emptyMessage="No hay jornadas registradas" />
      </div>

      {/* Modal Crear */}
      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nueva Jornada" size="lg">
        <WorkdayForm form={form} onChange={handleChange} onSubmit={handleCrear}
          onClose={() => setModalCrear(false)} submitting={submitting} isEdit={false} users={users} />
      </Modal>

      {/* Modal Detalle */}
      <Modal isOpen={modalDetalle} onClose={() => setModalDetalle(false)} title={selectedWorkday?.name} size="lg">
        {selectedWorkday && (
          <WorkdayDetail
            workday={selectedWorkday}
            onEdit={() => handleAbrirEditar(selectedWorkday)}
            onChangeStatus={handleChangeStatus}
            submittingStatus={submittingStatus}
          />
        )}
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={modalEditar} onClose={() => setModalEditar(false)} title="Editar Jornada" size="lg">
        <WorkdayForm form={form} onChange={handleChange} onSubmit={handleEditar}
          onClose={() => setModalEditar(false)} submitting={submitting} isEdit={true} users={users} />
      </Modal>

      {/* Confirm eliminar */}
      <ConfirmDialog
        isOpen={confirmEliminar} onClose={() => setConfirmEliminar(false)}
        onConfirm={handleConfirmarEliminar}
        title="¿Eliminar jornada?"
        message={`¿Estás seguro que deseas eliminar "${selectedWorkday?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}