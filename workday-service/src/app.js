import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import workdayRoutes from './workdays/workday.routes.js';
import { globalErrorHandler } from './utils/errorHandler.js';

const fastify = Fastify({ logger: true });

await fastify.register(globalErrorHandler); // ← registra el handler global

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
    max: Number(process.env.RATE_LIMIT_MAX || 100),
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
            title: 'SCOPH Workday Service API',
            description: 'Servicio para gestion de jornadas medicas.',
            version: '1.0.0',
            contact: {
                name: 'Equipo SCOPH'
            }
        },
        tags: [
            { name: 'Sistema', description: 'Estado del servicio' },
            { name: 'Jornadas', description: 'Gestion de jornadas medicas' }
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

await app.register(workdayRoutes, {
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
            description: 'Verifica que el Workday Service este corriendo correctamente.',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'ok' },
                        message: { type: 'string', example: 'Servicio de jornadas funcionando correctamente' },
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
        message: 'Servicio de jornadas funcionando correctamente',
        timestamp: new Date().toISOString()
    })
);

//manejo de errores
app.setErrorHandler((error, request, reply) =>{
    request.log.error({
        message: error.message,
        stack: error.stack
    });

    if (error.error === 'RATE_LIMIT_EXCEEDED' || error.retryAfter) {
        return reply.status(429).send(error);
    }

    reply.status(error.statusCode || 500).send({
        status: 'error',
        message: error.message || 'Internal Server Error'
    });
});

export default app;
