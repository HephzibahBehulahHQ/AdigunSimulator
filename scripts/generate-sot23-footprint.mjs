import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage } from "../js/part-ledger.mjs";

const partId = "nexperia.bss138bk";
const ledgerPath = "library/parts-ledger.json";
const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
const record = ledger.records.find((item) => item.id === partId);
if (!record) throw new Error(`Missing ledger record: ${partId}`);

const sourceUrl = "https://assets.nexperia.com/documents/data-sheet/BSS138BK.pdf";
const pads = [
  { number: 1, xMm: -1.075, yMm: 0, widthMm: 1.7, heightMm: 0.7 },
  { number: 2, xMm: 1.075, yMm: 0.95, widthMm: 0.6, heightMm: 1.0 },
  { number: 3, xMm: 1.075, yMm: -0.95, widthMm: 0.6, heightMm: 1.0 }
];
const footprint = {
  schemaVersion: 1,
  kind: "manufacturer-reflow-footprint-candidate",
  partId,
  package: "Nexperia SOT23 (TO-236AB)",
  view: "top",
  units: "mm",
  pinOne: { number: 1, xMm: -1.075, yMm: 0 },
  packageOutline: {
    bodyLengthMm: { minimum: 2.8, maximum: 3.0 },
    bodyWidthMm: { minimum: 1.2, maximum: 1.4 },
    bodyHeightMm: { minimum: 0.9, maximum: 1.1 },
    pinPitchMm: 1.9,
    sourceUrl,
    drawing: "Figure 18, SOT23 package outline; dimensions in original mm"
  },
  landPattern: {
    sourceUrl,
    drawing: "Figure 19, reflow soldering footprint for SOT23 (TO-236AB)",
    padGeometrySource: "Manufacturer drawing dimensions: pin 1 pad 1.7 × 0.7 mm; pins 2 and 3 pads 0.6 × 1.0 mm; opposing-pin pitch 1.9 mm; pin-pair pitch 0.95 mm.",
    padCoordinatesSource: "Pad centers are reconstructed from Figure 19's 3.3 mm total span, 1.9 mm pin-pair pitch, and symmetric arrangement; verify against the drawing before fabrication."
  },
  pads,
  limitations: [
    "Manufacturer soldering drawing is used for the reflow pad dimensions; center coordinates are reconstructed from its labeled dimensions and require independent inspection.",
    "This candidate has not had independent physical-fit, assembly, solder-mask, courtyard, board-rule, or manufacturing review.",
    "No semiconductor device model is implied by this footprint."
  ],
  license: { id: "CC0-1.0", url: "https://creativecommons.org/publicdomain/zero/1.0/" }
};

