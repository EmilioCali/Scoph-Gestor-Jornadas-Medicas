---
name: scoph-frontend
description: Cambios en scoph-frontend (rutas React, páginas, Zustand, axios, Tailwind). Usar al tocar la SPA web, roles de UI, dashboard, inventario web o reportes en el navegador.
---

# Frontend web SCOPH

- Entrada de rutas: `scoph-frontend/src/app/routes/AppRouter.jsx`.
- Features: `src/features/<dominio>/`. Compartido: `src/shared/`.
- Auth store Zustand; axios con Bearer. 401 → login.
- `VITE_AUTH_SERVICE_URL`, `VITE_WORKDAY_SERVICE_URL`, `VITE_CORE_SERVICE_URL`, `VITE_REPORTS_SERVICE_URL` en el `.env` de la raíz. En el build de Render: `/auth`, `/workday`, `/core`, `/report`. PWA: `vite-plugin-pwa` (no cachear esas rutas).
- Roles UI: `ADMIN` + `SUPER_ADMIN` para panel; `MEDICO` a jornadas.
- No agregues MUI/chakra/shadcn salvo que el ciclo lo pida. Tailwind ya está.
- Verifica el flujo en navegador si cambias UI (login, la pantalla tocada, un rol no autorizado).
- Lint: `pnpm lint`. Build: `pnpm build`.

Páginas huérfanas: no las conectes sin ticket. Ver `.cursor/rules/frontend.mdc`.
