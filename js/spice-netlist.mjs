import { findLibraryPart, validateProject } from "./core.mjs";

const MODELS = new Map([
  ["power.dc-source", { prefix: "V", pins: ["+", "-"], unit: "V", positive: false }],
  ["passive.resistor", { prefix: "R", pins: ["1", "2"], unit: "Ω", positive: true }],
  ["passive.capacitor", { prefix: "C", pins: ["1", "2"], unit: "F", positive: true }],
  ["passive.inductor", { prefix: "L", pins: ["1", "2"], unit: "H", positive: true }]
]);

const PREFIX_SCALE = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, "μ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };

function parseValue(value, unit) {
  const match = String(value).trim().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s*(p|n|u|µ|μ|m|k|K|M|G)?\s*(Ω|ohm|ohms|F|H|V)?$/);
  if (!match) return NaN;
  const supplied = match[3] || unit;
  const validUnit = unit === "Ω" ? /^(?:Ω|ohms?)$/i.test(supplied) : supplied.toUpperCase() === unit;
  if (!validUnit) return NaN;
  const parsed = Number(match[1]) * (PREFIX_SCALE[match[2]] ?? 1);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function blocked(message) { return { ok: false, error: message }; }

export function exportSpiceNetlist(project) {
  const validation = validateProject(project);
  if (!validation.valid) return blocked("Fix project schema errors before exporting a SPICE netlist.");
  if (!Array.isArray(project.components) || !project.components.length) return blocked("A project with at least one modeled component is required.");

  const groundParts = project.components.filter((part) => part.libraryId === "ground.signal");
  if (!groundParts.length) return blocked("Connect a signal-ground reference before exporting.");

  const endpointNet = new Map();
  for (const net of project.nets) for (const endpoint of net.endpoints) {
    if (endpointNet.has(endpoint)) return blocked(`Pin ${endpoint} is assigned to more than one net.`);
    endpointNet.set(endpoint, net.id);
  }
  const groundNets = new Set(groundParts.map((part) => endpointNet.get(`${part.instanceId}:0`)));
  if (groundNets.has(undefined) || groundNets.size !== 1) return blocked("All signal-ground symbols must connect to one reference net.");
  const groundNet = [...groundNets][0];

  const modeled = [];
  for (const part of project.components) {
    if (part.libraryId === "ground.signal") continue;
    const model = MODELS.get(part.libraryId);
    if (!model) return blocked(`${part.reference} (${findLibraryPart(part.libraryId)?.type ?? part.libraryId}) has no generic SPICE export model.`);
    if (typeof part.reference !== "string" || !new RegExp(`^${model.prefix}\\d+$`, "i").test(part.reference)) return blocked(`${part.reference || "A component"} does not have a safe ${model.prefix} designator for SPICE export.`);
    const nodes = model.pins.map((pin) => endpointNet.get(`${part.instanceId}:${pin}`));
    if (nodes.some((netId) => !netId)) return blocked(`${part.reference} has an unconnected terminal.`);
    const value = parseValue(part.value, model.unit);
    if (!Number.isFinite(value) || (model.positive && !(value > 0))) return blocked(`${part.reference} needs a finite ${model.positive ? "positive " : ""}${model.unit} value to export.`);
    modeled.push({ reference: part.reference, prefix: model.prefix, nodes, value });
  }
  if (!modeled.length) return blocked("Add at least one connected source or passive component before exporting.");

  const netIds = [...new Set(modeled.flatMap((part) => part.nodes))].filter((netId) => netId !== groundNet);
  const nodeNames = new Map(netIds.map((netId, index) => [netId, `N${index + 1}`]));
  const nodeName = (netId) => netId === groundNet ? "0" : nodeNames.get(netId);
  const safeName = String(project.metadata.name ?? "AdigunSimulator project").replace(/[\r\n\0]/g, " ").trim().slice(0, 120) || "AdigunSimulator project";
  const lines = [safeName, "* Generic ideal independent source, resistor, capacitor, and inductor cards.", "* No analysis directive or manufacturer-specific device model is included."];
  for (const part of modeled) lines.push(`${part.prefix}${part.reference.slice(1)} ${part.nodes.map(nodeName).join(" ")} ${part.value}`);
  lines.push(".end");
  return { ok: true, netlist: `${lines.join("\n")}\n` };
}
