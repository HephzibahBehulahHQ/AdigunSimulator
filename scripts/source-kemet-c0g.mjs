import { readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage, validatePartLedger } from "../js/part-ledger.mjs";

const file = name => new URL(`../library/${name}.json`, import.meta.url);
const readJson = async name => JSON.parse(await readFile(file(name), "utf8"));
const writeJson = (name, value) => writeFile(file(name), JSON.stringify(value, null, 2) + "\n");

// KEMET C1003_C0G, Table 1B: use only populated voltage columns.
const e24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30,
  33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];
const voltages = [["8", 10], ["4", 16], ["3", 25], ["5", 50], ["1", 100], ["2", 200], ["A", 250]];
const percentageTolerances = [["F", 1], ["G", 2], ["J", 5], ["K", 10], ["M", 20]];
const absoluteTolerances = [["B", 0.1], ["C", 0.25], ["D", 0.5]];
const nanofaradMantissas = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39];
const percentageSelection = (value, exponent, maxVoltageVdc = 250, size = "1210") => ({
  code: `${value}${exponent}`,
  size,
  capacitancePf: value * 10 ** exponent,
  maxVoltageVdc,
  tolerances: percentageTolerances,
  toleranceField: "tolerancePercent"
});
const selections = [
  ...e24.map(value => percentageSelection(value, 0)),
  ...e24.map(value => ({ code: `${value}9`, capacitancePf: value / 10, tolerances: absoluteTolerances, toleranceField: "tolerancePf" })),
  ...e24.slice(1).map(value => percentageSelection(value, 1)),
  ...nanofaradMantissas.map(value => percentageSelection(value, 2)),
  ...[43, 47, 51, 56, 62, 68, 75, 82, 91].map(value => percentageSelection(value, 2)),
  ...[10, 12, 15, 18, 22, 27, 33, 39, 47].map(value => percentageSelection(value, 3)),
  ...[56, 68, 82].map(value => percentageSelection(value, 3, 100)),
  percentageSelection(10, 4, 100),
  ...[12, 15].map(value => percentageSelection(value, 4, 50)),
  ...[18, 22].map(value => percentageSelection(value, 4, 25)),
  // Table 1A: every selected C1206C row from 100 to 1,000 pF lists all seven voltages.
  ...e24.map(value => percentageSelection(value, 1, 250, "1206")),
  percentageSelection(10, 2, 250, "1206")
];
const datasheet = {
  title: "KEMET C1003_C0G Commercial Grade C0G MLCCs",
  url: "https://content.kemet.com/datasheets/kem_c1003_c0g_smd.pdf",
  accessedAt: "2026-11-23"
};

const [ledger, taxonomy] = await Promise.all([readJson("parts-ledger"), readJson("component-types")]);
const known = new Set(ledger.records.map(part => part.id));
for (const { code, size = "1210", capacitancePf, tolerances, toleranceField, maxVoltageVdc = 250 } of selections) {
  for (const [voltageCode, ratedVoltageVdc] of voltages) {
    if (ratedVoltageVdc > maxVoltageVdc) break;
    for (const [toleranceCode, tolerance] of tolerances) {
      const manufacturerPartNumber = `C${size}C${code}${toleranceCode}${voltageCode}GACTU`;
      const id = `kemet.${manufacturerPartNumber.toLowerCase()}`;
      if (known.has(id)) continue;
      ledger.records.push({
        id,
        manufacturer: "KEMET",
        manufacturerPartNumber,
        category: "Passive components",
        type: "C0G multilayer ceramic capacitor",
        package: `${size} chip capacitor`,
        lifecycle: "unknown",
        verificationStatus: "candidate",
        datasheet,
        nominalCapacitancePf: capacitancePf,
        ratedVoltageVdc,
        [toleranceField]: tolerance,
        evidenceNote: `library/evidence/kemet.c${size}c-c0g.md`,
        simulationModel: { status: "not-modelled", reason: "Native model mapping has not been validated for this order code." }
      });
    }
  }
}

const result = validatePartLedger(ledger, taxonomy);
if (!result.valid) throw new Error(JSON.stringify(result.errors));
await writeJson("parts-ledger", ledger);
await writeJson("parts-coverage", getLibraryCoverage(ledger, taxonomy));
