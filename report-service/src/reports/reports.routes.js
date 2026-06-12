import {
    getConsumoJornada,
    getStockActual,
    getProximosAVencer,
    getMovimientos,
    getMetricasGenerales,
    getEstadisticasJornada,
    getAlertasStockBajo,
    getAlertasVencimiento,
    exportMovimientosExcel,
    exportStockExcel,
    exportConsumoExcel,
    exportJornadasExcel,
    exportMovimientosPDF,
    exportStockPDF,
    exportConsumoPDF,
    exportJornadasPDF,
    getAuditorias,
    getConsistenciaDatos
} from './reports.controller.js';
import { requireRole } from '../middlewares/authenticate.js';

const AUTHENTICATED_ROLES = ['ADMIN', 'MEDICO'];
const ADMIN_ONLY = ['ADMIN'];

const idParamSchema = (name = 'id') => ({
    type: 'object',
    required: [name],
    properties: {
        [name]: { type: 'string', example: '664f1a2b3c4d5e6f78909999' }
    }
});

const reportItemSchema = {
    type: 'object',
    additionalProperties: true
};

const successArrayResponseSchema = (messageExample) => ({
    type: 'object',
    additionalProperties: true,
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: messageExample },
        data: { type: 'array', items: reportItemSchema }
    }
});

const successObjectResponseSchema = (messageExample) => ({
    type: 'object',
    additionalProperties: true,
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: messageExample },
        data: { type: 'object', additionalProperties: true }
    }
});

const paginatedResponseSchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Movimientos de inventario' },
        data: { type: 'array', items: reportItemSchema },
        pagination: {
            type: 'object',
            additionalProperties: true,
            properties: {
                total: { type: 'integer', example: 25 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 3 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false }
            }
        }
    }
};

const badRequestErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error al consultar el reporte' },
        error: { type: 'string', example: 'Error al consultar inventario central' }
    }
};

const rateLimitErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: {
            type: 'string',
            example: 'Demasiadas peticiones desde esta IP, por favor intente nuevamenente despues de 60 segundos'
        },
        error: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
        retryAfter: { type: 'string', example: '1 minute' }
    }
};

const diasQuerySchema = {
    type: 'object',
    properties: {
        dias: { type: 'integer', minimum: 1, default: 30, example: 30 }
    }
};

