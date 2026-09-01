# Cliente web de SCOPH

SPA React + Vite del Gestor de Jornadas Médicas.

Documentación del sistema: [README de la raíz](../README.md).
Arranque local: [docs/ENTORNO-LOCAL.md](../docs/ENTORNO-LOCAL.md).

```bash
cp ../.env.example ../.env   # un solo archivo en la raíz del repo
pnpm install
pnpm dev
```

Rutas y roles: `src/app/routes/AppRouter.jsx` y
[docs/ROLES-Y-PERMISOS.md](../docs/ROLES-Y-PERMISOS.md).

En producción la SPA y las APIs salen de `https://scoph.onrender.com`
(`/auth`, `/workday`, `/core`, `/report`). PWA: `vite-plugin-pwa`.
