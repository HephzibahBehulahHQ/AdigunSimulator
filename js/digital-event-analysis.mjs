import { findLibraryPart, validateProject } from "./core.mjs";

const MAX_COMPONENTS = 64;
const MAX_EVENTS = 2000;
const MAX_STOP_NS = 1_000_000_000;
const GATE_MODELS = new Map([
  ["active.logic-and-ideal", { operation: "and", inputs: ["A", "B"] }],
  ["active.logic-or-ideal", { operation: "or", inputs: ["A", "B"] }],
  ["active.logic-xor-ideal", { operation: "xor", inputs: ["A", "B"] }],
  ["active.logic-nor-ideal", { operation: "nor", inputs: ["A", "B"] }]
]);

function voltage(value) {
  const match = String(value).trim().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(m|u|µ|μ|k)?\s*(?:V)?$/i);
  if (!match) return Number.NaN;
  const scale = { m: 1e-3, u: 1e-6, "µ": 1e-6, "μ": 1e-6, k: 1e3 }[match[2]] ?? 1;
  const result = Number(match[1]) * scale;
  return Number.isFinite(result) ? result : Number.NaN;
}

function blocked(message, validation, state = "blocked") {
  return { state, engine: "Ideal digital discrete-event engine", message, validation };
}

export function runDigitalEventSimulation(project) {
  const validation = validateProject(project);
  if (!validation.valid) return blocked("Fix project errors before running the digital event simulation.", validation);
  const config = project.digitalEventSimulation;
  if (!config || typeof config !== "object" || Array.isArray(config)) return blocked("A digital event simulation configuration is required.", validation);
  if (project.components.length > MAX_COMPONENTS) return blocked(`The bounded digital solver accepts at most ${MAX_COMPONENTS} components.`, validation);
  const unsupported = project.components.find((part) => part.libraryId !== "power.dc-source" && !GATE_MODELS.has(part.libraryId) && !["ground.signal", "instrument.logic-probe"].includes(part.libraryId));
  if (unsupported) return blocked(`${unsupported.reference} (${findLibraryPart(unsupported.libraryId)?.type ?? unsupported.libraryId}) has no model in this digital solver.`, validation, "unsupported");
  const pinToNet = new Map();
  for (const net of project.nets) for (const pin of net.endpoints) pinToNet.set(pin, net.id);
  const sources = project.components.filter((part) => part.libraryId === "power.dc-source");
  const gates = project.components.filter((part) => GATE_MODELS.has(part.libraryId));
  const grounds = project.components.filter((part) => part.libraryId === "ground.signal");
  const logicProbes = project.components.filter((part) => part.libraryId === "instrument.logic-probe");
  if (!sources.length || !gates.length || grounds.length !== 1) return blocked("Connect at least one ideal DC source, one supported logic gate, and exactly one signal ground.", validation);
  const groundNet = pinToNet.get(`${grounds[0].instanceId}:0`);
  const supplySources = sources.filter((part) => gates.some((gate) => pinToNet.get(`${part.instanceId}:+`) === pinToNet.get(`${gate.instanceId}:VCC`)));
  const supply = supplySources[0];
  const supplyVoltage = supply ? voltage(supply.value) : Number.NaN;
  if (supplySources.length !== 1 || !groundNet || !Number.isFinite(supplyVoltage) || supplyVoltage <= 0 || pinToNet.get(`${supply.instanceId}:-`) !== groundNet) {
    return blocked("Connect one positive DC supply to every gate VCC pin and connect its negative terminal to the shared signal ground.", validation);
  }
  const thresholdLowV = supplyVoltage * 0.2;
  const thresholdHighV = supplyVoltage * 0.8;
  const inputSources = sources.filter((part) => part !== supply);
  const inputByReference = new Map(inputSources.map((part) => [part.reference, part]));
  const readInput = (source, raw) => {
    const value = voltage(raw);
    if (!Number.isFinite(value) || pinToNet.get(`${source.instanceId}:-`) !== groundNet || value < 0 || value > supplyVoltage) return null;
    if (value <= thresholdLowV) return 0;
    if (value >= thresholdHighV) return 1;
    return null;
  };
  const inputLevels = new Map();
  for (const source of inputSources) {
    const level = readInput(source, source.value);
    if (level === null) return blocked(`${source.reference} must be grounded and use a low (≤${thresholdLowV} V) or high (≥${thresholdHighV} V) ideal logic level within the supply range.`, validation);
    inputLevels.set(source.reference, level);
  }
  const gateModels = gates.map((gate) => {
    const model = GATE_MODELS.get(gate.libraryId);
    const inputNets = model.inputs.map((pin) => pinToNet.get(`${gate.instanceId}:${pin}`));
    const outputNet = pinToNet.get(`${gate.instanceId}:Y`);
    if (inputNets.some((net) => !net) || !outputNet || pinToNet.get(`${gate.instanceId}:VCC`) !== pinToNet.get(`${supply.instanceId}:+`) || pinToNet.get(`${gate.instanceId}:GND`) !== groundNet) return null;
    return { reference: gate.reference, operation: model.operation, inputNets, outputNet };
  });
  if (gateModels.some((gate) => !gate)) return blocked("Each gate needs connected inputs, output, VCC, and common ground pins.", validation);
  const stopTimeNs = Number(config.stopTimeNs);
  const events = config.events;
  const probeNets = config.probeNets;
  if (!Number.isSafeInteger(stopTimeNs) || stopTimeNs < 0 || stopTimeNs > MAX_STOP_NS) return blocked(`Set an integer stop time from 0 to ${MAX_STOP_NS} ns.`, validation);
  if (!Array.isArray(events) || events.length > MAX_EVENTS) return blocked(`Provide at most ${MAX_EVENTS} ordered or unordered input events.`, validation);
  const availableNets = new Set(pinToNet.values());
  if (!Array.isArray(probeNets) || !probeNets.length || probeNets.some((net) => typeof net !== "string" || !availableNets.has(net))) return blocked("Choose one or more existing named nets to probe.", validation);
  const instrumentedNets = new Set(logicProbes.map((probe) => pinToNet.get(`${probe.instanceId}:IN`)).filter(Boolean));
  if (probeNets.some((net) => !instrumentedNets.has(net))) return blocked("Add an ideal logic probe to every selected net before measuring its digital trace.", validation);
  const duplicateProbes = new Set(probeNets).size !== probeNets.length;
  if (duplicateProbes) return blocked("Each probe net may be selected only once.", validation);
  const seenEvents = new Set();
  for (const event of events) {
    if (!event || !Number.isSafeInteger(event.timeNs) || event.timeNs < 0 || event.timeNs > stopTimeNs || typeof event.sourceReference !== "string" || typeof event.high !== "boolean") return blocked("Each input event requires an integer time in range, a source reference, and a Boolean logic level.", validation);
    const source = inputByReference.get(event.sourceReference);
    if (!source) return blocked(`Event source ${event.sourceReference} is not a digital input source.`, validation);
    const key = `${event.timeNs}:${event.sourceReference}`;
    if (seenEvents.has(key)) return blocked(`Conflicting or duplicate events target ${event.sourceReference} at ${event.timeNs} ns.`, validation);
    seenEvents.add(key);
  }

  const drivers = new Map();
  for (const source of inputSources) {
    const net = pinToNet.get(`${source.instanceId}:+`);
    if (!net || drivers.has(net)) return blocked(`Digital input net ${net ?? "(unconnected)"} has no unique source driver.`, validation);
    drivers.set(net, { kind: "input", reference: source.reference });
  }
  for (const gate of gateModels) {
    if (drivers.has(gate.outputNet)) return blocked(`Net ${gate.outputNet} has multiple digital drivers.`, validation);
    drivers.set(gate.outputNet, { kind: "gate", reference: gate.reference });
  }
  const probes = [...probeNets];
  const trace = Object.fromEntries(probes.map((net) => [net, []]));
  const sequence = new Map();
  for (const source of inputSources) sequence.set(source.reference, inputLevels.get(source.reference));
  const evaluate = () => {
    const values = new Map();
    for (const [net, driver] of drivers) if (driver.kind === "input") values.set(net, sequence.get(driver.reference));
    let settled = false;
    for (let pass = 0; pass <= gateModels.length; pass += 1) {
      let changed = false;
      for (const gate of gateModels) {
        const [a, b] = gate.inputNets.map((net) => values.get(net));
        if ((a !== 0 && a !== 1) || (b !== 0 && b !== 1)) continue;
        const output = gate.operation === "and" ? a & b : gate.operation === "or" ? a | b : gate.operation === "xor" ? a ^ b : Number(!(a | b));
        if (values.get(gate.outputNet) !== output) { values.set(gate.outputNet, output); changed = true; }
      }
      if (!changed) { settled = true; break; }
    }
    if (!settled || gateModels.some((gate) => values.get(gate.outputNet) !== 0 && values.get(gate.outputNet) !== 1)) return null;
    return values;
  };
  const record = (timeNs, values, force = false) => {
    for (const net of probes) {
      const level = values.get(net);
      if (level !== 0 && level !== 1) return false;
      const series = trace[net];
      if (force || series.at(-1)?.high !== Boolean(level)) series.push({ timeNs, high: Boolean(level) });
    }
    return true;
  };
  const initial = evaluate();
  if (!initial) return blocked("The gate network is floating, cyclic without a stable state, or has an unresolved input. No logic values were fabricated.", validation);
  if (!record(0, initial, true)) return blocked("Every probed net must resolve to a logic 0 or 1.", validation);
  const orderedEvents = [...events].sort((a, b) => a.timeNs - b.timeNs || a.sourceReference.localeCompare(b.sourceReference));
  for (let index = 0; index < orderedEvents.length;) {
    const timeNs = orderedEvents[index].timeNs;
    while (index < orderedEvents.length && orderedEvents[index].timeNs === timeNs) {
      const event = orderedEvents[index++];
      sequence.set(event.sourceReference, Number(event.high));
    }
    const values = evaluate();
    if (!values || !record(timeNs, values)) return blocked(`The gate network did not settle to defined logic levels at ${timeNs} ns.`, validation);
  }
  return {
    state: "complete",
    engine: "Ideal digital discrete-event logic simulation",
    engineId: "adigun-digital-events",
    engineVersion: "1.0.0",
    message: "Simulates deterministic zero-delay AND, OR, XOR, and NOR gates using ideal DC sources as digital inputs. Simultaneous input changes are applied atomically. Analog voltages, propagation delays, metastability, electrical loading, and sequential elements are not modeled.",
    validation,
    convergenceState: "settled",
    warnings: [],
    analysisSettings: { stopTimeNs, eventCount: events.length, probes, thresholdLowV, thresholdHighV, timingModel: "zero-delay; simultaneous events atomic" },
    modelIds: [...new Set(gateModels.map((gate) => `ideal-digital-${gate.operation}-v1`)), "ideal-dc-logic-input-v1"],
    timestamp: new Date().toISOString(),
    result: { kind: "digital-event-simulation", stopTimeNs, processedEvents: events.length, probeNets: probes, trace }
  };
}
