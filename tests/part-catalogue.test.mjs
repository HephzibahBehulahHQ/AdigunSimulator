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
  assert.equal(MANUFACTURER_PART_RECORDS.length, 16);
  assert.equal(searchManufacturerParts("Texas Instruments").length, 10);
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
