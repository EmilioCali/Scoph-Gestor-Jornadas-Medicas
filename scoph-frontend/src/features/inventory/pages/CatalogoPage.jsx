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
import { useCategories } from "../hooks/useCategories";
import { useMedicines } from "../hooks/useMedicines";
import { useMeasureUnits } from "../hooks/useMeasureUnits";
import { usePackagingUnits } from "../hooks/usePackagingUnits";
import { useAuthStore } from "../../auth/store/authStore.js";

const FORM_INICIAL = {
  name: "",
  compound: "",
  concentration: "",
  barcode: "",
  minimumUnit: "",
  intermediateUnit: "",
  packageUnit: "",
  unitsPerPackage: "",
  unitsPerMinimumUnit: "",
  minimumStock: "",
  category: "",
  status: "ACTIVO",
};

function MedicineForm({
  form,
  onChange,
  onSubmit,
  onClose,
  isEdit,
  submitting,
  categoryOptions,
  measureUnitOptions,
  packagingUnitOptions,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre comercial"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Zibac"
          required
        />
        <Input
          label="Compuesto activo"
          name="compound"
          value={form.compound}
          onChange={onChange}
          placeholder="Azitromicina"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Concentración"
          name="concentration"
          value={form.concentration}
          onChange={onChange}
          placeholder="200mg/5ml"
          required
        />
        <Input
          label="Código de barras"
          name="barcode"
          value={form.barcode}
          onChange={onChange}
          placeholder="7501234567890"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Unidad mínima
          </label>
          <select
            name="minimumUnit"
            value={form.minimumUnit}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
          >
            <option value="">Seleccionar</option>
            {measureUnitOptions
              .filter((unit) => unit.activo !== false)
              .map((unit) => (
                <option key={unit._id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Unidad intermedia
          </label>
          <select
            name="intermediateUnit"
            value={form.intermediateUnit || ""}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          >
            <option value="">Sin unidad intermedia</option>
            {measureUnitOptions
              .filter(
                (unit) =>
                  unit.activo !== false && unit.name !== form.minimumUnit,
              )
              .map((unit) => (
                <option key={unit._id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Unidad de empaque
          </label>
          <select
            name="packageUnit"
            value={form.packageUnit}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
          >
            <option value="">Seleccionar</option>
            {packagingUnitOptions
              .filter((unit) => unit.activo !== false)
              .map((unit) => (
                <option key={unit._id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
          </select>
        </div>

        <Input
          label={
            form.intermediateUnit
              ? `${form.intermediateUnit} por ${form.packageUnit || "empaque"}`
              : `${form.minimumUnit || "Unidad mínima"} por ${form.packageUnit || "empaque"}`
          }
          name="unitsPerPackage"
          type="number"
          min="1"
          value={form.unitsPerPackage}
          onChange={onChange}
          placeholder="100"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`${form.minimumUnit || "Unidad mínima"} por ${form.intermediateUnit || "unidad intermedia"}`}
          name="unitsPerMinimumUnit"
          type="number"
          min="1"
          value={form.intermediateUnit ? form.unitsPerMinimumUnit : ""}
          onChange={onChange}
          placeholder="10"
          disabled={!form.intermediateUnit}
        />
        <Input
          label="Stock mínimo"
          name="minimumStock"
          type="number"
          min="0"
          value={form.minimumStock}
          onChange={onChange}
          placeholder="10"
        />
      </div>
      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        {form.intermediateUnit
          ? `Conversión: 1 ${form.packageUnit || "empaque"} = ${form.unitsPerPackage || "…"} ${form.intermediateUnit}; 1 ${form.intermediateUnit} = ${form.unitsPerMinimumUnit || "…"} ${form.minimumUnit || "unidades mínimas"}.`
          : `Conversión: 1 ${form.packageUnit || "empaque"} = ${form.unitsPerPackage || "…"} ${form.minimumUnit || "unidades mínimas"}.`}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Categoría
          </label>
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
          >
            <option value="">Seleccionar</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isEdit && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Estado</label>
          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Registrar medicamento"}
        </Button>
      </div>
    </form>
  );
}

export default function CatalogoPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canManageCatalog = currentUser?.rol === "SUPER_ADMIN";
  const { medicines, loading, error, refetch, create, update, toggleStatus } =
    useMedicines();
  const { categories } = useCategories(canManageCatalog);
  const {
    measureUnits,
    loading: measureUnitsLoading,
    error: measureUnitsError,
    refetch: refetchMeasureUnits,
    create: createMeasureUnitRecord,
    update: updateMeasureUnitRecord,
    remove: removeMeasureUnitRecord,
  } = useMeasureUnits(canManageCatalog);
  const {
    packagingUnits,
    loading: packagingUnitsLoading,
    error: packagingUnitsError,
    refetch: refetchPackagingUnits,
    create: createPackagingUnitRecord,
    update: updatePackagingUnitRecord,
    remove: removePackagingUnitRecord,
  } = usePackagingUnits(canManageCatalog);
  const categoryOptions = categories
    .filter((category) => category.status === "ACTIVO")
    .map((category) => category.name);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalUnidades, setModalUnidades] = useState(false);
  const [modalPackaging, setModalPackaging] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [measureUnitForm, setMeasureUnitForm] = useState({ name: "", description: "", activo: true });
  const [measureUnitEditingId, setMeasureUnitEditingId] = useState(null);
  const [measureUnitSubmitting, setMeasureUnitSubmitting] = useState(false);
  const [measureUnitFormError, setMeasureUnitFormError] = useState(null);
  const [packagingUnitForm, setPackagingUnitForm] = useState({ name: "", description: "", activo: true });
  const [packagingUnitEditingId, setPackagingUnitEditingId] = useState(null);
  const [packagingUnitSubmitting, setPackagingUnitSubmitting] = useState(false);
  const [packagingUnitFormError, setPackagingUnitFormError] = useState(null);

  const filteredMedicines = useMemo(
    () =>
      medicines.filter((m) => {
        const matchSearch =
          m.name.toLowerCase().includes(busqueda.toLowerCase()) ||
          m.compound.toLowerCase().includes(busqueda.toLowerCase()) ||
          m.barcode?.includes(busqueda);
        const matchCategory = filtroCategoria
          ? m.category === filtroCategoria
          : true;
        const matchStatus = filtroEstado ? m.status === filtroEstado : true;
        return matchSearch && matchCategory && matchStatus;
      }),
    [medicines, busqueda, filtroCategoria, filtroEstado],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "intermediateUnit") {
        next.unitsPerMinimumUnit = value ? prev.unitsPerMinimumUnit || "1" : "1";
      }
      if (name === "minimumUnit" && value === prev.intermediateUnit) {
        next.intermediateUnit = "";
        next.unitsPerMinimumUnit = "1";
      }
      return next;
    });
  };

  const handleMeasureUnitChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeasureUnitForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePackagingUnitChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPackagingUnitForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMeasureUnitSubmit = async (e) => {
    e.preventDefault();
    setMeasureUnitSubmitting(true);
    setMeasureUnitFormError(null);
    try {
      if (measureUnitEditingId) {
        await updateMeasureUnitRecord(measureUnitEditingId, measureUnitForm);
      } else {
        await createMeasureUnitRecord(measureUnitForm);
      }
      setMeasureUnitForm({ name: "", description: "", activo: true });
      setMeasureUnitEditingId(null);
      setModalUnidades(false);
    } catch (err) {
      setMeasureUnitFormError(err.response?.data?.message ?? err.message ?? "No se pudo guardar la unidad");
    } finally {
      setMeasureUnitSubmitting(false);
    }
  };

  const handleMeasureUnitDelete = async (id) => {
    try {
      await removeMeasureUnitRecord(id);
    } catch (err) {
      setMeasureUnitFormError(err.response?.data?.message ?? err.message ?? "No se pudo eliminar la unidad");
    }
  };

  const handlePackagingUnitSubmit = async (e) => {
    e.preventDefault();
    setPackagingUnitSubmitting(true);
    setPackagingUnitFormError(null);
    try {
      if (packagingUnitEditingId) {
        await updatePackagingUnitRecord(packagingUnitEditingId, packagingUnitForm);
      } else {
        await createPackagingUnitRecord(packagingUnitForm);
      }
      setPackagingUnitForm({ name: "", description: "", activo: true });
      setPackagingUnitEditingId(null);
      setModalPackaging(false);
    } catch (err) {
      setPackagingUnitFormError(err.response?.data?.message ?? err.message ?? "No se pudo guardar la unidad de empaquetado");
    } finally {
      setPackagingUnitSubmitting(false);
    }
  };

  const handlePackagingUnitDelete = async (id) => {
    try {
      await removePackagingUnitRecord(id);
    } catch (err) {
      setPackagingUnitFormError(err.response?.data?.message ?? err.message ?? "No se pudo eliminar la unidad de empaquetado");
    }
  };

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
        : "Ya existe un medicamento con ese codigo de barras",
    );
    return false;
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!validarDuplicado()) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        intermediateUnit: form.intermediateUnit || null,
        unitsPerPackage: Number(form.unitsPerPackage || 1),
        unitsPerMinimumUnit: Number(form.intermediateUnit ? (form.unitsPerMinimumUnit || 1) : 1),
        minimumStock: Number(form.minimumStock || 0),
      };
      await create(payload);
      setForm(FORM_INICIAL);
      setModalCrear(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ??
          err.message ??
          "No se pudo crear el medicamento",
      );
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
        minimumUnit: form.minimumUnit,
        intermediateUnit: form.intermediateUnit || null,
        packageUnit: form.packageUnit,
        unitsPerPackage: Number(form.unitsPerPackage || 1),
        unitsPerMinimumUnit: Number(form.intermediateUnit ? (form.unitsPerMinimumUnit || 1) : 1),
        minimumStock: Number(form.minimumStock || 0),
        category: form.category,
      };

      // Solo llamar PATCH /status si realmente cambió
      if (status !== selectedItem.status) {
        await toggleStatus(selectedItem._id, status);
      }

      // Solo llamar PUT si cambió algún campo editable
      const camposCambiaron = Object.keys(campos).some(
        (k) => campos[k] !== selectedItem[k],
      );
      if (camposCambiaron) {
        await update(selectedItem._id, campos);
      }

      setModalEditar(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ??
          err.message ??
          "No se pudo actualizar el medicamento",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmarToggle = async () => {
    const nuevoEstado =
      selectedItem.status === "ACTIVO" ? "INACTIVO" : "ACTIVO";
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
      head: [
        [
          "Nombre",
          "Compuesto",
          "Concentración",
          "Unidad mínima",
          "Unidad de empaque",
          "Categoría",
          "Estado",
        ],
      ],
      body: filteredMedicines.map((m) => [
        m.name,
        m.compound,
        m.concentration,
        m.minimumUnit ?? m.presentation,
        m.packageUnit ?? m.unitOfMeasure,
        m.category,
        m.status,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [242, 116, 5] },
    });
    doc.save("catalogo-medicamentos.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredMedicines.map((m) => ({
        Nombre: m.name,
        Compuesto: m.compound,
        Concentración: m.concentration,
        "Unidad mínima": m.minimumUnit ?? m.presentation,
        "Unidad de empaque": m.packageUnit ?? m.unitOfMeasure,
        Categoría: m.category,
        "Código Barras": m.barcode || "",
        Estado: m.status,
        "Fecha Registro": new Date(m.createdAt).toLocaleDateString("es-GT"),
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catálogo");
    XLSX.writeFile(wb, "catalogo-medicamentos.xlsx");
  };

  const columnas = [
    {
      key: "name",
      label: "Medicamento",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-700">{row.name}</p>
          <p className="text-xs text-gray-400">
            {row.compound} · {row.concentration}
          </p>
        </div>
      ),
    },
    { key: "minimumUnit", label: "Unidad mínima" },
    { key: "packageUnit", label: "Unidad empaque" },
    {
      key: "category",
      label: "Categoría",
      render: (row) => <Badge variant="primary">{row.category}</Badge>,
    },
    {
      key: "barcode",
      label: "Cód. Barras",
      render: (row) => (
        <span className="text-xs text-gray-500">{row.barcode || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (row) =>
        row.status === "ACTIVO" ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="danger">Inactivo</Badge>
        ),
    },
    canManageCatalog && {
      key: "acciones",
      label: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(row);
              setForm({
                ...row,
                minimumUnit: row.minimumUnit ?? row.presentation ?? "",
                intermediateUnit: row.intermediateUnit ?? "",
                packageUnit: row.packageUnit ?? row.unitOfMeasure ?? "",
                unitsPerPackage: row.unitsPerPackage ?? "",
                unitsPerMinimumUnit: row.intermediateUnit ? (row.unitsPerMinimumUnit ?? "1") : "1",
              });
              setFormError(null);
              setModalEditar(true);
            }}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={row.status === "ACTIVO" ? "danger" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedItem(row);
              setConfirmToggle(true);
            }}
            title={row.status === "ACTIVO" ? "Desactivar" : "Activar"}
          >
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
            <Button
              variant="outline"
              size="md"
              onClick={refetch}
              disabled={loading}
              title="Recargar"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {canManageCatalog && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMeasureUnitForm({ name: "", description: "", activo: true });
                    setMeasureUnitEditingId(null);
                    setMeasureUnitFormError(null);
                    setModalUnidades(true);
                  }}
                >
                  Unidades de medida
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPackagingUnitForm({ name: "", description: "", activo: true });
                    setPackagingUnitEditingId(null);
                    setPackagingUnitFormError(null);
                    setModalPackaging(true);
                  }}
                >
                  Unidades de empaquetado
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setForm(FORM_INICIAL);
                    setFormError(null);
                    setModalCrear(true);
                  }}
                >
                  <PlusIcon className="w-4 h-4" /> Nuevo Medicamento
                </Button>
              </>
            )}
          </div>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, compuesto o código de barras..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 placeholder-gray-300 transition"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition appearance-none"
            >
              <option value="">Todas las categorías</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
          <Button
            variant="outline"
            size="md"
            onClick={handleExportPDF}
            disabled={loading}
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleExportExcel}
            disabled={loading}
          >
            Excel
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Mostrando{" "}
          <span className="font-semibold text-gray-600">
            {filteredMedicines.length}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-gray-600">
            {medicines.length}
          </span>{" "}
          medicamentos
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table
          columns={columnas}
          data={filteredMedicines}
          loading={loading}
          emptyMessage="No se encontraron medicamentos"
        />
      </div>

      <Modal
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        title="Nuevo Medicamento"
        size="md"
      >
        {formError && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}
        <MedicineForm
          form={form}
          onChange={handleChange}
          onSubmit={handleCrear}
          onClose={() => setModalCrear(false)}
          isEdit={false}
          submitting={submitting}
          categoryOptions={categoryOptions}
          measureUnitOptions={measureUnits}
          packagingUnitOptions={packagingUnits}
        />
      </Modal>

      <Modal
        isOpen={modalUnidades}
        onClose={() => setModalUnidades(false)}
        title="Unidades de medida"
        size="lg"
      >
        {measureUnitFormError && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {measureUnitFormError}
          </p>
        )}
        <form onSubmit={handleMeasureUnitSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Nombre</label>
              <input
                name="name"
                value={measureUnitForm.name}
                onChange={handleMeasureUnitChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Descripción</label>
              <input
                name="description"
                value={measureUnitForm.description}
                onChange={handleMeasureUnitChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="activo" checked={measureUnitForm.activo} onChange={handleMeasureUnitChange} />
            Activo
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setModalUnidades(false)} disabled={measureUnitSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={measureUnitSubmitting}>{measureUnitSubmitting ? "Guardando..." : measureUnitEditingId ? "Guardar" : "Crear"}</Button>
          </div>
        </form>

        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Opciones registradas</p>
            <Button variant="outline" size="sm" onClick={refetchMeasureUnits} disabled={measureUnitsLoading}>Recargar</Button>
          </div>
          {measureUnitsLoading ? <p className="text-sm text-gray-500">Cargando...</p> : measureUnitsError ? <p className="text-sm text-red-600">{measureUnitsError}</p> : (
            <div className="space-y-2">
                {measureUnits.map((unit) => (
                <div key={unit._id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div>
                    <p className="font-semibold text-gray-700">{unit.name}</p>
                    <p className="text-xs text-gray-500">{unit.description || "Sin descripción"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={unit.activo === false ? "danger" : "success"}>{unit.activo === false ? "Inactivo" : "Activo"}</Badge>
                    <Button variant="outline" size="sm" onClick={() => { setMeasureUnitForm({ name: unit.name, description: unit.description || "", activo: unit.activo !== false }); setMeasureUnitEditingId(unit._id); setMeasureUnitFormError(null); }}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => handleMeasureUnitDelete(unit._id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modalPackaging}
        onClose={() => setModalPackaging(false)}
        title="Unidades de empaquetado"
        size="lg"
      >
        {packagingUnitFormError && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {packagingUnitFormError}
          </p>
        )}
        <form onSubmit={handlePackagingUnitSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Nombre</label>
              <input
                name="name"
                value={packagingUnitForm.name}
                onChange={handlePackagingUnitChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Descripción</label>
              <input
                name="description"
                value={packagingUnitForm.description}
                onChange={handlePackagingUnitChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="activo" checked={packagingUnitForm.activo} onChange={handlePackagingUnitChange} />
            Activo
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setModalPackaging(false)} disabled={packagingUnitSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={packagingUnitSubmitting}>{packagingUnitSubmitting ? "Guardando..." : packagingUnitEditingId ? "Guardar" : "Crear"}</Button>
          </div>
        </form>

        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Opciones registradas</p>
            <Button variant="outline" size="sm" onClick={refetchPackagingUnits} disabled={packagingUnitsLoading}>Recargar</Button>
          </div>
          {packagingUnitsLoading ? <p className="text-sm text-gray-500">Cargando...</p> : packagingUnitsError ? <p className="text-sm text-red-600">{packagingUnitsError}</p> : (
            <div className="space-y-2">
              {packagingUnits.map((unit) => (
                <div key={unit._id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div>
                    <p className="font-semibold text-gray-700">{unit.name}</p>
                    <p className="text-xs text-gray-500">{unit.description || "Sin descripción"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={unit.activo === false ? "danger" : "success"}>{unit.activo === false ? "Inactivo" : "Activo"}</Badge>
                    <Button variant="outline" size="sm" onClick={() => { setPackagingUnitForm({ name: unit.name, description: unit.description || "", activo: unit.activo !== false }); setPackagingUnitEditingId(unit._id); setPackagingUnitFormError(null); }}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => handlePackagingUnitDelete(unit._id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modalEditar}
        onClose={() => setModalEditar(false)}
        title="Editar Medicamento"
        size="md"
      >
        {formError && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}
        <MedicineForm
          form={form}
          onChange={handleChange}
          onSubmit={handleGuardarEdicion}
          onClose={() => setModalEditar(false)}
          isEdit={true}
          submitting={submitting}
          categoryOptions={categoryOptions}
          measureUnitOptions={measureUnits}
          packagingUnitOptions={packagingUnits}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmToggle}
        onClose={() => setConfirmToggle(false)}
        onConfirm={handleConfirmarToggle}
        title={
          selectedItem?.status === "ACTIVO"
            ? "¿Desactivar medicamento?"
            : "¿Activar medicamento?"
        }
        message={
          selectedItem?.status === "ACTIVO"
            ? `"${selectedItem?.name}" quedará inactivo y no aparecerá en nuevos movimientos.`
            : `"${selectedItem?.name}" volverá a estar disponible en el sistema.`
        }
      />
    </div>
  );
}
