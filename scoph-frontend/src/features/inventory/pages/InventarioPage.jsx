import { useState } from "react";
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

// Componentes reutilizables heredados
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

// Datos mock - se reemplazarán por llamadas axios al conectar el backend

// Retorna badge según el nivel de stock del medicamento
function getStockBadge(stockActual, stockMinimo) {
    if (stockActual <= 0) return <Badge variant="danger">Sin Stock</Badge>;
    if (stockActual <= stockMinimo * 0.5) return <Badge variant="danger">Crítico</Badge>;
    if (stockActual <= stockMinimo) return <Badge variant="warning">Bajo</Badge>;
    return <Badge variant="success">Normal</Badge>;
}

// Retorna badge según los días restantes para el vencimiento
function getVencimientoBadge(fecha) {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const dias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    if (dias <= 15) return <Badge variant="danger">Vence en {dias}d</Badge>;
    if (dias <= 30) return <Badge variant="warning">Vence en {dias}d</Badge>;
    if (dias <= 60) return <Badge variant="info">Vence en {dias}d</Badge>;
    return <Badge variant="success">{vencimiento.toLocaleDateString("es-GT")}</Badge>;
}

// Formulario para registrar un nuevo medicamento en el inventario
function MedicamentoForm({ form, onChange, onSubmit, onClose }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Input
                label="Nombre del medicamento"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Amoxicilina 500mg"
                required
            />
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Categoría"
                    name="categoria"
                    value={form.categoria}
                    onChange={onChange}
                    placeholder="Antibiótico"
                    required
                />
                <Input
                    label="Unidad"
                    name="unidad"
                    value={form.unidad}
                    onChange={onChange}
                    placeholder="Tabletas"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Stock inicial"
                    name="stockActual"
                    type="number"
                    min="0"
                    value={form.stockActual}
                    onChange={onChange}
                    placeholder="0"
                    required
                />
                <Input
                    label="Stock mínimo"
                    name="stockMinimo"
                    type="number"
                    min="0"
                    value={form.stockMinimo}
                    onChange={onChange}
                    placeholder="0"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Lote"
                    name="lote"
                    value={form.lote}
                    onChange={onChange}
                    placeholder="L-2024-01"
                    required
                />
                <Input
                    label="Fecha de vencimiento"
                    name="fechaVencimiento"
                    type="date"
                    value={form.fechaVencimiento}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" type="submit">Registrar medicamento</Button>
            </div>
        </form>
    );
}

