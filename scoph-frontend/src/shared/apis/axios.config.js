import axios from "axios";
import { useAuthStore } from "../../features/auth/store/authStore.js";
import { useUIStore } from "../store/uiStore.js";

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3020";
const CORE_BASE_URL =
  import.meta.env.VITE_CORE_SERVICE_URL || "http://localhost:3022";
const WORKDAY_BASE_URL =
  import.meta.env.VITE_WORKDAY_SERVICE_URL || "http://localhost:3021";
const REPORTS_BASE_URL =
  import.meta.env.VITE_REPORTS_SERVICE_URL || "http://localhost:3023";

const extractErrorMessage = (error) => {
  const data = error?.response?.data;
  const message =
    data?.message ||
    data?.error ||
    error?.message ||
    "Ocurrió un error inesperado";

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string") {
    return message;
  }

  return "Ocurrió un error inesperado";
};

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    const { setGlobalLoading, clearGlobalError } = useUIStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    setGlobalLoading(true);
    clearGlobalError();
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      useUIStore.getState().setGlobalLoading(false);
      return response;
    },
    (error) => {
      const uiStore = useUIStore.getState();
      uiStore.setGlobalLoading(false);

      const status = error.response?.status;
      const message = extractErrorMessage(error);

      if (status === 401) {
        useAuthStore.getState().logout();
        uiStore.setGlobalError("Tu sesión expiró. Inicia sesión nuevamente.");
        uiStore.showError("Tu sesión expiró. Inicia sesión nuevamente.");
        window.location.href = "/login";
      } else if (status === 403) {
        uiStore.setGlobalError("No tienes permisos para realizar esta acción.");
        uiStore.showError("No tienes permisos para realizar esta acción.");
      } else if (status >= 500) {
        uiStore.setGlobalError("Ocurrió un problema en el servidor. Intenta nuevamente.");
        uiStore.showError("Ocurrió un problema en el servidor. Intenta nuevamente.");
      } else {
        uiStore.setGlobalError(message);
        uiStore.showError(message);
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
