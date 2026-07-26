import { getInventarioCentral, addMedicineToInventory, getInventarioJornada } from './inventory.controller.js';
import { requireRole } from '../middlewares/authenticate.js';

const ADMINISTRATIVE_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const AUTHENTICATED_ROLES = ['ADMIN', 'MEDICO', 'SUPER_ADMIN'];
const SUPER_ADMIN_ONLY = ['SUPER_ADMIN'];

const inventoryRoutes = async (fastify) => {

    fastify.get(
        '/inventario-central',
        {
            preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
            schema: {
                tags: ['Inventario'],
                summary: 'Obtener inventario central',
                description: 'Retorna todos los medicamentos en inventario central con sus lotes, stock total y stock mínimo. ADMIN puede ver.',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        _id: { type: 'string' },
                                        medicineId: { type: 'string' },
                                        name: { type: 'string' },
                                        compound: { type: 'string' },
                                        category: { type: 'string' },
                                        unitOfMeasure: { type: 'string' },
                                        totalStock: { type: 'number' },
                                        minimumStock: { type: 'number' },
                                        lots: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    batch: { type: 'string' },
                                                    expirationDate: { type: 'string', format: 'date-time' },
                                                    stock: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        getInventarioCentral
    );

    fastify.post(
        '/inventario-central',
        {
            preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
            schema: {
                tags: ['Inventario'],
                summary: 'Agregar medicamento al inventario central',
                description: 'Crea el registro de inventario para un medicamento. ADMIN puede agregar. Si initialStock > 0 genera un movimiento de entrada tipo DONACION.',
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['medicineId', 'minimumStock'],
                    properties: {
                        medicineId: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
                        minimumStock: { type: 'number', minimum: 0, example: 10 },
                        batch: { type: 'string', example: 'LOTE-001' },
                        expirationDate: { type: 'string', format: 'date', example: '2027-12-31' },
                        initialStock: { type: 'number', minimum: 0, default: 0, example: 50 }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: { type: 'object', additionalProperties: true }
                        }
                    },
                    409: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            error: { type: 'string' }
                        }
                    }
                }
            }
        },
        addMedicineToInventory
    );

    fastify.get(
        '/inventario-jornada/:jornadaId',
        {
            preHandler: [requireRole(...AUTHENTICATED_ROLES)],
            schema: {
                tags: ['Inventario'],
                summary: 'Obtener inventario de jornada',
                description: 'MEDICO solo puede consultar inventario de jornadas donde está asignado (403 en caso contrario).',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['jornadaId'],
                    properties: { jornadaId: { type: 'string' } }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: { type: 'array', items: { type: 'object', additionalProperties: true } }
                        }
                    },
                    403: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string', example: 'No tienes permiso para acceder a esta jornada' },
                            error: { type: 'string', example: 'ServiceError' }
                        }
                    },
                    404: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string', example: 'La jornada no existe' },
                            error: { type: 'string' }
                        }
                    }
                }
            }
        },
        getInventarioJornada
    );
};

export default inventoryRoutes;
