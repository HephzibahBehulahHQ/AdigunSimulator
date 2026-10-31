import { readFile } from "node:fs/promises";
import {
  getLibraryCoverage,
  validateComponentTypes,
  validatePartLedger,
  validatePartsManifest
} from "../js/part-ledger.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [ledger, taxonomy, manifest, checkedCoverage] = await Promise.all([
  readJson("../library/parts-ledger.json"),
  readJson("../library/component-types.json"),
  readJson("../library/parts-manifest.json"),
  readJson("../library/parts-coverage.json")
]);
const checks = [
  validateComponentTypes(taxonomy),
  validatePartLedger(ledger, taxonomy),
  validatePartsManifest(manifest, taxonomy, ledger)
];
const coverage = getLibraryCoverage(ledger, taxonomy);
if (JSON.stringify(coverage) !== JSON.stringify(checkedCoverage)) {
  checks.push({ valid: false, errors: [{ code: "STALE_COVERAGE", message: "Committed parts-coverage.json does not match the ledger and taxonomy." }] });
}

const errors = checks.flatMap((check) => check.errors ?? []);
if (errors.length) {
  for (const error of errors) console.error(`${error.code}: ${error.message}`);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    verified: coverage.ledger.verified,
    target: coverage.targets.verifiedParts,
    remaining: coverage.ledger.remaining,
    taxonomyTypes: coverage.taxonomy.totalTypes,
    byStatus: coverage.ledger.byStatus
  }));
}
