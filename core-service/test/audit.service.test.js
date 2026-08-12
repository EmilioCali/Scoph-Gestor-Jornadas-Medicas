import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAuditPayload } from '../src/modules/audit/audit.service.js';

test('buildAuditPayload normalizes defaults for audit records', () => {
  const payload = buildAuditPayload({
    action: 'CREAR',
    module: 'CATEGORIES',
    reference: 'category-1',
    description: 'Categoría creada',
  });

  assert.equal(payload.userId, 'system');
  assert.equal(payload.action, 'CREAR');
  assert.equal(payload.module, 'CATEGORIES');
  assert.equal(payload.reference, 'category-1');
  assert.equal(payload.description, 'Categoría creada');
});
