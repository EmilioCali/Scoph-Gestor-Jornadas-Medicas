import { useState } from "react";
import { PlusIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { departamentosGuatemala } from "../../../shared/constants/catalogOptions";
import { useWorkdayInventory } from "../hooks/useWorkdayInventory";

// Badge según estado de la jornada - valores reales del backend
function getStatusBadge(status) {
    const map = {
        IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
        PLANNED: <Badge variant="info">Planificada</Badge>,
        FINISHED: <Badge variant="gray">Finalizada</Badge>,
        COMPLETED: <Badge variant="gray">Finalizada</Badge>,
        CANCELLED: <Badge variant="danger">Cancelada</Badge>,
    };
    return map[status] || <Badge>{status}</Badge>;
}

// Formulario para crear jornada
// Body alineado con backend: name, description, startDate, endDate,
// location{department, municipality, address}, manager{name},
// estimatedPatients, estimatedMedicines, status
function WorkdayForm({ form, onChange, onSubmit, onClose, departamentos, users }) {
    const municipios = departamentos.find((d) => d.nombre === form.department)?.municipios || [];

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Nombre de la jornada" name="name" value={form.name} onChange={onChange} placeholder="Jornada Médica Zona 1" required />
            <Input label="Descripción" name="description" value={form.description} onChange={onChange} placeholder="Descripción de la jornada médica" />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Fecha inicio" name="startDate" type="date" value={form.startDate} onChange={onChange} required />
                <Input label="Fecha fin" name="endDate" type="date" value={form.endDate} onChange={onChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Departamento</label>
                    <select name="department" value={form.department} onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                        <option value="">Seleccionar</option>
                        {departamentos.map((dep) => <option key={dep._id} value={dep.nombre}>{dep.nombre}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Municipio</label>
                    <select name="municipality" value={form.municipality} onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required disabled={!form.department}>
                        <option value="">Seleccionar</option>
                        {municipios.map((mun) => <option key={mun.codigo} value={mun.nombre}>{mun.nombre}</option>)}
                    </select>
                </div>
            </div>
            <Input label="Dirección" name="address" value={form.address} onChange={onChange} placeholder="Centro comunitario, Salón municipal..." required />
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Responsable</label>
                <select name="managerId" value={form.managerId} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                    <option value="">Seleccionar responsable</option>
                    {users.map((u) => <option key={u._id} value={u._id}>{u.nombre} {u.apellido} — {u.rol}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Pacientes estimados" name="estimatedPatients" type="number" min="1" value={form.estimatedPatients} onChange={onChange} placeholder="100" required />
                <Input label="Medicamentos estimados" name="estimatedMedicines" type="number" min="1" value={form.estimatedMedicines} onChange={onChange} placeholder="300" required />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Estado inicial</label>
                <select name="status" value={form.status} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition">
                    <option value="PLANNED">Planificada</option>
                    <option value="IN_PROGRESS">En Curso</option>
                </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" type="submit">Crear jornada</Button>
            </div>
        </form>
    );
}

// Vista detalle de la jornada con su inventario asignado
function WorkdayDetail({ workday, workdayInventory, loading, onAssign, onConsumption, onReturn }) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Fecha inicio</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(workday.startDate).toLocaleDateString("es-GT")}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Fecha fin</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(workday.endDate).toLocaleDateString("es-GT")}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Estado</p>
                    <div className="mt-0.5">{getStatusBadge(workday.status)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Responsable</p>
                    <p className="text-sm font-semibold text-gray-700">{workday.manager?.name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-400">Ubicación</p>
                    <p className="text-sm font-semibold text-gray-700">{workday.location?.municipality}, {workday.location?.department}</p>
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

            {/* Inventario asignado */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-gray-700">
                        Inventario de la Jornada
                        <span className="ml-2 text-xs font-normal text-gray-400">({workdayInventory.length} medicamentos)</span>
                    </h3>
                    {workday.status !== "FINISHED" && workday.status !== "COMPLETED" && (
                        <Button variant="primary" size="sm" onClick={onAssign}>
                            <PlusIcon className="w-4 h-4" />Asignar medicamento
                        </Button>
                    )}
                </div>

                {loading ? (
                    <p className="text-center text-gray-400 text-sm py-6 bg-gray-50 rounded-xl border border-gray-100">
                        Cargando inventario asignado...
                    </p>
                ) : workdayInventory.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-6 bg-gray-50 rounded-xl border border-gray-100">
                        No hay medicamentos asignados a esta jornada
                    </p>
                ) : (
                    <div className="space-y-2">
                        {workdayInventory.map((item) => (
                            <div key={item.inventoryId} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {item.compound || item.category || "Medicamento asignado"} · Stock disponible:{" "}
                                            <span className="font-semibold text-gray-600">{item.totalStock} {item.unitOfMeasure}</span>
                                        </p>
                                    </div>
                                    {workday.status === "IN_PROGRESS" && (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => onConsumption(item)}>Consumo</Button>
                                            <Button variant="outline" size="sm" onClick={() => onReturn(item)}>Retorno</Button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 grid gap-2">
                                    {item.lots.map((lot) => (
                                        <div key={lot.batch} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-gray-100">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600">Lote {lot.batch}</p>
                                                <p className="text-xs text-gray-400">Vence: {new Date(lot.expirationDate).toLocaleDateString("es-GT")}</p>
                                            </div>
                                            <p className="text-sm font-extrabold text-gray-700">{lot.stock} {item.unitOfMeasure}</p>
                                        </div>
                                    ))}
                                    {item.lots.length === 0 && (
                                        <p className="text-xs text-gray-400">Sin lotes asignados</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Formulario para asignar medicamentos a la jornada
// Body alineado con backend: jornadaId, jornadaNombre, detalle[{medicineId, batch, quantity, expirationDate}]
function AssignMedicineForm({ form, onChange, onSubmit, onClose, centralInventory, submitting, formError }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
            )}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Medicamento</label>
                <select name="medicineId" value={form.medicineId} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                    <option value="">Seleccionar medicamento</option>
                    {centralInventory.map((med) => (
                        <option key={med._id} value={med.medicineId}>{med.name} (Stock: {med.totalStock} {med.unitOfMeasure})</option>
                    ))}
                </select>
            </div>
            {form.medicineId && (
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Lote</label>
                    <select name="batch" value={form.batch} onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                        <option value="">Seleccionar lote</option>
                        {centralInventory.find((m) => String(m.medicineId) === String(form.medicineId))?.lots.filter((l) => l.stock > 0).map((l) => (
                            <option key={l.batch} value={l.batch}>
                                {l.batch} — Stock: {l.stock} — Vence: {new Date(l.expirationDate).toLocaleDateString("es-GT")}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <Input label="Cantidad a asignar" name="quantity" type="number" min="1" value={form.quantity} onChange={onChange} placeholder="0" required />
            <p className="text-xs text-gray-400 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                Esta cantidad se descontara del inventario central (ASIGNACION_JORNADA).
            </p>
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={submitting}>{submitting ? "Asignando..." : "Asignar"}</Button>
            </div>
        </form>
    );
}

// Formulario reutilizable para consumo y retorno
// Consumo → backend: productoId, cantidad (POST /movimientos/consumo-jornada)
// Retorno → backend: productoId, cantidad (POST /movimientos/retorno-jornada)
function WorkdayMovementForm({ form, onChange, onSubmit, onClose, item, tipo, submitting, formError }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
            )}
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400">Medicamento</p>
                <p className="text-sm font-semibold text-gray-700">{item?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    Disponible: <span className="font-semibold text-gray-600">{item?.totalStock ?? 0} {item?.unitOfMeasure}</span>
                </p>
            </div>
            <Input
                label={tipo === "CONSUMO" ? "Cantidad consumida" : "Cantidad a retornar"}
                name="quantity" type="number" min="1"
                max={item?.totalStock ?? 0}
                value={form.quantity} onChange={onChange} placeholder="0" required
            />
            <Input label="Observación" name="observacion" value={form.observacion} onChange={onChange}
                placeholder={tipo === "CONSUMO" ? "Ej: Receta paciente" : "Ej: Medicamento no utilizado"} />
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button variant={tipo === "CONSUMO" ? "danger" : "primary"} type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : tipo === "CONSUMO" ? "Registrar consumo" : "Registrar retorno"}
                </Button>
            </div>
        </form>
    );
}

const workdayInicial = { name: "", description: "", startDate: "", endDate: "", department: "", municipality: "", address: "", managerId: "", estimatedPatients: "", estimatedMedicines: "", status: "PLANNED" };
const assignInicial = { medicineId: "", batch: "", quantity: "" };
const movementInicial = { quantity: "", observacion: "" };

export default function JornadasPage() {
    const {
        workdays,
        centralInventory,
        workdayInventoryById,
        loading,
        inventoryLoading,
        error,
        refetch,
        fetchWorkdayInventory,
        createNewWorkday,
        removeWorkday,
        assignMedicine,
        registerWorkdayConsumption,
        registerWorkdayReturn,
    } = useWorkdayInventory();

    const [modalCrear, setModalCrear] = useState(false);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalAsignar, setModalAsignar] = useState(false);
    const [modalConsumo, setModalConsumo] = useState(false);
    const [modalRetorno, setModalRetorno] = useState(false);
    const [confirmEliminar, setConfirmEliminar] = useState(false);

    const [selectedWorkday, setSelectedWorkday] = useState(null);
    const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
    const [formWorkday, setFormWorkday] = useState(workdayInicial);
    const [formAssign, setFormAssign] = useState(assignInicial);
    const [formMovement, setFormMovement] = useState(movementInicial);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    const handleChangeWorkday = (e) => {
        const { name, value } = e.target;
        if (name === "department") {
            setFormWorkday((prev) => ({ ...prev, department: value, municipality: "" }));
        } else {
            setFormWorkday((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeAssign = (e) => {
        const { name, value } = e.target;
        if (name === "medicineId") {
            setFormAssign((prev) => ({ ...prev, medicineId: value, batch: "" }));
        } else {
            setFormAssign((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeMovement = (e) => {
        const { name, value } = e.target;
        setFormMovement((prev) => ({ ...prev, [name]: value }));
    };

    const handleVerDetalle = (workday) => {
        setSelectedWorkday(workday);
        setModalDetalle(true);
        fetchWorkdayInventory(workday._id);
    };
    const handleEliminar = (workday) => { setSelectedWorkday(workday); setConfirmEliminar(true); };

    // Crea jornada - cuando se conecte el backend usar createWorkday() de workdayService
    // El body debe ser: { name, description, startDate, endDate, location, manager, estimatedPatients, estimatedMedicines, status }
    const handleCrearWorkday = async (e) => {
        e.preventDefault();
        const manager = users.find((u) => u._id === formWorkday.managerId);
        setSubmitting(true);
        setFormError(null);
        try {
            await createNewWorkday({
            name: formWorkday.name,
            description: formWorkday.description,
            startDate: new Date(formWorkday.startDate).toISOString(),
            endDate: new Date(formWorkday.endDate).toISOString(),
            location: { department: formWorkday.department, municipality: formWorkday.municipality, address: formWorkday.address },
            manager: { name: manager ? `${manager.nombre} ${manager.apellido}` : "" },
            estimatedPatients: Number(formWorkday.estimatedPatients),
            estimatedMedicines: Number(formWorkday.estimatedMedicines),
            status: formWorkday.status,
            });
            setFormWorkday(workdayInicial);
            setModalCrear(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "No se pudo crear la jornada");
        } finally {
            setSubmitting(false);
        }
    };

    // Asigna medicamentos - cuando se conecte el backend usar registerTransfer() de coreService
    // Body: { jornadaId, jornadaNombre, detalle: [{ medicineId, batch, quantity, expirationDate }] }
    const handleAsignarMedicamento = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        try {
            await assignMedicine({
                workday: selectedWorkday,
                medicineId: formAssign.medicineId,
                batch: formAssign.batch,
                quantity: formAssign.quantity,
            });
            setFormAssign(assignInicial);
            setModalAsignar(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "No se pudo asignar el medicamento");
        } finally {
            setSubmitting(false);
        }
    };

    // Registra consumo - cuando se conecte el backend usar registerConsumption() de coreService
    // Body: { productoId, cantidad }
    const handleRegistrarConsumo = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        try {
            await registerWorkdayConsumption({
                item: selectedInventoryItem,
                quantity: formMovement.quantity,
            });
            setFormMovement(movementInicial);
            setModalConsumo(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "No se pudo registrar el consumo");
        } finally {
            setSubmitting(false);
        }
    };

    // Registra retorno - cuando se conecte el backend usar registerReturn() de coreService
    // Body: { productoId, cantidad }
    const handleRegistrarRetorno = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        try {
            await registerWorkdayReturn({
                item: selectedInventoryItem,
                quantity: formMovement.quantity,
            });
            setFormMovement(movementInicial);
            setModalRetorno(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "No se pudo registrar el retorno");
        } finally {
            setSubmitting(false);
        }
    };

    // Elimina jornada - cuando se conecte el backend usar deleteWorkday() de workdayService
    const handleConfirmarEliminar = async () => {
        setSubmitting(true);
        try {
            await removeWorkday(selectedWorkday._id);
            setConfirmEliminar(false);
        } finally {
            setSubmitting(false);
        }
    };

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
        { key: "manager", label: "Responsable", render: (row) => row.manager?.name || "—" },
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
            key: "inventario", label: "Inv. Asignado",
            render: (row) => <Badge variant="gray">{(workdayInventoryById[row._id] || []).length} items</Badge>,
        },
        {
            key: "acciones", label: "Acciones",
            render: (row) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleVerDetalle(row)}><EyeIcon className="w-4 h-4" /></Button>
                    {row.status === "COMPLETED" && (
                        <Button variant="danger" size="sm" onClick={() => handleEliminar(row)}><TrashIcon className="w-4 h-4" /></Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Jornadas"
                subtitle="Administra las jornadas médicas y su inventario asignado"
                action={
                    <Button variant="primary" onClick={() => { setFormWorkday(workdayInicial); setFormError(null); setModalCrear(true); }}>
                        <PlusIcon className="w-4 h-4" />Nueva Jornada
                    </Button>
                }
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={refetch}>Reintentar</Button>
                </div>
            )}

            {/* Resumen de jornadas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Total Jornadas</p>
                    <p className="text-2xl font-extrabold text-gray-800">{workdays.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">En Curso</p>
                    <p className="text-2xl font-extrabold text-green-500">{workdays.filter((j) => j.status === "IN_PROGRESS").length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Planificadas</p>
                    <p className="text-2xl font-extrabold text-blue-500">{workdays.filter((j) => j.status === "PLANNED").length}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Table columns={columnas} data={workdays} loading={loading} emptyMessage="No hay jornadas registradas" />
            </div>

            <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nueva Jornada" size="lg">
                {formError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{formError}</p>
                )}
                <WorkdayForm form={formWorkday} onChange={handleChangeWorkday} onSubmit={handleCrearWorkday} onClose={() => setModalCrear(false)} departamentos={departamentosGuatemala} users={mockUsers} />
            </Modal>

            <Modal isOpen={modalDetalle} onClose={() => setModalDetalle(false)} title={selectedWorkday?.name} size="lg">
                {selectedWorkday && (
                    <WorkdayDetail
                        workday={selectedWorkday}
                        workdayInventory={workdayInventoryById[selectedWorkday._id] || []}
                        loading={inventoryLoading}
                        onAssign={() => { setFormAssign(assignInicial); setFormError(null); setModalAsignar(true); }}
                        onConsumption={(item) => { setSelectedInventoryItem(item); setFormMovement(movementInicial); setFormError(null); setModalConsumo(true); }}
                        onReturn={(item) => { setSelectedInventoryItem(item); setFormMovement(movementInicial); setFormError(null); setModalRetorno(true); }}
                    />
                )}
            </Modal>

            <Modal isOpen={modalAsignar} onClose={() => setModalAsignar(false)} title="Asignar Medicamento" size="sm">
                <AssignMedicineForm form={formAssign} onChange={handleChangeAssign} onSubmit={handleAsignarMedicamento} onClose={() => setModalAsignar(false)} centralInventory={centralInventory} submitting={submitting} formError={formError} />
            </Modal>

            <Modal isOpen={modalConsumo} onClose={() => setModalConsumo(false)} title="Registrar Consumo" size="sm">
                <WorkdayMovementForm form={formMovement} onChange={handleChangeMovement} onSubmit={handleRegistrarConsumo} onClose={() => setModalConsumo(false)} item={selectedInventoryItem} tipo="CONSUMO" submitting={submitting} formError={formError} />
            </Modal>

            <Modal isOpen={modalRetorno} onClose={() => setModalRetorno(false)} title="Registrar Retorno" size="sm">
                <WorkdayMovementForm form={formMovement} onChange={handleChangeMovement} onSubmit={handleRegistrarRetorno} onClose={() => setModalRetorno(false)} item={selectedInventoryItem} tipo="RETORNO" submitting={submitting} formError={formError} />
            </Modal>

            <ConfirmDialog
                isOpen={confirmEliminar} onClose={() => setConfirmEliminar(false)} onConfirm={handleConfirmarEliminar}
                title="¿Eliminar jornada?"
                message={`¿Estás seguro que deseas eliminar "${selectedWorkday?.name}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
}
