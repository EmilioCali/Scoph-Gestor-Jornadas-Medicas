import { useState, useMemo } from "react";
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
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
import { mockCentralInventory, mockMedicines, medicineCategories } from "../../../shared/utils/mockData";

// Badge según nivel de stock
function getStockBadge(totalStock, minimumStock) {
  if (totalStock <= 0) return <Badge variant="danger">Agotado</Badge>;
  if (totalStock <= minimumStock * 0.5) return <Badge variant="danger">Crítico</Badge>;
  if (totalStock <= minimumStock) return <Badge variant="warning">Bajo</Badge>;
  return <Badge variant="success">Normal</Badge>;
}

// Badge según días restantes para vencimiento del lote más próximo
function getExpirationBadge(lots) {
  if (!lots || lots.length === 0) return <Badge variant="gray">Sin lotes</Badge>;
  const hoy = new Date();
  const minDays = Math.min(...lots.map((l) =>
    Math.ceil((new Date(l.expirationDate) - hoy) / (1000 * 60 * 60 * 24))
  ));
  if (minDays <= 0) return <Badge variant="danger">Vencido</Badge>;
  if (minDays <= 15) return <Badge variant="danger">Vence en {minDays}d</Badge>;
  if (minDays <= 30) return <Badge variant="warning">Vence en {minDays}d</Badge>;
  if (minDays <= 60) return <Badge variant="info">Vence en {minDays}d</Badge>;
  return <Badge variant="success">{new Date(lots[0].expirationDate).toLocaleDateString("es-GT")}</Badge>;
}

// Formulario para registrar entrada (COMPRA / DONACION)
// Body alineado con backend: tipoEntrada, destination, detalle[{medicineId, batch, quantity, expirationDate}]
function EntradaForm({ form, onChange, onSubmit, onClose, item }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        <p className="text-xs text-gray-400">Medicamento</p>
        <p className="text-sm font-semibold text-gray-700">{item?.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Stock actual: <span className="font-semibold text-gray-600">{item?.totalStock} {item?.unitOfMeasure}</span></p>
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
      <Input label="Observación" name="observacion" value={form.observacion} onChange={onChange} placeholder="Ej: Donación Cruz Roja" />
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit">Registrar entrada</Button>
      </div>
    </form>
  );
}

// Formulario para registrar salida (RECETA)
// Body alineado con backend: productoId, cantidad
function SalidaForm({ form, onChange, onSubmit, onClose, item }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        <p className="text-xs text-gray-400">Medicamento</p>
        <p className="text-sm font-semibold text-gray-700">{item?.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Stock actual: <span className="font-semibold text-gray-600">{item?.totalStock} {item?.unitOfMeasure}</span></p>
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
      <Input label="Cantidad a retirar" name="quantity" type="number" min="1" max={item?.totalStock} value={form.quantity} onChange={onChange} placeholder="0" required />
      <Input label="Observación" name="observacion" value={form.observacion} onChange={onChange} placeholder="Ej: Receta paciente" />
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" type="submit">Registrar salida</Button>
      </div>
    </form>
  );
}

// Formulario para agregar medicamento del catálogo al inventario central
function AgregarForm({ form, onChange, onSubmit, onClose, availableMedicines }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="Lote inicial" name="batch" value={form.batch} onChange={onChange} placeholder="LOTE-001" required />
        <Input label="Fecha de vencimiento" name="expirationDate" type="date" value={form.expirationDate} onChange={onChange} required />
      </div>
      <Input label="Stock inicial" name="initialStock" type="number" min="0" value={form.initialStock} onChange={onChange} placeholder="0" required />
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" type="submit">Agregar al inventario</Button>
      </div>
    </form>
  );
}

const entradaInicial = { tipoEntrada: "DONACION", batch: "", expirationDate: "", quantity: "", observacion: "" };
const salidaInicial = { batch: "", quantity: "", observacion: "" };
const agregarInicial = { medicineId: "", minimumStock: "", batch: "", expirationDate: "", initialStock: "" };