const exportSchema = (summary, description, contentType) => ({
    tags: ['Exportaciones'],
    summary,
    description,
    response: {
        200: {
            description: 'Archivo descargable',
            content: {
                [contentType]: {
                    schema: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        },
        400: {
            ...badRequestErrorSchema,
            properties: {
                ...badRequestErrorSchema.properties,
                message: { type: 'string', example: 'Error al ' + summary.toLowerCase() }
            }
        },
        429: rateLimitErrorSchema
    }
});

const reportesRoutes = async (fastify) =>{
    fastify.get(
        '/reportes/consumo-jornada/:id',
        {
            preHandler: [requireRole(...AUTHENTICATED_ROLES)],
            schema: {
                tags: ['Reportes'],
                summary: 'Consultar consumo por jornada',
                description: 'Agrupa los medicamentos consumidos en una jornada medica a partir de sus movimientos.',
                params: idParamSchema('id'),
                response: {
                    200: successArrayResponseSchema('Consumo de medicamentos por jornada'),
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al consultar consumo' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getConsumoJornada
    );

    fastify.get(
        '/reportes/stock',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Reportes'],
                summary: 'Consultar stock actual',
                description: 'Retorna el stock central actual por medicamento y lote.',
                response: {
                    200: successArrayResponseSchema('Stock actual'),
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al consultar stock' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getStockActual
    );

    fastify.get(
        '/reportes/vencimientos',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Reportes'],
                summary: 'Consultar medicamentos proximos a vencer',
                description: 'Lista lotes con fecha de vencimiento dentro del rango indicado en dias.',
                querystring: diasQuerySchema,
                response: {
                    200: successArrayResponseSchema('Estos son los medicamentos proximos a vencer'),
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al consultar los vencimientos' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getProximosAVencer
    );

    fastify.get(
        '/reportes/movimientos',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Reportes'],
                summary: 'Consultar movimientos de inventario',
                description: 'Lista movimientos con paginacion y filtros opcionales.',
                querystring: {
                    type: 'object',
                    properties: {
                        fecha: { type: 'string', format: 'date', example: '2026-05-22' },
                        jornadaId: { type: 'string', example: '664f1a2b3c4d5e6f78909999' },
                        tipo: {
                            type: 'string',
                            enum: ['DONACION', 'COMPRA', 'RECETA', 'CONSUMO_JORNADA', 'ASIGNACION_JORNADA', 'RETORNO_JORNADA']
                        },
                        usuario: { type: 'string', example: 'usr_123456789abc' },
                        page: { type: 'integer', minimum: 1, default: 1 },
                        limit: { type: 'integer', minimum: 1, default: 10 }
                    }
                },
                response: {
                    200: paginatedResponseSchema,
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al consultar los movimientos' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getMovimientos
    );

    fastify.get(
        '/reportes/dashboard',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Reportes'],
                summary: 'Consultar metricas generales',
                description: 'Obtiene indicadores generales de medicamentos, jornadas, movimientos, stock bajo y vencimientos.',
                response: {
                    200: successObjectResponseSchema('Metricas generales del sistema'),
                    400: badRequestErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        getMetricasGenerales
    );

    fastify.get(
        '/reportes/jornada/:jornadaId',
        {
            preHandler: [requireRole(...AUTHENTICATED_ROLES)],
            schema: {
                tags: ['Reportes'],
                summary: 'Consultar estadisticas de jornada',
                description: 'Resume movimientos, medicamentos consumidos y medicamentos restantes en una jornada.',
                params: idParamSchema('jornadaId'),
                response: {
                    200: successObjectResponseSchema('Estadisticas de la jornada'),
                    400: badRequestErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        getEstadisticasJornada
    );

    fastify.get(
        '/reportes/alertas/stock-bajo',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Alertas'],
                summary: 'Consultar alertas de stock bajo',
                description: 'Lista medicamentos cuyo stock actual es menor o igual al stock minimo.',
                response: {
                    200: successArrayResponseSchema('Alertas de bajo stock'),
                    400: badRequestErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        getAlertasStockBajo
    );

    fastify.get(
        '/reportes/alertas/vencimientos',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Alertas'],
                summary: 'Consultar alertas de vencimiento',
                description: 'Lista lotes proximos a vencer y calcula los dias restantes.',
                querystring: diasQuerySchema,
                response: {
                    200: successArrayResponseSchema('Alertas de medicamentos proximos a vencer'),
                    400: badRequestErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        getAlertasVencimiento
    );

    fastify.get('/reportes/exportar/movimientos/excel', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar movimientos a Excel', 'Descarga un archivo XLSX con los movimientos de inventario.', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') }, exportMovimientosExcel);
    fastify.get('/reportes/exportar/stock/excel', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar stock a Excel', 'Descarga un archivo XLSX con el stock central por lote.', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') }, exportStockExcel);
    fastify.get('/reportes/exportar/jornadas/excel', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar jornadas a Excel', 'Descarga un archivo XLSX con el listado de jornadas medicas.', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') }, exportJornadasExcel);
    fastify.get('/reportes/exportar/consumo/excel', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar consumo a Excel', 'Descarga un archivo XLSX con el consumo registrado en jornadas.', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') }, exportConsumoExcel);
    fastify.get('/reportes/exportar/movimientos/pdf', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar movimientos a PDF', 'Descarga un archivo PDF con los movimientos de inventario.', 'application/pdf') }, exportMovimientosPDF);
    fastify.get('/reportes/exportar/stock/pdf', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar stock a PDF', 'Descarga un archivo PDF con el stock central por lote.', 'application/pdf') }, exportStockPDF);
    fastify.get('/reportes/exportar/jornadas/pdf', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar jornadas a PDF', 'Descarga un archivo PDF con el listado de jornadas medicas.', 'application/pdf') }, exportJornadasPDF);
    fastify.get('/reportes/exportar/consumo/pdf', { preHandler: [requireRole(...ADMIN_ONLY)], schema: exportSchema('Exportar consumo a PDF', 'Descarga un archivo PDF con el consumo registrado en jornadas.', 'application/pdf') }, exportConsumoPDF);

    fastify.get(
        '/reportes/auditoria',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Auditoria'],
                summary: 'Consultar auditorias',
                description: 'Lista eventos auditados con filtros opcionales por usuario, accion, modulo o fecha.',
                querystring: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', example: 'usr_123456789abc' },
                        action: { type: 'string', example: 'CREATE' },
                        module: { type: 'string', example: 'movimientos' },
                        fecha: { type: 'string', format: 'date', example: '2026-05-22' }
                    }
                },
                response: {
                    200: successArrayResponseSchema('Auditorias del sistema'),
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al consultar auditorias' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getAuditorias
    );

    fastify.get(
        '/reportes/consistencia',
        {
            preHandler: [requireRole(...ADMIN_ONLY)],
            schema: {
                tags: ['Auditoria'],
                summary: 'Validar consistencia de datos',
                description: 'Compara inventario y movimientos para detectar inconsistencias operativas.',
                response: {
                    200: successObjectResponseSchema('Validacion de consistencia de datos'),
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al validar consistencia' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getConsistenciaDatos
    );
}

export default reportesRoutes;
