import axios from "axios";

//URL base de cada microservicio
// Cambiar estas variables en el archivo .env para apuntar a los microservicios correctos.
const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3020";
const CORE_BASE_URL =
  import.meta.env.VITE_CORE_SERVICE_URL || "http://localhost:3022";
const WORKDAY_BASE_URL =
  import.meta.env.VITE_WORKDAY_SERVICE_URL || "http://localhost:3021";
const REPORTS_BASE_URL =
  import.meta.env.VITE_REPORTS_SERVICE_URL || "http://localhost:3023";

//Funcion para crear una instancia de axios con la URL base y el token JWT
const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  // Intercepta las solicitudes para agregar el token JWT a cada request automaticamente
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Intercepta las respuestas para manejar errores globalmente
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      //Si el token expira o es invalido, redirige al login
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
