export const PART_LEDGER_SCHEMA_VERSION = 1;
export const PART_STATES = Object.freeze(["candidate", "in-review", "verified", "rejected"]);

function issue(code, record, message) {
  return { code, partId: record?.id ?? "unknown", message };
}

function hasString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isPinMap(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length > 0
    && Object.entries(value).every(([pin, mapping]) => hasString(pin)
      && ((typeof mapping === "string" && hasString(mapping))
        || (typeof mapping === "number" && Number.isSafeInteger(mapping) && mapping > 0)));
}

function hasMatchingPinMaps(symbolPinMap, footprintPadMap) {
  if (!isPinMap(symbolPinMap) || !isPinMap(footprintPadMap)) return false;
  const symbolPins = Object.keys(symbolPinMap).sort();
  const footprintPins = Object.keys(footprintPadMap).sort();
  if (symbolPins.length !== footprintPins.length || symbolPins.some((pin, index) => pin !== footprintPins[index])) return false;
  const pads = Object.values(footprintPadMap).map(String);
  return new Set(pads).size === pads.length;
}

export function validatePartRecord(record) {
  const errors = [];
  if (!record || typeof record !== "object") return [issue("PART_OBJECT", record, "Part record must be an object.")];
  for (const field of ["id", "manufacturer", "manufacturerPartNumber", "category", "type", "lifecycle", "verificationStatus"]) {
    if (!hasString(record[field])) errors.push(issue("PART_FIELD", record, `${field} is required.`));
  }
  if (!PART_STATES.includes(record.verificationStatus)) errors.push(issue("PART_STATE", record, "verificationStatus is invalid."));
  if (!hasString(record?.datasheet?.url) || !record.datasheet.url.startsWith("https://")
    || !hasString(record?.datasheet?.title) || !isIsoDate(record?.datasheet?.accessedAt)) {
    errors.push(issue("DATASHEET_SOURCE", record, "An authoritative HTTPS datasheet URL, title, and valid access date are required."));
  }
  if (record.verificationStatus === "verified") {
    for (const field of ["package", "modelStatus", "reviewedBy"]) {
      if (!hasString(record[field])) errors.push(issue("VERIFIED_EVIDENCE", record, `${field} is required before a record can be counted as verified.`));
    }
    if (!isPinMap(record.symbolPinMap)) errors.push(issue("SYMBOL_PIN_MAP", record, "Verified records require a non-empty pin-to-symbol mapping."));
    if (!isPinMap(record.footprintPadMap)) errors.push(issue("FOOTPRINT_PAD_MAP", record, "Verified records require a non-empty pin-to-footprint-pad mapping."));
    if (!hasMatchingPinMaps(record.symbolPinMap, record.footprintPadMap)) errors.push(issue("PIN_MAP_ALIGNMENT", record, "Symbol and footprint maps must cover the same pins and must not reuse a footprint pad."));
    if (!isIsoDate(record.lastReviewedAt)) errors.push(issue("REVIEW_DATE", record, "Verified records require a valid ISO review date."));
    if (["unknown", "tbd", "todo", "unassigned", "n/a"].includes(String(record.reviewedBy).trim().toLowerCase())) {
      errors.push(issue("REVIEWER_IDENTITY", record, "Verified records require an identified reviewer, not a placeholder."));
    }
    if (typeof record?.datasheet?.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(record.datasheet.sha256)) {
      errors.push(issue("DATASHEET_CHECKSUM", record, "Verified records require an actual 64-character hexadecimal SHA-256 checksum."));
    }
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

