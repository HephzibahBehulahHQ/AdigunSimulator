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
  assert.equal(record.modelStatus, "not-modelled");
  assert.equal(record.translations.yo.name.includes("SN74HC00N"), true);

  const readiness = getPartVerificationReadiness(record);
  assert.equal(readiness.verified, false);
  assert.ok(!readiness.missingEvidenceCodes.includes("DATASHEET_CHECKSUM"));
  assert.ok(!readiness.missingEvidenceCodes.includes("FOOTPRINT_ASSET_EVIDENCE"));
  assert.equal(readiness.readyForHumanReview, true);
  assert.ok(readiness.missingEvidenceCodes.includes("REVIEWER_IDENTITY"));
});

test("sourced candidate pin maps stay explicit and do not imply verified models or footprints", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  const byId = new Map(ledger.records.map((record) => [record.id, record]));
  const bjt = byId.get("onsemi.2n3904bu");
  const regulator = byId.get("ti.lm7805ct-nopb");
  const diode = byId.get("nexperia.1n4148");
  const timer = byId.get("ti.lm555p");
  const amplifier = byId.get("st.lm358dt");
  const microchipOpAmp = byId.get("microchip.mcp6002-i-p");
  const avr = byId.get("microchip.atmega328p-pu");

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
  const timerReadiness = getPartVerificationReadiness(timer);
  assert.ok(!timerReadiness.missingEvidenceCodes.includes("RATINGS_UNITS"));
  assert.ok(!timerReadiness.missingEvidenceCodes.includes("BREADBOARD_COMPATIBILITY"));
  assert.ok(!timerReadiness.missingEvidenceCodes.includes("TRANSLATIONS"));
  assert.ok(!timerReadiness.missingEvidenceCodes.includes("FOOTPRINT_ASSET_EVIDENCE"));
  assert.ok(timerReadiness.missingEvidenceCodes.includes("REVIEW_DATE"));
  assert.equal(timerReadiness.verified, false);
  assert.deepEqual(amplifier.symbolPinMap, {
    "1": "OUT1", "2": "IN1-", "3": "IN1+", "4": "VCC-",
    "5": "IN2+", "6": "IN2-", "7": "OUT2", "8": "VCC+"
  });
  assert.equal(amplifier.lifecycle, "active");
  assert.equal(amplifier.simulationModel.status, "not-modelled");
  assert.equal(getPartVerificationReadiness(amplifier).verified, false);
  assert.deepEqual(microchipOpAmp.symbolPinMap, {
    "1": "OUTA", "2": "INA-", "3": "INA+", "4": "VSS",
    "5": "INB+", "6": "INB-", "7": "OUTB", "8": "VDD"
  });
  assert.equal(microchipOpAmp.datasheet.sha256Bytes, 931340);
  assert.equal(microchipOpAmp.simulationModel.status, "not-modelled");
  assert.equal(microchipOpAmp.verificationStatus, "candidate");
  const microchipOpAmpReadiness = getPartVerificationReadiness(microchipOpAmp);
  assert.equal(microchipOpAmpReadiness.verified, false);
  assert.equal(microchipOpAmpReadiness.readyForHumanReview, true);
  assert.ok(microchipOpAmpReadiness.missingEvidenceCodes.includes("REVIEWER_IDENTITY"));
  assert.equal(avr.packageEvidence.package, "PDIP-28");
  assert.equal(avr.symbolPinMap["1"], "PC6/RESET");
  assert.equal(avr.symbolPinMap["7"], "VCC");
  assert.equal(avr.symbolPinMap["20"], "AVCC");
  assert.equal(avr.symbolPinMap["28"], "PC5/ADC5/SCL");
  assert.equal(avr.simulationModel.status, "not-modelled");
  assert.equal(getPartVerificationReadiness(avr).verified, false);
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
  for (const id of ["ti.lm555p", "ti.sn74hc00n", "ti.lm7805ct-nopb", "microchip.mcp6002-i-p", "microchip.atmega328p-pu"]) {
    const record = ledger.records.find((part) => part.id === id);
    assert.match(record.datasheet.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(record.datasheet.sha256Bytes));
    assert.ok(note.includes(record.datasheet.sha256));
    assert.equal(record.datasheet.checksumEvidenceNote, "library/evidence/datasheet-checksums-2026-11-02.md");
    assert.equal(getPartVerificationReadiness(record).verified, false);
  }
});

