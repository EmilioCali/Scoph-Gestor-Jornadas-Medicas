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

//  DEPARTMENTS AND MUNICIPALITIES 
export const mockDepartamentos = [
    { _id: "dep_01", nombre: "Guatemala", municipios: [{ codigo: "GUA-01", nombre: "Guatemala" }, { codigo: "GUA-02", nombre: "Mixco" }, { codigo: "GUA-03", nombre: "Villa Nueva" }, { codigo: "GUA-04", nombre: "San Miguel Petapa" }, { codigo: "GUA-05", nombre: "Chinautla" }] },
    { _id: "dep_02", nombre: "Sacatepéquez", municipios: [{ codigo: "SAC-01", nombre: "Antigua Guatemala" }, { codigo: "SAC-02", nombre: "Jocotenango" }, { codigo: "SAC-03", nombre: "Pastores" }] },
    { _id: "dep_03", nombre: "Chimaltenango", municipios: [{ codigo: "CHM-01", nombre: "Chimaltenango" }, { codigo: "CHM-02", nombre: "San Andrés Itzapa" }, { codigo: "CHM-03", nombre: "Patzún" }] },
    { _id: "dep_04", nombre: "Escuintla", municipios: [{ codigo: "ESC-01", nombre: "Escuintla" }, { codigo: "ESC-02", nombre: "Santa Lucía Cotzumalguapa" }, { codigo: "ESC-03", nombre: "La Democracia" }] },
    { _id: "dep_05", nombre: "Santa Rosa", municipios: [{ codigo: "SRO-01", nombre: "Cuilapa" }, { codigo: "SRO-02", nombre: "Barberena" }] },
    { _id: "dep_06", nombre: "Sololá", municipios: [{ codigo: "SOL-01", nombre: "Sololá" }, { codigo: "SOL-02", nombre: "Panajachel" }, { codigo: "SOL-03", nombre: "Santiago Atitlán" }] },
    { _id: "dep_07", nombre: "Totonicapán", municipios: [{ codigo: "TOT-01", nombre: "Totonicapán" }, { codigo: "TOT-02", nombre: "San Cristóbal Totonicapán" }] },
    { _id: "dep_08", nombre: "Quetzaltenango", municipios: [{ codigo: "QUE-01", nombre: "Quetzaltenango" }, { codigo: "QUE-02", nombre: "Salcajá" }, { codigo: "QUE-03", nombre: "Coatepeque" }] },
    { _id: "dep_09", nombre: "Suchitepéquez", municipios: [{ codigo: "SUC-01", nombre: "Mazatenango" }, { codigo: "SUC-02", nombre: "Cuyotenango" }] },
    { _id: "dep_10", nombre: "Retalhuleu", municipios: [{ codigo: "RET-01", nombre: "Retalhuleu" }, { codigo: "RET-02", nombre: "San Sebastián" }] },
    { _id: "dep_11", nombre: "San Marcos", municipios: [{ codigo: "SMA-01", nombre: "San Marcos" }, { codigo: "SMA-02", nombre: "Malacatán" }] },
    { _id: "dep_12", nombre: "Huehuetenango", municipios: [{ codigo: "HUE-01", nombre: "Huehuetenango" }, { codigo: "HUE-02", nombre: "Chiantla" }] },
    { _id: "dep_13", nombre: "Quiché", municipios: [{ codigo: "QUI-01", nombre: "Santa Cruz del Quiché" }, { codigo: "QUI-02", nombre: "Chichicastenango" }] },
    { _id: "dep_14", nombre: "Baja Verapaz", municipios: [{ codigo: "BVE-01", nombre: "Salamá" }, { codigo: "BVE-02", nombre: "San Miguel Chicaj" }] },
    { _id: "dep_15", nombre: "Alta Verapaz", municipios: [{ codigo: "AVE-01", nombre: "Cobán" }, { codigo: "AVE-02", nombre: "San Pedro Carchá" }] },
    { _id: "dep_16", nombre: "Petén", municipios: [{ codigo: "PET-01", nombre: "Flores" }, { codigo: "PET-02", nombre: "San Benito" }] },
    { _id: "dep_17", nombre: "Izabal", municipios: [{ codigo: "IZA-01", nombre: "Puerto Barrios" }, { codigo: "IZA-02", nombre: "Livingston" }] },
    { _id: "dep_18", nombre: "Zacapa", municipios: [{ codigo: "ZAC-01", nombre: "Zacapa" }, { codigo: "ZAC-02", nombre: "Estanzuela" }] },
    { _id: "dep_19", nombre: "Chiquimula", municipios: [{ codigo: "CHI-01", nombre: "Chiquimula" }, { codigo: "CHI-02", nombre: "Esquipulas" }, { codigo: "CHI-03", nombre: "Jocotán" }] },
    { _id: "dep_20", nombre: "Jalapa", municipios: [{ codigo: "JAL-01", nombre: "Jalapa" }, { codigo: "JAL-02", nombre: "San Pedro Pinula" }] },
    { _id: "dep_21", nombre: "Jutiapa", municipios: [{ codigo: "JUT-01", nombre: "Jutiapa" }, { codigo: "JUT-02", nombre: "Asunción Mita" }] },
    { _id: "dep_22", nombre: "El Progreso", municipios: [{ codigo: "EPR-01", nombre: "Guastatoya" }, { codigo: "EPR-02", nombre: "Morazán" }] },
];

