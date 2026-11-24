import assert from "node:assert/strict";
import test from "node:test";
import { MANUFACTURER_PART_RECORDS, getManufacturerPartEvidenceSummary, searchManufacturerParts } from "../js/part-catalogue.mjs";

test("manufacturer evidence search returns exact records without promoting candidates", () => {
  const matches = searchManufacturerParts("bss138bk");
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, "nexperia.bss138bk");
  const summary = getManufacturerPartEvidenceSummary(matches[0]);
  assert.equal(summary.status, "candidate");
  assert.equal(summary.verified, false);
  assert.equal(summary.requiresHumanReview, true);
  assert.equal(summary.simulationStatus, "not-modelled");
  assert.ok(summary.evidenceBlockerCodes.includes("DATASHEET_CHECKSUM"));
  assert.equal(summary.readyForHumanReview, false);
  assert.equal(summary.evidenceBlocked, true);
  assert.ok(summary.pinMap.length > 0);
  assert.ok(summary.ratings.length > 0);
  assert.equal(summary.footprintEvidencePath, matches[0].footprintEvidence.assetPath);
  assert.equal(summary.datasheetChecksumPresent, false);
});

test("manufacturer evidence browser provides a searchable review snapshot for every ledger record", () => {
  assert.equal(MANUFACTURER_PART_RECORDS.length, 10571);
  assert.equal(searchManufacturerParts("Texas Instruments").length, 12);
  assert.equal(searchManufacturerParts("Texas LM555CN/NOPB").length, 1);
  assert.equal(searchManufacturerParts("LM555 Texas")[0].id, "ti.lm555p");
  assert.equal(searchManufacturerParts("no-such-manufacturer-part").length, 0);
  assert.ok(MANUFACTURER_PART_RECORDS.every((record) => getManufacturerPartEvidenceSummary(record).verified === (record.verificationStatus === "verified")));
  const reviewReady = getManufacturerPartEvidenceSummary(MANUFACTURER_PART_RECORDS.find((record) => record.id === "ti.lm555p"));
  assert.equal(reviewReady.status, "in-review");
  assert.equal(reviewReady.readyForHumanReview, true);
  assert.equal(reviewReady.evidenceBlocked, false);
  assert.equal(reviewReady.verified, false);
});

test("SN74HC04N footprint remains an unverified educational candidate", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "ti.sn74hc04n");
  const summary = getManufacturerPartEvidenceSummary(record);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.modelStatus, "not-modelled");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.equal(Object.keys(record.footprintPadMap).length, 14);
  assert.equal(summary.readyForHumanReview, true);
  assert.deepEqual(summary.evidenceBlockerCodes, []);
});

test("SN74HC02N educational footprint preserves the pin map and candidate status", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "ti.sn74hc02n");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.equal(Object.keys(record.footprintPadMap).length, 14);
  assert.deepEqual(record.footprintPadMap, Object.fromEntries(Array.from({ length: 14 }, (_, index) => [String(index + 1), String(index + 1)])));
  assert.match(record.footprintEvidence.designNote, /not TI land-pattern recommendations/);
});

test("2N3904BU educational footprint follows onsemi lead numbering", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "onsemi.2n3904bu");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.deepEqual(record.symbolPinMap, { "1": "Emitter", "2": "Base", "3": "Collector" });
  assert.deepEqual(record.footprintPadMap, { "1": "1", "2": "2", "3": "3" });
  assert.match(record.footprintEvidence.designNote, /not an onsemi board land pattern/);
});

test("LM358DT educational SO8 footprint maps all pins and discloses design defaults", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "st.lm358dt");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.deepEqual(record.footprintPadMap, Object.fromEntries(Array.from({ length: 8 }, (_, index) => [String(index + 1), String(index + 1)])));
  assert.equal(record.footprintEvidence.sourceUrl, "https://www.st.com/resource/en/datasheet/lm358.pdf");
  assert.match(record.footprintEvidence.designNote, /does not publish the generated land pattern/);
});

test("1N4148 family symbol uses application connection IDs without claiming package lead numbers", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "nexperia.1n4148");
  assert.equal(record.verificationStatus, "candidate");
  assert.deepEqual(record.symbolPinMap, { "1": "A", "2": "K" });
  assert.deepEqual(record.symbolPinLabels, { "1": "A", "2": "K" });
  assert.equal(record.packageEvidence.package, "SOD27 (DO-35)");
  assert.match(record.warnings[0], /do not represent manufacturer physical lead numbers/);
});

test("1N4148 family footprint documents its application-selected pitch and pad IDs", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "nexperia.1n4148");
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(record.footprintAsset.designStatus, "educational-candidate");
  assert.deepEqual(record.footprintPadMap, { "1": "1", "2": "2" });
  assert.match(record.footprintEvidence.designNote, /not a datasheet-defined footprint/);
});

