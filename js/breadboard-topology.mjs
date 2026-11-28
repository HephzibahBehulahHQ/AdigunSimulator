import { findBcpPart } from "./bcp-native-parts.mjs";

export const BREADBOARD_MODEL = Object.freeze({
  id: "busboard-bb400",
  manufacturer: "BusBoard Prototype Systems",
  manufacturerPartNumber: "BB400",
  datasheetUrl: "https://www.busboard.com/documents/datasheets/BPS-DAT-%28BB400%29-Datasheet.pdf",
  columns: 30,
  railColumns: 25,
  railColumnOffset: 2.5,
  terminalRows: Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]),
  holePitchMm: 2.54,
  lengthMm: 84,
  widthMm: 54.3,
  thicknessMm: 8.5,
  voltageRatingV: 36,
  currentRatingA: 2,
  insertionWireDiameterMinMm: 0.4,
  insertionWireDiameterMaxMm: 0.7,
  railsContinuous: true,
  railSegmentLength: 0,
  terminalHoleCount: 300,
  railHoleCount: 100,
  holeCount: 400
});

export const LEGACY_BREADBOARD_MODEL = Object.freeze({
  id: "generic-400-30",
  columns: 30,
  railColumns: 30,
  railColumnOffset: 0,
  terminalRows: BREADBOARD_MODEL.terminalRows,
  railsContinuous: false,
  railSegmentLength: 15,
  terminalHoleCount: 300,
  railHoleCount: 120,
  holeCount: 420
});

export function breadboardModelFor(id) {
  return id === LEGACY_BREADBOARD_MODEL.id ? LEGACY_BREADBOARD_MODEL : BREADBOARD_MODEL;
}

export function breadboardHoleIds(model = BREADBOARD_MODEL) {
  const ids = [];
  for (const row of model.terminalRows) {
    for (let column = 1; column <= model.columns; column++) ids.push(`${row}${column}`);
  }
  for (const rail of ["TP", "TM", "BP", "BM"]) {
    for (let column = 1; column <= model.railColumns; column++) ids.push(`${rail}${column}`);
  }
  return ids;
}

export function normalizeBreadboardHole(value, model = BREADBOARD_MODEL) {
  if (typeof value !== "string") return null;
  const id = value.trim().toUpperCase();
  const terminal = id.match(/^([A-J])(\d{1,2})$/);
  const rail = id.match(/^(TP|TM|BP|BM)(\d{1,2})$/);
  const match = terminal ?? rail;
  if (!match) return null;
  const column = Number(match[2]);
  const maxColumn = terminal ? model.columns : model.railColumns;
  return Number.isInteger(column) && column >= 1 && column <= maxColumn ? id : null;
}

export function breadboardConnectionGroup(value, model = BREADBOARD_MODEL) {
  const id = normalizeBreadboardHole(value, model);
  if (!id) return null;
  const terminal = id.match(/^([A-J])(\d{1,2})$/);
  if (terminal) {
    const side = "ABCDE".includes(terminal[1]) ? "upper" : "lower";
    return `terminal:${side}:${terminal[2]}`;
  }
  const rail = id.match(/^(TP|TM|BP|BM)(\d{1,2})$/);
  const segment = model.railSegmentLength
    ? Math.floor((Number(rail[2]) - 1) / model.railSegmentLength) + 1
    : 1;
  return `rail:${rail[1]}:${model.railsContinuous ? "continuous" : segment}`;
}

export function breadboardHolePoint(value, model = BREADBOARD_MODEL) {
  const id = normalizeBreadboardHole(value, model);
  if (!id) return null;
  const terminal = id.match(/^([A-J])(\d{1,2})$/);
  const rail = id.match(/^(TP|TM|BP|BM)(\d{1,2})$/);
  const column = Number((terminal ?? rail)[2]);
  const x = 54 + (column - 1 + (terminal ? 0 : model.railColumnOffset)) * (572 / 29);
  if (terminal) {
    const rowIndex = BREADBOARD_MODEL.terminalRows.indexOf(terminal[1]);
    const y = rowIndex < 5 ? 95 + rowIndex * 10 : 165 + (rowIndex - 5) * 10;
    return { x, y };
  }
  const y = { TP: 54, TM: 68, BP: 232, BM: 246 }[rail[1]];
  return { x, y };
}

