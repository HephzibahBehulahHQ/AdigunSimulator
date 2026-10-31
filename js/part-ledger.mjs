export const PART_LEDGER_SCHEMA_VERSION = 1;
export const PART_STATES = Object.freeze(["candidate", "in-review", "verified", "rejected"]);
export const LIBRARY_TARGET = 1000;
export const TAXONOMY_TARGET = 565;

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

function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function isHttps(value) {
  return hasString(value) && value.startsWith("https://");
}

function isPinMap(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length > 0
    && Object.entries(value).every(([pin, mapping]) => hasString(pin)
      && ((typeof mapping === "string" && hasString(mapping))
        || (typeof mapping === "number" && Number.isSafeInteger(mapping) && mapping > 0)));
}

function sameKeys(left, right) {
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  const a = Object.keys(left).sort();
  const b = Object.keys(right).sort();
  return a.length === b.length && a.every((key, index) => key === b[index]);
}

function hasMatchingPinMaps(symbolPinMap, footprintPadMap) {
  if (!isPinMap(symbolPinMap) || !isPinMap(footprintPadMap) || !sameKeys(symbolPinMap, footprintPadMap)) return false;
  const pads = Object.values(footprintPadMap).map(String);
  return new Set(pads).size === pads.length;
}

function validAsset(asset) {
  return asset && isHttps(asset.sourceUrl) && isSha256(asset.sha256)
    && hasString(asset.licenseId) && isHttps(asset.licenseUrl);
}

function validRatings(ratings) {
  return Array.isArray(ratings) && ratings.length > 0 && ratings.every((rating) => {
    if (!hasString(rating?.name) || !hasString(rating?.unit)) return false;
    const numeric = ["minimum", "typical", "maximum", "value"].filter((key) => rating[key] !== undefined);
    return numeric.length > 0 && numeric.every((key) => Number.isFinite(rating[key]))
      && !(Number.isFinite(rating.minimum) && Number.isFinite(rating.maximum) && rating.minimum > rating.maximum);
  });
}

function validateVerifiedEvidence(record, errors) {
  for (const field of ["package", "modelStatus", "reviewedBy"]) {
    if (!hasString(record[field])) errors.push(issue("VERIFIED_EVIDENCE", record, `${field} is required before a record can be counted as verified.`));
  }
  if (!hasString(record.typeCode)) errors.push(issue("TYPE_CODE", record, "Verified records require an explicit taxonomy typeCode."));
  if (!validRatings(record.ratings)) errors.push(issue("RATINGS_UNITS", record, "Verified records require numeric ratings with explicit units and valid ranges."));
  if (!isPinMap(record.symbolPinMap)) errors.push(issue("SYMBOL_PIN_MAP", record, "Verified records require a non-empty pin-to-symbol mapping."));
  if (!isPinMap(record.footprintPadMap)) errors.push(issue("FOOTPRINT_PAD_MAP", record, "Verified records require a non-empty pin-to-footprint-pad mapping."));
  if (!hasMatchingPinMaps(record.symbolPinMap, record.footprintPadMap)) errors.push(issue("PIN_MAP_ALIGNMENT", record, "Symbol and footprint maps must cover the same pins and must not reuse a footprint pad."));
  if (!record.pinElectricalTypes || !sameKeys(record.symbolPinMap, record.pinElectricalTypes)
    || !Object.values(record.pinElectricalTypes).every((type) => ["input", "output", "bidirectional", "power-in", "power-out", "passive", "open-collector", "open-drain", "analog", "no-connect"].includes(type))) {
    errors.push(issue("PIN_ELECTRICAL_TYPES", record, "Every mapped pin requires a supported electrical type."));
  }
  if (!validAsset(record.symbolAsset)) errors.push(issue("SYMBOL_ASSET_EVIDENCE", record, "Verified records require a checksummed symbol asset, source URL, and license evidence."));
  if (!validAsset(record.footprintAsset)) errors.push(issue("FOOTPRINT_ASSET_EVIDENCE", record, "Verified records require a checksummed footprint asset, source URL, and license evidence."));
  if (!isHttps(record.packageEvidence?.sourceUrl)) errors.push(issue("PACKAGE_EVIDENCE", record, "Package evidence requires a manufacturer source URL."));
  if (!isIsoDate(record.lastReviewedAt)) errors.push(issue("REVIEW_DATE", record, "Verified records require a valid ISO review date."));
  if (["unknown", "tbd", "todo", "unassigned", "n/a"].includes(String(record.reviewedBy).trim().toLowerCase())) {
    errors.push(issue("REVIEWER_IDENTITY", record, "Verified records require an identified reviewer, not a placeholder."));
  }
  if (!isSha256(record?.datasheet?.sha256)) errors.push(issue("DATASHEET_CHECKSUM", record, "Verified records require an actual 64-character hexadecimal SHA-256 checksum."));
  if (!Array.isArray(record.warnings) || !Array.isArray(record.alternates)) {
    errors.push(issue("LIMITS_AND_ALTERNATES", record, "Verified records require warnings and alternate-part arrays, even when empty."));
  }
  if (!record.breadboard || typeof record.breadboard.compatible !== "boolean" || !hasString(record.breadboard.adapter)
    || !Array.isArray(record.breadboard.operatingLimits)) {
    errors.push(issue("BREADBOARD_COMPATIBILITY", record, "Breadboard compatibility, adapter status, and operating limits must be explicit."));
  }
  const locales = ["en", "de", "yo", "pcm"];
  if (!record.translations || locales.some((locale) => !hasString(record.translations[locale]?.name) || !hasString(record.translations[locale]?.description))) {
    errors.push(issue("TRANSLATIONS", record, "Verified records require name and description in en, de, yo, and pcm."));
  }
  const model = record.simulationModel;
  const modelStates = ["manufacturer-model", "spice", "analytical", "ideal", "not-modelled", "unsupported"];
  if (!model || !modelStates.includes(model.status)) {
    errors.push(issue("MODEL_PROVENANCE", record, "Verified records require an explicit simulation-model status."));
  } else if (["manufacturer-model", "spice", "analytical"].includes(model.status)) {
    if (!isHttps(model.sourceUrl) || !hasString(model.version) || !hasString(model.licenseId)
      || !hasString(model.fixtureId) || !Array.isArray(model.expectedResults) || model.expectedResults.length === 0) {
      errors.push(issue("MODEL_PROVENANCE", record, "Modeled parts require model source, version, license, fixture, and expected results."));
    }
  } else if (!hasString(model.reason)) {
    errors.push(issue("MODEL_LIMITATION", record, "Unmodeled or unsupported parts require an explicit reason."));
  }
  if (!hasString(record.lifecycleEvidence?.sourceUrl) || !isHttps(record.lifecycleEvidence.sourceUrl)) {
    errors.push(issue("LIFECYCLE_EVIDENCE", record, "Lifecycle claims require an authoritative source URL."));
  }
}

