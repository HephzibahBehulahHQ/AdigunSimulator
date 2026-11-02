import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage } from "../js/part-ledger.mjs";

const partId = "microchip.atmega328p-pu";
const assetPath = `library/assets/footprints/${partId}/footprint.json`;
const sourceUrl = `https://raw.githubusercontent.com/HephzibahBehulahHQ/AdigunSimulator/main/${assetPath}`;
const licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
const pitchMm = 2.54;
const rowPitchMm = 7.62;
const firstRowY = -((14 - 1) * pitchMm) / 2;
const pads = [];

for (let number = 1; number <= 14; number += 1) {
  pads.push({ number, xMm: -rowPitchMm / 2, yMm: firstRowY + (number - 1) * pitchMm });
}
for (let number = 15; number <= 28; number += 1) {
  pads.push({ number, xMm: rowPitchMm / 2, yMm: -firstRowY - (number - 15) * pitchMm });
}

const footprint = {
  schemaVersion: 1,
  kind: "educational-through-hole-footprint",
  partId,
  package: "Microchip 28P3 PDIP-28",
  view: "top",
  units: "mm",
  pinOne: { number: 1, xMm: -rowPitchMm / 2, yMm: firstRowY },
  packageOutline: {
    bodyLengthMm: { minimum: 34.544, maximum: 34.798 },
    bodyWidthMm: { minimum: 7.112, maximum: 7.493 },
    leadRowPitchMm: rowPitchMm,
    leadPitchMm: pitchMm,
    sourceUrl: "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega48A-PA-88A-PA-168A-PA-328-P-DS-DS40002061A.pdf",
    drawing: "28P3, DS40002061A, package drawing page 640"
  },
  padPattern: {
    shape: "circle",
    diameterMm: 1.8,
    drillMm: 0.8,
    source: "AdigunSimulator CC0 educational default selected for a 0.533 mm maximum stated lead width; not a manufacturer land-pattern recommendation or fabrication rule."
  },
  pads,
  limitations: [
    "Generated from the published package outline and pin numbering; the manufacturer does not publish this generated pad artwork as an approved land pattern.",
    "Check the exact physical part, finished-hole tolerance, annular ring, solder process, courtyard, board rules, and assembly constraints before use.",
    "This asset is educational and has not passed independent footprint review or manufacturing DRC."
  ],
  license: { id: "CC0-1.0", url: licenseUrl }
};

const bytes = `${JSON.stringify(footprint, null, 2)}\n`;
const ledger = JSON.parse(await readFile("library/parts-ledger.json", "utf8"));
const taxonomy = JSON.parse(await readFile("library/component-types.json", "utf8"));
const record = ledger.records.find((item) => item.id === partId);
if (!record) throw new Error(`Missing part ledger record: ${partId}`);

await mkdir(`library/assets/footprints/${partId}`, { recursive: true });
await writeFile(assetPath, bytes, "utf8");
record.footprintAsset = {
  sourceUrl,
  sha256: createHash("sha256").update(bytes).digest("hex"),
  licenseId: "CC0-1.0",
  licenseUrl,
  designStatus: "educational-candidate"
};
record.footprintPadMap = Object.fromEntries(pads.map((pad) => [String(pad.number), String(pad.number)]));
record.footprintEvidence = {
  sourceUrl: footprint.packageOutline.sourceUrl,
  drawing: footprint.packageOutline.drawing,
  assetPath,
  designNote: "Pad diameter and drill are application-selected educational defaults, not sourced manufacturer recommendations."
};
await writeFile("library/parts-ledger.json", `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
await writeFile("library/parts-coverage.json", `${JSON.stringify(getLibraryCoverage(ledger, taxonomy), null, 2)}\n`, "utf8");
process.stdout.write(`Generated ${assetPath} (${pads.length} mapped pins)\n`);
