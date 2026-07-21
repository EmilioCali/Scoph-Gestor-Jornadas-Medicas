import { useState, useMemo } from "react";
import {
    PlusIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import { medicineCategories } from "../../../shared/constants/catalogOptions";
import { useInventarioCentral } from "../hooks/useInventarioCentral";
import { useAuthStore } from "../../../features/auth/store/authStore.js";

// ── Badges ────────────────────────────────────────────────────────────────────

function getStockBadge(totalStock, minimumStock) {
    if (totalStock <= 0) return <Badge variant="danger">Agotado</Badge>;
    if (totalStock <= minimumStock * 0.5) return <Badge variant="danger">Crítico</Badge>;
    if (totalStock <= minimumStock) return <Badge variant="warning">Bajo</Badge>;
    return <Badge variant="success">Normal</Badge>;
}

function getExpirationBadge(lots) {
    if (!lots || lots.length === 0) return <Badge variant="gray">Sin lotes</Badge>;
    const hoy = new Date();
    const minDays = Math.min(
        ...lots.map((l) => Math.ceil((new Date(l.expirationDate) - hoy) / (1000 * 60 * 60 * 24)))
    );
    if (minDays <= 0) return <Badge variant="danger">Vencido</Badge>;
    if (minDays <= 15) return <Badge variant="danger">Vence en {minDays}d</Badge>;
    if (minDays <= 30) return <Badge variant="warning">Vence en {minDays}d</Badge>;
    if (minDays <= 60) return <Badge variant="info">Vence en {minDays}d</Badge>;
    return <Badge variant="success">{new Date(lots[0].expirationDate).toLocaleDateString("es-GT")}</Badge>;
}

// ── Formularios ───────────────────────────────────────────────────────────────

function AgregarForm({ form, onChange, onSubmit, onClose, availableMedicines, submitting, formError }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
            )}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Medicamento del catálogo</label>
                <select name="medicineId" value={form.medicineId} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                    <option value="">Seleccionar medicamento</option>
                    {availableMedicines.map((m) => (
                        <option key={m._id} value={m._id}>{m.name} — {m.compound} {m.concentration}</option>
                    ))}
                </select>
            </div>
            <Input label="Stock mínimo" name="minimumStock" type="number" min="0" value={form.minimumStock} onChange={onChange} placeholder="10" required />
            <p className="text-xs text-gray-400">Lote inicial (opcional — si no hay stock dejar en 0)</p>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Número de lote" name="batch" value={form.batch} onChange={onChange} placeholder="LOTE-001" />
                <Input label="Fecha de vencimiento" name="expirationDate" type="date" value={form.expirationDate} onChange={onChange} />
            </div>
            <Input label="Stock inicial" name="initialStock" type="number" min="0" value={form.initialStock} onChange={onChange} placeholder="0" />
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Agregar al inventario"}
                </Button>
            </div>
        </form>
    );
}

function EntradaForm({ form, onChange, onSubmit, onClose, item, submitting, formError }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
            )}
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400">Medicamento</p>
                <p className="text-sm font-semibold text-gray-700">{item?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    Stock actual: <span className="font-semibold text-gray-600">{item?.totalStock} {item?.unitOfMeasure}</span>
                </p>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Tipo de entrada</label>
                <select name="tipoEntrada" value={form.tipoEntrada} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                    <option value="DONACION">Donación</option>
                    <option value="COMPRA">Compra</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Número de lote" name="batch" value={form.batch} onChange={onChange} placeholder="LOTE-001" required />
                <Input label="Fecha de vencimiento" name="expirationDate" type="date" value={form.expirationDate} onChange={onChange} required />
            </div>
            <Input label="Cantidad a ingresar" name="quantity" type="number" min="1" value={form.quantity} onChange={onChange} placeholder="0" required />
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Registrar entrada"}
                </Button>
            </div>
        </form>
    );
}

