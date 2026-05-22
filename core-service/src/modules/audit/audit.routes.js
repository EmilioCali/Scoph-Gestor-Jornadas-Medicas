import { getAuditorias } from './audit.controller.js';

const auditSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        userId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        action: { type: 'string', example: 'ENTRADA' },
        module: { type: 'string', example: 'MOVEMENTS' },
        reference: { type: 'string', example: '664f1a2b3c4d5e6f78905678' },
        description: { type: 'string', example: 'Movimiento de entrada registrado' },
        date: { type: 'string', format: 'date-time' }
    }
};

const badRequestErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error al consultar auditorias' },
        error: { type: 'string', example: 'Cast to date failed for value' }
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

const auditRoutes = async (fastify) => {
    fastify.get(
        '/auditoria',
        {
            schema: {
                tags: ['Auditoria'],
                summary: 'Consultar auditorias',
                description: 'Lista eventos de auditoria generados por movimientos del Core Service.',
                querystring: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
                        action: { type: 'string', example: 'ENTRADA' },
                        module: { type: 'string', example: 'MOVEMENTS' },
                        fecha: { type: 'string', format: 'date', example: '2026-05-22' }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Auditorias consultadas correctamente' },
                            data: { type: 'array', items: auditSchema }
                        }
                    },
                    400: badRequestErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        getAuditorias
    );
};

export default auditRoutes;
