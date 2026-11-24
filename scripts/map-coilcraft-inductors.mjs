import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getLibraryCoverage } from "../js/part-ledger.mjs";

const root = new URL("../", import.meta.url);
const path = name => new URL(name, root);
const read = name => readFile(path(name), "utf8");
const readJson = async name => JSON.parse(await read(name));
const json = data => JSON.stringify(data, null, 2) + "\n";
const ledger = await readJson("library/parts-ledger.json");
const templateIds = { XAL: "coilcraft.xal5030-102mec", XGL4020: "coilcraft.xgl4020-102mec", XGL4030: "coilcraft.xgl4030-102mec" };
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

const xglPackageDrawings = {
  XGL3520: "https://www.coilcraft.com/getattachment/d011debe-62d1-475f-a40f-375e6332458f/xgl3520d.gif?lang=en-US",
  XGL3530: "https://www.coilcraft.com/getattachment/ef12e907-fdeb-46f2-99be-0413a59149fa/xgl3530d.gif",
  XGL4012: "https://www.coilcraft.com/getattachment/868c11e0-df52-4759-b946-d75b69e9b5a9/xgl4012d.gif?lang=en-US",
  XGL4015: "https://www.coilcraft.com/getattachment/049b0399-3b2b-4f77-b39d-70c5352a0fe3/xgl4015d.gif?lang=en-US",
  XGL3014: "https://www.coilcraft.com/getattachment/423929ad-4529-4944-b080-65c1ca232279/xgl3014d.gif?lang=en-US",
  XGL3020: "https://www.coilcraft.com/getattachment/4753414e-ea78-4f3a-a3d1-d9d49c162fe7/xgl3020d.gif?lang=en-US",
  XGL3512: "https://www.coilcraft.com/getattachment/4a249b9d-6851-469f-89db-b56209604f53/xgl3512d.gif?lang=en-US",
  XGL3515: "https://www.coilcraft.com/getattachment/0cff0f7c-79c0-4655-a937-31a9fa8ef5df/xgl3515d.gif?lang=en-US",
  XGL5030: "https://www.coilcraft.com/getattachment/e86c5bb4-0f92-4a0b-b413-3aa80ed05c9d/xgl5030d.gif?lang=en-US",
  XGL5050: "https://www.coilcraft.com/getattachment/4c56b418-bd36-431c-88a5-dd680ae7e09d/xgl5050d.gif?lang=en-US",
  XGL6030: "https://www.coilcraft.com/getattachment/04af5f0e-159c-4c20-b5cf-d118de0d6d2a/xgl6030d.gif?lang=en-US",
  XGL6060: "https://www.coilcraft.com/getattachment/73eea929-3e6a-4a38-af9e-f0d053842c3a/xgl6060d.gif",
  XGL6020: "https://www.coilcraft.com/getattachment/7ce8a46d-fefc-4273-9a8f-ae343448379b/xgl6020d.gif?lang=en-US",
  XGL7015: "https://www.coilcraft.com/getattachment/a475daa3-7f58-4bb1-bdf9-aaf0908e1878/xgl7015d.gif?lang=en-US",
  XGL7030: "https://www.coilcraft.com/getattachment/78ab5313-58ec-4c76-a1ab-552e523aa6cc/xgl7030d.gif?lang=en-US",
  XGL1060: "https://www.coilcraft.com/getattachment/77262432-b157-4ef6-9f19-5f412ceaee12/xgl1060d.gif?lang=en-US",
  XGL1010: "https://www.coilcraft.com/getattachment/d836bde2-3b61-4037-a3a3-180bb07ed709/xgl1010d.gif?lang=en-US",
  XGL1313: "https://www.coilcraft.com/getattachment/1e95a404-a436-4fb4-911b-6d43e31d12dc/xgl1313d.gif?lang=en-US"
};
const xgl5030TallCodes = new Set(["550", "181", "351", "401", "521", "601", "651", "821"]);
// Body width, length, planar tolerance, maximum height, pad width, pad height and center spacing in mm.
const xglDimensions = {
  XGL3520: [3.2, 3.5, 0.15, 2, 0.81, 3.2, 1.8],
  XGL3530: [3.2, 3.5, 0.15, 3, 0.81, 3.2, 1.8],
  XGL4012: [4, 4, 0.3, 1.2, 0.98, 3.4, 2.37],
  XGL4015: [4, 4, 0.3, 1.5, 0.98, 3.4, 2.37],
  XGL3014: [3, 3, 0.2, 1.4, 0.86, 3, 1.63],
  XGL3020: [3, 3, 0.2, 2, 0.86, 3, 1.63],
  XGL3512: [3.2, 3.5, 0.15, 1.2, 0.81, 3.2, 1.8],
  XGL3515: [3.2, 3.5, 0.15, 1.5, 0.81, 3.2, 1.8],
  XGL6020: [6.51, 6.71, 0.2, 2.1, 1.43, 5.5, 4.04],
  XGL6030: [6.51, 6.71, 0.2, 3.1, 1.43, 5.5, 4.04],
  XGL6060: [6.51, 6.71, 0.2, 6.1, 1.43, 5.5, 4.04],
  XGL7015: [7.5, 7.5, 0.5, 1.5, 1.78, 6.5, 4.72],
  XGL7030: [7.5, 7.5, 0.5, 3.1, 1.78, 6.5, 4.72],
  XGL1060: [10, 11.3, 0.5, 6, 2.38, 8.5, 6.65],
  XGL1010: [10, 11.3, 0.5, 10, 2.38, 8.5, 6.65],
  XGL1313: [13.4, 15, 0.2, 13, 2.98, 11.2, 8.6]
};

