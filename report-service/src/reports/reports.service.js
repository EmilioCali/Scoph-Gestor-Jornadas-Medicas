import { SERVICES } from '../config/services.js';
import { buildExcelBuffer, buildPdfBuffer, formatDateGT } from './exportTemplates.js';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getAuthOptions(authHeader, options = {}) {
    return {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(authHeader ? { Authorization: authHeader } : {})
        }
    };
}

async function fetchJson(url, authHeader, message, options = {}) {
    const response = await fetch(url, getAuthOptions(authHeader, options));
    if (!response.ok) {
        throw new Error(`${message} (${response.status})`);
    }
    return response.json();
}

async function fetchAuthUsers(authHeader) {
    const response = await fetch(
        `${SERVICES.auth.baseUrl}/api/auth/users`,
        getAuthOptions(authHeader),
    );

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data.users) ? data.users : [];
}

function getUserDisplayName(user, fallback = 'Sistema') {
    if (!user) return fallback;

    return [user.nombre, user.apellido]
        .filter(Boolean)
        .join(' ')
        .trim()
        || user.username
        || user.correo
        || String(user._id);
}

export function enrichMovementEntriesWithUserNames(entries = [], users = []) {
    const userById = new Map(users.map((user) => [String(user._id), user]));

    return (entries || []).map((entry) => {
        const displayName = getUserDisplayName(
            userById.get(String(entry.userId)),
            entry.userId || 'Sistema',
        );

        return {
            ...entry,
            userName: displayName,
            userDisplayName: displayName,
        };
    });
}

function getMedicineValue(inv, key, fallback = '') {
    if (inv.medicineId && typeof inv.medicineId === 'object') {
        return inv.medicineId[key] ?? fallback;
    }
    return inv[key] ?? fallback;
}

function getMedicineId(inv) {
    if (inv.medicineId && typeof inv.medicineId === 'object') {
        return inv.medicineId._id;
    }
    return inv.medicineId;
}

function getWorkdayLocation(workday) {
    const municipality = workday.location?.municipality;
    const department = workday.location?.department;
    return [municipality, department].filter(Boolean).join(', ');
}

function getMonthlyMovements(movements = []) {
    const currentYear = new Date().getFullYear();
    const months = MONTH_LABELS.map((month) => ({ month, entries: 0, exits: 0 }));

    movements.forEach((movement) => {
        const date = new Date(movement.createdAt || movement.appliedAt);
        if (Number.isNaN(date.getTime()) || date.getFullYear() !== currentYear) return;

        const bucket = months[date.getMonth()];
        if (movement.type === 'ENTRADA') bucket.entries += 1;
        if (movement.type === 'SALIDA') bucket.exits += 1;
        if (movement.type === 'TRANSFERENCIA') bucket.exits += 1;
    });

    return months;
}

function getLowStockAlerts(inventory = []) {
    return inventory
        .filter(inv => inv.totalStock <= inv.minimumStock)
        .map(inv => ({
            medicineId: getMedicineId(inv),
            nombre: getMedicineValue(inv, 'name'),
            concentracion: getMedicineValue(inv, 'concentration'),
            stockTotal: inv.totalStock,
            stockMinimo: inv.minimumStock
        }));
}

function getExpirationAlerts(inventory = [], dias = 60) {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + dias);

    const alertas = [];
    inventory.forEach(inv => {
        inv.lots.forEach(lote => {
            const exp = new Date(lote.expirationDate);
            if (exp <= limite && lote.stock > 0) {
                alertas.push({
                    medicineId: getMedicineId(inv),
                    nombre: getMedicineValue(inv, 'name'),
                    concentracion: getMedicineValue(inv, 'concentration'),
                    batch: lote.batch,
                    stock: lote.stock,
                    expirationDate: lote.expirationDate,
                    diasRestantes: Math.ceil((exp - hoy) / (1000 * 60 * 60 * 24))
                });
            }
        });
    });

    return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

