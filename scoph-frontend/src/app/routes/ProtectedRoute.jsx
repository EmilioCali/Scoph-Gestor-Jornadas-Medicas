import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore.js";

function getRoleHome(rol) {
  return rol === "MEDICO" ? "/jornadas" : "/dashboard";
}

// Protege rutas que requieren autenticación.
// Si mustChangePassword es true, redirige a cambio de contraseña.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth, user } = useAuthStore();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.mustChangePassword)
    return <Navigate to="/change-password" replace />;

  return <Outlet />;
}

export function RequireRole({ allowedRoles = [] }) {
  const { user } = useAuthStore();

  if (!allowedRoles.includes(user?.rol)) {
    return <Navigate to={getRoleHome(user?.rol)} replace />;
  }

  return <Outlet />;
}

export function HomeRedirect() {
  const { user } = useAuthStore();
  return <Navigate to={getRoleHome(user?.rol)} replace />;
}
