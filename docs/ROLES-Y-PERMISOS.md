# Roles y permisos

## Roles

Definidos en el modelo de usuario de auth-service:

- `SUPER_ADMIN` — administración total. `requireRole` lo deja pasar
  aunque no esté en la lista.
- `ADMIN` — operación de inventario, usuarios (listado), reportes,
  jornadas (no necesariamente altas destructivas).
- `MEDICO` — foco en jornadas. Sin dashboard web de inventario.

Payload JWT: `{ id, rol, username }`, expiración **8 horas**.
Cabecera: `Authorization: Bearer <token>`. No hay cookies de sesión.

## Middleware

En cada backend: `src/middlewares/authenticate.js`

- `authenticate` → `request.jwtVerify()`. 401 si falla.
- `requireRole(...roles)` → autentica y comprueba `request.user.rol`.

Copia este patrón. No implementes un segundo sistema de permisos.

## Mapa práctico (web)

| Área | SUPER_ADMIN | ADMIN | MEDICO |
| --- | --- | --- | --- |
| Dashboard | sí | sí | no (home → jornadas) |
| Usuarios | sí (incluye altas/bajas típicas de super) | listado / según API | no |
| Catálogo, categorías, inventario, movimientos | sí | sí | no |
| Reportes | sí | sí | no |
| Jornadas (ver) | sí | sí | sí |
| Jornadas (crear / borrar / estado) | sí (API) | limitado | no |

La fuente de verdad de cada endpoint es el `preHandler` de la ruta,
no este cuadro. Si cambias un `requireRole`, actualiza este archivo.

## Clientes

- Web: `ProtectedRoute` + `RequireRole` en `AppRouter.jsx`.
  Axios reenvía el Bearer; 401 → logout → `/login`.
- Móvil: mismas reglas de tabs. El código contempla refresh token
  (`POST /api/auth/refresh`) **pero el backend no lo implementa**.
  No documentes refresh como funcional.

## Seed

El primer `SUPER_ADMIN` nace de `ADMIN_*` en el entorno de auth.
No dejes `ADMIN_PASSWORD` débil en producción ni lo subas a Git.
