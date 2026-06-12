// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\store\authStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: async (accessToken, user, refreshToken) => {
        try {
          if (refreshToken) {
            await SecureStore.setItemAsync("refreshToken", refreshToken);
          }
          set({
            token: accessToken,
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Error al guardar token en SecureStore:", error);
        }
      },

      logout: async () => {
        try {
          await SecureStore.deleteItemAsync("refreshToken");
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error("Error al limpiar SecureStore:", error);
        }
      },

      setAccessToken: (token) => {
        set({ token });
      },

      updateUser: (user) => {
        set({ user });
      },

      onRehydrateStorage: () => (state) => {
        state._hasHydrated = true;
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        return (rehydratedState) => {
          if (rehydratedState) {
            rehydratedState._hasHydrated = true;
          }
        };
      },
    },
  ),
);
