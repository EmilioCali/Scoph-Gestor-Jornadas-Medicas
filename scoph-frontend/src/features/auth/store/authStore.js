import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginReq } from "../../../shared/apis";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,

      // Valida si hay sesión activa al recargar la página
      checkAuth: () => {
        const token = get().token;
        const user = get().user;

        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(token),
          user: user || null,
          role: user?.rol || null,
        });
      },

      // y asegurar que se persista en localStorage
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      // Cierra sesión y limpia el storage
      logout: () => {
        localStorage.clear();
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Inicia sesión interactuando con Fastify
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });

          // Llamada a tu API de Fastify
          const { data } = await loginReq(credentials);

          const token = data?.token;
          const userDetails = data?.user || data?.userDetails;

          if (!token) {
            throw new Error("El servicio no devolvió un token válido");
          }

          // Inyectamos el mustChangePassword dentro del userDetails por si viene suelto
          if (data.mustChangePassword !== undefined) {
            userDetails.mustChangePassword = data.mustChangePassword;
          }

          set({
            user: userDetails,
            token: token,
            role: userDetails?.rol,
            isLoadingAuth: false,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.message ||
            err.message ||
            "Error al iniciar sesión";
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },
    }),
    {
      name: "auth-scoph-storage", // Nombre actualizado para el localStorage
    },
  ),
);
