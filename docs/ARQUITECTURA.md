# Arquitectura

SCOPH es un sistema de microservicios HTTP, no un monolito y no un
bus de eventos. Cada API tiene su proceso, su `package.json` y su
conexión a MongoDB. El cliente web y el móvil hablan con las cuatro
APIs usando JWT.

## Responsabilidades

### auth-service

Identidad. Model `User` (`usr_<hex>`). Login, registro (según rol),
verificación de correo, reset de contraseña, seed del primer
`SUPER_ADMIN`. Emite JWT `{ id, rol, username }` con expiración de 8 h.

Tras cambios de usuario puede auditar contra core:
`POST {CORE_SERVICE_URL}/api/v1/auditoria`.

### workday-service

Jornadas médicas (`Workday`). Estados:
`PLANNED | IN_PROGRESS | FINISHED | CANCELLED`.

Un temporizador (~15 min) sincroniza estados y, al cierre automático,
pide a core el retorno de inventario:
`POST .../api/v1/movimientos/retorno-automatico-jornada`.
Ese job firma un JWT de sistema con rol `SUPER_ADMIN` (ver
[SEGURIDAD.md](./SEGURIDAD.md)).

### core-service

Núcleo de farmacia: medicamentos, categorías, unidades, inventario
central, inventario por jornada, movimientos, auditoría.

Consulta jornadas en workday:
`GET {WORKDAY_SERVICE_URL}/api/v1/workdays/:id`.

### report-service

No posee modelos de negocio. Se conecta a Mongo y **agrega por HTTP**
auth, workday y core (`src/config/services.js`). Genera Excel (xlsx) y
PDF (pdfkit).

### scoph-frontend

SPA de administración. Axios en `src/shared/apis/axios.config.js`.
Estado de sesión en Zustand (`auth-scoph-storage`).

### scoph-mobile

Cliente de campo. SecureStore + Axios. Las URLs deben ser la IP LAN
si se prueba en teléfono físico.

## Datos

Solo MongoDB. Compose **no** levanta Mongo.

| Modelo | Servicio | Archivo |
| --- | --- | --- |
| User | auth | `auth-service/src/models/user.model.js` |
| Workday | workday | `workday-service/src/workdays/workday.model.js` |
| Medicine | core | `core-service/src/medicines/medicine.model.js` |
| CentralInventory | core | `core-service/src/inventory/centralInventory.model.js` |
| WorkdayInventory | core | `core-service/src/inventory/workdayInventory.model.js` |
| Movement | core | `core-service/src/movements/movement.model.js` |
| Category | core | `core-service/src/categories/category.model.js` |
| MeasureUnit | core | `core-service/src/measureUnits/measureUnit.model.js` |
| PackagingUnit | core | `core-service/src/packagingUnits/packagingUnit.model.js` |
| Audit | core | `core-service/src/modules/audit/audit.model.js` |

## Autenticación entre servicios

No hay mTLS ni API keys internas. Un servicio llama a otro reenviando
`Authorization: Bearer` del usuario, o (el job de workday) con un JWT
de sistema. Por eso **el secreto JWT es compartido**.

## Despliegue

Producción web: un Web Service Docker en Render
([scophgt/SCOPH](https://github.com/scophgt/SCOPH)), servicio `scoph`,
URL `https://scoph.onrender.com`.

- Blueprint: `render.yaml` + `deploy/Dockerfile`.
  nginx sirve la SPA y enruta `/auth`, `/workday`, `/core`, `/report`
  a Fastify en `127.0.0.1:3020–3023`. Hibernan juntos. Mongo fuera.
- Correo: Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
  SMTP del plan gratuito de Render está bloqueado.
- `FRONTEND_URL` y `CORS_ORIGIN` = `https://scoph.onrender.com`.
- Local: Compose solo APIs; Vite en el host.
- Móvil: Expo / stores; no entra en la imagen.

## Layout interno (backends)

No es idéntico en los cuatro:

- **auth:** `src/modules/auth`, `src/models`, `src/middlewares`, `src/scripts`.
- **core:** carpetas por dominio (`medicines`, `inventory`, `movements`, …)
  más `modules/audit`.
- **workday:** `src/workdays/` colocalizado (model, controller, routes).
- **report:** `src/reports/` + `src/config/services.js`.

Al agregar código, copia el estilo **del servicio que estás editando**,
no unifique la estructura “por gusto”.
