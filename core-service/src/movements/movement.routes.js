import { createEntrada, createSalidaReceta, createTransferencia } from './movement.controller.js'
import { createConsumoJornada, createRetornoJornada, getMovimientos } from './movement.controller.js'
import { authenticate, requireRole } from '../middlewares/authenticate.js';

const movementDetailInputSchema = {
    type: 'object',
    required: ['medicineId', 'batch', 'quantity'],
    properties: {
        medicineId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        batch: { type: 'string', example: 'LOTE-001' },
        quantity: { type: 'number', minimum: 1, example: 20 },
        expirationDate: { type: 'string', format: 'date', example: '2027-12-31' }
    }
};

const movementResponseSchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
        _id: { type: 'string', example: '664f1a2b3c4d5e6f78905678' },
        type: { type: 'string', enum: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA'] },
        subType: { type: 'string', enum: ['DONACION', 'COMPRA', 'RECETA', 'CONSUMO_JORNADA', 'ASIGNACION_JORNADA', 'RETORNO_JORNADA'] },
        status: { type: 'string', enum: ['PENDIENTE', 'APLICADO', 'CANCELADO'], example: 'APLICADO' },
        userId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        appliedAt: { type: 'string', format: 'date-time' }
    }
};

const successWithMovementArraySchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' },
        data: { type: 'array', items: movementResponseSchema }
    }
};

const badRequestErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: {
            type: 'string',
            example: 'Stock insuficiente en el lote LOTE-001. Disponible: 5, solicitado: 20'
        },
        error: { type: 'string', example: 'BAD_REQUEST' }
    }
};

const externalServiceUnavailableSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'El servicio externo no esta disponible' },
        error: { type: 'string', example: 'SERVICE_UNAVAILABLE' }
    }
};

const externalServiceTimeoutSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'El servicio externo no responde' },
        error: { type: 'string', example: 'TIMEOUT' }
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

const unauthorizedErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Token invalido o expirado' },
        error: { type: 'string', example: 'UNAUTHORIZED' }
    }
};

