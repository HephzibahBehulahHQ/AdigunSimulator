import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runNonlinearDcOperatingPoint } from "../js/nonlinear-dc-analysis.mjs";
import { handleSimulationWorkerMessage } from "../js/simulation-worker.mjs";

async function shockleyProject({ value = "Is=2 nA; n=1.8", temperatureC = 25, reverse = false } = {}) {
  const project = JSON.parse(await readFile(new URL("../examples/001-led-current-limiter.adigun.json", import.meta.url), "utf8"));
  const diode = project.components.find((item) => item.reference === "D1");
  diode.libraryId = "diode.shockley-generic";
  diode.value = value;
  if (reverse) for (const net of project.nets) net.endpoints = net.endpoints.map((endpoint) => endpoint === "led-1:A" ? "led-1:K" : endpoint === "led-1:K" ? "led-1:A" : endpoint);
  project.shockleyDcOperatingPoint = { temperatureC };
  return project;
}

async function npnProject({ value = "Is=1e-14 A; alphaF=0.99; alphaR=0.5" } = {}) {
  const project = JSON.parse(await readFile(new URL("../examples/001-led-current-limiter.adigun.json", import.meta.url), "utf8"));
  const source = project.components.find((item) => item.reference === "V1");
  const resistor = project.components.find((item) => item.reference === "R1");
  const device = project.components.find((item) => item.reference === "D1");
  const ground = project.components.find((item) => item.reference === "GND");
  project.components = [
    source,
    { ...resistor, instanceId: "base-resistor", reference: "RB", value: "100 kΩ" },
    { ...resistor, instanceId: "collector-resistor", reference: "RC", value: "1 kΩ" },
    { ...device, libraryId: "active.npn-ebers-moll-generic", reference: "Q1", value },
    ground
  ];
  project.nets = [
    { id: "VCC", endpoints: ["source-1:+", "base-resistor:1", "collector-resistor:1"] },
    { id: "BASE", endpoints: ["base-resistor:2", "led-1:B"] },
    { id: "COLLECTOR", endpoints: ["collector-resistor:2", "led-1:C"] },
    { id: "GND", endpoints: ["source-1:-", "led-1:E", "ground-1:0"] }
  ];
  project.shockleyDcOperatingPoint = { temperatureC: 25 };
  return project;
}

test("bounded Shockley MNA solves a resistor-fed generic silicon diode and balances power", async () => {
  const result = runNonlinearDcOperatingPoint(await shockleyProject());
  assert.equal(result.state, "complete", result.message);
  assert.equal(result.result.kind, "nonlinear-dc-operating-point");
  assert.equal(result.convergenceState, "converged");
  assert.ok(result.result.diodes[0].voltage > 0.4 && result.result.diodes[0].voltage < 0.9);
  assert.ok(result.result.diodes[0].currentA > 0.005 && result.result.diodes[0].currentA < 0.02);
  assert.ok(result.result.maximumRelativeResidual <= 1e-8);
  assert.equal(result.result.maximumRelativeResidual, result.result.nonlinearKclAndConstraintResidual);
  assert.ok(result.result.linearizedSolveResidual <= 1e-8);
  assert.ok(Math.abs(result.result.powerBalanceW) < 1e-7);
  assert.match(result.warnings[0].message, /no .*general SPICE/i);
});

test("nonlinear KCL and power balance include current-source injection direction", async () => {
  const project = await shockleyProject();
  const source = project.components.find((item) => item.reference === "V1");
  source.libraryId = "power.dc-current-source";
  source.reference = "I1";
  source.value = "5 mA";
  const result = runNonlinearDcOperatingPoint(project);
  assert.equal(result.state, "complete", result.message);
  assert.ok(result.result.diodes[0].currentA > 0.0049 && result.result.diodes[0].currentA < 0.0051);
  assert.ok(result.result.nonlinearKclAndConstraintResidual <= 1e-8);
  assert.ok(Math.abs(result.result.powerBalanceW) < 1e-7);
});

test("generic Ebers–Moll NPN solves a common-emitter bias and balances terminal currents and power", async () => {
  const result = runNonlinearDcOperatingPoint(await npnProject());
  assert.equal(result.state, "complete", result.message);
  assert.equal(result.result.transistors.length, 1);
  const transistor = result.result.transistors[0];
  assert.ok(transistor.vBE > 0.55 && transistor.vBE < 0.85);
  assert.ok(transistor.baseCurrentA > 0);
  assert.ok(transistor.collectorCurrentA > 0.001 && transistor.collectorCurrentA < 0.01);
  assert.ok(transistor.emitterCurrentA < 0);
  assert.ok(Math.abs(transistor.baseCurrentA + transistor.collectorCurrentA + transistor.emitterCurrentA) < 1e-10);
  assert.ok(result.result.nonlinearKclAndConstraintResidual <= 1e-8);
  assert.ok(Math.abs(result.result.powerBalanceW) < 1e-7);
  assert.match(result.warnings[0].message, /Early effect/i);
});

test("Ebers–Moll model coefficients outside their physical interval are blocked", async () => {
  const result = runNonlinearDcOperatingPoint(await npnProject({ value: "Is=1e-14 A; alphaF=1; alphaR=0.5" }));
  assert.equal(result.state, "blocked");
  assert.match(result.message, /alphaF/i);
});

test("simulation worker dispatches nonlinear DC mode and returns its solved operating point", async () => {
  const project = await shockleyProject();
  const response = handleSimulationWorkerMessage({ type: "run", requestId: 42, project });
  assert.equal(response.type, "result");
  assert.equal(response.requestId, 42);
  assert.equal(response.result.state, "complete", response.result.message);
  assert.equal(response.result.result.kind, "nonlinear-dc-operating-point");
});

test("reverse-biased generic diode reports leakage with the correct current direction", async () => {
  const result = runNonlinearDcOperatingPoint(await shockleyProject({ reverse: true }));
  assert.equal(result.state, "complete", result.message);
  assert.ok(result.result.diodes[0].voltage < 0);
  assert.ok(result.result.diodes[0].currentA < 0);
  assert.ok(Math.abs(result.result.diodes[0].currentA + 2e-9) < 1e-10);
});

test("Shockley model and analysis temperature are validated without claiming manufacturer data", async () => {
  const project = await shockleyProject({ value: "Is=0; n=1.8" });
  assert.equal(runNonlinearDcOperatingPoint(project).state, "blocked");
  project.components.find((item) => item.reference === "D1").value = "Is=2 nA; n=3.1";
  assert.equal(runNonlinearDcOperatingPoint(project).state, "blocked");
  const invalidTemperature = await shockleyProject({ temperatureC: 201 });
  assert.equal(runNonlinearDcOperatingPoint(invalidTemperature).state, "blocked");
});

test("nonlinear solver blocks floating nodes and unrelated component models", async () => {
  const floating = await shockleyProject();
  floating.nets.find((net) => net.id === "GND").endpoints = floating.nets.find((net) => net.id === "GND").endpoints.filter((endpoint) => endpoint !== "ground-1:0");
  const floatingResult = runNonlinearDcOperatingPoint(floating);
  assert.equal(floatingResult.state, "blocked");
  assert.match(floatingResult.message, /ground/i);

  const unsupported = await shockleyProject();
  unsupported.components.find((item) => item.reference === "D1").libraryId = "diode.led-red";
  const unsupportedResult = runNonlinearDcOperatingPoint(unsupported);
  assert.equal(unsupportedResult.state, "unsupported");
  assert.match(unsupportedResult.message, /no model/i);
});
