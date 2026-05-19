import { getConsumoJornada, getStockActual, getProximosAVencer, getMovimientos, getMetricasGenerales, getEstadisticasJornada, getAlertasStockBajo, getAlertasVencimiento, exportMovimientosExcel, exportStockExcel, exportConsumoExcel, exportJornadasExcel, exportMovimientosPDF, exportStockPDF, exportConsumoPDF, exportJornadasPDF, getAuditorias, getConsistenciaDatos } from "./reports.controller.js";

const reportesRoutes = async (fastify) =>{
    fastify.get('/reportes/consumo-jornada/:id', getConsumoJornada);
    fastify.get('/reportes/stock', getStockActual); //vencimientos?dias=35 elegir cuantos dias consultar
    fastify.get('/reportes/vencimientos', getProximosAVencer);
    fastify.get('/reportes/movimientos', getMovimientos);
    fastify.get('/reportes/dashboard', getMetricasGenerales);
    fastify.get('/reportes/jornada/:jornadaId', getEstadisticasJornada);
    fastify.get('/reportes/alertas/stock-bajo', getAlertasStockBajo);
    fastify.get('/reportes/alertas/vencimientos', getAlertasVencimiento);
    fastify.get('/reportes/exportar/movimientos/excel', exportMovimientosExcel);
    fastify.get('/reportes/exportar/stock/excel', exportStockExcel);
    fastify.get('/reportes/exportar/jornadas/excel', exportJornadasExcel);
    fastify.get('/reportes/exportar/consumo/excel', exportConsumoExcel);
    fastify.get('/reportes/exportar/movimientos/pdf', exportMovimientosPDF);
    fastify.get('/reportes/exportar/stock/pdf', exportStockPDF);
    fastify.get('/reportes/exportar/jornadas/pdf', exportJornadasPDF);
    fastify.get('/reportes/exportar/consumo/pdf', exportConsumoPDF);
    fastify.get('/reportes/auditoria', getAuditorias);
    fastify.get('/reportes/consistencia', getConsistenciaDatos);
}


export default reportesRoutes;