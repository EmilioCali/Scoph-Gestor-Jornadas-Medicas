---
name: scoph-auth-roles
description: Autenticación JWT, usuarios, roles SUPER_ADMIN ADMIN MEDICO, correo de verificación/reset, seed admin, CORS. Usar al tocar auth-service, login web/móvil, guards o requireRole.
---

# Auth y roles

Fuente: `docs/ROLES-Y-PERMISOS.md` y `auth-service/src/middlewares/authenticate.js`.

## Reglas

- JWT Bearer, payload `{ id, rol, username }`, 8 h. Secreto compartido.
- `SUPER_ADMIN` bypasea `requireRole`. No elimines ese bypass sin ticket y docs.
- Seed: `auth-service/src/scripts/seedAdmin.js` + env `ADMIN_*`.
- Correo: SMTP y/o Resend. No dejes API keys en Git.
- CORS: `FRONTEND_URL`, `CORS_ORIGIN`.
- Móvil: **no hay** `POST /api/auth/refresh` en el backend. Implementarlo es un ticket propio (auth + clientes).

## Al cambiar un permiso

1. Cambia el `preHandler` de la ruta.
2. Ajusta UI (`RequireRole` / tabs móviles) si aplica.
3. Actualiza `docs/ROLES-Y-PERMISOS.md`.
4. Prueba 401 (sin token), 403 (rol incorrecto) y 200 (rol válido + super admin).