function makeDisjointSet() {
  const parent = new Map();
  const root = (value) => {
    if (!parent.has(value)) parent.set(value, value);
    const p = parent.get(value);
    if (p !== value) parent.set(value, root(p));
    return parent.get(value);
  };
  const union = (left, right) => {
    const a = root(left), b = root(right);
    if (a !== b) parent.set(b, a);
  };
  return { root, union };
}

export function validateBreadboardTopology(project, { getPartPins, model: requestedModel } = {}) {
  const errors = [], warnings = [];
  const config = project?.breadboard;
  const model = requestedModel ?? breadboardModelFor(config?.model);
  const nonPhysical = new Set((config?.nonPhysicalItems ?? []).map(item => item.instanceId));
  const requiredPins = (project?.components ?? []).flatMap(component => nonPhysical.has(component.instanceId)
    ? [] : (getPartPins?.(component.libraryId) ?? []).map(pin => `${component.instanceId}:${pin}`));
  if (!config || config.model !== model.id || !config.pinHoles || typeof config.pinHoles !== "object" || Array.isArray(config.pinHoles)) {
    return { state: "incomplete", errors, warnings: [{ code: "BREADBOARD_MAPPING_MISSING", endpoints: requiredPins, fix: "Assign each physical component pin to a real breadboard hole, then add jumpers that reproduce the project nets.", message: `Breadboard pin mapping is missing for ${requiredPins.length} physical pins; the layout is not verified as wired.` }], nets: [], mappedPinCount: 0, jumperCount: 0 };
  }
  if (typeof getPartPins !== "function") {
    return { state: "blocked", errors: [{ code: "BREADBOARD_PIN_LOOKUP", message: "A component-library pin lookup is required to validate physical placements." }], warnings, nets: [], mappedPinCount: 0, jumperCount: 0 };
  }
  const components = new Map((project.components ?? []).map(component => [component.instanceId, component]));
  const pinHoles = new Map(), holeOwners = new Map();
  for (const [rawEndpoint, rawHole] of Object.entries(config.pinHoles)) {
    const separator = rawEndpoint.indexOf(":");
    const instanceId = separator < 0 ? "" : rawEndpoint.slice(0, separator);
    const pin = separator < 0 ? "" : rawEndpoint.slice(separator + 1);
    const component = components.get(instanceId);
    const hole = normalizeBreadboardHole(rawHole, model);
    if (!component || !pin || !getPartPins(component.libraryId)?.includes(pin)) {
      errors.push({ code: "BREADBOARD_UNKNOWN_PIN", endpoint: rawEndpoint, message: "A physical placement refers to a component pin that is not in the library." });
      continue;
    }
    if (nonPhysical.has(instanceId)) {
      errors.push({ code: "BREADBOARD_VIRTUAL_PIN", endpoint: rawEndpoint, message: `${component.reference} is declared nonphysical and must not have a breadboard pin placement.` });
      continue;
    }
    if (!hole) {
      errors.push({ code: "BREADBOARD_HOLE_ID", endpoint: rawEndpoint, message: `Use a terminal hole A1–J${model.columns} or rail hole TP1/TM1/BP1/BM1 through TP${model.railColumns}/TM${model.railColumns}/BP${model.railColumns}/BM${model.railColumns}.` });
      continue;
    }
    const endpoint = `${instanceId}:${pin}`;
    if (pinHoles.has(endpoint)) {
      errors.push({ code: "BREADBOARD_DUPLICATE_ENDPOINT", endpoint, message: "Each component pin can have only one physical placement." });
      continue;
    }
    const existing = holeOwners.get(hole);
    if (existing) errors.push({ code: "BREADBOARD_HOLE_OCCUPIED", endpoint, message: `${hole} is already assigned to ${existing}.` });
    else holeOwners.set(hole, endpoint);
    pinHoles.set(endpoint, hole);
  }

  const missingPins = requiredPins.filter(endpoint => !pinHoles.has(endpoint));
  for (const component of components.values()) {
    if (findBcpPart(component.libraryId) &&
        ["1", "2", "3", "4"].some(pin => pinHoles.has(component.instanceId + ":" + pin)) &&
        !bcpAdapterPlacement(component, project)) {
      errors.push({ code: "BREADBOARD_BCP_ADAPTER", message: `${component.reference} requires the PA0174C pin order across rows E and F.` });
    }
  }
  if (missingPins.length) warnings.push({ code: "BREADBOARD_PIN_UNMAPPED", endpoints: missingPins, fix: "Place each listed pin in a real hole or declare an off-board interface with its physical lead connection.", message: `Breadboard placements are missing for ${missingPins.join(", ")}.` });

  const dsu = makeDisjointSet();
  for (const hole of pinHoles.values()) dsu.root(breadboardConnectionGroup(hole, model));
  joinBcpCollectorHoles(project, model, dsu);
  const jumpers = Array.isArray(config.jumpers) ? config.jumpers : [];
  if (!Array.isArray(config.jumpers)) errors.push({ code: "BREADBOARD_JUMPERS", message: "Physical jumpers must be stored as an array." });
  const jumperKeys = new Set();
  for (const jumper of jumpers) {
    const from = normalizeBreadboardHole(jumper?.from, model), to = normalizeBreadboardHole(jumper?.to, model);
    if (!from || !to || from === to) {
      errors.push({ code: "BREADBOARD_JUMPER_ENDPOINT", message: "Each jumper must connect two distinct valid breadboard holes." });
      continue;
    }
    const key = [from, to].sort().join("::");
    if (jumperKeys.has(key)) warnings.push({ code: "BREADBOARD_DUPLICATE_JUMPER", message: `The jumper ${from}–${to} is duplicated.` });
    jumperKeys.add(key);
    const left = breadboardConnectionGroup(from, model), right = breadboardConnectionGroup(to, model);
    if (left === right) warnings.push({ code: "BREADBOARD_REDUNDANT_JUMPER", message: `The jumper ${from}–${to} joins holes already connected by the breadboard strip.` });
    dsu.union(left, right);
  }

  const endpointToNet = new Map(), netReports = [];
  for (const net of project.nets ?? []) {
    const endpoints = (Array.isArray(net.endpoints) ? net.endpoints : []).filter(endpoint => !nonPhysical.has(String(endpoint).split(":")[0]));
    if (!endpoints.length) continue;
    for (const endpoint of endpoints) {
      if (endpointToNet.has(endpoint) && endpointToNet.get(endpoint) !== net.id) errors.push({ code: "BREADBOARD_MULTIPLE_NETS", endpoint, message: "A component pin cannot belong to more than one canonical project net." });
      endpointToNet.set(endpoint, net.id);
    }
    const unmapped = endpoints.filter(endpoint => !pinHoles.has(endpoint));
    if (unmapped.length) warnings.push({ code: "BREADBOARD_NET_UNMAPPED", netId: net.id, endpoints: unmapped, message: `Physical placements are missing for ${unmapped.join(", ")}.` });
    const roots = [...new Set(endpoints.filter(endpoint => pinHoles.has(endpoint)).map(endpoint => dsu.root(breadboardConnectionGroup(pinHoles.get(endpoint), model))))];
    const connected = endpoints.length > 0 && unmapped.length === 0 && roots.length === 1;
    if (endpoints.length > 1 && unmapped.length === 0 && roots.length > 1) warnings.push({ code: "BREADBOARD_NET_SPLIT", netId: net.id, message: "The mapped pins on this project net are not physically joined by a terminal strip, rail segment, or jumper." });
    netReports.push({ netId: net.id, endpointCount: endpoints.length, mappedEndpointCount: endpoints.length - unmapped.length, connected });
  }

  const netsByPhysicalGroup = new Map();
  for (const [endpoint, hole] of pinHoles) {
    const netId = endpointToNet.get(endpoint);
    if (!netId) continue;
    const root = dsu.root(breadboardConnectionGroup(hole, model));
    if (!netsByPhysicalGroup.has(root)) netsByPhysicalGroup.set(root, new Set());
    netsByPhysicalGroup.get(root).add(netId);
  }
  for (const [root, netIds] of netsByPhysicalGroup) {
    if (netIds.size > 1) errors.push({ code: "BREADBOARD_SHORT", physicalGroup: root, netIds: [...netIds].sort(), message: `One physical breadboard group connects separate project nets: ${[...netIds].sort().join(", ")}.` });
  }

  const state = errors.length ? "blocked" : warnings.length || netReports.some(net => !net.connected) ? "incomplete" : "complete";
  return { state, errors, warnings, nets: netReports, mappedPinCount: pinHoles.size, jumperCount: jumpers.length };
}

