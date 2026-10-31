export const SCHEMA_VERSION = 1;
export const DESIGN_VIEWS = Object.freeze(["breadboard", "schematic", "pcb"]);
const UI_LOCALES_FOR_PROJECT = Object.freeze(["en", "de", "yo", "pcm"]);
const CANVAS_LIMITS = Object.freeze({ x: [28, 604], y: [48, 244], overlapDistance: 34 });

export const STARTER_LIBRARY = Object.freeze([
  { id: "power.dc-source", category: "Power & Ground", type: "DC voltage source", prefix: "V", pins: ["+", "-"], defaultValue: "5 V", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.usb-source", category: "Power & Ground", type: "USB 5 V supply model", prefix: "USB", pins: ["+", "-"], defaultValue: "5 V", simulation: "analytical-usb-led-ptc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.solar-cell", category: "Power & Ground", type: "Solar cell (linear I–V estimate)", prefix: "PV", pins: ["+", "-"], defaultValue: "Voc 6 V; Isc 100 mA", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.rechargeable-battery", category: "Power & Ground", type: "Rechargeable battery (fixed-voltage model)", prefix: "BAT", pins: ["+", "-"], defaultValue: "3.7 V", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.pwm-source", category: "Inputs", type: "PWM control source", prefix: "PWM", pins: ["+", "-"], defaultValue: "1 kHz, 50%, 5 V", simulation: "analytical-pwm-led-average", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.dc-current-source", category: "Power & Ground", type: "DC current source (positive current flows from − to +)", prefix: "I", pins: ["+", "-"], defaultValue: "1 mA", simulation: "mna-linear-dc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "power.ac-source", category: "Power & Ground", type: "AC voltage source", prefix: "V", pins: ["+", "-"], defaultValue: "1 V", simulation: "analytical-rc-low-pass", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.resistor", category: "Passive", type: "Resistor", prefix: "R", pins: ["1", "2"], defaultValue: "330 Ω", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.capacitor", category: "Passive", type: "Capacitor", prefix: "C", pins: ["1", "2"], defaultValue: "100 µF", simulation: "analytical-rc-step", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.supercapacitor", category: "Passive", type: "Supercapacitor (ideal RC hold-up model)", prefix: "C", pins: ["+", "-"], defaultValue: "C 1 F; Vstart 4.7 V; Vmin 3 V; Vmax 5 V", simulation: "analytical-supercap-hold-up", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.inductor", category: "Passive", type: "Inductor", prefix: "L", pins: ["1", "2"], defaultValue: "100 mH", simulation: "analytical-rl-step", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.transformer-ideal", category: "Passive", type: "Ideal transformer ratio model", prefix: "T", pins: ["PRI1", "PRI2", "SEC1", "SEC2"], defaultValue: "230:12", simulation: "analytical-regulated-supply", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.ldr", category: "Passive", type: "Photoresistor (light-dependent resistor)", prefix: "R", pins: ["1", "2"], defaultValue: "Rbright 10 kΩ; Rdark 1 MΩ; light 100%", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.ntc-thermistor", category: "Sensors", type: "NTC thermistor (Beta-model estimate)", prefix: "TH", pins: ["1", "2"], defaultValue: "R25 10 kΩ; B 3950 K; temp 25 °C", simulation: "analytical-ntc-divider", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "passive.potentiometer", category: "Passive", type: "Potentiometer (two-terminal rheostat model)", prefix: "RP", pins: ["1", "2"], defaultValue: "Rmax 10 kΩ; position 50%", simulation: "analytical-passive-tone-control", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.bridge-ideal", category: "Active", type: "Ideal bridge rectifier (fixed diode drop)", prefix: "BR", pins: ["AC1", "AC2", "POS", "NEG"], defaultValue: "0.7 V", simulation: "analytical-regulated-supply", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.zener-ideal", category: "Active", type: "Zener diode (ideal shunt-clamp model)", prefix: "DZ", pins: ["K", "A"], defaultValue: "Vz 5.1 V; Pmax 0.5 W", simulation: "analytical-zener-shunt", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "protection.tvs-ideal", category: "Protection", type: "TVS diode (ideal transient-clamp estimate)", prefix: "D", pins: ["K", "A"], defaultValue: "Vclamp 18 V; Pmax 12 W; Emax 0.01 J", simulation: "analytical-tvs-pulse", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.schottky", category: "Active", type: "Schottky diode (fixed-drop estimate)", prefix: "D", pins: ["A", "K"], defaultValue: "Vf 0.3 V", simulation: "analytical-solar-garden-light", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.led-red", category: "Active", type: "Red LED", prefix: "D", pins: ["A", "K"], defaultValue: "Vf 2.0 V", simulation: "analytical-led-demo", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.nmos-switch", category: "Active", type: "N-channel MOSFET (ideal PWM switch)", prefix: "Q", pins: ["G", "D", "S"], defaultValue: "Vth 2.0 V", simulation: "analytical-pwm-led-average", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "diode.led-green", category: "Active", type: "Green LED", prefix: "D", pins: ["A", "K"], defaultValue: "Vf 2.1 V", simulation: "analytical-polarity-indicator", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "ground.signal", category: "Power & Ground", type: "Signal ground", prefix: "GND", pins: ["0"], defaultValue: "0 V", simulation: "reference", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.pushbutton", category: "Inputs", type: "Momentary pushbutton", prefix: "SW", pins: ["1", "2"], defaultValue: "Normally open", simulation: "ideal-switch-analytical-led", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "input.spdt-switch", category: "Inputs", type: "SPDT switch", prefix: "SW", pins: ["COM", "A", "B"], defaultValue: "Charge (A)", simulation: "analytical-rc-charge-discharge/ideal-latching-led", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.comparator-ideal", category: "Active", type: "Ideal low-battery comparator model", prefix: "U", pins: ["VCC", "GND", "SENSE", "OUT"], defaultValue: "Vref 3.75 V", simulation: "analytical-battery-monitor", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "active.regulator-7805-ideal", category: "Active", type: "Ideal 7805-class linear regulator model", prefix: "U", pins: ["IN", "OUT", "GND"], defaultValue: "Vout 5 V; dropout 2 V", simulation: "analytical-regulated-supply", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
  { id: "protection.ptc-polyfuse", category: "Active", type: "Resettable PTC fuse (cold-state estimate)", prefix: "F", pins: ["1", "2"], defaultValue: "Ihold 0.5 A; Rcold 0.1 Ω", simulation: "analytical-usb-led-ptc", status: "starter generic", views: { breadboard: true, schematic: true, pcb: false } },
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

export function createEmptyProject({ name = "Untitled Circuit", locale = "en" } = {}) {
  const project = {
    schemaVersion: SCHEMA_VERSION,
    id: cryptoSafeId(),
    metadata: { ...projectMetadata(name), locale },
    components: [],
    nets: [],
    history: []
  };
  return project;
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
  const positions = Object.fromEntries(DESIGN_VIEWS.map((view) => [view, nextFreePosition(project, view)]));
  const item = {
    instanceId: cryptoSafeId(),
    libraryId,
    reference: nextReference(project, libraryId),
    value: part.defaultValue,
    position: positions
  };
  return { ...project, components: [...project.components, item], metadata: { ...project.metadata, updatedAt: new Date().toISOString() } };
}

function nextFreePosition(project, view) {
  const existing = (project.components ?? []).map((item) => item.position?.[view]).filter((position) => Array.isArray(position) && position.length === 2);
  const candidates = [];
  for (let y = 60; y <= 228; y += 48) for (let x = 48; x <= 600; x += 72) candidates.push([x, y]);
  return candidates.find(([x, y]) => existing.every(([otherX, otherY]) => Math.hypot(x - otherX, y - otherY) >= CANVAS_LIMITS.overlapDistance)) ?? [48, 228];
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

export function removeComponent(project, instanceId) {
  if (!project.components.some((item) => item.instanceId === instanceId)) throw new Error(`Component not found: ${instanceId}`);
  const next = clone(project);
  next.components = next.components.filter((item) => item.instanceId !== instanceId);
  next.nets = next.nets.flatMap((net) => {
    const endpoints = net.endpoints.filter((item) => !item.startsWith(`${instanceId}:`));
    return endpoints.length >= 2 ? [{ ...net, endpoints }] : [];
  });
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
      if (!Array.isArray(position) || position.length !== 2 || !position.every((coordinate) => Number.isFinite(coordinate) && Number.isSafeInteger(coordinate))) {
        errors.push({ rule: "LAYOUT_POSITION", message: `${item.reference || "Component"} must have two finite integer coordinates for the ${view} layout.` });
      } else if (position[0] < 0 || position[0] > 640 || position[1] < 0 || position[1] > 280) {
        errors.push({ rule: "LAYOUT_BOUNDS", message: `${item.reference || "Component"} is outside the supported ${view} canvas bounds.` });
      }
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
        if (!Array.isArray(aPosition) || !Array.isArray(bPosition) || !aPosition.every(Number.isFinite) || !bPosition.every(Number.isFinite)) continue;
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

function capacitanceValue(value) {
  return engineeringValue(value, "F");
}

function inductanceValue(value) {
  return engineeringValue(value, "H");
}

function currentValue(value) {
  return engineeringValue(value, "A");
}

function frequencyValue(value) {
  return engineeringValue(value, "Hz");
}

function forwardVoltage(value) {
  return engineeringValue(value, "V");
}

function engineeringValue(value, expectedUnit) {
  const match = String(value).trim().match(/^(?:[A-Za-z]+\s+)?([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*([pnumkKMGµμ]?)(?:\s*(Ω|ohms?|[VvFfHhAa]|[Hh][Zz]))?$/);
  if (!match) return Number.NaN;
  const unit = match[3];
  if (unit) {
    const isOhm = unit === "Ω" || /^ohms?$/i.test(unit);
    if ((expectedUnit === "Ω" && !isOhm) || (expectedUnit === "V" && !/^[Vv]$/.test(unit)) || (expectedUnit === "F" && !/^[Ff]$/.test(unit)) || (expectedUnit === "H" && !/^[Hh]$/.test(unit)) || (expectedUnit === "A" && !/^[Aa]$/.test(unit)) || (expectedUnit === "Hz" && !/^[Hh][Zz]$/.test(unit))) return Number.NaN;
  }
  const multipliers = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, "μ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9, "": 1 };
  const parsed = Number(match[1]) * multipliers[match[2]];
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function runSupportedAnalysis(project) {
  const validation = validateProject(project);
  if (!validation.valid) return { state: "blocked", message: "Fix project errors before running analysis.", validation };
  const source = project.components.filter((item) => item.libraryId === "power.dc-source");
  const comparators = project.components.filter((item) => item.libraryId === "active.comparator-ideal");
  const pwmSources = project.components.filter((item) => item.libraryId === "power.pwm-source");
  const mosfets = project.components.filter((item) => item.libraryId === "active.nmos-switch");
  const transformers = project.components.filter((item) => item.libraryId === "passive.transformer-ideal");
  const bridges = project.components.filter((item) => item.libraryId === "diode.bridge-ideal");
  const zeners = project.components.filter((item) => item.libraryId === "diode.zener-ideal");
  const tvsDiodes = project.components.filter((item) => item.libraryId === "protection.tvs-ideal");

  const regulators = project.components.filter((item) => item.libraryId === "active.regulator-7805-ideal");
  const usbSources = project.components.filter((item) => item.libraryId === "power.usb-source");
  const ptcFuses = project.components.filter((item) => item.libraryId === "protection.ptc-polyfuse");
  const solarCells = project.components.filter((item) => item.libraryId === "power.solar-cell");
  const batteries = project.components.filter((item) => item.libraryId === "power.rechargeable-battery");
  const photoresistors = project.components.filter((item) => item.libraryId === "passive.ldr");
  const ntcs = project.components.filter((item) => item.libraryId === "passive.ntc-thermistor");
  const supercapacitors = project.components.filter((item) => item.libraryId === "passive.supercapacitor");
  const toneControls = project.components.filter((item) => item.libraryId === "passive.potentiometer");
  const schottkyDiodes = project.components.filter((item) => item.libraryId === "diode.schottky");
  const currentSource = project.components.filter((item) => item.libraryId === "power.dc-current-source");
  const acSource = project.components.filter((item) => item.libraryId === "power.ac-source");
  const resistor = project.components.filter((item) => item.libraryId === "passive.resistor");
  const capacitor = project.components.filter((item) => item.libraryId === "passive.capacitor");
  const inductor = project.components.filter((item) => item.libraryId === "passive.inductor");
  const switches = project.components.filter((item) => item.libraryId === "input.spdt-switch");
  const pushbuttons = project.components.filter((item) => item.libraryId === "input.pushbutton");
  const led = project.components.filter((item) => item.libraryId === "diode.led-red");
  const greenLed = project.components.filter((item) => item.libraryId === "diode.led-green");
  const ground = project.components.filter((item) => item.libraryId === "ground.signal");
  if (source.length === 1 && tvsDiodes.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 5) {
    return analyseTvsPulseClamp(project, { source: source[0], resistors: resistor, tvs: tvsDiodes[0], ground: ground[0], validation });
  }
  if (source.length === 1 && ntcs.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 4) {
    return analyseNtcTemperatureDivider(project, { source: source[0], ntc: ntcs[0], resistor: resistor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && zeners.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 5) {
    return analyseZenerShuntRegulator(project, { source: source[0], resistors: resistor, zener: zeners[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && bridges.length === 1 && resistor.length === 1 && capacitor.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseBridgeSmoothingCapacitor(project, { source: acSource[0], bridge: bridges[0], load: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && bridges.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 4) {
    return analyseBridgeRectifier(project, { source: acSource[0], bridge: bridges[0], load: resistor[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && toneControls.length === 1 && capacitor.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analysePassiveToneControl(project, { source: acSource[0], control: toneControls[0], capacitor: capacitor[0], load: resistor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && schottkyDiodes.length === 1 && supercapacitors.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseSupercapHoldUp(project, { source: source[0], diode: schottkyDiodes[0], capacitor: supercapacitors[0], load: resistor[0], ground: ground[0], validation });
  }
  if (solarCells.length === 1 && batteries.length === 1 && photoresistors.length === 1 && schottkyDiodes.length === 1 && mosfets.length === 1 && led.length === 1 && resistor.length === 2 && ground.length === 1 && project.components.length === 9) {
    return analyseSolarGardenLight(project, { solar: solarCells[0], battery: batteries[0], ldr: photoresistors[0], diode: schottkyDiodes[0], mosfet: mosfets[0], led: led[0], resistors: resistor, ground: ground[0], validation });
  }
  if (usbSources.length === 1 && ptcFuses.length === 1 && resistor.length === 1 && led.length === 1 && ground.length === 1 && project.components.length === 5) {
    return analyseUsbLedPtc(project, { source: usbSources[0], fuse: ptcFuses[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (acSource.length === 1 && transformers.length === 1 && bridges.length === 1 && regulators.length === 1 && capacitor.length === 1 && resistor.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseLinearSupply(project, { source: acSource[0], transformer: transformers[0], bridge: bridges[0], capacitor: capacitor[0], regulator: regulators[0], load: resistor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 3 && led.length === 1 && comparators.length === 1 && ground.length === 1 && project.components.length === 7) {
    return analyseBatteryDischargeMonitor(project, { source: source[0], resistors: resistor, led: led[0], comparator: comparators[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && led.length === 1 && pwmSources.length === 1 && mosfets.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analysePwmLedAverage(project, { source: source[0], resistor: resistor[0], led: led[0], pwmSource: pwmSources[0], mosfet: mosfets[0], ground: ground[0], validation });
  }
  if (currentSource.length > 0 && !project.components.every((item) => ["power.dc-source", "power.dc-current-source", "passive.resistor", "ground.signal"].includes(item.libraryId))) {
    return { state: "unsupported", message: "This DC current-source model supports resistor networks with ideal voltage/current sources only; reactive or nonlinear parts are not solved by this analysis.", validation };
  }
  if (source.length === 1 && resistor.length === 2 && led.length === 1 && greenLed.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analyseLedPolarityIndicator(project, { source: source[0], resistors: resistor, redLed: led[0], greenLed: greenLed[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && led.length === 1 && switches.length === 1 && pushbuttons.length === 0 && ground.length === 1 && greenLed.length === 0 && project.components.length === 5) {
    return analyseLatchingLedSwitch(project, { source: source[0], resistor: resistor[0], led: led[0], switchPart: switches[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 2 && led.length === 1 && pushbuttons.length === 1 && ground.length === 1 && project.components.length === 6) {
    return analysePushbuttonLed(project, { source: source[0], resistors: resistor, led: led[0], pushbutton: pushbuttons[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && led.length === 1 && pushbuttons.length === 0 && ground.length === 1 && project.components.length === 4) {
    return analyseLedCurrentLimiter(project, { source: source[0], resistor: resistor[0], led: led[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 2 && led.length === 0 && ground.length >= 1) {
    const divider = findVoltageDivider(project, source[0], resistor, ground[0]);
    if (divider) return analyseVoltageDivider(project, { source: source[0], ground: ground[0], validation, ...divider });
  }
  if (source.length === 1 && resistor.length === 1 && capacitor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) return analyseRcStep(project, { source: source[0], resistor: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
  if (source.length === 1 && resistor.length === 1 && capacitor.length === 1 && switches.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 5) return analyseRcSwitchedResponse(project, { source: source[0], resistor: resistor[0], capacitor: capacitor[0], switchPart: switches[0], ground: ground[0], validation });
  if (acSource.length === 1 && source.length === 0 && resistor.length === 1 && inductor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) return analyseRlLowPass(project, { source: acSource[0], resistor: resistor[0], inductor: inductor[0], ground: ground[0], validation });
  if (acSource.length === 1 && source.length === 0 && resistor.length === 1 && capacitor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) {
    const highPass = analyseRcHighPass(project, { source: acSource[0], resistor: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
    if (highPass) return highPass;
    return analyseRcLowPass(project, { source: acSource[0], resistor: resistor[0], capacitor: capacitor[0], ground: ground[0], validation });
  }
  if (source.length === 1 && resistor.length === 1 && inductor.length === 1 && led.length === 0 && ground.length === 1 && project.components.length === 4) return analyseRlStep(project, { source: source[0], resistor: resistor[0], inductor: inductor[0], ground: ground[0], validation });
  if (source.length === 1 && resistor.length > 0 && resistor.length === project.components.length - source.length - ground.length && ground.length >= 1) {
    return analyseResistiveNetwork(project, { source: source[0], resistors: resistor, ground: ground[0], validation });
  }
  if ((source.length > 1 || currentSource.length > 0) && resistor.length > 0 && ground.length === 1
    && project.components.every((item) => ["power.dc-source", "power.dc-current-source", "passive.resistor", "ground.signal"].includes(item.libraryId))) {
    return analyseMultiSourceResistiveNetwork(project, { sources: source, currentSources: currentSource, resistors: resistor, ground: ground[0], validation });
  }
  return { state: "unsupported", message: "This foundation supports only documented analytical DC circuits, linear resistor networks with ideal voltage/current sources, single-pole RC/RL step responses, and first-order RC/RL low-pass or RC high-pass frequency responses. General SPICE, nonlinear, digital, and mixed-signal simulation is not implemented.", validation };
}

function analysePwmLedAverage(project, { source, resistor, led, pwmSource, mosfet, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const resistance = resistanceValue(resistor.value);
  const thresholdVoltage = voltageValue(mosfet.value);
  const pwmFields = String(pwmSource.value).split(",").map((field) => field.trim());
  const frequencyHz = pwmFields.length === 3 ? frequencyValue(pwmFields[0]) : Number.NaN;
  const dutyMatch = pwmFields.length === 3 ? pwmFields[1].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))%$/) : null;
  const requestedDutyPercent = dutyMatch ? Number(dutyMatch[1]) : Number.NaN;
  const gateHighVoltage = pwmFields.length === 3 ? voltageValue(pwmFields[2]) : Number.NaN;
  if (![sourceVoltage, ledVf, resistance, thresholdVoltage, frequencyHz, requestedDutyPercent, gateHighVoltage].every(Number.isFinite)
    || sourceVoltage <= 0 || ledVf <= 0 || resistance <= 0 || thresholdVoltage < 0 || frequencyHz <= 0
    || requestedDutyPercent < 0 || requestedDutyPercent > 100 || gateHighVoltage < 0) {
    return { state: "blocked", message: "The PWM LED model requires positive supply, LED, resistor, threshold and frequency values, plus duty from 0% to 100% and non-negative gate voltage.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  const mosfetDrain = netByEndpoint.get(endpoint(mosfet, "D"));
  const mosfetSource = netByEndpoint.get(endpoint(mosfet, "S"));
  const mosfetGate = netByEndpoint.get(endpoint(mosfet, "G"));
  const pwmPositive = netByEndpoint.get(endpoint(pwmSource, "+"));
  const pwmNegative = netByEndpoint.get(endpoint(pwmSource, "-"));
  if (!sourcePositive || sourcePositive === groundNet || sourcePositive !== resistorInput || !resistorOutput
    || resistorOutput !== ledAnode || !ledCathode || ledCathode !== mosfetDrain || !mosfetSource
    || mosfetSource !== groundNet || sourceNegative !== groundNet || pwmNegative !== groundNet
    || !mosfetGate || pwmPositive !== mosfetGate) {
    return { state: "blocked", message: "Wire source positive through the resistor and LED to MOSFET drain, MOSFET source to shared ground, and PWM positive to gate with PWM negative on ground.", validation };
  }

  const gateEnabled = gateHighVoltage > thresholdVoltage;
  const effectiveDutyFraction = gateEnabled ? requestedDutyPercent / 100 : 0;
  const onCurrentA = Math.max(0, (sourceVoltage - ledVf) / resistance);
  const averageCurrentA = effectiveDutyFraction * onCurrentA;
  const resistorPowerW = effectiveDutyFraction * onCurrentA ** 2 * resistance;
  const ledPowerW = effectiveDutyFraction * onCurrentA * ledVf;
  const sourcePowerW = effectiveDutyFraction * sourceVoltage * onCurrentA;
  if (![onCurrentA, averageCurrentA, resistorPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The PWM LED result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical PWM LED average-current model",
    message: "Calculated average current for an ideal low-side MOSFET PWM LED switch. This model does not simulate a waveform, switching transients, MOSFET on-resistance, gate charge, current ripple, thermal behavior, device ratings, or general SPICE.",
    result: {
      kind: "pwm-led-average",
      sourceVoltage,
      ledVf,
      resistance,
      frequencyHz,
      requestedDutyPercent,
      effectiveDutyFraction,
      gateHighVoltage,
      thresholdVoltage,
      mosfetConducting: gateEnabled,
      onCurrentA,
      averageCurrentA,
      resistorPowerW,
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - resistorPowerW - ledPowerW
    },
    validation
  };
}

function analyseBatteryDischargeMonitor(project, { source, resistors, led, comparator, ground, validation }) {
  const batteryVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const tripVoltage = voltageValue(comparator.value);
  if (![batteryVoltage, ledVf, tripVoltage].every(Number.isFinite) || batteryVoltage <= 0 || ledVf <= 0 || tripVoltage <= 0) {
    return { state: "blocked", message: "The battery monitor requires positive numeric battery, reference threshold, and LED forward voltages.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const batteryNet = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const comparatorSupply = netByEndpoint.get(endpoint(comparator, "VCC"));
  const comparatorGround = netByEndpoint.get(endpoint(comparator, "GND"));
  const senseNet = netByEndpoint.get(endpoint(comparator, "SENSE"));
  const outputNet = netByEndpoint.get(endpoint(comparator, "OUT"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  if (!batteryNet || batteryNet === groundNet || sourceNegative !== groundNet || comparatorSupply !== batteryNet
    || comparatorGround !== groundNet || !senseNet || senseNet === batteryNet || senseNet === groundNet
    || !outputNet || outputNet === groundNet || ledCathode !== groundNet) {
    return { state: "blocked", message: "Wire the battery to comparator supply, divider and shared ground; connect the divider midpoint to SENSE and comparator OUT through the LED resistor and LED to ground.", validation };
  }
  const between = (part, netA, netB) => {
    const a = netByEndpoint.get(endpoint(part, "1"));
    const b = netByEndpoint.get(endpoint(part, "2"));
    return (a === netA && b === netB) || (a === netB && b === netA);
  };
  const upperDivider = resistors.find(part => between(part, batteryNet, senseNet));
  const lowerDivider = resistors.find(part => part !== upperDivider && between(part, senseNet, groundNet));
  const ledResistor = resistors.find(part => part !== upperDivider && part !== lowerDivider && between(part, outputNet, ledAnode));
  if (!upperDivider || !lowerDivider || !ledResistor) {
    return { state: "blocked", message: "The monitor needs a battery-to-sense upper resistor, a sense-to-ground lower resistor, and a separate comparator-output LED resistor.", validation };
  }
  const upperResistance = resistanceValue(upperDivider.value);
  const lowerResistance = resistanceValue(lowerDivider.value);
  const ledResistance = resistanceValue(ledResistor.value);
  if (![upperResistance, lowerResistance, ledResistance].every(Number.isFinite) || upperResistance <= 0 || lowerResistance <= 0 || ledResistance <= 0) {
    return { state: "blocked", message: "Both divider resistors and the LED series resistor must have positive numeric resistance values.", validation };
  }
  const dividerResistance = upperResistance + lowerResistance;
  const dividerCurrentA = batteryVoltage / dividerResistance;
  const senseVoltage = batteryVoltage * lowerResistance / dividerResistance;
  const tripBatteryVoltage = tripVoltage * dividerResistance / lowerResistance;
  const lowBattery = senseVoltage < tripVoltage;
  const comparatorOutputVoltage = lowBattery ? batteryVoltage : 0;
  const ledCurrentA = lowBattery ? Math.max(0, (comparatorOutputVoltage - ledVf) / ledResistance) : 0;
  const dividerPowerW = dividerCurrentA ** 2 * dividerResistance;
  const ledResistorPowerW = ledCurrentA ** 2 * ledResistance;
  const ledPowerW = ledCurrentA * ledVf;
  const sourceCurrentA = dividerCurrentA + ledCurrentA;
  const sourcePowerW = batteryVoltage * sourceCurrentA;
  const powerBalanceW = sourcePowerW - dividerPowerW - ledResistorPowerW - ledPowerW;
  if (![dividerCurrentA, senseVoltage, tripBatteryVoltage, ledCurrentA, dividerPowerW, ledResistorPowerW, ledPowerW, sourceCurrentA, sourcePowerW, powerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The battery monitor result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical ideal low-battery comparator and divider",
    message: "Compared a divided battery voltage with an ideal fixed reference and calculated an LED alarm output below the trip point. The generic comparator model omits hysteresis, input bias/offset, propagation delay, output-current limits, dropout, battery chemistry, tolerance, temperature, device ratings, and general SPICE.",
    result: { kind: "battery-discharge-monitor", batteryVoltage, upperResistance, lowerResistance, ledResistance, dividerCurrentA, senseVoltage, tripVoltage, tripBatteryVoltage, lowBattery, comparatorOutputVoltage, ledOn: ledCurrentA > 0.0005, ledCurrentA, sourceCurrentA, dividerPowerW, ledResistorPowerW, ledPowerW, sourcePowerW, powerBalanceW },
    validation
  };
}

function analyseBridgeRectifier(project, { source, bridge, load, ground, validation }) {
  const sourceFields = String(source.value).split(",").map(field => field.trim());
  const rmsMatch = sourceFields.length === 2 ? sourceFields[0].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*RMS$/i) : null;
  const sourceRmsVoltage = rmsMatch ? Number(rmsMatch[1]) : Number.NaN;
  const inputFrequencyHz = sourceFields.length === 2 ? frequencyValue(sourceFields[1]) : Number.NaN;
  const diodeDrop = voltageValue(bridge.value);
  const loadResistance = resistanceValue(load.value);
  if (![sourceRmsVoltage, inputFrequencyHz, diodeDrop, loadResistance].every(Number.isFinite)
    || sourceRmsVoltage <= 0 || inputFrequencyHz <= 0 || diodeDrop <= 0 || loadResistance <= 0) {
    return { state: "blocked", message: "The bridge model requires positive AC RMS voltage, input frequency, conducting diode drop, and load resistance.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const ac1 = n(bridge, "AC1"), ac2 = n(bridge, "AC2");
  const positive = n(bridge, "POS"), negative = n(bridge, "NEG");
  const loadPositive = n(load, "1"), loadNegative = n(load, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== ac1 || sourceNegative !== ac2
    || !positive || positive === negative || loadPositive !== positive || negative !== groundNet || loadNegative !== groundNet) {
    return { state: "blocked", message: "Connect the AC source across the bridge AC inputs; connect the load across bridge positive and negative, with bridge negative referenced to ground.", validation };
  }
  const peakInputVoltage = sourceRmsVoltage * Math.SQRT2;
  const peakOutputVoltage = Math.max(0, peakInputVoltage - 2 * diodeDrop);
  const rectifiedFrequencyHz = 2 * inputFrequencyHz;
  const durationS = 2 / inputFrequencyHz;
  const intervals = 480;
  const stepS = durationS / intervals;
  const pointAt = index => {
    const timeS = index * stepS;
    const inputVoltage = peakInputVoltage * Math.sin(2 * Math.PI * inputFrequencyHz * timeS);
    const outputVoltage = Math.max(0, Math.abs(inputVoltage) - 2 * diodeDrop);
    return { timeS, inputVoltage, outputVoltage, loadCurrentA: outputVoltage / loadResistance };
  };
  const waveform = [];
  let averageVoltageIntegral = 0, rmsVoltageIntegral = 0, sourcePowerIntegral = 0;
  let previous = pointAt(0);
  waveform.push(previous);
  for (let i = 1; i <= intervals; i += 1) {
    const current = pointAt(i);
    const weight = i === intervals ? 0.5 : 1;
    const previousWeight = i === 1 ? 0.5 : 1;
    averageVoltageIntegral += (previous.outputVoltage * previousWeight + current.outputVoltage * weight) * stepS / 2;
    rmsVoltageIntegral += (previous.outputVoltage ** 2 * previousWeight + current.outputVoltage ** 2 * weight) * stepS / 2;
    const previousPower = Math.abs(previous.inputVoltage) * previous.loadCurrentA;
    const currentPower = Math.abs(current.inputVoltage) * current.loadCurrentA;
    sourcePowerIntegral += (previousPower * previousWeight + currentPower * weight) * stepS / 2;
    if (i % 5 === 0 || i === intervals) waveform.push(current);
    previous = current;
  }
  const averageOutputVoltage = averageVoltageIntegral / durationS;
  const rmsOutputVoltage = Math.sqrt(rmsVoltageIntegral / durationS);
  const averageLoadCurrentA = averageOutputVoltage / loadResistance;
  const averageLoadPowerW = rmsOutputVoltage ** 2 / loadResistance;
  const estimatedSourcePowerW = sourcePowerIntegral / durationS;
  const bridgeDissipationW = estimatedSourcePowerW - averageLoadPowerW;
  const powerBalanceW = estimatedSourcePowerW - averageLoadPowerW - bridgeDissipationW;
  if (![peakInputVoltage, peakOutputVoltage, rectifiedFrequencyHz, averageOutputVoltage, rmsOutputVoltage, averageLoadCurrentA, averageLoadPowerW, estimatedSourcePowerW, bridgeDissipationW, powerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The bridge waveform exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical full-wave bridge waveform with fixed diode drops",
    message: "Generated a sampled full-wave rectified load waveform with two conducting diode drops. No smoothing capacitor is present. Diode switching, reverse recovery, source impedance, transformer behavior, component tolerance, thermal effects, ratings, and general SPICE are not modeled.",
    result: { kind: "bridge-rectifier-waveform", sourceRmsVoltage, inputFrequencyHz, peakInputVoltage, diodeDropEach: diodeDrop, peakOutputVoltage, rectifiedFrequencyHz, rippleFrequencyHz: rectifiedFrequencyHz, loadResistance, averageOutputVoltage, rmsOutputVoltage, averageLoadCurrentA, averageLoadPowerW, estimatedSourcePowerW, bridgeDissipationW, powerBalanceW, waveform },
    validation
  };
}

function analyseNtcTemperatureDivider(project, { source, ntc, resistor, ground, validation }) {
  const supplyVoltage = voltageValue(source.value);
  const fields = String(ntc.value).split(";").map(field => field.trim());
  const r25Text = fields[0]?.match(/^R25\s*(.+)$/i)?.[1];
  const betaText = fields[1]?.match(/^B\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*K$/i)?.[1];
  const temperatureText = fields[2]?.match(/^temp\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*°C$/i)?.[1];
  const r25Ohm = r25Text ? resistanceValue(r25Text) : Number.NaN;
  const betaK = betaText ? Number(betaText) : Number.NaN;
  const temperatureC = temperatureText ? Number(temperatureText) : Number.NaN;
  const fixedResistance = resistanceValue(resistor.value);
  if (![supplyVoltage, r25Ohm, betaK, temperatureC, fixedResistance].every(Number.isFinite)
    || supplyVoltage <= 0 || r25Ohm <= 0 || betaK <= 0 || temperatureC <= -273.15 || fixedResistance <= 0) {
    return { state: "blocked", message: "The NTC divider needs positive supply, R25, Beta, and fixed resistance values plus a temperature above absolute zero.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const supplyPositive = n(source, "+"), supplyNegative = n(source, "-");
  const ntcInput = n(ntc, "1"), ntcOutput = n(ntc, "2");
  const resistorInput = n(resistor, "1"), resistorOutput = n(resistor, "2"), groundNet = n(ground, "0");
  if (!supplyPositive || supplyPositive === supplyNegative || supplyPositive !== ntcInput
    || !ntcOutput || ntcOutput !== resistorInput || !groundNet || supplyNegative !== groundNet || resistorOutput !== groundNet) {
    return { state: "blocked", message: "Connect the NTC above the output node and the fixed resistor from output to ground; reference source negative to ground.", validation };
  }
  const absoluteTemperatureK = temperatureC + 273.15;
  const referenceTemperatureK = 25 + 273.15;
  const ntcResistance = r25Ohm * Math.exp(betaK * (1 / absoluteTemperatureK - 1 / referenceTemperatureK));
  const outputVoltage = supplyVoltage * fixedResistance / (ntcResistance + fixedResistance);
  const dividerCurrentA = supplyVoltage / (ntcResistance + fixedResistance);
  const samples = [0, 25, 60].map(tempC => {
    const tempK = tempC + 273.15;
    const resistanceOhm = r25Ohm * Math.exp(betaK * (1 / tempK - 1 / referenceTemperatureK));
    return { temperatureC: tempC, resistanceOhm, outputVoltage: supplyVoltage * fixedResistance / (resistanceOhm + fixedResistance) };
  });
  if (![ntcResistance, outputVoltage, dividerCurrentA, ...samples.flatMap(s => [s.resistanceOhm, s.outputVoltage])].every(Number.isFinite)) {
    return { state: "blocked", message: "The NTC model exceeds its numerically supported temperature or resistance range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical NTC Beta-law voltage-divider estimate",
    message: "Uses one Beta parameter and a 25 °C reference for the stated 0/25/60 °C sweep. It omits part-specific calibration, tolerance, self-heating, thermal lag, and hardware qualification.",
    result: { kind: "ntc-temperature-divider", supplyVoltage, referenceResistanceAt25C: r25Ohm, betaK, temperatureC, ntcResistance, fixedResistance, outputVoltage, dividerCurrentA, samples },
    validation
  };
}

function analyseTvsPulseClamp(project, { source, resistors, tvs, ground, validation }) {
  const sourceMatch = String(source.value).match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*idle\s*;\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*pulse\s*,\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*ms\s*$/i);
  const idleVoltage = sourceMatch ? Number(sourceMatch[1]) : Number.NaN;
  const pulseVoltage = sourceMatch ? Number(sourceMatch[2]) : Number.NaN;
  const pulseWidthS = sourceMatch ? Number(sourceMatch[3]) / 1000 : Number.NaN;
  const tvsMatch = String(tvs.value).match(/^\s*Vclamp\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*;\s*Pmax\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*W\s*;\s*Emax\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*J\s*$/i);
  const clampVoltage = tvsMatch ? Number(tvsMatch[1]) : Number.NaN;
  const maxPulsePowerW = tvsMatch ? Number(tvsMatch[2]) : Number.NaN;
  const maxPulseEnergyJ = tvsMatch ? Number(tvsMatch[3]) : Number.NaN;
  const seriesResistor = resistors.find(item => /R1/.test(item.reference));
  const loadResistor = resistors.find(item => item !== seriesResistor);
  const seriesResistance = seriesResistor ? resistanceValue(seriesResistor.value) : Number.NaN;
  const loadResistance = loadResistor ? resistanceValue(loadResistor.value) : Number.NaN;
  if (![idleVoltage, pulseVoltage, pulseWidthS, clampVoltage, maxPulsePowerW, maxPulseEnergyJ, seriesResistance, loadResistance].every(Number.isFinite)
    || idleVoltage < 0 || pulseVoltage <= idleVoltage || pulseWidthS <= 0 || clampVoltage <= 0 || maxPulsePowerW <= 0 || maxPulseEnergyJ <= 0 || seriesResistance <= 0 || loadResistance <= 0) {
    return { state: "blocked", message: "The TVS pulse estimate needs non-negative idle voltage, a higher pulse voltage, positive pulse width, clamp, limits, and resistor values.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const seriesInput = n(seriesResistor, "1"), seriesOutput = n(seriesResistor, "2");
  const loadInput = n(loadResistor, "1"), loadOutput = n(loadResistor, "2");
  const tvsCathode = n(tvs, "K"), tvsAnode = n(tvs, "A"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== seriesInput
    || !seriesOutput || seriesOutput !== loadInput || seriesOutput !== tvsCathode
    || !groundNet || sourceNegative !== groundNet || loadOutput !== groundNet || tvsAnode !== groundNet) {
    return { state: "blocked", message: "Connect the source through its series resistance to the output; place the load and TVS in parallel from output to ground, with the TVS cathode at the output.", validation };
  }
  const idleUnclampedV = idleVoltage * loadResistance / (seriesResistance + loadResistance);
  const pulseUnclampedV = pulseVoltage * loadResistance / (seriesResistance + loadResistance);
  const idleOutputVoltage = idleUnclampedV;
  const pulseClamped = pulseUnclampedV > clampVoltage;
  const pulseOutputVoltage = pulseClamped ? clampVoltage : pulseUnclampedV;
  const pulseSeriesCurrentA = pulseClamped ? (pulseVoltage - clampVoltage) / seriesResistance : pulseVoltage / (seriesResistance + loadResistance);
  const pulseLoadCurrentA = pulseOutputVoltage / loadResistance;
  const tvsCurrentA = Math.max(0, pulseSeriesCurrentA - pulseLoadCurrentA);
  const tvsPowerW = pulseClamped ? clampVoltage * tvsCurrentA : 0;
  const pulseEnergyJ = tvsPowerW * pulseWidthS;
  const warnings = [];
  if (!pulseClamped) warnings.push("The configured pulse stays below the ideal TVS clamp threshold.");
  if (tvsPowerW > maxPulsePowerW) warnings.push("The estimated TVS pulse power exceeds the entered limit.");
  if (pulseEnergyJ > maxPulseEnergyJ) warnings.push("The estimated TVS pulse energy exceeds the entered limit.");
  return {
    state: "complete",
    engine: "Analytical ideal TVS pulse-clamp estimate",
    message: "Models one rectangular low-voltage pulse through a resistive source impedance. It does not model rise time, parasitic inductance, dynamic clamp impedance, thermal transients, repetition rate, or hardware qualification.",
    warnings,
    result: { kind: "tvs-pulse-clamp", idleVoltage, pulseVoltage, pulseWidthS, clampVoltage, seriesResistance, loadResistance, idleOutputVoltage, pulseUnclampedVoltage: pulseUnclampedV, pulseOutputVoltage, pulseClamped, pulseSeriesCurrentA, pulseLoadCurrentA, tvsCurrentA, tvsPowerW, pulseEnergyJ, maxPulsePowerW, maxPulseEnergyJ },
    validation
  };
}

function analyseZenerShuntRegulator(project, { source, resistors, zener, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const zenerMatch = String(zener.value).match(/^\s*Vz\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*;\s*Pmax\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*W\s*$/i);
  const zenerVoltage = zenerMatch ? Number(zenerMatch[1]) : Number.NaN;
  const maxZenerPowerW = zenerMatch ? Number(zenerMatch[2]) : Number.NaN;
  const seriesResistor = resistors.find(item => /series/i.test(item.reference)) ?? resistors.find(item => /R1/.test(item.reference));
  const loadResistor = resistors.find(item => item !== seriesResistor);
  const seriesResistance = seriesResistor ? resistanceValue(seriesResistor.value) : Number.NaN;
  const loadResistance = loadResistor ? resistanceValue(loadResistor.value) : Number.NaN;
  if (![sourceVoltage, zenerVoltage, maxZenerPowerW, seriesResistance, loadResistance].every(Number.isFinite)
    || sourceVoltage <= 0 || zenerVoltage <= 0 || maxZenerPowerW <= 0 || seriesResistance <= 0 || loadResistance <= 0) {
    return { state: "blocked", message: "The Zener estimate needs positive source, clamp-voltage, power-limit, series-resistance, and load-resistance values.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const seriesInput = n(seriesResistor, "1"), seriesOutput = n(seriesResistor, "2");
  const loadInput = n(loadResistor, "1"), loadOutput = n(loadResistor, "2");
  const zenerCathode = n(zener, "K"), zenerAnode = n(zener, "A"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== seriesInput
    || !seriesOutput || seriesOutput !== loadInput || seriesOutput !== zenerCathode
    || !groundNet || sourceNegative !== groundNet || loadOutput !== groundNet || zenerAnode !== groundNet) {
    return { state: "blocked", message: "Connect the source through the series resistor to the output; place the load and Zener in parallel from output to ground, with the Zener cathode at the output.", validation };
  }
  const dividerOutput = sourceVoltage * loadResistance / (seriesResistance + loadResistance);
  const zenerOn = dividerOutput >= zenerVoltage;
  const outputVoltage = zenerOn ? zenerVoltage : dividerOutput;
  const seriesCurrentA = (sourceVoltage - outputVoltage) / seriesResistance;
  const loadCurrentA = outputVoltage / loadResistance;
  const zenerCurrentA = Math.max(0, seriesCurrentA - loadCurrentA);
  const zenerPowerW = outputVoltage * zenerCurrentA;
  const seriesPowerW = seriesCurrentA ** 2 * seriesResistance;
  const loadPowerW = outputVoltage ** 2 / loadResistance;
  const sourcePowerW = sourceVoltage * seriesCurrentA;
  const overPower = zenerPowerW > maxZenerPowerW;
  const warnings = overPower ? ["The ideal clamp exceeds the entered Zener power limit; reduce source current or revise the design."] : [];
  return {
    state: "complete",
    engine: "Analytical ideal Zener shunt-regulator estimate",
    message: "Uses a hard breakdown-voltage clamp with no dynamic resistance, tolerance, temperature, or reverse-recovery model. The power warning compares against the entered generic limit; it is not a hardware safety approval.",
    warnings,
    result: { kind: "zener-shunt-regulator", sourceVoltage, zenerVoltage, maxZenerPowerW, seriesResistance, loadResistance, outputVoltage, zenerOn, seriesCurrentA, loadCurrentA, zenerCurrentA, zenerPowerW, seriesPowerW, loadPowerW, sourcePowerW, powerBalanceW: sourcePowerW - seriesPowerW - loadPowerW - zenerPowerW },
    validation
  };
}

function analyseBridgeSmoothingCapacitor(project, { source, bridge, load, capacitor, ground, validation }) {
  const sourceFields = String(source.value).split(",").map(field => field.trim());
  const rmsMatch = sourceFields.length === 2 ? sourceFields[0].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*RMS$/i) : null;
  const sourceRmsVoltage = rmsMatch ? Number(rmsMatch[1]) : Number.NaN;
  const inputFrequencyHz = sourceFields.length === 2 ? frequencyValue(sourceFields[1]) : Number.NaN;
  const diodeDrop = voltageValue(bridge.value);
  const loadResistance = resistanceValue(load.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceRmsVoltage, inputFrequencyHz, diodeDrop, loadResistance, capacitance].every(Number.isFinite)
    || sourceRmsVoltage <= 0 || inputFrequencyHz <= 0 || diodeDrop <= 0 || loadResistance <= 0 || capacitance <= 0) {
    return { state: "blocked", message: "The smoothing model requires positive AC RMS voltage, frequency, diode drop, load resistance, and capacitance.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const ac1 = n(bridge, "AC1"), ac2 = n(bridge, "AC2");
  const positive = n(bridge, "POS"), negative = n(bridge, "NEG");
  const loadPositive = n(load, "1"), loadNegative = n(load, "2");
  const capPositive = n(capacitor, "1"), capNegative = n(capacitor, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === sourceNegative || sourcePositive !== ac1 || sourceNegative !== ac2
    || !positive || positive === negative || loadPositive !== positive || capPositive !== positive
    || negative !== groundNet || loadNegative !== groundNet || capNegative !== groundNet) {
    return { state: "blocked", message: "Connect the AC source to the bridge inputs; connect the load and smoothing capacitor in parallel across bridge positive and negative, with negative grounded.", validation };
  }
  const peakInputVoltage = sourceRmsVoltage * Math.SQRT2;
  const rectifiedFrequencyHz = 2 * inputFrequencyHz;
  const intervalsPerCycle = 400;
  const cycles = 10;
  const intervals = intervalsPerCycle * cycles;
  const dt = 1 / (inputFrequencyHz * intervalsPerCycle);
  const startMeasure = intervalsPerCycle * (cycles - 2);
  let capacitorVoltage = 0;
  const measured = [];
  for (let i = 0; i <= intervals; i += 1) {
    const timeS = i * dt;
    const sourceVoltage = peakInputVoltage * Math.sin(2 * Math.PI * inputFrequencyHz * timeS);
    const rectifiedVoltage = Math.max(0, Math.abs(sourceVoltage) - 2 * diodeDrop);
    if (rectifiedVoltage > capacitorVoltage) capacitorVoltage = rectifiedVoltage;
    else capacitorVoltage *= Math.exp(-dt / (loadResistance * capacitance));
    if (i >= startMeasure) measured.push({ timeS, inputVoltage: sourceVoltage, rectifiedVoltage, outputVoltage: capacitorVoltage, loadCurrentA: capacitorVoltage / loadResistance });
  }
  const voltages = measured.map(point => point.outputVoltage);
  const peakOutputVoltage = Math.max(...voltages);
  const minimumOutputVoltage = Math.min(...voltages);
  const ripplePeakToPeakV = peakOutputVoltage - minimumOutputVoltage;
  const averageOutputVoltage = voltages.reduce((sum, value) => sum + value, 0) / voltages.length;
  const unfiltered = measured.map(point => point.rectifiedVoltage);
  const unfilteredRipplePeakToPeakV = Math.max(...unfiltered) - Math.min(...unfiltered);
  const waveform = measured.filter((_, index) => index % 5 === 0 || index === measured.length - 1);
  if (![peakInputVoltage, rectifiedFrequencyHz, peakOutputVoltage, minimumOutputVoltage, ripplePeakToPeakV, averageOutputVoltage, unfilteredRipplePeakToPeakV].every(Number.isFinite)) {
    return { state: "blocked", message: "The smoothing-capacitor waveform exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical bridge plus ideal-capacitor sampled transient estimate",
    message: "Compared an ideal fixed-drop bridge with and without a reservoir capacitor across the same resistive load. The capacitor starts discharged; source impedance, diode recovery, ESR, inrush current, transformer behavior, and thermal/rating limits are not modeled.",
    result: {
      kind: "bridge-smoothing-capacitor",
      inputFrequencyHz,
      rectifiedFrequencyHz,
      rippleFrequencyHz: rectifiedFrequencyHz,
      sourceRmsVoltage,
      peakInputVoltage,
      diodeDropPerConductingDiode: diodeDrop,
      loadResistance,
      capacitanceF: capacitance,
      peakOutputVoltage,
      minimumOutputVoltage,
      averageOutputVoltage,
      ripplePeakToPeakV,
      unfilteredRipplePeakToPeakV,
      rippleReductionRatio: unfilteredRipplePeakToPeakV > 0 ? ripplePeakToPeakV / unfilteredRipplePeakToPeakV : 0,
      waveform
    },
    validation
  };
}

function analysePassiveToneControl(project, { source, control, capacitor, load, ground, validation }) {
  const inputAmplitudeV = voltageValue(source.value);
  const capacitance = capacitanceValue(capacitor.value);
  const loadResistance = resistanceValue(load.value);
  const controlFields = String(control.value).match(/Rmax\s*([^;]+)\s*;\s*position\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*%/i);
  const maximumResistance = controlFields ? resistanceValue(controlFields[1]) : Number.NaN;
  const positionPercent = controlFields ? Number(controlFields[2]) : Number.NaN;
  if (![inputAmplitudeV, capacitance, loadResistance, maximumResistance, positionPercent].every(Number.isFinite)
    || inputAmplitudeV <= 0 || capacitance <= 0 || loadResistance <= 0 || maximumResistance <= 0
    || positionPercent < 0 || positionPercent > 100) {
    return { state: "blocked", message: "The tone-control model needs positive source, capacitor, load and potentiometer values, with control position from 0% to 100%.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const controlInput = n(control, "1"), controlOutput = n(control, "2");
  const capacitorFirst = n(capacitor, "1"), capacitorSecond = n(capacitor, "2");
  const loadFirst = n(load, "1"), loadSecond = n(load, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive === groundNet || sourcePositive !== controlInput
    || !controlOutput || controlOutput === sourcePositive || capacitorFirst !== controlOutput || loadFirst !== controlOutput
    || sourceNegative !== groundNet || capacitorSecond !== groundNet || loadSecond !== groundNet) {
    return { state: "blocked", message: "Wire the AC source through the two-terminal tone control to the output, with capacitor and load in parallel from output to the shared source return.", validation };
  }
  const seriesResistance = maximumResistance * positionPercent / 100;
  const parallelResistance = seriesResistance === 0 ? 0 : (seriesResistance * loadResistance) / (seriesResistance + loadResistance);
  const cutoffHz = parallelResistance === 0 ? null : 1 / (2 * Math.PI * capacitance * parallelResistance);
  const frequenciesHz = [100, 1000, 10000];
  const response = frequenciesHz.map(frequencyHz => {
    const reactance = 1 / (2 * Math.PI * frequencyHz * capacitance);
    const denominator = loadResistance ** 2 + reactance ** 2;
    const parallelReal = loadResistance * reactance ** 2 / denominator;
    const parallelImag = -(loadResistance ** 2) * reactance / denominator;
    const transferDenominator = (seriesResistance + parallelReal) ** 2 + parallelImag ** 2;
    const transferReal = (parallelReal * (seriesResistance + parallelReal) + parallelImag ** 2) / transferDenominator;
    const transferImag = parallelImag * seriesResistance / transferDenominator;
    const gain = Math.hypot(transferReal, transferImag);
    return { frequencyHz, gain, phaseRad: Math.atan2(transferImag, transferReal), inputAmplitudeV, outputAmplitudeV: inputAmplitudeV * gain };
  });
  if (response.some(point => ![point.gain, point.phaseRad, point.outputAmplitudeV].every(Number.isFinite))) {
    return { state: "blocked", message: "The tone-control frequency response exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical loaded single-pole passive treble-cut response",
    message: "Calculated the loaded frequency response of a two-terminal rheostat, shunt capacitor, and resistive load. This is a single-pole treble-cut control, not a Baxandall or multi-band equalizer; wiper noise, source impedance, capacitor loss, audio power, tolerances, and general SPICE are omitted.",
    result: { kind: "passive-tone-control", inputAmplitudeV, maximumResistance, positionPercent, seriesResistance, capacitance, loadResistance, cutoffHz, response },
    validation
  };
}

function analyseSupercapHoldUp(project, { source, diode, capacitor, load, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const diodeVf = forwardVoltage(diode.value);
  const loadResistance = resistanceValue(load.value);
  const fields = String(capacitor.value).match(/C\s*([^;]+)\s*;\s*Vstart\s*([^;]+)\s*;\s*Vmin\s*([^;]+)\s*;\s*Vmax\s*(.+)/i);
  const capacitance = fields ? capacitanceValue(fields[1]) : Number.NaN;
  const initialVoltage = fields ? voltageValue(fields[2]) : Number.NaN;
  const minimumVoltage = fields ? voltageValue(fields[3]) : Number.NaN;
  const ratedVoltage = fields ? voltageValue(fields[4]) : Number.NaN;
  if (![sourceVoltage, diodeVf, loadResistance, capacitance, initialVoltage, minimumVoltage, ratedVoltage].every(Number.isFinite)
    || sourceVoltage <= 0 || diodeVf <= 0 || loadResistance <= 0 || capacitance <= 0
    || initialVoltage <= minimumVoltage || minimumVoltage <= 0 || ratedVoltage < initialVoltage
    || sourceVoltage - diodeVf + 1e-12 < initialVoltage || sourceVoltage - diodeVf > ratedVoltage) {
    return { state: "blocked", message: "The hold-up model needs positive supply, diode, load, capacitance and voltage values; the initial voltage must be between the minimum and rating and chargeable through the diode.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const supplyPositive = n(source, "+"), supplyReturn = n(source, "-");
  const diodeAnode = n(diode, "A"), diodeCathode = n(diode, "K");
  const capPositive = n(capacitor, "+"), capNegative = n(capacitor, "-");
  const loadPositive = n(load, "1"), loadNegative = n(load, "2");
  const groundNet = n(ground, "0");
  if (!supplyPositive || supplyPositive === groundNet || diodeAnode !== supplyPositive
    || !diodeCathode || diodeCathode === groundNet || capPositive !== diodeCathode || loadPositive !== diodeCathode
    || supplyReturn !== groundNet || capNegative !== groundNet || loadNegative !== groundNet) {
    return { state: "blocked", message: "Wire supply positive through the isolation diode to the supercapacitor and load in parallel; connect their returns and supply negative to ground.", validation };
  }
  const timeConstantS = loadResistance * capacitance;
  const holdUpTimeS = timeConstantS * Math.log(initialVoltage / minimumVoltage);
  const initialCurrentA = initialVoltage / loadResistance;
  const initialLoadPowerW = initialVoltage ** 2 / loadResistance;
  const initialStoredEnergyJ = 0.5 * capacitance * initialVoltage ** 2;
  if (![timeConstantS, holdUpTimeS, initialCurrentA, initialLoadPowerW, initialStoredEnergyJ].every(Number.isFinite)
    || timeConstantS <= 0 || holdUpTimeS <= 0) {
    return { state: "blocked", message: "The supercapacitor discharge time is outside the numerically supported range.", validation };
  }
  const sampleTimes = [0, holdUpTimeS * 0.25, holdUpTimeS * 0.5, holdUpTimeS, holdUpTimeS * 1.25];
  const samples = sampleTimes.map(timeS => {
    const voltage = initialVoltage * Math.exp(-timeS / timeConstantS);
    const currentA = voltage / loadResistance;
    return { timeS, voltage, currentA, loadPowerW: voltage * currentA, storedEnergyJ: 0.5 * capacitance * voltage ** 2 };
  });
  if (samples.some(sample => ![sample.voltage, sample.currentA, sample.loadPowerW, sample.storedEnergyJ].every(Number.isFinite))) {
    return { state: "blocked", message: "The supercapacitor sample curve exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical supercapacitor RC power-interruption response",
    message: "Assumed the supercapacitor has charged through an ideal isolation diode, then disconnected the input supply at time zero and calculated its ideal RC discharge. ESR, leakage, capacitance/voltage tolerance, diode reverse leakage, load dynamics, recharge time, temperature, component ratings, and general SPICE are not modeled.",
    result: { kind: "supercap-hold-up", sourceVoltage, diodeVf, chargeVoltage: sourceVoltage - diodeVf, capacitance, initialVoltage, minimumVoltage, ratedVoltage, loadResistance, timeConstantS, holdUpTimeS, initialCurrentA, initialLoadPowerW, initialStoredEnergyJ, samples },
    validation
  };
}

function analyseSolarGardenLight(project, { solar, battery, ldr, diode, mosfet, led, resistors, ground, validation }) {
  const batteryVoltage = voltageValue(battery.value);
  const diodeVf = forwardVoltage(diode.value);
  const ledVf = forwardVoltage(led.value);
  const solarFields = String(solar.value).match(/Voc\s*([^;]+)\s*;\s*Isc\s*(.+)/i);
  const openCircuitVoltage = solarFields ? voltageValue(solarFields[1]) : Number.NaN;
  const shortCircuitCurrentA = solarFields ? currentValue(solarFields[2]) : Number.NaN;
  const ldrFields = String(ldr.value).match(/Rbright\s*([^;]+)\s*;\s*Rdark\s*([^;]+)\s*;\s*light\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*%/i);
  const brightResistance = ldrFields ? resistanceValue(ldrFields[1]) : Number.NaN;
  const darkResistance = ldrFields ? resistanceValue(ldrFields[2]) : Number.NaN;
  const illuminationPercent = ldrFields ? Number(ldrFields[3]) : Number.NaN;
  const thresholdVoltage = voltageValue(mosfet.value);
  if (![batteryVoltage, diodeVf, ledVf, openCircuitVoltage, shortCircuitCurrentA, brightResistance, darkResistance, illuminationPercent, thresholdVoltage].every(Number.isFinite)
    || batteryVoltage <= 0 || diodeVf <= 0 || ledVf <= 0 || openCircuitVoltage <= 0 || shortCircuitCurrentA <= 0
    || brightResistance <= 0 || darkResistance < brightResistance || illuminationPercent < 0 || illuminationPercent > 100 || thresholdVoltage < 0) {
    return { state: "blocked", message: "The solar garden-light model requires positive battery, solar, diode, LED and light-sensor values; illumination must be between 0% and 100%.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const solarPositive = n(solar, "+"), solarNegative = n(solar, "-");
  const batteryPositive = n(battery, "+"), batteryNegative = n(battery, "-");
  const diodeAnode = n(diode, "A"), diodeCathode = n(diode, "K");
  const gate = n(mosfet, "G"), drain = n(mosfet, "D"), source = n(mosfet, "S");
  const ledAnode = n(led, "A"), ledCathode = n(led, "K"), groundNet = n(ground, "0");
  const ldrFirst = n(ldr, "1"), ldrSecond = n(ldr, "2");
  const batteryResistor = resistors.find(part => {
    const a = n(part, "1"), b = n(part, "2");
    return (a === batteryPositive && b === gate) || (b === batteryPositive && a === gate);
  });
  const ledResistor = resistors.find(part => part !== batteryResistor && (() => {
    const a = n(part, "1"), b = n(part, "2");
    return (a === batteryPositive && b === ledAnode) || (b === batteryPositive && a === ledAnode);
  })());
  if (!solarPositive || solarPositive === solarNegative || solarNegative !== groundNet
    || !batteryPositive || batteryNegative !== groundNet || diodeAnode !== solarPositive || diodeCathode !== batteryPositive
    || !gate || gate === batteryPositive || ldrFirst !== gate || ldrSecond !== groundNet
    || source !== groundNet || !drain || drain === groundNet || ledCathode !== drain
    || !ledAnode || !batteryResistor || !ledResistor) {
    return { state: "blocked", message: "Wire the solar cell through the Schottky diode to the battery, and connect the battery-powered LED through its resistor and MOSFET. The battery-pull-up and LDR-to-ground divider must drive the MOSFET gate.", validation };
  }
  const batteryResistance = resistanceValue(batteryResistor.value);
  const ledResistance = resistanceValue(ledResistor.value);
  if (![batteryResistance, ledResistance].every(Number.isFinite) || batteryResistance <= 0 || ledResistance <= 0) {
    return { state: "blocked", message: "The gate-divider and LED current-limiting resistors must be positive numeric values.", validation };
  }
  const lightFraction = illuminationPercent / 100;
  const ldrResistance = brightResistance * (darkResistance / brightResistance) ** (1 - lightFraction);
  const gateVoltage = batteryVoltage * ldrResistance / (batteryResistance + ldrResistance);
  const mosfetConducting = gateVoltage > thresholdVoltage;
  const ledCurrentA = mosfetConducting ? Math.max(0, (batteryVoltage - ledVf) / ledResistance) : 0;
  const effectiveSolarVoc = openCircuitVoltage * lightFraction;
  const effectiveSolarIsc = shortCircuitCurrentA * lightFraction;
  const chargeHeadroomV = effectiveSolarVoc - batteryVoltage - diodeVf;
  const chargeCurrentA = chargeHeadroomV > 0
    ? effectiveSolarIsc * Math.max(0, 1 - (batteryVoltage + diodeVf) / effectiveSolarVoc)
    : 0;
  const batteryCurrentIntoBatteryA = chargeCurrentA - ledCurrentA;
  const solarPowerAtDiodeInputW = chargeCurrentA > 0 ? (batteryVoltage + diodeVf) * chargeCurrentA : 0;
  const diodePowerW = diodeVf * chargeCurrentA;
  const batteryChargePowerW = batteryVoltage * chargeCurrentA;
  const ledResistorPowerW = ledCurrentA ** 2 * ledResistance;
  const ledPowerW = ledCurrentA * ledVf;
  const batteryPowerToLedW = batteryVoltage * ledCurrentA;
  const solarPowerBalanceW = solarPowerAtDiodeInputW - diodePowerW - batteryChargePowerW;
  const ledPowerBalanceW = batteryPowerToLedW - ledResistorPowerW - ledPowerW;
  if (![ldrResistance, gateVoltage, ledCurrentA, effectiveSolarVoc, effectiveSolarIsc, chargeHeadroomV, chargeCurrentA, batteryCurrentIntoBatteryA, solarPowerAtDiodeInputW, diodePowerW, batteryChargePowerW, ledResistorPowerW, ledPowerW, batteryPowerToLedW, solarPowerBalanceW, ledPowerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The solar garden-light estimate exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical solar garden-light day/night and charge estimate",
    message: "Estimated solar charging with a linear photovoltaic I–V approximation and an ideal Schottky diode, and switched the LED from an LDR divider through an ideal MOSFET. The battery voltage is fixed; state of charge, charge acceptance, solar-cell curvature, diode/MOSFET dynamics, twilight hysteresis, component tolerance, thermal behavior, ratings, and general SPICE are not modeled.",
    result: { kind: "solar-garden-light", batteryVoltage, illuminationPercent, ldrResistance, gateVoltage, mosfetThresholdVoltage: thresholdVoltage, mosfetConducting, ledOn: ledCurrentA > 0.0005, ledCurrentA, solarOpenCircuitVoltage: openCircuitVoltage, solarShortCircuitCurrentA: shortCircuitCurrentA, effectiveSolarVoc, effectiveSolarIsc, chargeHeadroomV, chargeCurrentA, batteryCurrentIntoBatteryA, solarPowerAtDiodeInputW, diodePowerW, batteryChargePowerW, ledResistorPowerW, ledPowerW, batteryPowerToLedW, solarPowerBalanceW, ledPowerBalanceW },
    validation
  };
}

function analyseUsbLedPtc(project, { source, fuse, resistor, led, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const resistance = resistanceValue(resistor.value);
  const fuseMatch = String(fuse.value).match(/Ihold\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*A[\s\S]*Rcold\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*Ω/i);
  const holdCurrentA = fuseMatch ? Number(fuseMatch[1]) : Number.NaN;
  const coldResistance = fuseMatch ? Number(fuseMatch[2]) : Number.NaN;
  if (![sourceVoltage, ledVf, resistance, holdCurrentA, coldResistance].every(Number.isFinite)
    || sourceVoltage <= 0 || ledVf <= 0 || resistance <= 0 || holdCurrentA <= 0 || coldResistance < 0) {
    return { state: "blocked", message: "The USB LED model requires positive supply, LED, resistor, and PTC hold-current values; cold resistance cannot be negative.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const supplyNet = n(source, "+"), sourceReturn = n(source, "-");
  const fuseInput = n(fuse, "1"), fuseOutput = n(fuse, "2");
  const resistorInput = n(resistor, "1"), resistorOutput = n(resistor, "2");
  const ledAnode = n(led, "A"), ledCathode = n(led, "K"), groundNet = n(ground, "0");
  if (!supplyNet || supplyNet === groundNet || sourceReturn !== groundNet || fuseInput !== supplyNet
    || !fuseOutput || fuseOutput === supplyNet || resistorInput !== fuseOutput
    || !resistorOutput || resistorOutput !== ledAnode || ledCathode !== groundNet) {
    return { state: "blocked", message: "Wire USB positive through the PTC, LED resistor, and LED to ground, with USB negative and signal ground on the same return.", validation };
  }
  const totalSeriesResistance = resistance + coldResistance;
  const currentA = Math.max(0, (sourceVoltage - ledVf) / totalSeriesResistance);
  const fuseVoltageDrop = currentA * coldResistance;
  const resistorPowerW = currentA ** 2 * resistance;
  const fusePowerW = currentA ** 2 * coldResistance;
  const ledPowerW = currentA * ledVf;
  const sourcePowerW = sourceVoltage * currentA;
  const powerBalanceW = sourcePowerW - resistorPowerW - fusePowerW - ledPowerW;
  const holdCurrentExceeded = currentA > holdCurrentA;
  if (![currentA, fuseVoltageDrop, resistorPowerW, fusePowerW, ledPowerW, sourcePowerW, powerBalanceW].every(Number.isFinite)) {
    return { state: "blocked", message: "The USB LED result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical USB LED and cold-state PTC estimate",
    message: holdCurrentExceeded
      ? "The calculated cold-state current exceeds the configured PTC hold current. This flags an overload risk only; PTC heating, trip time, resistance rise, reset behavior, and USB port response are not simulated."
      : "Calculated a low-voltage USB LED branch using the configured PTC cold resistance. PTC heating, trip time, resistance rise, reset behavior, USB port behavior, component tolerance, thermal effects, device ratings, and general SPICE are not simulated.",
    result: { kind: "usb-led-ptc", sourceVoltage, ledVf, resistance, holdCurrentA, coldResistance, currentA, fuseVoltageDrop, holdCurrentExceeded, overloadWarning: holdCurrentExceeded, fuseTripPredicted: false, resistorPowerW, fusePowerW, ledPowerW, sourcePowerW, powerBalanceW },
    validation
  };
}

function analyseLinearSupply(project, { source, transformer, bridge, capacitor, regulator, load, ground, validation }) {
  const acFields = String(source.value).split(",").map(field => field.trim());
  const acMatch = acFields.length === 2 ? acFields[0].match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V\s*RMS$/i) : null;
  const primaryRmsVoltage = acMatch ? Number(acMatch[1]) : Number.NaN;
  const lineFrequencyHz = acFields.length === 2 ? frequencyValue(acFields[1]) : Number.NaN;
  const ratioMatch = String(transformer.value).match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*:\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*$/);
  const primaryTurns = ratioMatch ? Number(ratioMatch[1]) : Number.NaN;
  const secondaryTurns = ratioMatch ? Number(ratioMatch[2]) : Number.NaN;
  const diodeDrop = voltageValue(bridge.value);
  const capacitance = capacitanceValue(capacitor.value);
  const loadResistance = resistanceValue(load.value);
  const regulatorFields = [...String(regulator.value).matchAll(/(?:Vout|dropout)\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*V/gi)].map(match => Number(match[1]));
  const outputSetpointV = regulatorFields.length === 2 ? regulatorFields[0] : Number.NaN;
  const dropoutVoltage = regulatorFields.length === 2 ? regulatorFields[1] : Number.NaN;
  if (![primaryRmsVoltage, lineFrequencyHz, primaryTurns, secondaryTurns, diodeDrop, capacitance, loadResistance, outputSetpointV, dropoutVoltage].every(Number.isFinite)
    || primaryRmsVoltage <= 0 || lineFrequencyHz <= 0 || primaryTurns <= 0 || secondaryTurns <= 0
    || diodeDrop <= 0 || capacitance <= 0 || loadResistance <= 0 || outputSetpointV <= 0 || dropoutVoltage < 0) {
    return { state: "blocked", message: "The supply model requires positive AC RMS voltage, line frequency, transformer turns, diode drop, capacitance, load resistance and regulator setpoint; dropout cannot be negative.", validation };
  }
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const n = (part, pin) => netByEndpoint.get(endpoint(part, pin));
  const primary1 = n(transformer, "PRI1"), primary2 = n(transformer, "PRI2");
  const secondary1 = n(transformer, "SEC1"), secondary2 = n(transformer, "SEC2");
  const sourcePositive = n(source, "+"), sourceNegative = n(source, "-");
  const bridgeAC1 = n(bridge, "AC1"), bridgeAC2 = n(bridge, "AC2");
  const bridgePositive = n(bridge, "POS"), bridgeNegative = n(bridge, "NEG");
  const capacitorPositive = n(capacitor, "1"), capacitorNegative = n(capacitor, "2");
  const regulatorInput = n(regulator, "IN"), regulatorOutput = n(regulator, "OUT"), regulatorGround = n(regulator, "GND");
  const loadInput = n(load, "1"), loadReturn = n(load, "2"), groundNet = n(ground, "0");
  if (!sourcePositive || sourcePositive !== primary1 || sourceNegative !== primary2
    || !secondary1 || secondary1 !== bridgeAC1 || !secondary2 || secondary2 !== bridgeAC2
    || !bridgePositive || bridgePositive === bridgeNegative || capacitorPositive !== bridgePositive
    || regulatorInput !== bridgePositive || !groundNet || bridgeNegative !== groundNet
    || capacitorNegative !== groundNet || regulatorGround !== groundNet || loadReturn !== groundNet
    || !regulatorOutput || regulatorOutput === groundNet || loadInput !== regulatorOutput) {
    return { state: "blocked", message: "Wire the AC source to transformer primary, transformer secondary to bridge AC pins, bridge DC rails across the capacitor and regulator input, and regulator output through the load to shared DC ground.", validation };
  }
  const transformerRatio = secondaryTurns / primaryTurns;
  const secondaryRmsVoltage = primaryRmsVoltage * transformerRatio;
  const rectifiedPeakVoltage = secondaryRmsVoltage * Math.SQRT2 - 2 * diodeDrop;
  const rectifiedFrequencyHz = 2 * lineFrequencyHz;
  const rippleFactor = 1 / (rectifiedFrequencyHz * capacitance * loadResistance);
  if (![transformerRatio, secondaryRmsVoltage, rectifiedPeakVoltage, rectifiedFrequencyHz, rippleFactor].every(Number.isFinite)
    || secondaryRmsVoltage <= 0 || rectifiedPeakVoltage <= 0 || rectifiedFrequencyHz <= 0 || rippleFactor < 0) {
    return { state: "blocked", message: "The transformer, rectifier, and capacitor values produce an unsupported or non-positive secondary supply.", validation };
  }
  const dropoutLimitedVoltage = Math.max(0, (rectifiedPeakVoltage - dropoutVoltage) / (1 + rippleFactor));
  const regulated = rectifiedPeakVoltage - rippleFactor * outputSetpointV >= outputSetpointV + dropoutVoltage;
  const outputVoltage = regulated ? outputSetpointV : Math.min(outputSetpointV, dropoutLimitedVoltage);
  const loadCurrentA = outputVoltage / loadResistance;
  const rippleVoltagePP = loadCurrentA / (rectifiedFrequencyHz * capacitance);
  const minimumRectifiedVoltage = rectifiedPeakVoltage - rippleVoltagePP;
  const averageRectifiedVoltage = rectifiedPeakVoltage - rippleVoltagePP / 2;
  const regulatorDissipationW = Math.max(0, (averageRectifiedVoltage - outputVoltage) * loadCurrentA);
  const bridgeDissipationW = 2 * diodeDrop * loadCurrentA;
  const loadPowerW = outputVoltage * loadCurrentA;
  const estimatedSecondaryInputPowerW = (averageRectifiedVoltage + 2 * diodeDrop) * loadCurrentA;
  const powerBalanceW = estimatedSecondaryInputPowerW - loadPowerW - regulatorDissipationW - bridgeDissipationW;
  const dropoutMarginV = minimumRectifiedVoltage - outputSetpointV - dropoutVoltage;
  if (![outputVoltage, loadCurrentA, rippleVoltagePP, minimumRectifiedVoltage, averageRectifiedVoltage, regulatorDissipationW, bridgeDissipationW, loadPowerW, estimatedSecondaryInputPowerW, powerBalanceW, dropoutMarginV].every(Number.isFinite)) {
    return { state: "blocked", message: "The supply estimate exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical transformer, bridge, reservoir-capacitor, and linear-regulator envelope",
    message: "Calculated a steady-state full-wave rectified reservoir ripple estimate and ideal regulator dropout envelope. The transformer, bridge, capacitor recharge pulses, regulator control loop, line/load transients, component tolerances, heat-sink design, mains isolation/safety, device ratings, and general SPICE are not simulated; the source value is primary RMS voltage.",
    result: { kind: "linear-regulated-supply", primaryRmsVoltage, lineFrequencyHz, primaryTurns, secondaryTurns, transformerRatio, secondaryRmsVoltage, rectifiedPeakVoltage, rectifiedFrequencyHz, diodeDropEach: diodeDrop, capacitance, loadResistance, outputSetpointV, dropoutVoltage, regulated, outputVoltage, loadCurrentA, rippleVoltagePP, minimumRectifiedVoltage, averageRectifiedVoltage, dropoutMarginV, regulatorDissipationW, bridgeDissipationW, loadPowerW, estimatedSecondaryInputPowerW, powerBalanceW },
    validation
  };
}

function analyseRlStep(project, { source, resistor, inductor, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const inductance = inductanceValue(inductor.value);
  if (![sourceVoltage, resistance, inductance].every(Number.isFinite) || sourceVoltage <= 0 || resistance <= 0 || inductance <= 0) return { state: "blocked", message: "The RL step model requires positive numeric source voltage, resistance, and inductance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const inductorInput = netByEndpoint.get(endpoint(inductor, "1"));
  const inductorReturn = netByEndpoint.get(endpoint(inductor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== inductorInput || !groundNet || groundNet !== inductorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RL step model requires source positive → resistor → inductor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = inductance / resistance;
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || timeConstantS > Number.MAX_VALUE / 5) return { state: "blocked", message: "The RL time constant is outside the numerically supported range; adjust the inductance or resistance.", validation };
  const samples = [0, 1, 3, 5].map((multiples) => {
    const timeS = multiples * timeConstantS;
    const currentA = (sourceVoltage / resistance) * (1 - Math.exp(-multiples));
    const inductorVoltage = sourceVoltage * Math.exp(-multiples);
    return { timeS, currentA, inductorVoltage, resistorPowerW: currentA ** 2 * resistance };
  });
  return { state: "complete", engine: "Analytical first-order RL step response", message: "Solved an ideal single-pole RL response to a DC step from zero initial inductor current. Parasitics, source impedance, tolerances, saturation, nonlinear effects, and general SPICE are not included.", result: { kind: "rl-step-response", sourceVoltage, resistance, inductance, timeConstantS, samples }, validation };
}

function analyseRlLowPass(project, { source, resistor, inductor, ground, validation }) {
  const sourceAmplitude = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const inductance = inductanceValue(inductor.value);
  if (![sourceAmplitude, resistance, inductance].every(Number.isFinite) || sourceAmplitude <= 0 || resistance <= 0 || inductance <= 0) return { state: "blocked", message: "The RL low-pass model requires positive numeric source amplitude, resistance, and inductance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const inductorInput = netByEndpoint.get(endpoint(inductor, "1"));
  const inductorReturn = netByEndpoint.get(endpoint(inductor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== inductorInput || !groundNet || groundNet !== inductorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RL low-pass model requires AC source positive → resistor → inductor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = inductance / resistance;
  const cutoffHz = resistance / (2 * Math.PI * inductance);
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || !Number.isFinite(cutoffHz) || cutoffHz <= 0) return { state: "blocked", message: "The RL cutoff is outside the numerically supported range; adjust the resistance or inductance.", validation };
  const samples = [0.1, 1, 10].map((cutoffMultiple) => {
    const frequencyHz = cutoffHz * cutoffMultiple;
    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return null;
    const ratio = frequencyHz / cutoffHz;
    const gain = 1 / Math.hypot(1, ratio);
    return { frequencyHz, cutoffMultiple, gain, phaseRad: -Math.atan(ratio), inputAmplitudeV: sourceAmplitude, outputAmplitudeV: sourceAmplitude * gain };
  });
  if (samples.some((sample) => !sample)) return { state: "blocked", message: "The RL sweep frequencies exceed the numerically supported range.", validation };
  return { state: "complete", engine: "Analytical first-order RL low-pass frequency response", message: "Calculated the ideal sinusoidal steady-state response of a first-order RL low-pass filter at 0.1×, 1×, and 10× cutoff. This is a frequency-domain model, not a time-domain or general SPICE simulation.", result: { kind: "rl-low-pass", sourceAmplitude, resistance, inductance, timeConstantS, cutoffHz, samples }, validation };
}

function analyseRcHighPass(project, { source, resistor, capacitor, ground, validation }) {
  const sourceAmplitude = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceAmplitude, resistance, capacitance].every(Number.isFinite) || sourceAmplitude <= 0 || resistance <= 0 || capacitance <= 0) return null;
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorOutput = netByEndpoint.get(endpoint(capacitor, "2"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorReturn = netByEndpoint.get(endpoint(resistor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== capacitorInput || !capacitorOutput || capacitorOutput !== resistorInput || !groundNet || groundNet !== resistorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return null;
  const timeConstantS = resistance * capacitance;
  const cutoffHz = 1 / (2 * Math.PI * timeConstantS);
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || !Number.isFinite(cutoffHz) || cutoffHz <= 0) return { state: "blocked", message: "The RC cutoff is outside the numerically supported range; adjust the resistance or capacitance.", validation };
  const samples = [0.1, 1, 10].map((cutoffMultiple) => {
    const frequencyHz = cutoffHz * cutoffMultiple;
    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return null;
    const ratio = frequencyHz / cutoffHz;
    const gain = ratio / Math.hypot(1, ratio);
    return { frequencyHz, cutoffMultiple, gain, phaseRad: Math.PI / 2 - Math.atan(ratio), inputAmplitudeV: sourceAmplitude, outputAmplitudeV: sourceAmplitude * gain };
  });
  if (samples.some((sample) => !sample)) return { state: "blocked", message: "The RC sweep frequencies exceed the numerically supported range.", validation };
  return { state: "complete", engine: "Analytical first-order RC high-pass frequency response", message: "Calculated the ideal sinusoidal steady-state response of a first-order RC high-pass filter at 0.1×, 1×, and 10× cutoff. This is a frequency-domain model, not a time-domain or general SPICE simulation.", result: { kind: "rc-high-pass", sourceAmplitude, resistance, capacitance, timeConstantS, cutoffHz, samples }, validation };
}

function analyseRcLowPass(project, { source, resistor, capacitor, ground, validation }) {
  const sourceAmplitude = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceAmplitude, resistance, capacitance].every(Number.isFinite) || sourceAmplitude <= 0 || resistance <= 0 || capacitance <= 0) return { state: "blocked", message: "The RC low-pass model requires positive numeric source amplitude, resistance, and capacitance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorReturn = netByEndpoint.get(endpoint(capacitor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== capacitorInput || !groundNet || groundNet !== capacitorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RC low-pass model requires AC source positive → resistor → capacitor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = resistance * capacitance;
  const cutoffHz = 1 / (2 * Math.PI * timeConstantS);
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || !Number.isFinite(cutoffHz) || cutoffHz <= 0) return { state: "blocked", message: "The RC cutoff is outside the numerically supported range; adjust the resistance or capacitance.", validation };
  const samples = [0.1, 1, 10].map((cutoffMultiple) => {
    const frequencyHz = cutoffHz * cutoffMultiple;
    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return null;
    const ratio = frequencyHz / cutoffHz;
    const gain = 1 / Math.hypot(1, ratio);
    return { frequencyHz, cutoffMultiple, gain, phaseRad: -Math.atan(ratio), inputAmplitudeV: sourceAmplitude, outputAmplitudeV: sourceAmplitude * gain };
  });
  if (samples.some((sample) => !sample)) return { state: "blocked", message: "The RC sweep frequencies exceed the numerically supported range.", validation };
  return { state: "complete", engine: "Analytical first-order RC low-pass frequency response", message: "Calculated the ideal sinusoidal steady-state response of a first-order RC low-pass filter at 0.1×, 1×, and 10× cutoff. This is a frequency-domain model, not a time-domain or general SPICE simulation.", result: { kind: "rc-low-pass", sourceAmplitude, resistance, capacitance, timeConstantS, cutoffHz, samples }, validation };
}

function analyseRcStep(project, { source, resistor, capacitor, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  if (![sourceVoltage, resistance, capacitance].every(Number.isFinite) || sourceVoltage <= 0 || resistance <= 0 || capacitance <= 0) return { state: "blocked", message: "The RC step model requires positive numeric source voltage, resistance, and capacitance values.", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorReturn = netByEndpoint.get(endpoint(capacitor, "2"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive !== resistorInput || !resistorOutput || resistorOutput !== capacitorInput || !groundNet || groundNet !== capacitorReturn || groundNet !== sourceNegative || sourcePositive === groundNet) return { state: "blocked", message: "The RC step model requires source positive → resistor → capacitor → ground, with source negative on the same ground reference.", validation };
  const timeConstantS = resistance * capacitance;
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || timeConstantS > Number.MAX_VALUE / 5) return { state: "blocked", message: "The RC time constant is outside the numerically supported range; reduce the resistance or capacitance.", validation };
  const samples = [0, 1, 3, 5].map((multiples) => {
    const timeS = multiples * timeConstantS;
    const capacitorVoltage = sourceVoltage * (1 - Math.exp(-multiples));
    const currentA = (sourceVoltage / resistance) * Math.exp(-multiples);
    return { timeS, capacitorVoltage, currentA, resistorPowerW: currentA ** 2 * resistance };
  });
  return { state: "complete", engine: "Analytical first-order RC step response", message: "Solved an ideal single-pole RC response to a DC step from zero initial capacitor voltage. Parasitics, source impedance, tolerances, nonlinear effects, and general SPICE are not included.", result: { kind: "rc-step-response", sourceVoltage, resistance, capacitance, timeConstantS, samples }, validation };
}

function analyseRcSwitchedResponse(project, { source, resistor, capacitor, switchPart, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const resistance = resistanceValue(resistor.value);
  const capacitance = capacitanceValue(capacitor.value);
  const mode = switchPart.value === "Charge (A)" ? "charge" : switchPart.value === "Discharge (B)" ? "discharge" : null;
  if (![sourceVoltage, resistance, capacitance].every(Number.isFinite) || sourceVoltage <= 0 || resistance <= 0 || capacitance <= 0) return { state: "blocked", message: "The switched RC model requires positive numeric source voltage, resistance, and capacitance values.", validation };
  if (!mode) return { state: "blocked", message: "Set the SPDT switch value to Charge (A) or Discharge (B).", validation };
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const resistorInput = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorOutput = netByEndpoint.get(endpoint(resistor, "2"));
  const capacitorInput = netByEndpoint.get(endpoint(capacitor, "1"));
  const capacitorReturn = netByEndpoint.get(endpoint(capacitor, "2"));
  const switchCommon = netByEndpoint.get(endpoint(switchPart, "COM"));
  const switchCharge = netByEndpoint.get(endpoint(switchPart, "A"));
  const switchDischarge = netByEndpoint.get(endpoint(switchPart, "B"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet || switchCharge !== sourcePositive || switchDischarge !== groundNet || switchCommon !== resistorInput || !resistorOutput || resistorOutput !== capacitorInput || capacitorReturn !== groundNet) return { state: "blocked", message: "The switched RC model requires source positive on switch A, ground on switch B and capacitor return, switch COM → resistor → capacitor, and source negative on ground.", validation };
  const timeConstantS = resistance * capacitance;
  if (!Number.isFinite(timeConstantS) || timeConstantS <= 0 || timeConstantS > Number.MAX_VALUE / 5) return { state: "blocked", message: "The RC time constant is outside the numerically supported range; adjust the resistance or capacitance.", validation };
  const samples = [0, 1, 3, 5].map((multiples) => {
    const timeS = multiples * timeConstantS;
    const exponential = Math.exp(-multiples);
    const capacitorVoltage = mode === "charge" ? sourceVoltage * (1 - exponential) : sourceVoltage * exponential;
    const currentA = (sourceVoltage / resistance) * exponential;
    return { timeS, capacitorVoltage, currentA, resistorPowerW: currentA ** 2 * resistance };
  });
  return { state: "complete", engine: "Analytical first-order switched RC response", message: "Solved an ideal first-order RC charge or discharge through the selected SPDT path. The discharge assumes the capacitor was previously charged to the source voltage. Parasitics, switch resistance, tolerances, nonlinear effects, and general SPICE are not included.", result: { kind: "rc-charge-discharge", mode, sourceVoltage, resistance, capacitance, timeConstantS, samples }, validation };
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


function analyseMultiSourceResistiveNetwork(project, { sources, currentSources, resistors, ground, validation }) {
  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!groundNet) return { state: "blocked", message: "Connect the signal-ground pin to a named project net before solving.", validation };

  const sourceBranches = sources.map((source) => {
    const voltage = voltageValue(source.value);
    const positiveNet = netByEndpoint.get(endpoint(source, "+"));
    const negativeNet = netByEndpoint.get(endpoint(source, "-"));
    return { reference: source.reference, voltage, positiveNet, negativeNet };
  });
  for (const source of sourceBranches) {
    if (!Number.isFinite(source.voltage)) return { state: "blocked", message: `${source.reference} needs a numeric DC voltage.`, validation };
    if (!source.positiveNet || !source.negativeNet) return { state: "blocked", message: `${source.reference} must connect both terminals to named project nets.`, validation };
    if (source.positiveNet === source.negativeNet) return { state: "blocked", message: `${source.reference} is shorted because both terminals share ${source.positiveNet}.`, validation };
  }

  const currentBranches = currentSources.map((source) => ({
    reference: source.reference,
    current: currentValue(source.value),
    positiveNet: netByEndpoint.get(endpoint(source, "+")),
    negativeNet: netByEndpoint.get(endpoint(source, "-"))
  }));
  for (const source of currentBranches) {
    if (!Number.isFinite(source.current)) return { state: "blocked", message: `${source.reference} needs a numeric DC current in amperes.`, validation };
    if (!source.positiveNet || !source.negativeNet) return { state: "blocked", message: `${source.reference} must connect both terminals to named project nets.`, validation };
    if (source.positiveNet === source.negativeNet) return { state: "blocked", message: `${source.reference} is shorted because both terminals share ${source.positiveNet}.`, validation };
  }

  const resistorBranches = [];
  for (const resistor of resistors) {
    const resistance = resistanceValue(resistor.value);
    const nodeA = netByEndpoint.get(endpoint(resistor, "1"));
    const nodeB = netByEndpoint.get(endpoint(resistor, "2"));
    if (!Number.isFinite(resistance) || resistance <= 0) return { state: "blocked", message: `${resistor.reference} needs a numeric positive resistance.`, validation };
    if (!nodeA || !nodeB) return { state: "blocked", message: `${resistor.reference} must connect both terminals to named project nets.`, validation };
    if (nodeA === nodeB) return { state: "blocked", message: `${resistor.reference} is shorted by connecting both terminals to ${nodeA}.`, validation };
    resistorBranches.push({ reference: resistor.reference, nodeA, nodeB, resistance });
  }

  const connectedNets = new Set([groundNet]);
  for (const branch of sourceBranches) { connectedNets.add(branch.positiveNet); connectedNets.add(branch.negativeNet); }
  for (const branch of currentBranches) { connectedNets.add(branch.positiveNet); connectedNets.add(branch.negativeNet); }
  for (const branch of resistorBranches) { connectedNets.add(branch.nodeA); connectedNets.add(branch.nodeB); }
  const nodes = [...connectedNets].filter((node) => node !== groundNet).sort();
  const nodeIndex = new Map(nodes.map((node, index) => [node, index]));
  const nodeCount = nodes.length;
  const matrixSize = nodeCount + sourceBranches.length;
  const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0));
  const rhs = Array(matrixSize).fill(0);
  const addConductance = (row, column, value) => {
    if (row !== undefined && column !== undefined) matrix[row][column] += value;
  };

  for (const branch of resistorBranches) {
    const conductance = 1 / branch.resistance;
    const a = branch.nodeA === groundNet ? undefined : nodeIndex.get(branch.nodeA);
    const b = branch.nodeB === groundNet ? undefined : nodeIndex.get(branch.nodeB);
    addConductance(a, a, conductance);
    addConductance(b, b, conductance);
    addConductance(a, b, -conductance);
    addConductance(b, a, -conductance);
  }

  for (const branch of currentBranches) {
    const positive = branch.positiveNet === groundNet ? undefined : nodeIndex.get(branch.positiveNet);
    const negative = branch.negativeNet === groundNet ? undefined : nodeIndex.get(branch.negativeNet);
    // Positive current is defined as flowing from the negative pin into the positive pin.
    if (positive !== undefined) rhs[positive] += branch.current;
    if (negative !== undefined) rhs[negative] -= branch.current;
  }

  sourceBranches.forEach((branch, sourceOffset) => {
    const currentIndex = nodeCount + sourceOffset;
    const positive = branch.positiveNet === groundNet ? undefined : nodeIndex.get(branch.positiveNet);
    const negative = branch.negativeNet === groundNet ? undefined : nodeIndex.get(branch.negativeNet);
    addConductance(positive, currentIndex, 1);
    addConductance(currentIndex, positive, 1);
    addConductance(negative, currentIndex, -1);
    addConductance(currentIndex, negative, -1);
    rhs[currentIndex] = branch.voltage;
  });

  const solved = solveLinearSystem(matrix, rhs);
  if (!solved || solved.some((value) => !Number.isFinite(value))) {
    return { state: "blocked", message: "The multiple-source resistor network is floating, disconnected, contradictory, or numerically singular.", validation };
  }

  const nodeVoltages = Object.fromEntries([[groundNet, 0], ...nodes.map((node, index) => [node, solved[index]])]);
  const resistorResults = resistorBranches.map((branch) => {
    const voltage = nodeVoltages[branch.nodeA] - nodeVoltages[branch.nodeB];
    const currentA = voltage / branch.resistance;
    return { reference: branch.reference, voltage, currentA, powerW: currentA ** 2 * branch.resistance };
  });
  const sourceResults = sourceBranches.map((branch, index) => {
    const currentA = solved[nodeCount + index];
    return {
      reference: branch.reference,
      voltage: branch.voltage,
      currentA,
      deliveredCurrentA: -currentA,
      powerDeliveredW: -branch.voltage * currentA
    };
  });
  const currentSourceResults = currentBranches.map((branch) => {
    const voltage = nodeVoltages[branch.positiveNet] - nodeVoltages[branch.negativeNet];
    return { reference: branch.reference, voltage, outputCurrentA: branch.current, powerDeliveredW: voltage * branch.current };
  });
  const resistorPowerW = resistorResults.reduce((sum, item) => sum + item.powerW, 0);
  const voltageSourcePowerW = sourceResults.reduce((sum, item) => sum + item.powerDeliveredW, 0);
  const currentSourcePowerW = currentSourceResults.reduce((sum, item) => sum + item.powerDeliveredW, 0);
  const sourcePowerW = voltageSourcePowerW + currentSourcePowerW;
  if (![resistorPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The multiple-source network produced a non-finite power result.", validation };
  }
  return {
    state: "complete",
    engine: "Linear DC modified nodal analysis",
    message: "Solved an ideal linear DC network containing independent voltage and current sources and resistors. Current source positive current flows from its negative pin to its positive pin. Source output resistance, reactive elements, nonlinear devices, thermal effects, and general SPICE are not included.",
    result: { kind: currentBranches.length ? "linear-dc-mna-network" : "multi-source-resistive-network", nodeVoltages, sources: sourceResults, currentSources: currentSourceResults, resistors: resistorResults, sourcePowerW, voltageSourcePowerW, currentSourcePowerW, resistorPowerW, powerBalanceW: sourcePowerW - resistorPowerW },
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




function analyseLatchingLedSwitch(project, { source, resistor, led, switchPart, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const position = String(switchPart.value).trim().toLowerCase();
  const onPosition = position === "position a";
  const offPosition = position === "position b";
  if (!Number.isFinite(sourceVoltage) || sourceVoltage <= 0 || !Number.isFinite(ledVf) || ledVf <= 0) {
    return { state: "blocked", message: "The latching LED model requires positive numeric source voltage and LED forward voltage.", validation };
  }
  if (!onPosition && !offPosition) return { state: "blocked", message: "Set the latching SPDT switch to Position A or Position B.", validation };

  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const switchCommon = netByEndpoint.get(endpoint(switchPart, "COM"));
  const switchA = netByEndpoint.get(endpoint(switchPart, "A"));
  const switchB = netByEndpoint.get(endpoint(switchPart, "B"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  const resistorFirst = netByEndpoint.get(endpoint(resistor, "1"));
  const resistorSecond = netByEndpoint.get(endpoint(resistor, "2"));
  const resistorLeadsCommon = (switchCommon === resistorFirst && resistorSecond === ledAnode)
    || (switchCommon === resistorSecond && resistorFirst === ledAnode);
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet || switchA !== sourcePositive
    || switchB !== groundNet || switchCommon === groundNet || !resistorLeadsCommon || ledCathode !== groundNet) {
    return { state: "blocked", message: "Wire switch A to source positive, switch B to ground, and switch COM through the series resistor and LED to ground.", validation };
  }

  const resistance = resistanceValue(resistor.value);
  if (!Number.isFinite(resistance) || resistance <= 0) return { state: "blocked", message: "The latching LED circuit requires a numeric positive series resistor.", validation };
  const ledCurrentA = onPosition ? Math.max(0, (sourceVoltage - ledVf) / resistance) : 0;
  const resistorPowerW = ledCurrentA ** 2 * resistance;
  const ledPowerW = ledCurrentA * ledVf;
  const sourcePowerW = sourceVoltage * ledCurrentA;
  if (![ledCurrentA, resistorPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The latching LED result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical ideal latching SPDT LED switch",
    message: "Calculated a low-voltage LED circuit selected by an ideal latching SPDT contact. Contact bounce, resistance, component tolerance/rating, thermal behavior, and general SPICE are not included.",
    result: {
      kind: "latching-led-switch",
      switchPosition: onPosition ? "A" : "B",
      ledOn: ledCurrentA > 0.0005,
      sourceVoltage,
      ledVf,
      ledCurrentA,
      sourceCurrentA: ledCurrentA,
      resistorPowerW,
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - resistorPowerW - ledPowerW
    },
    validation
  };
}

function analyseLedPolarityIndicator(project, { source, resistors, redLed, greenLed, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const redVf = forwardVoltage(redLed.value);
  const greenVf = forwardVoltage(greenLed.value);
  if (![sourceVoltage, redVf, greenVf].every(Number.isFinite) || redVf <= 0 || greenVf <= 0) {
    return { state: "blocked", message: "The polarity indicator requires a numeric signed DC source voltage and positive LED forward voltages.", validation };
  }

  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  const redAnode = netByEndpoint.get(endpoint(redLed, "A"));
  const redCathode = netByEndpoint.get(endpoint(redLed, "K"));
  const greenAnode = netByEndpoint.get(endpoint(greenLed, "A"));
  const greenCathode = netByEndpoint.get(endpoint(greenLed, "K"));
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet
    || !redAnode || redCathode !== groundNet || greenAnode !== groundNet || !greenCathode) {
    return { state: "blocked", message: "Wire the red LED from source positive toward ground and the green LED in the opposite direction across the same source.", validation };
  }

  const isBetween = (resistor, firstNet, secondNet) => {
    const first = netByEndpoint.get(endpoint(resistor, "1"));
    const second = netByEndpoint.get(endpoint(resistor, "2"));
    return (first === firstNet && second === secondNet) || (first === secondNet && second === firstNet);
  };
  const redResistor = resistors.find((resistor) => isBetween(resistor, sourcePositive, redAnode));
  const greenResistor = resistors.find((resistor) => resistor !== redResistor && isBetween(resistor, sourcePositive, greenCathode));
  if (!redResistor || !greenResistor) return { state: "blocked", message: "Each anti-parallel LED requires its own series resistor between the supply node and the LED anode/cathode path.", validation };

  const redResistance = resistanceValue(redResistor.value);
  const greenResistance = resistanceValue(greenResistor.value);
  if (![redResistance, greenResistance].every(Number.isFinite) || redResistance <= 0 || greenResistance <= 0) {
    return { state: "blocked", message: "Both LED branches need numeric positive series resistors.", validation };
  }

  const polarity = Math.sign(sourceVoltage);
  const redCurrentA = polarity > 0 ? Math.max(0, (sourceVoltage - redVf) / redResistance) : 0;
  const greenCurrentA = polarity < 0 ? Math.max(0, (-sourceVoltage - greenVf) / greenResistance) : 0;
  const redPowerW = redCurrentA ** 2 * redResistance;
  const greenPowerW = greenCurrentA ** 2 * greenResistance;
  const ledPowerW = redCurrentA * redVf + greenCurrentA * greenVf;
  const sourceCurrentA = redCurrentA + greenCurrentA;
  const sourcePowerW = Math.abs(sourceVoltage) * sourceCurrentA;
  if (![redCurrentA, greenCurrentA, redPowerW, greenPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The polarity indicator result exceeds the numerically supported range.", validation };
  }
  return {
    state: "complete",
    engine: "Analytical anti-parallel LED polarity indicator",
    message: "Calculated an ideal low-voltage indicator with red and green LEDs in opposite directions, each with its own series resistor. Reverse recovery, LED reverse breakdown, nonlinear curves, tolerance, thermal effects, and general SPICE are not included.",
    result: {
      kind: "led-polarity-indicator",
      sourceVoltage,
      polarity: polarity > 0 ? "positive" : polarity < 0 ? "negative" : "zero",
      redLedOn: redCurrentA > 0.0005,
      greenLedOn: greenCurrentA > 0.0005,
      redCurrentA,
      greenCurrentA,
      sourceCurrentA,
      resistorResults: [
        { reference: redResistor.reference, currentA: redCurrentA, powerW: redPowerW },
        { reference: greenResistor.reference, currentA: greenCurrentA, powerW: greenPowerW }
      ],
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - redPowerW - greenPowerW - ledPowerW
    },
    validation
  };
}

function analysePushbuttonLed(project, { source, resistors, led, pushbutton, ground, validation }) {
  const sourceVoltage = voltageValue(source.value);
  const ledVf = forwardVoltage(led.value);
  const switchValue = String(pushbutton.value).trim().toLowerCase();
  const closed = ["pressed", "closed"].includes(switchValue);
  const open = ["normally open", "open"].includes(switchValue);
  if (!Number.isFinite(sourceVoltage) || sourceVoltage <= 0 || !Number.isFinite(ledVf) || ledVf <= 0) {
    return { state: "blocked", message: "The pushbutton LED model requires positive numeric source voltage and LED forward voltage.", validation };
  }
  if (!closed && !open) return { state: "blocked", message: "Set the momentary pushbutton value to Normally open or Pressed.", validation };

  const netByEndpoint = new Map();
  for (const net of project.nets) for (const item of net.endpoints) netByEndpoint.set(item, net.id);
  const sourcePositive = netByEndpoint.get(endpoint(source, "+"));
  const sourceNegative = netByEndpoint.get(endpoint(source, "-"));
  const switchInput = netByEndpoint.get(endpoint(pushbutton, "1"));
  const switchOutput = netByEndpoint.get(endpoint(pushbutton, "2"));
  const ledAnode = netByEndpoint.get(endpoint(led, "A"));
  const ledCathode = netByEndpoint.get(endpoint(led, "K"));
  const groundNet = netByEndpoint.get(endpoint(ground, "0"));
  if (!sourcePositive || sourcePositive === groundNet || sourceNegative !== groundNet || switchInput !== sourcePositive
    || !switchOutput || switchOutput === sourcePositive || ledCathode !== groundNet || !ledAnode) {
    return { state: "blocked", message: "Wire source positive through the pushbutton, then through the LED resistor and LED to the shared source-negative/ground net.", validation };
  }

  const seriesResistor = resistors.find((resistor) => {
    const first = netByEndpoint.get(endpoint(resistor, "1"));
    const second = netByEndpoint.get(endpoint(resistor, "2"));
    return (first === switchOutput && second === ledAnode) || (second === switchOutput && first === ledAnode);
  });
  const pullDown = resistors.find((resistor) => {
    if (resistor === seriesResistor) return false;
    const first = netByEndpoint.get(endpoint(resistor, "1"));
    const second = netByEndpoint.get(endpoint(resistor, "2"));
    return (first === switchOutput && second === groundNet) || (second === switchOutput && first === groundNet);
  });
  if (!seriesResistor || !pullDown) return { state: "blocked", message: "The circuit requires a series LED resistor and a pull-down resistor from the switched node to ground.", validation };

  const seriesResistance = resistanceValue(seriesResistor.value);
  const pullDownResistance = resistanceValue(pullDown.value);
  if (![seriesResistance, pullDownResistance].every(Number.isFinite) || seriesResistance <= 0 || pullDownResistance <= 0) {
    return { state: "blocked", message: "Both the LED series resistor and pull-down resistor need numeric positive resistance values.", validation };
  }

  const ledCurrentA = closed ? Math.max(0, (sourceVoltage - ledVf) / seriesResistance) : 0;
  const pullDownCurrentA = closed ? sourceVoltage / pullDownResistance : 0;
  const sourceCurrentA = ledCurrentA + pullDownCurrentA;
  const seriesPowerW = ledCurrentA ** 2 * seriesResistance;
  const pullDownPowerW = closed ? sourceVoltage ** 2 / pullDownResistance : 0;
  const ledPowerW = ledCurrentA * ledVf;
  const sourcePowerW = sourceVoltage * sourceCurrentA;
  if (![ledCurrentA, pullDownCurrentA, sourceCurrentA, seriesPowerW, pullDownPowerW, ledPowerW, sourcePowerW].every(Number.isFinite)) {
    return { state: "blocked", message: "The pushbutton LED calculation exceeds the numerically supported range.", validation };
  }

  return {
    state: "complete",
    engine: "Analytical ideal pushbutton LED circuit",
    message: "Calculated the low-voltage series-switch LED circuit with an ideal momentary switch, a pull-down resistor, and a fixed LED forward-voltage model. Physical switch bounce, tolerances, LED curve, resistor ratings, and general SPICE are not included.",
    result: {
      kind: "pushbutton-led",
      switchState: closed ? "pressed" : "normally-open",
      ledOn: ledCurrentA > 0.0005,
      sourceVoltage,
      ledVf,
      ledCurrentA,
      sourceCurrentA,
      pullDownCurrentA,
      outputVoltageV: closed ? sourceVoltage : 0,
      resistorResults: [
        { reference: seriesResistor.reference, currentA: ledCurrentA, powerW: seriesPowerW },
        { reference: pullDown.reference, currentA: pullDownCurrentA, powerW: pullDownPowerW }
      ],
      ledPowerW,
      sourcePowerW,
      powerBalanceW: sourcePowerW - seriesPowerW - pullDownPowerW - ledPowerW
    },
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

