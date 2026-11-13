import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPartVerificationReadiness } from "../js/part-ledger.mjs";

const expected = {
  "microchip.atmega328p-pu": { count: 28, bodyLength: [34.544, 34.798], bodyWidth: [7.112, 7.493] },
  "ti.lm555p": { count: 8, bodyLength: [9.02, 10.16], bodyWidth: [6.10, 6.60] },
  "ti.sn74hc00n": { count: 14, bodyLength: { nominal: 19.30 }, bodyWidth: { nominal: 6.40 } },
  "ti.sn74hc138n": { count: 16, bodyLength: { minimum: 18.92, maximum: 19.69 }, bodyWidth: { minimum: 6.10, maximum: 6.60 } },
  "microchip.mcp6002-i-p": { count: 8, bodyLength: { minimum: 8.8392, typical: 9.271, maximum: 10.16 }, bodyWidth: { minimum: 6.096, typical: 6.35, maximum: 7.112 } },
  "ti.lm7805ct-nopb": { count: 3, bodyLength: { minimum: 8.39, typical: 8.64, maximum: 8.89 }, bodyWidth: { minimum: 10.04, typical: 10.16, maximum: 10.54 }, rowPitch: null, padDiameter: 3.5, padDrill: 2.0, layout: "inline", overallLengthMax: 16.26 }
};

test("PDIP candidate footprints have source-based outlines, unique pin maps, and disclosed educational pads", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  for (const [partId, facts] of Object.entries(expected)) {
    const record = ledger.records.find((part) => part.id === partId);
    const bytes = await readFile(new URL(`../library/assets/footprints/${partId}/footprint.json`, import.meta.url));
    const footprint = JSON.parse(bytes.toString("utf8"));
    const digest = createHash("sha256").update(bytes.toString("utf8").replace(/\r\n/g, "\n")).digest("hex");

    assert.equal(digest, record.footprintAsset.sha256, partId);
    assert.equal(record.footprintAsset.licenseId, "CC0-1.0");
    assert.equal(record.footprintAsset.designStatus, "educational-candidate");
    assert.equal(footprint.pads.length, facts.count);
    assert.deepEqual(Object.keys(record.footprintPadMap), Object.keys(record.symbolPinMap));
    const expectedLength = Array.isArray(facts.bodyLength) ? { minimum: facts.bodyLength[0], maximum: facts.bodyLength[1] } : facts.bodyLength;
    const expectedWidth = Array.isArray(facts.bodyWidth) ? { minimum: facts.bodyWidth[0], maximum: facts.bodyWidth[1] } : facts.bodyWidth;
    assert.deepEqual(footprint.packageOutline.bodyLengthMm, expectedLength);
    assert.deepEqual(footprint.packageOutline.bodyWidthMm, expectedWidth);
    assert.equal(footprint.packageOutline.leadPitchMm, 2.54);
    assert.equal(footprint.packageOutline.leadRowPitchMm, facts.rowPitch !== undefined ? facts.rowPitch : 7.62);
    assert.deepEqual(footprint.pads.map((pad) => pad.number), Array.from({ length: facts.count }, (_, index) => index + 1));
    assert.equal(new Set(footprint.pads.map((pad) => `${pad.xMm},${pad.yMm}`)).size, facts.count);
    assert.match(footprint.padPattern.source, /not a manufacturer land-pattern recommendation/);
    assert.equal(footprint.padPattern.diameterMm, facts.padDiameter ?? 1.8);
    assert.equal(footprint.padPattern.drillMm, facts.padDrill ?? 0.8);
    if (facts.layout === "inline") {
      assert.equal(footprint.packageOutline.layout, "inline");
      assert.equal(footprint.packageOutline.overallLengthMaxMm, facts.overallLengthMax);
      assert.deepEqual(footprint.pads.map((pad) => pad.xMm), [0, 0, 0]);
      assert.deepEqual(footprint.pads.map((pad) => pad.yMm), [-2.54, 0, 2.54]);
    }
    assert.ok(footprint.limitations.some((note) => /not passed independent footprint review/.test(note)));
    const readiness = getPartVerificationReadiness(record);
    assert.equal(readiness.readyForHumanReview, true);
    assert.ok(readiness.missingEvidenceCodes.includes("REVIEWER_IDENTITY"));
    assert.equal(record.verificationStatus, ["ti.lm555p", "microchip.atmega328p-pu"].includes(record.id) ? "in-review" : "candidate");

    if (facts.layout === "inline") continue;
    const rowCount = facts.count / 2;
    for (let index = 0; index < rowCount - 1; index += 1) {
      assert.ok(Math.abs(footprint.pads[index + 1].yMm - footprint.pads[index].yMm - 2.54) < 1e-10);
      assert.ok(Math.abs(footprint.pads[index + rowCount + 1].yMm - footprint.pads[index + rowCount].yMm + 2.54) < 1e-10);
    }
  }
});
