export const SCHEMA_VERSION = 1;
export const DESIGN_VIEWS = Object.freeze(["breadboard", "schematic", "pcb"]);
const UI_LOCALES_FOR_PROJECT = Object.freeze(["en", "de", "yo", "pcm"]);
const CANVAS_LIMITS = Object.freeze({ x: [28, 604], y: [48, 244], overlapDistance: 34 });

export const STARTER_LIBRARY = Object.freeze([
  { id: "power.dc-source", category: "Power & Ground", type: "DC voltage source", prefix: "V", pins: ["+", "-"], defaultValue: "5 V", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.resistor", category: "Passive", type: "Resistor", prefix: "R", pins: ["1", "2"], defaultValue: "330 Ω", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.led-red", category: "Active", type: "Red LED", prefix: "D", pins: ["A", "K"], defaultValue: "Vf 2.0 V", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "ground.signal", category: "Power & Ground", type: "Signal ground", prefix: "GND", pins: ["0"], defaultValue: "0 V", simulation: "reference", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.pushbutton", category: "Inputs", type: "Momentary pushbutton", prefix: "SW", pins: ["1", "2"], defaultValue: "Normally open", simulation: "not modelled", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.ne555", category: "Active", type: "555 timer", prefix: "U", pins: ["1", "2", "3", "4", "5", "6", "7", "8"], defaultValue: "NE555-class", simulation: "not modelled", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "instrument.voltmeter", category: "Instruments", type: "Voltmeter", prefix: "M", pins: ["+", "-"], defaultValue: "DC", simulation: "not modelled", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } },
  { id: "connector.header-1x03", category: "Connectors", type: "Pin header 1×03", prefix: "J", pins: ["1", "2", "3"], defaultValue: "Through-hole", simulation: "schematic/PCB only", status: "starter generic", views: { breadboard: false, schematic: true, pcb: false } }
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createProject() {
  return createLedCurrentLimiterProject();
}

function projectMetadata(name) {
  const now = new Date().toISOString();
  return { name, locale: "en", createdAt: now, updatedAt: now };
}

export function createLedCurrentLimiterProject({ name = "LED Current Limiter", sourceValue = "5 V", resistanceValue = "330 Ω", ledValue = "Vf 2.0 V" } = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: cryptoSafeId(),
    metadata: projectMetadata(name),
    components: [
      { instanceId: "source-1", libraryId: "power.dc-source", reference: "V1", value: sourceValue, position: { breadboard: [60, 142], schematic: [95, 128], pcb: [92, 130] } },
      { instanceId: "resistor-1", libraryId: "passive.resistor", reference: "R1", value: resistanceValue, position: { breadboard: [255, 142], schematic: [260, 128], pcb: [244, 128] } },
      { instanceId: "led-1", libraryId: "diode.led-red", reference: "D1", value: ledValue, position: { breadboard: [455, 142], schematic: [452, 128], pcb: [408, 142] } },
      { instanceId: "ground-1", libraryId: "ground.signal", reference: "GND", value: "0 V", position: { breadboard: [565, 192], schematic: [564, 190], pcb: [506, 192] } }
    ],
    nets: [
      { id: "VCC", endpoints: ["source-1:+", "resistor-1:1"] },
      { id: "LED_A", endpoints: ["resistor-1:2", "led-1:A"] },
      { id: "GND", endpoints: ["led-1:K", "source-1:-", "ground-1:0"] }
    ],
    history: []
  };
}

export function createVoltageDividerProject({ name = "DC Voltage Divider", sourceValue = "9 V", upperResistanceValue = "1 kΩ", lowerResistanceValue = "2 kΩ" } = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: cryptoSafeId(),
    metadata: projectMetadata(name),
    components: [
      { instanceId: "source-1", libraryId: "power.dc-source", reference: "V1", value: sourceValue, position: { breadboard: [60, 142], schematic: [95, 128], pcb: [92, 130] } },
      { instanceId: "resistor-top-1", libraryId: "passive.resistor", reference: "R1", value: upperResistanceValue, position: { breadboard: [250, 122], schematic: [260, 112], pcb: [244, 112] } },
      { instanceId: "resistor-bottom-1", libraryId: "passive.resistor", reference: "R2", value: lowerResistanceValue, position: { breadboard: [425, 188], schematic: [438, 188], pcb: [418, 188] } },
      { instanceId: "ground-1", libraryId: "ground.signal", reference: "GND", value: "0 V", position: { breadboard: [565, 222], schematic: [564, 220], pcb: [506, 222] } }
    ],
    nets: [
      { id: "VCC", endpoints: ["source-1:+", "resistor-top-1:1"] },
      { id: "VOUT", endpoints: ["resistor-top-1:2", "resistor-bottom-1:1"] },
      { id: "GND", endpoints: ["resistor-bottom-1:2", "source-1:-", "ground-1:0"] }
    ],
    history: []
  };
}