export const BREADBOARD_GENERIC_PACKAGE_GEOMETRY = Object.freeze({
  "passive.resistor": Object.freeze({ kind: "axial-resistor", pins: Object.freeze(["1", "2"]), bodyLengthMm: 6.3, bodyWidthMm: 2.3, exactManufacturerFootprint: false }),
  "diode.led-red": Object.freeze({ kind: "through-hole-led-5mm", pins: Object.freeze(["A", "K"]), bodyDiameterMm: 5, nominalLeadPitchMm: 2.54, exactManufacturerFootprint: false }),
  "passive.capacitor": Object.freeze({ kind: "radial-capacitor", pins: Object.freeze(["1", "2"]), bodyDiameterMm: 5, bodyHeightMm: 7, exactManufacturerFootprint: false }),
  "passive.supercapacitor": Object.freeze({ kind: "radial-capacitor", pins: Object.freeze(["+", "-"]), bodyDiameterMm: 8, bodyHeightMm: 10, exactManufacturerFootprint: false }),
  "diode.rectifier-1n4007": Object.freeze({ kind: "axial-diode", pins: Object.freeze(["A", "K"]), bodyLengthMm: 5.2, bodyWidthMm: 2.7, exactManufacturerFootprint: false }),
  "active.npn-small-signal": Object.freeze({ kind: "to92-transistor", pins: Object.freeze(["B", "C", "E"]), bodyWidthMm: 4.5, bodyHeightMm: 5, exactManufacturerFootprint: false })
});

