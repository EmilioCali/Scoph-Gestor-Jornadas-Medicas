// Mock data simulating backend responses
// Field names match the real backend API documentation
// When backend is connected, replace these with axios service calls

//  DASHBOARD METRICS
// Matches: GET /api/v1/reportes/dashboard
export const mockDashboardMetrics = {
  totalMedicines: 6,
  activeWorkdays: 2,
  expirationAlerts: 3,
  monthlyMovements: 12,
};

//  USERS
// Matches: GET /api/auth/users
export const mockUsers = [
  {
    _id: "usr_001",
    nombre: "Daniel",
    apellido: "Gómez",
    username: "dgomez",
    correo: "daniel@scoph.org",
    rol: "ADMIN",
    telefono: "12345678",
    isActive: true,
    mustChangePassword: false,
    emailVerificado: true,
    ultimoAcceso: "2026-04-28T10:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    _id: "usr_002",
    nombre: "María",
    apellido: "López",
    username: "mlopez",
    correo: "maria@scoph.org",
    rol: "MEDICO",
    telefono: "87654321",
    isActive: true,
    mustChangePassword: false,
    emailVerificado: true,
    ultimoAcceso: "2026-04-27T08:00:00Z",
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    _id: "usr_003",
    nombre: "Carlos",
    apellido: "Ruiz",
    username: "cruiz",
    correo: "carlos@scoph.org",
    rol: "MEDICO",
    telefono: "55544433",
    isActive: false,
    mustChangePassword: true,
    emailVerificado: false,
    ultimoAcceso: null,
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    _id: "usr_004",
    nombre: "Ana",
    apellido: "García",
    username: "agarcia",
    correo: "ana@scoph.org",
    rol: "MEDICO",
    telefono: "99988877",
    isActive: true,
    mustChangePassword: false,
    emailVerificado: true,
    ultimoAcceso: "2026-04-26T14:00:00Z",
    createdAt: "2026-02-15T00:00:00Z",
  },
];
