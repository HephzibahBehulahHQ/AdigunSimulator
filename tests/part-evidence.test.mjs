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
  assert.ok(!readiness.missingEvidenceCodes.includes("DATASHEET_CHECKSUM"));
  assert.ok(readiness.missingEvidenceCodes.includes("FOOTPRINT_ASSET_EVIDENCE"));
  assert.ok(readiness.missingEvidenceCodes.includes("REVIEWER_IDENTITY"));
});

test("sourced candidate pin maps stay explicit and do not imply verified models or footprints", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  const byId = new Map(ledger.records.map((record) => [record.id, record]));
  const bjt = byId.get("onsemi.2n3904bu");
  const regulator = byId.get("ti.lm7805ct-nopb");
  const diode = byId.get("nexperia.1n4148");
  const timer = byId.get("ti.lm555p");

  assert.deepEqual(bjt.symbolPinMap, { "1": "Emitter", "2": "Base", "3": "Collector" });
  assert.deepEqual(regulator.symbolPinMap, { "1": "INPUT", "2": "GND", "3": "OUTPUT" });
  assert.equal(regulator.lifecycleEvidence.checkedAt, "2026-11-02");
  assert.match(diode.datasheet.url, /1N4148_1N4448\.pdf$/);
  assert.equal(diode.simulationModel.status, "not-modelled");
  assert.deepEqual(timer.symbolPinMap, {
    "1": "GND", "2": "TRIG", "3": "OUT", "4": "RESET",
    "5": "CONT", "6": "THRES", "7": "DISCH", "8": "VCC"
  });
  assert.equal(timer.packageEvidence.package, "PDIP-8");
  assert.equal(timer.verificationStatus, "candidate");
  assert.equal(getPartVerificationReadiness(timer).verified, false);
  assert.match(timer.datasheet.sha256, /^[a-f0-9]{64}$/);
  assert.equal(timer.datasheet.sha256Bytes, 1221961);
  assert.match(byId.get("ti.sn74hc00n").datasheet.sha256, /^[a-f0-9]{64}$/);
  assert.match(regulator.datasheet.sha256, /^[a-f0-9]{64}$/);
  assert.match(byId.get("microchip.mcp6002-i-p").datasheet.sha256, /^[a-f0-9]{64}$/);
  for (const record of [bjt, regulator, diode]) {
    assert.equal(record.verificationStatus, "candidate");
    assert.equal(getPartVerificationReadiness(record).verified, false);
  }
});

test("captured manufacturer datasheet checksums match ledger bytes and remain only one part of verification", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  const note = await readFile(new URL("../library/evidence/datasheet-checksums-2026-11-02.md", import.meta.url), "utf8");
  for (const id of ["ti.lm555p", "ti.sn74hc00n", "ti.lm7805ct-nopb", "microchip.mcp6002-i-p"]) {
    const record = ledger.records.find((part) => part.id === id);
    assert.match(record.datasheet.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(record.datasheet.sha256Bytes));
    assert.ok(note.includes(record.datasheet.sha256));
    assert.equal(record.datasheet.checksumEvidenceNote, "library/evidence/datasheet-checksums-2026-11-02.md");
    assert.equal(getPartVerificationReadiness(record).verified, false);
  }
});

