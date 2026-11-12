Warning: truncated output (original token count: 1480)
Total output lines: 65

import { findLibraryPart } from "./core.mjs";
import { MANUFACTURER_PART_RECORDS } from "./part-catalogue.mjs";

const MANUFACTURER_RECORDS_BY_ID = new Map(MANUFACTURER_PART_RECORDS.map((record) => [record.id, record]));

function displayPinMap(record) {
  return Object.entries(record?.symbolPinMap ?? {})
    .map(([number, signal]) => `${number} → ${signal}`)
    .join(", ") || "Not recorded";
}

export function explainComponent(project, target) {
  const component = (project?.components ?? []).find((item) => item.instanceId === target || item.reference === target);
  if (!component) return { ok: false, error: "Select a component in the current project first." };
  const part = findLibraryPart(component.libraryId);
  if (!part) return { ok: false, error: "This component is not in the checked-in library, so its identity cannot be verified." };

  const evidence = MANUFACTURER_RECORDS_BY_ID.get(component.libraryId);
  const unknown = [];
  if (!evidence) unknown.push("No manufacturer evidence record is registered for this library entry.");
  if (!evidence?.manufacturer) unknown.push("Manufacturer is not recorded in the evidence ledger.");
  if (!evidence?.manufacturerPartNumber) unknown.push("Manufacturer part number (MPN) is not recorded in the evidence ledger.");
  if (!evidence?.packageEvidence?.package && !evidence?.package) unknown.push("Physical package is not recorded in the evidence ledger.");
  if (!evidence?.datasheet?.url) unknown.push("A manufacturer datasheet URL is not recorded in the evidence ledger.");
  if (!evidence?.verificationStatus) unknown.push("Evidence review status is not recorded in the evidence ledger.");

  const manufacturerSource = evidence?.manufacturerSources?.find((source) => source.kind === "manufacturer-product-page")?.url
    ?? "Checked-in manufacturer evidence ledger";
  const datasheet = evidence?.datasheet;
  const known = [
    { field: "Reference", value: component.reference, source: "Native project" },
    { field: "Confi…480 tokens truncated…-in component library. Manufacturer evidence lookup: checked-in manufacturer evidence ledger. Library status: ${part.status ?? "not recorded"}; simulation model: ${part.simulation ?? "none declared"}. Manufacturer evidence: ${evidence?.manufacturer ?? "not recorded"}; MPN ${evidence?.manufacturerPartNumber ?? "not recorded"}; package ${evidence?.packageEvidence?.package ?? evidence?.package ?? "not recorded"}; review status ${evidence?.verificationStatus ?? "not recorded"}. ${datasheet?.url ? `Datasheet: ${datasheet.url}.` : "No manufacturer datasheet URL is recorded."} ${unknown.length ? `Unknown: ${unknown.join(" ")}` : "These identity and evidence fields are copied from the checked-in ledger; the status does not imply independent review."}`;
  return {
    ok: true,
    kind: "bot-grounded-component-explanation",
    reference: component.reference,
    known,
    unknown,
    answer,
    scope: "Local project, checked-in component library, and checked-in manufacturer evidence ledger only; no external AI or web lookup."
  };
}

export function runBotComponentExplainer(project) {
  const config = project?.botExplainComponent;
  if (config?.kind !== "grounded-component-explanation") return { state: "blocked", engine: "Adigun BOT local component explainer", message: "Component explanation configuration is missing.", errors: [{ code: "BOT_COMPONENT_CONFIG", message: "Provide a grounded-component-explanation target." }], warnings: [], result: null };
  const explanation = explainComponent(project, config.target);
  if (!explanation.ok) return { state: "blocked", engine: "Adigun BOT local component explainer", message: explanation.error, errors: [{ code: "BOT_COMPONENT_UNKNOWN", message: explanation.error }], warnings: [], result: null };
  return { state: "complete", engine: "Adigun BOT local component explainer", message: explanation.scope, errors: [], warnings: explanation.unknown.map((message) => ({ code: "BOT_FIELD_UNKNOWN", message })), result: explanation };
}

