import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildBomReport } from "../js/bom-report.mjs";

const fixture = JSON.parse(await readFile(new URL("../examples/194-bom-export-cost-placeholder.adigun.json", import.meta.url), "utf8"));

function priceReport(asOf) {
  const project = structuredClone(fixture);
  project.components[0].verifiedPrice = {
    unitCost: 0.12,
    currency: "EUR",
    source: "https://example.com/parts/resistor",
    asOf
  };
  return buildBomReport(project);
}

test("BOM price evidence accepts real dates and rejects calendar-normalized dates", () => {
  const leapDay = priceReport("2024-02-29");
  assert.equal(leapDay.ok, true);
  assert.equal(leapDay.rows[0].unitCost, 0.12);

  for (const invalidDate of ["2025-02-29", "2026-02-31", "2026-13-01", "2026-04-00"]) {
    const report = priceReport(invalidDate);
    assert.equal(report.ok, true);
    assert.equal(report.rows[0].unitCost, null, invalidDate);
    assert.equal(report.totalCost, null, invalidDate);
  }
});
