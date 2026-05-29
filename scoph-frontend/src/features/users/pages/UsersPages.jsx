import { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { mockUsers } from "../../../shared/utils/mockData";

// Badge según rol del usuario
function getRolBadge(rol) {
  return rol === "ADMIN" ? (
    <Badge variant="primary">Administrador</Badge>
  ) : (
    <Badge variant="info">Médico</Badge>
  );
}

// Badge según estado activo del usuario
function getStatusBadge(isActive) {
  return isActive ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Inactivo</Badge>
  );
}

// Formulario reutilizable para crear y editar usuario
function UserForm({ form, onChange, onSubmit, onClose, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={onChange}
          placeholder="Juan"
          required
        />
        <Input
          label="Apellido"
          name="apellido"
          value={form.apellido}
          onChange={onChange}
          placeholder="Pérez"
          required
        />
      </div>
      <Input
        label="Username"
        name="username"
        value={form.username}
        onChange={onChange}
        placeholder="jperez"
        required
      />
      <Input
        label="Correo electrónico"
        name="correo"
        type="email"
        value={form.correo}
        onChange={onChange}
        placeholder="juan@scoph.org"
        required
      />
      <Input
        label="Teléfono"
        name="telefono"
        value={form.telefono}
        onChange={onChange}
        placeholder="12345678"
      />

      {/* Selector de rol */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">Rol</label>
        <select
          name="rol"
          value={form.rol}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          required
        >
          <option value="MEDICO">Médico</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {/* Nota de contraseña temporal al crear */}
      {!isEdit && (
        <p className="text-xs text-gray-400 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
          Se enviará una contraseña temporal al correo institucional del
          usuario.
        </p>
      )}

      {/* Estado solo visible al editar */}
      {isEdit && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Estado</label>
          <select
            name="isActive"
            value={form.isActive}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          >
            <option value={true}>Activo</option>
            <option value={false}>Inactivo</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {isEdit ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}

const formInicial = {
  nombre: "",
  apellido: "",
  username: "",
  correo: "",
  telefono: "",
  rol: "MEDICO",
  isActive: true,
};

export default function UsuariosPage() {
  const [users, setUsers] = useState(mockUsers);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(formInicial);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditar = (user) => {
    setSelectedUser(user);
    setForm({ ...user });
    setModalEditar(true);
  };

  const handleEliminar = (user) => {
    setSelectedUser(user);
    setConfirmEliminar(true);
  };

  // Crea nuevo usuario - cuando se conecte el backend usar createUser() de authService
  const handleCrear = (e) => {
    e.preventDefault();
    const nuevo = {
      ...form,
      _id: `usr_${Date.now()}`,
      mustChangePassword: true,
      emailVerificado: false,
      ultimoAcceso: null,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, nuevo]);
    setForm(formInicial);
    setModalCrear(false);
  };

  // Actualiza usuario - cuando se conecte el backend usar updateUserStatus() de authService
  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => (u._id === selectedUser._id ? { ...u, ...form } : u)),
    );
    setModalEditar(false);
  };

  // Elimina usuario - cuando se conecte el backend usar deleteUser() de authService
  const handleConfirmarEliminar = () => {
    setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
    setConfirmEliminar(false);
  };

  const columnas = [
    {
      key: "nombre",
      label: "Usuario",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {row.nombre[0]}
            {row.apellido[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              {row.nombre} {row.apellido}
            </p>
            <p className="text-xs text-gray-400">{row.correo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      label: "Username",
      render: (row) => (
        <span className="text-xs text-gray-500">@{row.username}</span>
      ),
    },
    { key: "telefono", label: "Teléfono" },
    { key: "rol", label: "Rol", render: (row) => getRolBadge(row.rol) },
    {
      key: "isActive",
      label: "Estado",
      render: (row) => getStatusBadge(row.isActive),
    },
    {
      key: "mustChangePassword",
      label: "Contraseña",
      render: (row) =>
        row.mustChangePassword ? (
          <Badge variant="warning">Temporal</Badge>
        ) : (
          <Badge variant="success">Establecida</Badge>
        ),
    },
    {
      key: "ultimoAcceso",
      label: "Último Acceso",
      render: (row) =>
        row.ultimoAcceso ? (
          new Date(row.ultimoAcceso).toLocaleDateString("es-GT")
        ) : (
          <span className="text-xs text-gray-400">Sin acceso</span>
        ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditar(row)}>
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleEliminar(row)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administra los usuarios y roles del sistema"
        action={
          <Button
            variant="primary"
            onClick={() => {
              setForm(formInicial);
              setModalCrear(true);
            }}
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        }
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table
          columns={columnas}
          data={users}
          emptyMessage="No hay usuarios registrados"
        />
      </div>
      <Modal
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        title="Nuevo Usuario"
      >
        <UserForm
          form={form}
          onChange={handleChange}
          onSubmit={handleCrear}
          onClose={() => setModalCrear(false)}
          isEdit={false}
        />
      </Modal>
      <Modal
        isOpen={modalEditar}
        onClose={() => setModalEditar(false)}
        title="Editar Usuario"
      >
        <UserForm
          form={form}
          onChange={handleChange}
          onSubmit={handleGuardarEdicion}
          onClose={() => setModalEditar(false)}
          isEdit={true}
        />
      </Modal>
      <ConfirmDialog
        isOpen={confirmEliminar}
        onClose={() => setConfirmEliminar(false)}
        onConfirm={handleConfirmarEliminar}
        title="¿Eliminar usuario?"
        message={`¿Estás seguro que deseas eliminar a ${selectedUser?.nombre} ${selectedUser?.apellido}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
