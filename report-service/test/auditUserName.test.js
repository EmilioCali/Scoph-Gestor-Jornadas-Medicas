import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichAuditEntriesWithUserNames } from '../src/reports/reports.service.js';

test('enrichAuditEntriesWithUserNames adds a display name for known users', () => {
  const entries = enrichAuditEntriesWithUserNames([
    { _id: 'a1', userId: 'user-1', action: 'CREAR', module: 'MEDICINES', description: 'Medicamento creado' }
  ], [
    { _id: 'user-1', nombre: 'Ana', apellido: 'Pérez', username: 'anap' }
  ]);

  assert.equal(entries[0].userDisplayName, 'Ana Pérez');
  assert.equal(entries[0].userName, 'Ana Pérez');
});

test('enrichAuditEntriesWithUserNames falls back to userId when no user data exists', () => {
  const entries = enrichAuditEntriesWithUserNames([
    { _id: 'a2', userId: 'user-2', action: 'ACTUALIZAR', module: 'INVENTORY', description: 'Inventario actualizado' }
  ], []);

  assert.equal(entries[0].userDisplayName, 'user-2');
  assert.equal(entries[0].userName, 'user-2');
});