// Formulario para registrar entradas de medicamentos (DONACION / COMPRA)
function EntradaForm({ form, onChange, onSubmit, onClose, medicamento }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Información del medicamento seleccionado */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400">Medicamento</p>
                <p className="text-sm font-semibold text-gray-700">{medicamento?.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">Stock actual: <span className="font-semibold text-gray-600">{medicamento?.stockActual} {medicamento?.unidad}</span></p>
            </div>

            {/* Tipo de entrada */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Tipo de entrada</label>
                <select
                    name="subtipo"
                    value={form.subtipo}
                    onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
                    required
                >
                    <option value="DONACION">Donación</option>
                    <option value="COMPRA">Compra</option>
                </select>
            </div>

            <Input
                label="Cantidad a ingresar"
                name="cantidad"
                type="number"
                min="1"
                value={form.cantidad}
                onChange={onChange}
                placeholder="0"
                required
            />
            <Input
                label="Observación"
                name="observacion"
                value={form.observacion}
                onChange={onChange}
                placeholder="Ej: Donación Cruz Roja"
            />
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" type="submit">Registrar entrada</Button>
            </div>
        </form>
    );
}

// Formulario para registrar salidas de medicamentos (RECETA)
function SalidaForm({ form, onChange, onSubmit, onClose, medicamento }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Información del medicamento seleccionado */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400">Medicamento</p>
                <p className="text-sm font-semibold text-gray-700">{medicamento?.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">Stock actual: <span className="font-semibold text-gray-600">{medicamento?.stockActual} {medicamento?.unidad}</span></p>
            </div>

            <Input
                label="Cantidad a retirar"
                name="cantidad"
                type="number"
                min="1"
                max={medicamento?.stockActual}
                value={form.cantidad}
                onChange={onChange}
                placeholder="0"
                required
            />
            <Input
                label="Observación"
                name="observacion"
                value={form.observacion}
                onChange={onChange}
                placeholder="Ej: Receta paciente"
            />
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                <Button variant="danger" type="submit">Registrar salida</Button>
            </div>
        </form>
    );
}

// Estado inicial de los formularios de movimiento
const movimientoInicial = { subtipo: "DONACION", cantidad: "", observacion: "" };
const medicamentoInicial = { nombre: "", categoria: "", unidad: "", stockActual: "", stockMinimo: "", lote: "", fechaVencimiento: "" };

export default function InventarioPage() {
    const [inventario, setInventario] = useState([]);
    const [modalMedicamento, setModalMedicamento] = useState(false);
    const [modalEntrada, setModalEntrada] = useState(false);
    const [modalSalida, setModalSalida] = useState(false);
    const [confirmEliminar, setConfirmEliminar] = useState(false);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [formMedicamento, setFormMedicamento] = useState(medicamentoInicial);
    const [formMovimiento, setFormMovimiento] = useState(movimientoInicial);

    // Maneja cambios en los inputs de cada formulario
    const handleChangeMedicamento = (e) => {
        const { name, value } = e.target;
        setFormMedicamento((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangeMovimiento = (e) => {
        const { name, value } = e.target;
        setFormMovimiento((prev) => ({ ...prev, [name]: value }));
    };

    // Abre modal de entrada con el medicamento seleccionado
    const handleAbrirEntrada = (item) => {
        setItemSeleccionado(item);
        setFormMovimiento(movimientoInicial);
        setModalEntrada(true);
    };

    // Abre modal de salida con el medicamento seleccionado
    const handleAbrirSalida = (item) => {
        setItemSeleccionado(item);
        setFormMovimiento({ ...movimientoInicial, subtipo: "RECETA" });
        setModalSalida(true);
    };

    // Abre confirmación de eliminación
    const handleEliminar = (item) => {
        setItemSeleccionado(item);
        setConfirmEliminar(true);
    };

    // Registra nuevo medicamento en el inventario
    // Cuando se conecte el backend aquí irá la llamada a coreService.crearMedicamento()
    const handleCrearMedicamento = (e) => {
        e.preventDefault();
        const nuevo = { ...formMedicamento, _id: Date.now().toString(), stockActual: Number(formMedicamento.stockActual), stockMinimo: Number(formMedicamento.stockMinimo) };
        setInventario((prev) => [...prev, nuevo]);
        setFormMedicamento(medicamentoInicial);
        setModalMedicamento(false);
    };

    // Registra entrada de medicamento (DONACION / COMPRA)
    // Cuando se conecte el backend aquí irá la llamada a coreService.registrarMovimiento()
    const handleRegistrarEntrada = (e) => {
        e.preventDefault();
        setInventario((prev) =>
            prev.map((item) =>
                item._id === itemSeleccionado._id
                    ? { ...item, stockActual: item.stockActual + Number(formMovimiento.cantidad) }
                    : item
            )
        );
        setModalEntrada(false);
    };

    // Registra salida de medicamento (RECETA)
    // Cuando se conecte el backend aquí irá la llamada a coreService.registrarMovimiento()
    const handleRegistrarSalida = (e) => {
        e.preventDefault();
        setInventario((prev) =>
            prev.map((item) =>
                item._id === itemSeleccionado._id
                    ? { ...item, stockActual: Math.max(0, item.stockActual - Number(formMovimiento.cantidad)) }
                    : item
            )
        );
        setModalSalida(false);
    };

    // Elimina medicamento del inventario
    // Cuando se conecte el backend aquí irá la llamada a coreService.eliminarMedicamento()
    const handleConfirmarEliminar = () => {
        setInventario((prev) => prev.filter((item) => item._id !== itemSeleccionado._id));
        setConfirmEliminar(false);
    };

    // Columnas de la tabla con renders personalizados
    const columnas = [
        {
            key: "nombre", label: "Medicamento",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.nombre}</p>
                    <p className="text-xs text-gray-400">{row.categoria} · {row.lote}</p>
                </div>
            ),
        },
        { key: "unidad", label: "Unidad" },
        {
            key: "stockActual", label: "Stock",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.stockActual}</p>
                    <p className="text-xs text-gray-400">Mín: {row.stockMinimo}</p>
                </div>
            ),
        },
        {
            key: "estado", label: "Estado Stock",
            render: (row) => getStockBadge(row.stockActual, row.stockMinimo),
        },
        {
            key: "fechaVencimiento", label: "Vencimiento",
            render: (row) => getVencimientoBadge(row.fechaVencimiento),
        },
        {
            key: "acciones", label: "Acciones",
            render: (row) => (
                <div className="flex gap-2">
                    {/* Entrada de medicamento */}
                    <Button variant="outline" size="sm" onClick={() => handleAbrirEntrada(row)}>
                        <ArrowUpIcon className="w-4 h-4" />
                    </Button>
                    {/* Salida de medicamento */}
                    <Button variant="ghost" size="sm" onClick={() => handleAbrirSalida(row)}>
                        <ArrowDownIcon className="w-4 h-4" />
                    </Button>
                    {/* Eliminar medicamento */}
                    <Button variant="danger" size="sm" onClick={() => handleEliminar(row)}>
                        ✕
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Inventario Central"
                subtitle="Control de medicamentos y movimientos de stock"
                action={
                    <Button variant="primary" onClick={() => { setFormMedicamento(medicamentoInicial); setModalMedicamento(true); }}>
                        <PlusIcon className="w-4 h-4" />
                        Nuevo Medicamento
                    </Button>
                }
            />

            {/* Resumen rápido de alertas de stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Total Medicamentos</p>
                    <p className="text-2xl font-extrabold text-gray-800">{inventario.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Stock Bajo o Crítico</p>
                    <p className="text-2xl font-extrabold text-red-500">
                        {inventario.filter((i) => i.stockActual <= i.stockMinimo).length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Por Vencer (60 días)</p>
                    <p className="text-2xl font-extrabold text-yellow-500">
                        {inventario.filter((i) => {
                            const dias = Math.ceil((new Date(i.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                            return dias <= 60;
                        }).length}
                    </p>
                </div>
            </div>

            {/* Tabla principal de inventario */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Table
                    columns={columnas}
                    data={inventario}
                    emptyMessage="No hay medicamentos registrados"
                />
            </div>

            {/* Modal nuevo medicamento */}
            <Modal isOpen={modalMedicamento} onClose={() => setModalMedicamento(false)} title="Nuevo Medicamento" size="md">
                <MedicamentoForm
                    form={formMedicamento}
                    onChange={handleChangeMedicamento}
                    onSubmit={handleCrearMedicamento}
                    onClose={() => setModalMedicamento(false)}
                />
            </Modal>

            {/* Modal registrar entrada */}
            <Modal isOpen={modalEntrada} onClose={() => setModalEntrada(false)} title="Registrar Entrada" size="sm">
                <EntradaForm
                    form={formMovimiento}
                    onChange={handleChangeMovimiento}
                    onSubmit={handleRegistrarEntrada}
                    onClose={() => setModalEntrada(false)}
                    medicamento={itemSeleccionado}
                />
            </Modal>

            {/* Modal registrar salida */}
            <Modal isOpen={modalSalida} onClose={() => setModalSalida(false)} title="Registrar Salida" size="sm">
                <SalidaForm
                    form={formMovimiento}
                    onChange={handleChangeMovimiento}
                    onSubmit={handleRegistrarSalida}
                    onClose={() => setModalSalida(false)}
                    medicamento={itemSeleccionado}
                />
            </Modal>

            {/* Confirmación de eliminación */}
            <ConfirmDialog
                isOpen={confirmEliminar}
                onClose={() => setConfirmEliminar(false)}
                onConfirm={handleConfirmarEliminar}
                title="¿Eliminar medicamento?"
                message={`¿Estás seguro que deseas eliminar ${itemSeleccionado?.nombre} del inventario? Esta acción no se puede deshacer.`}
            />
        </div>
    );
}
