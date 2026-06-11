import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../../shared/apis/authService";

function getRolBadge(rol) {
  return rol === "ADMIN" ? (
    <Badge variant="primary">Administrador</Badge>
  ) : (
    <Badge variant="info">Médico</Badge>
  );
}

function getStatusBadge(isActive) {
  return isActive ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Inactivo</Badge>
  );
}

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
        inputMode="numeric"
        maxLength={8}
        pattern="[0-9]{8}"
        title="El telefono debe tener exactamente 8 digitos"
      />

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

      {!isEdit && (
        <p className="text-xs text-gray-400 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
          Se enviará una contraseña temporal al correo institucional del
          usuario.
        </p>
      )}

      {isEdit && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Estado</label>
          <select
            name="isActive"
            value={form.isActive}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          >
            {/* OJO: Los select nativos devuelven strings, lo manejaremos en el onChange del padre */}
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
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
  const [users, setUsers] = useState([]); // Iniciamos con array vacío
  const [isLoading, setIsLoading] = useState(true);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(formInicial);

  // Cargar usuarios desde Fastify
  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const { data } = await getUsers();
      setUsers(data.users || data); // Ajusta según la estructura que responda tu Fastify
    } catch (error) {
      toast.error("Error al cargar los usuarios");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono" && !/^\d{0,8}$/.test(value)) return;
    // Parchear valores booleanos que vienen del select como string
    const val = value === "true" ? true : value === "false" ? false : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const validarFormulario = () => {
    if (form.telefono && !/^\d{8}$/.test(form.telefono)) {
      toast.error("El telefono debe tener exactamente 8 digitos");
      return false;
    }

    return true;
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

  // Petición POST al Backend
  const handleCrear = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    const toastId = toast.loading("Creando usuario...");
    try {
      await createUser(form);
      toast.success("Usuario creado exitosamente", { id: toastId });
      setModalCrear(false);
      setForm(formInicial);
      cargarUsuarios(); // Recargar datos frescos
    } catch (error) {
      const msg = error.response?.data?.message || "Error al crear usuario";
      toast.error(msg, { id: toastId });
    }
  };

  // Petición PUT/PATCH al Backend
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    const toastId = toast.loading("Guardando cambios...");
    try {
      await updateUser(selectedUser._id, form);
      toast.success("Usuario actualizado", { id: toastId });
      setModalEditar(false);
      cargarUsuarios(); // Recargar datos frescos
    } catch (error) {
      const msg =
        error.response?.data?.message || "Error al actualizar usuario";
      toast.error(msg, { id: toastId });
    }
  };

  // Petición DELETE al Backend
  const handleConfirmarEliminar = async () => {
    const toastId = toast.loading("Eliminando usuario...");
    try {
      await deleteUser(selectedUser._id);
      toast.success("Usuario eliminado", { id: toastId });
      setConfirmEliminar(false);
      cargarUsuarios(); // Recargar datos frescos
    } catch (error) {
      const msg = error.response?.data?.message || "Error al eliminar usuario";
      toast.error(msg, { id: toastId });
    }
  };

  const columnas = [
    {
      key: "nombre",
      label: "Usuario",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase">
            {row.nombre?.[0] || ""}
            {row.apellido?.[0] || ""}
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Cargando usuarios...</p>
          </div>
        ) : (
          <Table
            columns={columnas}
            data={users}
            emptyMessage="No hay usuarios registrados"
          />
        )}
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
