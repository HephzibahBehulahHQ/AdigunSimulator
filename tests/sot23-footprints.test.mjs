import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPartVerificationReadiness } from "../js/part-ledger.mjs";

test("BSS138BK candidate footprint matches the sourced SOT23 pin and reflow geometry", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url), "utf8"));
  const record = ledger.records.find((item) => item.id === "nexperia.bss138bk");
  const assetUrl = new URL(`../${record.footprintEvidence.assetPath}`, import.meta.url);
  const bytes = await readFile(assetUrl);
  const footprint = JSON.parse(bytes.toString("utf8"));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), record.footprintAsset.sha256);
  assert.equal(footprint.kind, "manufacturer-reflow-footprint-candidate");
  assert.equal(footprint.packageOutline.sourceUrl, record.datasheet.url);
  assert.deepEqual(footprint.pads.map(({ number }) => number), [1, 2, 3]);
  assert.deepEqual(footprint.pads.map(({ xMm, yMm }) => [xMm, yMm]), [[-1.075, 0], [1.075, 0.95], [1.075, -0.95]]);
  assert.deepEqual(footprint.pads.map(({ widthMm, heightMm }) => [widthMm, heightMm]), [[1.7, 0.7], [0.6, 1.0], [0.6, 1.0]]);
  assert.deepEqual(record.symbolPinMap, { "1": "Gate", "2": "Source", "3": "Drain" });
  assert.equal(record.footprintPadMap["3"], "3");
  assert.equal(record.modelStatus, "not-modelled");
  const readiness = getPartVerificationReadiness(record);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(readiness.verified, false);
  assert.ok(readiness.missingEvidenceCodes.includes("DATASHEET_CHECKSUM"));
  assert.ok(readiness.missingEvidenceCodes.includes("REVIEWER_IDENTITY"));
  assert.ok(footprint.limitations.some((note) => /center coordinates are reconstructed/.test(note)));
});
