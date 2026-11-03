import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage } from "../js/part-ledger.mjs";

const licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
const configs = [
  {
    partId: "microchip.atmega328p-pu",
    manufacturer: "Microchip",
    package: "28P3 PDIP-28",
    pinCount: 28,
    leadWidthMaxMm: 0.533,
    bodyLengthMm: { minimum: 34.544, maximum: 34.798 },
    bodyWidthMm: { minimum: 7.112, maximum: 7.493 },
    sourceUrl: "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega48A-PA-88A-PA-168A-PA-328-P-DS-DS40002061A.pdf",
    drawing: "28P3, DS40002061A, package drawing page 640"
  },
  {
    partId: "ti.lm555p",
    manufacturer: "Texas Instruments",
    package: "P / R-PDIP-T8",
    pinCount: 8,
    leadWidthMaxMm: 0.533,
    bodyLengthMm: { minimum: 9.02, maximum: 10.16 },
    bodyWidthMm: { minimum: 6.10, maximum: 6.60 },
    sourceUrl: "https://www.ti.com/lit/ds/symlink/lm555.pdf",
    drawing: "P (R-PDIP-T8), drawing 4040082/E, 04/2010"
  },
  {
    partId: "ti.sn74hc00n",
    manufacturer: "Texas Instruments",
    package: "N / R-PDIP-T14",
    pinCount: 14,
    leadWidthMaxMm: 0.53,
    bodyLengthMm: { nominal: 19.30 },
    bodyWidthMm: { nominal: 6.40 },
    sourceUrl: "https://www.ti.com/lit/ds/symlink/sn74hc00.pdf",
    drawing: "N (PDIP-14), SN74HC00 device information table; nominal body size 19.30 × 6.40 mm"
  },
  {
    partId: "ti.sn74hc138n",
    manufacturer: "Texas Instruments",
    package: "N / R-PDIP-T16",
    pinCount: 16,
    leadWidthMaxMm: 0.53,
    bodyLengthMm: { minimum: 18.92, maximum: 19.69 },
    bodyWidthMm: { minimum: 6.10, maximum: 6.60 },
    sourceUrl: "https://www.ti.com/lit/ds/symlink/sn74hc138.pdf",
    drawing: "N (R-PDIP-T16), package outline drawing 4040049/E"
  },
  {
    partId: "microchip.mcp6002-i-p",
    manufacturer: "Microchip",
    package: "P / 8-Lead PDIP, 300 mil body",
    pinCount: 8,
    leadWidthMaxMm: 0.559,
    bodyLengthMm: { minimum: 8.8392, typical: 9.271, maximum: 10.16 },
    bodyWidthMm: { minimum: 6.096, typical: 6.35, maximum: 7.112 },
    sourceUrl: "https://ww1.microchip.com/downloads/aemDocuments/documents/MSLD/ProductDocuments/DataSheets/MCP6001-1R-1U-2-4-1-MHz-Low-Power-Op-Amp-DS20001733L.pdf",
    drawing: "C04-018-P Rev E Sheet 2, DS20001733L page 30; dimensions converted from inches to mm"
  },
  {
    partId: "ti.lm7805ct-nopb",
    manufacturer: "Texas Instruments",
    package: "NDG0003F TO-220-3",
    pinCount: 3,
    layout: "inline",
    leadWidthMaxMm: 1.397,
    leadThicknessMaxMm: 0.94,
    bodyLengthMm: { minimum: 8.39, typical: 8.64, maximum: 8.89 },
    bodyWidthMm: { minimum: 10.04, typical: 10.16, maximum: 10.54 },
    overallLengthMaxMm: 16.26,
    padDiameterMm: 3.5,
    padDrillMm: 2.0,
    sourceUrl: "https://www.ti.com/lit/ds/symlink/lm7800.pdf",
    drawing: "NDG0003F, TO-220, datasheet mechanical drawing"
  }
];
const pitchMm = 2.54;
const rowPitchMm = 7.62;

