# Seguridad y datos

## Clasificación

Código y documentación: **privados** (Fundación Kinal).  
Uso del sistema en operación: **exclusivo SCOPH**.  
Datos de jornadas, inventario y usuarios: **confidenciales**.

En desarrollo usa datos sintéticos. No copies bases de producción al
portátil de un estudiante sin autorización y anonimización.

## Secretos

- Nunca commits de `.env` con Mongo, JWT, SMTP, Resend o `ADMIN_PASSWORD`.
- Plantillas: `.env.example` en la raíz (un archivo). Los `*/.env.example` de cada paquete solo remiten ahí.
- `JWT_SECRET` compartido: si se filtra uno, se filtran los cuatro APIs.
- Render: variables `sync: false` en `render.yaml`. El `Dockerfile`
  no copia `.env`. En producción usa Resend, no SMTP.
- Atlas: la IP de un Web Service free **cambia** al despertar; no
  filtres una sola IP.

### Estado actual del repo

Están versionados `scoph-frontend/.env` y `scoph-mobile/.env` con URLs
de localhost/LAN, no con secretos de base de datos. Sigue siendo mala
práctica. No agregues credenciales a esos archivos. El example del
frontend es `scoph-frontend/.env.example`.

## Superficie de red

- Compose publica 3020–3023 en la máquina anfitriona.
- En Render el público es un solo puerto (nginx); 3020–3023 son internos.
- Mongo no debe quedar abierto a internet.
- CORS: `FRONTEND_URL` y `CORS_ORIGIN` = origen de la SPA. Same-origin
  en el contenedor único. No uses `*` en producción.

## Deuda conocida (no es backlog silencioso)

1. **Sin refresh token en auth.** El móvil espera `/api/auth/refresh`.
   Corregirlo es un ticket explícito, no un extra en otro cambio.
2. **JWT de sistema en workday** con rol `SUPER_ADMIN` para el job de
   estados/retorno. Trátalo como privilegio alto; no lo reutilices en
   el cliente.
3. **Fallback `localhost:3001`** en auditoría de auth vs puerto 3022.
4. **Typo** `inventroy.routes.js`.
5. Cliente huérfano `workday-service/src/workdays/workday.client.js`
   (`/workdays/active/:userId`).

## Qué debe hacer un agente

- Si descubre un secreto real en el historial, avisa; no lo reproduzcas
  en logs ni en README.
- No deshabilites `authenticate` “para probar”.
- No relajes `requireRole` sin actualizar `docs/ROLES-Y-PERMISOS.md`.
- Rate limit ya existe en core/workday/report (`RATE_LIMIT_MAX`).
