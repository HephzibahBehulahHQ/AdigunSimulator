export const BREADBOARD_MODEL = Object.freeze({
  id: "generic-400-30",
  columns: 30,
  terminalRows: Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]),
  railSegmentLength: 15,
  terminalHoleCount: 300,
  railHoleCount: 120,
  holeCount: 420
});

export function breadboardHoleIds() {
  const ids = [];
  for (const row of BREADBOARD_MODEL.terminalRows) {
    for (let column = 1; column <= BREADBOARD_MODEL.columns; column++) ids.push(`${row}${column}`);
  }
  for (const rail of ["TP", "TM", "BP", "BM"]) {
    for (let column = 1; column <= BREADBOARD_MODEL.columns; column++) ids.push(`${rail}${column}`);
  }
  return ids;
}

export function normalizeBreadboardHole(value) {
  if (typeof value !== "string") return null;
  const id = value.trim().toUpperCase();
  const terminal = id.match(/^([A-J])(\d{1,2})$/);
  const rail = id.match(/^(TP|TM|BP|BM)(\d{1,2})$/);
  const match = terminal ?? rail;
  if (!match) return null;
  const column = Number(match[2]);
  return Number.isInteger(column) && column >= 1 && column <= BREADBOARD_MODEL.columns ? id : null;
}

export function breadboardConnectionGroup(value, model = BREADBOARD_MODEL) {
  const id = normalizeBreadboardHole(value);
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

export function breadboardHolePoint(value) {
  const id = normalizeBreadboardHole(value);
  if (!id) return null;
  const terminal = id.match(/^([A-J])(\d{1,2})$/);
  const rail = id.match(/^(TP|TM|BP|BM)(\d{1,2})$/);
  const column = Number((terminal ?? rail)[2]);
  const x = 54 + (column - 1) * (572 / 29);
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

export function validateBreadboardTopology(project, { getPartPins, model = BREADBOARD_MODEL } = {}) {
  const errors = [], warnings = [];
  const config = project?.breadboard;
  if (!config || config.model !== model.id || !config.pinHoles || typeof config.pinHoles !== "object" || Array.isArray(config.pinHoles)) {
    return { state: "incomplete", errors, warnings: [{ code: "BREADBOARD_MAPPING_MISSING", message: "Assign component pins to physical breadboard holes before treating the layout as wired." }], nets: [], mappedPinCount: 0, jumperCount: 0 };
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
    const hole = normalizeBreadboardHole(rawHole);
    if (!component || !pin || !getPartPins(component.libraryId)?.includes(pin)) {
      errors.push({ code: "BREADBOARD_UNKNOWN_PIN", endpoint: rawEndpoint, message: "A physical placement refers to a component pin that is not in the library." });
      continue;
    }
    if (!hole) {
      errors.push({ code: "BREADBOARD_HOLE_ID", endpoint: rawEndpoint, message: "Use a terminal hole A1–J30 or rail hole TP1/TM1/BP1/BM1 through TP30/TM30/BP30/BM30." });
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

  const dsu = makeDisjointSet();
  for (const hole of pinHoles.values()) dsu.root(breadboardConnectionGroup(hole, model));
  const jumpers = Array.isArray(config.jumpers) ? config.jumpers : [];
  if (!Array.isArray(config.jumpers)) errors.push({ code: "BREADBOARD_JUMPERS", message: "Physical jumpers must be stored as an array." });
  const jumperKeys = new Set();
  for (const jumper of jumpers) {
    const from = normalizeBreadboardHole(jumper?.from), to = normalizeBreadboardHole(jumper?.to);
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
    const endpoints = Array.isArray(net.endpoints) ? net.endpoints : [];
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

export function breadboardPackagePlacement(component, project) {
  const packageModel = BREADBOARD_GENERIC_PACKAGE_GEOMETRY[component?.libraryId];
  if (!packageModel || !project?.breadboard?.pinHoles) return null;
  const pinPoints = packageModel.pins.map((pin) => {
    const hole = normalizeBreadboardHole(project.breadboard.pinHoles[`${component.instanceId}:${pin}`]);
    return hole ? { pin, hole, ...breadboardHolePoint(hole) } : null;
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
