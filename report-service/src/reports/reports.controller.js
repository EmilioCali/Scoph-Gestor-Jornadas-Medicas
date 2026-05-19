import { obtenerConsumoJornada, obtenerStockActual, obtenerProximosAVencer, obtenerMovimientos, obtenerMetricasGenerales, obtenerEstadisticasJornada, obtenerAlertasStockBajo, obtenerAlertasVencimiento, exportarMovimientosExcel, exportarStockExcel, exportarConsumoExcel, exportarJornadasExcel, exportarMovimientosPDF, exportarStockPDF, exportarConsumoPDF, exportarJornadasPDF, obtenerAuditorias, validarConsistenciaDatos } from "./reports.service.js";
import { SERVICES } from '../config/services.js';
import { getPaginationParams, paginatedResponse } from '../utils/pagination.js';

export const getConsumoJornada = async (request, reply) => {
    try {
        const { jornadaId } = request.params;
        
        const response = await fetch(`${SERVICES.core.baseUrl}/api/v1/movimientos?subType=CONSUMO_JORNADA&originId=${jornadaId}`);
        if (!response.ok) {
            throw new Error("Error al consultar movimientos en core-service");
        }

        const data = await response.json();

        //extraer solo el detalle de cada movimiento
        const detalles = data.data.flatMap(mov => mov.detail);

        return reply.status(200).send({
            success: true,
            message: "Consumo de medicamentos por jornada",
            data: detalles
        });
    } catch (err) {
        return reply.status(400).send({
            success: false,
            message: "Error al consultar consumo",
            error: err.message
        });
    }
};


export const getStockActual = async (request, reply) => {
    try {
        const stock = await obtenerStockActual();
        return reply.status(200).send({ success: true, message: "Stock actual", data: stock });
    } catch (err) {
        return reply.status(400).send({ success: false, message: "Error al consultar stock", error: err.message });
    }
};

export const getProximosAVencer = async (request, reply) => {
    try {
        const dias = request.query.dias ? parseInt(request.query.dias) : 30; //por defecto 30 dias
        const proximos = await obtenerProximosAVencer(dias);
        return reply.status(200).send({
            success: true,
            message: 'Estos son los medicamentos proximos a vencer',
            data: proximos
        });
    } catch (err) {
        return reply.status(400).send({
            success: false,
            message: 'Error al consultar los vencimientos',
            error: err.message
        })
    }
}

export const getMovimientos = async (request, reply) => {
    try {
        const { fecha, jornadaId, tipo, usuario } = request.query;
        const { page, limit } = getPaginationParams(request.query);

        const data = await obtenerMovimientos({ fecha, jornadaId, tipo, usuario, page, limit });

        return reply.status(200).send({
        success: true,
        message: 'Movimientos de inventario',
        ...paginatedResponse(data.data, data.total || data.data?.length, page, limit)
        });
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al consultar los movimientos',
        error: err.message
        });
    }
};

export const getMetricasGenerales = async (request, reply) => {
    try {
        const metricas = await obtenerMetricasGenerales();
        return reply.status(200).send({
        success: true,
        message: 'Métricas generales del sistema',
        data: metricas
        });
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al obtener métricas generales',
        error: err.message
        });
    }
};

export const getEstadisticasJornada = async (request, reply) => {
    try {
        const { jornadaId } = request.params;
        const stats = await obtenerEstadisticasJornada(jornadaId);
        return reply.status(200).send({
        success: true,
        message: 'Estadísticas de la jornada',
        data: stats
        });
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al obtener estadísticas de la jornada',
        error: err.message
        });
    }
};

export const getAlertasStockBajo = async (request, reply) => {
    try {
        const alertas = await obtenerAlertasStockBajo();
        return reply.status(200).send({
        success: true,
        message: 'Alertas de bajo stock',
        data: alertas
        });
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al obtener alertas de stock bajo',
        error: err.message
        });
    }
};

export const getAlertasVencimiento = async (request, reply) => {
    try {
        const dias = request.query.dias ? parseInt(request.query.dias) : 30;
        const alertas = await obtenerAlertasVencimiento(dias);
        return reply.status(200).send({
        success: true,
        message: 'Alertas de medicamentos próximos a vencer',
        data: alertas
        });
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al obtener alertas de vencimiento',
        error: err.message
        });
    }
};

export const exportMovimientosExcel = async (request, reply) => {
    try {
        const buffer = await exportarMovimientosExcel();
        return reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', 'attachment; filename=movimientos.xlsx')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar movimientos a Excel',
        error: err.message
        });
    }
    };

export const exportStockExcel = async (request, reply) => {
    try {
        const buffer = await exportarStockExcel();
        return reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', 'attachment; filename=stock.xlsx')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar stock a Excel',
        error: err.message
        });
    }
};

export const exportJornadasExcel = async (request, reply) => {
    try {
        const buffer = await exportarJornadasExcel();
        return reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', 'attachment; filename=jornadas.xlsx')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar jornadas a Excel',
        error: err.message
        });
    }
};

export const exportConsumoExcel = async (request, reply) => {
    try {
        const buffer = await exportarConsumoExcel();
        return reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', 'attachment; filename=consumo.xlsx')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar consumo a Excel',
        error: err.message
        });
    }
};

export const exportMovimientosPDF = async (request, reply) => {
    try {
        const buffer = await exportarMovimientosPDF();
        return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename=movimientos.pdf')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar movimientos a PDF',
        error: err.message
        });
    }
};

export const exportStockPDF = async (request, reply) => {
    try {
        const buffer = await exportarStockPDF();
        return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename=stock.pdf')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar stock a PDF',
        error: err.message
        });
    }
};

export const exportJornadasPDF = async (request, reply) => {
    try {
        const buffer = await exportarJornadasPDF();
        return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename=jornadas.pdf')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar jornadas a PDF',
        error: err.message
        });
    }
};

export const exportConsumoPDF = async (request, reply) => {
    try {
        const buffer = await exportarConsumoPDF();
        return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename=consumo.pdf')
        .send(buffer);
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al exportar consumo a PDF',
        error: err.message
        });
    }
};

export const getAuditorias = async (request, reply) => {
    try {
        const { userId, action, module, fecha } = request.query;
        const auditorias = await obtenerAuditorias({ userId, action, module, fecha });
        return reply.status(200).send({
        success: true,
        message: 'Auditorías del sistema',
        data: auditorias
        });
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al consultar auditorías',
        error: err.message
        });
    }
};

export const getConsistenciaDatos = async (request, reply) => {
    try {
        const resultado = await validarConsistenciaDatos();
        return reply.status(200).send({
        success: true,
        message: 'Validación de consistencia de datos',
        data: resultado
        });
    } catch (err) {
        return reply.status(400).send({
        success: false,
        message: 'Error al validar consistencia',
        error: err.message
        });
    }
};