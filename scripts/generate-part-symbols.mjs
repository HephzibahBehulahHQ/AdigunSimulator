import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const ledgerPath = join(root, "library/parts-ledger.json");
const licensePath = join(root, "library/assets/LICENSE-CC0.txt");
const licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
const xml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
})[char]);

function renderSymbol(record) {
  const entries = Object.entries(record.symbolPinMap).sort(([a], [b]) => Number(a) - Number(b));
  const split = Math.ceil(entries.length / 2);
  const left = entries.slice(0, split);
  const right = entries.slice(split).reverse();
  const rows = Math.max(left.length, right.length);
  const height = Math.max(180, rows * 30 + 96);
  const bodyTop = 48;
  const bodyBottom = height - 42;
  const rowY = (index) => bodyTop + 24 + index * 30;
  const pin = (entry, side, index) => {
    const [number, name] = entry;
    const y = rowY(index);
    const isLeft = side === "left";
    const x1 = isLeft ? 18 : 282;
    const x2 = isLeft ? 84 : 348;
    const labelX = isLeft ? 22 : 344;
    const anchor = isLeft ? "start" : "end";
    const numberX = isLeft ? 78 : 288;
    return `<g data-pin="${xml(number)}" data-electrical-type="${xml(record.pinElectricalTypes?.[number] ?? "passive")}"><path d="M${x1} ${y}H${x2}"/><text x="${labelX}" y="${y - 3}" text-anchor="${anchor}">${xml(name)}</text><text x="${numberX}" y="${y + 11}" text-anchor="${isLeft ? "end" : "start"}" class="pin-number">${xml(number)}</text></g>`;
  };
  const pins = [...left.map((entry, index) => pin(entry, "left", index)), ...right.map((entry, index) => pin(entry, "right", index))].join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 366 ${height}" role="img" aria-labelledby="title description" data-license="CC0-1.0">\n<title id="title">${xml(record.manufacturerPartNumber)} pin-map symbol</title>\n<desc id="description">Generic connection-block schematic symbol. Pin labels and numbers are transcribed from the linked manufacturer evidence; this drawing is original and does not imply a device simulation model.</desc>\n<style>text{font:12px Arial,sans-serif;fill:#111}path{stroke:#111;stroke-width:2;fill:none}.body{fill:#fff;stroke:#111;stroke-width:2}.heading{font-weight:bold;font-size:14px}.sub{font-size:11px}.pin-number{font-size:10px}</style>\n${pins}\n<rect class="body" x="88" y="${bodyTop}" width="190" height="${bodyBottom - bodyTop}" rx="3"/>\n<text class="heading" x="183" y="${bodyTop + 28}" text-anchor="middle">${xml(record.manufacturerPartNumber)}</text>\n<text class="sub" x="183" y="${bodyTop + 46}" text-anchor="middle">${xml(record.type)}</text>\n<text class="sub" x="183" y="${bodyTop + 62}" text-anchor="middle">${xml(record.packageEvidence.package)}</text>\n</svg>\n`;
}

const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
const requestedPartId = process.argv[2];
const selectedRecords = requestedPartId ? ledger.records.filter((record) => record.id === requestedPartId) : ledger.records;
if (requestedPartId && selectedRecords.length === 0) throw new Error(`No part record for ${requestedPartId}`);
const generated = [];
for (const record of selectedRecords) {
  if (!record.symbolPinMap || !record.packageEvidence?.package) continue;
  const relativePath = `library/assets/parts/${record.id}/symbol.svg`;
  const filePath = join(root, relativePath);
  const content = renderSymbol(record);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
  record.symbolAsset = {
    sourceUrl: `https://raw.githubusercontent.com/HephzibahBehulahHQ/AdigunSimulator/main/${relativePath}`,
    sha256: createHash("sha256").update(content).digest("hex"),
    licenseId: "CC0-1.0",
    licenseUrl
  };
  generated.push({ id: record.id, path: relativePath, sha256: record.symbolAsset.sha256 });
}

await mkdir(dirname(licensePath), { recursive: true });
await writeFile(licensePath, "Original generic pin-map symbols generated for AdigunSimulator are dedicated to the public domain under CC0 1.0 Universal: https://creativecommons.org/publicdomain/zero/1.0/.\n\nManufacturer pin names and numbers are factual references; symbol artwork is original.\n", "utf8");
await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ generated: generated.length, assets: generated })}\n`);

