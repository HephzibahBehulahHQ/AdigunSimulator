import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPartVerificationReadiness } from "../js/part-ledger.mjs";

test("TI SN74HC00N evidence records datasheet pin roles without overstating verification", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  const record = ledger.records.find((part) => part.id === "ti.sn74hc00n");

  assert.ok(record);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.datasheet.accessedAt, "2026-11-02");
  assert.equal(record.symbolPinMap["1"], "1A");
  assert.equal(record.symbolPinMap["7"], "GND");
  assert.equal(record.symbolPinMap["14"], "VCC");
  assert.equal(record.pinElectricalTypes["3"], "output");
  assert.equal(record.simulationModel.status, "not-modelled");

  const readiness = getPartVerificationReadiness(record);
  assert.equal(readiness.verified, false);
  assert.ok(readiness.missingEvidenceCodes.includes("DATASHEET_CHECKSUM"));
  assert.ok(readiness.missingEvidenceCodes.includes("FOOTPRINT_ASSET_EVIDENCE"));
  assert.ok(readiness.missingEvidenceCodes.includes("REVIEWER_IDENTITY"));
});

