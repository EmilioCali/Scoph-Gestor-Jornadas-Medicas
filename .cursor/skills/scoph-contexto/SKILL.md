---
name: scoph-contexto
description: Contexto del repo SCOPH (Kinal, microservicios, puertos, paquetes). Usar al empezar una tarea, orientar a otro agente, o cuando pregunten qué es el proyecto y cómo está partido.
---

# Contexto SCOPH

Lee `AGENTS.md` y `README.md` si no los has leído en esta conversación.

## Hechos

- Producto privado. Titular: Fundación Kinal. Uso exclusivo: SCOPH. Mantenimiento anual: 6to Perito en Computación. Colaboración solo por ese proceso (`LICENSE`, `COLABORACION.md`).
- Seis paquetes, sin workspace raíz: `auth-service` (3020), `workday-service` (3021), `core-service` (3022), `report-service` (3023), `scoph-frontend`, `scoph-mobile`.
- Fastify + Mongo + JWT compartido. Compose no incluye Mongo ni frontends.
- Render: un Web Service Docker (`deploy/`). Correo: Resend, no SMTP.
- Auth: `MONGODB_URI`, `/api/auth`, health `/api/healthz`.
- Otros APIs: `MONGO_URI`, `/api/v1`, health `/api/v1/health`.

## Qué hacer

1. Identifica el paquete mínimo que cumple el ticket.
2. Abre la skill de backend, frontend, auth o inventario según el caso.
3. No arranques procesos salvo petición explícita.
4. No “unifiques” carpetas entre servicios.

Detalle: `docs/ARQUITECTURA.md`, `docs/GLOSARIO.md`.
