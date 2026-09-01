---
name: scoph-inventario-jornadas
description: Dominio de jornadas médicas, medicamentos, lotes, inventario central/jornada, movimientos y reportes asociados. Usar en tickets de farmacia, transferencias, recetas, retorno, estados de jornada o report-service de stock.
---

# Inventario y jornadas

Glosario: `docs/GLOSARIO.md`. Arquitectura: `docs/ARQUITECTURA.md`.

## Dueños

| Dato | Servicio |
| --- | --- |
| Jornada, estados, médicos | workday-service |
| Medicina, categorías, unidades, stock, lotes, movimientos, auditoría | core-service |
| Excel/PDF y métricas agregadas | report-service (HTTP a los otros) |

## Invariantes

- Transferir a jornada mueve stock de central → inventario de jornada y deja movimiento.
- Cierre/retorno no debe duplicar stock. El job de workday llama
  `POST /api/v1/movimientos/retorno-automatico-jornada`.
- Lotes: vencimiento + cantidades (cajas / blíster / unidades según el módulo).
- Movimientos: tipos `ENTRADA|SALIDA|TRANSFERENCIA` y subtipos (`DONACION`, `COMPRA`, `RECETA`, `ASIGNACION_JORNADA`, `RETORNO_JORNADA`, …).
- Core valida la jornada contra workday por HTTP.

## Al implementar

- No copies modelos de core en report ni en workday.
- Usa los nombres de ruta en español ya existentes.
- Cubre el caso vacío (sin lotes, jornada inexistente, stock insuficiente).
- Si tocas estados de jornada, revisa el temporizador de workday (JWT de sistema).
