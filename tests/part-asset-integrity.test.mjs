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
  assert.equal(records.length, 1590);
  assert.deepEqual(result, { valid: true, errors: [] });
});

test("POExxPR footprints preserve top-view numbering and lands for unused terminals", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  const transformers = records.filter((record) => record.evidenceNote === "library/evidence/coilcraft.poexxpr.md");
  assert.equal(transformers.length, 12);
  for (const record of transformers) {
    const footprint = await load(`../${record.footprintEvidence.assetPath}`);
    assert.deepEqual(footprint.padPattern, {
      shape: "rectangle", widthMm: 1.55, heightMm: 1.27, rowCenterSpacingMm: 16.54, pitchMm: 2.5
    });
    assert.deepEqual(footprint.pads.map(({ xMm, yMm }) => [xMm, yMm]), [
      [-8.27, 5], [-8.27, 2.5], [-8.27, 0], [-8.27, -2.5], [-8.27, -5],
      [8.27, -5], [8.27, -2.5], [8.27, 0], [8.27, 2.5], [8.27, 5]
    ]);
    assert.deepEqual([1, 4, 9, 10].map((pin) => record.symbolPinMap[pin]),
      ["Primary start", "Auxiliary start", "Secondary 1 start", "Secondary 2 start"]);
    assert.equal(record.breadboard.compatible, false);
    assert.equal(record.simulationModel.status, "not-modelled");
  }
});

test("Coilcraft PoE variants preserve pin 1 and the required PCB winding ties", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  for (const [id, pinCount, x, y, ties] of [
    ["poe40q-33ed", 10, -8.27, -5, "9, 10; 6, 7"],
    ["poe51q-48ed", 10, -8.27, -5, null],
    ["poe62f-33ed", 12, -13.46, -7.5, "1, 2; 3, 4; 10, 11, 12; 7, 8, 9"],
    ["poe71f-48ed", 12, -13.46, -7.5, "1, 2; 3, 4; 10, 11, 12; 7, 8, 9"]
  ]) {
    const record = records.find((part) => part.id === `coilcraft.${id}`);
    const footprint = await load(`../${record.footprintEvidence.assetPath}`);
    assert.equal(footprint.pads.length, pinCount);
    assert.deepEqual(footprint.pads[0], { number: "1", xMm: x, yMm: y });
    assert.deepEqual(footprint.pads.at(-1), { number: String(pinCount), xMm: -x, yMm: y });
    assert.equal(footprint.limitations.find((line) => line.startsWith("Connect terminals")),
      ties ? `Connect terminals together on the PCB in each group: ${ties}.` : undefined);
    assert.equal(record.simulationModel.status, "not-modelled");
  }
});

test("Coilcraft PoE package variants preserve omitted lands and winding starts", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  const poEParts = records.filter((part) => part.evidenceNote === "library/evidence/coilcraft.poe-power-transformers.md");
  assert.equal(poEParts.length, 66);
  assert.ok(poEParts.every((part) => part.symbolAsset && part.footprintAsset));
  for (const [id, pinCount, firstPadY, starts] of [
    ["poe30p-33ld", 8, 3.75, [3, 2, 6, 5]],
    ["poe70p-33ld", 8, 3.75, [3, 2, 6, 5]],
    ["poe13p-33ld", 10, 5, [3, 2, 8, 7]],
    ["poe60f-33ld", 10, -6.25, [1, 2, 3, 5, 6]],
    ["poe60d-33ld", 12, -6.25, [5, 4, 6, 11, 10]]
  ]) {
    const part = poEParts.find((record) => record.id === `coilcraft.${id}`);
    const footprint = await load(`../${part.footprintEvidence.assetPath}`);
    assert.equal(footprint.pads.length, pinCount);
    assert.equal(footprint.pads[0].yMm, firstPadY);
    assert.ok(starts.every((pin) => part.symbolPinMap[pin].endsWith(" start")));
    if (id.startsWith("poe60f")) {
      assert.ok(footprint.pads.every(({ number }) => number !== "4" && number !== "9"));
    }
  }
});

test("FCT1 variants preserve numbered lands and the D3SL sync winding", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  for (const [code, count, y, span] of [
    ["33m22sld", 10, 5, 16.54],
    ["33d3sld", 12, -7.5, 26.92],
    ["33l2sld", 8, -3.75, 13.71]
  ]) {
    const record = records.find((part) => part.id === `coilcraft.fct1-${code}`);
    const footprint = await load(`../${record.footprintEvidence.assetPath}`);
    assert.equal(footprint.pads.length, count);
    assert.deepEqual(footprint.pads[0], { number: "1", xMm: -span / 2, yMm: y });
    assert.deepEqual(footprint.pads.at(-1), { number: String(count), xMm: span / 2, yMm: y });
    if (code === "33d3sld") {
      assert.deepEqual([record.symbolPinMap[8], record.symbolPinMap[7]], ["Sync start", "Sync end"]);
    }
  }
});