export function cryptoSafeId() {
  return globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function findLibraryPart(id) {
  return STARTER_LIBRARY.find((part) => part.id === id) ?? null;
}

export function getViewReconciliationIssues(project, view) {
  return (project?.components ?? []).flatMap((component) => {
    const part = findLibraryPart(component.libraryId);
    if (!part) return [{ instanceId: component.instanceId, reference: component.reference, view, reason: "The part is not available in the current library lock." }];
    if (!part.views?.[view]) return [{ instanceId: component.instanceId, reference: component.reference, view, reason: `${part.type} has no verified ${view} mapping in this starter library.` }];
    return [];
  });
}

export function nextReference(project, libraryId) {
  const prefix = findLibraryPart(libraryId)?.prefix ?? "X";
  const matches = project.components
    .map((item) => item.reference)
    .filter((reference) => reference.startsWith(prefix))
    .map((reference) => Number(reference.slice(prefix.length)))
    .filter(Number.isFinite);
  return `${prefix}${Math.max(0, ...matches) + 1}`;
}

export function addComponent(project, libraryId) {
  const part = findLibraryPart(libraryId);
  if (!part) throw new Error(`Unknown library component: ${libraryId}`);
  const item = {
    instanceId: cryptoSafeId(),
    libraryId,
    reference: nextReference(project, libraryId),
    value: part.defaultValue,
    position: { breadboard: [180, 168], schematic: [310, 168], pcb: [320, 164] }
  };
  return { ...project, components: [...project.components, item], metadata: { ...project.metadata, updatedAt: new Date().toISOString() } };
}

export function updateComponent(project, instanceId, changes) {
  const next = clone(project);
  const target = next.components.find((item) => item.instanceId === instanceId);
  if (!target) throw new Error(`Component not found: ${instanceId}`);
  Object.assign(target, changes);
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function moveComponent(project, instanceId, view, position, { snap = false } = {}) {
  if (!DESIGN_VIEWS.includes(view)) throw new Error(`Unsupported design view: ${view}`);
  if (!Array.isArray(position) || position.length !== 2 || !position.every(Number.isFinite)) throw new Error("A component position must contain two finite coordinates.");
  const next = clone(project);
  const target = next.components.find((item) => item.instanceId === instanceId);
  if (!target) throw new Error(`Component not found: ${instanceId}`);
  const grid = snap ? 12 : 1;
  const x = Math.min(CANVAS_LIMITS.x[1], Math.max(CANVAS_LIMITS.x[0], Math.round(position[0] / grid) * grid));
  const y = Math.min(CANVAS_LIMITS.y[1], Math.max(CANVAS_LIMITS.y[0], Math.round(position[1] / grid) * grid));
  target.position = { ...target.position, [view]: [x, y] };
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function connectPins(project, firstEndpoint, secondEndpoint) {
  if (firstEndpoint === secondEndpoint) throw new Error("Choose two different component pins.");
  for (const pinEndpoint of [firstEndpoint, secondEndpoint]) {
    const [instanceId, pin] = String(pinEndpoint).split(":");
    const component = project.components.find((item) => item.instanceId === instanceId);
    const part = component && findLibraryPart(component.libraryId);
    if (!part?.pins.includes(pin)) throw new Error(`Unknown component pin: ${pinEndpoint}`);
  }
  const next = clone(project);
  const firstNet = next.nets.find((net) => net.endpoints.includes(firstEndpoint));
  const secondNet = next.nets.find((net) => net.endpoints.includes(secondEndpoint));
  if (firstNet && firstNet === secondNet) return next;
  if (firstNet && secondNet) {
    firstNet.endpoints = [...new Set([...firstNet.endpoints, ...secondNet.endpoints])];
    next.nets = next.nets.filter((net) => net !== secondNet);
  } else if (firstNet || secondNet) {
    const target = firstNet ?? secondNet;
    const endpointToAdd = firstNet ? secondEndpoint : firstEndpoint;
    target.endpoints.push(endpointToAdd);
  } else {
    let index = 1;
    while (next.nets.some((net) => net.id === `N${index}`)) index += 1;
    next.nets.push({ id: `N${index}`, endpoints: [firstEndpoint, secondEndpoint] });
  }
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function disconnectPin(project, pinEndpoint) {
  const next = clone(project);
  const net = next.nets.find((item) => item.endpoints.includes(pinEndpoint));
  if (!net) return next;
  net.endpoints = net.endpoints.filter((item) => item !== pinEndpoint);
  if (net.endpoints.length < 2) next.nets = next.nets.filter((item) => item !== net);
  next.metadata.updatedAt = new Date().toISOString();
  return next;
}

export function validateProject(project) {
  const errors = [];
  const warnings = [];
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    return { errors: [{ rule: "PROJECT_OBJECT", message: "Project document must be a JSON object." }], warnings, valid: false };
  }
  if (project.schemaVersion !== SCHEMA_VERSION) errors.push({ rule: "SCHEMA_VERSION", message: "Project schema is missing or unsupported." });
  if (!project.metadata || typeof project.metadata !== "object" || Array.isArray(project.metadata)) errors.push({ rule: "METADATA_OBJECT", message: "Project metadata must be an object." });
  if (typeof project.metadata?.name !== "string" || !project.metadata.name.trim()) errors.push({ rule: "PROJECT_NAME", message: "Project name is required." });
  if (project.metadata?.locale && !UI_LOCALES_FOR_PROJECT.includes(project.metadata.locale)) warnings.push({ rule: "PROJECT_LOCALE", message: `Project locale ${project.metadata.locale} is unsupported; English fallback will be used.` });
  if (!Array.isArray(project.components)) errors.push({ rule: "COMPONENTS_ARRAY", message: "Project components must be an array." });
  if (!Array.isArray(project.nets)) errors.push({ rule: "NETS_ARRAY", message: "Project nets must be an array." });
  const components = Array.isArray(project.components) ? project.components : [];
  const nets = Array.isArray(project.nets) ? project.nets : [];
  const ids = new Set();
  const references = new Set();
  for (const item of components) {
    if (!item || typeof item !== "object" || Array.isArray(item)) { errors.push({ rule: "COMPONENT_OBJECT", message: "Each component must be an object." }); continue; }
    if (typeof item.instanceId !== "string" || !item.instanceId || ids.has(item.instanceId)) errors.push({ rule: "COMPONENT_ID", message: `Component instance IDs must be unique (${item.reference || "unnamed"}).` });
    ids.add(item.instanceId);
    if (typeof item.reference !== "string" || !item.reference.trim() || references.has(item.reference)) errors.push({ rule: "REFERENCE", message: `Reference designators must be unique (${item.reference || "unnamed"}).` });
    references.add(item.reference);
    if (!findLibraryPart(item.libraryId)) warnings.push({ rule: "UNLOCKED_LIBRARY", message: `${item.reference || "Component"} is not in the starter library.` });
    for (const view of DESIGN_VIEWS) {
      const position = item.position?.[view];
      if (!Array.isArray(position) || position.length !== 2 || !position.every(Number.isFinite)) warnings.push({ rule: "LAYOUT_POSITION", message: `${item.reference || "Component"} has no valid ${view} position.` });
    }
  }
  for (const view of DESIGN_VIEWS) {
    for (let first = 0; first < components.length; first += 1) {
      for (let second = first + 1; second < components.length; second += 1) {
        const a = components[first];
        const b = components[second];
        if (!a || !b || typeof a !== "object" || typeof b !== "object") continue;
        const aPosition = a.position?.[view];
        const bPosition = b.position?.[view];
        if (!Array.isArray(aPosition) || !Array.isArray(bPosition)) continue;
        if (Math.hypot(aPosition[0] - bPosition[0], aPosition[1] - bPosition[1]) < CANVAS_LIMITS.overlapDistance) {
          warnings.push({ rule: "LAYOUT_OVERLAP", message: `${a.reference} and ${b.reference} overlap in the ${view} layout.` });
        }
      }
    }
  }
  const endpointOwners = new Map();
  const netIds = new Set();
  for (const net of nets) {
    if (!net || typeof net !== "object" || Array.isArray(net)) { errors.push({ rule: "NET_OBJECT", message: "Each net must be an object." }); continue; }
    if (typeof net.id !== "string" || !net.id.trim()) errors.push({ rule: "NET_ID", message: "Each net must have a non-empty identifier." });
    else if (netIds.has(net.id)) errors.push({ rule: "DUPLICATE_NET_ID", message: `Net identifier ${net.id} is used more than once.` });
    netIds.add(net.id);
    if (!Array.isArray(net.endpoints)) { errors.push({ rule: "NET_ENDPOINTS_ARRAY", message: `Net ${net.id || "unnamed"} endpoints must be an array.` }); continue; }
    if (net.endpoints.length < 2) warnings.push({ rule: "NET_ENDPOINTS", message: `Net ${net.id || "unnamed"} has fewer than two endpoints.` });
    const localEndpoints = new Set();
    for (const endpoint of net.endpoints ?? []) {
      const [instanceId, pin] = String(endpoint).split(":");
      const component = components.find((item) => item?.instanceId === instanceId);
      const part = component && findLibraryPart(component.libraryId);
      if (!component || !part || !part.pins.includes(pin)) {
        errors.push({ rule: "NET_ENDPOINT", message: `Net ${net.id || "unnamed"} references an unknown endpoint (${endpoint}).` });
        continue;
      }
      if (localEndpoints.has(endpoint)) errors.push({ rule: "DUPLICATE_NET_ENDPOINT", message: `Net ${net.id || "unnamed"} connects ${endpoint} more than once.` });
      localEndpoints.add(endpoint);
      if (endpointOwners.has(endpoint) && endpointOwners.get(endpoint) !== net.id) {
        errors.push({ rule: "MULTI_NET_PIN", message: `${endpoint} is assigned to both ${endpointOwners.get(endpoint)} and ${net.id}.` });
      }
      endpointOwners.set(endpoint, net.id);
    }
  }
  for (const item of components) {
    if (!item || typeof item !== "object") continue;
    const part = findLibraryPart(item.libraryId);
    if (!part) continue;
    for (const pin of part.pins) {
      if (!endpointOwners.has(endpoint(item, pin))) warnings.push({ rule: "UNCONNECTED_PIN", message: `${item.reference} pin ${pin} is not connected to a project net.` });
    }
    if (item.libraryId === "power.dc-source") {
      const sourceIsShorted = nets.some((net) => Array.isArray(net?.endpoints) && net.endpoints.includes(endpoint(item, "+")) && net.endpoints.includes(endpoint(item, "-")));
      if (sourceIsShorted) errors.push({ rule: "SOURCE_SHORT", message: `${item.reference} positive and negative pins are connected to the same net.` });
    }
  }
  if (components.length && !components.some((item) => item?.libraryId === "ground.signal")) {
    warnings.push({ rule: "NO_REFERENCE", message: "The project has no signal-ground reference component." });
  }
  return { errors, warnings, valid: errors.length === 0 };
}

function hasNet(project, ...endpoints) {
  return project.nets.some((net) => endpoints.every((endpoint) => net.endpoints.includes(endpoint)));
}

function endpoint(component, pin) {
  return `${component.instanceId}:${pin}`;
}

function voltageValue(value) {
  return engineeringValue(value, "V");
}

function resistanceValue(value) {
  return engineeringValue(value, "Ω");
}

function forwardVoltage(value) {
  return engineeringValue(value, "V");
}

function engineeringValue(value, expectedUnit) {
  const match = String(value).trim().match(/^(?:[A-Za-z]+\s+)?([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*([pnumkKMGµμ]?)(?:\s*(Ω|ohms?|[Vv]))?$/);
  if (!match) return Number.NaN;
  const unit = match[3];
  if (unit) {
    const isOhm = unit === "Ω" || /^ohms?$/i.test(unit);
    if ((expectedUnit === "Ω" && !isOhm) || (expectedUnit === "V" && !/^[Vv]$/.test(unit))) return Number.NaN;
  }
  const multipliers = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, "μ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9, "": 1 };
  const parsed = Number(match[1]) * multipliers[match[2]];
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function runSupportedAnalysis(project) {
  const validation = validateProject(project);
  if (!validation.valid) return { state: "blocked", message: "Fix project errors before running analysis.", validation };
  const source = project.components.filter((item) => item.libraryId === "power.dc-source");
  const resistor = project.components.filter((item) => item.libraryId === "passive.resistor");
  const led = project.components.filter((item) => item.libraryId === "diode.led-red");
  const ground = project.components.filter((item) => item.libraryId === "ground.signal");
  if (source.length === 1 && resistor.length === 1 && led.length === 1 && ground.length >= 1) {
    return analyseLedCurrentLimiter(project, { source: source[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 2 && led.length === 0 && ground.length >= 1) {
    const divider = findVoltageDivider(project, source[0], resistor, ground[0]);
    if (divider) return analyseVoltageDivider(project, { source: source[0], ground: ground[0], validation, ...divider });
  }
  if (source.length === 1 && resistor.length > 0 && resistor.length === project.components.length - source.length - ground.length && ground.length >= 1) {
    return analyseResistiveNetwork(project, { source: source[0], resistors: resistor, ground: ground[0], validation });
  }
  return { state: "unsupported", message: "This foundation can analyse only the documented DC LED current-limiter and two-resistor DC voltage-divider topologies. General SPICE/digital simulation is not implemented.", validation };
}

function analyseResistiveNetwork(project, { source, resistors, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  if (!Number.isFinite(sourceVoltage)) return { state: "blocked", message: "The DC network needs one numeric source voltage.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  if (!groundNet || !sourcePositive || !sourceNegative || sourceNegative !== groundNet) {
    return { state: "blocked", message: "The supported resistive solver requires the DC source negative terminal and signal ground on the same reference net.", validation };
  }
  if (sourcePositive === groundNet) return { state: "blocked", message: "The source positive terminal is shorted to ground.", validation };

  const branches = [];
  for (const resistor of resistors) {
    const resistance = resistanceValue(resistor.value);
    const nodeA = netByEndpoint.get(endpoint(resistor, "1"));
    const nodeB = netByEndpoint.get(endpoint(resistor, "2"));
    if (!Number.isFinite(resistance) || resistance <= 0) return { state: "blocked", message: `${resistor.reference} needs a numeric positive resistance.`, validation };
    if (!nodeA || !nodeB) return { state: "blocked", message: `${resistor.reference} must connect both pins to named project nets.`, validation };
    if (nodeA === nodeB) return { state: "blocked", message: `${resistor.reference} is shorted by connecting both terminals to ${nodeA}.`, validation };
    branches.push({ reference: resistor.reference, nodeA, nodeB, resistance });
  }
  const nodes = [...new Set(branches.flatMap((branch) => [branch.nodeA, branch.nodeB]))]
    .filter((node) => node !== groundNet && node !== sourcePositive).sort();
  const matrix = nodes.map(() => Array(nodes.length).fill(0));
  const rhs = nodes.map(() => 0);
  const index = new Map(nodes.map((node, position) => [node, position]));
  for (const branch of branches) {
    const conductance = 1 / branch.resistance;
    const a = index.get(branch.nodeA);
    const b = index.get(branch.nodeB);
    if (a !== undefined) matrix[a][a] += conductance;
    if (b !== undefined) matrix[b][b] += conductance;
    if (a !== undefined && b !== undefined) { matrix[a][b] -= conductance; matrix[b][a] -= conductance; }
    if (a !== undefined && branch.nodeB === sourcePositive) rhs[a] += conductance * sourceVoltage;
    if (b !== undefined && branch.nodeA === sourcePositive) rhs[b] += conductance * sourceVoltage;
  }
  const solved = solveLinearSystem(matrix, rhs);
  if (!solved) return { state: "blocked", message: "The resistor network is floating, disconnected from the source/reference, or numerically singular.", validation };
  const nodeVoltages = Object.fromEntries([[groundNet, 0], [sourcePositive, sourceVoltage], ...nodes.map((node, position) => [node, solved[position]])]);
  const resistorResults = branches.map((branch) => {
    const voltage = nodeVoltages[branch.nodeA] - nodeVoltages[branch.nodeB];
    const currentA = voltage / branch.resistance;
    return { reference: branch.reference, voltage, currentA, powerW: currentA ** 2 * branch.resistance };
  });
  const sourceCurrentA = branches.reduce((sum, branch) => {
    if (branch.nodeA === sourcePositive) return sum + (sourceVoltage - nodeVoltages[branch.nodeB]) / branch.resistance;
    if (branch.nodeB === sourcePositive) return sum + (sourceVoltage - nodeVoltages[branch.nodeA]) / branch.resistance;
    return sum;
  }, 0);
  if (!Number.isFinite(sourceCurrentA) || sourceCurrentA < -1e-9) return { state: "blocked", message: "The network produced an invalid source-current result; check source polarity and topology.", validation };
  return {
    state: "complete",
    engine: "Linear DC resistive nodal analysis",
    message: "Solved the documented linear DC resistor network with one ideal voltage source. No reactive, nonlinear, thermal, transient, or general SPICE model is included.",
    result: { kind: "resistive-network", sourceVoltage, sourceCurrentA, sourcePowerW: sourceVoltage * sourceCurrentA, nodeVoltages, resistors: resistorResults },
    validation
  };
}

function solveLinearSystem(matrix, rhs) {
  const size = rhs.length;
  if (size === 0) return [];
  const augmented = matrix.map((row, index) => [...row, rhs[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    if (Math.abs(augmented[pivot][column]) < 1e-12) return null;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const divisor = augmented[column][column];
    for (let item = column; item <= size; item += 1) augmented[column][item] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let item = column; item <= size; item += 1) augmented[row][item] -= factor * augmented[column][item];
    }
  }
  return augmented.map((row) => row[size]);
}

function analyseLedCurrentLimiter(project, { source, resistor, led, ground, validation }) {
  const topologyIsSupported = hasNet(project, endpoint(source, "+"), endpoint(resistor, "1"))
    && hasNet(project, endpoint(resistor, "2"), endpoint(led, "A"))
    && hasNet(project, endpoint(led, "K"), endpoint(source, "-"), endpoint(ground, "0"));
  if (!topologyIsSupported) {
    return { state: "blocked", message: "The analytical LED calculation requires its documented source → resistor → LED → ground topology. The current netlist is not that topology.", validation };
  }
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const ledVf = forwardVoltage(led.value);
  if (!Number.isFinite(sourceVoltage) || !Number.isFinite(resistance) || !Number.isFinite(ledVf) || resistance <= 0 || ledVf <= 0) {
    return { state: "blocked", message: "The demo needs a numeric source voltage, positive resistance, and positive LED forward voltage.", validation };
  }
  const currentA = Math.max(0, (sourceVoltage - ledVf) / resistance);
  const resistorPowerW = currentA ** 2 * resistance;
  return {
    state: "complete",
    engine: "Analytical DC LED demonstration",
    message: "Completed an analytical DC calculation; this is not a general SPICE result.",
    result: { kind: "led-current-limiter", sourceVoltage, resistance, ledVf, currentA, resistorPowerW, ledOn: currentA > 0.0005 },
    validation
  };
}

function findVoltageDivider(project, source, resistors, ground) {
  for (const upper of resistors) {
    const lower = resistors.find((candidate) => candidate.instanceId !== upper.instanceId);
    if (!lower) continue;
    const topologyIsSupported = hasNet(project, endpoint(source, "+"), endpoint(upper, "1"))
      && hasNet(project, endpoint(upper, "2"), endpoint(lower, "1"))
      && hasNet(project, endpoint(lower, "2"), endpoint(source, "-"), endpoint(ground, "0"));
    if (topologyIsSupported) return { upper, lower };
  }
  return null;
}

function analyseVoltageDivider(project, { source, upper, lower, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const upperResistance = resistanceValue(upper.value);
  const lowerResistance = resistanceValue(lower.value);
  if (!Number.isFinite(sourceVoltage) || !Number.isFinite(upperResistance) || !Number.isFinite(lowerResistance) || upperResistance <= 0 || lowerResistance <= 0) {
    return { state: "blocked", message: "The voltage-divider calculation needs a numeric source voltage and two positive resistor values.", validation };
  }
  const totalResistance = upperResistance + lowerResistance;
  const currentA = sourceVoltage / totalResistance;
  const outputVoltage = currentA * lowerResistance;
  return {
    state: "complete",
    engine: "Analytical DC voltage-divider calculation",
    message: "Completed an unloaded two-resistor analytical DC calculation; this is not a general SPICE result.",
    result: { kind: "voltage-divider", sourceVoltage, upperResistance, lowerResistance, totalResistance, currentA, outputVoltage, totalPowerW: sourceVoltage * currentA },
    validation
  };
}

export function serializeProject(project) {
  return JSON.stringify(project, null, 2);
}

export function parseProject(text) {
  const project = JSON.parse(text);
  const validation = validateProject(project);
  if (!validation.valid) throw new Error(validation.errors.map((issue) => issue.message).join(" "));
  return project;
}

