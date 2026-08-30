import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardMetrics } from '../src/reports/reports.service.js';

test('buildDashboardMetrics groups stock by category', () => {
  const result = buildDashboardMetrics({
    medicines: [{ _id: 'm1', category: 'Analgesicos' }, { _id: 'm2', category: 'Antibióticos' }],
    inventory: [
      { medicineId: { _id: 'm1', category: 'Analgesicos' }, totalStock: 10, minimumStock: 3, lots: [{ stock: 10 }] },
      { medicineId: { _id: 'm2', category: 'Antibióticos' }, totalStock: 6, minimumStock: 2, lots: [{ stock: 6 }] },
    ],
    workdays: [],
    movements: [],
    users: [],
  });

  assert.deepEqual(result.stockPorCategoria, [
    { name: 'Analgesicos', value: 10 },
    { name: 'Antibióticos', value: 6 },
  ]);
});

test('buildDashboardMetrics joins array categories', () => {
  const result = buildDashboardMetrics({
    inventory: [
      { category: ['Analgesicos', 'Antiinflamatorios'], totalStock: 4, lots: [] },
    ],
  });

  assert.deepEqual(result.stockPorCategoria, [
    { name: 'Analgesicos, Antiinflamatorios', value: 4 },
  ]);
});
