import { findLibraryPart, validateProject } from "./core.mjs";

const MAX_COMPONENTS = 64;
const MAX_NODES = 48;
const MAX_STEPS = 2000;
const MAX_SOLVE_WORK = 8_000_000;
const RESIDUAL_LIMIT = 1e-8;
const ALLOWED = new Set(["power.dc-source", "passive.resistor", "passive.capacitor", "passive.inductor", "ground.signal"]);

function valueOf(value, unit) {
  const match = String(value).trim().match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(p|n|u|µ|μ|m|k|K|M|G)?\s*(Ω|ohm|ohms|F|H|V)?$/);
  if (!match) return NaN;
  const supplied = match[3] || unit;
  const valid = unit === "Ω" ? /^(?:Ω|ohms?)$/i.test(supplied) : supplied.toUpperCase() === unit;
  if (!valid) return NaN;
  const scale = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, "μ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 }[match[2]] ?? 1;
  const result = Number(match[1]) * scale;
  return Number.isFinite(result) ? result : NaN;
}

function terminalMap(project) {
  const result = new Map();
  for (const net of project.nets) for (const endpoint of net.endpoints) {
    if (result.has(endpoint)) throw new Error(`Pin ${endpoint} is assigned to more than one net.`);
    result.set(endpoint, net.id);
  }
  return result;
}

function solve(matrix, rhs, size) {
  const a = matrix.slice(), b = rhs.slice();
  for (let column = 0; column < size; column += 1) {
    let pivot = column, largest = Math.abs(a[column * size + column]);
    for (let row = column + 1; row < size; row += 1) {
      const score = Math.abs(a[row * size + column]);
      if (score > largest) { largest = score; pivot = row; }
    }
    if (!(largest > Number.EPSILON) || !Number.isFinite(largest)) return null;
    if (pivot !== column) {
      for (let item = column; item < size; item += 1) [a[column * size + item], a[pivot * size + item]] = [a[pivot * size + item], a[column * size + item]];
      [b[column], b[pivot]] = [b[pivot], b[column]];
    }
    const diagonal = a[column * size + column];
    for (let row = column + 1; row < size; row += 1) {
      const factor = a[row * size + column] / diagonal;
      if (factor === 0) continue;
      a[row * size + column] = 0;
      for (let item = column + 1; item < size; item += 1) a[row * size + item] -= factor * a[column * size + item];
      b[row] -= factor * b[column];
    }
  }
  const x = new Float64Array(size);
  for (let row = size - 1; row >= 0; row -= 1) {
    let value = b[row];
    for (let column = row + 1; column < size; column += 1) value -= a[row * size + column] * x[column];
    x[row] = value / a[row * size + row];
    if (!Number.isFinite(x[row])) return null;
  }
  let residual = 0, scale = 0;
  for (let row = 0; row < size; row += 1) {
    let sum = 0, rowScale = Math.abs(rhs[row]);
    for (let column = 0; column < size; column += 1) { const entry = matrix[row * size + column]; sum += entry * x[column]; rowScale += Math.abs(entry * x[column]); }
    residual = Math.max(residual, Math.abs(sum - rhs[row]) / Math.max(rowScale, Number.MIN_VALUE));
    scale = Math.max(scale, rowScale);
  }
  return Number.isFinite(residual) && residual <= RESIDUAL_LIMIT ? { x, residual, scale } : null;
}

function stampConductance(matrix, size, nodeA, nodeB, conductance) {
  const a = nodeA < 0 ? undefined : nodeA, b = nodeB < 0 ? undefined : nodeB;
  if (a !== undefined) matrix[a * size + a] += conductance;
  if (b !== undefined) matrix[b * size + b] += conductance;
  if (a !== undefined && b !== undefined) { matrix[a * size + b] -= conductance; matrix[b * size + a] -= conductance; }
}

function stampCurrent(rhs, nodeA, nodeB, currentFromAToB) {
  if (nodeA >= 0) rhs[nodeA] -= currentFromAToB;
  if (nodeB >= 0) rhs[nodeB] += currentFromAToB;
}

