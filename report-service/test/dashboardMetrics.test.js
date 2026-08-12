import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardMetrics } from '../src/reports/reports.service.js';

test('buildDashboardMetrics includes doctor and workday indicators', () => {
  const result = buildDashboardMetrics({
    medicines: [{ _id: 'm1' }],
    workdays: [
      { _id: 'w1', status: 'IN_PROGRESS' },
      { _id: 'w2', status: 'PLANNED' },
      { _id: 'w3', status: 'COMPLETED' },
    ],
    movements: [{ createdAt: '2026-08-02T10:00:00.000Z', type: 'ENTRADA' }, { createdAt: '2026-08-03T10:00:00.000Z', type: 'SALIDA' }],
    inventory: [{ totalStock: 3, minimumStock: 5, lots: [{ stock: 3 }] }],
    users: [
      { _id: 'u1', rol: 'MEDICO', isActive: true },
      { _id: 'u2', rol: 'MEDICO', isActive: false },
      { _id: 'u3', rol: 'ADMIN', isActive: true },
    ],
  });

  assert.equal(result.totalMedicamentos, 1);
  assert.equal(result.totalMedicos, 2);
  assert.equal(result.medicosActivos, 1);
  assert.equal(result.totalJornadas, 3);
  assert.equal(result.jornadasActivas, 1);
  assert.equal(result.jornadasPlanificadas, 1);
  assert.equal(result.jornadasFinalizadas, 1);
  assert.equal(result.stockBajo, 1);
  assert.equal(result.alertasVencimiento, 0);
});
