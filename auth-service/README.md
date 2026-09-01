# auth-service

Identidad y JWT del Gestor de Jornadas Médicas (SCOPH).

- Puerto: **3020**
- Health: `GET /api/healthz`
- Docs: `GET /api/docs`
- Env: el `.env` de la raíz del repo (`MONGODB_URI`, `JWT_SECRET`, `RESEND_*`).

```bash
pnpm install
pnpm dev
pnpm test
```

Contexto: [docs/ARQUITECTURA.md](../docs/ARQUITECTURA.md).