export function runLinearRlcTransient(project) {
  const validation = validateProject(project);
  const blocked = (message) => ({ state: "blocked", engine: "Linear RLC transient MNA", message, errors: [{ code: "LINEAR_RLC_TRANSIENT", message }], warnings: [], validation, result: null });
  if (!validation.valid) return blocked("Fix project schema errors before running the transient analysis.");
  const config = project.linearRlcTransient;
  if (!config || typeof config !== "object" || Array.isArray(config)) return blocked("A linear RLC transient configuration is required.");
  const components = project.components;
  if (!components.length || components.length > MAX_COMPONENTS) return blocked(`The bounded transient solver accepts 1 to ${MAX_COMPONENTS} components.`);
  const unsupported = components.find((component) => !ALLOWED.has(component.libraryId));
  if (unsupported) return { ...blocked(`${unsupported.reference} (${findLibraryPart(unsupported.libraryId)?.type ?? unsupported.libraryId}) has no model in the linear RLC transient solver.`), state: "unsupported" };
  const stopSeconds = Number(config.stopSeconds), timeStepSeconds = Number(config.timeStepSeconds);
  if (!(stopSeconds > 0 && Number.isFinite(stopSeconds) && timeStepSeconds > 0 && Number.isFinite(timeStepSeconds))) return blocked("Stop time and time step must be finite positive values.");
  const steps = Math.round(stopSeconds / timeStepSeconds);
  if (steps < 2 || steps > MAX_STEPS || Math.abs(steps * timeStepSeconds - stopSeconds) > Math.max(1e-12, stopSeconds * 1e-9)) return blocked(`Choose an integer number of time steps between 2 and ${MAX_STEPS}.`);

  const sources = components.filter((item) => item.libraryId === "power.dc-source").map((item) => ({ item, voltage: valueOf(item.value, "V") }));
  const resistors = components.filter((item) => item.libraryId === "passive.resistor").map((item) => ({ item, value: valueOf(item.value, "Ω") }));
  const capacitors = components.filter((item) => item.libraryId === "passive.capacitor").map((item) => ({ item, value: valueOf(item.value, "F") }));
  const inductors = components.filter((item) => item.libraryId === "passive.inductor").map((item) => ({ item, value: valueOf(item.value, "H") }));
  const grounds = components.filter((item) => item.libraryId === "ground.signal");
  if (!sources.length || grounds.length !== 1) return blocked("Connect at least one DC voltage source and exactly one signal-ground reference.");
  if (sources.some((part) => !Number.isFinite(part.voltage)) || resistors.some((part) => !(part.value > 0 && Number.isFinite(part.value))) || capacitors.some((part) => !(part.value > 0 && Number.isFinite(part.value))) || inductors.some((part) => !(part.value > 0 && Number.isFinite(part.value)))) return blocked("Use finite positive DC source, resistance, capacitance, and inductance values with compatible units.");

  let endpointNet;
  try { endpointNet = terminalMap(project); } catch (error) { return blocked(error.message); }
  const pinsByPart = new Map();
  for (const part of components) {
    const pins = findLibraryPart(part.libraryId)?.pins ?? [];
    const expectedPins = part.libraryId === "power.dc-source" ? ["+", "-"] : part.libraryId === "ground.signal" ? ["0"] : ["1", "2"];
    if (expectedPins.some((pin) => !pins.includes(pin) || !endpointNet.has(`${part.instanceId}:${pin}`))) return blocked(`${part.reference} has an unconnected terminal; connect every modeled pin before analysis.`);
    pinsByPart.set(part.instanceId, expectedPins);
  }
  const groundNet = endpointNet.get(`${grounds[0].instanceId}:0`);
  if (project.nets.some((net) => net.id !== groundNet && net.endpoints.some((endpoint) => endpoint.startsWith(`${grounds[0].instanceId}:`)))) return blocked("Connect the signal-ground symbol to one reference net only.");
  const netIds = [...new Set(components.flatMap((part) => pinsByPart.get(part.instanceId).map((pin) => endpointNet.get(`${part.instanceId}:${pin}`))))].filter((id) => id !== groundNet);
  if (netIds.length > MAX_NODES) return blocked(`The bounded transient solver accepts at most ${MAX_NODES} non-reference nets.`);
  const node = new Map(netIds.map((id, index) => [id, index]));
  const nodeOf = (part, pin) => node.get(endpointNet.get(`${part.instanceId}:${pin}`)) ?? -1;
  const outputNet = config.outputNet || netIds.at(-1);
  if (!node.has(outputNet)) return blocked("Choose a connected non-reference output net to probe.");
  const size = netIds.length + sources.length;
  if (!size) return blocked("The circuit has no non-reference nodes to solve.");
  const estimatedWork = size ** 3 * steps;
  if (estimatedWork > MAX_SOLVE_WORK) return blocked(`This run needs ${estimatedWork.toLocaleString()} solve operations; the configured work limit is ${MAX_SOLVE_WORK.toLocaleString()}. Increase the time step or simplify the circuit.`);

  const sourceIndexes = new Map(sources.map(({ item }, index) => [item.instanceId, netIds.length + index]));
  const capacitorState = new Map(capacitors.map(({ item }) => [item.instanceId, { voltage: 0, current: 0 }]));
  const inductorState = new Map(inductors.map(({ item }) => [item.instanceId, { voltage: 0, current: 0 }]));
  const samples = [{ timeSeconds: 0, voltageV: 0 }];
  let maximumResidual = 0;
  for (let step = 1; step <= steps; step += 1) {
    const matrix = new Float64Array(size * size), rhs = new Float64Array(size);
    for (const { item, value } of resistors) stampConductance(matrix, size, nodeOf(item, "1"), nodeOf(item, "2"), 1 / value);
    for (const { item, value } of capacitors) {
      const g = 2 * value / timeStepSeconds, state = capacitorState.get(item.instanceId);
      const a = nodeOf(item, "1"), b = nodeOf(item, "2");
      stampConductance(matrix, size, a, b, g);
      stampCurrent(rhs, a, b, -g * state.voltage - state.current);
    }
    for (const { item, value } of inductors) {
      const g = timeStepSeconds / (2 * value), state = inductorState.get(item.instanceId);
      const a = nodeOf(item, "1"), b = nodeOf(item, "2");
      stampConductance(matrix, size, a, b, g);
      stampCurrent(rhs, a, b, state.current + g * state.voltage);
    }
    for (const { item, voltage } of sources) {
      const row = sourceIndexes.get(item.instanceId), a = nodeOf(item, "+"), b = nodeOf(item, "-");
      if (a >= 0) { matrix[a * size + row] += 1; matrix[row * size + a] += 1; }
      if (b >= 0) { matrix[b * size + row] -= 1; matrix[row * size + b] -= 1; }
      rhs[row] = voltage;
    }
    const solved = solve(matrix, rhs, size);
    if (!solved) return blocked(`The transient MNA system is singular or exceeds the residual tolerance at step ${step}; check grounding, ideal-source loops, and topology.`);
    maximumResidual = Math.max(maximumResidual, solved.residual);
    const voltageOf = (part, pin) => { const index = nodeOf(part, pin); return index < 0 ? 0 : solved.x[index]; };
    for (const { item, value } of capacitors) {
      const state = capacitorState.get(item.instanceId), voltage = voltageOf(item, "1") - voltageOf(item, "2");
      state.current = 2 * value / timeStepSeconds * (voltage - state.voltage) - state.current;
      state.voltage = voltage;
    }
    for (const { item, value } of inductors) {
      const state = inductorState.get(item.instanceId), voltage = voltageOf(item, "1") - voltageOf(item, "2");
      state.current = timeStepSeconds / (2 * value) * (voltage + state.voltage) + state.current;
      state.voltage = voltage;
    }
    samples.push({ timeSeconds: step * timeStepSeconds, voltageV: solved.x[node.get(outputNet)] });
  }
  return {
    state: "complete", engine: "Linear RLC transient modified nodal analysis",
    message: "Bounded linear RLC transient solved with trapezoidal companion models. DC sources step instantaneously at t=0; capacitor voltages and inductor currents start at zero.",
    errors: [], warnings: [{ code: "LINEAR_RLC_MODEL_LIMITS", message: "Ideal sources and passive RLC parts only; no ESR, parasitics, nonlinear devices, source rise time, impulsive-current detail, thermal model, or general SPICE." }],
    validation,
    result: { kind: "linear-rlc-transient", outputNet, stopSeconds, timeStepSeconds, sampleCount: samples.length, integration: "trapezoidal companion model", initialConditions: { capacitorVoltageV: 0, inductorCurrentA: 0 }, maximumRelativeResidual: maximumResidual, modelIds: ["linear-rlc-trapezoidal-transient-v1"], samples }
  };
}
