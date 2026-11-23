import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage } from "../js/part-ledger.mjs";

const root = new URL("../", import.meta.url);
const path = name => new URL(name, root);
const read = name => readFile(path(name), "utf8");
const readJson = async name => JSON.parse(await read(name));
const json = data => JSON.stringify(data, null, 2) + "\n";
const templateId = "coilcraft.xal5030-102mec";
const ledger = await readJson("library/parts-ledger.json");
const template = ledger.records.find(record => record.id === templateId);
const baseFootprint = await readJson(template.footprintEvidence.assetPath);
const baseSymbol = (await read(`library/assets/parts/${templateId}/symbol.svg`)).replace(/\r\n/g, "\n");

async function writeAsset(folder, filename, contents, metadata) {
  await mkdir(path(folder), { recursive: true });
  const name = `${folder}/${filename}`;
  await writeFile(path(name), contents);
  return {
    ...metadata,
    sourceUrl: `https://raw.githubusercontent.com/HephzibahBehulahHQ/AdigunSimulator/main/${name}`,
    sha256: createHash("sha256").update(contents).digest("hex")
  };
}

for (const record of ledger.records) {
  const match = /^XAL(5030|5050)-(\d{3})MEC$/.exec(record.manufacturerPartNumber);
  if (record.manufacturer !== "Coilcraft" || !match || record.id === templateId || record.footprintAsset) continue;
  const [, size, valueCode] = match;
  const folder = `library/assets/footprints/${record.id}`;
  const footprint = structuredClone(baseFootprint);
  footprint.partId = record.id;
  footprint.package = `Coilcraft XAL${size}`;
  if (size === "5050") {
    footprint.packageOutline.heightMaxMm = 5.1;
    if (valueCode === "472") {
      delete footprint.packageOutline.heightMaxMm;
      footprint.limitations.push("The shared drawing does not disambiguate the maximum height of the XAL5050 -472 from the XAL5030 -472.");
    }
  }
  const symbol = baseSymbol.replace(template.manufacturerPartNumber, record.manufacturerPartNumber);
  Object.assign(record, {
    symbolPinMap: template.symbolPinMap,
    symbolPinLabels: template.symbolPinLabels,
    pinElectricalTypes: template.pinElectricalTypes,
    footprintPadMap: template.footprintPadMap,
    footprintEvidence: { ...template.footprintEvidence, assetPath: `${folder}/footprint.json` },
    footprintAsset: await writeAsset(folder, "footprint.json", json(footprint), template.footprintAsset),
    symbolAsset: await writeAsset(`library/assets/parts/${record.id}`, "symbol.svg", symbol, template.symbolAsset),
    breadboard: { compatible: false, adapter: `Use a documented breakout that maps both XAL${size} terminals to breadboard holes.` }
  });
}

const taxonomy = await readJson("library/component-types.json");
await writeFile(path("library/parts-ledger.json"), json(ledger));
await writeFile(path("library/parts-coverage.json"), json(getLibraryCoverage(ledger, taxonomy)));
