import { readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage, validatePartLedger } from "../js/part-ledger.mjs";

const file = name => new URL(`../library/${name}.json`, import.meta.url);
const readJson = async name => JSON.parse(await readFile(file(name), "utf8"));
const writeJson = (name, value) => writeFile(file(name), JSON.stringify(value, null, 2) + "\n");

// Coilcraft document 908-1. Each row uses standard E termination and C reel.
const series = {
  XAL5030: [["161", 0.16], ["331", 0.33], ["601", 0.6], ["801", 0.8],
    ["102", 1], ["122", 1.2], ["222", 2.2], ["332", 3.3], ["472", 4.7]],
  XAL5050: [["472", 4.7], ["562", 5.6], ["682", 6.8], ["822", 8.2],
    ["103", 10], ["153", 15], ["223", 22]]
};
const datasheet = {
  title: "Coilcraft XAL50xx Shielded Power Inductors, document 908",
  url: "https://www.coilcraft.com/getmedia/49bc46c8-4b2c-45b9-9b6c-2eaa235ea698/xal50xx.pdf",
  accessedAt: "2026-11-24"
};
const [ledger, taxonomy] = await Promise.all([readJson("parts-ledger"), readJson("component-types")]);
const known = new Set(ledger.records.map(part => part.id));
for (const [packageName, rows] of Object.entries(series)) {
  for (const [code, nominalInductanceMicrohenries] of rows) {
    const manufacturerPartNumber = `${packageName}-${code}MEC`;
    const id = `coilcraft.${manufacturerPartNumber.toLowerCase()}`;
    if (known.has(id)) continue;
    ledger.records.push({
      id,
      manufacturer: "Coilcraft",
      manufacturerPartNumber,
      category: "Passive components",
      type: "Shielded power inductor",
      package: `${packageName} surface mount`,
      lifecycle: "unknown",
      verificationStatus: "candidate",
      datasheet,
      nominalInductanceMicrohenries,
      tolerancePercent: 20,
      evidenceNote: "library/evidence/coilcraft.xal50xx.md",
      simulationModel: { status: "not-modelled", reason: "Native model mapping has not been validated for this order code." }
    });
  }
}
const validation = validatePartLedger(ledger, taxonomy);
if (!validation.valid) throw new Error(JSON.stringify(validation.errors));
await writeJson("parts-ledger", ledger);
await writeJson("parts-coverage", getLibraryCoverage(ledger, taxonomy));
