import { findLibraryPart } from "./core.mjs";

const COST_KIND = "bom-cost-placeholder";

function csvCell(value) {
  const text = value == null ? "" : String(value);
  const safe = /^[=+@-]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

function roundedCost(value) {
  return Number.isFinite(value) ? Number(value.toFixed(6)) : null;
}

function verifiedPrice(component) {
  const price = component?.verifiedPrice;
  if (!price || typeof price !== "object") return null;
  if (typeof price.unitCost !== "number" || !Number.isFinite(price.unitCost) || price.unitCost < 0) return null;
  if (typeof price.currency !== "string" || !/^[A-Z]{3}$/.test(price.currency)) return null;
  if (typeof price.source !== "string") return null;
  let source;
  try { source = new URL(price.source); } catch { return null; }
  if (source.protocol !== "https:" || !source.hostname || source.username || source.password) return null;
  if (typeof price.asOf !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(price.asOf)) return null;
  const asOfDate = new Date(`${price.asOf}T00:00:00.000Z`);
  if (!Number.isFinite(asOfDate.getTime()) || asOfDate.toISOString().slice(0, 10) !== price.asOf) return null;
  return { unitCost: price.unitCost, currency: price.currency, source: source.href, asOf: price.asOf };
}

export function buildBomReport(project) {
  if (!Array.isArray(project?.components) || project.components.length === 0) {
    return { ok: false, error: "A project with at least one component is required." };
  }
  const grouped = new Map();
  for (const component of project.components) {
    const part = findLibraryPart(component?.libraryId);
    if (!part || typeof component.reference !== "string" || !component.reference.trim()) {
      return { ok: false, error: "Every BOM row needs a verified library part and project reference." };
    }
    if (part.category === "Instruments") continue;
    const value = typeof component.value === "string" ? component.value : "";
    const price = verifiedPrice(component);
    const key = JSON.stringify([component.libraryId, value, price]);
    const row = grouped.get(key) ?? {
      references: [], quantity: 0, libraryId: component.libraryId, description: part.type,
      value, manufacturer: part.manufacturer ?? null, mpn: part.mpn ?? null,
      unitCost: price?.unitCost ?? null, extendedCost: null,
      currency: price?.currency ?? null, priceSource: price?.source ?? null, priceAsOf: price?.asOf ?? null
    };
    row.references.push(component.reference);
    row.quantity += 1;
    grouped.set(key, row);
  }
  const rows = [...grouped.values()].map((row) => ({
    ...row,
    references: row.references.sort((a, b) => a.localeCompare(b, "en", { numeric: true }) || (a < b ? -1 : a > b ? 1 : 0)).join(", "),
    extendedCost: row.unitCost === null ? null : roundedCost(row.unitCost * row.quantity)
  }));
  const currencies = new Set(rows.filter((row) => row.unitCost !== null).map((row) => row.currency));
  const totalCost = rows.length && rows.every((row) => row.extendedCost !== null) && currencies.size === 1
    ? roundedCost(rows.reduce((sum, row) => sum + row.extendedCost, 0))
    : null;
  return { ok: true, rows, totalCost, currency: currencies.size === 1 ? [...currencies][0] : null };
}

export function exportBomCsv(report) {
  if (!report?.ok || !Array.isArray(report.rows)) return { ok: false, error: "A valid BOM report is required." };
  const headers = ["References", "Quantity", "Library ID", "Description", "Value", "Manufacturer", "MPN", "Unit Cost", "Extended Cost", "Currency", "Price Source", "Price As Of"];
  const lines = [headers, ...report.rows.map((row) => [
    row.references, row.quantity, row.libraryId, row.description, row.value, row.manufacturer,
    row.mpn, row.unitCost, row.extendedCost, row.currency, row.priceSource, row.priceAsOf
  ])].map((line) => line.map(csvCell).join(","));
  return { ok: true, csv: lines.join("\r\n") + "\r\n" };
}

export function runBomExportPlaceholder(project) {
  const config = project?.bomExportPlaceholder;
  if (config?.kind !== COST_KIND) {
    return { state: "blocked", engine: "Verified-field BOM and cost placeholder", message: "BOM export configuration is missing.", errors: [{ code: "BOM_CONFIGURATION", message: "Provide the bom-cost-placeholder configuration." }], warnings: [], result: null };
  }
  const report = buildBomReport(project);
  if (!report.ok) {
    return { state: "blocked", engine: "Verified-field BOM and cost placeholder", message: report.error, errors: [{ code: "BOM_INVALID", message: report.error }], warnings: [], result: null };
  }
  return {
    state: "complete", engine: "Verified-field BOM and cost placeholder",
    message: "BOM fields come from the project and checked-in component library. Prices remain blank unless a dated source record is attached; no market prices are inferred.",
    errors: [], warnings: report.totalCost === null ? [{ code: "BOM_COST_UNAVAILABLE", message: "One or more parts have no verified price source; the cost total is unavailable." }] : [],
    result: { kind: "bom-cost-placeholder", rowCount: report.rows.length, itemCount: report.rows.reduce((sum, row) => sum + row.quantity, 0), rows: report.rows, totalCost: report.totalCost, currency: report.currency }
  };
}
