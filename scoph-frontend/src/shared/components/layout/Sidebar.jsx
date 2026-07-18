import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../../assets/logo.png";
import { useAuthStore } from "../../../features/auth/store/authStore.js";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import {
  HomeIcon,
  UserGroupIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon, adminOnly: false },
  { to: "/usuarios", label: "Usuarios", icon: UserGroupIcon, adminOnly: true },
  {
    to: "/jornadas",
    label: "Jornadas",
    icon: CalendarDaysIcon,
    adminOnly: false,
  },
]; //

const inventarioItems = [
  {
    to: "/inventario/catalogo",
    label: "Catálogo",
    icon: ClipboardDocumentListIcon,
  },
  {
    to: "/inventario/central",
    label: "Inventario Central",
    icon: ArchiveBoxIcon,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    to: "/inventario/movimientos",
    label: "Movimientos",
    icon: ArrowsRightLeftIcon,
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [inventarioOpen, setInventarioOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Estado para el modal

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <aside className="h-screen w-64 bg-gray-900 flex flex-col fixed left-0 top-0 z-50">
        {/* Logo y nombre del sistema */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-700">
          <div className="bg-white rounded-full shadow overflow-hidden w-11 h-11 flex items-center justify-center">
            <img
              src={logo}
              alt="SCOPH URL"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">
              SCOPH - URL
            </h1>
            <p className="text-gray-400 text-xs">Jornadas Médicas</p>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {/* Mapeo con FILTRO DE ROLES: Oculta "Usuarios" si no es ADMIN o SUPER_ADMIN */}
          {navItems
            .filter((item) => !item.adminOnly || user?.rol === "ADMIN" || user?.rol === "SUPER_ADMIN")
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}

          {/* Módulo de Inventario con submenú desplegable */}
          <div>
            <button
              onClick={() => setInventarioOpen(!inventarioOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <BeakerIcon className="w-5 h-5 flex-shrink-0" />
                Inventario
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${inventarioOpen ? "rotate-180" : ""}`}
              />
            </button>

            {inventarioOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                {inventarioItems
                  .filter((item) => !item.allowedRoles || item.allowedRoles.includes(user?.rol))
                  .map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Reportes */}
          {(user?.rol === "ADMIN" || user?.rol === "SUPER_ADMIN") && (
            <NavLink
              to="/reportes"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <ClipboardDocumentListIcon className="w-5 h-5 flex-shrink-0" />
              Reportes
            </NavLink>
          )}
        </nav>

        {/* Zona inferior del usuario - Clickeable para abrir el Perfil */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl hover:bg-gray-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold uppercase flex-shrink-0">
              {user?.nombre?.[0] || ""}
              {user?.apellido?.[0] || ""}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium capitalize truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-gray-400 text-xs truncate">{user?.correo}</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Modal del Perfil del Usuario */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Mi Perfil"
      >
        <div className="space-y-5 py-2">
          {/* Avatar grande centrado */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg border-4 border-orange-100">
              {user?.nombre?.[0] || ""}
              {user?.apellido?.[0] || ""}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={user?.nombre || ""} disabled />
            <Input label="Apellido" value={user?.apellido || ""} disabled />
          </div>

          <Input label="Username" value={`@${user?.username || ""}`} disabled />
          <Input
            label="Correo electrónico"
            value={user?.correo || ""}
            disabled
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              value={user?.telefono || "No registrado"}
              disabled
            />
            <Input label="Rol en el Sistema" value={user?.rol || ""} disabled />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <Button variant="primary" onClick={() => setIsProfileOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