export async function obtenerConsumoJornada(jornadaId, authHeader) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    //consumir el servicio de core, en conreto los movimientos
    try {
        const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?subType=CONSUMO_JORNADA&jornadaId=${jornadaId}`,
            getAuthOptions(authHeader, { signal: controller.signal })
        );

        if (!response.ok) throw new Error('Error al consultar movimientos');

        const data = await response.json();

        //agrupar los medicamentos consumidos
        const consumo = {};
        data.data.forEach(mov => {
            mov.detail.forEach(item => {
                const key = item.medicineId;
                if (!consumo[key]) {
                    consumo[key] = {
                        medicineId: item.medicineId,
                        nombre: item.medicationSnapshot.name,
                        concentracion: item.medicationSnapshot.concentration,
                        totalConsumido: 0
                    };
                }
                consumo[key].totalConsumido += item.quantity;
            });
        });
        return Object.values(consumo);
    } catch (err) {
        if (err.name == 'AbortError') {
            throw new Error('el servicio de movimiento / core no responde (timeout)');
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

//stock actual
export async function obtenerStockActual(authHeader) {
    const data = await fetchJson(
        `${SERVICES.core.baseUrl}/api/v1/inventario-central`,
        authHeader,
        'Error al consultar inventario central'
    );

    return data.data.map(inv => ({
        medicineId: getMedicineId(inv),
        nombre: getMedicineValue(inv, 'name'),
        concentracion: getMedicineValue(inv, 'concentration'),
        stockTotal: inv.totalStock,
        lotes: inv.lots.map(l => ({
            batch: l.batch,
            stock: l.stock,
            expirationDate: l.expirationDate
        }))
    }));
}

//medicamentos proximos a vencer
//medicamentos cuyos lotes vencen dentro de los próximos X días - por defecto 30
export async function obtenerProximosAVencer(dias = 30, authHeader) {
    const data = await fetchJson(
        `${SERVICES.core.baseUrl}/api/v1/inventario-central`,
        authHeader,
        'Error al consultar el inventario central'
    );
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + dias);

    const proximosAVencer = [];
    data.data.forEach(inv => {
        inv.lots.forEach(lote => {
            const exp = new Date(lote.expirationDate);
            if (exp <= limite){
                proximosAVencer.push({
                    medicineId: getMedicineId(inv),
                    nombre: getMedicineValue(inv, 'name'),
                    concentracion: getMedicineValue(inv, 'concentration'),
                    batch: lote.batch,
                    stock: lote.stock,
                    expirationDate: lote.expirationDate
                });
            }
        });
    })
    return proximosAVencer;
}

// ver todos los movimientos del inventario central
export async function obtenerMovimientos({ fecha, jornadaId, tipo, usuario, page, limit }, authHeader) {
    let url = `${SERVICES.core.baseUrl}/api/v1/movimientos?`;
    if (fecha) url += `fecha=${fecha}&`;
    if (jornadaId) url += `jornadaId=${jornadaId}&`;
    if (tipo) url += `subType=${tipo}&`;
    if (usuario) url += `userId=${usuario}&`;
    if (page) url += `page=${page}&`;
    if (limit) url += `limit=${limit}&`;

    const [data, users] = await Promise.all([
        fetchJson(url, authHeader, 'Error al consultar los movimientos'),
        fetchAuthUsers(authHeader),
    ]);

    return {
        ...data,
        data: enrichMovementEntriesWithUserNames(data.data || [], users),
    };
}

export function buildDashboardMetrics({ medicines = [], workdays = [], movements = [], inventory = [], users = [] } = {}) {
    const stockAlerts = getLowStockAlerts(inventory);
    const expirationAlerts = getExpirationAlerts(inventory, 60);
    const activeWorkdays = workdays.filter(jornada => jornada.status === 'IN_PROGRESS').length;
    const plannedWorkdays = workdays.filter(jornada => jornada.status === 'PLANNED').length;
    const finishedWorkdays = workdays.filter(jornada => ['FINISHED', 'COMPLETED'].includes(jornada.status)).length;
    const doctors = (users || []).filter(user => user.rol === 'MEDICO');
    const activeDoctors = doctors.filter(user => user.isActive !== false).length;

    const stockPorCategoria = inventory.reduce((acc, item) => {
        const rawCategory = item.medicineId?.category ?? item.category;
        const categoryNames = Array.isArray(rawCategory)
            ? rawCategory.map((name) => String(name).trim()).filter(Boolean)
            : (rawCategory ? [String(rawCategory).trim()] : []);
        const categoryName = categoryNames.length ? categoryNames.join(', ') : 'Sin categoría';
        const existing = acc.find(entry => entry.name === categoryName);
        if (existing) {
            existing.value += Number(item.totalStock || 0);
            return acc;
        }

        acc.push({ name: categoryName, value: Number(item.totalStock || 0) });
        return acc;
    }, []);

    const currentMonth = new Date().getMonth();
    const monthlyMovements = movements.filter((movement) => {
        const date = new Date(movement.createdAt || movement.appliedAt);
        return !Number.isNaN(date.getTime()) && date.getMonth() === currentMonth;
    }).length;

    return {
        totalMedicamentos: medicines.length,
        totalMedicos: doctors.length,
        medicosActivos: activeDoctors,
        totalJornadas: workdays.length,
        jornadasActivas: activeWorkdays,
        jornadasPlanificadas: plannedWorkdays,
        jornadasFinalizadas: finishedWorkdays,
        totalMovimientos: movements.length,
        movimientosMes: monthlyMovements,
        stockBajo: stockAlerts.length,
        alertasVencimiento: expirationAlerts.length,
        medicamentosVencidos: expirationAlerts.filter(alerta => alerta.diasRestantes < 0).length,
        movimientosPorMes: getMonthlyMovements(movements),
        alertasStock: stockAlerts,
        vencimientosProximos: expirationAlerts,
        stockPorCategoria,
        estadisticasJornadas: {
            total: workdays.length,
            activas: activeWorkdays,
            planificadas: plannedWorkdays,
            finalizadas: finishedWorkdays
        },
        actualizadoEn: new Date().toISOString()
    };
}

export async function obtenerMetricasGenerales(authHeader) {
    const [medicamentos, jornadas, movimientos, inventario, usuarios] = await Promise.all([
        fetch(`${SERVICES.core.baseUrl}/api/v1/medicines`, getAuthOptions(authHeader)),
        fetch(`${SERVICES.workday.baseUrl}/api/v1/workdays`, getAuthOptions(authHeader)),
        fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?limit=1000`, getAuthOptions(authHeader)),
        fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`, getAuthOptions(authHeader)),
        fetch(`${SERVICES.auth.baseUrl || 'http://localhost:3020'}/api/auth/users`, getAuthOptions(authHeader))
    ]);

    if (!medicamentos.ok) throw new Error('Error al consultar medicamentos');
    if (!jornadas.ok) throw new Error('Error al consultar jornadas');
    if (!movimientos.ok) throw new Error('Error al consultar movimientos');
    if (!inventario.ok) throw new Error('Error al consultar inventario');
    if (!usuarios.ok) throw new Error('Error al consultar usuarios');

    const [dataMed, dataJor, dataMov, dataInv, dataUsers] = await Promise.all([
        medicamentos.json(),
        jornadas.json(),
        movimientos.json(),
        inventario.json(),
        usuarios.json()
    ]);

    const workdays = dataJor.data || [];
    const movements = dataMov.data || [];
    const inventory = dataInv.data || [];
    const medicines = dataMed.data || [];
    const users = dataUsers.users || [];
    const recentWorkdays = [...workdays]
        .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
        .slice(0, 5)
        .map(jornada => ({
            _id: jornada._id,
            name: jornada.name,
            startDate: jornada.startDate,
            location: getWorkdayLocation(jornada),
            manager: jornada.manager?.name || 'Sin responsable',
            status: jornada.status
        }));

    const metrics = buildDashboardMetrics({ medicines, workdays, movements, inventory, users });

    return {
        ...metrics,
        alertasStock: metrics.alertasStock,
        vencimientosProximos: metrics.vencimientosProximos,
        jornadasRecientes: recentWorkdays,
        actualizadoEn: metrics.actualizadoEn
    };
}

export async function obtenerEstadisticasJornada(jornadaId, authHeader) {
    const [movimientos, inventario] = await Promise.all([
        fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?jornadaId=${jornadaId}`, getAuthOptions(authHeader)),
        fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-jornada/${jornadaId}`, getAuthOptions(authHeader))
    ]);

    if (!movimientos.ok) throw new Error('Error al consultar movimientos');
    if (!inventario.ok) throw new Error('Error al consultar inventario de jornada');

    const [dataMov, dataInv] = await Promise.all([
        movimientos.json(),
        inventario.json()
    ]);

    const totalMovimientos = dataMov.data?.length || 0;

    // Medicamentos consumidos
    const consumidos = {};
    dataMov.data
        .filter(mov => mov.subType === 'CONSUMO_JORNADA')
        .forEach(mov => {
        mov.detail.forEach(item => {
            const key = item.medicineId;
            if (!consumidos[key]) {
            consumidos[key] = {
                medicineId: item.medicineId,
                nombre: item.medicationSnapshot.name,
                concentracion: item.medicationSnapshot.concentration,
                totalConsumido: 0
            };
            }
            consumidos[key].totalConsumido += item.quantity;
        });
        });

    // Medicamentos restantes en inventario de jornada
    const restantes = dataInv.data?.map(inv => ({
        medicineId: inv.medicineId,
        stockTotal: inv.totalStock,
        lotes: inv.lots
    })) || [];

    return {
        jornadaId,
        totalMovimientos,
        medicamentosConsumidos: Object.values(consumidos),
        medicamentosRestantes: restantes
    };
}

export async function obtenerAlertasStockBajo(authHeader) {
    const data = await fetchJson(
        `${SERVICES.core.baseUrl}/api/v1/inventario-central`,
        authHeader,
        'Error al consultar inventario central'
    );
    return getLowStockAlerts(data.data || []);
}

export async function obtenerAlertasVencimiento(dias = 30, authHeader) {
    const data = await fetchJson(
        `${SERVICES.core.baseUrl}/api/v1/inventario-central`,
        authHeader,
        'Error al consultar inventario central'
    );
    return getExpirationAlerts(data.data || [], dias);
}

const MOVIMIENTO_COLUMNS = [
    { key: 'Tipo', header: 'Tipo', width: 12, weight: 1 },
    { key: 'SubTipo', header: 'Subtipo', width: 18, weight: 1.3 },
    { key: 'Medicamento', header: 'Medicamento', width: 22, weight: 1.6 },
    { key: 'Concentracion', header: 'Concentración', width: 14, weight: 1.1 },
    { key: 'Lote', header: 'Lote', width: 12, weight: 1 },
    { key: 'Cantidad', header: 'Cantidad', width: 10, weight: 0.8 },
    { key: 'FechaVencimiento', header: 'Vencimiento', width: 14, weight: 1 },
    { key: 'Estado', header: 'Estado', width: 12, weight: 1 },
    { key: 'Usuario', header: 'Usuario', width: 18, weight: 1.3 },
    { key: 'Fecha', header: 'Fecha', width: 12, weight: 1 },
];

const STOCK_COLUMNS = [
    { key: 'Medicamento', header: 'Medicamento', width: 22, weight: 1.6 },
    { key: 'Concentracion', header: 'Concentración', width: 14, weight: 1.1 },
    { key: 'Lote', header: 'Lote', width: 12, weight: 1 },
    { key: 'Stock', header: 'Stock', width: 10, weight: 0.8 },
    { key: 'FechaVencimiento', header: 'Vencimiento', width: 14, weight: 1 },
    { key: 'StockTotal', header: 'Stock total', width: 12, weight: 1 },
    { key: 'StockMinimo', header: 'Stock mínimo', width: 12, weight: 1 },
];

const JORNADA_COLUMNS = [
    { key: 'Nombre', header: 'Nombre', width: 20, weight: 1.5 },
    { key: 'Descripcion', header: 'Descripción', width: 22, weight: 1.4 },
    { key: 'FechaInicio', header: 'Inicio', width: 12, weight: 1 },
    { key: 'FechaFin', header: 'Fin', width: 12, weight: 1 },
    { key: 'Departamento', header: 'Departamento', width: 14, weight: 1.1 },
    { key: 'Municipio', header: 'Municipio', width: 14, weight: 1.1 },
    { key: 'Direccion', header: 'Dirección', width: 18, weight: 1.2 },
    { key: 'Responsable', header: 'Responsable', width: 16, weight: 1.2 },
    { key: 'PacientesEstimados', header: 'Pacientes est.', width: 12, weight: 0.9 },
    { key: 'MedicamentosEstimados', header: 'Medicamentos est.', width: 14, weight: 0.9 },
    { key: 'Estado', header: 'Estado', width: 14, weight: 1 },
];

const CONSUMO_COLUMNS = [
    { key: 'JornadaId', header: 'Jornada', width: 16, weight: 1.2 },
    { key: 'Medicamento', header: 'Medicamento', width: 22, weight: 1.6 },
    { key: 'Concentracion', header: 'Concentración', width: 14, weight: 1.1 },
    { key: 'Lote', header: 'Lote', width: 12, weight: 1 },
    { key: 'Cantidad', header: 'Cantidad', width: 10, weight: 0.8 },
    { key: 'FechaVencimiento', header: 'Vencimiento', width: 14, weight: 1 },
    { key: 'Usuario', header: 'Usuario', width: 18, weight: 1.3 },
    { key: 'Fecha', header: 'Fecha', width: 12, weight: 1 },
];

function asList(value) {
    return Array.isArray(value) ? value : [];
}

export function buildMovimientoExportRows(movements = []) {
    return asList(movements).flatMap((mov) =>
        asList(mov.detail).map((item) => ({
            Tipo: mov.type,
            SubTipo: mov.subType,
            Medicamento: item.medicationSnapshot?.name,
            Concentracion: item.medicationSnapshot?.concentration,
            Lote: item.batch,
            Cantidad: item.quantity,
            FechaVencimiento: formatDateGT(item.expirationDate),
            Estado: mov.status,
            Usuario: mov.userDisplayName,
            Fecha: formatDateGT(mov.createdAt),
        })),
    );
}

export function buildStockExportRows(inventory = []) {
    return asList(inventory).flatMap((inv) =>
        asList(inv.lots).map((lote) => ({
            Medicamento: inv.medicineId?.name,
            Concentracion: inv.medicineId?.concentration,
            Lote: lote.batch,
            Stock: lote.stock,
            FechaVencimiento: formatDateGT(lote.expirationDate),
            StockTotal: inv.totalStock,
            StockMinimo: inv.minimumStock,
        })),
    );
}

export function buildJornadaExportRows(workdays = []) {
    return asList(workdays).map((jornada) => ({
        Nombre: jornada.name,
        Descripcion: jornada.description,
        FechaInicio: formatDateGT(jornada.startDate),
        FechaFin: formatDateGT(jornada.endDate),
        Departamento: jornada.location?.department,
        Municipio: jornada.location?.municipality,
        Direccion: jornada.location?.address,
        Responsable: jornada.manager?.name,
        PacientesEstimados: jornada.estimatedPatients,
        MedicamentosEstimados: jornada.estimatedMedicines,
        Estado: jornada.status,
    }));
}

export function buildConsumoExportRows(movements = []) {
    return asList(movements).flatMap((mov) =>
        asList(mov.detail).map((item) => ({
            JornadaId: mov.destination?.id,
            Medicamento: item.medicationSnapshot?.name,
            Concentracion: item.medicationSnapshot?.concentration,
            Lote: item.batch,
            Cantidad: item.quantity,
            FechaVencimiento: formatDateGT(item.expirationDate),
            Usuario: mov.userDisplayName,
            Fecha: formatDateGT(mov.createdAt),
        })),
    );
}

export async function exportarMovimientosExcel(authHeader) {
    const [data, users] = await Promise.all([
        fetchJson(
            `${SERVICES.core.baseUrl}/api/v1/movimientos`,
            authHeader,
            'Error al consultar movimientos'
        ),
        fetchAuthUsers(authHeader),
    ]);
    const movements = enrichMovementEntriesWithUserNames(data.data || [], users);

    return buildExcelBuffer({
        title: 'Reporte de Movimientos',
        sheet: 'Movimientos',
        columns: MOVIMIENTO_COLUMNS,
        rows: buildMovimientoExportRows(movements),
    });
}

export async function exportarStockExcel(authHeader) {
    const data = await fetchJson(
        `${SERVICES.core.baseUrl}/api/v1/inventario-central`,
        authHeader,
        'Error al consultar inventario'
    );

    return buildExcelBuffer({
        title: 'Reporte de Stock Actual',
        sheet: 'Stock',
        columns: STOCK_COLUMNS,
        rows: buildStockExportRows(data.data),
    });
}

export async function exportarJornadasExcel(authHeader) {
    const data = await fetchJson(
        `${SERVICES.workday.baseUrl}/api/v1/workdays`,
        authHeader,
        'Error al consultar jornadas'
    );

    return buildExcelBuffer({
        title: 'Reporte de Jornadas',
        sheet: 'Jornadas',
        columns: JORNADA_COLUMNS,
        rows: buildJornadaExportRows(data.data),
    });
}

export async function exportarConsumoExcel(authHeader) {
    const [data, users] = await Promise.all([
        fetchJson(
            `${SERVICES.core.baseUrl}/api/v1/movimientos?subType=CONSUMO_JORNADA`,
            authHeader,
            'Error al consultar consumo'
        ),
        fetchAuthUsers(authHeader),
    ]);
    const movements = enrichMovementEntriesWithUserNames(data.data || [], users);

    return buildExcelBuffer({
        title: 'Reporte de Consumo',
        sheet: 'Consumo',
        columns: CONSUMO_COLUMNS,
        rows: buildConsumoExportRows(movements),
    });
}

export async function exportarMovimientosPDF(authHeader) {
    const [data, users] = await Promise.all([
        fetchJson(
            `${SERVICES.core.baseUrl}/api/v1/movimientos`,
            authHeader,
            'Error al consultar movimientos'
        ),
        fetchAuthUsers(authHeader),
    ]);
    const movements = enrichMovementEntriesWithUserNames(data.data || [], users);

    return buildPdfBuffer({
        title: 'Reporte de Movimientos',
        columns: MOVIMIENTO_COLUMNS,
        rows: buildMovimientoExportRows(movements),
    });
}

export async function exportarStockPDF(authHeader) {
    const data = await fetchJson(
        `${SERVICES.core.baseUrl}/api/v1/inventario-central`,
        authHeader,
        'Error al consultar inventario'
    );

    return buildPdfBuffer({
        title: 'Reporte de Stock Actual',
        columns: STOCK_COLUMNS,
        rows: buildStockExportRows(data.data),
    });
}

export async function exportarJornadasPDF(authHeader) {
    const data = await fetchJson(
        `${SERVICES.workday.baseUrl}/api/v1/workdays`,
        authHeader,
        'Error al consultar jornadas'
    );

    return buildPdfBuffer({
        title: 'Reporte de Jornadas',
        columns: JORNADA_COLUMNS,
        rows: buildJornadaExportRows(data.data),
    });
}

export async function exportarConsumoPDF(authHeader) {
    const [data, users] = await Promise.all([
        fetchJson(
            `${SERVICES.core.baseUrl}/api/v1/movimientos?subType=CONSUMO_JORNADA`,
            authHeader,
            'Error al consultar consumo'
        ),
        fetchAuthUsers(authHeader),
    ]);
    const movements = enrichMovementEntriesWithUserNames(data.data || [], users);

    return buildPdfBuffer({
        title: 'Reporte de Consumo',
        columns: CONSUMO_COLUMNS,
        rows: buildConsumoExportRows(movements),
    });
}

export function enrichAuditEntriesWithUserNames(entries = [], users = []) {
    const userById = new Map(users.map((user) => [String(user._id), user]));

    return (entries || []).map((entry) => {
        const displayName = getUserDisplayName(
            userById.get(String(entry.userId)),
            entry.userId || 'Sistema',
        );

        return {
            ...entry,
            userName: displayName,
            userDisplayName: displayName,
        };
    });
}

export async function obtenerAuditorias({ userId, action, module, fecha }, authHeader) {
    let url = `${SERVICES.core.baseUrl}/api/v1/auditoria?`;
    if (userId) url += `userId=${userId}&`;
    if (action) url += `action=${action}&`;
    if (module) url += `module=${module}&`;
    if (fecha) url += `fecha=${fecha}&`;

    const [data, users] = await Promise.all([
        fetchJson(url, authHeader, 'Error al consultar auditorias'),
        fetchAuthUsers(authHeader),
    ]);
    return enrichAuditEntriesWithUserNames(data.data || [], users);
}

export async function validarConsistenciaDatos(authHeader) {
    const [inventario, movimientos] = await Promise.all([
        fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`, getAuthOptions(authHeader)),
        fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos`, getAuthOptions(authHeader))
    ]);

    if (!inventario.ok) throw new Error('Error al consultar inventario');
    if (!movimientos.ok) throw new Error('Error al consultar movimientos');

    const [dataInv, dataMov] = await Promise.all([
        inventario.json(),
        movimientos.json()
    ]);

    const inconsistencias = [];

    // Validar que stockTotal coincida con la suma de lotes
    dataInv.data.forEach(inv => {
        const sumLotes = inv.lots.reduce((acc, lote) => acc + lote.stock, 0);
        if (sumLotes !== inv.totalStock) {
        inconsistencias.push({
            tipo: 'STOCK_INCONSISTENTE',
            medicamento: inv.medicineId?.name,
            medicineId: inv.medicineId?._id,
            stockTotal: inv.totalStock,
            sumLotes,
            diferencia: inv.totalStock - sumLotes
        });
        }
    });

    // Validar que no haya movimientos sin detalle
    dataMov.data.forEach(mov => {
        if (!mov.detail || mov.detail.length === 0) {
        inconsistencias.push({
            tipo: 'MOVIMIENTO_SIN_DETALLE',
            movimientoId: mov._id,
            tipo: mov.type,
            fecha: mov.createdAt
        });
        }
    });

    return {
        consistente: inconsistencias.length === 0,
        totalInconsistencias: inconsistencias.length,
        inconsistencias
    };
}
