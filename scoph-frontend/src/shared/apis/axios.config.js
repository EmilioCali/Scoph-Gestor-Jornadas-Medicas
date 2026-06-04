import axios from "axios";
import { useAuthStore } from "../../features/auth/store/authStore.js";

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3020";
const CORE_BASE_URL =
  import.meta.env.VITE_CORE_SERVICE_URL || "http://localhost:3022";
const WORKDAY_BASE_URL =
  import.meta.env.VITE_WORKDAY_SERVICE_URL || "http://localhost:3021";
const REPORTS_BASE_URL =
  import.meta.env.VITE_REPORTS_SERVICE_URL || "http://localhost:3023";

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use((config) => {
    // CORRECCIÓN: Le pedimos el token a Zustand
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // CORRECCIÓN: Usamos Zustand para limpiar la sesión
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    },
  );
  return instance;
};

export const authAPI = createInstance(AUTH_BASE_URL);
export const coreAPI = createInstance(CORE_BASE_URL);
export const workdayAPI = createInstance(WORKDAY_BASE_URL);
export const reportsAPI = createInstance(REPORTS_BASE_URL);
