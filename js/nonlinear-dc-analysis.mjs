import { findLibraryPart, validateProject } from "./core.mjs";

const MAX_COMPONENTS = 64;
const MAX_NODES = 48;
const MAX_ITERATIONS = 80;
const MAX_WORK = 12_000_000;
const RESIDUAL_LIMIT = 1e-8;
const GMIN_SIEMENS = 1e-12;
const MAX_EXP_ARGUMENT = 30;
const Q = 1.602176634e-19;
const K = 1.380649e-23;
const ALLOWED = new Set(["power.dc-source", "power.dc-current-source", "passive.resistor", "diode.shockley-generic", "ground.signal"]);

function parseScalar(text, defaultUnit = "") {
  const match = String(text).trim().match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(p|n|u|µ|μ|m|k|K|M|G)?\s*([a-zA-ZΩ]*)$/i);
  if (!match) return NaN;
  const unit = match[3] || defaultUnit;
  if (unit.toLowerCase() !== defaultUnit.toLowerCase()) return NaN;
  const scale = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, "μ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 }[match[2]] ?? 1;
  const value = Number(match[1]) * scale;
  return Number.isFinite(value) ? value : NaN;
}

function diodeModel(value) {
  const fields = Object.fromEntries(String(value).split(/[;,]/).map((part) => part.trim()).filter(Boolean).map((part) => {
    const match = part.match(/^([A-Za-z]+)\s*=\s*(.+)$/);
    return match ? [match[1].toLowerCase(), match[2]] : ["", ""];
  }).filter(([key]) => key));
  const saturationCurrentA = parseScalar(fields.is ?? "", "A");
  const idealityFactor = Number(fields.n);
  if (!Number.isFinite(saturationCurrentA) || saturationCurrentA < 1e-18 || saturationCurrentA > 1e-2 || !Number.isFinite(idealityFactor) || idealityFactor < 1 || idealityFactor > 3 || Object.keys(fields).some((key) => !["is", "n"].includes(key))) return null;
  return { saturationCurrentA, idealityFactor };
}

