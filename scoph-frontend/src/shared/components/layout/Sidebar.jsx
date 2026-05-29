import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../../assets/logo.png";
import { useAuth } from "../../../features/auth/store/AuthContext";
import {
  HomeIcon,
  UserGroupIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

// Items del menú principal
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { to: "/usuarios", label: "Usuarios", icon: UserGroupIcon },
  { to: "/jornadas", label: "Jornadas", icon: CalendarDaysIcon },
];

// Sub items del módulo de inventario
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
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();
  const [inventarioOpen, setInventarioOpen] = useState(true);

  //Cierra sesión, limpia el contexto de autenticación y redirige al login
  const handleLogout = () => {
    logoutContext();
    navigate("/login");
  };

  return (
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
        {/* Items principales */}
        {navItems.map(({ to, label, icon: Icon }) => (
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

          {/* Sub items de inventario */}
          {inventarioOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
              {inventarioItems.map(({ to, label, icon: Icon }) => (
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
      </nav>

      {/* Información del usuario activo y cerrar sesión */}
      <div className="px-4 py-4 border-t border-gray-700">
        {/* Información del usuario activo tomada del contexto */}
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {user?.nombre?.[0]}
            {user?.apellido?.[0]}
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-gray-400 text-xs">{user?.correo}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
