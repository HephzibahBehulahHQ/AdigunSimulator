import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runNonlinearDcOperatingPoint } from "../js/nonlinear-dc-analysis.mjs";

async function shockleyProject({ value = "Is=2 nA; n=1.8", temperatureC = 25, reverse = false } = {}) {
  const project = JSON.parse(await readFile(new URL("../examples/001-led-current-limiter.adigun.json", import.meta.url), "utf8"));
  const diode = project.components.find((item) => item.reference === "D1");
  diode.libraryId = "diode.shockley-generic";
  diode.value = value;
  if (reverse) for (const net of project.nets) net.endpoints = net.endpoints.map((endpoint) => endpoint === "led-1:A" ? "led-1:K" : endpoint === "led-1:K" ? "led-1:A" : endpoint);
  project.shockleyDcOperatingPoint = { temperatureC };
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
  assert.ok(Math.abs(result.result.powerBalanceW) < 1e-7);
  assert.match(result.warnings[0].message, /no .*general SPICE/i);
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
