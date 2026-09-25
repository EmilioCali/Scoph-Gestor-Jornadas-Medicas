import test from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import * as XLSX from 'xlsx';
import {
  buildConsumoExportRows,
  buildJornadaExportRows,
  buildMovimientoExportRows,
  buildStockExportRows,
  exportarConsumoPDF,
  exportarMovimientosExcel,
  exportarStockExcel,
} from '../src/reports/reports.service.js';
import { EMPTY_LABEL, buildExcelBuffer, buildPdfBuffer } from '../src/reports/exportTemplates.js';

const SAMPLE_MOVEMENT = {
  type: 'SALIDA',
  subType: 'RECETA',
  status: 'COMPLETED',
  userId: 'usr_ana',
  userDisplayName: 'Ana Pérez',
  createdAt: '2026-03-12T15:00:00.000Z',
  destination: { id: 'wd_campo_01' },
  detail: [{
    medicationSnapshot: { name: 'Amoxicilina 500', concentration: '500 mg' },
    batch: 'LOTE-REAL-01',
    quantity: 4,
    expirationDate: '2027-01-15T00:00:00.000Z',
  }],
};

test('buildMovimientoExportRows maps core payload and skips dummy labels', () => {
  const rows = buildMovimientoExportRows([SAMPLE_MOVEMENT]);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].Medicamento, 'Amoxicilina 500');
  assert.equal(rows[0].Lote, 'LOTE-REAL-01');
  assert.equal(rows[0].Usuario, 'Ana Pérez');
  assert.equal(rows[0].Cantidad, 4);
  assert.doesNotMatch(JSON.stringify(rows), /Paciente simulado|lorem|dummy/i);
});

test('buildStockExportRows and buildJornadaExportRows use upstream fields', () => {
  const stock = buildStockExportRows([{
    medicineId: { name: 'Ibuprofeno', concentration: '400 mg' },
    totalStock: 20,
    minimumStock: 5,
    lots: [{ batch: 'IBU-9', stock: 20, expirationDate: '2026-12-01T00:00:00.000Z' }],
  }]);
  const jornadas = buildJornadaExportRows([{
    name: 'Jornada Mixco',
    description: 'Atención primaria',
    startDate: '2026-04-01T00:00:00.000Z',
    endDate: '2026-04-02T00:00:00.000Z',
    location: { department: 'Guatemala', municipality: 'Mixco', address: 'Salón municipal' },
    manager: { name: 'Dra. López' },
    estimatedPatients: 80,
    estimatedMedicines: 12,
    status: 'PLANNED',
  }]);

  assert.equal(stock[0].Medicamento, 'Ibuprofeno');
  assert.equal(stock[0].Lote, 'IBU-9');
  assert.equal(jornadas[0].Nombre, 'Jornada Mixco');
  assert.equal(jornadas[0].Responsable, 'Dra. López');
});

test('buildConsumoExportRows includes the actor name', () => {
  const rows = buildConsumoExportRows([SAMPLE_MOVEMENT]);
  assert.equal(rows[0].Usuario, 'Ana Pérez');
  assert.equal(rows[0].JornadaId, 'wd_campo_01');
  assert.equal(rows[0].Medicamento, 'Amoxicilina 500');
});

test('buildExcelBuffer writes title and Sin registros when empty', () => {
  const buffer = buildExcelBuffer({
    title: 'Reporte de Stock Actual',
    sheet: 'Stock',
    columns: [{ key: 'Medicamento', header: 'Medicamento', width: 20 }],
    rows: [],
  });
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const csv = XLSX.utils.sheet_to_csv(workbook.Sheets.Stock);

  assert.match(csv, /Reporte de Stock Actual - SCOPH URL/);
  assert.match(csv, /Generado:/);
  assert.match(csv, new RegExp(EMPTY_LABEL));
});

function pdfVisibleText(buffer) {
  const raw = buffer.toString('latin1');
  const streams = [...raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)];
  const content = streams
    .map((match) => {
      try {
        return inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
      } catch {
        return match[1];
      }
    })
    .join('\n');

  return content
    .replace(/<([0-9a-fA-F]+)>/g, (_, hex) => Buffer.from(hex, 'hex').toString('latin1'))
    .replace(/(?<=\p{L})\s+-?\d+\s+(?=\p{L})/gu, '');
}

test('buildPdfBuffer embeds live row text not dummy patients', async () => {
  const buffer = await buildPdfBuffer({
    title: 'Reporte de Movimientos',
    columns: [
      { key: 'Medicamento', header: 'Medicamento', weight: 2 },
      { key: 'Usuario', header: 'Usuario', weight: 1 },
    ],
    rows: [{ Medicamento: 'Amoxicilina 500', Usuario: 'Ana Pérez' }],
  });
  const text = pdfVisibleText(buffer);

  assert.match(text, /Amoxicilina 500/);
  assert.match(text, /Ana P/);
  assert.match(text, /SCOPH URL/);
  assert.doesNotMatch(text, /Paciente simulado/);
});

function mockUpstream(t, handlers) {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });

  globalThis.fetch = async (url) => {
    const href = String(url);
    const match = handlers.find((handler) => href.includes(handler.includes));
    if (!match) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => match.body };
  };
}

test('exportarMovimientosExcel reads core + auth, not hardcoded rows', async (t) => {
  mockUpstream(t, [
    {
      includes: '/api/v1/movimientos',
      body: { data: [{ ...SAMPLE_MOVEMENT, userDisplayName: undefined }] },
    },
    {
      includes: '/api/auth/users',
      body: { users: [{ _id: 'usr_ana', nombre: 'Ana', apellido: 'Pérez' }] },
    },
  ]);

  const buffer = await exportarMovimientosExcel('Bearer test');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const csv = XLSX.utils.sheet_to_csv(workbook.Sheets.Movimientos);

  assert.match(csv, /Amoxicilina 500/);
  assert.match(csv, /LOTE-REAL-01/);
  assert.match(csv, /Ana Pérez/);
  assert.doesNotMatch(csv, /Paciente simulado/);
});

test('exportarStockExcel survives empty inventory', async (t) => {
  mockUpstream(t, [
    { includes: '/api/v1/inventario-central', body: { data: null } },
  ]);

  const buffer = await exportarStockExcel('Bearer test');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const csv = XLSX.utils.sheet_to_csv(workbook.Sheets.Stock);
  assert.match(csv, new RegExp(EMPTY_LABEL));
});

test('exportarConsumoPDF includes Usuario from auth users', async (t) => {
  mockUpstream(t, [
    {
      includes: 'CONSUMO_JORNADA',
      body: { data: [{ ...SAMPLE_MOVEMENT, userDisplayName: undefined, subType: 'CONSUMO_JORNADA' }] },
    },
    {
      includes: '/api/auth/users',
      body: { users: [{ _id: 'usr_ana', nombre: 'Ana', apellido: 'Pérez' }] },
    },
  ]);

  const buffer = await exportarConsumoPDF('Bearer test');
  const text = pdfVisibleText(buffer);
  assert.match(text, /Amoxicilina 500/);
  assert.match(text, /Ana P/);
});
