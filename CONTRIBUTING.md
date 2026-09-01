# Colaboración

Este repositorio **no es un proyecto open source**. Las contribuciones
solo se aceptan dentro del proceso formativo de **Sexto Perito en
Computación** de **Fundación Kinal**.

Lee primero [LICENSE](./LICENSE) y [README.md](./README.md).

## Quién puede colaborar

| Perfil | Puede contribuir | Condición |
| --- | --- | --- |
| Alumnos de 6to Perito en Computación (Fundación Kinal) | Sí | Ciclo lectivo asignado al mantenimiento de SCOPH |
| Docentes / coordinación académica de Kinal | Sí | Dirección y revisión del proceso formativo |
| Promociones siguientes del mismo grado | Sí | Relevo anual de mantenimiento |
| SCOPH (personal operativo) | Feedback de uso, no código salvo pacto | Canal institucional con Kinal |
| Terceros ajenos al proceso formativo | No | Salvo autorización escrita de Fundación Kinal |

Si no formas parte de ese proceso, no envíes pull requests, forks
públicos ni parches. El software es de uso exclusivo de SCOPH.

## Relievo anual

Cada promoción de 6to Perito hereda el repositorio, la documentación
y las convenciones de la promoción anterior. Antes de cambiar
arquitectura, stack o contratos de API:

1. Lee `AGENTS.md`, `docs/` y las skills en `.cursor/skills/`.
2. Conserva compatibilidad o documenta el quiebre.
3. Actualiza README, docs y skills en el mismo cambio.

## Flujo de trabajo para estudiantes

1. Trabaja en una rama por ticket, no en `main`.
2. Nombra la rama con el ticket. Preferido:

   ```text
   feat/TKT-104-descripcion-corta
   fix/TKT-105-descripcion-corta
   docs/TKT-106-descripcion-corta
   ```

   Si el equipo ya usa `TKT-93` o `feature/TKT-01-...`, sé consistente
   con el tablero del ciclo, pero no inventes un tercer esquema.
3. Un ticket, un propósito. No mezcles inventario con auth.
4. Abre pull request hacia `main` (o la rama de integración del ciclo).
5. Describe: qué problema, cómo se prueba, qué docs actualizaste.
6. Un docente o encargado de módulo revisa antes de fusionar.

## Qué se espera en cada cambio

- Código alineado con el servicio que tocas (Fastify + pnpm en backends;
  Vite/React en web; Expo en móvil). No introduzcas Express ni npm
  como gestor del proyecto.
- Pruebas del paquete afectado: `pnpm test` en el servicio.
- Sin secretos: nunca commits de `.env` reales, JWT, MongoDB, SMTP o
  Resend. Usa `.env.example`.
- Documentación: si cambias puertos, env, rutas o roles, actualiza
  `docs/SERVICIOS.md`, `docs/ENTORNO-LOCAL.md` y la skill correspondiente.
- Idioma de dominio en español (`jornadas`, `movimientos`, `inventario`).
  Código (nombres de archivos/funciones) sigue el estilo del módulo.

## Qué no hacer

- Publicar el repo o copiar módulos a proyectos personales.
- Usar datos reales de jornadas, pacientes o inventario en demos.
- Cambiar `JWT_SECRET` en un solo servicio (debe ser el mismo en todos).
- Exponer Mongo a internet sin control.
- Agregar dependencias grandes sin acuerdo del módulo.
- Dejar `console.log` de tokens o contraseñas.

## Canales

Dudas académicas: coordinación de 6to Perito / docentes del módulo.
Dudas de operación en SCOPH: el enlace institucional definido cada ciclo.
Agentes de código: seguir [AGENTS.md](./AGENTS.md) y las skills del repo.
