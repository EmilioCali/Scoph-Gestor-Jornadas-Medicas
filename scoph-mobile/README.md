# App móvil SCOPH

Cliente Expo / React Native para operación en campo.

Documentación del sistema: [README de la raíz](../README.md).

```bash
cp .env.example .env
pnpm install
pnpm start
```

En un teléfono físico no uses `localhost`: pon la IP LAN de tu
máquina en las variables `*_SERVICE_URL`. Detalle en
[docs/ENTORNO-LOCAL.md](../docs/ENTORNO-LOCAL.md).

El cliente contempla refresh token; **auth-service aún no expone**
`POST /api/auth/refresh` (ver [docs/SEGURIDAD.md](../docs/SEGURIDAD.md)).
