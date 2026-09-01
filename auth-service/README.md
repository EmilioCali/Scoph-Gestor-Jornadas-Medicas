# auth-service

Identidad y JWT del Gestor de Jornadas Médicas (SCOPH).

- Puerto: **3020**
- Health: `GET /api/healthz`
- Docs: `GET /api/docs`
- Env: `.env.example` → `.env` (`MONGODB_URI`, `JWT_SECRET`, `RESEND_*` en Render).

```bash
pnpm install
pnpm dev
pnpm test
```

Contexto: [docs/ARQUITECTURA.md](../docs/ARQUITECTURA.md).