test("1N4148 datasheet checksum is recorded without promoting the family candidate", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "nexperia.1n4148");
  assert.match(record.datasheet.sha256, /^[a-f0-9]{64}$/);
  assert.equal(record.datasheet.sha256Bytes, 124555);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(getManufacturerPartEvidenceSummary(record).readyForHumanReview, false);
});

test("SN74HC02N datasheet checksum is recorded without promoting the candidate", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "ti.sn74hc02n");
  assert.match(record.datasheet.sha256, /^[a-f0-9]{64}$/);
  assert.equal(record.datasheet.sha256Bytes, 2497827);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(getManufacturerPartEvidenceSummary(record).readyForHumanReview, true);
});

test("SN74HC04N datasheet checksum is recorded without promoting the candidate", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "ti.sn74hc04n");
  assert.equal(record.datasheet.sha256, "a48266c5ce3f22a87a30cd78b0fdb80e99820220534b215a11a9b67a35f41101");
  assert.equal(record.datasheet.sha256Bytes, 2153970);
  assert.equal(record.verificationStatus, "candidate");
  assert.equal(getManufacturerPartEvidenceSummary(record).readyForHumanReview, true);
});

test("2N3904 datasheet checksum is recorded without promoting the candidate", () => {
  const record = MANUFACTURER_PART_RECORDS.find((part) => part.id === "onsemi.2n3904bu");
  assert.equal(record.datasheet.sha256, "e2b2147b6e9608cc592e7178204f50ca65aaf5fe0dbcb5f30ed2d737ab7a4214");
  assert.equal(record.datasheet.sha256Bytes, 324812);
  assert.equal(record.verificationStatus, "candidate");
  const summary = getManufacturerPartEvidenceSummary(record);
  assert.equal(summary.readyForHumanReview, false);
  assert.ok(summary.evidenceBlockerCodes.length > 0);
  assert.ok(!summary.evidenceBlockerCodes.includes("DATASHEET_CHECKSUM"));
});

test("Vishay CRCW order codes retain package-specific reel codes and candidate status", () => {
  const records = MANUFACTURER_PART_RECORDS.filter(part => part.id.startsWith("vishay.crcw"));
  assert.equal(records.length, 1336);
  const packagingBySize = {
    "0402": "ED", "0603": "EA", "0805": "EA", "1206": "EA",
    "1210": "EA", "1218": "EK", "2010": "EF", "2512": "EG"
  };
  for (const [size, reel] of Object.entries(packagingBySize)) {
    const group = records.filter(part => part.manufacturerPartNumber.startsWith(`CRCW${size}`));
    assert.equal(new Set(group.map(part => part.nominalResistanceOhms)).size, size === "1218" ? 153 : 169);
    const maximum = size === "1218" ? [2_200_000, "2M20"] : [10_000_000, "10M0"];
    assert.equal(Math.max(...group.map(part => part.nominalResistanceOhms)), maximum[0]);
    for (const [ohms, code] of [[1, "1R00"], [9.1, "9R10"], [10, "10R0"], [100, "100R"],
      [1000, "1K00"], [910000, "910K"], [1000000, "1M00"], maximum]) {
      const part = group.find(part => part.nominalResistanceOhms === ohms);
      assert.equal(part?.manufacturerPartNumber, `CRCW${size}${code}JN${reel}`);
    }
    for (const part of group) {
      const code = part.manufacturerPartNumber.slice(8, 12);
      const unit = code.match(/[RKM]/)?.[0];
      const decodedOhms = Number(code.replace(unit, ".") + { R: "e0", K: "e3", M: "e6" }[unit]);
      assert.equal(decodedOhms, part.nominalResistanceOhms);
      assert.ok(part.manufacturerPartNumber.endsWith(`JN${reel}`));
      assert.equal(part.verificationStatus, "candidate");
      assert.equal(part.simulationModel.status, "not-modelled");
    }
  }
});

