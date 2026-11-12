import assert from "node:assert/strict";
import test from "node:test";
import { addComponent, connectPins, createEmptyProject } from "../js/core.mjs";
import { exportSpiceNetlist } from "../js/spice-netlist.mjs";

function makeCircuit() {
  let project = createEmptyProject({ name: "SPICE export smoke" });
  for (const id of ["power.dc-source", "passive.resistor", "passive.capacitor", "ground.signal"]) project = addComponent(project, id);
  const pin = (reference, terminal) => `${project.components.find((part) => part.reference === reference).instanceId}:${terminal}`;
  for (const [a, b] of [
    [pin("V1", "+"), pin("R1", "1")], [pin("R1", "2"), pin("C1", "1")],
    [pin("C1", "2"), pin("V1", "-")], [pin("GND1", "0"), pin("V1", "-")]
  ]) project = connectPins(project, a, b);
  return {
    ...project,
    components: project.components.map((part) => part.reference === "V1" ? { ...part, value: "5 V" } : part.reference === "R1" ? { ...part, value: "1 kΩ" } : part.reference === "C1" ? { ...part, value: "1 µF" } : part)
  };
}

function makeCurrentCircuit() {
  let project = createEmptyProject({ name: "Current source export" });
  for (const id of ["power.dc-current-source", "passive.resistor", "ground.signal"]) project = addComponent(project, id);
  const pin = (reference, terminal) => `${project.components.find((part) => part.reference === reference).instanceId}:${terminal}`;
  for (const [a, b] of [
    [pin("I1", "+"), pin("R1", "1")], [pin("R1", "2"), pin("I1", "-")],
    [pin("GND1", "0"), pin("I1", "-")]
  ]) project = connectPins(project, a, b);
  return {
    ...project,
    components: project.components.map((part) => part.reference === "I1" ? { ...part, value: "10 mA" } : part.reference === "R1" ? { ...part, value: "1 kΩ" } : part)
  };
}

test("SPICE export writes connected ideal source, resistor and capacitor cards in SI units", () => {
  const result = exportSpiceNetlist(makeCircuit());
  assert.equal(result.ok, true, result.error);
  assert.match(result.netlist, /^SPICE export smoke\n\* Generic ideal independent source/m);
  assert.match(result.netlist, /V1 N1 0 5\n/);
  assert.match(result.netlist, /R1 N1 N2 1000\n/);
  assert.match(result.netlist, /C1 N2 0 0\.000001\n/);
  assert.match(result.netlist, /No analysis directive or manufacturer-specific device model is included\./);
  assert.match(result.netlist, /\.end\n$/);
});

test("SPICE export preserves a negative DC source value", () => {
  const project = makeCircuit();
  project.components = project.components.map((part) => part.reference === "V1" ? { ...part, value: "-5 V" } : part);
  const result = exportSpiceNetlist(project);
  assert.equal(result.ok, true, result.error);
  assert.match(result.netlist, /V1 N1 0 -5\n/);
});

test("SPICE export maps positive ideal current from the app's minus pin to plus pin", () => {
  const result = exportSpiceNetlist(makeCurrentCircuit());
  assert.equal(result.ok, true, result.error);
  assert.match(result.netlist, /I1 0 N1 0\.01\n/);
  assert.match(result.netlist, /R1 N1 0 1000\n/);
});

test("SPICE export preserves negative current-source polarity and microampere prefixes", () => {
  const project = makeCurrentCircuit();
  project.components = project.components.map((part) => part.reference === "I1" ? { ...part, value: "-2.5 µA" } : part);
  const result = exportSpiceNetlist(project);
  assert.equal(result.ok, true, result.error);
  assert.match(result.netlist, /I1 0 N1 -0\.0000025\n/);
});

test("SPICE export blocks nonzero source values that underflow to zero", () => {
  const project = makeCurrentCircuit();
  project.components = project.components.map((part) => part.reference === "I1" ? { ...part, value: "1e-9999 A" } : part);
  assert.match(exportSpiceNetlist(project).error, /finite A value/);
});

test("SPICE export requires at least one supported circuit element", () => {
  let project = createEmptyProject();
  project = addComponent(project, "ground.signal");
  project = addComponent(project, "ground.signal");
  const groundPin = (reference) => `${project.components.find((part) => part.reference === reference).instanceId}:0`;
  project = connectPins(project, groundPin("GND1"), groundPin("GND2"));
  assert.match(exportSpiceNetlist(project).error, /at least one connected source or passive component/);
});

test("SPICE export blocks unsupported, floating-ground, and invalid-value projects", () => {
  let project = addComponent(makeCircuit(), "active.logic-and-ideal");
  assert.match(exportSpiceNetlist(project).error, /no generic SPICE export model/);

  project = makeCircuit();
  project.nets = project.nets.filter((net) => !net.endpoints.includes(`${project.components.find((part) => part.reference === "GND1").instanceId}:0`));
  assert.match(exportSpiceNetlist(project).error, /signal-ground/);

  project = makeCircuit();
  project.components = project.components.map((part) => part.reference === "R1" ? { ...part, value: "0 Ω" } : part);
  assert.match(exportSpiceNetlist(project).error, /finite positive Ω value/);
});