const assetPath = `library/assets/footprints/${partId}/footprint.json`;
await mkdir(`library/assets/footprints/${partId}`, { recursive: true });
const bytes = `${JSON.stringify(footprint, null, 2)}\n`;
await writeFile(assetPath, bytes, "utf8");
const symbolPath = `library/assets/parts/${partId}/symbol.svg`;
const symbol = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" role="img" aria-label="N-channel MOSFET, pins 1 Gate, 2 Source, 3 Drain"><g fill="none" stroke="#172b3d" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"><path data-pin="1" d="M12 50h32"/><path d="M48 29v42M57 31v38M57 50h22"/><path data-pin="3" d="M79 50V10M79 10h24"/><path data-pin="2" d="M79 50v40M79 90h24"/><path d="m68 77 11 13 11-13"/></g><g fill="#172b3d" font-family="sans-serif" font-size="10"><text x="3" y="44">1 G</text><text x="91" y="10">3 D</text><text x="91" y="96">2 S</text></g></svg>\n`;
await mkdir(`library/assets/parts/${partId}`, { recursive: true });
await writeFile(symbolPath, symbol, "utf8");
record.package = "SOT23-3 (TO-236AB)";
record.symbolPinMap = { "1": "Gate", "2": "Source", "3": "Drain" };
record.pinElectricalTypes = { "1": "input", "2": "passive", "3": "passive" };
record.footprintPadMap = { "1": "1", "2": "2", "3": "3" };
record.modelStatus = "not-modelled";
record.simulationModel = {
  status: "not-modelled",
  reason: "No licensed and validated BSS138BK model is attached. The generic MOSFET model must not be treated as matching this device's transfer, switching, thermal, or safe-operating characteristics."
};
record.ratings = [
  { name: "drain-source voltage", maximum: 60, unit: "V" },
  { name: "gate-source voltage", minimum: -20, maximum: 20, unit: "V" },
  { name: "continuous drain current", maximum: 0.36, unit: "A", conditions: "VGS = 10 V; ambient 25 °C; PCB mounting conditions apply" },
  { name: "drain-source on-state resistance", typical: 1, maximum: 1.6, unit: "Ω", conditions: "VGS = 10 V; ID = 350 mA; junction 25 °C" }
];
record.warnings = [
  "The 360 mA current rating is conditional on gate voltage, ambient temperature, PCB mounting, and thermal limits; it is not a general safe current for every layout.",
  "The ±20 V gate-source limit is a maximum stress rating. Keep gate voltage within recommended operating conditions and protect against transients.",
  "The component is unmodelled in this simulator; do not infer device-specific switching, RDS(on), thermal, or safe-operating behavior."
];
record.alternates = [];
record.breadboard = {
  compatible: false,
  adapter: "SOT23 is a surface-mount package and cannot be inserted directly into a solderless breadboard. Use a properly wired SOT23-to-through-hole adapter and check orientation and pin numbering.",
  operatingLimits: ["Maximum VDS: 60 V", "Maximum VGS: −20 V to +20 V", "360 mA current rating applies only under the datasheet's stated conditions"]
};
record.translations = {
  en: { name: "BSS138BK N-channel MOSFET (SOT23)", description: "SOT23 N-channel MOSFET with sourced pin and package data. The simulator does not model this device's electrical or thermal behavior." },
  de: { name: "BSS138BK N-Kanal-MOSFET (SOT23)", description: "N-Kanal-MOSFET im SOT23-Gehäuse mit belegten Pin- und Gehäusedaten. Das Simulationsmodell bildet das elektrische und thermische Verhalten dieses Bauteils nicht ab." },
  yo: { name: "BSS138BK MOSFET N-channel (SOT23)", description: "MOSFET N-channel nínú package SOT23 pẹ̀lú data pin àti package tó ní orísun. Simulator yìí kò model ìwà itanna tàbí ooru gangan ti component yìí." },
  pcm: { name: "BSS138BK N-channel MOSFET (SOT23)", description: "N-channel MOSFET for SOT23 package with sourced pin and package data. Simulator no model the exact electrical or heat behaviour of this part." }
};
record.footprintEvidence = {
  sourceUrl,
  drawing: "Figures 18–19: SOT23 package outline and manufacturer reflow soldering footprint",
  assetPath,
  designNote: "Manufacturer pad dimensions are retained. Pad-center coordinates are reconstructed from labeled pattern dimensions and require human review."
};
record.symbolAsset = {
  sourceUrl: `https://raw.githubusercontent.com/HephzibahBehulahHQ/AdigunSimulator/main/${symbolPath}`,
  sha256: createHash("sha256").update(symbol).digest("hex"),
  licenseId: "CC0-1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/"
};
record.lifecycleEvidence = { sourceUrl: "https://www.nexperia.com/product/BSS138BK", checkedAt: "2026-11-02" };
record.footprintAsset = {
  sourceUrl: `https://raw.githubusercontent.com/HephzibahBehulahHQ/AdigunSimulator/main/${assetPath}`,
  sha256: createHash("sha256").update(bytes).digest("hex"),
  licenseId: "CC0-1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  designStatus: "educational-candidate"
};
record.notes = "Nexperia datasheet confirms BSS138BK pin mapping and SOT23 dimensions, and provides a manufacturer reflow pad pattern. Pattern center coordinates are reconstructed and remain subject to independent review. The device model is not implemented; no datasheet checksum or human approval is recorded.";
ledger.lastUpdated = "2026-11-02";
await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
const taxonomy = JSON.parse(await readFile("library/component-types.json", "utf8"));
await writeFile("library/parts-coverage.json", `${JSON.stringify(getLibraryCoverage(ledger, taxonomy), null, 2)}\n`, "utf8");
process.stdout.write(`Generated source-backed SOT23 candidate for ${partId}; human review and datasheet checksum remain open.\n`);