export default function InventarioCentralPage() {
  const [inventory, setInventory] = useState(mockCentralInventory);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStock, setFiltroStock] = useState("");
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEntrada, setModalEntrada] = useState(false);
  const [modalSalida, setModalSalida] = useState(false);
  const [modalLotes, setModalLotes] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formEntrada, setFormEntrada] = useState(entradaInicial);
  const [formSalida, setFormSalida] = useState(salidaInicial);
  const [formAgregar, setFormAgregar] = useState(agregarInicial);

  // Medicamentos del catálogo que aún no están en el inventario
  const availableMedicines = useMemo(() => {
    const idsInInventory = inventory.map((i) => i.medicineId);
    return mockMedicines.filter((m) => !idsInInventory.includes(m._id) && m.status === "ACTIVO");
  }, [inventory]);

  // Filtra inventario según búsqueda, categoría y estado de stock
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(busqueda.toLowerCase()) ||
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
    });
  }, [inventory, busqueda, filtroCategoria, filtroStock]);

  const handleChangeEntrada = (e) => { const { name, value } = e.target; setFormEntrada((prev) => ({ ...prev, [name]: value })); };
  const handleChangeSalida = (e) => { const { name, value } = e.target; setFormSalida((prev) => ({ ...prev, [name]: value })); };
  const handleChangeAgregar = (e) => { const { name, value } = e.target; setFormAgregar((prev) => ({ ...prev, [name]: value })); };

  const handleAbrirEntrada = (item) => { setSelectedItem(item); setFormEntrada(entradaInicial); setModalEntrada(true); };
  const handleAbrirSalida = (item) => { setSelectedItem(item); setFormSalida(salidaInicial); setModalSalida(true); };
  const handleVerLotes = (item) => { setSelectedItem(item); setModalLotes(true); };
  const handleEliminar = (item) => { setSelectedItem(item); setConfirmEliminar(true); };

  // Agrega medicamento del catálogo al inventario
  // Cuando se conecte el backend usar registerEntry() de coreService con tipoEntrada
  const handleAgregarAlInventario = (e) => {
    e.preventDefault();
    const medicine = mockMedicines.find((m) => m._id === formAgregar.medicineId);
    if (!medicine) return;
    const initialStock = Number(formAgregar.initialStock);
    const nuevo = {
      _id: `inv_central_${Date.now()}`, medicineId: medicine._id,
      name: medicine.name, compound: medicine.compound,
      category: medicine.category, unitOfMeasure: medicine.unitOfMeasure,
      lots: [{ batch: formAgregar.batch, expirationDate: formAgregar.expirationDate, stock: initialStock }],
      totalStock: initialStock, minimumStock: Number(formAgregar.minimumStock),
      updatedAt: new Date().toISOString(),
    };
    setInventory((prev) => [...prev, nuevo]);
    setFormAgregar(agregarInicial);
    setModalAgregar(false);
  };

  // Registra entrada - cuando se conecte el backend usar registerEntry() de coreService
  const handleRegistrarEntrada = (e) => {
    e.preventDefault();
    const quantity = Number(formEntrada.quantity);
    setInventory((prev) => prev.map((item) => {
      if (item._id !== selectedItem._id) return item;
      const lotExists = item.lots.find((l) => l.batch === formEntrada.batch);
      const updatedLots = lotExists
        ? item.lots.map((l) => l.batch === formEntrada.batch ? { ...l, stock: l.stock + quantity } : l)
        : [...item.lots, { batch: formEntrada.batch, expirationDate: formEntrada.expirationDate, stock: quantity }];
      return { ...item, lots: updatedLots, totalStock: item.totalStock + quantity };
    }));
    setModalEntrada(false);
  };

  // Registra salida - cuando se conecte el backend usar registerEntry() de coreService con RECETA
  const handleRegistrarSalida = (e) => {
    e.preventDefault();
    const quantity = Number(formSalida.quantity);
    setInventory((prev) => prev.map((item) => {
      if (item._id !== selectedItem._id) return item;
      const updatedLots = item.lots.map((l) => l.batch === formSalida.batch ? { ...l, stock: Math.max(0, l.stock - quantity) } : l);
      return { ...item, lots: updatedLots, totalStock: Math.max(0, item.totalStock - quantity) };
    }));
    setModalSalida(false);
  };

  // Elimina del inventario - cuando se conecte el backend usar deleteFromInventory() de coreService
  const handleConfirmarEliminar = () => {
    setInventory((prev) => prev.filter((item) => item._id !== selectedItem._id));
    setConfirmEliminar(false);
  };

  // Exporta inventario a PDF - cuando se conecte el backend reemplazar con exportStockPDF() de reportesService
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
        item.name, item.category, `${item.totalStock} ${item.unitOfMeasure}`, item.minimumStock,
        item.totalStock <= 0 ? "Agotado" : item.totalStock <= item.minimumStock ? "Bajo" : "Normal",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [242, 116, 5] },
    });
    doc.save("inventario-central.pdf");
  };

  // Exporta inventario a Excel - cuando se conecte el backend reemplazar con exportStockExcel() de reportesService
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
        <button onClick={() => handleVerLotes(row)} className="text-xs text-primary hover:text-primary-dark font-semibold underline transition">
          Ver {row.lots.length} lote(s)
        </button>
      ),
    },
    {
      key: "acciones", label: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleAbrirEntrada(row)}><ArrowUpIcon className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleAbrirSalida(row)}><ArrowDownIcon className="w-4 h-4" /></Button>
          <Button variant="danger" size="sm" onClick={() => handleEliminar(row)}>✕</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario Central"
        subtitle="Control de stock, lotes y movimientos de medicamentos"
        action={
          <Button variant="primary" onClick={() => { setFormAgregar(agregarInicial); setModalAgregar(true); }}>
            <PlusIcon className="w-4 h-4" />Agregar al Inventario
          </Button>
        }
      />

      {/* Resumen de stock */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Total Registros</p>
          <p className="text-2xl font-extrabold text-gray-800">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Agotados</p>
          <p className="text-2xl font-extrabold text-red-500">{inventory.filter((i) => i.totalStock <= 0).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Stock Bajo</p>
          <p className="text-2xl font-extrabold text-yellow-500">{inventory.filter((i) => i.totalStock > 0 && i.totalStock <= i.minimumStock).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Stock Normal</p>
          <p className="text-2xl font-extrabold text-green-500">{inventory.filter((i) => i.totalStock > i.minimumStock).length}</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
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
          <Button variant="outline" size="md" onClick={handleExportPDF}>PDF</Button>
          <Button variant="outline" size="md" onClick={handleExportExcel}>Excel</Button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Mostrando <span className="font-semibold text-gray-600">{filteredInventory.length}</span> de <span className="font-semibold text-gray-600">{inventory.length}</span> registros
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table columns={columnas} data={filteredInventory} emptyMessage="No se encontraron medicamentos en el inventario" />
      </div>

      <Modal isOpen={modalAgregar} onClose={() => setModalAgregar(false)} title="Agregar al Inventario Central" size="md">
        <AgregarForm form={formAgregar} onChange={handleChangeAgregar} onSubmit={handleAgregarAlInventario} onClose={() => setModalAgregar(false)} availableMedicines={availableMedicines} />
      </Modal>
      <Modal isOpen={modalEntrada} onClose={() => setModalEntrada(false)} title="Registrar Entrada" size="sm">
        <EntradaForm form={formEntrada} onChange={handleChangeEntrada} onSubmit={handleRegistrarEntrada} onClose={() => setModalEntrada(false)} item={selectedItem} />
      </Modal>
      <Modal isOpen={modalSalida} onClose={() => setModalSalida(false)} title="Registrar Salida (Receta)" size="sm">
        <SalidaForm form={formSalida} onChange={handleChangeSalida} onSubmit={handleRegistrarSalida} onClose={() => setModalSalida(false)} item={selectedItem} />
      </Modal>
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
                  {days <= 30 ? <Badge variant="danger">Vence en {days}d</Badge>
                    : days <= 60 ? <Badge variant="warning">Vence en {days}d</Badge>
                    : <Badge variant="success">Vigente</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={confirmEliminar} onClose={() => setConfirmEliminar(false)} onConfirm={handleConfirmarEliminar}
        title="¿Eliminar del inventario?"
        message={`¿Estás seguro que deseas eliminar "${selectedItem?.name}" del inventario central? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}