import { readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage, validatePartLedger } from "../js/part-ledger.mjs";

const readJson = async name => JSON.parse(await readFile(new URL(`../library/${name}.json`, import.meta.url), "utf8"));
const writeJson = (name, value) => writeFile(new URL(`../library/${name}.json`, import.meta.url), JSON.stringify(value, null, 2) + "\n");

// Vishay document 20035, pp. 2–3. One listed packaging code per size.
const packaging = {
  "0402": "ED", "0603": "EA", "0805": "EA", "1206": "EA",
  "1210": "EA", "1218": "EK", "2010": "EF", "2512": "EG"
};
const packageResistanceLimits = { "1218": 2_200_000 };
const e24Mantissas = [100, 110, 120, 130, 150, 160, 180, 200, 220, 240, 270, 300,
  330, 360, 390, 430, 470, 510, 560, 620, 680, 750, 820, 910];
const resistanceValues = Array.from({ length: 7 }, (_, decade) =>
  e24Mantissas.map(mantissa => mantissa * 10 ** decade / 100)
).flat();
resistanceValues.push(10_000_000);

function resistanceCode(ohms) {
  const [unit, multiplier] = ohms >= 1_000_000 ? ["M", 1_000_000]
    : ohms >= 1_000 ? ["K", 1_000] : ["R", 1];
  const value = ohms / multiplier;
  const decimalPlaces = 3 - String(Math.trunc(value)).length;
  const [whole, fraction = ""] = value.toFixed(decimalPlaces).split(".");
  return whole + unit + fraction;
}
const datasheet = {
  title: "Vishay D/CRCW e3 Standard Thick Film Chip Resistors (20035)",
  url: "https://www.vishay.com/docs/20035/dcrcwe3.pdf",
  accessedAt: "2026-11-23",
  sha256: "7bb1860ab4bd41c7dc05d176602a33e384d64f413c17e49dce61ceb45d2cd0c1"
};

const [ledger, taxonomy] = await Promise.all([readJson("parts-ledger"), readJson("component-types")]);
const known = new Set(ledger.records.map(record => record.id));
for (const [size, reel] of Object.entries(packaging)) {
  for (const ohms of resistanceValues) {
    if (ohms > (packageResistanceLimits[size] ?? 10_000_000)) break;
    const manufacturerPartNumber = `CRCW${size}${resistanceCode(ohms)}JN${reel}`;
    const id = `vishay.${manufacturerPartNumber.toLowerCase()}`;
    if (known.has(id)) continue;
    ledger.records.push({
      id,
      manufacturer: "Vishay",
      manufacturerPartNumber,
      category: "Passive components",
      type: "Thick-film chip resistor",
      package: `${size} chip resistor`,
      lifecycle: "unknown",
      verificationStatus: "candidate",
      datasheet,
      nominalResistanceOhms: ohms,
      tolerancePercent: 5,
      temperatureCoefficientPpmPerKelvin: 200,
      evidenceNote: "library/evidence/vishay.crcw-e24.md",
      simulationModel: { status: "not-modelled", reason: "Native model mapping has not been validated for this order code." }
    });
  }
}

const result = validatePartLedger(ledger, taxonomy);
if (!result.valid) throw new Error(JSON.stringify(result.errors));
await writeJson("parts-ledger", ledger);
await writeJson("parts-coverage", getLibraryCoverage(ledger, taxonomy));
