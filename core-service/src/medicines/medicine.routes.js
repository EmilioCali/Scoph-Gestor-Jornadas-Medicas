import { createMedicine, getMedicines, updateMedicine, toggleMedicineStatus } from './medicine.controller.js';
import { requireRole } from '../middlewares/authenticate.js';

const ADMINISTRATIVE_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const SUPER_ADMIN_ONLY = ['SUPER_ADMIN'];

const medicineSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        barcode: { type: 'string', nullable: true, example: '750100000001' },
        name: { type: 'string', example: 'Acetaminofen' },
        compound: { type: 'string', example: 'Paracetamol' },
        concentration: { type: 'string', example: '500mg' },
        minimumUnit: { type: 'string', example: 'Tableta' },
        intermediateUnit: { type: 'string', nullable: true, example: 'Blíster' },
        packageUnit: { type: 'string', example: 'Caja' },
        unitsPerPackage: { type: 'number', example: 100 },
        unitsPerMinimumUnit: { type: 'number', example: 10 },
        minimumStock: { type: 'number', example: 10 },
        category: { anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }], example: ['Analgesico'] },
        status: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], example: 'ACTIVO' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

const validationErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error al crear el medicamento' },
        error: { type: 'string', example: 'El nombre del medicamento es requerido' }
    }
};

const serverErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error al obtener medicamentos' },
        error: { type: 'string', example: 'Error interno del servidor' }
    }
};

const rateLimitErrorSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente después de 60 segundos' },
        error: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
        retryAfter: { type: 'string', example: '1 minute' }
    }
};

const medicineRoutes = async (fastify) => {
    fastify.post(
        '/medicines',
        {
            preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
            schema: {
                tags: ['Medicamentos'],
                summary: 'Crear medicamento',
                description: 'Registra un medicamento en el catálogo. ADMIN puede crear. No crea stock; el stock se registra con un movimiento de entrada.',
                body: {
                    type: 'object',
                    required: ['name', 'compound', 'concentration', 'minimumUnit', 'packageUnit', 'unitsPerPackage', 'unitsPerMinimumUnit', 'category'],
                    properties: {
                        barcode: { type: 'string', nullable: true, example: '750100000001' },
                        name: { type: 'string', example: 'Acetaminofen' },
                        compound: { type: 'string', example: 'Paracetamol' },
                        concentration: { type: 'string', example: '500mg' },
                        minimumUnit: { type: 'string', example: 'Tableta' },
                        intermediateUnit: { type: 'string', nullable: true, example: 'Blíster' },
                        packageUnit: { type: 'string', example: 'Caja' },
                        unitsPerPackage: { type: 'number', example: 100 },
                        unitsPerMinimumUnit: { type: 'number', example: 10 },
                        minimumStock: { type: 'number', example: 10 },
                        category: { anyOf: [{ type: 'array', minItems: 1, items: { type: 'string' } }, { type: 'string' }], example: ['Analgesico', 'Antibiotico'] }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Medicamento creado exitosamente' },
                            data: medicineSchema
                        }
                    },
                    400: validationErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        createMedicine
    );

    fastify.get(
        '/medicines',
        {
            preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
            schema: {
                tags: ['Medicamentos'],
                summary: 'Listar medicamentos',
                description: 'Retorna todos los medicamentos (ACTIVO e INACTIVO). Solo roles administrativos. El filtrado por estado se hace en el cliente.',
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Medicamentos obtenidos exitosamente' },
                            data: { type: 'array', items: medicineSchema }
                        }
                    },
                    429: rateLimitErrorSchema,
                    500: serverErrorSchema
                }
            }
        },
        getMedicines
    );

    fastify.put(
        '/medicines/:id',
        {
            preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
            schema: {
                tags: ['Medicamentos'],
                summary: 'Actualizar medicamento',
                description: 'Actualiza los datos de un medicamento. ADMIN puede actualizar. No modifica el estado (usar PATCH /medicines/:id/status).',
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string', example: '664f1a2b3c4d5e6f78901234' } }
                },
                body: {
                    type: 'object',
                    properties: {
                        barcode: { type: 'string', nullable: true },
                        name: { type: 'string' },
                        compound: { type: 'string' },
                        concentration: { type: 'string' },
                        minimumUnit: { type: 'string' },
                        intermediateUnit: { type: 'string', nullable: true },
                        packageUnit: { type: 'string' },
                        unitsPerPackage: { type: 'number' },
                        unitsPerMinimumUnit: { type: 'number' },
                        minimumStock: { type: 'number' },
                        category: { anyOf: [{ type: 'array', minItems: 1, items: { type: 'string' } }, { type: 'string' }] }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: medicineSchema
                        }
                    },
                    404: validationErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        updateMedicine
    );

    fastify.patch(
        '/medicines/:id/status',
        {
            preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
            schema: {
                tags: ['Medicamentos'],
                summary: 'Cambiar estado de medicamento',
                description: 'Activa o desactiva un medicamento. ADMIN puede cambiar estado.',
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string', example: '664f1a2b3c4d5e6f78901234' } }
                },
                body: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: medicineSchema
                        }
                    },
                    404: validationErrorSchema,
                    429: rateLimitErrorSchema
                }
            }
        },
        toggleMedicineStatus
    );
};

export default medicineRoutes;
