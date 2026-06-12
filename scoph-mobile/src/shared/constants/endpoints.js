// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\constants\endpoints.js
const AUTH_BASE_URL = process.env.VITE_AUTH_SERVICE_URL || "http://localhost:3020";
const CORE_BASE_URL = process.env.VITE_CORE_SERVICE_URL || "http://localhost:3022";
const WORKDAY_BASE_URL = process.env.VITE_WORKDAY_SERVICE_URL || "http://localhost:3021";
const REPORTS_BASE_URL = process.env.VITE_REPORTS_SERVICE_URL || "http://localhost:3023";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_BASE_URL}/api/auth/login`,
    REGISTER: `${AUTH_BASE_URL}/api/auth/register`,
    REFRESH: `${AUTH_BASE_URL}/api/auth/refresh`,
    CHANGE_PASSWORD: `${AUTH_BASE_URL}/api/auth/change-password`,
    FORGOT_PASSWORD: `${AUTH_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${AUTH_BASE_URL}/api/auth/reset-password`,
    VERIFY_EMAIL: `${AUTH_BASE_URL}/api/auth/verify-email`,
    RESEND_VERIFICATION: `${AUTH_BASE_URL}/api/auth/resend-verification`,
    USERS: `${AUTH_BASE_URL}/api/auth/users`,
  },
  CORE: {
    MEDICINES: `${CORE_BASE_URL}/api/medicines`,
    MOVEMENTS: `${CORE_BASE_URL}/api/movements`,
    INVENTORY: `${CORE_BASE_URL}/api/inventory`,
  },
  WORKDAY: {
    WORKDAYS: `${WORKDAY_BASE_URL}/api/workdays`,
  },
  REPORTS: {
    REPORTS: `${REPORTS_BASE_URL}/api/reports`,
  },
};
