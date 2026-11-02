import { findLibraryPart, validateProject } from "./core.mjs";

const MAX_COMPONENTS = 64;
const MAX_NODES = 48;
const MAX_POINTS = 401;
const MAX_SOLVE_WORK = 8_000_000;
const RELATIVE_RESIDUAL_LIMIT = 1e-8;
const ALLOWED_PARTS = new Set(["power.ac-source", "passive.resistor", "passive.capacitor", "passive.inductor", "ground.signal"]);

function parseEngineeringValue(value, unit) {
  const match = String(value).trim().match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(p|n|u|µ|μ|m|k|K|M|G)?\s*(Ω|ohm|ohms|F|H|V)?$/i);
  if (!match) return Number.NaN;
  const suppliedUnit = match[3];
  const validUnit = unit === "Ω" ? /^(?:Ω|ohms?)$/i.test(suppliedUnit ?? "Ω")
    : unit === "F" ? /^(?:F)?$/i.test(suppliedUnit ?? "F")
      : unit === "H" ? /^(?:H)?$/i.test(suppliedUnit ?? "H")
        : /^(?:V)?$/i.test(suppliedUnit ?? "V");
  if (!validUnit) return Number.NaN;
  const exponent = { p: -12, n: -9, u: -6, "µ": -6, "μ": -6, m: -3, k: 3, K: 3, M: 6, G: 9 }[match[2]] ?? 0;
  const result = Number(match[1]) * 10 ** exponent;
  return Number.isFinite(result) ? result : Number.NaN;
}

function magnitude(re, im) { return Math.hypot(re, im); }

function divide(aRe, aIm, bRe, bIm) {
  if (Math.abs(bRe) >= Math.abs(bIm)) {
    if (bRe === 0) return [Number.NaN, Number.NaN];
    const ratio = bIm / bRe;
    const denominator = bRe + bIm * ratio;
    return [(aRe + aIm * ratio) / denominator, (aIm - aRe * ratio) / denominator];
  }
  const ratio = bRe / bIm;
  const denominator = bIm + bRe * ratio;
  return [(aRe * ratio + aIm) / denominator, (aIm * ratio - aRe) / denominator];
}

function solveComplexSystem(matrix, rhs, size) {
  const a = matrix.slice();
  const b = rhs.slice();
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    let best = 0;
    for (let row = column; row < size; row += 1) {
      const offset = (row * size + column) * 2;
      const score = Math.hypot(a[offset], a[offset + 1]);
      if (score > best) { best = score; pivot = row; }
    }
    if (!(best > 0) || !Number.isFinite(best)) return null;
    if (pivot !== column) {
      for (let item = 0; item < size * 2; item += 1) {
        const first = column * size * 2 + item;
        const second = pivot * size * 2 + item;
        [a[first], a[second]] = [a[second], a[first]];
      }
      [b[column * 2], b[pivot * 2]] = [b[pivot * 2], b[column * 2]];
      [b[column * 2 + 1], b[pivot * 2 + 1]] = [b[pivot * 2 + 1], b[column * 2 + 1]];
    }
    const pivotOffset = (column * size + column) * 2;
    const pivotRe = a[pivotOffset];
    const pivotIm = a[pivotOffset + 1];
    for (let row = column + 1; row < size; row += 1) {
      const cell = (row * size + column) * 2;
      if (a[cell] === 0 && a[cell + 1] === 0) continue;
      const [factorRe, factorIm] = divide(a[cell], a[cell + 1], pivotRe, pivotIm);
      for (let item = column + 1; item < size; item += 1) {
        const target = (row * size + item) * 2;
        const source = (column * size + item) * 2;
        const productRe = factorRe * a[source] - factorIm * a[source + 1];
        const productIm = factorRe * a[source + 1] + factorIm * a[source];
        a[target] -= productRe;
        a[target + 1] -= productIm;
      }
      const rhsOffset = row * 2;
      const pivotRhs = column * 2;
      b[rhsOffset] -= factorRe * b[pivotRhs] - factorIm * b[pivotRhs + 1];
      b[rhsOffset + 1] -= factorRe * b[pivotRhs + 1] + factorIm * b[pivotRhs];
      a[cell] = 0;
      a[cell + 1] = 0;
    }
  }
  const solution = new Float64Array(size * 2);
  for (let row = size - 1; row >= 0; row -= 1) {
    let re = b[row * 2];
    let im = b[row * 2 + 1];
    for (let column = row + 1; column < size; column += 1) {
      const offset = (row * size + column) * 2;
      const sr = solution[column * 2];
      const si = solution[column * 2 + 1];
      re -= a[offset] * sr - a[offset + 1] * si;
      im -= a[offset] * si + a[offset + 1] * sr;
    }
    const offset = (row * size + row) * 2;
    const [xr, xi] = divide(re, im, a[offset], a[offset + 1]);
    if (!Number.isFinite(xr) || !Number.isFinite(xi)) return null;
    solution[row * 2] = xr;
    solution[row * 2 + 1] = xi;
  }
  let maxRelativeResidual = 0;
  for (let row = 0; row < size; row += 1) {
    let re = 0;
    let im = 0;
    let scale = Math.hypot(rhs[row * 2], rhs[row * 2 + 1]);
    for (let column = 0; column < size; column += 1) {
      const offset = (row * size + column) * 2;
      const ar = matrix[offset];
      const ai = matrix[offset + 1];
      const xr = solution[column * 2];
      const xi = solution[column * 2 + 1];
      re += ar * xr - ai * xi;
      im += ar * xi + ai * xr;
      scale += Math.hypot(ar, ai) * Math.hypot(xr, xi);
    }
    const error = Math.hypot(re - rhs[row * 2], im - rhs[row * 2 + 1]);
    const relative = error / Math.max(scale, Number.MIN_VALUE);
    if (!Number.isFinite(relative)) return null;
    maxRelativeResidual = Math.max(maxRelativeResidual, relative);
  }
  return { solution, relativeResidual: maxRelativeResidual };
}

