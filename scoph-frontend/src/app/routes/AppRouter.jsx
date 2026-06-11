import { useEffect } from "react";
import { useAuthStore } from "../../features/auth/store/authStore.js";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute, { RequireRole } from "./ProtectedRoute";
import MovimientosPage from "../../features/inventory/pages/MovimientosPage";

// Páginas de autenticación
import LoginPage from "../../features/auth/pages/LoginPage";
import RecoverPasswordPage from "../../features/auth/pages/RecoverPasswordPage";
import ChangePasswordPage from "../../features/auth/pages/ChangePasswordPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";

// Páginas principales
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import UsuariosPage from "../../features/users/pages/UsersPages.jsx";
import WorkdaysPage from "../../features/workdays/pages/WorkdaysPage.jsx";

// Páginas de inventario
import CatalogoPage from "../../features/inventory/pages/CatalogoPage";
import InventarioCentralPage from "../../features/inventory/pages/InventarioCentralPage";

// Página de reportes
import ReportesPage from "../../features/reports/pages/ReportsPages";

export default function AppRouter() {
  const { checkAuth, isLoadingAuth } = useAuthStore();

  // verifica el token en Zustand al arrancar la app
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas - accesibles sin autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Ruta de cambio de contraseña obligatorio - requiere estar autenticado */}
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Rutas protegidas - requieren autenticación y mustChangePassword = false */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
              <Route path="usuarios" element={<UsuariosPage />} />
            </Route>
            <Route path="jornadas" element={<WorkdaysPage />} />
            <Route path="inventario/catalogo" element={<CatalogoPage />} />
            <Route
              path="inventario/central"
              element={<InventarioCentralPage />}
            />
            <Route path="inventario/movimientos" element={<MovimientosPage />} />
            <Route path="reportes" element={<ReportesPage />} />
          </Route>
        </Route>

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
