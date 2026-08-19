import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBaseUnits, getLotUnitValue, subtractLotUnits } from '../src/inventory/inventory.service.js';

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

test('getLotUnitValue does not duplicate legacy stock when the lot has packaging breakdown', () => {
  const medicine = {
    packageUnit: 'Caja',
    minimumUnit: 'Tableta',
    intermediateUnit: 'BlÃ­ster',
    unitsPerPackage: 2,
    unitsPerMinimumUnit: 10,
  };

  assert.equal(getLotUnitValue({ boxes: 3, blisters: 1, units: 2, stock: 3 }, medicine), 72);
  assert.equal(getLotUnitValue({ boxes: 0, blisters: 0, units: 0, stock: 7 }, medicine), 7);
});

test('subtractLotUnits can open a package to consume a partial amount', () => {
  const medicine = {
    packageUnit: 'Caja',
    minimumUnit: 'Tableta',
    intermediateUnit: null,
    unitsPerPackage: 500,
    unitsPerMinimumUnit: 1,
  };
  const lot = { boxes: 4, blisters: 0, units: 0, stock: 0 };

  subtractLotUnits(lot, 200, medicine);

  assert.deepEqual(lot, { boxes: 3, blisters: 0, units: 300, stock: 0 });
  assert.equal(getLotUnitValue(lot, medicine), 1800);
});
