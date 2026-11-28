import {readFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";

const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url), "utf8"));
const parts = new Map(ledger.records.filter(record => record.evidenceNote === "library/evidence/nexperia.bcp-sot223.md")
  .map(record => [record.id, record]));

const nearlyEqual = (actual, expected) => Number.isFinite(actual) && Math.abs(actual - expected) < 1e-6;

function checkSample(sample, sign, target) {
  return sample && nearlyEqual(sample.collectorMa, sign * target.collectorMa) &&
    Number.isFinite(sample.baseMa) && Math.sign(sample.baseMa) === sign &&
    (target.baseMa === undefined || nearlyEqual(sample.baseMa, sign * target.baseMa)) &&
    Number.isFinite(sample.vceV) && Math.sign(sample.vceV) === sign &&
    (target.vceV === undefined || nearlyEqual(sample.vceV, sign * target.vceV));
}

export function checkBcpModelMeasurements(partId, measurements) {
  const part = parts.get(partId);
  if (!part) throw new Error("Choose an exact BCP order code from the component ledger.");
  if (!measurements || measurements.temperatureC !== 25) throw new Error("Supply operating points at 25 °C.");
  const sign = part.manufacturerPartNumber.startsWith("BCP51") ? -1 : 1;
  const { gain150, active500, saturation500 } = measurements;
  if (!checkSample(gain150, sign, { collectorMa: 150, vceV: 2 }) ||
      !checkSample(active500, sign, { collectorMa: 500, vceV: 2 }) ||
      !checkSample(saturation500, sign, { collectorMa: 500, baseMa: 50 }) ||
      !Number.isFinite(active500.vbeV) || Math.sign(active500.vbeV) !== sign) {
    throw new Error("The signed collector/base currents and terminal voltages must match the datasheet test points.");
  }
  const [gainLimit, highGainLimit, saturationLimit, baseVoltageLimit] = part.ratings;
  const checks = [
    { quantity: "hFE at 150 mA", value: gain150.collectorMa / gain150.baseMa, limits: gainLimit },
    { quantity: "hFE at 500 mA", value: active500.collectorMa / active500.baseMa, limits: highGainLimit },
    { quantity: "|VCE(sat)| at 500 mA", value: Math.abs(saturation500.vceV), limits: saturationLimit },
    { quantity: "|VBE| at 500 mA", value: Math.abs(active500.vbeV), limits: baseVoltageLimit }
  ].map(({ quantity, value, limits: { minimum, maximum, unit } }) => ({
    quantity, value, unit, minimum, maximum,
    passed: Number.isFinite(value) && value >= (minimum ?? -Infinity) && value <= (maximum ?? Infinity)
  }));
  return { partId, scope: "datasheet operating-point limits only", passed: checks.every(check => check.passed), checks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , partId, measurementFile] = process.argv;
  try {
    if (!partId || !measurementFile) throw new Error("Usage: node scripts/bcp-model-measurements.mjs <ledger ID> <measurements.json>");
    const report = checkBcpModelMeasurements(partId, JSON.parse(await readFile(measurementFile, "utf8")));
    console.log(JSON.stringify(report, null, 2));
    if (!report.passed) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
