import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { connectDB } from './config/database.js'
import authPlugin from './modules/auth/auth.routes.js'

export async function buildApp() {
    const app = Fastify({
        ajv: {
            customOptions: {
                strict: false,
                keywords: ['example']
            }
        },
        logger: {
            level: process.env.LOG_LEVEL || 'info',
            transport:
                process.env.NODE_ENV !== 'production'
                    ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
                    : undefined
        }
    })

    // --- Swagger / OpenAPI ---
    await app.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'SCOPH API',
                description: 'Sistema de Control de Operaciones y Programas de Salud — Documentación del API',
                version: '1.0.0',
                contact: {
                    name: 'Equipo SCOPH'
                }
            },
            tags: [
                { name: 'Sistema', description: 'Estado y salud del servicio' },
                { name: 'Autenticación', description: 'Login y sesiones' },
                { name: 'Usuarios', description: 'Gestión de usuarios (solo ADMIN y SUPER_ADMIN)' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Token JWT obtenido al hacer login'
                    }
                }
            }
        }
    })

    await app.register(swaggerUi, {
        routePrefix: '/api/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            tryItOutEnabled: true
        },
        staticCSP: true,
        transformSpecificationClone: true
    })

    // --- Plugins ---
    await app.register(cors, {
        origin: true,
        credentials: true
    })

    await app.register(jwt, {
        secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET es requerido') })()
    })

    // --- Base de datos ---
    await connectDB()

    // --- Rutas ---
    await app.register(authPlugin, { prefix: '/api/auth' })

    // Health check
    app.get(
        '/api/healthz',
        {
            schema: {
                tags: ['Sistema'],
                summary: 'Estado del servicio',
                description: 'Verifica que el servicio esté corriendo correctamente',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'ok' },
                            service: { type: 'string', example: 'scoph-auth' },
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        },
        async () => ({
            status: 'ok',
            service: 'scoph-auth',
            timestamp: new Date().toISOString()
        })
    )

    return app
}
