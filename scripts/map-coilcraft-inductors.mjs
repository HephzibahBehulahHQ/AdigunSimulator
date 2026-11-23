import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage } from "../js/part-ledger.mjs";

const root = new URL("../", import.meta.url);
const path = name => new URL(name, root);
const read = name => readFile(path(name), "utf8");
const readJson = async name => JSON.parse(await read(name));
const json = data => JSON.stringify(data, null, 2) + "\n";
const ledger = await readJson("library/parts-ledger.json");
const templateIds = { XAL: "coilcraft.xal5030-102mec", XGL: "coilcraft.xgl4030-102mec" };
const templates = {};
for (const [series, id] of Object.entries(templateIds)) {
  const record = ledger.records.find(part => part.id === id);
  templates[series] = {
    record,
    footprint: await readJson(record.footprintEvidence.assetPath),
    symbol: (await read(`library/assets/parts/${id}/symbol.svg`)).replace(/\r\n/g, "\n")
  };
}

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
  const match = /^(XAL50[35]0|XGL4030)-(\d{3})MEC$/.exec(record.manufacturerPartNumber);
  if (record.manufacturer !== "Coilcraft" || !match || record.footprintAsset) continue;
  const [, packageCode, valueCode] = match;
  const { record: template, footprint: baseFootprint, symbol: baseSymbol } = templates[packageCode.slice(0, 3)];
  const folder = `library/assets/footprints/${record.id}`;
  const footprint = structuredClone(baseFootprint);
  footprint.partId = record.id;
  footprint.package = `Coilcraft ${packageCode}`;
  if (packageCode === "XAL5050") {
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
    breadboard: { compatible: false, adapter: `Use a documented breakout that maps both ${packageCode} terminals to breadboard holes.` }
  });
}

const taxonomy = await readJson("library/component-types.json");
await writeFile(path("library/parts-ledger.json"), json(ledger));
await writeFile(path("library/parts-coverage.json"), json(getLibraryCoverage(ledger, taxonomy)));
