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
  if (!evidence?.manufacturer) unknown.push("Manufacturer is not recorded in this library entry.");
  if (!evidence?.manufacturerPartNumber) unknown.push("Manufacturer part number (MPN) is not recorded.");
  if (!evidence?.packageEvidence?.package && !evidence?.package) unknown.push("Physical package is not recorded in the evidence ledger.");
  if (!evidence?.datasheet?.url) unknown.push("A verified datasheet link is not recorded.");
  if (!evidence?.verificationStatus) unknown.push("Evidence review status is not recorded in the evidence ledger.");

  const manufacturerSource = evidence?.manufacturerSources?.find((source) => source.kind === "manufacturer-product-page")?.url
    ?? "Checked-in manufacturer evidence ledger";
  const datasheet = evidence?.datasheet;
  const known = [
    { field: "Reference", value: component.reference, source: "Native project" },
    { field: "Configured value", value: component.value || "Not set", source: "Native project" },
    { field: "Library description", value: part.type, source: "Checked-in component library" },
    { field: "Library pins", value: Array.isArray(part.pins) ? part.pins.join(", ") : "Not recorded", source: "Checked-in component library" },
    { field: "Manufacturer", value: evidence?.manufacturer ?? "Not recorded", source: manufacturerSource },
    { field: "Manufacturer part number", value: evidence?.manufacturerPartNumber ?? "Not recorded", source: manufacturerSource },
    { field: "Physical package", value: evidence?.packageEvidence?.package ?? evidence?.package ?? "Not recorded", source: manufacturerSource },
    { field: "Lifecycle", value: evidence?.lifecycle ?? "Not recorded", source: manufacturerSource },
    { field: "Evidence review status", value: evidence?.verificationStatus ?? "Not recorded", source: "Checked-in manufacturer evidence ledger" },
    { field: "Manufacturer datasheet", value: datasheet?.url ? `${datasheet.title ?? "Datasheet"}: ${datasheet.url}` : "Not recorded", source: datasheet?.url ?? "Checked-in manufacturer evidence ledger" },
    { field: "Datasheet pin-number map", value: displayPinMap(evidence), source: datasheet?.url ?? "Checked-in manufacturer evidence ledger" },
    { field: "Supported views", value: ["breadboard", "schematic", "pcb"].filter((view) => part.views?.[view]).join(", ") || "None recorded", source: "Checked-in component library" },
    { field: "Simulation model", value: part.simulation ?? "None declared", source: "Checked-in component library" },
    { field: "Library status", value: part.status ?? "Not recorded", source: "Checked-in component library" }
  ];
  const answer = `For ${component.reference}, the project records ${component.value || "no configured value"}; the checked-in library describes it as ${part.type}. Sources: Native project and Checked-in component library. Manufacturer evidence lookup: checked-in manufacturer evidence ledger. Library status: ${part.status ?? "not recorded"}; simulation model: ${part.simulation ?? "none declared"}. Manufacturer evidence: ${evidence?.manufacturer ?? "not recorded"}; MPN ${evidence?.manufacturerPartNumber ?? "not recorded"}; package ${evidence?.packageEvidence?.package ?? evidence?.package ?? "not recorded"}; review status ${evidence?.verificationStatus ?? "not recorded"}. ${datasheet?.url ? `Datasheet: ${datasheet.url}.` : "No manufacturer datasheet URL is recorded."} ${unknown.length ? `Unknown: ${unknown.join(" ")}` : "These identity and evidence fields are copied from the checked-in ledger; the status does not imply independent review."}`;
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

