import ledger from "../library/parts-ledger.json" with { type: "json" };
import { getPartVerificationReadiness } from "./part-ledger.mjs";

export const MANUFACTURER_PART_RECORDS = Object.freeze(ledger.records.map((record) => Object.freeze(record)));

export function searchManufacturerParts(query = "") {
  const normalized = String(query).trim().toLocaleLowerCase();
  if (!normalized) return MANUFACTURER_PART_RECORDS;
  return MANUFACTURER_PART_RECORDS.filter((record) => [
    record.id,
    record.manufacturer,
    record.manufacturerPartNumber,
    record.category,
    record.type,
    record.package,
    record.packageEvidence?.package,
    record.lifecycle,
    record.verificationStatus
  ].filter(Boolean).join(" ").toLocaleLowerCase().includes(normalized));
}

export function getManufacturerPartEvidenceSummary(record) {
  const readiness = getPartVerificationReadiness(record);
  return Object.freeze({
    partId: record.id,
    status: record.verificationStatus,
    verified: readiness.verified,
    requiresHumanReview: readiness.requiresHumanReview,
    readyForHumanReview: readiness.readyForHumanReview,
    missingEvidenceCodes: readiness.missingEvidenceCodes,
    evidenceBlockerCodes: readiness.evidenceBlockerCodes,
    simulationStatus: record.modelStatus ?? record.simulationModel?.status ?? "unspecified",
    datasheetUrl: record.datasheet?.url ?? null
  });
}
