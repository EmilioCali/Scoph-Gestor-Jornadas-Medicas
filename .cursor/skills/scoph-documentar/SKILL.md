---
name: scoph-documentar
description: Actualizar README, docs/, AGENTS.md, LICENSE, colaboración o skills Cursor. Usar cuando cambien contratos, al documentar, o al revisar que un PR de código no dejó docs viejos.
---

# Documentar SCOPH

## Dónde va cada cosa

| Cambio | Archivos |
| --- | --- |
| Titularidad / uso / quién contribuye | `LICENSE`, `COLABORACION.md`, `CONTRIBUTING.md` |
| Visión y tabla de paquetes | `README.md` |
| Instrucciones para agentes | `AGENTS.md`, `.cursor/rules/`, `.cursor/skills/` |
| Rutas, env, puertos | `docs/SERVICIOS.md`, `docs/ENTORNO-LOCAL.md`, `.env.example` |
| Permisos | `docs/ROLES-Y-PERMISOS.md` |
| Secretos / deuda | `docs/SEGURIDAD.md` |

## Estilo

- Español, frases cortas, tablas. Sin lorem. Sin secretos.
- LICENSE permanece privada (Kinal / SCOPH). No volver a MIT.
- Skills con `description` que dispare en tareas reales (verbos: levantar, endpoint, rol, inventario…).
- `.gitignore` debe **versionar** `.cursor/rules` y `.cursor/skills` (no toda la carpeta `.cursor` local).
