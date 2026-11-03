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
  assert.equal(MANUFACTURER_PART_RECORDS.length, 14);
  assert.equal(searchManufacturerParts("Texas Instruments").length, 8);
  assert.equal(searchManufacturerParts("no-such-manufacturer-part").length, 0);
  assert.ok(MANUFACTURER_PART_RECORDS.every((record) => getManufacturerPartEvidenceSummary(record).verified === (record.verificationStatus === "verified")));
  const reviewReady = getManufacturerPartEvidenceSummary(MANUFACTURER_PART_RECORDS.find((record) => record.id === "ti.lm555p"));
  assert.equal(reviewReady.readyForHumanReview, true);
  assert.equal(reviewReady.evidenceBlocked, false);
  assert.equal(reviewReady.verified, false);
});
