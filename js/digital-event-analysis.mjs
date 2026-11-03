import { findLibraryPart, validateProject } from "./core.mjs";

const MAX_COMPONENTS = 64;
const MAX_EVENTS = 2000;
const MAX_STOP_NS = 1_000_000_000;
const D_FLIP_FLOP = "active.logic-dff-ideal";
const LOGIC_MODELS = new Map([
  ["active.logic-and-ideal", { kind: "gate", operation: "and", inputs: ["A", "B"], outputs: ["Y"] }],
  ["active.logic-or-ideal", { kind: "gate", operation: "or", inputs: ["A", "B"], outputs: ["Y"] }],
  ["active.logic-xor-ideal", { kind: "gate", operation: "xor", inputs: ["A", "B"], outputs: ["Y"] }],
  ["active.logic-nor-ideal", { kind: "gate", operation: "nor", inputs: ["A", "B"], outputs: ["Y"] }],
  ["active.logic-decoder-2to4-ideal", { kind: "decoder-2to4", inputs: ["A0", "A1"], outputs: ["Y0", "Y1", "Y2", "Y3"] }],
  ["active.logic-mux4-ideal", { kind: "mux4", inputs: ["I0", "I1", "I2", "I3", "S0", "S1"], outputs: ["Y"] }]
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
  const unsupported = project.components.find((part) => part.libraryId !== "power.dc-source" && !LOGIC_MODELS.has(part.libraryId) && ![D_FLIP_FLOP, "ground.signal", "instrument.logic-probe"].includes(part.libraryId));
  if (unsupported) return blocked(`${unsupported.reference} (${findLibraryPart(unsupported.libraryId)?.type ?? unsupported.libraryId}) has no model in this digital solver.`, validation, "unsupported");
  const pinToNet = new Map();
  for (const net of project.nets) for (const pin of net.endpoints) pinToNet.set(pin, net.id);
  const sources = project.components.filter((part) => part.libraryId === "power.dc-source");
  const logicParts = project.components.filter((part) => LOGIC_MODELS.has(part.libraryId));
  const flipFlops = project.components.filter((part) => part.libraryId === D_FLIP_FLOP);
  const grounds = project.components.filter((part) => part.libraryId === "ground.signal");
  const logicProbes = project.components.filter((part) => part.libraryId === "instrument.logic-probe");
  if (!sources.length || (!logicParts.length && !flipFlops.length) || grounds.length !== 1) return blocked("Connect an ideal DC supply, at least one supported logic component or D flip-flop, and exactly one signal ground.", validation);
  const groundNet = pinToNet.get(`${grounds[0].instanceId}:0`);
  const poweredParts = [...logicParts, ...flipFlops];
  const supplySources = sources.filter((part) => poweredParts.some((item) => pinToNet.get(`${part.instanceId}:+`) === pinToNet.get(`${item.instanceId}:VCC`)));
  const supply = supplySources[0];
  const supplyVoltage = supply ? voltage(supply.value) : Number.NaN;
  if (supplySources.length !== 1 || !groundNet || !Number.isFinite(supplyVoltage) || supplyVoltage <= 0 || pinToNet.get(`${supply.instanceId}:-`) !== groundNet) {
    return blocked("Connect one positive DC supply to every logic component and D flip-flop VCC pin and connect its negative terminal to the shared signal ground.", validation);
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
  const logicModels = logicParts.map((part) => {
    const model = LOGIC_MODELS.get(part.libraryId);
    const inputNets = model.inputs.map((pin) => pinToNet.get(`${part.instanceId}:${pin}`));
    const outputNets = model.outputs.map((pin) => pinToNet.get(`${part.instanceId}:${pin}`));
    if (inputNets.some((net) => !net) || outputNets.some((net) => !net) || pinToNet.get(`${part.instanceId}:VCC`) !== pinToNet.get(`${supply.instanceId}:+`) || pinToNet.get(`${part.instanceId}:GND`) !== groundNet) return null;
    return { reference: part.reference, ...model, inputNets, outputNets };
  });
  if (logicModels.some((model) => !model)) return blocked("Each supported logic component needs connected inputs, outputs, VCC, and common ground pins.", validation);
  const flipFlopModels = flipFlops.map((flipFlop) => {
    const pin = (name) => pinToNet.get(`${flipFlop.instanceId}:${name}`);
    const model = { reference: flipFlop.reference, dataNet: pin("D"), clockNet: pin("CLK"), qNet: pin("Q"), qBarNet: pin("QBAR"), presetNet: pin("PRE"), clearNet: pin("CLR") };
    if (Object.values(model).some((net) => !net) || pin("VCC") !== pinToNet.get(`${supply.instanceId}:+`) || pin("GND") !== groundNet) return null;
    return model;
  });
  if (flipFlopModels.some((model) => !model)) return blocked("Each D flip-flop needs connected D, CLK, Q, QBAR, PRE, CLR, VCC, and common ground pins.", validation);
  const stopTimeNs = Number(config.stopTimeNs);
  const events = config.events;
  const probeNets = config.probeNets;
  const initialStates = config.initialStates ?? {};
  if (!initialStates || typeof initialStates !== "object" || Array.isArray(initialStates)) return blocked("Initial D flip-flop states must be an object keyed by reference designator.", validation);
  if (flipFlopModels.some((flipFlop) => typeof initialStates[flipFlop.reference] !== "boolean") || Object.keys(initialStates).some((reference) => !flipFlopModels.some((flipFlop) => flipFlop.reference === reference))) return blocked("Provide one explicit Boolean initial state for each D flip-flop, with no unknown references.", validation);
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
  const supplyNet = pinToNet.get(`${supply.instanceId}:+`);
  drivers.set(groundNet, { kind: "rail", level: 0 });
  drivers.set(supplyNet, { kind: "rail", level: 1 });
  for (const source of inputSources) {
    const net = pinToNet.get(`${source.instanceId}:+`);
    if (!net || drivers.has(net)) return blocked(`Digital input net ${net ?? "(unconnected)"} has no unique source driver.`, validation);
    drivers.set(net, { kind: "input", reference: source.reference });
  }
  for (const model of logicModels) {
    for (const outputNet of model.outputNets) {
      if (drivers.has(outputNet)) return blocked(`Net ${outputNet} has multiple digital drivers.`, validation);
      drivers.set(outputNet, { kind: "logic", reference: model.reference });
    }
  }
  for (const flipFlop of flipFlopModels) {
    for (const net of [flipFlop.qNet, flipFlop.qBarNet]) {
      if (drivers.has(net)) return blocked(`Net ${net} has multiple digital drivers.`, validation);
      drivers.set(net, { kind: "flip-flop", reference: flipFlop.reference });
    }
  }
  const probes = [...probeNets];
  const trace = Object.fromEntries(probes.map((net) => [net, []]));
  const sequence = new Map();
  const state = new Map(flipFlopModels.map((flipFlop) => [flipFlop.reference, initialStates[flipFlop.reference]]));
  for (const source of inputSources) sequence.set(source.reference, inputLevels.get(source.reference));
  const evaluate = () => {
    const values = new Map();
    for (const [net, driver] of drivers) {
      if (driver.kind === "rail") values.set(net, driver.level);
      else if (driver.kind === "input") values.set(net, sequence.get(driver.reference));
    }
    for (const flipFlop of flipFlopModels) {
      const q = Number(state.get(flipFlop.reference));
      values.set(flipFlop.qNet, q);
      values.set(flipFlop.qBarNet, Number(!q));
    }
    let settled = false;
    for (let pass = 0; pass <= logicModels.length; pass += 1) {
      let changed = false;
      for (const model of logicModels) {
        const inputs = model.inputNets.map((net) => values.get(net));
        if (inputs.some((level) => level !== 0 && level !== 1)) continue;
        const outputs = model.kind === "decoder-2to4"
          ? model.outputNets.map((_, index) => Number(index === (inputs[0] | (inputs[1] << 1))))
          : model.kind === "mux4"
            ? [inputs[inputs[4] | (inputs[5] << 1)]]
          : [model.operation === "and" ? inputs[0] & inputs[1] : model.operation === "or" ? inputs[0] | inputs[1] : model.operation === "xor" ? inputs[0] ^ inputs[1] : Number(!(inputs[0] | inputs[1]))];
        model.outputNets.forEach((net, index) => {
          if (values.get(net) !== outputs[index]) { values.set(net, outputs[index]); changed = true; }
        });
      }
      if (!changed) { settled = true; break; }
    }
    if (!settled || logicModels.some((model) => model.outputNets.some((net) => values.get(net) !== 0 && values.get(net) !== 1))) return null;
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
  if (!initial) return blocked("The logic network is floating, cyclic without a stable state, or has an unresolved input. No logic values were fabricated.", validation);
  if (flipFlopModels.some((flipFlop) => initial.get(flipFlop.presetNet) !== 1 || initial.get(flipFlop.clearNet) !== 1)) return blocked("The D flip-flop preset and clear pins must remain at a defined inactive-high level; asynchronous controls are not modeled.", validation);
  if (!record(0, initial, true)) return blocked("Every probed net must resolve to a logic 0 or 1.", validation);
  const orderedEvents = [...events].sort((a, b) => a.timeNs - b.timeNs || a.sourceReference.localeCompare(b.sourceReference));
  for (let index = 0; index < orderedEvents.length;) {
    const timeNs = orderedEvents[index].timeNs;
    const previousValues = evaluate();
    while (index < orderedEvents.length && orderedEvents[index].timeNs === timeNs) {
      const event = orderedEvents[index++];
      sequence.set(event.sourceReference, Number(event.high));
    }
    let values = evaluate();
    if (!values) return blocked(`The logic network did not settle at ${timeNs} ns.`, validation);
    for (const flipFlop of flipFlopModels) {
      if (values.get(flipFlop.presetNet) !== 1 || values.get(flipFlop.clearNet) !== 1) return blocked(`The asynchronous preset or clear input on ${flipFlop.reference} is active or undefined at ${timeNs} ns; this engine requires both controls inactive-high.`, validation);
      if (previousValues.get(flipFlop.clockNet) === 0 && values.get(flipFlop.clockNet) === 1) {
        const data = values.get(flipFlop.dataNet);
        if (data !== 0 && data !== 1) return blocked(`${flipFlop.reference} has an undefined D input at its rising clock edge.`, validation);
        state.set(flipFlop.reference, Boolean(data));
      }
    }
    if (flipFlopModels.length) values = evaluate();
    if (!values || !record(timeNs, values)) return blocked(`The logic network did not settle to defined logic levels at ${timeNs} ns.`, validation);
  }
  return {
    state: "complete",
    engine: "Ideal digital discrete-event logic simulation",
    engineId: "adigun-digital-events",
    engineVersion: "1.0.0",
    message: "Simulates deterministic zero-delay AND, OR, XOR, and NOR gates, an ideal active-high two-to-four decoder, a four-to-one multiplexer, and positive-edge D flip-flops with explicit initial state. D flip-flop PRE and CLR must remain inactive-high. Simultaneous input changes are applied atomically. Gate delay, setup/hold time, asynchronous controls, metastability, electrical loading, and analog voltage waveforms are not modeled.",
    validation,
    convergenceState: "settled",
    warnings: [],
    analysisSettings: { stopTimeNs, eventCount: events.length, probes, thresholdLowV, thresholdHighV, timingModel: "zero-delay; simultaneous events atomic" },
    modelIds: [...new Set([...logicModels.map((model) => model.kind === "decoder-2to4" ? "ideal-digital-decoder-2to4-v1" : model.kind === "mux4" ? "ideal-digital-mux4-v1" : `ideal-digital-${model.operation}-v1`), ...(flipFlopModels.length ? ["ideal-positive-edge-d-flip-flop-v1"] : []), "ideal-dc-logic-input-v1"])],
    timestamp: new Date().toISOString(),
    result: { kind: "digital-event-simulation", stopTimeNs, processedEvents: events.length, probeNets: probes, trace }
  };
}

