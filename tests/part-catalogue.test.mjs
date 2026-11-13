import assert from "node:assert/strict";
import test from "node:test";
import { MANUFACTURER_PART_RECORDS, getManufacturerPartEvidenceSummary, searchManufacturerParts } from "../js/part-catalogue.mjs";

test("manufacturer evidence search returns exact records without promoting candidates", () => {
  const matches = searchManufacturerParts("bss138bk");
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, "nexperia.bss138bk");
  const summary = getManufacturerPartEvidenceSummary(matches[0]);
  assert.equal(summary.status, "candidate");
  assert.equal(summary.verified, false);
  assert.equal(summary.requiresHumanReview, true);
  assert.equal(summary.simulationStatus, "not-modelled");
  assert.ok(summary.evidenceBlockerCodes.includes("DATASHEET_CHECKSUM"));
  assert.equal(summary.readyForHumanReview, false);
  assert.equal(summary.evidenceBlocked, true);
  assert.ok(summary.pinMap.length > 0);
  assert.ok(summary.ratings.length > 0);
  assert.equal(summary.footprintEvidencePath, matches[0].footprintEvidence.assetPath);
  assert.equal(summary.datasheetChecksumPresent, false);
});

test("manufacturer evidence browser provides a searchable review snapshot for every ledger record", () => {
  assert.equal(MANUFACTURER_PART_RECORDS.length, 17);
  assert.equal(searchManufacturerParts("Texas Instruments").length, 11);
  assert.equal(searchManufacturerParts("Texas LM555CN/NOPB").length, 1);
  assert.equal(searchManufacturerParts("LM555 Texas")[0].id, "ti.lm555p");
  assert.equal(searchManufacturerParts("no-such-manufacturer-part").length, 0);
  assert.ok(MANUFACTURER_PART_RECORDS.every((record) => getManufacturerPartEvidenceSummary(record).verified === (record.verificationStatus === "verified")));
  const reviewReady = getManufacturerPartEvidenceSummary(MANUFACTURER_PART_RECORDS.find((record) => record.id === "ti.lm555p"));
  assert.equal(reviewReady.readyForHumanReview, true);
  assert.equal(reviewReady.evidenceBlocked, false);
  assert.equal(reviewReady.verified, false);
});

test("SN74HC04N footprint remains an unverified educational candidate", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "ti.sn74hc04n");
  const summary = getManufacturerPartEvidenceSummary(record);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.modelStatus, "not-modelled");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.equal(Object.keys(record.footprintPadMap).length, 14);
  assert.equal(summary.readyForHumanReview, false);
  assert.ok(summary.evidenceBlockerCodes.includes("DATASHEET_CHECKSUM"));
});

test("SN74HC02N educational footprint preserves the pin map and candidate status", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "ti.sn74hc02n");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.equal(Object.keys(record.footprintPadMap).length, 14);
  assert.deepEqual(record.footprintPadMap, Object.fromEntries(Array.from({ length: 14 }, (_, index) => [String(index + 1), String(index + 1)])));
  assert.match(record.footprintEvidence.designNote, /not TI land-pattern recommendations/);
});

test("2N3904BU educational footprint follows onsemi lead numbering", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "onsemi.2n3904bu");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.deepEqual(record.symbolPinMap, { "1": "Emitter", "2": "Base", "3": "Collector" });
  assert.deepEqual(record.footprintPadMap, { "1": "1", "2": "2", "3": "3" });
  assert.match(record.footprintEvidence.designNote, /not an onsemi board land pattern/);
});

test("LM358DT educational SO8 footprint maps all pins and discloses design defaults", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "st.lm358dt");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.deepEqual(record.footprintPadMap, Object.fromEntries(Array.from({ length: 8 }, (_, index) => [String(index + 1), String(index + 1)])));
  assert.equal(record.footprintEvidence.sourceUrl, "https://www.st.com/resource/en/datasheet/lm358.pdf");
  assert.match(record.footprintEvidence.designNote, /does not publish the generated land pattern/);
});

test("1N4148 family symbol uses application connection IDs without claiming package lead numbers", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "nexperia.1n4148");
  assert.equal(record.verificationStatus, "candidate");
  assert.deepEqual(record.symbolPinMap, { "1": "A", "2": "K" });
  assert.deepEqual(record.symbolPinLabels, { "1": "A", "2": "K" });
  assert.equal(record.packageEvidence.package, "SOD27 (DO-35)");
  assert.match(record.warnings[0], /do not represent manufacturer physical lead numbers/);
});

test("1N4148 family footprint documents its application-selected pitch and pad IDs", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "nexperia.1n4148");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.deepEqual(record.footprintPadMap, { "1": "1", "2": "2" });
  assert.match(record.footprintEvidence.designNote, /not a datasheet-defined footprint/);
});
