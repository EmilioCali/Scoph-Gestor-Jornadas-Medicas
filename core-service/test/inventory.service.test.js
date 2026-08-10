import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBaseUnits } from '../src/inventory/inventory.service.js';

test('calculateBaseUnits supports 2-level and 3-level conversion', () => {
  const twoLevelMedicine = {
    packageUnit: 'Caja',
    minimumUnit: 'Tableta',
    intermediateUnit: null,
    unitsPerPackage: 30,
    unitsPerMinimumUnit: 1,
  };

  const threeLevelMedicine = {
    packageUnit: 'Caja',
    minimumUnit: 'Tableta',
    intermediateUnit: 'Blíster',
    unitsPerPackage: 30,
    unitsPerMinimumUnit: 10,
  };

  assert.equal(calculateBaseUnits(5, 'Caja', twoLevelMedicine), 150);
  assert.equal(calculateBaseUnits(5, 'Tableta', twoLevelMedicine), 5);
  assert.equal(calculateBaseUnits(5, 'Caja', threeLevelMedicine), 1500);
  assert.equal(calculateBaseUnits(5, 'Blíster', threeLevelMedicine), 50);
  assert.equal(calculateBaseUnits(5, 'Tableta', threeLevelMedicine), 5);
});
