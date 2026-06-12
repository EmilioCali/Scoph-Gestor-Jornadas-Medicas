import { useState, useMemo } from "react";
import {
    PlusIcon,
    PencilIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PowerIcon,
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
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { medicineCategories } from "../../../shared/constants/catalogOptions";
import { useMedicines } from "../hooks/useMedicines";
import { useAuthStore } from "../../auth/store/authStore.js";

const FORM_INICIAL = {
    name: "", compound: "", concentration: "", barcode: "",
    presentation: "", unitOfMeasure: "", category: "", status: "ACTIVO",
};

function MedicineForm({ form, onChange, onSubmit, onClose, isEdit, submitting }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre comercial" name="name" value={form.name} onChange={onChange} placeholder="Zibac" required />
                <Input label="Compuesto activo" name="compound" value={form.compound} onChange={onChange} placeholder="Azitromicina" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Concentración" name="concentration" value={form.concentration} onChange={onChange} placeholder="200mg/5ml" required />
                <Input label="Código de barras" name="barcode" value={form.barcode} onChange={onChange} placeholder="7501234567890" />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Presentación</label>
                <select name="presentation" value={form.presentation} onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                    <option value="">Seleccionar</option>
                    {["Tableta", "Cápsula", "Jarabe", "Ampolla", "Crema", "Gotas", "Suspensión", "Otro"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Unidad de medida</label>
                    <select name="unitOfMeasure" value={form.unitOfMeasure} onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                        <option value="">Seleccionar</option>
                        {["Caja", "Frasco", "Ampolla", "Tubo", "Sobre", "Unidad"].map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Categoría</label>
                    <select name="category" value={form.category} onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition" required>
                        <option value="">Seleccionar</option>
                        {medicineCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isEdit && (
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Estado</label>
                    <select name="status" value={form.status} onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition">
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar medicamento"}
                </Button>
            </div>
        </form>
    );
}

export default function CatalogoPage() {
    const { medicines, loading, error, refetch, create, update, toggleStatus } = useMedicines();
    const currentUser = useAuthStore((state) => state.user);
    const canManageCatalog = currentUser?.rol === "ADMIN";

    const [busqueda, setBusqueda] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [confirmToggle, setConfirmToggle] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    const filteredMedicines = useMemo(() =>
        medicines.filter((m) => {
            const matchSearch =
                m.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                m.compound.toLowerCase().includes(busqueda.toLowerCase()) ||
                m.barcode?.includes(busqueda);
            const matchCategory = filtroCategoria ? m.category === filtroCategoria : true;
            const matchStatus = filtroEstado ? m.status === filtroEstado : true;
            return matchSearch && matchCategory && matchStatus;
        }),
    [medicines, busqueda, filtroCategoria, filtroEstado]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const validarDuplicado = (excludeId = null) => {
        const nombre = form.name.trim().toLowerCase();
        const barcode = form.barcode.trim();

        const duplicated = medicines.find((medicine) => {
            if (excludeId && medicine._id === excludeId) return false;

            return (
                medicine.name?.trim().toLowerCase() === nombre ||
                (barcode && medicine.barcode === barcode)
            );
        });

        if (!duplicated) return true;

        setFormError(
            duplicated.name?.trim().toLowerCase() === nombre
                ? "Ya existe un medicamento con ese nombre"
                : "Ya existe un medicamento con ese codigo de barras"
        );
        return false;
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!validarDuplicado()) return;

        setSubmitting(true);
        setFormError(null);
        try {
            await create(form);
            setForm(FORM_INICIAL);
            setModalCrear(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? err.message ?? "No se pudo crear el medicamento");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        if (!validarDuplicado(selectedItem._id)) return;

        setSubmitting(true);
        setFormError(null);
        try {
            const { status } = form;
            const campos = {
                name: form.name,
                compound: form.compound,
                concentration: form.concentration,
                barcode: form.barcode,
                presentation: form.presentation,
                unitOfMeasure: form.unitOfMeasure,
                category: form.category,
            };

            // Solo llamar PATCH /status si realmente cambió
            if (status !== selectedItem.status) {
                await toggleStatus(selectedItem._id, status);
            }

            // Solo llamar PUT si cambió algún campo editable
            const camposCambiaron = Object.keys(campos).some(
                (k) => campos[k] !== selectedItem[k]
            );
            if (camposCambiaron) {
                await update(selectedItem._id, campos);
            }

            setModalEditar(false);
        } catch (err) {
            setFormError(err.response?.data?.message ?? err.message ?? "No se pudo actualizar el medicamento");
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmarToggle = async () => {
        const nuevoEstado = selectedItem.status === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        try {
            await toggleStatus(selectedItem._id, nuevoEstado);
        } catch {
            // error visible en el banner si el fetch falla
        } finally {
            setConfirmToggle(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Catálogo de Medicamentos - SCOPH URL", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, 14, 22);
        autoTable(doc, {
            startY: 28,
            head: [["Nombre", "Compuesto", "Concentración", "Presentación", "Categoría", "Estado"]],
            body: filteredMedicines.map((m) => [
                m.name, m.compound, m.concentration, m.presentation, m.category, m.status,
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [242, 116, 5] },
        });
        doc.save("catalogo-medicamentos.pdf");
    };

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredMedicines.map((m) => ({
            Nombre: m.name, Compuesto: m.compound, Concentración: m.concentration,
            Presentación: m.presentation, "Unidad Medida": m.unitOfMeasure,
            Categoría: m.category, "Código Barras": m.barcode || "", Estado: m.status,
            "Fecha Registro": new Date(m.createdAt).toLocaleDateString("es-GT"),
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Catálogo");
        XLSX.writeFile(wb, "catalogo-medicamentos.xlsx");
    };

    const columnas = [
        {
            key: "name", label: "Medicamento",
            render: (row) => (
                <div>
                    <p className="font-semibold text-gray-700">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.compound} · {row.concentration}</p>
                </div>
            ),
        },
        { key: "presentation", label: "Presentación" },
        { key: "unitOfMeasure", label: "Unidad" },
        { key: "category", label: "Categoría", render: (row) => <Badge variant="primary">{row.category}</Badge> },
        { key: "barcode", label: "Cód. Barras", render: (row) => <span className="text-xs text-gray-500">{row.barcode || "—"}</span> },
        {
            key: "status", label: "Estado",
            render: (row) => row.status === "ACTIVO"
                ? <Badge variant="success">Activo</Badge>
                : <Badge variant="danger">Inactivo</Badge>
        },
        canManageCatalog && {
            key: "acciones", label: "Acciones",
            render: (row) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                        onClick={() => { setSelectedItem(row); setForm({ ...row }); setFormError(null); setModalEditar(true); }}>
                        <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={row.status === "ACTIVO" ? "danger" : "outline"}
                        size="sm"
                        onClick={() => { setSelectedItem(row); setConfirmToggle(true); }}
                        title={row.status === "ACTIVO" ? "Desactivar" : "Activar"}>
                        <PowerIcon className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ].filter(Boolean);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Catálogo de Medicamentos"
                subtitle="Registro maestro de todos los medicamentos del sistema"
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" size="md" onClick={refetch} disabled={loading} title="Recargar">
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        {canManageCatalog && (
                            <Button variant="primary" onClick={() => { setForm(FORM_INICIAL); setFormError(null); setModalCrear(true); }}>
                                <PlusIcon className="w-4 h-4" /> Nuevo Medicamento
                            </Button>
                        )}
                    </div>
                }
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={refetch}>Reintentar</Button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, compuesto o código de barras..."
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
                    <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition">
                        <option value="">Todos los estados</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                    <Button variant="outline" size="md" onClick={handleExportPDF} disabled={loading}>PDF</Button>
                    <Button variant="outline" size="md" onClick={handleExportExcel} disabled={loading}>Excel</Button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    Mostrando <span className="font-semibold text-gray-600">{filteredMedicines.length}</span> de{" "}
                    <span className="font-semibold text-gray-600">{medicines.length}</span> medicamentos
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Table columns={columnas} data={filteredMedicines} loading={loading} emptyMessage="No se encontraron medicamentos" />
            </div>

            <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Medicamento" size="md">
                {formError && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
                )}
                <MedicineForm form={form} onChange={handleChange} onSubmit={handleCrear}
                    onClose={() => setModalCrear(false)} isEdit={false} submitting={submitting} />
            </Modal>

            <Modal isOpen={modalEditar} onClose={() => setModalEditar(false)} title="Editar Medicamento" size="md">
                {formError && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
                )}
                <MedicineForm form={form} onChange={handleChange} onSubmit={handleGuardarEdicion}
                    onClose={() => setModalEditar(false)} isEdit={true} submitting={submitting} />
            </Modal>

            <ConfirmDialog
                isOpen={confirmToggle}
                onClose={() => setConfirmToggle(false)}
                onConfirm={handleConfirmarToggle}
                title={selectedItem?.status === "ACTIVO" ? "¿Desactivar medicamento?" : "¿Activar medicamento?"}
                message={
                    selectedItem?.status === "ACTIVO"
                        ? `"${selectedItem?.name}" quedará inactivo y no aparecerá en nuevos movimientos.`
                        : `"${selectedItem?.name}" volverá a estar disponible en el sistema.`
                }
            />
        </div>
    );
}
