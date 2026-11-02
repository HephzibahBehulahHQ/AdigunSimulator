import { createHash } from "node:crypto";

const sha256 = (value) => createHash("sha256").update(value.replace(/\r\n/g, "\n")).digest("hex");

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
    }
  }
  return { valid: errors.length === 0, errors };
}
