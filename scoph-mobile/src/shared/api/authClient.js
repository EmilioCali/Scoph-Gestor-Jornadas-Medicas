// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\api\authClient.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

const API_BASE_URL = (
  Constants?.expoConfig?.extra?.AUTH_SERVICE_URL ||
  Constants?.expoConfig?.extra?.API_URL ||
  process.env.AUTH_SERVICE_URL ||
  process.env.API_URL ||
  'http://localhost:3020'
);
const REFRESH_TOKEN_KEY = (Constants?.expoConfig?.extra?.REFRESH_TOKEN_KEY) || process.env.REFRESH_TOKEN_KEY || 'scoph_refresh_token';

const AUTH_WHITELIST = [
  ENDPOINTS.LOGIN,
  ENDPOINTS.REGISTER,
  ENDPOINTS.FORGOT_PASSWORD,
  ENDPOINTS.RESET_PASSWORD,
  ENDPOINTS.VERIFY_EMAIL,
  ENDPOINTS.RESEND_VERIFICATION
];

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const isAuthUrl = (url) => {
  if (!url) return false;
  const normalizedUrl = url.startsWith('http') ? url.replace(API_BASE_URL, '') : url;
  return AUTH_WHITELIST.some((path) => normalizedUrl.endsWith(path));
};

let isRefreshing = false;
let refreshPromise = null;
const pendingRequests = [];

const processPending = (error, token) => {
  pendingRequests.forEach((callback) => callback(error, token));
  pendingRequests.length = 0;
};

authClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || !error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || originalRequest.skipAuthRefresh || isAuthUrl(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((err, token) => {
          if (err) {
            reject(err);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(authClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          await useAuthStore.getState().logout();
          throw new Error('No refresh token available');
        }

        const response = await authClient.post(
          ENDPOINTS.REFRESH,
          { refreshToken },
          { skipAuthRefresh: true }
        );

        const { accessToken } = response.data;
        useAuthStore.getState().setAccessToken(accessToken);
        processPending(null, accessToken);
        return accessToken;
      } catch (refreshError) {
        processPending(refreshError, null);
        await useAuthStore.getState().logout();
        throw refreshError;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    try {
      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return authClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export async function login(credentials) {
  const response = await authClient.post(ENDPOINTS.LOGIN, credentials);
  return response.data;
}

export async function refreshToken(token) {
  const response = await authClient.post(ENDPOINTS.REFRESH, { refreshToken: token });
  return response.data;
}

export default authClient;