function makePads(pinCount, layout) {
  if (layout === "inline") {
    const firstY = -((pinCount - 1) * pitchMm) / 2;
    return Array.from({ length: pinCount }, (_, index) => ({ number: index + 1, xMm: 0, yMm: firstY + index * pitchMm }));
  }
  const rowCount = pinCount / 2;
  const firstY = -((rowCount - 1) * pitchMm) / 2;
  const pads = [];
  for (let number = 1; number <= rowCount; number += 1) {
    pads.push({ number, xMm: -rowPitchMm / 2, yMm: firstY + (number - 1) * pitchMm });
  }
  for (let number = rowCount + 1; number <= pinCount; number += 1) {
    pads.push({ number, xMm: rowPitchMm / 2, yMm: -firstY - (number - rowCount - 1) * pitchMm });
  }
  return pads;
}

const requestedPartId = process.argv[2];
const selectedConfigs = requestedPartId ? configs.filter((config) => config.partId === requestedPartId) : configs;
if (requestedPartId && selectedConfigs.length === 0) throw new Error(`No PDIP footprint configuration for ${requestedPartId}`);
const ledger = JSON.parse(await readFile("library/parts-ledger.json", "utf8"));
const taxonomy = JSON.parse(await readFile("library/component-types.json", "utf8"));
for (const config of selectedConfigs) {
  const record = ledger.records.find((item) => item.id === config.partId);
  if (!record) throw new Error(`Missing part ledger record: ${config.partId}`);
  const pads = makePads(config.pinCount, config.layout);
  if (Object.keys(record.symbolPinMap ?? {}).length !== pads.length) {
    throw new Error(`Pin count mismatch for ${config.partId}; refusing to generate a misleading footprint.`);
  }
  const assetPath = `library/assets/footprints/${config.partId}/footprint.json`;
  const sourceUrl = `https://raw.githubusercontent.com/HephzibahBehulahHQ/AdigunSimulator/main/${assetPath}`;
  const footprint = {
    schemaVersion: 1,
    kind: "educational-through-hole-footprint",
    partId: config.partId,
    package: `${config.manufacturer} ${config.package}`,
    view: "top",
    units: "mm",
    pinOne: { number: 1, xMm: pads[0].xMm, yMm: pads[0].yMm },
    packageOutline: {
      bodyLengthMm: config.bodyLengthMm,
      bodyWidthMm: config.bodyWidthMm,
      overallLengthMaxMm: config.overallLengthMaxMm ?? null,
      leadRowPitchMm: config.layout === "inline" ? null : rowPitchMm,
      leadPitchMm: pitchMm,
      layout: config.layout ?? "dual-row",
      sourceUrl: config.sourceUrl,
      drawing: config.drawing
    },
    padPattern: {
      shape: "circle",
      diameterMm: config.padDiameterMm ?? 1.8,
      drillMm: config.padDrillMm ?? 0.8,
      source: `AdigunSimulator CC0 educational default selected against the stated ${config.leadWidthMaxMm} mm maximum lead width${config.leadThicknessMaxMm ? ` and ${config.leadThicknessMaxMm} mm maximum lead thickness` : ""}; not a manufacturer land-pattern recommendation or fabrication rule.`
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
  await mkdir(`library/assets/footprints/${config.partId}`, { recursive: true });
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
    sourceUrl: config.sourceUrl,
    drawing: config.drawing,
    assetPath,
    designNote: "Pad diameter and drill are application-selected educational defaults, not sourced manufacturer recommendations."
  };
}

await writeFile("library/parts-ledger.json", `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
await writeFile("library/parts-coverage.json", `${JSON.stringify(getLibraryCoverage(ledger, taxonomy), null, 2)}\n`, "utf8");
process.stdout.write(`Generated ${selectedConfigs.length} through-hole footprint candidates (${selectedConfigs.map(({ pinCount }) => pinCount).join(" and ")} pins)\n`);
