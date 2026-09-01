# Entorno local

Esta guía es para **cuando** se pida levantar el proyecto. Leerla no
implica instalar ni arrancar servicios.

## Qué necesitas

- Node.js **22**
- **pnpm** 10 (el repo declara `packageManager: pnpm@10.29.3` en varios paquetes)
- MongoDB 7+ en localhost o Atlas
- Docker Engine + Compose, opcional, solo para los backends
- Git

Mongo no está definido en `docker-compose.yml`. Si usas contenedores
para las APIs y Mongo en el host, en las URI usa
`host.docker.internal` (no `localhost` desde dentro del contenedor).

## Puertos que debe quedar libres

| Puerto | Proceso |
| --- | --- |
| 27017 | MongoDB (si es local) |
| 3020 | auth-service |
| 3021 | workday-service |
| 3022 | core-service |
| 3023 | report-service |
| 5173 | Vite (`scoph-frontend`) |

## Variables de entorno

Un solo archivo en la **raíz** del repo:

```bash
cp .env.example .env
```

Rellena al menos:

1. `JWT_SECRET` — un valor, lo leen las cuatro APIs.
2. `MONGODB_URI` (auth) y `MONGO_URI` (core, workday, report).
3. `ADMIN_*` y correo (`RESEND_*` en Render; `SMTP_*` solo local si aplica).
4. `FRONTEND_URL` / `CORS_ORIGIN`.
5. Vite lee `VITE_*` del mismo `.env` (`envDir` en `scoph-frontend/vite.config.js`).
6. Móvil: sigue usando `scoph-mobile/.env` (IP LAN). Fuera de este archivo.

`pnpm dev` / `pnpm start` de cada API cargan `../.env`. Compose también.
No pegues secretos de producción en Git. No hagas commit de `.env`.

Las plantillas `*/.env.example` de cada paquete solo apuntan a este archivo.

## Opción A — APIs en el host (desarrollo)

En cuatro terminales (o tmux):

```bash
cd auth-service && pnpm install && pnpm dev
cd workday-service && pnpm install && pnpm dev
cd core-service && pnpm install && pnpm dev
cd report-service && pnpm install && pnpm dev
```

Health esperado:

```text
curl -s http://localhost:3020/api/healthz
curl -s http://localhost:3021/api/v1/health
curl -s http://localhost:3022/api/v1/health
curl -s http://localhost:3023/api/v1/health
```

Swagger: `http://localhost:3020/api/docs` (y 3021–3023).

Web:

```bash
cd scoph-frontend && pnpm install && pnpm dev
```

Móvil:

```bash
cd scoph-mobile && pnpm install && pnpm start
```

## Opción B — APIs con Docker Compose

Los Dockerfiles esperan el `.env` de la raíz (opcional en compose:
`required: false`). Compose fuerza `PORT` 3020–3023 y las URLs internas
`http://<servicio>:<puerto>`.

```bash
docker compose up --build
```

Sigue corriendo frontend y móvil **en el host**, apuntando a
`http://localhost:3020` … `3023`.

## Producción — un contenedor en Render

No uses Vercel para este entorno. El Blueprint (`render.yaml`) define
el servicio `scoph`. Imagen: `deploy/Dockerfile`.

Al despertar, nginx y las cuatro APIs arrancan en el mismo proceso
supervisor. El navegador ve la pantalla de carga de Render y luego
la SPA (PWA). Login usa `/auth/api/auth/...`.

En el dashboard del servicio **único** pega las claves de `.env.example`
(raíz), las mismas que en tu `.env` local (no las subas a Git):

- `MONGODB_URI` (auth), `MONGO_URI` (core/workday/report)
- `JWT_SECRET` (el mismo)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (no SMTP)
- `FRONTEND_URL` y `CORS_ORIGIN` = `https://<servicio>.onrender.com`
- `ADMIN_*`

Health: `GET /auth/api/healthz`.

No construyas ni arranques Docker salvo que lo pidan.

Apaga los cuatro APIs viejos de Render y el proyecto Vercel cuando
el servicio único responda.

## Primer usuario

auth-service ejecuta seed de `SUPER_ADMIN` si no hay usuarios, usando
`ADMIN_CORREO`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, etc.
(`auth-service/src/scripts/seedAdmin.js`).

## Pruebas

```bash
pnpm test   # dentro de cada *-service
```

## Fallos frecuentes

| Síntoma | Causa típica |
| --- | --- |
| 401 en todos los servicios | `JWT_SECRET` distinto entre APIs |
| Auth no conecta a Mongo | Usaste `MONGO_URI` en vez de `MONGODB_URI` |
| Compose no llega a Mongo | URI con `localhost` dentro del contenedor |
| Frontend en blanco / CORS | `FRONTEND_URL` / `CORS_ORIGIN` no incluyen el origen Vite |
| Correo falla en Render | Falta `RESEND_*` o el `from` no está verificado; SMTP está bloqueado |
| Móvil no llama APIs | `localhost` en un teléfono físico |
| Refresh 404 en móvil | `POST /api/auth/refresh` no existe en auth (deuda conocida) |