function SalidaForm({ form, onChange, onSubmit, onClose, item, submitting, formError }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
            )}
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400">Medicamento</p>
                <p className="text-sm font-semibold text-gray-700">{item?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    Stock actual: <span className="font-semibold text-gray-600">{item?.totalStock} {item?.unitOfMeasure}</span>
                </p>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Lote a retirar</label>
                <select name="batch" value={form.batch} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                    <option value="">Seleccionar lote</option>
                    {item?.lots?.filter((l) => l.stock > 0).map((l) => (
                        <option key={l.batch} value={l.batch}>
                            {l.batch} — Stock: {l.stock} — Vence: {new Date(l.expirationDate).toLocaleDateString("es-GT")}
                        </option>
                    ))}
                </select>
            </div>
            <Input label="Cantidad a retirar" name="quantity" type="number" min="1"
                max={item?.lots?.find((l) => l.batch === form.batch)?.stock ?? item?.totalStock}
                value={form.quantity} onChange={onChange} placeholder="0" required />
            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button variant="danger" type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Registrar salida"}
                </Button>
            </div>
        </form>
    );
}

// ── Constantes ────────────────────────────────────────────────────────────────

const entradaInicial = { tipoEntrada: "DONACION", batch: "", expirationDate: "", quantity: "" };
const salidaInicial = { batch: "", quantity: "" };
const agregarInicial = { medicineId: "", minimumStock: "", batch: "", expirationDate: "", initialStock: "0" };

// ── Página ────────────────────────────────────────────────────────────────────

