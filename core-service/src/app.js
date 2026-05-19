import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import medicineRoutes from './medicines/medicine.routes.js';
import movementPlugin from './movements/movement.routes.js';
import inventoryRoutes from './inventory/inventroy.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

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

//registrar rutas y swagger aqui

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

//healtycheck
app.get('/api/v1/health', async () => ({
    status: 'ok',
    message: 'Servicio funcionando correctamente',
    timestamp: new Date().toISOString()
}));

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

