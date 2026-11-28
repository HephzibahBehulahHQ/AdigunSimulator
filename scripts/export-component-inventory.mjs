import { findNativeCataloguePart } from "../js/native-catalogue-parts.mjs";
import { writeFile } from "node:fs/promises";
import taxonomy from "../library/component-types.json" with { type: "json" };
import { STARTER_LIBRARY } from "../js/core.mjs";
import { findBcpPart } from "../js/bcp-native-parts.mjs";
import { LADDER_MODELS } from "../js/ladder-components.mjs";
import { MANUFACTURER_PART_RECORDS, getManufacturerPartEvidenceSummary } from "../js/part-catalogue.mjs";

const primitiveRows = STARTER_LIBRARY.map(part => ({
  kind: Object.hasOwn(LADDER_MODELS, part.id) ? "software-instruction"
    : /manufacturer candidate|source-backed/i.test(part.status ?? "") ? "hardware-oriented-definition"
    : "generic-or-virtual-definition",
  id: part.id,
  category: part.category,
  function: part.type,
  pinMap: part.pins.map(name => ({ name })),
  viewSupport: part.views ?? null,
  simulationModel: part.simulation ?? null,
  sources: part.sources ?? [],
  readiness: { catalogue: part.status ?? null }
}));

const manufacturerRows = MANUFACTURER_PART_RECORDS.map(part => {
  const evidence = getManufacturerPartEvidenceSummary(part);
  const nativePart = findNativeCataloguePart(part.id);
  const nativeViews = nativePart?.views;
  return {
    kind: "manufacturer-record",
    id: part.id,
    manufacturer: part.manufacturer,
    partNumber: part.manufacturerPartNumber,
    package: part.package ?? part.packageEvidence?.package ?? null,
    category: part.category,
    function: part.type,
    pinMap: evidence.pinMap,
    symbolAsset: part.symbolAsset ?? null,
    footprintAsset: part.footprintAsset ?? null,
    viewSupport: {
      breadboard: findBcpPart(part.id) && part.breadboard ? { ...part.breadboard, nativeAdapter: "PA0174C" } : nativePart?.nativeBreadboard ? { model: "busboard-bb400", assembly: "300 mil PDIP" } : part.breadboard ?? null,
      schematic: nativeViews?.schematic ?? part.views?.schematic ?? null,
      pcb: nativeViews?.pcb ?? part.views?.pcb ?? null
    },
    simulationModel: nativePart?.simulation
      ? { status: "supported", id: nativePart.simulation, scope: "Ideal single-byte write/read fixture" }
      : part.simulationModel ?? null,
    sources: [...new Set([part.datasheet.url, ...((part.manufacturerSources ?? []).map(source => source.url)),
      part.packageEvidence?.sourceUrl, part.footprintEvidence?.sourceUrl].filter(Boolean))],
    readiness: {
      verification: evidence.status,
      readyForHumanReview: evidence.readyForHumanReview,
      missingEvidence: evidence.missingEvidenceCodes,
      blockers: evidence.evidenceBlockerCodes,
      footprintEvidence: evidence.footprintEvidenceStatus,
      simulation: evidence.simulationStatus
    }
  };
});

const counts = rows => Object.groupBy(rows, row => row.kind);
const records = [...primitiveRows, ...manufacturerRows];
const byKind = Object.fromEntries(Object.entries(counts(records)).map(([kind, rows]) => [kind, rows.length]));
const inventory = {
  schemaVersion: 1,
  counts: {
    placeableDefinitions: primitiveRows.length,
    taxonomyTypes: taxonomy.totalTypes,
    taxonomyCategories: taxonomy.categories.length,
    manufacturerRecords: manufacturerRows.length,
    verifiedManufacturerRecords: manufacturerRows.filter(row => row.readiness.verification === "verified").length,
    byKind,
    manufacturerByStatus: Object.fromEntries(Object.entries(Object.groupBy(manufacturerRows, row => row.readiness.verification))
      .map(([status, rows]) => [status, rows.length]))
  },
  records
};
const columns = ["kind", "id", "manufacturer", "partNumber", "package", "category", "function", "pinMap",
  "symbolAsset", "footprintAsset", "viewSupport", "simulationModel", "sources", "readiness"];
const csvCell = value => {
  let cell = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  if (/^[=+\-@\t\r]/.test(cell)) cell = "'" + cell;
  return '"' + cell.replaceAll('"', '""') + '"';
};
const csv = [columns.join(","), ...records.map(row => columns.map(column => csvCell(row[column])).join(","))].join("\r\n") + "\r\n";
await Promise.all([
  writeFile(new URL("../library/component-inventory.json", import.meta.url), JSON.stringify(inventory, null, 2) + "\n"),
  writeFile(new URL("../library/component-inventory.csv", import.meta.url), csv)
]);
console.log(JSON.stringify(inventory.counts));