//  USERS 
// Matches: GET /api/auth/users
export const mockUsers = [
    { _id: "usr_001", nombre: "Daniel", apellido: "Gómez", username: "dgomez", correo: "daniel@scoph.org", rol: "ADMIN", telefono: "12345678", isActive: true, mustChangePassword: false, emailVerificado: true, ultimoAcceso: "2026-04-28T10:00:00Z", createdAt: "2026-01-01T00:00:00Z" },
    { _id: "usr_002", nombre: "María", apellido: "López", username: "mlopez", correo: "maria@scoph.org", rol: "MEDICO", telefono: "87654321", isActive: true, mustChangePassword: false, emailVerificado: true, ultimoAcceso: "2026-04-27T08:00:00Z", createdAt: "2026-01-15T00:00:00Z" },
    { _id: "usr_003", nombre: "Carlos", apellido: "Ruiz", username: "cruiz", correo: "carlos@scoph.org", rol: "MEDICO", telefono: "55544433", isActive: false, mustChangePassword: true, emailVerificado: false, ultimoAcceso: null, createdAt: "2026-02-01T00:00:00Z" },
    { _id: "usr_004", nombre: "Ana", apellido: "García", username: "agarcia", correo: "ana@scoph.org", rol: "MEDICO", telefono: "99988877", isActive: true, mustChangePassword: false, emailVerificado: true, ultimoAcceso: "2026-04-26T14:00:00Z", createdAt: "2026-02-15T00:00:00Z" },
];

//  MEDICINES CATALOG ====
// Matches: GET /api/v1/medicines
// Field names match backend: name, compound, concentration, presentation, unitOfMeasure, category, status
export const mockMedicines = [
    { _id: "med_001", barcode: "7501234567890", name: "Zibac", compound: "Azitromicina", concentration: "200mg/5ml", presentation: "Jarabe", unitOfMeasure: "Frasco", category: "ANTIBIOTICOS", status: "ACTIVO", createdAt: "2026-01-01T00:00:00Z" },
    { _id: "med_002", barcode: "7502345678901", name: "Ibuprofeno", compound: "Ibuprofeno", concentration: "400mg", presentation: "Tableta", unitOfMeasure: "Caja", category: "ANALGESICOS", status: "ACTIVO", createdAt: "2026-01-02T00:00:00Z" },
    { _id: "med_003", barcode: "7503456789012", name: "Paracetamol", compound: "Paracetamol", concentration: "500mg", presentation: "Tableta", unitOfMeasure: "Caja", category: "ANALGESICOS", status: "ACTIVO", createdAt: "2026-01-03T00:00:00Z" },
    { _id: "med_004", barcode: "7504567890123", name: "Metformina", compound: "Metformina HCL", concentration: "850mg", presentation: "Tableta", unitOfMeasure: "Caja", category: "ANTIDIABETICOS", status: "ACTIVO", createdAt: "2026-01-04T00:00:00Z" },
    { _id: "med_005", barcode: "7505678901234", name: "Losartán", compound: "Losartán Potásico", concentration: "50mg", presentation: "Tableta", unitOfMeasure: "Caja", category: "ANTIHIPERTENSIVOS", status: "ACTIVO", createdAt: "2026-01-05T00:00:00Z" },
    { _id: "med_006", barcode: "7506789012345", name: "Omeprazol", compound: "Omeprazol", concentration: "20mg", presentation: "Cápsula", unitOfMeasure: "Caja", category: "ANTIÁCIDOS", status: "INACTIVO", createdAt: "2026-01-06T00:00:00Z" },
];

