# AGENTS.md — manual para agentes de código

Este archivo es la **primera lectura** de cualquier agente (Cursor u
otro) que trabaje en SCOPH. Si hay conflicto entre un hábito genérico
y este repo, gana este repo.

## Quiénes somos

- Producto privado de **uso exclusivo de SCOPH**.
- Código de **Fundación Kinal**, proceso formativo de **6to Perito en
  Computación**. Mantenimiento anual por la promoción del ciclo.
- Colaboración externa: no. Ver `LICENSE`, `COLABORACION.md`,
  `CONTRIBUTING.md`.

No sugieras publicar el repo, cambiar a MIT, ni aceptar PRs de
terceros.

## Antes de tocar código

1. Lee este archivo completo.
2. Abre la skill de `.cursor/skills/` que coincida con la tarea.
3. Confirma el paquete correcto (`auth-service`, `workday-service`,
   `core-service`, `report-service`, `scoph-frontend`, `scoph-mobile`).
4. No levantes Docker, Vite ni Expo **a menos que el usuario lo pida**.
   La fase actual puede ser solo documentación.

## Mapa rápido

| Ruta | Qué hay |
| --- | --- |
| `auth-service/` | Fastify, usuarios, JWT, correo. Puerto **3020**. Env: `MONGODB_URI`. |
| `workday-service/` | Jornadas. Puerto **3021**. Env: `MONGO_URI`. |
| `core-service/` | Inventario y catálogo. Puerto **3022**. Env: `MONGO_URI`. |
| `report-service/` | BFF de reportes (HTTP a los otros). Puerto **3023**. |
| `scoph-frontend/` | React 19 + Vite 8 + Zustand + Tailwind 4. |
| `scoph-mobile/` | Expo 55. En dispositivo físico usa IP LAN, no localhost. |
| `docker-compose.yml` | Solo los 4 backends (local). Mongo va afuera. |
| `deploy/` | Dockerfile único (SPA + nginx + 4 APIs) para Render. |
| `render.yaml` | Web Service Docker `scoph` → `https://scoph.onrender.com`. |

No hay `package.json` en la raíz ni workspace de pnpm. Cada paquete se
instala y corre por separado.

## Convenciones innegociables

- Gestor: **pnpm**. `report-service` bloquea npm (`preinstall`).
- Backends: **Fastify + ESM**. No migres a Express.
- JWT: `Authorization: Bearer`. Mismo `JWT_SECRET` en los cuatro APIs.
- Prefijos: auth usa `/api/auth` y health `/api/healthz`. Los demás usan
  `/api/v1` y health `/api/v1/health`.
- Respuestas: auth suele `{ ok, message }`. core/workday/report usan
  `{ success, message, data }` (`src/utils/response.js`).
- Roles: `authenticate` + `requireRole`. `SUPER_ADMIN` tiene pase total.
- Idioma de dominio: español en APIs (`movimientos`, `inventario-central`,
  `auditoria`, `reportes`).
- Zona horaria de jornadas: `America/Guatemala`.
- No commits de secretos. `.env` está en `.gitignore`. Si un `.env` ya
  está trackeado, no lo amplíes con credenciales.

## Variables que se confunden

- Auth: `MONGODB_URI`. Core, workday, report: `MONGO_URI`.
- Compose/Render: puertos 3020–3023. Defaults de código sin `PORT`:
  8080 / 3001 / 3002 / 3003. Documenta y usa **3020–3023**.
- Frontend: `VITE_*_SERVICE_URL` en el `.env` de la raíz.
- Móvil: `AUTH_SERVICE_URL` y hermanos en `scoph-mobile/.env.example`.

## Skills del repo (léelas cuando apliquen)

| Skill | Cuándo |
| --- | --- |
| `.cursor/skills/scoph-contexto/SKILL.md` | Cualquier tarea nueva o al orientar a otro agente |
| `.cursor/skills/scoph-entorno-local/SKILL.md` | Instalar, puertos, Docker, `.env`, health |
| `.cursor/skills/scoph-backend/SKILL.md` | Endpoints, modelos, middlewares Fastify |
| `.cursor/skills/scoph-frontend/SKILL.md` | Rutas web, Zustand, axios |
| `.cursor/skills/scoph-auth-roles/SKILL.md` | Login, JWT, roles, seed admin |
| `.cursor/skills/scoph-inventario-jornadas/SKILL.md` | Medicamentos, lotes, movimientos, jornadas |
| `.cursor/skills/scoph-documentar/SKILL.md` | Cada vez que cambies contratos o env |

Reglas Cursor siempre activas: `.cursor/rules/scoph.mdc`.

## Cómo implementar

- Cambia el menor número de paquetes. Un ticket de inventario no
  reescribe auth.
- Replica la carpeta del módulo que ya existe en ese servicio.
- Si agregas ruta, regístrala en el `app.js`/`routes` del servicio y
  en `docs/SERVICIOS.md`.
- Prueba con `pnpm test` en el paquete tocado.
- Actualiza `.env.example` de la raíz si agregas variables (nunca el valor secreto).

## Deuda conocida (no “la arregles” de paso)

Documentada en `docs/SEGURIDAD.md`. No la tomes como encargo implícito:

- El móvil llama `POST /api/auth/refresh`; **auth-service no expone
  refresh**.
- `scoph-frontend/.env` y `scoph-mobile/.env` están versionados (solo
  URLs; igual es mala práctica).
- Filename `core-service/src/inventory/inventroy.routes.js` (typo).
- Auth a veces hace fallback de auditoría a `localhost:3001`.

## Git

- Rama por ticket. No empujes secretos.
- Mensajes en español o inglés, pero claros (`docs: ...`, `feat: ...`).
- No reescribas historia de `main`.

## Tono con estudiantes y con SCOPH

Eres apoyo de un ciclo formativo. Explica decisiones. No inventes
requisitos clínicos. No uses datos reales de pacientes en ejemplos.
