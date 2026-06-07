import { coreAPI } from "./axios.config";

// ── MEDICAMENTOS ─────────────────────────────────────────────────────────────

// GET /api/v1/medicines
export const getMedicines = () =>
    coreAPI.get("/api/v1/medicines");

// POST /api/v1/medicines
export const createMedicine = (data) =>
    coreAPI.post("/api/v1/medicines", data);

// PUT /api/v1/medicines/:id
export const updateMedicine = (id, data) =>
    coreAPI.put(`/api/v1/medicines/${id}`, data);

// PATCH /api/v1/medicines/:id/status
export const toggleMedicineStatus = (id, status) =>
    coreAPI.patch(`/api/v1/medicines/${id}/status`, { status });

// ── INVENTARIO CENTRAL ───────────────────────────────────────────────────────

// GET /api/v1/inventario-central
export const getCentralInventory = () =>
    coreAPI.get("/api/v1/inventario-central");

// POST /api/v1/inventario-central  (agrega medicamento con stock mínimo + lote inicial)
export const addToCentralInventory = (data) =>
    coreAPI.post("/api/v1/inventario-central", data);

// ── INVENTARIO JORNADA ───────────────────────────────────────────────────────

// GET /api/v1/inventario-jornada/:jornadaId
export const getWorkdayInventory = (jornadaId) =>
    coreAPI.get(`/api/v1/inventario-jornada/${jornadaId}`);

// ── MOVIMIENTOS ──────────────────────────────────────────────────────────────

// POST /api/v1/movimientos/entrada  (COMPRA / DONACION)
export const registerEntry = (data) =>
    coreAPI.post("/api/v1/movimientos/entrada", data);

// POST /api/v1/movimientos/salida-receta
export const registerSalidaReceta = (data) =>
    coreAPI.post("/api/v1/movimientos/salida-receta", data);

// POST /api/v1/movimientos/transferencia  (ASIGNACION_JORNADA)
export const registerTransfer = (data) =>
    coreAPI.post("/api/v1/movimientos/transferencia", data);

// POST /api/v1/movimientos/consumo-jornada
export const registerConsumption = (data) =>
    coreAPI.post("/api/v1/movimientos/consumo-jornada", data);

// POST /api/v1/movimientos/retorno-jornada
export const registerReturn = (data) =>
    coreAPI.post("/api/v1/movimientos/retorno-jornada", data);

// GET /api/v1/movimientos
export const getMovements = (params) =>
    coreAPI.get("/api/v1/movimientos", { params });

// ── AUDITORÍA ────────────────────────────────────────────────────────────────

// GET /api/v1/auditoria
export const getAudit = () =>
    coreAPI.get("/api/v1/auditoria");