export function validatePartRecord(record) {
  const errors = [];
  if (!record || typeof record !== "object") return [issue("PART_OBJECT", record, "Part record must be an object.")];
  for (const field of ["id", "manufacturer", "manufacturerPartNumber", "category", "type", "lifecycle", "verificationStatus"]) {
    if (!hasString(record[field])) errors.push(issue("PART_FIELD", record, `${field} is required.`));
  }
  if (!PART_STATES.includes(record.verificationStatus)) errors.push(issue("PART_STATE", record, "verificationStatus is invalid."));
  if (!isHttps(record?.datasheet?.url) || !hasString(record?.datasheet?.title) || !isIsoDate(record?.datasheet?.accessedAt)) {
    errors.push(issue("DATASHEET_SOURCE", record, "An authoritative HTTPS datasheet URL, title, and valid access date are required."));
  }
  if (record.verificationStatus === "verified") validateVerifiedEvidence(record, errors);
  return errors;
}

export function validateComponentTypes(taxonomy) {
  const errors = [];
  if (!taxonomy || taxonomy.schemaVersion !== 1 || !Array.isArray(taxonomy.categories)) {
    return { valid: false, errors: [{ code: "TAXONOMY_SCHEMA", message: "Component taxonomy schema is invalid." }] };
  }
  const codes = new Set();
  const categoryCodes = new Set();
  for (const category of taxonomy.categories) {
    if (!/^[A-O]$/.test(category?.code ?? "") || categoryCodes.has(category.code) || !Array.isArray(category.types)) {
      errors.push({ code: "TAXONOMY_CATEGORY", message: "Category codes must be unique A–O with a type list." });
      continue;
    }
    categoryCodes.add(category.code);
    if (category.declaredCount !== category.types.length) errors.push({ code: "TAXONOMY_CATEGORY_COUNT", message: `Category ${category.code} count does not match its entries.` });
    for (const type of category.types) {
      if (!new RegExp(`^${category.code}\\d{2}$`).test(type?.code ?? "") || !hasString(type?.name) || codes.has(type.code)) {
        errors.push({ code: "TAXONOMY_TYPE", message: `Invalid or duplicate type code in category ${category.code}.` });
      }
      codes.add(type?.code);
    }
  }
  if (taxonomy.categories.length !== 15 || codes.size !== TAXONOMY_TARGET || taxonomy.totalTypes !== codes.size) {
    errors.push({ code: "TAXONOMY_TOTAL", message: `Taxonomy must contain exactly ${TAXONOMY_TARGET} unique coded types in 15 categories.` });
  }
  return { valid: errors.length === 0, errors, typeCodes: codes };
}

