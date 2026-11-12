import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildBomReport } from "../js/bom-report.mjs";

const fixture = JSON.parse(await readFile(new URL("../examples/194-bom-export-cost-placeholder.adigun.json", import.meta.url), "utf8"));

function priceReport(asOf, source = "https://example.com/parts/resistor") {
  const project = structuredClone(fixture);
  project.components[0].verifiedPrice = {
    unitCost: 0.12,
    currency: "EUR",
    source,
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

test("BOM references use numeric designator order", () => {
  const project = structuredClone(fixture);
  project.components.push(
    { ...structuredClone(project.components[1]), instanceId: "resistor-2", reference: "R2" },
    { ...structuredClone(project.components[1]), instanceId: "resistor-10", reference: "R10" }
  );
  const resistorRow = buildBomReport(project).rows.find((row) => row.libraryId === "passive.resistor");
  assert.equal(resistorRow.references, "R1, R2, R10");
});

test("BOM price evidence requires a parseable HTTPS source without credentials", () => {
  for (const source of ["https://", "https://bad host.example/part", "http://example.com/part", "https://user:secret@example.com/part"]) {
    const report = priceReport("2026-10-30", source);
    assert.equal(report.ok, true);
    assert.equal(report.rows[0].unitCost, null, source);
    assert.equal(report.totalCost, null, source);
  }
  const valid = priceReport("2026-10-30", "https://example.com/parts/resistor");
  assert.equal(valid.rows[0].priceSource, "https://example.com/parts/resistor");
});
