import { createWorkday, getWorkdays, getWorkdayById } from './workday.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const locationSchema = {
    type: 'object',
    required: ['department', 'municipality', 'address'],
    properties: {
        department: { type: 'string', example: 'Guatemala' },
        municipality: { type: 'string', example: 'Guatemala' },
        address: { type: 'string', example: 'Zona 1, Ciudad de Guatemala' }
    }
};

const managerSchema = {
    type: 'object',
    required: ['userId', 'name'],
    properties: {
        userId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        name: { type: 'string', example: 'Dr. Juan Perez' }
    }
};

const workdayInputSchema = {
    type: 'object',
    required: [
        'name',
        'startDate',
        'endDate',
        'location',
        'estimatedPatients',
        'estimatedMedicines'
    ],
    properties: {
        name: { type: 'string', maxLength: 100, example: 'Jornada Medica Zona 1' },
        description: { type: 'string', maxLength: 500, example: 'Atencion medica general y entrega de medicamentos.' },
        startDate: { type: 'string', format: 'date-time', example: '2026-06-01T08:00:00.000Z' },
        endDate: { type: 'string', format: 'date-time', example: '2026-06-01T16:00:00.000Z' },
        location: locationSchema,
        manager: managerSchema,
        estimatedPatients: { type: 'number', minimum: 0, example: 150 },
        estimatedMedicines: { type: 'number', minimum: 0, example: 500 },
        status: {
            type: 'string',
            enum: ['PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'],
            default: 'PLANNED',
            example: 'PLANNED'
        }
    }
};

const workdayResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '664f1a2b3c4d5e6f78909999' },
        ...workdayInputSchema.properties,
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

const validationErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error al crear la jornada' },
        error: { type: 'string', example: 'El nombre de la jornada es requerido' }
    }
};

const notFoundErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Jornada no encontrada' }
    }
};

const serverErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error al obtener la jornada' },
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

const unauthorizedErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Token invalido o expirado' },
        error: { type: 'string', example: 'UNAUTHORIZED' }
    }
};

async function workdayRoutes(fastify, options) {
    fastify.post(
        '/workdays',
        {
            preHandler: [authenticate],
            schema: {
                tags: ['Jornadas'],
                summary: 'Crear jornada medica',
                description: 'Registra una jornada medica con fechas, ubicacion, responsable y estimaciones operativas. El ID del responsable se toma del token JWT.',
                security: [{ bearerAuth: [] }],
                body: workdayInputSchema,
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Jornada creada exitosamente' },
                            data: workdayResponseSchema
                        }
                    },
                    400: validationErrorSchema,
                    401: unauthorizedErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        createWorkday
    );

    fastify.get(
        '/workdays',
        {
            schema: {
                tags: ['Jornadas'],
                summary: 'Listar jornadas medicas',
                description: 'Retorna todas las jornadas medicas registradas.',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            data: { type: 'array', items: workdayResponseSchema }
                        }
                    },
                    429: rateLimitErrorSchema,
                    500: {
                        ...serverErrorSchema,
                        properties: {
                            ...serverErrorSchema.properties,
                            message: { type: 'string', example: 'Error al obtener las jornadas' }
                        }
                    }
                }
            }
        },
        getWorkdays
    );

    fastify.get(
        '/workdays/:id',
        {
            schema: {
                tags: ['Jornadas'],
                summary: 'Obtener jornada por ID',
                description: 'Retorna una jornada medica especifica por su identificador de MongoDB.',
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', example: '664f1a2b3c4d5e6f78909999' }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            data: workdayResponseSchema
                        }
                    },
                    404: notFoundErrorSchema,
                    429: rateLimitErrorSchema,
                    500: {
                        ...serverErrorSchema,
                        properties: {
                            ...serverErrorSchema.properties,
                            message: { type: 'string', example: 'Error al obtener la jornada' },
                            error: { type: 'string', example: 'Cast to ObjectId failed for value' }
                        }
                    }
                }
            }
        },
        getWorkdayById
    );
}

export default workdayRoutes;
