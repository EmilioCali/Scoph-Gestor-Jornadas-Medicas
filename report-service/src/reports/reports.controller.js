import { obtenerConsumoJornada, obtenerStockActual, obtenerProximosAVencer, obtenerMovimientos, obtenerMetricasGenerales } from "./reports.service.js";
import { SERVICES } from '../config/services.js';
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

export const getMovimientos = async (request, reply) =>{
    try {
        const { fecha, jornadaId, tipo, usuario } = request.query;
        const movimientos = await obtenerMovimientos({ fecha, jornadaId, tipo, usuario });
        return reply.status(200).send({
            success: true,
            message: 'Movimientos de inventario: ',
            data: movimientos
        });
    } catch (err) {
        return reply.status(400).send({
            success: false,
            message: 'Error al consultar tods los movimientos',
            error: err.message
        })
        
    }
}

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