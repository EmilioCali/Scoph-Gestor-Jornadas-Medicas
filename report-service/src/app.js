import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import reportesRoutes from './reports/reports.routes.js';

const app = Fastify({
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

//seguridad y limitacion de peticiones
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

//para registrar rutas y swagger aqui

await app.register(reportesRoutes, {
    prefix: '/api/v1'
});

//healtycheck
app.get('/api/v1/health', async () => ({
    status: 'ok',
    message: 'Servicio de Reportes funcionando correctamente',
    timestamp: new Date().toISOString()
}));

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

