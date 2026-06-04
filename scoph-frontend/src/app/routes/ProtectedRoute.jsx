import { Navigate, Outlet } from "react-router-dom";
//import { useAuth } from ".././../features/auth/store/AuthContext";
import { useAuthStore } from "../../features/auth/store/authStore.js";

//Componente par//a proteger rutas que requieren autenticación
//Si el usuario no esta autenticado, redirige al login
//Si mustChangePassword es true, redirige a la pagina de cambio de contraseña
export default function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuthStore();

  //Mientras verifica la sesion guardadad, se muestra un loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  //Si no esta autenticado, redirige al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  //Si debe de cambiar contraseña, redirige a la pagina de cambio de contraseña
  if (user?.mustChangePassword)
    return <Navigate to="/change-password" replace />;

  //Si esta autenticado renderiza la vista solicitada
  return <Outlet />;
}
