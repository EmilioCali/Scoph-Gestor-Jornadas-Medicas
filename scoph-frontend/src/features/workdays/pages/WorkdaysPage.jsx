import { useState } from "react";
import { PlusIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { mockWorkdays, mockCentralInventory, mockWorkdayInventory, mockDepartamentos, mockUsers } from "../../../shared/utils/mockData";

// Badge según estado de la jornada - valores reales del backend
function getStatusBadge(status) {
    const map = {
        IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
        PLANNED: <Badge variant="info">Planificada</Badge>,
        COMPLETED: <Badge variant="gray">Finalizada</Badge>,
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
function WorkdayDetail({ workday, workdayInventory, onAssign, onConsumption, onReturn }) {
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
                    {workday.status !== "COMPLETED" && (
                        <Button variant="primary" size="sm" onClick={onAssign}>
                            <PlusIcon className="w-4 h-4" />Asignar medicamento
                        </Button>
                    )}
                </div>

                {workdayInventory.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-6 bg-gray-50 rounded-xl border border-gray-100">
                        No hay medicamentos asignados a esta jornada
                    </p>
                ) : (
                    <div className="space-y-2">
                        {workdayInventory.map((item) => (
                            <div key={`${item._id}-${item.batch}`} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                                    <p className="text-xs text-gray-400">
                                        Lote: {item.batch} · Asignado: {item.assignedQuantity} · Usado: {item.usedQuantity} · Restante: {item.assignedQuantity - item.usedQuantity}
                                    </p>
                                </div>
                                {workday.status === "IN_PROGRESS" && (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => onConsumption(item)}>Consumo</Button>
                                        <Button variant="outline" size="sm" onClick={() => onReturn(item)}>Retorno</Button>
                                    </div>
                                )}
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
function AssignMedicineForm({ form, onChange, onSubmit, onClose, centralInventory }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Medicamento</label>
                <select name="medicineId" value={form.medicineId} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                    <option value="">Seleccionar medicamento</option>
                    {centralInventory.map((med) => (
                        <option key={med._id} value={med._id}>{med.name} (Stock: {med.totalStock} {med.unitOfMeasure})</option>
                    ))}
                </select>
            </div>
            {form.medicineId && (
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Lote</label>
                    <select name="batch" value={form.batch} onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                        <option value="">Seleccionar lote</option>
                        {centralInventory.find((m) => m._id === form.medicineId)?.lots.map((l) => (
                            <option key={l.batch} value={l.batch}>
                                {l.batch} — Stock: {l.stock} — Vence: {new Date(l.expirationDate).toLocaleDateString("es-GT")}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <Input label="Cantidad a asignar" name="quantity" type="number" min="1" value={form.quantity} onChange={onChange} placeholder="0" required />
            <p className="text-xs text-gray-400 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                ⚠️ Esta cantidad se descontará del inventario central (ASIGNACION_JORNADA).
            </p>
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" type="submit">Asignar</Button>
            </div>
        </form>
    );
}

// Formulario reutilizable para consumo y retorno
// Consumo → backend: productoId, cantidad (POST /movimientos/consumo-jornada)
// Retorno → backend: productoId, cantidad (POST /movimientos/retorno-jornada)
function WorkdayMovementForm({ form, onChange, onSubmit, onClose, item, tipo }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400">Medicamento</p>
                <p className="text-sm font-semibold text-gray-700">{item?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    Lote: {item?.batch} · Disponible: <span className="font-semibold text-gray-600">{item ? item.assignedQuantity - item.usedQuantity : 0}</span>
                </p>
            </div>
            <Input
                label={tipo === "CONSUMO" ? "Cantidad consumida" : "Cantidad a retornar"}
                name="quantity" type="number" min="1"
                max={item ? item.assignedQuantity - item.usedQuantity : 0}
                value={form.quantity} onChange={onChange} placeholder="0" required
            />
            <Input label="Observación" name="observacion" value={form.observacion} onChange={onChange}
                placeholder={tipo === "CONSUMO" ? "Ej: Receta paciente" : "Ej: Medicamento no utilizado"} />
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                <Button variant={tipo === "CONSUMO" ? "danger" : "primary"} type="submit">
                    {tipo === "CONSUMO" ? "Registrar consumo" : "Registrar retorno"}
                </Button>
            </div>
        </form>
    );
}

const workdayInicial = { name: "", description: "", startDate: "", endDate: "", department: "", municipality: "", address: "", managerId: "", estimatedPatients: "", estimatedMedicines: "", status: "PLANNED" };
const assignInicial = { medicineId: "", batch: "", quantity: "" };
const movementInicial = { quantity: "", observacion: "" };

export default function JornadasPage() {
    const [workdays, setWorkdays] = useState(mockWorkdays);
    const [centralInventory, setCentralInventory] = useState(mockCentralInventory);
    const [workdayInventories, setWorkdayInventories] = useState(mockWorkdayInventory);

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

    const handleVerDetalle = (workday) => { setSelectedWorkday(workday); setModalDetalle(true); };
    const handleEliminar = (workday) => { setSelectedWorkday(workday); setConfirmEliminar(true); };

    // Crea jornada - cuando se conecte el backend usar createWorkday() de workdayService
    // El body debe ser: { name, description, startDate, endDate, location, manager, estimatedPatients, estimatedMedicines, status }
    const handleCrearWorkday = (e) => {
        e.preventDefault();
        const manager = mockUsers.find((u) => u._id === formWorkday.managerId);
        const nueva = {
            _id: `jor_${Date.now()}`,
            name: formWorkday.name,
            description: formWorkday.description,
            startDate: new Date(formWorkday.startDate).toISOString(),
            endDate: new Date(formWorkday.endDate).toISOString(),
            location: { department: formWorkday.department, municipality: formWorkday.municipality, address: formWorkday.address },
            manager: { userId: formWorkday.managerId, name: manager ? `${manager.nombre} ${manager.apellido}` : "" },
            estimatedPatients: Number(formWorkday.estimatedPatients),
            estimatedMedicines: Number(formWorkday.estimatedMedicines),
            status: formWorkday.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setWorkdays((prev) => [...prev, nueva]);
        setWorkdayInventories((prev) => ({ ...prev, [nueva._id]: [] }));
        setFormWorkday(workdayInicial);
        setModalCrear(false);
    };

    // Asigna medicamentos - cuando se conecte el backend usar registerTransfer() de coreService
    // Body: { jornadaId, jornadaNombre, detalle: [{ medicineId, batch, quantity, expirationDate }] }
    const handleAsignarMedicamento = (e) => {
        e.preventDefault();
        const medicine = centralInventory.find((m) => m._id === formAssign.medicineId);
        if (!medicine) return;
        const quantity = Number(formAssign.quantity);
        const workdayId = selectedWorkday._id;
        const lotInfo = medicine.lots.find((l) => l.batch === formAssign.batch);

        setCentralInventory((prev) => prev.map((m) => m._id === medicine._id ? {
            ...m,
            totalStock: Math.max(0, m.totalStock - quantity),
            lots: m.lots.map((l) => l.batch === formAssign.batch ? { ...l, stock: Math.max(0, l.stock - quantity) } : l),
        } : m));

        setWorkdayInventories((prev) => {
            const current = prev[workdayId] || [];
            const exists = current.find((i) => i._id === medicine._id && i.batch === formAssign.batch);
            if (exists) {
                return { ...prev, [workdayId]: current.map((i) => i._id === medicine._id && i.batch === formAssign.batch ? { ...i, assignedQuantity: i.assignedQuantity + quantity } : i) };
            }
            return {
                ...prev, [workdayId]: [...current, {
                    _id: medicine._id, name: medicine.name, unitOfMeasure: medicine.unitOfMeasure,
                    batch: formAssign.batch, expirationDate: lotInfo?.expirationDate || "",
                    assignedQuantity: quantity, usedQuantity: 0, returnedQuantity: 0,
                }],
            };
        });

        setFormAssign(assignInicial);
        setModalAsignar(false);
    };

    // Registra consumo - cuando se conecte el backend usar registerConsumption() de coreService
    // Body: { productoId, cantidad }
    const handleRegistrarConsumo = (e) => {
        e.preventDefault();
        const quantity = Number(formMovement.quantity);
        const workdayId = selectedWorkday._id;
        setWorkdayInventories((prev) => ({
            ...prev,
            [workdayId]: prev[workdayId].map((i) =>
                i._id === selectedInventoryItem._id && i.batch === selectedInventoryItem.batch
                    ? { ...i, usedQuantity: i.usedQuantity + quantity } : i
            ),
        }));
        setFormMovement(movementInicial);
        setModalConsumo(false);
    };

    // Registra retorno - cuando se conecte el backend usar registerReturn() de coreService
    // Body: { productoId, cantidad }
    const handleRegistrarRetorno = (e) => {
        e.preventDefault();
        const quantity = Number(formMovement.quantity);
        const workdayId = selectedWorkday._id;

        setCentralInventory((prev) => prev.map((m) => m._id === selectedInventoryItem._id ? {
            ...m,
            totalStock: m.totalStock + quantity,
            lots: m.lots.map((l) => l.batch === selectedInventoryItem.batch ? { ...l, stock: l.stock + quantity } : l),
        } : m));

        setWorkdayInventories((prev) => ({
            ...prev,
            [workdayId]: prev[workdayId].map((i) =>
                i._id === selectedInventoryItem._id && i.batch === selectedInventoryItem.batch
                    ? { ...i, returnedQuantity: i.returnedQuantity + quantity, assignedQuantity: Math.max(0, i.assignedQuantity - quantity) } : i
            ),
        }));
        setFormMovement(movementInicial);
        setModalRetorno(false);
    };

    // Elimina jornada - cuando se conecte el backend usar deleteWorkday() de workdayService
    const handleConfirmarEliminar = () => {
        setWorkdays((prev) => prev.filter((j) => j._id !== selectedWorkday._id));
        setConfirmEliminar(false);
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
            render: (row) => <Badge variant="gray">{(workdayInventories[row._id] || []).length} items</Badge>,
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
                    <Button variant="primary" onClick={() => { setFormWorkday(workdayInicial); setModalCrear(true); }}>
                        <PlusIcon className="w-4 h-4" />Nueva Jornada
                    </Button>
                }
            />

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
                <Table columns={columnas} data={workdays} emptyMessage="No hay jornadas registradas" />
            </div>

            <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nueva Jornada" size="lg">
                <WorkdayForm form={formWorkday} onChange={handleChangeWorkday} onSubmit={handleCrearWorkday} onClose={() => setModalCrear(false)} departamentos={mockDepartamentos} users={mockUsers} />
            </Modal>

            <Modal isOpen={modalDetalle} onClose={() => setModalDetalle(false)} title={selectedWorkday?.name} size="lg">
                {selectedWorkday && (
                    <WorkdayDetail
                        workday={selectedWorkday}
                        workdayInventory={workdayInventories[selectedWorkday._id] || []}
                        onAssign={() => { setFormAssign(assignInicial); setModalAsignar(true); }}
                        onConsumption={(item) => { setSelectedInventoryItem(item); setFormMovement(movementInicial); setModalConsumo(true); }}
                        onReturn={(item) => { setSelectedInventoryItem(item); setFormMovement(movementInicial); setModalRetorno(true); }}
                    />
                )}
            </Modal>

            <Modal isOpen={modalAsignar} onClose={() => setModalAsignar(false)} title="Asignar Medicamento" size="sm">
                <AssignMedicineForm form={formAssign} onChange={handleChangeAssign} onSubmit={handleAsignarMedicamento} onClose={() => setModalAsignar(false)} centralInventory={centralInventory} />
            </Modal>

            <Modal isOpen={modalConsumo} onClose={() => setModalConsumo(false)} title="Registrar Consumo" size="sm">
                <WorkdayMovementForm form={formMovement} onChange={handleChangeMovement} onSubmit={handleRegistrarConsumo} onClose={() => setModalConsumo(false)} item={selectedInventoryItem} tipo="CONSUMO" />
            </Modal>

            <Modal isOpen={modalRetorno} onClose={() => setModalRetorno(false)} title="Registrar Retorno" size="sm">
                <WorkdayMovementForm form={formMovement} onChange={handleChangeMovement} onSubmit={handleRegistrarRetorno} onClose={() => setModalRetorno(false)} item={selectedInventoryItem} tipo="RETORNO" />
            </Modal>

            <ConfirmDialog
                isOpen={confirmEliminar} onClose={() => setConfirmEliminar(false)} onConfirm={handleConfirmarEliminar}
                title="¿Eliminar jornada?"
                message={`¿Estás seguro que deseas eliminar "${selectedWorkday?.name}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
}