test("KEMET C1210C candidates match their ordering codes and rated values", () => {
  const parts = MANUFACTURER_PART_RECORDS.filter(part => part.id.startsWith("kemet.c1210c"));
  assert.equal(parts.length, 3474);
  const capacitances = new Set(parts.map(part => part.nominalCapacitancePf));
  assert.equal(capacitances.size, 112);
  assert.equal(Math.min(...capacitances), 1);
  assert.equal(Math.max(...capacitances), 220000);
  assert.ok(!capacitances.has(100));
  assert.ok(capacitances.has(110));
  assert.ok(capacitances.has(910));
  assert.ok(capacitances.has(1000));
  assert.ok(!capacitances.has(2800));
  const voltageByCode = { 8: 10, 4: 16, 3: 25, 5: 50, 1: 100, 2: 200, A: 250 };
  const toleranceByCode = { F: 1, G: 2, J: 5, K: 10, M: 20 };
  const absoluteToleranceByCode = { B: 0.1, C: 0.25, D: 0.5 };
  for (const part of parts) {
    const fields = /^C1210C(\d{2})([0-4][FGJKM]|9[BCD])([843512A])GACTU$/.exec(part.manufacturerPartNumber);
    assert.ok(fields, part.manufacturerPartNumber);
    const [scale, toleranceCode] = fields[2];
    const absolute = scale === "9";
    const mantissa = Number(fields[1]);
    assert.equal(part.nominalCapacitancePf, absolute ? mantissa / 10 : mantissa * 10 ** Number(scale));
    assert.equal(part.tolerancePercent, toleranceByCode[toleranceCode]);
    assert.equal(part.tolerancePf, absoluteToleranceByCode[toleranceCode]);
    assert.equal(part.ratedVoltageVdc, voltageByCode[fields[3]]);
    assert.equal(part.verificationStatus, "candidate");
  }
  for (const [value, highestVoltage] of [[47000, 250], [56000, 100], [100000, 100],
    [120000, 50], [150000, 50], [180000, 25], [220000, 25]]) {
    const matching = parts.filter(part => part.nominalCapacitancePf === value);
    const expected = Object.values(voltageByCode).filter(voltage => voltage <= highestVoltage).sort((a, b) => a - b);
    assert.deepEqual([...new Set(matching.map(part => part.ratedVoltageVdc))].sort((a, b) => a - b), expected);
    assert.equal(matching.length, expected.length * 5);
  }
});

test("KEMET C1206C candidates follow the listed capacitance and voltage limits", () => {
  const parts = MANUFACTURER_PART_RECORDS.filter(part => part.id.startsWith("kemet.c1206c"));
  assert.equal(parts.length, 3379);
  const groups = Map.groupBy(parts, part => part.nominalCapacitancePf);
  assert.equal(groups.size, 109);
  assert.equal(Math.min(...groups.keys()), 1);
  assert.equal(Math.max(...groups.keys()), 100000);
  for (const [capacitance, group] of groups) {
    const voltageLimit = capacitance <= 22000 ? 250 : capacitance <= 47000 ? 100 : 50;
    const voltages = [10, 16, 25, 50, 100, 200, 250].filter(voltage => voltage <= voltageLimit);
    const absolute = capacitance < 10;
    assert.equal(group.length, voltages.length * (absolute ? 3 : 5));
    assert.deepEqual([...new Set(group.map(part => part.ratedVoltageVdc))].sort((a, b) => a - b),
      voltages);
    assert.deepEqual([...new Set(group.map(part => absolute ? part.tolerancePf : part.tolerancePercent))]
      .sort((a, b) => a - b), absolute ? [0.1, 0.25, 0.5] : [1, 2, 5, 10, 20]);
    assert.ok(group.every(part => absolute ? part.tolerancePercent === undefined : part.tolerancePf === undefined));
    assert.ok(group.every(part => part.package === "1206 chip capacitor" && part.verificationStatus === "candidate"));
  }
  assert.ok(parts.some(part => part.manufacturerPartNumber === "C1206C101F8GACTU"));
  assert.ok(parts.some(part => part.manufacturerPartNumber === "C1206C102MAGACTU"));
  assert.ok(parts.some(part => part.manufacturerPartNumber === "C1206C104J5GACTU"));
  assert.ok(parts.some(part => part.manufacturerPartNumber === "C1206C109B8GACTU"));
  assert.ok(parts.some(part => part.manufacturerPartNumber === "C1206C919DAGACTU"));
  assert.ok(!parts.some(part => part.manufacturerPartNumber === "C1206C104J1GACTU"));
});

test("KEMET C0603C candidates span the selected Table 1A ranges", () => {
  const parts = MANUFACTURER_PART_RECORDS.filter(part => part.id.startsWith("kemet.c0603c"));
  assert.equal(parts.length, 2219);
  const groups = Map.groupBy(parts, part => part.nominalCapacitancePf);
  assert.equal(groups.size, 73);
  assert.equal(Math.min(...groups.keys()), 1);
  assert.equal(Math.max(...groups.keys()), 1000);
  for (const [value, group] of groups) {
    const absolute = value < 10;
    const voltages = new Set(group.map(part => part.ratedVoltageVdc));
    const tolerances = new Set(group.map(part => absolute ? part.tolerancePf : part.tolerancePercent));
    assert.equal(group.length, absolute ? 21 : 35);
    assert.deepEqual(voltages, new Set([10, 16, 25, 50, 100, 200, 250]));
    assert.deepEqual(tolerances, new Set(absolute ? [0.1, 0.25, 0.5] : [1, 2, 5, 10, 20]));
    assert.ok(group.every(part => part.package === "0603 chip capacitor" && part.verificationStatus === "candidate"));
  }
  assert.ok(parts.some(part => part.manufacturerPartNumber === "C0603C109B8GACTU"));
  assert.ok(parts.some(part => part.manufacturerPartNumber === "C0603C102MAGACTU"));
});
