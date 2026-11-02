import assert from "node:assert/strict";
import test from "node:test";
import { addComponent, connectPins, createEmptyProject } from "../js/core.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";

function makeRcLowPass({ startHz = 159.15494309189535, stopHz = startHz, pointsPerDecade = 12 } = {}) {
  let project = createEmptyProject({ name: "Linear AC RC verification" });
  for (const libraryId of ["power.ac-source", "passive.resistor", "passive.capacitor", "ground.signal"]) project = addComponent(project, libraryId);
  const pin = (reference, terminal) => `${project.components.find((item) => item.reference === reference).instanceId}:${terminal}`;
  project = connectPins(project, pin("V1", "+"), pin("R1", "1"));
  project = connectPins(project, pin("R1", "2"), pin("C1", "1"));
  project = connectPins(project, pin("C1", "2"), pin("V1", "-"));
  project = connectPins(project, pin("GND1", "0"), pin("V1", "-"));
  project = {
    ...project,
    components: project.components.map((item) => item.reference === "R1" ? { ...item, value: "1 kΩ" } : item.reference === "C1" ? { ...item, value: "1 µF" } : item),
    linearAcSweep: {
      startHz,
      stopHz,
      pointsPerDecade,
      outputNet: project.nets.find((net) => net.endpoints.includes(pin("R1", "2"))).id
    }
  };
  return project;
}

function makeRlLowPass() {
  let project = createEmptyProject({ name: "Linear AC RL verification" });
  for (const libraryId of ["power.ac-source", "passive.inductor", "passive.resistor", "ground.signal"]) project = addComponent(project, libraryId);
  const pin = (reference, terminal) => `${project.components.find((item) => item.reference === reference).instanceId}:${terminal}`;
  project = connectPins(project, pin("V1", "+"), pin("L1", "1"));
  project = connectPins(project, pin("L1", "2"), pin("R1", "1"));
  project = connectPins(project, pin("R1", "2"), pin("V1", "-"));
  project = connectPins(project, pin("GND1", "0"), pin("V1", "-"));
  return {
    ...project,
    components: project.components.map((item) => item.reference === "R1" ? { ...item, value: "100 Ω" } : item.reference === "L1" ? { ...item, value: "100 mH" } : item),
    linearAcSweep: { startHz: 159.15494309189535, stopHz: 159.15494309189535, pointsPerDecade: 12, outputNet: project.nets.find((net) => net.endpoints.includes(pin("L1", "2"))).id }
  };
}

test("linear AC sweep matches the analytical RC cutoff magnitude and phase", () => {
  const result = runProjectAnalysis(makeRcLowPass());
  assert.equal(result.state, "complete");
  assert.equal(result.engine, "Linear small-signal AC modified nodal analysis");
  assert.equal(result.convergenceState, "converged");
  assert.equal(result.engineVersion, "1.0.0");
  assert.ok(result.numericalEvidence.maximumRelativeResidual <= result.numericalEvidence.relativeResidualLimit);
  assert.equal(result.result.samples.length, 1);
  assert.ok(Math.abs(result.result.samples[0].output.magnitudeV - Math.SQRT1_2) < 1e-10);
  assert.ok(Math.abs(result.result.samples[0].output.phaseDegrees + 45) < 1e-8);
});

test("linear AC sweep samples both requested bounds and rolls off monotonically", () => {
  const result = runProjectAnalysis(makeRcLowPass({ startHz: 10, stopHz: 10000, pointsPerDecade: 10 }));
  assert.equal(result.state, "complete");
  const samples = result.result.samples;
  assert.equal(samples.length, 31);
  assert.equal(samples[0].frequencyHz, 10);
  assert.equal(samples.at(-1).frequencyHz, 10000);
  assert.ok(samples.every((sample, index) => index === 0 || sample.output.magnitudeV < samples[index - 1].output.magnitudeV));
});

test("linear AC modified nodal analysis supports an inductor network", () => {
  const result = runProjectAnalysis(makeRlLowPass());
  assert.equal(result.state, "complete");
  assert.ok(Math.abs(result.result.samples[0].output.magnitudeV - Math.SQRT1_2) < 1e-10);
  assert.ok(Math.abs(result.result.samples[0].output.phaseDegrees + 45) < 1e-8);
});

test("linear AC sweep rejects invalid ranges, unsupported devices, and incomplete pins", () => {
  assert.equal(runProjectAnalysis(makeRcLowPass({ startHz: 0, stopHz: 100 })).state, "blocked");
  assert.equal(runProjectAnalysis(makeRcLowPass({ startHz: 1, stopHz: 1e100, pointsPerDecade: 50 })).state, "blocked");
  assert.equal(runProjectAnalysis({ ...makeRcLowPass(), linearAcSweep: { ...makeRcLowPass().linearAcSweep, outputNet: "MISSING" } }).state, "blocked");
  const unsupported = addComponent(makeRcLowPass(), "diode.led-red");
  assert.equal(runProjectAnalysis(unsupported).state, "unsupported");
  const incomplete = makeRcLowPass();
  const capacitor = incomplete.components.find((item) => item.reference === "C1");
  const broken = { ...incomplete, nets: incomplete.nets.map((net) => ({ ...net, endpoints: net.endpoints.filter((pin) => pin !== `${capacitor.instanceId}:1`) })) };
  assert.equal(runProjectAnalysis(broken).state, "blocked");
});
