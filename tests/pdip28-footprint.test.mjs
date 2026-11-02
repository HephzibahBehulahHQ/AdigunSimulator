import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPartVerificationReadiness, validatePartRecord } from "../js/part-ledger.mjs";

test("ATmega328P PDIP-28 candidate footprint matches manufacturer package dimensions and pin numbering", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  const record = ledger.records.find((part) => part.id === "microchip.atmega328p-pu");
  const assetBytes = await readFile(new URL("../library/assets/footprints/microchip.atmega328p-pu/footprint.json", import.meta.url));
  const footprint = JSON.parse(assetBytes.toString("utf8"));

  assert.equal(createHash("sha256").update(assetBytes.toString("utf8").replace(/\r\n/g, "\n")).digest("hex"), record.footprintAsset.sha256);
  assert.equal(record.footprintAsset.licenseId, "CC0-1.0");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.deepEqual(Object.keys(record.footprintPadMap), Object.keys(record.symbolPinMap));
  assert.equal(validatePartRecord(record).length, 0);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(footprint.pads.length, 28);
  assert.deepEqual(footprint.pads.map((pad) => pad.number), Array.from({ length: 28 }, (_, index) => index + 1));
  assert.equal(new Set(footprint.pads.map((pad) => `${pad.xMm},${pad.yMm}`)).size, 28);
  assert.equal(footprint.packageOutline.leadRowPitchMm, 7.62);
  assert.equal(footprint.packageOutline.leadPitchMm, 2.54);
  assert.deepEqual(footprint.packageOutline.bodyLengthMm, { minimum: 34.544, maximum: 34.798 });
  assert.deepEqual(footprint.packageOutline.bodyWidthMm, { minimum: 7.112, maximum: 7.493 });

  for (let index = 0; index < 13; index += 1) {
    assert.ok(Math.abs(footprint.pads[index + 1].yMm - footprint.pads[index].yMm - 2.54) < 1e-10);
    assert.ok(Math.abs(footprint.pads[index + 15].yMm - footprint.pads[index + 14].yMm + 2.54) < 1e-10);
  }
  assert.match(footprint.padPattern.source, /not a manufacturer land-pattern recommendation/);
  const readiness = getPartVerificationReadiness(record);
  assert.equal(readiness.currentStatus, "candidate");
  assert.equal(readiness.evidenceBlockerCodes.includes("FOOTPRINT_ASSET_EVIDENCE"), false);
  assert.equal(readiness.evidenceBlockerCodes.includes("FOOTPRINT_PAD_MAP"), false);
  assert.equal(readiness.evidenceBlockerCodes.includes("PIN_MAP_ALIGNMENT"), false);
  assert.equal(readiness.readyForHumanReview, true);
  assert.ok(readiness.missingEvidenceCodes.includes("REVIEWER_IDENTITY"));
  assert.ok(readiness.missingEvidenceCodes.includes("REVIEW_DATE"));
});
