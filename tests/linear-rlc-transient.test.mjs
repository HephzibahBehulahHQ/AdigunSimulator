import assert from "node:assert/strict";
import test from "node:test";
import { addComponent, connectPins, createEmptyProject } from "../js/core.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";

function makeRcCircuit(config = {}) {
  let project = createEmptyProject({ name: "Bounded linear RLC transient verification" });
  for (const id of ["power.dc-source", "passive.resistor", "passive.capacitor", "ground.signal"]) project = addComponent(project, id);
  const pin = (reference, terminal) => `${project.components.find((item) => item.reference === reference).instanceId}:${terminal}`;
  for (const [a, b] of [
    [pin("V1", "+"), pin("R1", "1")], [pin("R1", "2"), pin("C1", "1")],
    [pin("C1", "2"), pin("V1", "-")], [pin("GND1", "0"), pin("V1", "-")]
  ]) project = connectPins(project, a, b);
  const outputNet = project.nets.find((net) => net.endpoints.includes(pin("C1", "1"))).id;
  return {
    ...project,
    components: project.components.map((item) => item.reference === "V1" ? { ...item, value: "5 V" } : item.reference === "R1" ? { ...item, value: "1 kΩ" } : item.reference === "C1" ? { ...item, value: "1 µF" } : item),
    linearRlcTransient: { stopSeconds: 0.005, timeStepSeconds: 0.00001, outputNet, ...config }
  };
}

function makeRlCircuit(config = {}) {
  let project = createEmptyProject({ name: "Bounded linear RL transient verification" });
  for (const id of ["power.dc-source", "passive.resistor", "passive.inductor", "ground.signal"]) project = addComponent(project, id);
  const pin = (reference, terminal) => `${project.components.find((item) => item.reference === reference).instanceId}:${terminal}`;
  for (const [a, b] of [
    [pin("V1", "+"), pin("R1", "1")], [pin("R1", "2"), pin("L1", "1")],
    [pin("L1", "2"), pin("V1", "-")], [pin("GND1", "0"), pin("V1", "-")]
  ]) project = connectPins(project, a, b);
  const outputNet = project.nets.find((net) => net.endpoints.includes(pin("L1", "1"))).id;
  return {
    ...project,
    components: project.components.map((item) => item.reference === "V1" ? { ...item, value: "5 V" } : item.reference === "R1" ? { ...item, value: "1 kΩ" } : item.reference === "L1" ? { ...item, value: "1 H" } : item),
    linearRlcTransient: { stopSeconds: 0.005, timeStepSeconds: 0.00001, outputNet, ...config }
  };
}

function makeSeriesRlcCircuit(config = {}) {
  let project = createEmptyProject({ name: "Bounded series RLC transient verification" });
  for (const id of ["power.dc-source", "passive.resistor", "passive.inductor", "passive.capacitor", "ground.signal"]) project = addComponent(project, id);
  const pin = (reference, terminal) => `${project.components.find((item) => item.reference === reference).instanceId}:${terminal}`;
  for (const [a, b] of [
    [pin("V1", "+"), pin("R1", "1")], [pin("R1", "2"), pin("L1", "1")],
    [pin("L1", "2"), pin("C1", "1")], [pin("C1", "2"), pin("V1", "-")],
    [pin("GND1", "0"), pin("V1", "-")]
  ]) project = connectPins(project, a, b);
  const outputNet = project.nets.find((net) => net.endpoints.includes(pin("C1", "1"))).id;
  return {
    ...project,
    components: project.components.map((item) => item.reference === "V1" ? { ...item, value: "5 V" } : item.reference === "R1" ? { ...item, value: "20 Ω" } : item.reference === "L1" ? { ...item, value: "10 mH" } : item.reference === "C1" ? { ...item, value: "10 µF" } : item),
    linearRlcTransient: { stopSeconds: 0.02, timeStepSeconds: 0.00001, outputNet, ...config }
  };
}

test("linear RLC transient MNA matches an RC step response from zero initial energy", () => {
  const result = runProjectAnalysis(makeRcCircuit());
  assert.equal(result.state, "complete", result.message);
  assert.equal(result.engine, "Linear RLC transient modified nodal analysis");
  assert.equal(result.result.kind, "linear-rlc-transient");
  assert.equal(result.result.samples.length, 501);
  const atTau = result.result.samples[100];
  assert.ok(Math.abs(atTau.voltageV - 5 * (1 - Math.exp(-1))) < 0.012, `${atTau.voltageV} V at one time constant`);
  assert.ok(result.result.samples.at(-1).voltageV > 4.95);
  assert.equal(result.result.initialConditions.capacitorVoltageV, 0);
  assert.equal(result.result.initialConditions.inductorCurrentA, 0);
  assert.equal(result.result.modelIds[0], "linear-rlc-trapezoidal-transient-v1");
});

test("linear RLC transient MNA matches a series RL step response from zero initial current", () => {
  const result = runProjectAnalysis(makeRlCircuit());
  assert.equal(result.state, "complete", result.message);
  assert.equal(result.result.kind, "linear-rlc-transient");
  const atTau = result.result.samples[100];
  assert.ok(Math.abs(atTau.voltageV - 5 / Math.E) < 0.01, `${atTau.voltageV} V across L at one time constant`);
  assert.ok(result.result.samples.at(-1).voltageV < 0.05);
  assert.equal(result.result.initialConditions.inductorCurrentA, 0);
});

test("linear RLC transient resolves damped series-RLC ringing and settles to DC", () => {
  const result = runProjectAnalysis(makeSeriesRlcCircuit());
  assert.equal(result.state, "complete", result.message);
  assert.equal(result.result.sampleCount, 2001);
  const peak = Math.max(...result.result.samples.map((sample) => sample.voltageV));
  assert.ok(peak > 6.5 && peak < 7.0, `expected damped RLC overshoot, got ${peak} V`);
  assert.ok(Math.abs(result.result.samples.at(-1).voltageV - 5) < 0.01);
  assert.ok(result.result.maximumRelativeResidual <= 1e-8);
});

test("linear RLC transient blocks unsupported parts, unconnected pins, and excessive solve work", () => {
  let unsupported = createEmptyProject();
  unsupported = addComponent(unsupported, "active.logic-and-ideal");
  unsupported = { ...unsupported, linearRlcTransient: { stopSeconds: 0.001, timeStepSeconds: 0.00001 } };
  assert.equal(runProjectAnalysis(unsupported).state, "unsupported");

  const disconnected = makeRcCircuit();
  disconnected.nets = disconnected.nets.filter((net) => !net.endpoints.includes(`${disconnected.components.find((part) => part.reference === "C1").instanceId}:2`));
  assert.equal(runProjectAnalysis(disconnected).state, "blocked");

  const excessive = makeRcCircuit({ timeStepSeconds: 0.000001 });
  assert.equal(runProjectAnalysis(excessive).state, "blocked");
});

test("linear RLC transient rejects non-integral step counts and incompatible engineering units", () => {
  assert.equal(runProjectAnalysis(makeRcCircuit({ stopSeconds: 0.005105 })).state, "blocked");
  const badUnits = makeRcCircuit();
  badUnits.components = badUnits.components.map((part) => part.reference === "C1" ? { ...part, value: "1 mH" } : part);
  assert.equal(runProjectAnalysis(badUnits).state, "blocked");
});
