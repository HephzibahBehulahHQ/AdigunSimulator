import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderPartSymbol } from "../scripts/part-symbol-renderer.mjs";

test("part symbol renderer binds visible labels to their pin numbers", () => {
  const svg = renderPartSymbol({
    manufacturerPartNumber: "EXAMPLE & DEVICE",
    type: "two-pin test part",
    packageEvidence: { package: "PDIP-2" },
    symbolPinMap: { "1": "IN&", "2": "OUT" },
    pinElectricalTypes: { "1": "input", "2": "output" }
  });
  assert.match(svg, /data-pin-label-for="1">IN&amp;<\/text>/);
  assert.match(svg, /data-pin-label-for="2">OUT<\/text>/);
  assert.match(svg, /<title id="title">EXAMPLE &amp; DEVICE pin-map symbol<\/title>/);
});

test("generated manufacturer pin-map symbols match ledger hashes and CC0 licensing", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url)));
  const license = await readFile(new URL("../library/assets/LICENSE-CC0.txt", import.meta.url), "utf8");
  assert.match(license, /CC0 1\.0 Universal/);
  const records = ledger.records.filter((part) => part.symbolAsset);
  assert.ok(records.length >= 5);

  for (const record of records) {
    const svg = await readFile(new URL(`../library/assets/parts/${record.id}/symbol.svg`, import.meta.url));
    assert.equal(createHash("sha256").update(svg.toString("utf8").replace(/\r\n/g, "\n")).digest("hex"), record.symbolAsset.sha256);
    assert.equal(record.symbolAsset.licenseId, "CC0-1.0");
    assert.equal(record.symbolAsset.licenseUrl, "https://creativecommons.org/publicdomain/zero/1.0/");
    const sourcePath = `/library/assets/parts/${record.id}/symbol.svg`;
    assert.ok(record.symbolAsset.sourceUrl.endsWith(sourcePath));
    for (const pin of Object.keys(record.symbolPinMap)) {
      assert.ok(svg.toString("utf8").includes(`data-pin=\"${pin}\"`));
    }
  }
});