export function validatePartLedger(ledger, taxonomy) {
  const errors = [];
  if (ledger?.schemaVersion !== PART_LEDGER_SCHEMA_VERSION) errors.push({ code: "LEDGER_SCHEMA", message: "Unsupported part ledger schema." });
  if (!Array.isArray(ledger?.records)) errors.push({ code: "LEDGER_RECORDS", message: "Part ledger records must be an array." });
  const taxonomyResult = taxonomy ? validateComponentTypes(taxonomy) : null;
  const typeCodes = taxonomyResult?.typeCodes;
  if (taxonomyResult) errors.push(...taxonomyResult.errors);
  const ids = new Set();
  const mpns = new Set();
  for (const record of ledger?.records ?? []) {
    if (ids.has(record.id)) errors.push(issue("DUPLICATE_PART_ID", record, "Part IDs must be unique."));
    ids.add(record.id);
    const key = `${record.manufacturer}::${record.manufacturerPartNumber}`.toLowerCase();
    if (mpns.has(key)) errors.push(issue("DUPLICATE_MPN", record, "Manufacturer part numbers must be unique per manufacturer."));
    mpns.add(key);
    if (record.typeCode && typeCodes && !typeCodes.has(record.typeCode)) errors.push(issue("UNKNOWN_TYPE_CODE", record, "Part typeCode must exist in the explicit component taxonomy."));
    if (record.verificationStatus === "verified" && typeCodes && !typeCodes.has(record.typeCode)) errors.push(issue("VERIFIED_TYPE_CODE", record, "Verified parts must map to an existing taxonomy type."));
    errors.push(...validatePartRecord(record));
  }
  return { valid: errors.length === 0, errors };
}

export function getLedgerCoverage(ledger) {
  const records = Array.isArray(ledger?.records) ? ledger.records : [];
  const byStatus = Object.fromEntries(PART_STATES.map((state) => [state, records.filter((record) => record.verificationStatus === state).length]));
  return { total: records.length, verified: byStatus.verified, byStatus, target: LIBRARY_TARGET, remaining: Math.max(0, LIBRARY_TARGET - byStatus.verified) };
}

export function getLibraryCoverage(ledger, taxonomy) {
  const records = Array.isArray(ledger?.records) ? ledger.records : [];
  const taxonomyResult = validateComponentTypes(taxonomy);
  const cats = (taxonomy?.categories ?? []).map((category) => {
    const inCategory = records.filter((record) => record.typeCode?.startsWith(category.code));
    const typesWithVerified = new Set(inCategory.filter((record) => record.verificationStatus === "verified").map((record) => record.typeCode));
    return {
      code: category.code,
      declaredTypes: category.types.length,
      partRecords: inCategory.length,
      verifiedRecords: inCategory.filter((record) => record.verificationStatus === "verified").length,
      coveredTypes: typesWithVerified.size,
      missingTypes: category.types.length - typesWithVerified.size
    };
  });
  const byStatus = Object.fromEntries(PART_STATES.map((state) => [state, records.filter((record) => record.verificationStatus === state).length]));
  return {
    schemaVersion: 1,
    targets: { verifiedParts: LIBRARY_TARGET, componentTypes: TAXONOMY_TARGET },
    ledger: { total: records.length, verified: byStatus.verified, remaining: Math.max(0, LIBRARY_TARGET - byStatus.verified), byStatus },
    taxonomy: { totalTypes: taxonomyResult.typeCodes?.size ?? 0, categories: cats },
    humanReviewRequired: true
  };
}

export function validatePartsManifest(manifest, taxonomy, ledger) {
  const errors = [];
  const paths = ["taxonomyPath", "ledgerPath", "coveragePath", "evidenceDirectory", "licenseLedgerPath"];
  if (manifest?.schemaVersion !== 1) errors.push({ code: "MANIFEST_SCHEMA", message: "Parts manifest schema is invalid." });
  if (manifest?.targetVerifiedRecords !== LIBRARY_TARGET || manifest?.taxonomyTypeCount !== TAXONOMY_TARGET) {
    errors.push({ code: "MANIFEST_TARGETS", message: "Manifest must preserve targets of 1,000 verified records and 565 types." });
  }
  for (const field of paths) if (!hasString(manifest?.[field])) errors.push({ code: "MANIFEST_PATH", message: `Manifest ${field} is required.` });
  if (manifest?.taxonomyTypeCount !== taxonomy?.totalTypes) errors.push({ code: "MANIFEST_TAXONOMY", message: "Manifest taxonomy target must match the taxonomy file." });
  if (!Array.isArray(ledger?.records)) errors.push({ code: "MANIFEST_LEDGER", message: "A parts ledger is required." });
  return { valid: errors.length === 0, errors };
}
