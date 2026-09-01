# Servicios, rutas y scripts

Puertos de referencia: **3020–3023** (Compose/Render). Docs Swagger en
`/api/docs` de cada API.

## auth-service — :3020

Scripts: `pnpm dev`, `pnpm start`, `pnpm test`.  
Health: `GET /api/healthz`.  
Env: `auth-service/.env.example` (`MONGODB_URI`, no `MONGO_URI`).

Rutas de aplicación (prefijo `/api/auth`): login, registro, verify-email,
reset de contraseña, CRUD de usuarios según rol. El detalle vivo está
en Swagger y en `auth-service/src/modules/auth`.

## workday-service — :3021

Scripts: `pnpm dev`, `pnpm start`, `pnpm test`.  
Health: `GET /api/v1/health`.

| Método | Ruta | Notas |
| --- | --- | --- |
| POST | `/api/v1/workdays` | Alta (`SUPER_ADMIN`) |
| GET | `/api/v1/workdays` | Listado; `MEDICO` solo las suyas |
| GET | `/api/v1/workdays/:id` | Detalle; `MEDICO` 403 si no está asignado |
| PUT | `/api/v1/workdays/:id` | Actualiza datos; el status se ignora aquí |
| PATCH | `/api/v1/workdays/:id/doctors` | Asignar médicos (`ADMIN`, `SUPER_ADMIN`) |
| PATCH | `/api/v1/workdays/:id/status` | Cambio de estado (`SUPER_ADMIN`) |
| DELETE | `/api/v1/workdays/:id` | Baja (`SUPER_ADMIN`) |

## core-service — :3022

Scripts: `pnpm dev`, `pnpm start`, `pnpm test`, `pnpm seed:report`.  
Health: `GET /api/v1/health`.

Prefijo `/api/v1`:

- `/medicines`
- `/categories`
- `/measure-units`
- `/packaging-units`
- `/inventario-central`
- `/inventario-jornada/:jornadaId`
- `/movimientos` y subrutas (entrada, receta, transferencia, retorno, …)
- `/auditoria`

Hay un typo histórico en el archivo
`core-service/src/inventory/inventroy.routes.js`. No lo renombres en un
cambio colateral: rompe imports.

## report-service — :3023

Scripts: `pnpm dev`, `pnpm start`, `pnpm test`.  
Health: `GET /api/v1/health`.

Prefijo `/api/v1/reportes/`, entre otras:

- `dashboard`
- `stock`, `vencimientos`, `movimientos`
- `consumo-jornada/:id`, `jornada/:jornadaId`
- `alertas/*`
- `exportar/*/excel` y `exportar/*/pdf`
- `auditoria`, `consistencia`

Report llama a los otros servicios; si auth/core/workday están caídos,
los reportes fallan aunque report “esté arriba”.

## scoph-frontend

Scripts: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm preview`.  
Rutas en `src/app/routes/AppRouter.jsx`:

| Ruta | Roles |
| --- | --- |
| `/login`, `/recover-password`, `/verify-email` | público |
| `/change-password` | autenticado |
| `/dashboard`, `/usuarios`, `/inventario/*`, `/reportes` | ADMIN, SUPER_ADMIN |
| `/jornadas` | cualquier autenticado |

`MEDICO` redirige a `/jornadas`.

## scoph-mobile

Scripts: `pnpm start`, `pnpm android`, `pnpm ios`, `pnpm web`, `pnpm lint`.  
Tabs de admin solo para `ADMIN` y `SUPER_ADMIN`. Jornadas para todos.

## Docker y Render

- `docker-compose.yml`: cuatro servicios, red `scoph`, healthchecks.
- `render.yaml`: `scoph-auth-api`, `scoph-workday-api`, `scoph-core-api`,
  `scoph-report-api`. Variables `sync: false` no van a Git.

## Cómo actualizar este archivo

Si agregas o mueves una ruta, edita aquí **en el mismo PR**. Los
agentes deben tratar Swagger + este doc como contrato humano.
