import { SERVICES } from '../config/services.js';
import * as XLSX from 'xlsx';

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
                        nombre: item.medicamentoSnapshot.name,
                        concentracion: item.medicamentoSnapshot.concentration,
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
export async function obtenerMovimientos({ fecha, jornadaId, tipo, usuario }){
    let url = `${SERVICES.core.baseUrl}/api/v1/movimientos?`;
    if(fecha) url += `fecha=${fecha}&`;
    if(jornadaId) url += `jornadaId=${jornadaId}&`;
    if(tipo) url += `tipo=${tipo}&`;
    if(usuario) url += `usuario=${usuario}&`;

    const response = await fetch(url);
    if(!response.ok) throw new Error('error al consultar los movimientos');
    const data = await response.json();
    return data.data;
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
        totalMovimientos: dataMov.data?.length || 0,
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