const movementRoutes = async (fastify) => {
    fastify.post(
        '/movimientos/entrada',
        {
            preHandler: [requireRole('ADMIN', 'ENFERMERO', 'ASISTENTE')],
            schema: {
                tags: ['Movimientos'],
                summary: 'Registrar entrada a inventario central',
                description: 'Registra una compra o donacion y aumenta el stock del inventario central.',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['tipoEntrada', 'destination', 'detalle'],
                    properties: {
                        tipoEntrada: { type: 'string', enum: ['COMPRA', 'DONACION'], example: 'COMPRA' },
                        destination: {
                            type: 'object',
                            required: ['type'],
                            properties: {
                                type: { type: 'string', enum: ['INVENTARIO_CENTRAL'], example: 'INVENTARIO_CENTRAL' },
                                id: { type: 'string', nullable: true, example: null }
                            }
                        },
                        detalle: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                ...movementDetailInputSchema,
                                required: ['medicineId', 'batch', 'quantity', 'expirationDate']
                            }
                        }
                    }
                },
                response: {
                    201: successWithMovementArraySchema,
                    400: badRequestErrorSchema,
                    401: unauthorizedErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        createEntrada
    )

    fastify.post(
        '/movimientos/salida-receta',
        {
            preHandler: [requireRole('ADMIN', 'ENFERMERO', 'ASISTENTE')],
            schema: {
                tags: ['Movimientos'],
                summary: 'Registrar salida por receta',
                description: 'Descuenta stock del inventario central usando un lote existente.',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['detalle'],
                    properties: {
                        detalle: {
                            type: 'array',
                            minItems: 1,
                            items: movementDetailInputSchema
                        },
                        prescription: { type: 'string', example: 'RX-001' },
                        reason: { type: 'string', example: 'Entrega por receta medica' }
                    }
                },
                response: {
                    201: successWithMovementArraySchema,
                    400: badRequestErrorSchema,
                    401: unauthorizedErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        createSalidaReceta
    )

    fastify.post(
        '/movimientos/transferencia',
        {
            preHandler: [requireRole('ADMIN', 'ENFERMERO', 'ASISTENTE')],
            schema: {
                tags: ['Movimientos'],
                summary: 'Transferir stock a jornada',
                description: 'Descuenta stock central y crea o actualiza inventario para una jornada existente en Workday Service.',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['jornadaId', 'jornadaNombre', 'detalle'],
                    properties: {
                        jornadaId: { type: 'string', example: '664f1a2b3c4d5e6f78909999' },
                        jornadaNombre: { type: 'string', example: 'Jornada Medica Zona 1' },
                        detalle: {
                            type: 'array',
                            minItems: 1,
                            items: movementDetailInputSchema
                        }
                    }
                },
                response: {
                    201: successWithMovementArraySchema,
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'La jornada no existe' }
                        }
                    },
                    401: unauthorizedErrorSchema,
                    429: rateLimitErrorSchema,
                    503: externalServiceUnavailableSchema,
                    504: externalServiceTimeoutSchema
                }
            }
        },
        createTransferencia
    )

    fastify.post(
        '/movimientos/consumo-jornada',
        {
            preHandler: [authenticate],
            schema: {
                tags: ['Movimientos'],
                summary: 'Registrar consumo en jornada',
                description: 'Descuenta stock del inventario de jornada. productoId corresponde al _id del medicamento.',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['productoId', 'cantidad'],
                    properties: {
                        productoId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
                        cantidad: { type: 'number', minimum: 1, example: 3 }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Consumo registrado' },
                            data: movementResponseSchema
                        }
                    },
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Inventario de jornada no encontrado' }
                        }
                    },
                    401: unauthorizedErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        createConsumoJornada
    )

    fastify.post(
        '/movimientos/retorno-jornada',
        {
            preHandler: [authenticate],
            schema: {
                tags: ['Movimientos'],
                summary: 'Registrar retorno de jornada',
                description: 'Suma stock de vuelta al inventario de jornada. productoId corresponde al _id del medicamento.',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['productoId', 'cantidad'],
                    properties: {
                        productoId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
                        cantidad: { type: 'number', minimum: 1, example: 2 }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Retorno registrado' },
                            data: movementResponseSchema
                        }
                    },
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'El lote no existe' }
                        }
                    },
                    401: unauthorizedErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        createRetornoJornada
    )

    fastify.get(
        '/movimientos',
        {
            schema: {
                tags: ['Movimientos'],
                summary: 'Consultar movimientos',
                description: 'Lista movimientos con paginacion y filtros opcionales por subtipo o jornada.',
                querystring: {
                    type: 'object',
                    properties: {
                        subType: {
                            type: 'string',
                            enum: ['DONACION', 'COMPRA', 'RECETA', 'CONSUMO_JORNADA', 'ASIGNACION_JORNADA', 'RETORNO_JORNADA']
                        },
                        jornadaId: { type: 'string', example: '664f1a2b3c4d5e6f78909999' },
                        type: {
                            type: 'string',
                            enum: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA']
                        },
                        userId: { type: 'string', example: 'usr_123456789abc' },
                        fecha: { type: 'string', format: 'date', example: '2026-05-22' },
                        page: { type: 'integer', minimum: 1, default: 1 },
                        limit: { type: 'integer', minimum: 1, default: 10 }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Movimientos consultados con exito' },
                            total: { type: 'integer', example: 1 },
                            data: { type: 'array', items: movementResponseSchema }
                        }
                    },
                    400: {
                        ...badRequestErrorSchema,
                        properties: {
                            ...badRequestErrorSchema.properties,
                            message: { type: 'string', example: 'Error al consultar movimientos' }
                        }
                    },
                    429: rateLimitErrorSchema
                }
            }
        },
        getMovimientos
    );
}

export default movementRoutes