export default function InventarioCentralPage() {
    const currentUser = useAuthStore((state) => state.user);
    const canModifyCentralInventory = currentUser?.rol === "ADMIN" || currentUser?.rol === "SUPER_ADMIN";
    const {
        inventory, loading, error, refetch,
        availableMedicines,
        addToInventory, registrarEntrada, registrarSalida,
    } = useInventarioCentral();

    const [busqueda, setBusqueda] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroStock, setFiltroStock] = useState("");

    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEntrada, setModalEntrada] = useState(false);
    const [modalSalida, setModalSalida] = useState(false);
    const [modalLotes, setModalLotes] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [formEntrada, setFormEntrada] = useState(entradaInicial);
    const [formSalida, setFormSalida] = useState(salidaInicial);
    const [formAgregar, setFormAgregar] = useState(agregarInicial);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    // ── Filtros locales ───────────────────────────────────────────────────────
    const filteredInventory = useMemo(() =>
        inventory.filter((item) => {
            const matchSearch =
                item.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
                item.compound?.toLowerCase().includes(busqueda.toLowerCase());
            const matchCategory = filtroCategoria ? item.category === filtroCategoria : true;
            const matchStock = (() => {
                if (!filtroStock) return true;
                if (filtroStock === "AGOTADO") return item.totalStock <= 0;
                if (filtroStock === "CRITICO") return item.totalStock > 0 && item.totalStock <= item.minimumStock * 0.5;
                if (filtroStock === "BAJO") return item.totalStock > item.minimumStock * 0.5 && item.totalStock <= item.minimumStock;
                if (filtroStock === "NORMAL") return item.totalStock > item.minimumStock;
                return true;
            })();
            return matchSearch && matchCategory && matchStock;
        }),
    [inventory, busqueda, filtroCategoria, filtroStock]);

    const handleChangeEntrada = (e) => setFormEntrada((p) => ({ ...p, [e.target.name]: e.target.value }));
    const handleChangeSalida = (e) => setFormSalida((p) => ({ ...p, [e.target.name]: e.target.value }));
    const handleChangeAgregar = (e) => setFormAgregar((p) => ({ ...p, [e.target.name]: e.target.value }));

    // ── Agregar al inventario ─────────────────────────────────────────────────
    const handleAgregarAlInventario = async (e) => {
        e.preventDefault();
        if (!canModifyCentralInventory) {
            setFormError("No tienes permisos para modificar inventario central");
            return;
        }

        setSubmitting(true);
        setFormError(null);
        try {
            await addToInventory(formAgregar);
            setFormAgregar(agregarInicial);
            setModalAgregar(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "No se pudo agregar al inventario");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Registrar entrada ─────────────────────────────────────────────────────
    const handleRegistrarEntrada = async (e) => {
        e.preventDefault();
        if (!canModifyCentralInventory) {
            setFormError("No tienes permisos para registrar compras o donaciones");
            return;
        }

        setSubmitting(true);
        setFormError(null);
        try {
            await registrarEntrada({ item: selectedItem, ...formEntrada });
            setModalEntrada(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "No se pudo registrar la entrada");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Registrar salida ──────────────────────────────────────────────────────
    const handleRegistrarSalida = async (e) => {
        e.preventDefault();
        if (!canModifyCentralInventory) {
            setFormError("No tienes permisos para modificar inventario central");
            return;
        }

        setSubmitting(true);
        setFormError(null);
        try {
            await registrarSalida({ item: selectedItem, ...formSalida });
            setModalSalida(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "No se pudo registrar la salida");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Exportar ──────────────────────────────────────────────────────────────
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Inventario Central - SCOPH URL", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, 14, 22);
        autoTable(doc, {
            startY: 28,
            head: [["Medicamento", "Categoría", "Stock Total", "Stock Mínimo", "Estado"]],
            body: filteredInventory.map((item) => [
                item.name, item.category,
                `${item.totalStock} ${item.unitOfMeasure}`,
                item.minimumStock,
                item.totalStock <= 0 ? "Agotado" : item.totalStock <= item.minimumStock ? "Bajo" : "Normal",
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [242, 116, 5] },
        });
        doc.save("inventario-central.pdf");
    };

    const handleExportExcel = () => {
        const datos = filteredInventory.flatMap((item) =>
            item.lots.map((lot) => ({
                Medicamento: item.name, Compuesto: item.compound, Categoría: item.category,
                "Unidad Medida": item.unitOfMeasure, Lote: lot.batch,
                "Stock Lote": lot.stock,
                "Fecha Vencimiento": new Date(lot.expirationDate).toLocaleDateString("es-GT"),
                "Stock Total": item.totalStock, "Stock Mínimo": item.minimumStock,
                Estado: item.totalStock <= 0 ? "Agotado" : item.totalStock <= item.minimumStock ? "Bajo" : "Normal",
            }))
        );
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventario Central");
        XLSX.writeFile(wb, "inventario-central.xlsx");
    };

    // ── Columnas ──────────────────────────────────────────────────────────────
    const columnas = [
        {
            key: "name", label: "Medicamento",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.compound} · {row.category}</p>
                </div>
            ),
        },
        { key: "unitOfMeasure", label: "Unidad" },
        {
            key: "totalStock", label: "Stock Total",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.totalStock}</p>
                    <p className="text-xs text-gray-400">Mín: {row.minimumStock}</p>
                </div>
            ),
        },
        { key: "estado", label: "Estado Stock", render: (row) => getStockBadge(row.totalStock, row.minimumStock) },
        { key: "vencimiento", label: "Vencimiento", render: (row) => getExpirationBadge(row.lots) },
        {
            key: "lots", label: "Lotes",
            render: (row) => (
                <button onClick={() => { setSelectedItem(row); setModalLotes(true); }}
                    className="text-xs text-primary hover:text-primary-dark font-semibold underline transition">
                    Ver {row.lots.length} lote(s)
                </button>
            ),
        },
        {
            key: "acciones", label: "Acciones",
            render: (row) => canModifyCentralInventory ? (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" title="Registrar entrada"
                        onClick={() => { setSelectedItem(row); setFormEntrada(entradaInicial); setFormError(null); setModalEntrada(true); }}>
                        <ArrowUpIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Registrar salida"
                        onClick={() => { setSelectedItem(row); setFormSalida(salidaInicial); setFormError(null); setModalSalida(true); }}>
                        <ArrowDownIcon className="w-4 h-4" />
                    </Button>
                </div>
            ) : <span className="text-xs text-gray-400">Solo lectura</span>,
        },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <PageHeader
                title="Inventario Central"
                subtitle="Control de stock, lotes y vencimientos de medicamentos"
                action={canModifyCentralInventory ? (
                    <div className="flex gap-2">
                        <Button variant="outline" size="md" onClick={refetch} disabled={loading} title="Recargar">
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        <Button variant="primary" onClick={() => { setFormAgregar(agregarInicial); setFormError(null); setModalAgregar(true); }}>
                            <PlusIcon className="w-4 h-4" /> Agregar al Inventario
                        </Button>
                    </div>
                ) : null}
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
                    <p className="text-xs text-gray-400 font-medium">Total Registros</p>
                    <p className="text-2xl font-extrabold text-gray-800">{inventory.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Agotados</p>
                    <p className="text-2xl font-extrabold text-red-500">
                        {inventory.filter((i) => i.totalStock <= 0).length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Stock Bajo</p>
                    <p className="text-2xl font-extrabold text-yellow-500">
                        {inventory.filter((i) => i.totalStock > 0 && i.totalStock <= i.minimumStock).length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-xs text-gray-400 font-medium">Stock Normal</p>
                    <p className="text-2xl font-extrabold text-green-500">
                        {inventory.filter((i) => i.totalStock > i.minimumStock).length}
                    </p>
                </div>
            </div>

            {/* Búsqueda y filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre o compuesto..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 placeholder-gray-300 transition"
                        />
                    </div>
                    <div className="relative">
                        <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition appearance-none">
                            <option value="">Todas las categorías</option>
                            {medicineCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition">
                        <option value="">Todo el stock</option>
                        <option value="NORMAL">Normal</option>
                        <option value="BAJO">Bajo</option>
                        <option value="CRITICO">Crítico</option>
                        <option value="AGOTADO">Agotado</option>
                    </select>
                    <Button variant="outline" size="md" onClick={handleExportPDF} disabled={loading}>PDF</Button>
                    <Button variant="outline" size="md" onClick={handleExportExcel} disabled={loading}>Excel</Button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    Mostrando <span className="font-semibold text-gray-600">{filteredInventory.length}</span> de{" "}
                    <span className="font-semibold text-gray-600">{inventory.length}</span> registros
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Table columns={columnas} data={filteredInventory} loading={loading} emptyMessage="No hay medicamentos en el inventario central" />
            </div>

            {/* Modal — Agregar */}
            <Modal isOpen={modalAgregar} onClose={() => setModalAgregar(false)} title="Agregar al Inventario Central" size="md">
                <AgregarForm
                    form={formAgregar} onChange={handleChangeAgregar}
                    onSubmit={handleAgregarAlInventario} onClose={() => setModalAgregar(false)}
                    availableMedicines={availableMedicines}
                    submitting={submitting} formError={formError}
                />
            </Modal>

            {/* Modal — Entrada */}
            <Modal isOpen={modalEntrada} onClose={() => setModalEntrada(false)} title="Registrar Entrada" size="sm">
                <EntradaForm
                    form={formEntrada} onChange={handleChangeEntrada}
                    onSubmit={handleRegistrarEntrada} onClose={() => setModalEntrada(false)}
                    item={selectedItem} submitting={submitting} formError={formError}
                />
            </Modal>

            {/* Modal — Salida */}
            <Modal isOpen={modalSalida} onClose={() => setModalSalida(false)} title="Registrar Salida (Receta)" size="sm">
                <SalidaForm
                    form={formSalida} onChange={handleChangeSalida}
                    onSubmit={handleRegistrarSalida} onClose={() => setModalSalida(false)}
                    item={selectedItem} submitting={submitting} formError={formError}
                />
            </Modal>

            {/* Modal — Lotes */}
            <Modal isOpen={modalLotes} onClose={() => setModalLotes(false)} title={`Lotes — ${selectedItem?.name}`} size="md">
                <div className="space-y-3">
                    {selectedItem?.lots.map((lot) => {
                        const days = Math.ceil((new Date(lot.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                            <div key={lot.batch} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Lote {lot.batch}</p>
                                    <p className="text-xs text-gray-400">Vence: {new Date(lot.expirationDate).toLocaleDateString("es-GT")}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-extrabold text-gray-700">{lot.stock} uds.</p>
                                    {days <= 0 ? <Badge variant="danger">Vencido</Badge>
                                        : days <= 30 ? <Badge variant="danger">Vence en {days}d</Badge>
                                        : days <= 60 ? <Badge variant="warning">Vence en {days}d</Badge>
                                        : <Badge variant="success">Vigente</Badge>}
                                </div>
                            </div>
                        );
                    })}
                    {(!selectedItem?.lots || selectedItem.lots.length === 0) && (
                        <p className="text-sm text-gray-400 text-center py-4">Sin lotes registrados</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
