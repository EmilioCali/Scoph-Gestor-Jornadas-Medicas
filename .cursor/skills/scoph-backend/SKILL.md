---
name: scoph-backend
description: Crear o cambiar endpoints Fastify en auth-service, workday-service, core-service o report-service. Usar al agregar rutas, modelos Mongoose, middlewares, clientes HTTP internos o tests node --test.
---

# Backends SCOPH

1. Trabaja **dentro del servicio dueño del dato**. Inventario no se modela en workday. Report no duplica esquemas de core: llama por HTTP.
2. Copia el patrón de carpetas de ese servicio (auth es `modules/`; core es por dominio).
3. Protege con `authenticate` / `requireRole` del propio servicio.
4. Registra la ruta donde ya se registran las demás (`app.js` o equivalente).
5. Mantén el shape de respuesta del servicio (`ok` vs `success/data`).
6. Añade o extiende `pnpm test` (`node --test`).
7. Actualiza `docs/SERVICIOS.md` y Swagger queda cubierto por las rutas Fastify.

## Env e inter-servicio

- URLs solo desde env (`CORE_SERVICE_URL`, `WORKDAY_SERVICE_URL`, `AUTH_SERVICE_URL`, `*_HOSTPORT`).
- Reenvía `Authorization`. No hardcodees `localhost:3001`.
- Nueva variable → `.env.example` del servicio + `docs/ENTORNO-LOCAL.md`.

## No hagas

- Express, TypeScript forzado, npm, monorepo de golpe.
- Renombrar `inventroy.routes.js` en el mismo PR que otra cosa.