function solve(matrix, rhs, size) {
  const a = matrix.slice(), b = rhs.slice();
  for (let column = 0; column < size; column += 1) {
    let pivot = column, largest = Math.abs(a[column * size + column]);
    for (let row = column + 1; row < size; row += 1) {
      const candidate = Math.abs(a[row * size + column]);
      if (candidate > largest) { largest = candidate; pivot = row; }
    }
    if (!(largest > 0) || !Number.isFinite(largest)) return null;
    if (pivot !== column) {
      for (let item = column; item < size; item += 1) [a[column * size + item], a[pivot * size + item]] = [a[pivot * size + item], a[column * size + item]];
      [b[column], b[pivot]] = [b[pivot], b[column]];
    }
    const diagonal = a[column * size + column];
    for (let row = column + 1; row < size; row += 1) {
      const factor = a[row * size + column] / diagonal;
      if (!Number.isFinite(factor)) return null;
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
  let relativeResidual = 0;
  for (let row = 0; row < size; row += 1) {
    let actual = 0, scale = Math.abs(rhs[row]);
    for (let column = 0; column < size; column += 1) {
      const product = matrix[row * size + column] * x[column];
      actual += product;
      scale += Math.abs(product);
    }
    relativeResidual = Math.max(relativeResidual, Math.abs(actual - rhs[row]) / Math.max(scale, Number.MIN_VALUE));
  }
  return Number.isFinite(relativeResidual) ? { x, relativeResidual } : null;
}

function stampConductance(matrix, rhs, size, index, nodeA, nodeB, conductance, equivalentCurrent = 0) {
  const a = nodeA === index.ground ? undefined : index.nodes.get(nodeA);
  const b = nodeB === index.ground ? undefined : index.nodes.get(nodeB);
  if (a !== undefined) { matrix[a * size + a] += conductance; rhs[a] -= equivalentCurrent; }
  if (b !== undefined) { matrix[b * size + b] += conductance; rhs[b] += equivalentCurrent; }
  if (a !== undefined && b !== undefined) { matrix[a * size + b] -= conductance; matrix[b * size + a] -= conductance; }
}

function diodeCurrent(model, voltage, thermalVoltage) {
  const scale = model.idealityFactor * thermalVoltage;
  const argument = voltage / scale;
  let exponential;
  if (argument > MAX_EXP_ARGUMENT) exponential = Math.exp(MAX_EXP_ARGUMENT) * (1 + argument - MAX_EXP_ARGUMENT);
  else if (argument < -MAX_EXP_ARGUMENT) exponential = Math.exp(-MAX_EXP_ARGUMENT);
  else exponential = Math.exp(argument);
  const currentA = model.saturationCurrentA * (exponential - 1);
  const conductanceS = Math.max(model.saturationCurrentA * exponential / scale, GMIN_SIEMENS);
  return { currentA, conductanceS };
}

function nonlinearResidual(x, { nodes, index, resistors, diodes, voltageSources, currentSources, thermalVoltage }) {
  const imbalance = new Float64Array(nodes.length), scale = new Float64Array(nodes.length);
  const voltageAt = (net) => net === index.ground ? 0 : x[index.nodes.get(net)];
  const addBranchCurrent = (nodeA, nodeB, currentAtoB) => {
    const a = nodeA === index.ground ? undefined : index.nodes.get(nodeA);
    const b = nodeB === index.ground ? undefined : index.nodes.get(nodeB);
    if (a !== undefined) { imbalance[a] += currentAtoB; scale[a] += Math.abs(currentAtoB); }
    if (b !== undefined) { imbalance[b] -= currentAtoB; scale[b] += Math.abs(currentAtoB); }
  };
  for (const branch of resistors) addBranchCurrent(branch.nodeA, branch.nodeB, (voltageAt(branch.nodeA) - voltageAt(branch.nodeB)) / branch.resistance);
  for (const branch of diodes) addBranchCurrent(branch.nodeA, branch.nodeB, diodeCurrent(branch, voltageAt(branch.nodeA) - voltageAt(branch.nodeB), thermalVoltage).currentA);
  for (const branch of currentSources) addBranchCurrent(branch.positiveNet, branch.negativeNet, -branch.value);
  voltageSources.forEach((branch, offset) => addBranchCurrent(branch.positiveNet, branch.negativeNet, x[nodes.length + offset]));
  let maximum = 0;
  for (let i = 0; i < nodes.length; i += 1) maximum = Math.max(maximum, Math.abs(imbalance[i]) / Math.max(scale[i], 1e-15));
  voltageSources.forEach((branch) => {
    const error = voltageAt(branch.positiveNet) - voltageAt(branch.negativeNet) - branch.value;
    maximum = Math.max(maximum, Math.abs(error) / Math.max(1, Math.abs(branch.value)));
  });
  return maximum;
}

function branchValue(item, pin, terminalMap) { return terminalMap.get(`${item.instanceId}:${pin}`); }

export function runNonlinearDcOperatingPoint(project) {
  const validation = validateProject(project);
  const base = { engine: "Bounded nonlinear DC modified nodal analysis", engineId: "adigun-shockley-dc-mna", engineVersion: "1.0.0", validation };
  if (!validation.valid) return { state: "blocked", ...base, message: "Fix project errors before running nonlinear DC analysis." };
  const config = project?.shockleyDcOperatingPoint;
  if (!config || typeof config !== "object" || Array.isArray(config)) return { state: "blocked", ...base, message: "Select the Shockley DC operating-point analysis and set its temperature." };
  const temperatureC = Number(config.temperatureC ?? 25);
  if (!Number.isFinite(temperatureC) || temperatureC < -100 || temperatureC > 200) return { state: "blocked", ...base, message: "Junction temperature must be between −100 °C and 200 °C." };
  const components = project.components;
  if (!components.length || components.length > MAX_COMPONENTS) return { state: "blocked", ...base, message: `This solver accepts 1 to ${MAX_COMPONENTS} components.` };
  const unsupported = components.find((part) => !ALLOWED.has(part.libraryId));
  if (unsupported) return { state: "unsupported", ...base, message: `${unsupported.reference} (${findLibraryPart(unsupported.libraryId)?.type ?? unsupported.libraryId}) has no model in this nonlinear DC solver.` };
  const grounds = components.filter((part) => part.libraryId === "ground.signal");
  if (grounds.length !== 1) return { state: "blocked", ...base, message: "Connect exactly one signal-ground reference." };
  const terminalMap = new Map();
  for (const net of project.nets) for (const pin of net.endpoints) {
    if (terminalMap.has(pin)) return { state: "blocked", ...base, message: `Pin ${pin} is assigned to multiple nets.` };
    terminalMap.set(pin, net.id);
  }
  const ground = branchValue(grounds[0], "0", terminalMap);
  if (!ground) return { state: "blocked", ...base, message: "Connect the signal-ground pin to a named net." };

  const resistors = [], diodes = [], voltageSources = [], currentSources = [];
  for (const item of components) {
    if (item.libraryId === "ground.signal") continue;
    if (item.libraryId === "passive.resistor") {
      const resistance = parseScalar(item.value, "Ω"), nodeA = branchValue(item, "1", terminalMap), nodeB = branchValue(item, "2", terminalMap);
      if (!Number.isFinite(resistance) || resistance <= 0 || !nodeA || !nodeB || nodeA === nodeB) return { state: "blocked", ...base, message: `${item.reference} needs a positive resistance and two distinct connected nets.` };
      resistors.push({ reference: item.reference, nodeA, nodeB, resistance });
    } else if (item.libraryId === "diode.shockley-generic") {
      const model = diodeModel(item.value), nodeA = branchValue(item, "A", terminalMap), nodeB = branchValue(item, "K", terminalMap);
      if (!model || !nodeA || !nodeB || nodeA === nodeB) return { state: "blocked", ...base, message: `${item.reference} needs valid Is and n model fields and two distinct connected nets.` };
      diodes.push({ reference: item.reference, nodeA, nodeB, ...model });
    } else {
      const positiveNet = branchValue(item, "+", terminalMap), negativeNet = branchValue(item, "-", terminalMap);
      if (!positiveNet || !negativeNet || positiveNet === negativeNet) return { state: "blocked", ...base, message: `${item.reference} needs two distinct connected source nets.` };
      const value = parseScalar(item.value, item.libraryId === "power.dc-source" ? "V" : "A");
      if (!Number.isFinite(value)) return { state: "blocked", ...base, message: `${item.reference} needs a finite ${item.libraryId === "power.dc-source" ? "voltage" : "current"} value.` };
      const branch = { reference: item.reference, positiveNet, negativeNet, value };
      if (item.libraryId === "power.dc-source") voltageSources.push(branch);
      else currentSources.push(branch);
    }
  }
  if (!voltageSources.length && !currentSources.length) return { state: "blocked", ...base, message: "Add at least one independent DC voltage or current source." };
  if (!diodes.length) return { state: "blocked", ...base, message: "Add at least one generic Shockley diode to use this analysis." };

  const branches = [...resistors, ...diodes, ...voltageSources, ...currentSources];
  const graph = new Map();
  const link = (a, b) => { if (!graph.has(a)) graph.set(a, new Set()); if (!graph.has(b)) graph.set(b, new Set()); graph.get(a).add(b); graph.get(b).add(a); };
  for (const branch of branches) link(branch.nodeA ?? branch.positiveNet, branch.nodeB ?? branch.negativeNet);
  const reachable = new Set([ground]), queue = [ground];
  while (queue.length) for (const next of graph.get(queue.shift()) ?? []) if (!reachable.has(next)) { reachable.add(next); queue.push(next); }
  const allNets = [...graph.keys()].sort();
  const floating = allNets.find((net) => !reachable.has(net));
  if (floating) return { state: "blocked", ...base, message: `Net ${floating} is disconnected from signal ground; no operating point was fabricated.` };
  const nodes = allNets.filter((net) => net !== ground);
  if (!nodes.length || nodes.length > MAX_NODES) return { state: "blocked", ...base, message: `This solver accepts 1 to ${MAX_NODES} non-reference nets.` };
  const dimension = nodes.length + voltageSources.length;
  if (dimension ** 3 * MAX_ITERATIONS > MAX_WORK) return { state: "blocked", ...base, message: "The circuit exceeds the bounded nonlinear solve-work limit." };
  const index = { ground, nodes: new Map(nodes.map((node, offset) => [node, offset])) };
  const thermalVoltage = K * (temperatureC + 273.15) / Q;
  if (!(thermalVoltage > 0)) return { state: "blocked", ...base, message: "The requested temperature does not produce a valid thermal voltage." };
  let x = new Float64Array(dimension), lastSolve = null, lastNonlinearResidual = Infinity, converged = false, iterations = 0;
  for (iterations = 1; iterations <= MAX_ITERATIONS; iterations += 1) {
    const matrix = Array(dimension * dimension).fill(0), rhs = Array(dimension).fill(0);
    for (const branch of resistors) stampConductance(matrix, rhs, dimension, index, branch.nodeA, branch.nodeB, 1 / branch.resistance);
    for (const branch of diodes) {
      const a = branch.nodeA === ground ? undefined : index.nodes.get(branch.nodeA), b = branch.nodeB === ground ? undefined : index.nodes.get(branch.nodeB);
      const voltage = (a === undefined ? 0 : x[a]) - (b === undefined ? 0 : x[b]);
      const model = diodeCurrent(branch, voltage, thermalVoltage);
      stampConductance(matrix, rhs, dimension, index, branch.nodeA, branch.nodeB, model.conductanceS, model.currentA - model.conductanceS * voltage);
    }
    currentSources.forEach((branch) => {
      const positive = branch.positiveNet === ground ? undefined : index.nodes.get(branch.positiveNet);
      const negative = branch.negativeNet === ground ? undefined : index.nodes.get(branch.negativeNet);
      if (positive !== undefined) rhs[positive] += branch.value;
      if (negative !== undefined) rhs[negative] -= branch.value;
    });
    voltageSources.forEach((branch, offset) => {
      const row = nodes.length + offset;
      const positive = branch.positiveNet === ground ? undefined : index.nodes.get(branch.positiveNet);
      const negative = branch.negativeNet === ground ? undefined : index.nodes.get(branch.negativeNet);
      if (positive !== undefined) { matrix[positive * dimension + row] += 1; matrix[row * dimension + positive] += 1; }
      if (negative !== undefined) { matrix[negative * dimension + row] -= 1; matrix[row * dimension + negative] -= 1; }
      rhs[row] = branch.value;
    });
    const solved = solve(matrix, rhs, dimension);
    if (!solved || solved.relativeResidual > RESIDUAL_LIMIT) return { state: "blocked", ...base, message: "The nonlinear operating point is singular or numerically unstable; no result was fabricated.", convergenceState: "failed" };
    const delta = solved.x.map((value, i) => value - x[i]);
    const maxVoltageStep = Math.max(0, ...delta.slice(0, nodes.length).map(Math.abs));
    const damping = maxVoltageStep > 0.5 ? 0.5 / maxVoltageStep : 1;
    const updated = Float64Array.from(x, (value, i) => value + delta[i] * damping);
    const maxVoltageDelta = Math.max(0, ...Array.from(updated.slice(0, nodes.length), (value, i) => Math.abs(value - x[i])));
    x = updated;
    lastSolve = solved;
    lastNonlinearResidual = nonlinearResidual(x, { nodes, index, resistors, diodes, voltageSources, currentSources, thermalVoltage });
    if (maxVoltageDelta < 1e-9 && lastNonlinearResidual <= RESIDUAL_LIMIT) { converged = true; break; }
  }
  if (!converged || !lastSolve) return { state: "blocked", ...base, message: `The diode operating point did not converge within ${MAX_ITERATIONS} iterations; no result was fabricated.`, convergenceState: "failed" };
  const nodeVoltages = Object.fromEntries([[ground, 0], ...nodes.map((node, i) => [node, x[i]])]);
  const diodeResults = diodes.map((branch) => {
    const voltage = nodeVoltages[branch.nodeA] - nodeVoltages[branch.nodeB];
    const currentA = diodeCurrent(branch, voltage, thermalVoltage).currentA;
    return { reference: branch.reference, voltage, currentA, powerW: voltage * currentA, saturationCurrentA: branch.saturationCurrentA, idealityFactor: branch.idealityFactor };
  });
  const resistorResults = resistors.map((branch) => {
    const voltage = nodeVoltages[branch.nodeA] - nodeVoltages[branch.nodeB], currentA = voltage / branch.resistance;
    return { reference: branch.reference, voltage, currentA, powerW: voltage * currentA };
  });
  const sourceResults = voltageSources.map((branch, i) => {
    const currentA = x[nodes.length + i];
    return { reference: branch.reference, voltage: branch.value, currentA, powerDeliveredW: -branch.value * currentA };
  });
  const currentResults = currentSources.map((branch) => {
    const voltage = nodeVoltages[branch.positiveNet] - nodeVoltages[branch.negativeNet];
    return { reference: branch.reference, voltage, currentA: branch.value, powerDeliveredW: voltage * branch.value };
  });
  const passivePowerW = [...resistorResults, ...diodeResults].reduce((sum, item) => sum + item.powerW, 0);
  const sourcePowerW = [...sourceResults.map((item) => item.powerDeliveredW), ...currentResults.map((item) => item.powerDeliveredW)].reduce((sum, value) => sum + value, 0);
  return {
    state: "complete", ...base,
    message: "Solved a bounded DC operating point with generic Shockley junctions and ideal independent sources. The diode values are model parameters, not manufacturer-verified part data.",
    convergenceState: "converged", warnings: [{ code: "GENERIC_SHOCKLEY_LIMITS", message: "Generic ideal Shockley model only: no series resistance, reverse breakdown, junction capacitance, self-heating, temperature-dependent saturation current, or general SPICE. A 1 pS small-signal floor is used only to stabilize Newton iterations." }],
    analysisSettings: { temperatureC, maxIterations: MAX_ITERATIONS, residualLimit: RESIDUAL_LIMIT, diodeModel: "ideal-shockley-v1" },
    modelIds: ["ideal-r-v1", "ideal-dc-voltage-source-v1", "ideal-dc-current-source-v1", "generic-shockley-diode-v1"],
    numericalEvidence: { iterations, maximumRelativeResidual: lastNonlinearResidual, nonlinearKclAndConstraintResidual: lastNonlinearResidual, linearizedSolveResidual: lastSolve.relativeResidual },
    result: { kind: "nonlinear-dc-operating-point", temperatureC, iterations, maximumRelativeResidual: lastNonlinearResidual, nonlinearKclAndConstraintResidual: lastNonlinearResidual, linearizedSolveResidual: lastSolve.relativeResidual, nodeVoltages, resistors: resistorResults, diodes: diodeResults, voltageSources: sourceResults, currentSources: currentResults, passivePowerW, sourcePowerW, powerBalanceW: passivePowerW - sourcePowerW }
  };
}
