import { createHash } from "node:crypto";

const sha256 = (value) => createHash("sha256").update(value.replace(/\r\n/g, "\n")).digest("hex");
const decodeXml = (value) => value.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => ({
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&apos;": "'"
})[entity]);

function symbolPins(svg) {
  const pins = {};
  for (const match of svg.matchAll(/<g\b([^>]*\bdata-pin="([^"]+)"[^>]*)>([\s\S]*?)<\/g>|<path\b([^>]*\bdata-pin="([^"]+)"[^>]*)\/>/g)) {
    const attributes = match[1] ?? match[4] ?? "";
    const body = match[3] ?? "";
    const number = match[2] ?? match[5];
    const electricalType = attributes.match(/\bdata-electrical-type="([^"]+)"/)?.[1];
    const labels = [...body.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => decodeXml(match[1]));
    const declaredName = attributes.match(/\bdata-pin-name="([^"]+)"/)?.[1];
    const name = declaredName ? decodeXml(declaredName) : labels[0];
    if (!name || (!declaredName && labels.at(-1) !== number) || Object.hasOwn(pins, number)) return null;
    pins[number] = { name, electricalType };
  }
  return Object.keys(pins).length ? pins : null;
}

function symbolPinLabels(svg) {
  const labels = {};
  for (const match of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const number = match[1].match(/\bdata-pin-label-for="([^"]+)"/)?.[1];
    if (!number) continue;
    if (Object.hasOwn(labels, number)) return null;
    labels[number] = decodeXml(match[2].replace(/<[^>]*>/g, "").trim());
  }
  return Object.keys(labels).length ? labels : null;
}

function footprintPads(json) {
  try {
    const footprint = JSON.parse(json);
    if (!Array.isArray(footprint.pads) || !footprint.pads.length) return null;
    const numbers = footprint.pads.map((pad) => String(pad.number));
    if (numbers.some((number) => !number || number === "undefined") || new Set(numbers).size !== numbers.length) return null;
    if (footprint.pads.some((pad) => !Number.isFinite(pad.xMm) || !Number.isFinite(pad.yMm))) return null;
    return { partId: footprint.partId, numbers };
  } catch {
    return null;
  }
}

export async function validatePartAssetIntegrity(ledger, readAsset) {
  const errors = [];
  if (typeof readAsset !== "function") return { valid: false, errors: [{ code: "ASSET_READER", message: "An asset reader is required." }] };

  for (const record of ledger?.records ?? []) {
    const assets = [
      { label: "symbol", metadata: record.symbolAsset, path: `library/assets/parts/${record.id}/symbol.svg`, prefix: `library/assets/parts/${record.id}/` },
      { label: "footprint", metadata: record.footprintAsset, path: record.footprintEvidence?.assetPath, prefix: `library/assets/footprints/${record.id}/` }
    ];
    for (const asset of assets) {
      if (!asset.metadata) continue;
      if (!asset.path || !asset.path.startsWith(asset.prefix) || asset.path.includes("..")) {
        errors.push({ code: "ASSET_PATH", partId: record.id, message: `${asset.label} asset has no safe repository path.` });
        continue;
      }
      if (!asset.metadata.sourceUrl?.endsWith(`/${asset.path}`)) {
        errors.push({ code: "ASSET_SOURCE_PATH", partId: record.id, message: `${asset.label} source URL does not identify its repository asset.` });
      }
      let contents;
      try {
        contents = await readAsset(asset.path);
      } catch {
        errors.push({ code: "ASSET_FILE_MISSING", partId: record.id, message: `${asset.label} asset file is missing: ${asset.path}.` });
        continue;
      }
      const text = typeof contents === "string" ? contents : Buffer.from(contents).toString("utf8");
      if (sha256(text) !== asset.metadata.sha256) {
        errors.push({ code: "ASSET_HASH", partId: record.id, message: `${asset.label} asset SHA-256 does not match the ledger.` });
      }
      if (asset.label === "symbol" && record.symbolPinMap) {
        const pins = symbolPins(text);
        const matches = pins && Object.keys(pins).length === Object.keys(record.symbolPinMap).length
          && Object.entries(record.symbolPinMap).every(([number, name]) => pins[number]?.name === String(name)
            && (!record.pinElectricalTypes?.[number] || pins[number].electricalType === record.pinElectricalTypes[number]));
        if (!matches) errors.push({ code: "SYMBOL_PIN_MAP_ASSET", partId: record.id, message: "Symbol pin numbers, labels, or electrical types do not match the ledger." });
      }
      if (asset.label === "symbol" && record.symbolPinLabels) {
        const labels = symbolPinLabels(text);
        const expected = record.symbolPinLabels;
        const matches = labels && Object.keys(expected).length === Object.keys(record.symbolPinMap ?? {}).length
          && Object.entries(expected).every(([number, label]) => Object.hasOwn(record.symbolPinMap ?? {}, number)
            && labels[number] === String(label));
        if (!matches) errors.push({ code: "SYMBOL_VISIBLE_LABEL_ASSET", partId: record.id, message: "Visible symbol pin labels do not match their declared pin numbers and ledger labels." });
      }
      if (asset.label === "footprint" && record.footprintPadMap) {
        const footprint = footprintPads(text);
        const expectedPads = Object.values(record.footprintPadMap).map(String);
        const matches = footprint && footprint.partId === record.id
          && new Set(expectedPads).size === expectedPads.length
          && expectedPads.length === footprint.numbers.length
          && expectedPads.every((number) => footprint.numbers.includes(number));
        if (!matches) errors.push({ code: "FOOTPRINT_PAD_MAP_ASSET", partId: record.id, message: "Footprint part identity or pad numbers do not match the ledger." });
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
