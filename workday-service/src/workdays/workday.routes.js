import {
    createWorkday,
    getWorkdays,
    getWorkdayById,
    updateWorkday,
    updateWorkdayStatus,
    deleteWorkday
} from './workday.controller.js';
import { requireRole } from '../middlewares/authenticate.js';

const ADMINISTRATIVE_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const AUTHENTICATED_ROLES = ['ADMIN', 'MEDICO', 'SUPER_ADMIN'];
const SUPER_ADMIN_ONLY = ['SUPER_ADMIN'];

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
    required: ['name'],
    properties: {
        userId: { type: 'string', example: 'usr_001' },
        name:   { type: 'string', example: 'Dr. Juan Perez' }
    }
};

const doctorSchema = {
    type: 'object',
    required: ['userId', 'name'],
    properties: {
        userId: { type: 'string', example: 'usr_abc123' },
        name:   { type: 'string', example: 'Dra. Ana Lopez' }
    }
};

const doctorsSchema = {
    type: 'array',
    items: doctorSchema,
    default: []
};

const workdayInputSchema = {
    type: 'object',
    required: ['name', 'startDate', 'endDate', 'location', 'estimatedPatients', 'estimatedMedicines'],
    properties: {
        name:               { type: 'string', maxLength: 100 },
        description:        { type: 'string', maxLength: 500 },
        startDate:          { type: 'string', format: 'date-time' },
        endDate:            { type: 'string', format: 'date-time' },
        location:           locationSchema,
        manager:            managerSchema,
        doctors:            doctorsSchema,
        estimatedPatients:  { type: 'number', minimum: 0 },
        estimatedMedicines: { type: 'number', minimum: 0 },
        status:             { type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'], default: 'PLANNED' }
    }
};

const workdayUpdateSchema = {
    type: 'object',
    properties: {
        name:               { type: 'string', maxLength: 100 },
        description:        { type: 'string', maxLength: 500 },
        startDate:          { type: 'string', format: 'date-time' },
        endDate:            { type: 'string', format: 'date-time' },
        location:           locationSchema,
        manager:            managerSchema,
        doctors:            doctorsSchema,
        estimatedPatients:  { type: 'number', minimum: 0 },
        estimatedMedicines: { type: 'number', minimum: 0 },
        status:             { type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'] }
    }
};

const workdayResponseSchema = {
    type: 'object',
    properties: {
        _id:                { type: 'string' },
        name:               { type: 'string' },
        description:        { type: 'string' },
        startDate:          { type: 'string', format: 'date-time' },
        endDate:            { type: 'string', format: 'date-time' },
        location:           locationSchema,
        manager: {
            type: 'object',
            properties: {
                userId: { type: 'string' },
                name:   { type: 'string' }
            }
        },
        doctors:            doctorsSchema,
        estimatedPatients:  { type: 'number' },
        estimatedMedicines: { type: 'number' },
        status:             { type: 'string' },
        createdAt:          { type: 'string', format: 'date-time' },
        updatedAt:          { type: 'string', format: 'date-time' }
    }
};

const errorSchema = (msg) => ({
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string', example: msg },
        error:   { type: 'string' }
    }
});

const idParam = {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } }
};

const successBody = (dataSchema) => ({
    type: 'object',
    properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: dataSchema }
});

async function workdayRoutes(fastify) {

    fastify.post('/workdays', {
        preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
        schema: {
            tags: ['Jornadas'], summary: 'Crear jornada médica',
            security: [{ bearerAuth: [] }],
            body: workdayInputSchema,
            response: {
                201: successBody(workdayResponseSchema),
                400: errorSchema('Error al crear la jornada'),
                401: errorSchema('Token inválido o expirado')
            }
        }
    }, createWorkday);

    fastify.get('/workdays', {
        preHandler: [requireRole(...AUTHENTICATED_ROLES)],
        schema: {
            tags: ['Jornadas'],
            summary: 'Listar jornadas médicas',
            description: 'ADMIN/SUPER_ADMIN ven todas. MEDICO solo ve jornadas donde está asignado en doctors.',
            security: [{ bearerAuth: [] }],
            response: { 200: successBody({ type: 'array', items: workdayResponseSchema }) }
        }
    }, getWorkdays);

    fastify.get('/workdays/:id', {
        preHandler: [requireRole(...AUTHENTICATED_ROLES)],
        schema: {
            tags: ['Jornadas'],
            summary: 'Obtener jornada por ID',
            description: 'MEDICO recibe 403 si no está asignado a la jornada.',
            security: [{ bearerAuth: [] }],
            params: idParam,
            response: {
                200: successBody(workdayResponseSchema),
                403: errorSchema('No tienes permiso para acceder a esta jornada'),
                404: errorSchema('Jornada no encontrada')
            }
        }
    }, getWorkdayById);

    fastify.put('/workdays/:id', {
        preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
        schema: {
            tags: ['Jornadas'], summary: 'Actualizar jornada',
            description: 'Actualiza datos. El status se ignora aquí — usar PATCH /workdays/:id/status.',
            security: [{ bearerAuth: [] }],
            params: idParam,
            body: workdayUpdateSchema,
            response: {
                200: successBody(workdayResponseSchema),
                404: errorSchema('Jornada no encontrada')
            }
        }
    }, updateWorkday);

    fastify.patch('/workdays/:id/status', {
        preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
        schema: {
            tags: ['Jornadas'], summary: 'Cambiar estado de jornada',
            security: [{ bearerAuth: [] }],
            params: idParam,
            body: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'] }
                }
            },
            response: {
                200: successBody(workdayResponseSchema),
                404: errorSchema('Jornada no encontrada')
            }
        }
    }, updateWorkdayStatus);

    fastify.delete('/workdays/:id', {
        preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
        schema: {
            tags: ['Jornadas'], summary: 'Eliminar jornada',
            description: 'Elimina una jornada. Solo SUPER_ADMIN.',
            security: [{ bearerAuth: [] }],
            params: idParam,
            response: {
                200: successBody(workdayResponseSchema),
                404: errorSchema('Jornada no encontrada')
            }
        }
    }, deleteWorkday);
}

export default workdayRoutes;