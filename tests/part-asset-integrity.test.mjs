import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { validatePartAssetIntegrity } from "../scripts/part-asset-integrity.mjs";

const bytes = "<svg>candidate</svg>\n";
const hash = createHash("sha256").update(bytes).digest("hex");
const ledger = () => ({ records: [{
  id: "example.part",
  symbolAsset: {
    sourceUrl: "https://raw.githubusercontent.com/example/repo/main/library/assets/parts/example.part/symbol.svg",
    sha256: hash
  }
}] });

test("part asset integrity verifies the local source path and SHA-256", async () => {
  const result = await validatePartAssetIntegrity(ledger(), async (path) => {
    assert.equal(path, "library/assets/parts/example.part/symbol.svg");
    return bytes;
  });
  assert.deepEqual(result, { valid: true, errors: [] });
});

test("part asset integrity blocks missing assets, unsafe paths, and checksum drift", async () => {
  const unsafe = ledger();
  unsafe.records[0].symbolAsset.sourceUrl = "https://raw.githubusercontent.com/example/repo/main/outside.svg";
  const result = await validatePartAssetIntegrity(unsafe, async () => "<svg>changed</svg>\n");
  assert.ok(result.errors.some((issue) => issue.code === "ASSET_SOURCE_PATH"));
  assert.ok(result.errors.some((issue) => issue.code === "ASSET_HASH"));

  const missing = ledger();
  missing.records[0].id = "../escape";
  const blocked = await validatePartAssetIntegrity(missing, async () => { throw new Error("missing"); });
  assert.ok(blocked.errors.some((issue) => issue.code === "ASSET_PATH"));
});
