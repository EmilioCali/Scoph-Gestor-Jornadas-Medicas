import { createMedicine, getMedicines } from './medicine.controller.js';

const medicineSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string', example: '664f1a2b3c4d5e6f78901234' },
        barcode: { type: 'string', nullable: true, example: '750100000001' },
        name: { type: 'string', example: 'Acetaminofen' },
        compound: { type: 'string', example: 'Paracetamol' },
        concentration: { type: 'string', example: '500mg' },
        presentation: { type: 'string', example: 'Tableta' },
        unitOfMeasure: { type: 'string', example: 'unidad' },
        category: { type: 'string', example: 'Analgesico' },
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
        message: {
            type: 'string',
            example: 'Demasiadas peticiones desde esta IP, por favor intente nuevamenente despues de 60 segundos'
        },
        error: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
        retryAfter: { type: 'string', example: '1 minute' }
    }
};

const medicineRoutes = async (fastify) => {
    fastify.post(
        '/medicines',
        {
            schema: {
                tags: ['Medicamentos'],
                summary: 'Crear medicamento',
                description: 'Registra un medicamento en el catalogo. Este endpoint no crea stock; el stock se registra con un movimiento de entrada.',
                body: {
                    type: 'object',
                    required: ['name', 'compound', 'concentration', 'presentation', 'unitOfMeasure', 'category'],
                    properties: {
                        barcode: { type: 'string', nullable: true, example: '750100000001' },
                        name: { type: 'string', example: 'Acetaminofen' },
                        compound: { type: 'string', example: 'Paracetamol' },
                        concentration: { type: 'string', example: '500mg' },
                        presentation: { type: 'string', example: 'Tableta' },
                        unitOfMeasure: { type: 'string', example: 'unidad' },
                        category: { type: 'string', example: 'Analgesico' }
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
            schema: {
                tags: ['Medicamentos'],
                summary: 'Listar medicamentos activos',
                description: 'Retorna los medicamentos con estado ACTIVO.',
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
};

export default medicineRoutes;
