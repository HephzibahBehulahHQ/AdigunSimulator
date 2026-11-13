import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validatePartAssetIntegrity } from "../scripts/part-asset-integrity.mjs";

const bytes = "<svg><g data-pin=\"1\" data-electrical-type=\"input\"><path/><text data-pin-label-for=\"1\">IN</text><text class=\"pin-number\">1</text></g></svg>\n";
const hash = createHash("sha256").update(bytes).digest("hex");
const ledger = () => ({ records: [{
  id: "example.part",
  symbolAsset: {
    sourceUrl: "https://raw.githubusercontent.com/example/repo/main/library/assets/parts/example.part/symbol.svg",
    sha256: hash
  },
  symbolPinMap: { "1": "IN" },
  symbolPinLabels: { "1": "IN" }
}] });

const mappedAssets = () => {
  const svg = `<svg><g data-pin="1" data-electrical-type="input"><path/><text data-pin-label-for="1">IN</text><text class="pin-number">1</text></g></svg>\n`;
  const footprint = `${JSON.stringify({ partId: "example.part", pads: [{ number: "2", xMm: 0, yMm: 0 }] })}\n`;
  return {
    svg,
    footprint,
    record: {
      id: "example.part",
      symbolAsset: {
        sourceUrl: "https://raw.githubusercontent.com/example/repo/main/library/assets/parts/example.part/symbol.svg",
        sha256: createHash("sha256").update(svg).digest("hex")
      },
      symbolPinMap: { "1": "IN" },
      symbolPinLabels: { "1": "IN" },
      pinElectricalTypes: { "1": "input" },
      footprintAsset: {
        sourceUrl: "https://raw.githubusercontent.com/example/repo/main/library/assets/footprints/example.part/footprint.json",
        sha256: createHash("sha256").update(footprint).digest("hex")
      },
      footprintEvidence: { assetPath: "library/assets/footprints/example.part/footprint.json" },
      footprintPadMap: { "1": "2" }
    }
  };
};

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

test("part asset integrity requires pin and visible-label maps for every symbol asset", async () => {
  const missingMaps = ledger();
  delete missingMaps.records[0].symbolPinMap;
  delete missingMaps.records[0].symbolPinLabels;
  const result = await validatePartAssetIntegrity(missingMaps, async () => bytes);
  assert.ok(result.errors.some((issue) => issue.code === "SYMBOL_VISIBLE_LABEL_MAP_REQUIRED"));
});

test("part asset integrity ties generated symbol labels and footprint pads to ledger maps", async () => {
  const fixture = mappedAssets();
  const readAsset = async (path) => path.endsWith("symbol.svg") ? fixture.svg : fixture.footprint;
  const valid = await validatePartAssetIntegrity({ records: [fixture.record] }, readAsset);
  assert.deepEqual(valid, { valid: true, errors: [] });

  const mismatched = structuredClone(fixture.record);
  mismatched.symbolPinMap["1"] = "OUT";
  mismatched.footprintPadMap["1"] = "4";
  const result = await validatePartAssetIntegrity({ records: [mismatched] }, readAsset);
  assert.ok(result.errors.some((issue) => issue.code === "SYMBOL_PIN_MAP_ASSET"));
  assert.ok(result.errors.some((issue) => issue.code === "FOOTPRINT_PAD_MAP_ASSET"));

  const mislabeled = structuredClone(fixture.record);
  const mislabeledSvg = fixture.svg.replace(">IN<", ">OUT<");
  const labelResult = await validatePartAssetIntegrity({ records: [mislabeled] }, async (path) => path.endsWith("symbol.svg") ? mislabeledSvg : fixture.footprint);
  assert.ok(labelResult.errors.some((issue) => issue.code === "SYMBOL_VISIBLE_LABEL_ASSET"));

  const misnumbered = structuredClone(fixture.record);
  misnumbered.symbolPinLabels = { "2": "IN" };
  const numberResult = await validatePartAssetIntegrity({ records: [misnumbered] }, readAsset);
  assert.ok(numberResult.errors.some((issue) => issue.code === "SYMBOL_VISIBLE_LABEL_ASSET"));
});

test("all ledger-mapped visible symbol labels match their source SVG assets", async () => {
  const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url), "utf8"));
  const records = ledger.records.filter((record) => record.symbolPinLabels);
  const result = await validatePartAssetIntegrity({ records }, (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8"));
  assert.equal(records.length, 15);
  assert.deepEqual(result, { valid: true, errors: [] });
});