test("BZX84 reflow footprints preserve the top-view pinout and copper land geometry", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  const diodes = records.filter((record) => record.evidenceNote === "library/evidence/nexperia.bzx84.md");
  assert.equal(diodes.length, 95);
  for (const diode of diodes) {
    const footprint = await load(`../${diode.footprintEvidence.assetPath}`);
    assert.deepEqual(footprint.padPattern, {
      shape: "rectangle", widthMm: 0.6, heightMm: 0.7, pitchMm: 1.9, rowCenterSpacingMm: 2
    });
    assert.deepEqual(footprint.pads, [
      { number: "1", xMm: -0.95, yMm: 1 },
      { number: "2", xMm: 0.95, yMm: 1 },
      { number: "3", xMm: 0, yMm: -1 }
    ]);
    assert.deepEqual(diode.symbolPinMap, { 1: "Anode", 2: "No connection", 3: "Cathode" });
    assert.equal(diode.simulationModel.status, "not-modelled");
  }
});

test("BZX384 and BZX585 preserve cathode polarity and distinct reflow geometry", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  for (const [series, count, widthMm, spacing] of [
    ["bzx384", 91, 0.6, 2.2],
    ["bzx585", 54, 0.5, 1.4]
  ]) {
    const batch = records.filter((record) => record.evidenceNote === `library/evidence/nexperia.${series}.md`);
    assert.equal(batch.length, count);
    for (const record of batch) {
      const footprint = await load(`../${record.footprintEvidence.assetPath}`);
      assert.deepEqual(record.symbolPinMap, { 1: "Cathode", 2: "Anode" });
      assert.deepEqual(footprint.padPattern, {
        shape: "rectangle", widthMm, heightMm: 0.6, rowCenterSpacingMm: spacing
      });
      assert.deepEqual(footprint.pads, [
        { number: "1", xMm: -spacing / 2, yMm: 0 },
        { number: "2", xMm: spacing / 2, yMm: 0 }
      ]);
    }
  }
});

test("BZX84W uses the SOT323 reflow dimensions and pin orientation", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  const diodes = records.filter((record) => record.evidenceNote === "library/evidence/nexperia.bzx84w.md");
  assert.equal(diodes.length, 63);
  for (const diode of diodes) {
    const footprint = await load(`../${diode.footprintEvidence.assetPath}`);
    assert.deepEqual(diode.symbolPinMap, { 1: "Anode", 2: "No connection", 3: "Cathode" });
    assert.deepEqual(footprint.padPattern, {
      shape: "rectangle", widthMm: 0.55, heightMm: 0.6, pitchMm: 1.3, rowCenterSpacingMm: 1.85
    });
    assert.deepEqual(footprint.pads, [
      { number: "1", xMm: 0.925, yMm: 0.65 },
      { number: "2", xMm: 0.925, yMm: -0.65 },
      { number: "3", xMm: -0.925, yMm: 0 }
    ]);
  }
});

test("BZT52 maps cathode to pin 1 and uses copper dimensions from the SOD123 drawing", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  const diodes = records.filter((record) => record.evidenceNote === "library/evidence/nexperia.bzt52.md");
  assert.equal(diodes.length, 111);
  for (const diode of diodes) {
    const footprint = await load(`../${diode.footprintEvidence.assetPath}`);
    assert.deepEqual(diode.symbolPinMap, { 1: "Cathode", 2: "Anode" });
    assert.deepEqual(footprint.padPattern, {
      shape: "rectangle", widthMm: 0.91, heightMm: 1.22, rowCenterSpacingMm: 3.27
    });
    assert.deepEqual(footprint.pads, [
      { number: "1", xMm: -1.635, yMm: 0 },
      { number: "2", xMm: 1.635, yMm: 0 }
    ]);
  }
});

test("BZX38450 and BZX884 preserve package-specific copper shapes", async () => {
  const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const { records } = await load("../library/parts-ledger.json");
  const diodes = records.filter((record) => record.evidenceNote === "library/evidence/nexperia.bzx38450-bzx884.md");
  assert.equal(diodes.length, 197);
  const patterns = {
    SOD323: { shape: "rectangle", widthMm: 0.6, heightMm: 0.6, rowCenterSpacingMm: 2.2 },
    SOD882: { shape: "rounded-rectangle", widthMm: 0.4, heightMm: 0.7, cornerRadiusMm: 0.05, rowCenterSpacingMm: 0.7 }
  };
  for (const diode of diodes) {
    const footprint = await load(`../${diode.footprintEvidence.assetPath}`);
    const expected = patterns[diode.package];
    const halfSpacing = expected.rowCenterSpacingMm / 2;
    assert.deepEqual(diode.symbolPinMap, { 1: "Cathode", 2: "Anode" });
    assert.deepEqual(footprint.padPattern, expected);
    assert.deepEqual(footprint.pads, [
      { number: "1", xMm: -halfSpacing, yMm: 0 },
      { number: "2", xMm: halfSpacing, yMm: 0 }
    ]);
  }
});
