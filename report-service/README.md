# report-service

Agrega métricas y exporta Excel/PDF. No es dueño de los modelos de
negocio: llama a auth, workday y core por HTTP.

- Puerto: **3023**
- Health: `GET /api/v1/health`
- Docs: `GET /api/docs`

```bash
pnpm install
pnpm dev
pnpm test
```

Las otras tres APIs deben estar vivas para que los reportes funcionen.
