import test from "node:test";
import assert from "node:assert/strict";
import { getAutomaticWorkdayStatus } from "../src/workdays/workday.controller.js";

const now = new Date("2026-08-17T12:00:00.000Z");

test("determina el estado automático con fechas de calendario de Guatemala", () => {
  assert.equal(
    getAutomaticWorkdayStatus(
      { startDate: "2026-08-17T00:00:00.000Z", endDate: "2026-08-17T00:00:00.000Z" },
      now,
    ),
    "IN_PROGRESS",
  );
  assert.equal(
    getAutomaticWorkdayStatus(
      { startDate: "2026-08-14T00:00:00.000Z", endDate: "2026-08-14T00:00:00.000Z" },
      now,
    ),
    "FINISHED",
  );
  assert.equal(
    getAutomaticWorkdayStatus(
      { startDate: "2026-08-18T00:00:00.000Z", endDate: "2026-08-18T00:00:00.000Z" },
      now,
    ),
    "PLANNED",
  );
});
