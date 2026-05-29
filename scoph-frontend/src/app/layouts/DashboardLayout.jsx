import { Outlet } from 'react-router-dom';
import Sidebar from "../../shared/components/layout/Sidebar";

// Layout base que envuelve todas las vistas protegidas
// Outlet renderiza la vista activa según la ruta
export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-base">

            {/* Sidebar fijo a la izquierda */}
            <Sidebar />

            {/* Contenido principal con margen para el sidebar */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}