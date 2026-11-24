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

const packageDrawings = {
  XFL2005: "https://www.coilcraft.com/getattachment/12915e5a-8c39-40bd-8be2-0c9fb118caab/xfl2005d-%281%29.gif",
  XFL2006: "https://www.coilcraft.com/getattachment/1020c3b5-573a-4523-9557-5f6bd3aebf23/xfl2006d-%281%29.gif",
  XFL2010: "https://www.coilcraft.com/getattachment/bc0b0542-07c0-4f40-8ff5-54ba17b3af2d/xfl2010d.gif?lang=en-US",
  XFL3010: "https://www.coilcraft.com/getattachment/ffd27a6f-f915-41ed-a9a7-782bf899d54a/xfl3010d-%281%29.gif",
  XFL3012: "https://www.coilcraft.com/getattachment/02b6f684-78f7-41d5-8676-8d7ea7ead2c6/xfl3012d-%281%29.gif",
  XFL5015: "https://www.coilcraft.com/getmedia/5f7b596c-8f2f-415e-931e-74a5b6804936/xfl5015.pdf",
  XFL5018: "https://www.coilcraft.com/getmedia/5f7b596c-8f2f-415e-931e-74a5b6804936/xfl5015.pdf",
  XFL5030: "https://www.coilcraft.com/getmedia/f01e4ccd-6be9-43eb-bb01-c23b4deeb2c5/xfl5030.pdf",
  XFL6012: "https://www.coilcraft.com/getmedia/ae4a44fc-deeb-45d7-81a6-abe1d0432add/xfl6012.pdf",
  XFL6060: "https://www.coilcraft.com/getmedia/9e8cc1df-cee0-4215-90fb-b5193fa22761/xfl6060-473.pdf",
  XFL7015: "https://www.coilcraft.com/getmedia/ccf09628-6e8c-462a-9dc9-fa4346e7cf0a/xfl7015.pdf",
  XFL4012: "https://www.coilcraft.com/getattachment/576e5a0a-d63b-4cfb-8c87-cd364de1d340/xfl4012d.gif?lang=en-US",
  XFL4015: "https://www.coilcraft.com/getattachment/9db62613-5a92-45c1-a520-b8675ddfbb1a/xfl4015d.gif?lang=en-US",
  XFL4020: "https://www.coilcraft.com/getattachment/05bd99a2-1ad9-400e-9537-8219a4e4059d/xfl4020d.gif?lang=en-US",
  XFL4030: "https://www.coilcraft.com/getattachment/cd6770fe-7f5f-4a2e-8f76-68d709490110/xfl4030d.gif?lang=en-US",
  XAL1030: "https://www.coilcraft.com/getattachment/0f2aa15d-eb2d-4633-a5f9-c8734257bc6a/xal1030d.gif?lang=en-US",
  XAL1060: "https://www.coilcraft.com/getattachment/532141ce-94d9-4682-ac27-1f8ad1bb2276/xal1060d.gif?lang=en-US",
  XAL1510: "https://www.coilcraft.com/getattachment/b6318cc1-0397-4668-8944-ce75f730ffcc/xal1510d.gif?lang=en-US",
  XGL1712: "https://www.coilcraft.com/getattachment/b0a80709-fafd-4ebe-af90-b18a6cc0bc1f/xgl1712d.gif?lang=en-US",
  XAL7030: "https://www.coilcraft.com/getattachment/2fe6849e-bce3-4648-9c57-7b06c1f286b1/xal7030d.gif?lang=en-US",
  XAL7070: "https://www.coilcraft.com/getattachment/3e82b892-c10d-48ab-874a-db9e090c452e/xal7070d.gif?lang=en-US",
  XAL8080: "https://www.coilcraft.com/getattachment/78738e29-ddc3-4cbc-9810-2db76ca42dd3/xal8080d.gif?lang=en-US",
  XEL4020: "https://www.coilcraft.com/getattachment/84fee8d3-42df-4df5-b1e3-234f1006d18b/xel4020d.gif?lang=en-US",
  XEL4030: "https://www.coilcraft.com/getattachment/53a07e14-2bbc-455d-8f84-80e6f9e135be/xel4030d.gif?lang=en-US",
  XEL5020: "https://www.coilcraft.com/getattachment/c1e9a675-3137-4855-926f-3163babc1e06/xel5020d-%281%29.gif",
  XEL5030: "https://www.coilcraft.com/getattachment/7035f563-878c-4bda-9773-a5cab54be720/xel5030d.gif?lang=en-US",
  XGL4018: "https://www.coilcraft.com/getattachment/7daf39a1-a7f8-4ae5-b52f-8d9edcf9a78c/xgl4018d.gif?lang=en-US",
  XGL4025: "https://www.coilcraft.com/getattachment/b16340ef-2d82-40ed-9d40-b4a3bf0d42c9/xgl4025d.gif?lang=en-US",
  XGL4040: "https://www.coilcraft.com/getattachment/dd72cef7-0f73-4375-bf48-0654972526fa/xgl4040d.gif?lang=en-US",
  XGL5020: "https://www.coilcraft.com/getattachment/c4f06dbd-129c-4087-9e2c-fde073695491/xgl5020d.gif?lang=en-US",
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
const packageDimensions = {
  XFL2005: [1.9, 2, 0.2, 0.5, 1.04, 2.2, 1.45],
  XFL2006: [1.9, 2, 0.2, 0.6, 0.6, 1.8, 1.35],
  XFL2010: [1.9, 2, 0.2, 1, 0.6, 1.8, 1.35],
  XFL3010: [3, 3, 0.2, 1.1, 1, 2.9, 2.03],
  XFL3012: [3, 3, 0.2, 1.3, 1, 2.9, 2.03],
  XFL5015: [5.28, 5.48, 0.2, 1.5, 1.18, 4.7, 3.31],
  XFL5018: [5.28, 5.48, 0.2, 1.8, 1.18, 4.7, 3.31],
  XFL5030: [5.28, 5.48, 0.2, 3.1, 1.18, 4.7, 3.31],
  XFL6012: [6.36, 6.56, 0.2, 1.2, 1.43, 5.5, 4.04],
  XFL6060: [6.36, 6.56, 0.2, 6.1, 1.43, 5.5, 4.04],
  XFL7015: [7.5, 7.5, 0.5, 1.5, 1.78, 6.22, 4.72],
  XFL4012: [4, 4, 0.3, 1.2, 0.98, 3.4, 2.37],
  XFL4015: [4, 4, 0.3, 1.6, 0.98, 3.4, 2.37],
  XFL4020: [4, 4, 0.3, 2.1, 0.98, 3.4, 2.37],
  XFL4030: [4, 4, 0.3, 3.1, 0.98, 3.4, 2.37],
  XAL1030: [10, 11.3, 0.5, 3.1, 2.38, 9, 6.65],
  XAL1060: [10, 11.3, 0.5, 6, 2.38, 9, 6.65],
  XAL1510: [15.2, 16.2, 0.2, 10, 3.18, 13.2, 10.6],
  XGL1712: [17.2, 18.2, 0.2, 12, 3.8, 15.1, 11.86],
  XAL7030: [7.5, 7.5, 0.5, 3.1, 1.78, 6.5, 4.72],
  XAL7070: [7.2, 7.5, 0.5, 7, 1.92, 6.5, 4.82],
  XAL8080: [8.1, 8.6, 0.2, 8, 1.78, 7, 5.16],
  XEL4020: [4, 4, 0.3, 2.1, 0.98, 3.4, 2.37],
  XEL4030: [4, 4, 0.3, 3.1, 0.98, 3.4, 2.37],
  XEL5020: [5.28, 5.48, 0.2, 2.1, 1.18, 4.7, 3.31],
  XEL5030: [5.28, 5.48, 0.2, 3.1, 1.18, 4.7, 3.31],
  XGL4018: [4, 4, 0.3, 1.8, 0.98, 3.4, 2.37],
  XGL4025: [4, 4, 0.3, 2.5, 0.98, 3.4, 2.37],
  XGL4040: [4, 4, 0.3, 4.1, 0.98, 3.4, 2.37],
  XGL5020: [5.28, 5.48, 0.2, 2.1, 1.18, 4.7, 3.31],
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

const heightOverrides = {
  XAL1510: { 333: 11 },
  XEL4020: { 800: 2.2 },
  XEL4030: { 101: 3.2, 201: 3.2, 301: 3.2 },
  XEL5020: { 101: 2.2 },
  XEL5030: { 131: 3.2, 261: 3.2, 421: 3.2, 601: 3.2 }
};

// XFL7015 drawing 1039-2, dimension B in the recommended land pattern.
const xfl7015PadHeightByCode = { 102: 6.16, 152: 6.16 };

const markingLimitations = {
  XFL2005: "Earlier production parts may lack the winding-start dot.",
  XFL2006: "Earlier production parts may lack the winding-start dot.",
  XFL3010: "Parts manufactured before June 2018 may be marked differently.",
  XFL3012: "Parts manufactured before June 2018 may be marked differently.",
  XFL4030: "Parts manufactured before 2011 may lack the winding-start stripe."
};

const xal7030NarrowCodes = new Set(["472", "562", "682", "822", "103"]);
const thirteenInchReelPackages = new Set(["XAL8080", "XAL1510", "XGL1010", "XGL1313", "XGL1712"]);

for (const record of ledger.records) {
  const match = /^(X[AGEF]L\d{4})-(\d{3})ME([CD])$/.exec(record.manufacturerPartNumber);
  if (record.manufacturer !== "Coilcraft" || !match || record.footprintAsset) continue;
  const [, packageCode, valueCode, reel] = match;
  if (reel !== (thirteenInchReelPackages.has(packageCode) ? "D" : "C")) continue;
  const drawing = packageDrawings[packageCode];
  if (packageCode.startsWith("XAL") && !drawing && !["XAL5030", "XAL5050"].includes(packageCode)) continue;
  const templateKey = packageCode.startsWith("XAL") || drawing ? "XAL" : packageCode;
  if (!templates[templateKey]) continue;
  const { record: template, footprint: baseFootprint, symbol: baseSymbol } = templates[templateKey];
  const folder = `library/assets/footprints/${record.id}`;
  const footprint = structuredClone(baseFootprint);
  footprint.partId = record.id;
  footprint.package = `Coilcraft ${packageCode}`;
  if (packageDimensions[packageCode]) {
    const [widthMm, lengthMm, planarToleranceMm, defaultHeight, defaultPadWidth, defaultPadHeight, defaultSpacing] = packageDimensions[packageCode];
    const padHeight = packageCode === "XFL7015" ? xfl7015PadHeightByCode[valueCode] ?? defaultPadHeight : defaultPadHeight;
    const narrow = packageCode === "XAL7030" && xal7030NarrowCodes.has(valueCode);
    const padWidth = narrow ? 1.58 : defaultPadWidth;
    const rowCenterSpacingMm = narrow ? 4.52 : defaultSpacing;
    const heightMaxMm = heightOverrides[packageCode]?.[valueCode] ?? defaultHeight;
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
  if (packageCode === "XFL2010") {
    footprint.limitations[0] = "The footprint top view is rotated 180° from the manufacturer top view. Local pad 1 follows the winding-start dot.";
  } else if (/^XFL[23]/.test(packageCode)) {
    footprint.limitations[0] = "Local pad 1 follows the right-hand winding-start dot in the manufacturer top view.";
  }
  if (markingLimitations[packageCode]) footprint.limitations.push(markingLimitations[packageCode]);
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
