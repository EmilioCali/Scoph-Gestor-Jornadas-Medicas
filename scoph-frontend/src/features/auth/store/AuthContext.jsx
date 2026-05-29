import { createContext, useContext, useState, useEffect } from "react";

// Contexto global de autenticación
// Provee el usuario activo, token y funciones de login/logout a toda la app
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar el componente verifica si hay sesión guardada en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Guarda la sesión en el estado y en localStorage
  // Cuando se conecte el backend llamar esto después de recibir la respuesta del login
  const loginContext = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Limpia la sesión del estado y del localStorage
  const logoutContext = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Verifica si el usuario tiene un rol específico
  const hasRole = (role) => user?.rol === role;

  // Verifica si el usuario está autenticado
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        loginContext,
        logoutContext,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto desde cualquier componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
