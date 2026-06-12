// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\api\userClient.js
import axios from "axios";
import { useAuthStore } from "../store/authStore.js";
import { ENDPOINTS } from "../constants/endpoints.js";
import * as SecureStore from "expo-secure-store";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

const createClient = (baseURL) => {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await SecureStore.getItemAsync("refreshToken");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await axios.post(ENDPOINTS.AUTH.REFRESH, {
            refreshToken,
          });

          const newToken = response.data.accessToken || response.data.token;
          useAuthStore.getState().setAccessToken(newToken);
          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

const CORE_BASE_URL = process.env.VITE_CORE_SERVICE_URL || "http://localhost:3022";
const WORKDAY_BASE_URL = process.env.VITE_WORKDAY_SERVICE_URL || "http://localhost:3021";
const REPORTS_BASE_URL = process.env.VITE_REPORTS_SERVICE_URL || "http://localhost:3023";
const AUTH_BASE_URL = process.env.VITE_AUTH_SERVICE_URL || "http://localhost:3020";

export const coreClient = createClient(CORE_BASE_URL);
export const workdayClient = createClient(WORKDAY_BASE_URL);
export const reportsClient = createClient(REPORTS_BASE_URL);
export const authClient = createClient(AUTH_BASE_URL);

export default authClient;
