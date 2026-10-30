export const PART_LEDGER_SCHEMA_VERSION = 1;
export const PART_STATES = Object.freeze(["candidate", "in-review", "verified", "rejected"]);

function issue(code, record, message) {
  return { code, partId: record?.id ?? "unknown", message };
}

function hasString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validatePartRecord(record) {
  const errors = [];
  if (!record || typeof record !== "object") return [issue("PART_OBJECT", record, "Part record must be an object.")];
  for (const field of ["id", "manufacturer", "manufacturerPartNumber", "category", "type", "lifecycle", "verificationStatus"]) {
    if (!hasString(record[field])) errors.push(issue("PART_FIELD", record, `${field} is required.`));
  }
  if (!PART_STATES.includes(record.verificationStatus)) errors.push(issue("PART_STATE", record, "verificationStatus is invalid."));
  if (!hasString(record?.datasheet?.url) || !hasString(record?.datasheet?.title) || !hasString(record?.datasheet?.accessedAt)) {
    errors.push(issue("DATASHEET_SOURCE", record, "An authoritative datasheet URL, title, and access date are required."));
  }
  if (record.verificationStatus === "verified") {
    for (const field of ["package", "symbolPinMap", "footprintPadMap", "modelStatus", "lastReviewedAt", "reviewedBy"]) {
      if (!record[field] || (typeof record[field] === "string" && !record[field].trim())) {
        errors.push(issue("VERIFIED_EVIDENCE", record, `${field} is required before a record can be counted as verified.`));
      }
    }
    if (!hasString(record?.datasheet?.sha256)) errors.push(issue("DATASHEET_CHECKSUM", record, "Verified records require a datasheet SHA-256 checksum."));
  }
  return errors;
}

export function validatePartLedger(ledger) {
  const errors = [];
  if (ledger?.schemaVersion !== PART_LEDGER_SCHEMA_VERSION) errors.push({ code: "LEDGER_SCHEMA", message: "Unsupported part ledger schema." });
  if (!Array.isArray(ledger?.records)) errors.push({ code: "LEDGER_RECORDS", message: "Part ledger records must be an array." });
  const ids = new Set();
  const mpns = new Set();
  for (const record of ledger?.records ?? []) {
    if (ids.has(record.id)) errors.push(issue("DUPLICATE_PART_ID", record, "Part IDs must be unique."));
    ids.add(record.id);
    const key = `${record.manufacturer}::${record.manufacturerPartNumber}`.toLowerCase();
    if (mpns.has(key)) errors.push(issue("DUPLICATE_MPN", record, "Manufacturer part numbers must be unique per manufacturer."));
    mpns.add(key);
    errors.push(...validatePartRecord(record));
  }
  return { valid: errors.length === 0, errors };
}

export function getLedgerCoverage(ledger) {
  const records = Array.isArray(ledger?.records) ? ledger.records : [];
  const byStatus = Object.fromEntries(PART_STATES.map((state) => [state, records.filter((record) => record.verificationStatus === state).length]));
  return { total: records.length, verified: byStatus.verified, byStatus, target: 1000, remaining: Math.max(0, 1000 - byStatus.verified) };
}

