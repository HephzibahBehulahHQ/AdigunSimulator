import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPartSymbol } from "./part-symbol-renderer.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const ledgerPath = join(root, "library/parts-ledger.json");
const licensePath = join(root, "library/assets/LICENSE-CC0.txt");
const licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
const requestedPartId = process.argv[2];
const selectedRecords = requestedPartId ? ledger.records.filter((record) => record.id === requestedPartId) : ledger.records;
if (requestedPartId && selectedRecords.length === 0) throw new Error(`No part record for ${requestedPartId}`);
const generated = [];
for (const record of selectedRecords) {
  if (!record.symbolPinMap || !record.packageEvidence?.package) continue;
  const relativePath = `library/assets/parts/${record.id}/symbol.svg`;
  const filePath = join(root, relativePath);
  const content = renderPartSymbol(record);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
  record.symbolAsset = {
    sourceUrl: `https://raw.githubusercontent.com/HephzibahBehulahHQ/AdigunSimulator/main/${relativePath}`,
    sha256: createHash("sha256").update(content).digest("hex"),
    licenseId: "CC0-1.0",
    licenseUrl
  };
  record.symbolPinLabels = { ...record.symbolPinMap };
  generated.push({ id: record.id, path: relativePath, sha256: record.symbolAsset.sha256 });
}

await mkdir(dirname(licensePath), { recursive: true });
await writeFile(licensePath, "Original generic pin-map symbols generated for AdigunSimulator are dedicated to the public domain under CC0 1.0 Universal: https://creativecommons.org/publicdomain/zero/1.0/.\n\nManufacturer pin names and numbers are factual references; symbol artwork is original.\n", "utf8");
await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ generated: generated.length, assets: generated })}\n`);