function bcpAdapterHoles(column) {
  return ["E"+column, "E"+(column+1), "F"+(column+1), "F"+column];
}

export function bcpAdapterPlacement(component, project) {
  if (!findBcpPart(component?.libraryId) || project?.breadboard?.model !== BREADBOARD_MODEL.id) return null;
  const holes = ["1", "2", "3", "4"].map(pin => project.breadboard.pinHoles?.[component.instanceId + ":" + pin]);
  const column = Number(normalizeBreadboardHole(holes[0])?.slice(1));
  if (!Number.isInteger(column) || column < 2 || column > BREADBOARD_MODEL.columns - 2 ||
      !bcpAdapterHoles(column).every((hole, index) => hole === holes[index])) return null;
  return holes;
}

export function placeBcpBreadboardAdapter(project, component) {
  const model = BREADBOARD_MODEL;
  const existing = project.breadboard ?? { model: model.id, pinHoles: {}, jumpers: [] };
  if (existing.model !== model.id || !existing.pinHoles || !Array.isArray(existing.jumpers)) return project;
  const usedHoles = [...Object.values(existing.pinHoles), ...existing.jumpers.flatMap(jumper => [jumper.from, jumper.to])];
  const occupiedGroups = new Set(usedHoles.map(hole => breadboardConnectionGroup(hole, model)));
  const terminalColumns = usedHoles.map(hole => /^[D-G](\d+)$/.exec(normalizeBreadboardHole(hole, model))?.[1]).filter(Boolean).map(Number);
  for (let column = 2; column <= model.columns - 2; column++) {
    const holes = bcpAdapterHoles(column);
    if (terminalColumns.some(used => used >= column - 1 && used <= column + 2) ||
        holes.some(hole => occupiedGroups.has(breadboardConnectionGroup(hole, model)))) continue;
    const pinHoles = { ...existing.pinHoles };
    holes.forEach((hole, index) => { pinHoles[component.instanceId + ":" + (index+1)] = hole; });
    return { ...project, breadboard: { ...existing, pinHoles } };
  }
  return project;
}