//  CENTRAL INVENTORY 
// Matches: GET /api/v1/inventario-central
// Field names match backend: medicineId, lots[{batch, expirationDate, stock}], totalStock, minimumStock
export const mockCentralInventory = [
    {
        _id: "inv_central_001", medicineId: "med_001",
        name: "Zibac", compound: "Azitromicina", category: "ANTIBIOTICOS", unitOfMeasure: "Frasco",
        lots: [
            { batch: "L001", expirationDate: "2026-06-15", stock: 40 },
            { batch: "L002", expirationDate: "2027-01-10", stock: 20 },
        ],
        totalStock: 60, minimumStock: 10, updatedAt: "2026-04-28T10:00:00Z",
    },
    {
        _id: "inv_central_002", medicineId: "med_002",
        name: "Ibuprofeno", compound: "Ibuprofeno", category: "ANALGESICOS", unitOfMeasure: "Caja",
        lots: [{ batch: "L003", expirationDate: "2026-05-20", stock: 8 }],
        totalStock: 8, minimumStock: 15, updatedAt: "2026-04-28T10:00:00Z",
    },
    {
        _id: "inv_central_003", medicineId: "med_003",
        name: "Paracetamol", compound: "Paracetamol", category: "ANALGESICOS", unitOfMeasure: "Caja",
        lots: [{ batch: "L004", expirationDate: "2026-05-10", stock: 0 }],
        totalStock: 0, minimumStock: 30, updatedAt: "2026-04-28T10:00:00Z",
    },
    {
        _id: "inv_central_004", medicineId: "med_004",
        name: "Metformina", compound: "Metformina HCL", category: "ANTIDIABETICOS", unitOfMeasure: "Caja",
        lots: [
            { batch: "L005", expirationDate: "2027-07-10", stock: 60 },
            { batch: "L006", expirationDate: "2027-12-31", stock: 40 },
        ],
        totalStock: 100, minimumStock: 20, updatedAt: "2026-04-28T10:00:00Z",
    },
    {
        _id: "inv_central_005", medicineId: "med_005",
        name: "Losartán", compound: "Losartán Potásico", category: "ANTIHIPERTENSIVOS", unitOfMeasure: "Caja",
        lots: [{ batch: "L007", expirationDate: "2027-12-01", stock: 80 }],
        totalStock: 80, minimumStock: 25, updatedAt: "2026-04-28T10:00:00Z",
    },
    {
        _id: "inv_central_006", medicineId: "med_006",
        name: "Omeprazol", compound: "Omeprazol", category: "ANTIÁCIDOS", unitOfMeasure: "Caja",
        lots: [{ batch: "L008", expirationDate: "2026-08-15", stock: 5 }],
        totalStock: 5, minimumStock: 20, updatedAt: "2026-04-28T10:00:00Z",
    },
];

//  WORKDAYS 
// Matches: GET /api/v1/workdays
// Field names match backend: name, description, startDate, endDate,
// location{department, municipality, address}, manager{userId, name},
// estimatedPatients, estimatedMedicines, status
// Status values: PLANNED | IN_PROGRESS | COMPLETED
export const mockWorkdays = [
    {
        _id: "jor_001",
        name: "Jornada Chiquimula",
        description: "Jornada médica general",
        startDate: "2026-05-10T08:00:00.000Z",
        endDate: "2026-05-10T16:00:00.000Z",
        location: { department: "Chiquimula", municipality: "Chiquimula", address: "Centro comunitario" },
        manager: { userId: "usr_001", name: "Daniel Gómez" },
        estimatedPatients: 100,
        estimatedMedicines: 300,
        status: "IN_PROGRESS",
        createdAt: "2026-04-28T10:00:00Z",
        updatedAt: "2026-04-28T10:00:00Z",
    },
    {
        _id: "jor_002",
        name: "Jornada Mixco",
        description: "Atención primaria y medicina general",
        startDate: "2026-05-15T08:00:00.000Z",
        endDate: "2026-05-16T16:00:00.000Z",
        location: { department: "Guatemala", municipality: "Mixco", address: "Salón municipal" },
        manager: { userId: "usr_002", name: "María López" },
        estimatedPatients: 150,
        estimatedMedicines: 400,
        status: "PLANNED",
        createdAt: "2026-04-29T10:00:00Z",
        updatedAt: "2026-04-29T10:00:00Z",
    },
    {
        _id: "jor_003",
        name: "Jornada Villa Nueva",
        description: "Jornada de salud preventiva",
        startDate: "2026-04-28T08:00:00.000Z",
        endDate: "2026-04-28T16:00:00.000Z",
        location: { department: "Guatemala", municipality: "Villa Nueva", address: "Parque central" },
        manager: { userId: "usr_003", name: "Carlos Ruiz" },
        estimatedPatients: 80,
        estimatedMedicines: 200,
        status: "COMPLETED",
        createdAt: "2026-04-20T10:00:00Z",
        updatedAt: "2026-04-20T10:00:00Z",
    },
];

