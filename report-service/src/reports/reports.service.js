import { SERVICES } from '../config/services.js';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export async function obtenerConsumoJornada(jornadaId) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    //consumir el servicio de core, en conreto los movimientos
    try {
        const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?subType=CONSUMO_JORNADA&jornadaId=${jornadaId}`,
            { signal: controller.signal }
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
export async function obtenerStockActual() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`);
    if (!response.ok) throw new Error("Error al consultar inventario central");
    const data = await response.json();

    return data.data.map(inv => ({
        medicineId: inv.medicineId._id, //devuleve solo el id del mediaento y no el objeto completo
        nombre: inv.medicineId?.name,
        concentracion: inv.medicineId?.concentration,
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
export async function obtenerProximosAVencer(dias = 30) {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`);
    if (!response.ok) throw new Error('Error al consultar el inventario central');

    const data = await response.json();
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + dias);

    const proximosAVencer = [];
    data.data.forEach(inv => {
        inv.lots.forEach(lote => {
            const exp = new Date(lote.expirationDate);
            if (exp <= limite){
                proximosAVencer.push({
                    medicineId: inv.medicineId._id,
                    nombre: inv.medicineId?.name,
                    concentracion: inv.medicineId?.concentration,
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
export async function obtenerMovimientos({ fecha, jornadaId, tipo, usuario, page, limit }) {
    let url = `${SERVICES.core.baseUrl}/api/v1/movimientos?`;
    if (fecha) url += `fecha=${fecha}&`;
    if (jornadaId) url += `jornadaId=${jornadaId}&`;
    if (tipo) url += `subType=${tipo}&`;
    if (usuario) url += `userId=${usuario}&`;
    if (page) url += `page=${page}&`;
    if (limit) url += `limit=${limit}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar los movimientos');
    const data = await response.json();
    return data;
}

export async function obtenerMetricasGenerales() {
    const [medicamentos, jornadas, movimientos, inventario] = await Promise.all([
        fetch(`${SERVICES.core.baseUrl}/api/v1/medicines`),
        fetch(`${SERVICES.workday.baseUrl}/api/v1/workdays`),
        fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos`),
        fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`)
    ]);

    if (!medicamentos.ok) throw new Error('Error al consultar medicamentos');
    if (!jornadas.ok) throw new Error('Error al consultar jornadas');
    if (!movimientos.ok) throw new Error('Error al consultar movimientos');
    if (!inventario.ok) throw new Error('Error al consultar inventario');

    const [dataMed, dataJor, dataMov, dataInv] = await Promise.all([
        medicamentos.json(),
        jornadas.json(),
        movimientos.json(),
        inventario.json()
    ]);

    const hoy = new Date();

    // Stock bajo — stockTotal <= stockMinimo
    const stockBajo = dataInv.data.filter(inv => inv.totalStock <= inv.minimumStock).length;

    // Medicamentos vencidos — lotes con expirationDate menor a hoy
    let medicamentosVencidos = 0;
    dataInv.data.forEach(inv => {
        inv.lots.forEach(lote => {
        if (new Date(lote.expirationDate) < hoy && lote.stock > 0) {
            medicamentosVencidos++;
        }
        });
    });

    return {
        totalMedicamentos: dataMed.data?.length || 0,
        totalJornadas: dataJor.data?.length || 0,
        totalMovimientos: dataMov.total || dataMov.data?.length || 0,
        stockBajo,
        medicamentosVencidos
    };
}

export async function obtenerEstadisticasJornada(jornadaId) {
    const [movimientos, inventario] = await Promise.all([
        fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?jornadaId=${jornadaId}`),
        fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-jornada/${jornadaId}`)
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

export async function obtenerAlertasStockBajo() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`);
    if (!response.ok) throw new Error('Error al consultar inventario central');

    const data = await response.json();

    const alertas = data.data
        .filter(inv => inv.totalStock <= inv.minimumStock)
        .map(inv => ({
        medicineId: inv.medicineId._id,
        nombre: inv.medicineId?.name,
        concentracion: inv.medicineId?.concentration,
        stockTotal: inv.totalStock,
        stockMinimo: inv.minimumStock
        }));

    return alertas;
}

export async function obtenerAlertasVencimiento(dias = 30) {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`);
    if (!response.ok) throw new Error('Error al consultar inventario central');

    const data = await response.json();
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + dias);

    const alertas = [];
    data.data.forEach(inv => {
        inv.lots.forEach(lote => {
        const exp = new Date(lote.expirationDate);
        if (exp <= limite && lote.stock > 0) {
            alertas.push({
            medicineId: inv.medicineId._id,
            nombre: inv.medicineId?.name,
            concentracion: inv.medicineId?.concentration,
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

export async function exportarMovimientosExcel() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos`);
    if (!response.ok) throw new Error('Error al consultar movimientos');

    const data = await response.json();

    const filas = data.data.flatMap(mov =>
        mov.detail.map(item => ({
        Tipo: mov.type,
        SubTipo: mov.subType,
        Medicamento: item.medicationSnapshot.name,
        Concentracion: item.medicationSnapshot.concentration,
        Lote: item.batch,
        Cantidad: item.quantity,
        FechaVencimiento: new Date(item.expirationDate).toLocaleDateString(),
        Estado: mov.status,
        Usuario: mov.userId,
        Fecha: new Date(mov.createdAt).toLocaleDateString()
        }))
    );

    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function exportarStockExcel() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`);
    if (!response.ok) throw new Error('Error al consultar inventario');

    const data = await response.json();

    const filas = data.data.flatMap(inv =>
        inv.lots.map(lote => ({
        Medicamento: inv.medicineId?.name,
        Concentracion: inv.medicineId?.concentration,
        Lote: lote.batch,
        Stock: lote.stock,
        FechaVencimiento: new Date(lote.expirationDate).toLocaleDateString(),
        StockTotal: inv.totalStock,
        StockMinimo: inv.minimumStock
        }))
    );

    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function exportarJornadasExcel() {
    const response = await fetch(`${SERVICES.workday.baseUrl}/api/v1/workdays`);
    if (!response.ok) throw new Error('Error al consultar jornadas');

    const data = await response.json();

    const filas = data.data.map(jornada => ({
        Nombre: jornada.name,
        Descripcion: jornada.description,
        FechaInicio: new Date(jornada.startDate).toLocaleDateString(),
        FechaFin: new Date(jornada.endDate).toLocaleDateString(),
        Departamento: jornada.location?.department,
        Municipio: jornada.location?.municipality,
        Direccion: jornada.location?.address,
        Responsable: jornada.manager?.name,
        PacientesEstimados: jornada.estimatedPatients,
        MedicamentosEstimados: jornada.estimatedMedicines,
        Estado: jornada.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jornadas');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function exportarConsumoExcel() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?subType=CONSUMO_JORNADA`);
    if (!response.ok) throw new Error('Error al consultar consumo');

    const data = await response.json();

    const filas = data.data.flatMap(mov =>
        mov.detail.map(item => ({
        JornadaId: mov.destination?.id,
        Medicamento: item.medicationSnapshot.name,
        Concentracion: item.medicationSnapshot.concentration,
        Lote: item.batch,
        Cantidad: item.quantity,
        FechaVencimiento: new Date(item.expirationDate).toLocaleDateString(),
        Usuario: mov.userId,
        Fecha: new Date(mov.createdAt).toLocaleDateString()
        }))
    );

    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consumo');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function exportarMovimientosPDF() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos`);
    if (!response.ok) throw new Error('Error al consultar movimientos');

    const data = await response.json();

    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 30 });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(18).text('Reporte de Movimientos', { align: 'center' });
        doc.moveDown();

        data.data.forEach(mov => {
        doc.fontSize(11).text(`Tipo: ${mov.type} - ${mov.subType}`);
        doc.text(`Estado: ${mov.status}`);
        doc.text(`Usuario: ${mov.userId}`);
        doc.text(`Fecha: ${new Date(mov.createdAt).toLocaleDateString()}`);
        mov.detail.forEach(item => {
            doc.text(`  Medicamento: ${item.medicationSnapshot.name} | Lote: ${item.batch} | Cantidad: ${item.quantity}`);
        });
        doc.moveDown(0.5);
        });

        doc.end();
    });
}

export async function exportarStockPDF() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`);
    if (!response.ok) throw new Error('Error al consultar inventario');

    const data = await response.json();

    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 30 });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(18).text('Reporte de Stock Actual', { align: 'center' });
        doc.moveDown();

        data.data.forEach(inv => {
        doc.fontSize(11).text(`Medicamento: ${inv.medicineId?.name} - ${inv.medicineId?.concentration}`);
        doc.text(`Stock Total: ${inv.totalStock} | Stock Mínimo: ${inv.minimumStock}`);
        inv.lots.forEach(lote => {
            doc.text(`  Lote: ${lote.batch} | Stock: ${lote.stock} | Vence: ${new Date(lote.expirationDate).toLocaleDateString()}`);
        });
        doc.moveDown(0.5);
        });

        doc.end();
    });
}

export async function exportarJornadasPDF() {
    const response = await fetch(`${SERVICES.workday.baseUrl}/api/v1/workdays`);
    if (!response.ok) throw new Error('Error al consultar jornadas');

    const data = await response.json();

    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 30 });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(18).text('Reporte de Jornadas', { align: 'center' });
        doc.moveDown();

        data.data.forEach(jornada => {
        doc.fontSize(11).text(`Nombre: ${jornada.name}`);
        doc.text(`Descripción: ${jornada.description}`);
        doc.text(`Fecha: ${new Date(jornada.startDate).toLocaleDateString()} - ${new Date(jornada.endDate).toLocaleDateString()}`);
        doc.text(`Ubicación: ${jornada.location?.department}, ${jornada.location?.municipality}`);
        doc.text(`Responsable: ${jornada.manager?.name}`);
        doc.text(`Estado: ${jornada.status}`);
        doc.moveDown(0.5);
        });

        doc.end();
    });
}

export async function exportarConsumoPDF() {
    const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?subType=CONSUMO_JORNADA`);
    if (!response.ok) throw new Error('Error al consultar consumo');

    const data = await response.json();

    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 30 });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(18).text('Reporte de Consumo', { align: 'center' });
        doc.moveDown();

        data.data.forEach(mov => {
        doc.fontSize(11).text(`Jornada: ${mov.destination?.id}`);
        doc.text(`Fecha: ${new Date(mov.createdAt).toLocaleDateString()}`);
        mov.detail.forEach(item => {
            doc.text(`  Medicamento: ${item.medicationSnapshot.name} | Lote: ${item.batch} | Cantidad: ${item.quantity}`);
        });
        doc.moveDown(0.5);
        });

        doc.end();
    });
}

export async function obtenerAuditorias({ userId, action, module, fecha }) {
    let url = `${SERVICES.core.baseUrl}/api/v1/auditoria?`;
    if (userId) url += `userId=${userId}&`;
    if (action) url += `action=${action}&`;
    if (module) url += `module=${module}&`;
    if (fecha) url += `fecha=${fecha}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar auditorías');

    const data = await response.json();
    return data.data;
}

export async function validarConsistenciaDatos() {
    const [inventario, movimientos] = await Promise.all([
        fetch(`${SERVICES.core.baseUrl}/api/v1/inventario-central`),
        fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos`)
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