function joinBcpCollectorHoles(project, model, sets) {
  for (const component of project.components ?? []) {
    const holes = bcpAdapterPlacement(component, project);
    if (holes) sets.union(breadboardConnectionGroup(holes[1], model), breadboardConnectionGroup(holes[3], model));
  }
}

export function breadboardPackagePlacement(component, project) {
  const packageModel = BREADBOARD_GENERIC_PACKAGE_GEOMETRY[component?.libraryId];
  if (!packageModel || !project?.breadboard?.pinHoles) return null;
  const model = breadboardModelFor(project.breadboard.model);
  const pinPoints = packageModel.pins.map((pin) => {
    const hole = normalizeBreadboardHole(project.breadboard.pinHoles[`${component.instanceId}:${pin}`], model);
    return hole ? { pin, hole, ...breadboardHolePoint(hole, model) } : null;
  });
  if (pinPoints.some((point) => !point) || new Set(pinPoints.map((point) => point.hole)).size !== pinPoints.length) return null;
  const first = pinPoints[0], last = pinPoints[pinPoints.length - 1];
  const dx = last.x - first.x, dy = last.y - first.y;
  const span = Math.hypot(dx, dy);
  if (span < 1) return null;
  const center = {
    x: pinPoints.reduce((sum, point) => sum + point.x, 0) / pinPoints.length,
    y: pinPoints.reduce((sum, point) => sum + point.y, 0) / pinPoints.length
  };
  const angleDegrees = Math.atan2(dy, dx) * 180 / Math.PI;
  const scale = (572 / 29) / 2.54;
  const offset = packageModel.kind === "to92-transistor"
    ? packageModel.bodyHeightMm * scale / 2 + 4
    : packageModel.bodyDiameterMm * scale / 2 + 4;
  const normal = { x: dy / span, y: -dx / span };
  const bodyCenter = ["radial-capacitor", "to92-transistor"].includes(packageModel.kind)
    ? { x: center.x + normal.x * offset, y: center.y + normal.y * offset }
    : center;
  return {
    kind: packageModel.kind,
    exactManufacturerFootprint: packageModel.exactManufacturerFootprint,
    bodyLengthMm: packageModel.bodyLengthMm,
    bodyWidthMm: packageModel.bodyWidthMm,
    bodyDiameterMm: packageModel.bodyDiameterMm,
    bodyHeightMm: packageModel.bodyHeightMm,
    pinPoints,
    center,
    bodyCenter,
    angleDegrees,
    leadSpanPixels: span
  };
}