for (const record of ledger.records) {
  const match = /^(XAL50[35]0|XGL\d{4})-(\d{3})ME([CD])$/.exec(record.manufacturerPartNumber);
  if (record.manufacturer !== "Coilcraft" || !match || record.footprintAsset) continue;
  const [, packageCode, valueCode, reel] = match;
  if (reel !== (["XGL1010", "XGL1313"].includes(packageCode) ? "D" : "C")) continue;
  const drawing = xglPackageDrawings[packageCode];
  if (packageCode.startsWith("XGL") && !drawing && !templates[packageCode]) continue;
  const templateKey = packageCode.startsWith("XAL") || drawing ? "XAL" : packageCode;
  const { record: template, footprint: baseFootprint, symbol: baseSymbol } = templates[templateKey];
  const folder = `library/assets/footprints/${record.id}`;
  const footprint = structuredClone(baseFootprint);
  footprint.partId = record.id;
  footprint.package = `Coilcraft ${packageCode}`;
  if (xglDimensions[packageCode]) {
    const [widthMm, lengthMm, planarToleranceMm, heightMaxMm, padWidth, padHeight, rowCenterSpacingMm] = xglDimensions[packageCode];
    Object.assign(footprint.packageOutline, { widthMm, lengthMm, planarToleranceMm, heightMaxMm, sourceUrl: drawing });
    Object.assign(footprint.padPattern, { widthMm: padWidth, heightMm: padHeight, rowCenterSpacingMm });
    footprint.pads[0].xMm = rowCenterSpacingMm / 2;
    footprint.pads[1].xMm = -rowCenterSpacingMm / 2;
  } else if (drawing) {
    footprint.packageOutline.sourceUrl = drawing;
    footprint.packageOutline.heightMaxMm = packageCode === "XGL5050" ? 5.1
      : xgl5030TallCodes.has(valueCode) ? 3.2 : 3.1;
  } else if (packageCode === "XAL5050") {
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
    footprintEvidence: { ...template.footprintEvidence, assetPath: `${folder}/footprint.json`,
      sourceUrl: footprint.packageOutline.sourceUrl },
    footprintAsset: await writeAsset(folder, "footprint.json", json(footprint), template.footprintAsset),
    symbolAsset: await writeAsset(`library/assets/parts/${record.id}`, "symbol.svg", symbol, template.symbolAsset),
    breadboard: { compatible: false, adapter: `Use a documented breakout that maps both ${packageCode} terminals to breadboard holes.` }
  });
}

const taxonomy = await readJson("library/component-types.json");
await writeFile(path("library/parts-ledger.json"), json(ledger));
await writeFile(path("library/parts-coverage.json"), json(getLibraryCoverage(ledger, taxonomy)));
