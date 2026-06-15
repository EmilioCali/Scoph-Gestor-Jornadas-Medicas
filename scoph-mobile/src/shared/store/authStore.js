// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\store\authStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const REFRESH_TOKEN_KEY = 'scoph_refresh_token';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      _hasHydrated: false,
      login: async (accessToken, user, refreshToken) => {
        if (refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
        set({ token: accessToken, user, isAuthenticated: true });
      },
      logout: async () => {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },
      setAccessToken: (token) => set({ token, isAuthenticated: !!token }),
      updateUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      finishHydration: () => set((state) => ({
        _hasHydrated: true,
        isAuthenticated: !!state.token
      }))
    }),
    {
      name: 'scoph-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: (state) => (hydratedState) => {
        (hydratedState || state)?.finishHydration();
      }
    }
  )
);
