import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import medicineRoutes from './medicines/medicine.routes.js';
import movementPlugin from './movements/movement.routes.js';
import inventoryRoutes from './inventory/inventroy.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

const app = Fastify({
    ajv: {
        customOptions: {
            strict: false,
            keywords: ['example']
        }
    },
    logger:{
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options:{
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    }
});

//seguridad
await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

await app.register(helmet);

await app.register(rateLimit, {
    max: 10,
    timeWindow: '10 minutes',
    errorResponseBuilder: (req, context) =>({
        success: false,
        message: `Demasiadas peticiones desde esta IP, por favor intente nuevamenente despues de ${Math.ceil(context.ttl / 1000)} segundos`,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: context.after
    })
});

await app.register(jwt, {
    secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET es requerido') })()
});

//documentacion Swagger / OpenAPI
await app.register(swagger, {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'SCOPH Core Service API',
            description: 'Servicio central para medicamentos, inventarios, movimientos y auditoria.',
            version: '1.0.0',
            contact: {
                name: 'Equipo SCOPH'
            }
        },
        tags: [
            { name: 'Sistema', description: 'Estado del servicio' },
            { name: 'Medicamentos', description: 'Gestion del catalogo de medicamentos' },
            { name: 'Inventario', description: 'Inventario central e inventario por jornada' },
            { name: 'Movimientos', description: 'Entradas, salidas, transferencias, consumos y retornos' },
            { name: 'Auditoria', description: 'Consulta de eventos auditados' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT emitido por Auth Service'
                }
            }
        }
    }
});

await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        tryItOutEnabled: true
    },
    staticCSP: true,
    transformSpecificationClone: true
});

await app.register(medicineRoutes, {
    prefix: '/api/v1' 
});

await app.register(movementPlugin, {
    prefix: '/api/v1'
})

await app.register(inventoryRoutes, {
    prefix: '/api/v1'
})

await app.register(auditRoutes, { 
    prefix: '/api/v1' 
});

const healthRateLimitErrorSchema = {
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

const healthServerErrorSchema = {
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Internal Server Error' }
    }
};

//healtycheck
app.get(
    '/api/v1/health',
    {
        schema: {
            tags: ['Sistema'],
            summary: 'Estado del servicio',
            description: 'Verifica que el Core Service este corriendo correctamente.',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'ok' },
                        message: { type: 'string', example: 'Servicio funcionando correctamente' },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                },
                429: healthRateLimitErrorSchema,
                500: healthServerErrorSchema
            }
        }
    },
    async () => ({
        status: 'ok',
        message: 'Servicio funcionando correctamente',
        timestamp: new Date().toISOString()
    })
);

//manejo de errores
app.setErrorHandler((error, request, reply) =>{
    request.log.error({
        message: error.message,
        stack: error.stack
    });

    reply.status(error.statusCode || 500).send({
        status: 'error',
        message: error.message || 'Internal Server Error'
    });
});

export default app;

