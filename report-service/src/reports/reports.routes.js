import { getConsumoJornada, getStockActual, getProximosAVencer, getMovimientos, getMetricasGenerales, getEstadisticasJornada, getAlertasStockBajo, getAlertasVencimiento } from "./reports.controller.js";

const reportesRoutes = async (fastify) =>{
    fastify.get('/reportes/consumo-jornada/:id', getConsumoJornada);
    fastify.get('/reportes/stock', getStockActual); //vencimientos?dias=35 elegir cuantos dias consultar
    fastify.get('/reportes/vencimientos', getProximosAVencer);
    fastify.get('/reportes/movimientos', getMovimientos);
    fastify.get('/reportes/dashboard', getMetricasGenerales);
    fastify.get('/reportes/jornada/:jornadaId', getEstadisticasJornada);
    fastify.get('/reportes/alertas/stock-bajo', getAlertasStockBajo);
    fastify.get('/reportes/alertas/vencimientos', getAlertasVencimiento);
}


export default reportesRoutes;