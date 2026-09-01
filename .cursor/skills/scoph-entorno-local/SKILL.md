---
name: scoph-entorno-local
description: Levantar, instalar o depurar SCOPH en local (pnpm, Docker Compose, Mongo, .env, healthchecks, Vite, Expo). Usar cuando pidan correr, puertos, CORS, o fallos de conexión entre servicios.
---

# Entorno local SCOPH

Sigue `docs/ENTORNO-LOCAL.md`. No inventes puertos.

## Orden

1. ¿El usuario pidió levantarlo? Si no, solo explica.
2. Node 22 + pnpm. Mongo aparte.
3. Copia `.env.example` → `.env` en la raíz. Mismo `JWT_SECRET` para las cuatro APIs.
4. Auth usa `MONGODB_URI`. Core/workday/report usan `MONGO_URI`.
5. Host: `pnpm install && pnpm dev` por servicio. Docker local: `docker compose up --build` (solo APIs). Producción: Render `https://scoph.onrender.com`.
6. Health: `3020/api/healthz`, `3021|3022|3023/api/v1/health`.
7. Web: `scoph-frontend` `pnpm dev`. Móvil: IP LAN en teléfono físico.

## Diagnóstico rápido

- 401 masivo → JWT distinto.
- Auth no conecta Mongo → nombre de variable.
- Compose + Mongo host → `host.docker.internal`.
- Móvil → no uses localhost.
- Refresh 404 → deuda; no existe `POST /api/auth/refresh`.
