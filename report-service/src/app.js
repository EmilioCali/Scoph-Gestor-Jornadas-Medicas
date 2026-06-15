import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import reportesRoutes from "./reports/reports.routes.js";

const app = Fastify({
  ajv: {
    customOptions: {
      strict: false,
      keywords: ["example"],
    },
  },
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

//seguridad y limitacion de peticiones
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

await app.register(helmet);

await app.register(rateLimit, {
  max: Number(process.env.RATE_LIMIT_MAX || 500),
  timeWindow: "1 minute",
  errorResponseBuilder: (req, context) => ({
    success: false,
    message: `Demasiadas peticiones desde esta IP, por favor intente nuevamenente despues de ${Math.ceil(context.ttl / 1000)} segundos`,
    error: "RATE_LIMIT_EXCEEDED",
    retryAfter: context.after,
  }),
});

await app.register(jwt, {
  secret:
    process.env.JWT_SECRET ||
    (() => {
      throw new Error("JWT_SECRET es requerido");
    })(),
});

//documentacion Swagger / OpenAPI
await app.register(swagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "SCOPH Report Service API",
      description:
        "Servicio para consulta de reportes, metricas, alertas, auditorias y exportaciones.",
      version: "1.0.0",
      contact: {
        name: "Equipo SCOPH",
      },
    },
    tags: [
      { name: "Sistema", description: "Estado del servicio" },
      {
        name: "Reportes",
        description:
          "Consultas operativas de inventario, jornadas y movimientos",
      },
      { name: "Alertas", description: "Alertas de stock bajo y vencimientos" },
      {
        name: "Exportaciones",
        description: "Descarga de reportes en Excel y PDF",
      },
      {
        name: "Auditoria",
        description: "Consulta de eventos auditados y consistencia de datos",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT emitido por Auth Service",
        },
      },
    },
  },
});

await app.register(swaggerUi, {
  routePrefix: "/api/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
    tryItOutEnabled: true,
  },
  staticCSP: true,
  transformSpecificationClone: true,
});

await app.register(reportesRoutes, {
  prefix: "/api/v1",
});

const healthRateLimitErrorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: {
      type: "string",
      example:
        "Demasiadas peticiones desde esta IP, por favor intente nuevamenente despues de 60 segundos",
    },
    error: { type: "string", example: "RATE_LIMIT_EXCEEDED" },
    retryAfter: { type: "string", example: "1 minute" },
  },
};

const healthServerErrorSchema = {
  type: "object",
  properties: {
    status: { type: "string", example: "error" },
    message: { type: "string", example: "Internal Server Error" },
  },
};

//healtycheck
app.get(
  "/api/v1/health",
  {
    schema: {
      tags: ["Sistema"],
      summary: "Estado del servicio",
      description:
        "Verifica que el Report Service este corriendo correctamente.",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            message: {
              type: "string",
              example: "Servicio de Reportes funcionando correctamente",
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        429: healthRateLimitErrorSchema,
        500: healthServerErrorSchema,
      },
    },
  },
  async () => ({
    status: "ok",
    message: "Servicio de Reportes funcionando correctamente",
    timestamp: new Date().toISOString(),
  }),
);

//manejo de errores
app.setErrorHandler((error, request, reply) => {
  request.log.error({
    message: error.message,
    stack: error.stack,
  });

  if (error.error === "RATE_LIMIT_EXCEEDED" || error.retryAfter) {
    return reply.status(429).send(error);
  }

  const statusCode = error.statusCode || 500;
  const responseBody = {
    success: false,
    message: error.message || "Internal Server Error",
  };

  
  if (statusCode === 401 || statusCode === 403) {
    responseBody.error = statusCode === 401 ? "UNAUTHORIZED" : "FORBIDDEN";
  }

  reply.status(statusCode).send(responseBody);
});

export default app;