export function deriveBreadboardSchematicNets(project, { getPartPins, model: requestedModel } = {}) {
  const model = requestedModel ?? breadboardModelFor(project?.breadboard?.model);
  if (!project?.breadboard?.pinHoles) {
    return { state: "incomplete", message: "Assign physical breadboard holes before synchronizing the schematic netlist.", errors: [], warnings: [{ code: "BREADBOARD_MAPPING_MISSING" }], nets: [], changed: false, mergedNetIds: [], splitNetIds: [] };
  }
  const report = validateBreadboardTopology(project, { getPartPins, model });
  const errors = report.errors.filter((issue) => issue.code !== "BREADBOARD_SHORT");
  if (errors.length) return { state: "blocked", message: "Resolve invalid component pin or jumper placements before synchronizing.", errors, warnings: report.warnings, nets: [], changed: false, mergedNetIds: [], splitNetIds: [] };
  const unmapped = report.warnings.filter((issue) => issue.code === "BREADBOARD_NET_UNMAPPED");
  if (unmapped.length) return { state: "incomplete", message: "Place every pin currently used by a schematic net before synchronizing.", errors: [], warnings: unmapped, nets: [], changed: false, mergedNetIds: [], splitNetIds: [] };

  const sets = makeDisjointSet();
  const pinHoles = project.breadboard.pinHoles;
  for (const hole of Object.values(pinHoles)) sets.root(breadboardConnectionGroup(hole, model));
  joinBcpCollectorHoles(project, model, sets);
  for (const jumper of project.breadboard.jumpers ?? []) {
    const from = normalizeBreadboardHole(jumper?.from, model), to = normalizeBreadboardHole(jumper?.to, model);
    if (from && to) sets.union(breadboardConnectionGroup(from, model), breadboardConnectionGroup(to, model));
  }

  const endpointOrder = new Map();
  let order = 0;
  for (const component of project.components ?? []) {
    const pins = getPartPins(component.libraryId) ?? [];
    for (const pin of pins) endpointOrder.set(`${component.instanceId}:${pin}`, order++);
  }
  const grouped = new Map();
  for (const endpoint of Object.keys(pinHoles)) {
    const root = sets.root(breadboardConnectionGroup(pinHoles[endpoint], model));
    if (!grouped.has(root)) grouped.set(root, []);
    grouped.get(root).push(endpoint);
  }
  const oldNetByEndpoint = new Map();
  for (const net of project.nets ?? []) for (const endpoint of net.endpoints ?? []) oldNetByEndpoint.set(endpoint, net.id);
  const physicalGroups = [...grouped.values()].filter((endpoints) => endpoints.length > 1);
  for (const endpoints of physicalGroups) endpoints.sort((a, b) => (endpointOrder.get(a) ?? Number.MAX_SAFE_INTEGER) - (endpointOrder.get(b) ?? Number.MAX_SAFE_INTEGER) || a.localeCompare(b));
  physicalGroups.sort((a, b) => (endpointOrder.get(a[0]) ?? Number.MAX_SAFE_INTEGER) - (endpointOrder.get(b[0]) ?? Number.MAX_SAFE_INTEGER) || a[0].localeCompare(b[0]));

  const usedIds = new Set(), splitCounts = new Map(), mergedNetIds = [];
  const nets = physicalGroups.map((endpoints, index) => {
    const oldIds = [...new Set(endpoints.map((endpoint) => oldNetByEndpoint.get(endpoint)).filter(Boolean))];
    if (oldIds.length > 1) mergedNetIds.push(...oldIds.slice(1));
    const seed = oldIds[0] ?? `BB_${index + 1}`;
    const splitNumber = splitCounts.get(seed) ?? 0;
    splitCounts.set(seed, splitNumber + 1);
    const requested = splitNumber ? `${seed}_BB${splitNumber + 1}` : seed;
    let id = requested, suffix = 2;
    while (usedIds.has(id)) id = `${requested}_${suffix++}`;
    usedIds.add(id);
    return { id, endpoints };
  });
  const splitNetIds = [...splitCounts].filter(([, count]) => count > 1).map(([id]) => id);
  const normalize = (items) => JSON.stringify((items ?? []).map((net) => ({ id: net.id, endpoints: [...(net.endpoints ?? [])].sort() })).sort((a, b) => a.id.localeCompare(b.id)));
  const changed = normalize(project.nets) !== normalize(nets);
  return {
    state: "complete",
    message: changed ? "Physical wiring differs from the schematic. Review the proposed shared netlist before applying it." : "Physical breadboard connectivity matches the shared schematic netlist.",
    errors: [],
    warnings: report.warnings.filter((issue) => issue.code !== "BREADBOARD_SHORT"),
    nets,
    changed,
    mergedNetIds: [...new Set(mergedNetIds)],
    splitNetIds,
    physicalNetCount: nets.length
  };
}
