import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "../features/auth/store/AuthContext";

// AuthProvider envuelve toda la app para que cualquier componente
// pueda acceder al contexto de autenticación mediante useAuth()
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
