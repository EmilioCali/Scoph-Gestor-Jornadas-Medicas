import { coreAPI } from "./axios.config";

//MEDICINAS
// GET /api/v1/medicines
export const getMedicines = () =>
    coreAPI.get("/api/v1/medicines");

//POST /api/v1/medicines
export const createMedicine = (data) =>
    coreAPI.post("/api/v1/medicines", data);

// PUT /api/v1/medicines/:id
export const updateMedicine = (id, data) =>
    coreAPI.put(`/api/v1/medicines/${id}`, data);

// PATCH /api/v1/medicines/:id/status
export const toggleMedicineStatus = (id, status) =>
    coreAPI.patch(`/api/v1/medicines/${id}/status`, { status });

// INVENTARIO CENTRAL
// GET /api/v1/inventorio-central
export const getCentralInventory = () =>
    coreAPI.get("/api/v1/inventorio-central");

// INVENTARIOS JORNADAS
// GET /api/v1/inventarios-jornada/:jornadaId
export const getWorkdayInventory = (jornadaId) =>
    coreAPI.get(`/api/v1/inventario-jornada/${jornadaId}`);

//MOVEMENTS
// POST POST /api/v1/movimientos/entradas (COMPRA / DONACION)
export const registerEntry = (data) =>
    coreAPI.post("/api/v1/movimientos/entradas", data);

// POST /api/v1/movimientos/transferencia (ASIGNACION_JORNADA)
export const registerTransfer = (data) =>
    coreAPI.post("/api/v1/movimientos/transferencia", data);

// POST /api/v1/movimientos/consumo-jornada (CONSUMO_JORNADA)
export const registerConsumption = (data) =>
    coreAPI.post("/api/v1/movimientos/consumo-jornada", data);

// POST /api/v1/movimientos/retorno-jornada (RETORNO_JORNADA)
export const registerReturn = (data) =>
    coreAPI.post("/api/v1/movimientos/retorno-jornada", data);

// ===== AUDIT =====
// GET /api/v1/auditoria
export const getAudit = () =>
    coreAPI.get("/api/v1/auditoria");