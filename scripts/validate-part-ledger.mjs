import { readFile } from "node:fs/promises";
import { getLedgerCoverage, validatePartLedger } from "../js/part-ledger.mjs";

const ledger = JSON.parse(await readFile(new URL("../library/parts-ledger.json", import.meta.url), "utf8"));
const validation = validatePartLedger(ledger);
const coverage = getLedgerCoverage(ledger);

if (!validation.valid) {
  for (const error of validation.errors) console.error(`${error.code}: ${error.message}`);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    verified: coverage.verified,
    target: coverage.target,
    remaining: coverage.remaining,
    byStatus: coverage.byStatus
  }));
}

