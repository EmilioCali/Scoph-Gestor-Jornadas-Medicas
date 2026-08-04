import { useState, useMemo } from "react";
import {
  PlusIcon,
  PencilIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { useCategories } from "../hooks/useCategories";
import { useAuthStore } from "../../auth/store/authStore.js";

const FORM_INICIAL = { name: "", description: "", status: "ACTIVO" };

function CategoryForm({
  form,
  onChange,
  onSubmit,
  onClose,
  isEdit,
  submitting,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre de la categoría"
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="Analgesicos"
        required
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">
          Descripción
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          placeholder="Descripción breve de la categoría"
        />
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
              : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const { categories, loading, error, refetch, create, update, remove } =
    useCategories();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = currentUser?.rol === "SUPER_ADMIN";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchSearch = category.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchStatus = filterStatus
          ? category.status === filterStatus
          : true;
        return matchSearch && matchStatus;
      }),
    [categories, search, filterStatus],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await create(form);
      setForm(FORM_INICIAL);
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ??
          err.message ??
          "No se pudo crear la categoría",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await update(selectedCategory._id, form);
      setEditModalOpen(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ??
          err.message ??
          "No se pudo actualizar la categoría",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await remove(selectedCategory._id);
    } catch {
      // El error global se muestra en la UI store
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const columns = [
    { key: "name", label: "Categoría" },
    { key: "description", label: "Descripción" },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.status === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
        >
          {row.status === "ACTIVO" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    canManage && {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory(row);
              setForm({
                name: row.name,
                description: row.description,
                status: row.status,
              });
              setFormError(null);
              setEditModalOpen(true);
            }}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setSelectedCategory(row);
              setDeleteDialogOpen(true);
            }}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías de Medicamentos"
        subtitle="Administra las categorías que usará el catálogo de medicamentos"
        action={
          canManage && (
            <Button
              variant="primary"
              onClick={() => {
                setForm(FORM_INICIAL);
                setFormError(null);
                setModalOpen(true);
              }}
            >
              <PlusIcon className="w-4 h-4" /> Crear categoría
            </Button>
          )
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 placeholder-gray-300 transition"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-gray-700 transition appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <Button variant="outline" size="md" onClick={refetch}>
            <ArrowPathIcon className="w-4 h-4" /> Recargar
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Mostrando{" "}
          <span className="font-semibold text-gray-600">
            {filteredCategories.length}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-gray-600">
            {categories.length}
          </span>{" "}
          categorías
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table
          columns={columns}
          data={filteredCategories}
          loading={loading}
          emptyMessage="No hay categorías registradas"
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Crear categoría"
        size="md"
      >
        {formError && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {formError}
          </p>
        )}
        <CategoryForm
          form={form}
          onChange={handleChange}
          onSubmit={handleCreate}
          onClose={() => setModalOpen(false)}
          isEdit={false}
          submitting={submitting}
        />
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar categoría"
        size="md"
      >
        {formError && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {formError}
          </p>
        )}
        <CategoryForm
          form={form}
          onChange={handleChange}
          onSubmit={handleUpdate}
          onClose={() => setEditModalOpen(false)}
          isEdit
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        message={
          selectedCategory
            ? `La categoría "${selectedCategory.name}" se eliminará definitivamente.`
            : "¿Deseas eliminar esta categoría?"
        }
      />
    </div>
  );
}