//  WORKDAY INVENTORY 
// Matches: GET /api/v1/inventario-jornada/:jornadaId
// Field names match backend: lots[{batch, expirationDate, stock}], totalStock
export const mockWorkdayInventory = {
    "jor_001": [
        { _id: "med_001", name: "Zibac", unitOfMeasure: "Frasco", batch: "L001", expirationDate: "2026-06-15", assignedQuantity: 20, usedQuantity: 5, returnedQuantity: 0 },
        { _id: "med_002", name: "Ibuprofeno", unitOfMeasure: "Caja", batch: "L003", expirationDate: "2026-05-20", assignedQuantity: 10, usedQuantity: 3, returnedQuantity: 0 },
    ],
    "jor_002": [],
    "jor_003": [
        { _id: "med_003", name: "Paracetamol", unitOfMeasure: "Caja", batch: "L004", expirationDate: "2026-05-10", assignedQuantity: 15, usedQuantity: 15, returnedQuantity: 0 },
    ],
};

// ===== MOVEMENTS CHART DATA =====
// Matches: GET /api/v1/reportes/movimientos
export const mockMovementsChart = [
    { month: "Ene", entries: 20, exits: 15 },
    { month: "Feb", entries: 35, exits: 28 },
    { month: "Mar", entries: 25, exits: 20 },
    { month: "Abr", entries: 40, exits: 32 },
    { month: "May", entries: 30, exits: 25 },
    { month: "Jun", entries: 45, exits: 38 },
];

// ===== MOVEMENTS DETAIL =====
// Matches: GET /api/v1/reportes/movimientos
// Field names match backend: type, subType, userId, appliedAt
export const mockMovementsDetail = [
    { _id: "mov_001", type: "ENTRADA", subType: "DONACION", medicine: "Zibac", batch: "L001", quantity: 40, user: "Daniel Gómez", motive: "Donación Cruz Roja", createdAt: "2026-04-01T10:00:00Z" },
    { _id: "mov_002", type: "SALIDA", subType: "RECETA", medicine: "Ibuprofeno", batch: "L003", quantity: 5, user: "María López", motive: "Receta paciente", createdAt: "2026-04-02T10:00:00Z" },
    { _id: "mov_003", type: "TRANSFERENCIA", subType: "ASIGNACION_JORNADA", medicine: "Zibac", batch: "L001", quantity: 20, user: "Daniel Gómez", motive: "Asignación Jornada Chiquimula", createdAt: "2026-04-03T10:00:00Z" },
    { _id: "mov_004", type: "ENTRADA", subType: "COMPRA", medicine: "Metformina", batch: "L005", quantity: 60, user: "Daniel Gómez", motive: "Compra mensual", createdAt: "2026-04-04T10:00:00Z" },
];

// ===== EXPIRATION ALERTS =====
// Matches: GET /api/v1/reportes/alertas/vencimientos
export const mockExpirationAlerts = [
    { _id: "inv_central_002", name: "Ibuprofeno", batch: "L003", currentStock: 8, expirationDate: "2026-05-20", daysRemaining: 15 },
    { _id: "inv_central_003", name: "Paracetamol", batch: "L004", currentStock: 0, expirationDate: "2026-05-10", daysRemaining: 5 },
    { _id: "inv_central_006", name: "Omeprazol", batch: "L008", currentStock: 5, expirationDate: "2026-08-15", daysRemaining: 45 },
];

// ===== RECENT WORKDAYS FOR DASHBOARD =====
export const mockRecentWorkdays = [
    { _id: "jor_001", name: "Jornada Chiquimula", startDate: "2026-05-10T08:00:00.000Z", location: "Chiquimula, Chiquimula", status: "IN_PROGRESS", manager: "Daniel Gómez" },
    { _id: "jor_002", name: "Jornada Mixco", startDate: "2026-05-15T08:00:00.000Z", location: "Mixco, Guatemala", status: "PLANNED", manager: "María López" },
    { _id: "jor_003", name: "Jornada Villa Nueva", startDate: "2026-04-28T08:00:00.000Z", location: "Villa Nueva, Guatemala", status: "COMPLETED", manager: "Carlos Ruiz" },
];

// ===== MEDICINE CATEGORIES =====
export const medicineCategories = [
    "ANTIBIOTICOS", "ANALGESICOS", "ANTIINFLAMATORIOS", "ANTIDIABETICOS",
    "ANTIHIPERTENSIVOS", "ANTIÁCIDOS", "VITAMINAS", "ANTIPARASITARIOS",
    "ANTIHISTAMINICOS", "OTROS",
];