function addAdmittance(matrix, size, index, nodeA, nodeB, re, im) {
  const a = nodeA === index.ground ? undefined : index.node.get(nodeA);
  const b = nodeB === index.ground ? undefined : index.node.get(nodeB);
  const add = (row, column, sign) => {
    if (row === undefined || column === undefined) return;
    const offset = (row * size + column) * 2;
    matrix[offset] += re * sign;
    matrix[offset + 1] += im * sign;
  };
  add(a, a, 1); add(b, b, 1); add(a, b, -1); add(b, a, -1);
}

export function runLinearAcSweep(project) {
  const validation = validateProject(project);
  if (!validation.valid) return { state: "blocked", engine: "Linear small-signal AC MNA", message: "Fix project errors before running the AC sweep.", validation };
  const config = project.linearAcSweep;
  if (!config || typeof config !== "object" || Array.isArray(config)) return { state: "blocked", engine: "Linear small-signal AC MNA", message: "An AC sweep configuration is required.", validation };
  const components = project.components;
  if (!components.length || components.length > MAX_COMPONENTS) return { state: "blocked", engine: "Linear small-signal AC MNA", message: `The bounded AC solver accepts 1 to ${MAX_COMPONENTS} components.`, validation };
  const unsupported = components.find((part) => !ALLOWED_PARTS.has(part.libraryId));
  if (unsupported) return { state: "unsupported", engine: "Linear small-signal AC MNA", message: `${unsupported.reference} (${findLibraryPart(unsupported.libraryId)?.type ?? unsupported.libraryId}) has no linear AC model in this solver.`, validation };
  const sources = components.filter((part) => part.libraryId === "power.ac-source");
  const grounds = components.filter((part) => part.libraryId === "ground.signal");
  if (!sources.length || grounds.length !== 1) return { state: "blocked", engine: "Linear small-signal AC MNA", message: "Connect at least one AC voltage source and exactly one signal-ground reference.", validation };
  const startHz = Number(config.startHz);
  const stopHz = Number(config.stopHz);
  const pointsPerDecade = Number(config.pointsPerDecade ?? 12);
  if (!Number.isFinite(startHz) || !Number.isFinite(stopHz) || startHz <= 0 || stopHz < startHz || !Number.isInteger(pointsPerDecade) || pointsPerDecade < 1 || pointsPerDecade > 50) {
    return { state: "blocked", engine: "Linear small-signal AC MNA", message: "Set a positive start frequency, a stop frequency at or above start, and 1–50 integer points per decade.", validation };
  }
  const decades = Math.log10(stopHz / startHz);
  const intervals = Math.ceil(decades * pointsPerDecade);
  const pointCount = intervals + 1;
  if (!Number.isFinite(pointCount) || pointCount > MAX_POINTS) return { state: "blocked", engine: "Linear small-signal AC MNA", message: `This sweep exceeds the ${MAX_POINTS}-point limit; reduce the range or point density.`, validation };

  const pinToNet = new Map();
  for (const net of project.nets) for (const pin of net.endpoints) pinToNet.set(pin, net.id);
  const groundNet = pinToNet.get(`${grounds[0].instanceId}:0`);
  if (!groundNet) return { state: "blocked", engine: "Linear small-signal AC MNA", message: "Connect the signal-ground pin to a named net before running AC analysis.", validation };
  const sourceBranches = [];
  for (const source of sources) {
    const positiveNet = pinToNet.get(`${source.instanceId}:+`);
    const negativeNet = pinToNet.get(`${source.instanceId}:-`);
    const amplitude = parseEngineeringValue(source.value, "V");
    const phaseDegrees = Number(source.phaseDegrees ?? 0);
    if (!positiveNet || !negativeNet || positiveNet === negativeNet || !Number.isFinite(amplitude) || amplitude <= 0 || !Number.isFinite(phaseDegrees)) {
      return { state: "blocked", engine: "Linear small-signal AC MNA", message: `${source.reference} needs two distinct connected nets, a positive AC amplitude and a finite phase angle.`, validation };
    }
    sourceBranches.push({ reference: source.reference, positiveNet, negativeNet, amplitude, phaseDegrees });
  }
  const passiveBranches = [];
  for (const part of components.filter((item) => item.libraryId !== "power.ac-source" && item.libraryId !== "ground.signal")) {
    const nodeA = pinToNet.get(`${part.instanceId}:1`);
    const nodeB = pinToNet.get(`${part.instanceId}:2`);
    const unit = part.libraryId === "passive.resistor" ? "Ω" : part.libraryId === "passive.capacitor" ? "F" : "H";
    const value = parseEngineeringValue(part.value, unit);
    if (!nodeA || !nodeB || nodeA === nodeB || !Number.isFinite(value) || value <= 0) {
      return { state: "blocked", engine: "Linear small-signal AC MNA", message: `${part.reference} needs two distinct connected nets and a positive ${unit} value.`, validation };
    }
    passiveBranches.push({ reference: part.reference, libraryId: part.libraryId, nodeA, nodeB, value });
  }
  const allNets = new Set([...sourceBranches.flatMap((branch) => [branch.positiveNet, branch.negativeNet]), ...passiveBranches.flatMap((branch) => [branch.nodeA, branch.nodeB])]);
  const nodes = [...allNets].filter((net) => net !== groundNet).sort();
  if (!nodes.length || nodes.length > MAX_NODES) return { state: "blocked", engine: "Linear small-signal AC MNA", message: `The AC solver accepts 1 to ${MAX_NODES} non-reference nets.`, validation };
  const nodeIndex = new Map(nodes.map((node, index) => [node, index]));
  const matrixIndex = { ground: groundNet, node: nodeIndex };
  const dimension = nodes.length + sourceBranches.length;
  if (dimension ** 3 * pointCount > MAX_SOLVE_WORK) return { state: "blocked", engine: "Linear small-signal AC MNA", message: "This network exceeds the bounded AC solver work limit; reduce the circuit size or sweep density.", validation };
  const samples = [];
  let maximumRelativeResidual = 0;
  if (typeof config.outputNet === "string" && !nodes.includes(config.outputNet)) return { state: "blocked", engine: "Linear small-signal AC MNA", message: "The selected output net is not part of the analyzed circuit.", validation };
  const outputNet = typeof config.outputNet === "string" ? config.outputNet : nodes.find((net) => !sourceBranches.some((source) => source.positiveNet === net));

  for (let sample = 0; sample < pointCount; sample += 1) {
    const frequencyHz = sample === intervals ? stopHz : startHz * 10 ** (sample / pointsPerDecade);
    const omega = 2 * Math.PI * frequencyHz;
    const matrix = new Float64Array(dimension * dimension * 2);
    const rhs = new Float64Array(dimension * 2);
    for (const branch of passiveBranches) {
      let conductanceRe = 0;
      let conductanceIm = 0;
      if (branch.libraryId === "passive.resistor") conductanceRe = 1 / branch.value;
      else if (branch.libraryId === "passive.capacitor") conductanceIm = omega * branch.value;
      else conductanceIm = -1 / (omega * branch.value);
      if (![conductanceRe, conductanceIm].every(Number.isFinite)) return { state: "blocked", engine: "Linear small-signal AC MNA", message: `${branch.reference} produces a non-finite admittance at ${frequencyHz} Hz.`, validation };
      addAdmittance(matrix, dimension, matrixIndex, branch.nodeA, branch.nodeB, conductanceRe, conductanceIm);
    }
    sourceBranches.forEach((branch, sourceIndex) => {
      const currentRow = nodes.length + sourceIndex;
      const positive = branch.positiveNet === groundNet ? undefined : nodeIndex.get(branch.positiveNet);
      const negative = branch.negativeNet === groundNet ? undefined : nodeIndex.get(branch.negativeNet);
      const add = (row, column, sign) => { if (row !== undefined && column !== undefined) matrix[(row * dimension + column) * 2] += sign; };
      add(positive, currentRow, 1); add(currentRow, positive, 1); add(negative, currentRow, -1); add(currentRow, negative, -1);
      const phase = branch.phaseDegrees * Math.PI / 180;
      rhs[currentRow * 2] = branch.amplitude * Math.cos(phase);
      rhs[currentRow * 2 + 1] = branch.amplitude * Math.sin(phase);
    });
    const solved = solveComplexSystem(matrix, rhs, dimension);
    if (!solved || solved.relativeResidual > RELATIVE_RESIDUAL_LIMIT) return { state: "blocked", engine: "Linear small-signal AC MNA", message: `The network is floating, contradictory, singular or numerically unstable at ${Number(frequencyHz.toPrecision(6))} Hz. No result was fabricated.`, validation, convergenceState: "failed" };
    const { solution } = solved;
    maximumRelativeResidual = Math.max(maximumRelativeResidual, solved.relativeResidual);
    const voltages = Object.fromEntries(nodes.map((net, index) => {
      const re = solution[index * 2];
      const im = solution[index * 2 + 1];
      return [net, { magnitudeV: magnitude(re, im), phaseDegrees: Math.atan2(im, re) * 180 / Math.PI }];
    }));
    samples.push({ frequencyHz, nodeVoltages: voltages, output: outputNet ? voltages[outputNet] : null });
  }

  return {
    state: "complete",
    engine: "Linear small-signal AC modified nodal analysis",
    engineId: "adigun-linear-ac-mna",
    engineVersion: "1.0.0",
    message: "Solved a bounded linear RLC network in the frequency domain. AC source and node magnitudes are peak phasors. Resistors, ideal capacitors, ideal inductors, and ideal AC voltage sources are supported. Semiconductor models, parasitics, noise, nonlinear operating-point linearization, RMS conversion, power analysis, and general SPICE are not included.",
    validation,
    convergenceState: "converged",
    warnings: [],
    analysisSettings: { startHz, stopHz, pointsPerDecade, requestedPoints: pointCount, outputNet: outputNet ?? null, frequencyUnit: "Hz", voltageUnit: "V peak", voltageConvention: "peak phasors", frequencyGrid: "logarithmic", relativeResidualLimit: RELATIVE_RESIDUAL_LIMIT },
    modelIds: ["ideal-r-v1", "ideal-c-v1", "ideal-l-v1", "ideal-ac-voltage-source-v1"],
    numericalEvidence: { maximumRelativeResidual, relativeResidualLimit: RELATIVE_RESIDUAL_LIMIT },
    timestamp: new Date().toISOString(),
    result: { kind: "linear-ac-sweep", startHz, stopHz, pointsPerDecade, outputNet: outputNet ?? null, samples }
  };
}
