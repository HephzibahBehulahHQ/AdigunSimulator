import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

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

