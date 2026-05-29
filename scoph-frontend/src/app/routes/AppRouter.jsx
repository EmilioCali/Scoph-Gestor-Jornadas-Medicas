import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Páginas de autenticación
import LoginPage from "../../features/auth/pages/LoginPage";
import RecoverPasswordPage from "../../features/auth/pages/RecoverPasswordPage";
import ChangePasswordPage from "../../features/auth/pages/ChangePasswordPage";

// Páginas principales
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import UsuariosPage from "../../features/users/pages/UsersPages.jsx";
import JornadasPage from "../../features/jornadas/pages/JornadasPage";

// Páginas de inventario
import CatalogoPage from "../../features/inventory/pages/CatalogoPage";
import InventarioCentralPage from "../../features/inventory/pages/InventarioCentralPage";

// Página de reportes
import ReportesPage from "../../features/reports/pages/ReportsPages";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas - accesibles sin autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />

        {/* Ruta de cambio de contraseña obligatorio - requiere estar autenticado */}
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Rutas protegidas - requieren autenticación y mustChangePassword = false */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="jornadas" element={<JornadasPage />} />
            <Route path="inventario/catalogo" element={<CatalogoPage />} />
            <Route
              path="inventario/central"
              element={<InventarioCentralPage />}
            />
            <Route path="reportes" element={<ReportesPage />} />
          </Route>
        </Route>

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
