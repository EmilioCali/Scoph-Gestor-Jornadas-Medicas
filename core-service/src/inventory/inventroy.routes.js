import { getInventarioCentral, getInventarioJornada } from './inventory.controller.js';

const lotSchema = {
    type: 'object',
    properties: {
        batch: { type: 'string', example: 'LOTE-001' },
        expirationDate: { type: 'string', format: 'date-time' },
        stock: { type: 'number', example: 100 }
    }
};

const inventorySchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
        _id: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        medicineId: { type: 'object', additionalProperties: true },
        lots: { type: 'array', items: lotSchema },
        totalStock: { type: 'number', example: 100 },
        minimumStock: { type: 'number', example: 10 },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

const badRequestErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error al consultar inventario central' },
        error: { type: 'string', example: 'Cast to ObjectId failed for value' }
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

const inventoryRoutes = async (fastify) =>{
    fastify.get(
        '/inventario-central',
        {
            schema: {
                tags: ['Inventario'],
                summary: 'Consultar inventario central',
                description: 'Retorna el stock central agrupado por medicamento y lotes.',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Inventario central' },
                            data: { type: 'array', items: inventorySchema }
                        }
                    },
                    400: badRequestErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        getInventarioCentral
    );

    fastify.get(
        '/inventario-jornada/:jornadaId',
        {
            schema: {
                tags: ['Inventario'],
                summary: 'Consultar inventario de jornada',
                description: 'Retorna el inventario asignado a una jornada especifica.',
                params: {
                    type: 'object',
                    required: ['jornadaId'],
                    properties: {
                        jornadaId: { type: 'string', example: '664f1a2b3c4d5e6f78909999' }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Inventario de jornada' },
                            data: { type: 'array', items: inventorySchema }
                        }
                    },
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al consultar inventario de jornada' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getInventarioJornada
    );
}

export default inventoryRoutes;
