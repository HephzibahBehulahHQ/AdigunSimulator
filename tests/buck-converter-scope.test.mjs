import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";

async function projectFixture() {
  return JSON.parse(await readFile(new URL("../examples/101-buck-converter-baseline.adigun.json", import.meta.url), "utf8"));
}

test("asynchronous buck example scopes the model's estimated CCM output ripple", async () => {
  const project = await projectFixture();
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.equal(analysis.result.kind, "buck-converter");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "transient");
  assert.equal(timeline.length, 481);
  const live = { status: "ready", kind: "transient", sampleIndex: timeline.length - 1, data: timeline.frame(timeline.length - 1) };
  assert.ok(scopeChannels(project, analysis, live).includes("VOUT"));
  const output = scopeTrace(project, analysis, live, "VOUT");
  const input = scopeTrace(project, analysis, live, "VIN");
  assert.equal(output.model, "Asynchronous buck output ripple estimate at 100000 Hz (CCM capacitor-ripple model; phase-normalized, not switching-transient simulation)");
  assert.equal(output.points.length, 481);
  const values = output.points.map(point => point[1]);
  assert.ok(Math.abs(Math.min(...values) - (analysis.result.outputVoltageV - analysis.result.outputRipplePpV / 2)) < 1e-9);
  assert.ok(Math.abs(Math.max(...values) - (analysis.result.outputVoltageV + analysis.result.outputRipplePpV / 2)) < 1e-9);
  assert.ok(Math.abs(input.voltage - analysis.result.inputVoltageV) < 1e-9);
});

test("buck scope declines a reversed catch-diode circuit", async () => {
  const project = await projectFixture();
  const ground = project.nets.find(net => net.id === "GND"), switching = project.nets.find(net => net.id === "SWITCH");
  ground.endpoints = ground.endpoints.filter(endpoint => endpoint !== "diode:A").concat("diode:K");
  switching.endpoints = switching.endpoints.filter(endpoint => endpoint !== "diode:K").concat("diode:A");
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "blocked");
  assert.equal(analysis.scopeRecording, undefined);
});
