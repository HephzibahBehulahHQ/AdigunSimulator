import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";

test("NPN common-emitter scope follows its modeled inverted sine samples", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/031-transistor-common-emitter.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.equal(analysis.result.kind, "npn-common-emitter");
  assert.equal(analysis.scopeRecording.samples.length, 9);
  const timeline = createFeedbackTimeline(project, analysis);
  const live = { status: "ready", kind: "transient", sampleIndex: 8, data: timeline.frame(8) };
  assert.ok(scopeChannels(project, analysis, live).includes("OUTPUT_AC"));
  const input = scopeTrace(project, analysis, live, "INPUT_AC");
  const output = scopeTrace(project, analysis, live, "OUTPUT_AC");
  assert.equal(input.kind, "transient");
  assert.equal(output.model, "NPN common-emitter midband sine at 1000 Hz (ideal small-signal estimate, not transient simulation)");
  assert.equal(input.points.length, 9);
  assert.equal(output.points.length, 9);
  assert.ok(input.points[1][1] > 0);
  assert.ok(output.points[1][1] < 0);
  assert.ok(Math.abs(output.points[1][1] - analysis.result.sineTrace[1].outputV) < 1e-12);
  assert.ok(Math.abs(scopeTrace(project, analysis, live, "COLLECTOR").voltage - analysis.result.sineTrace[8].collectorVoltageV) < 1e-12);
});

test("common-emitter scope declines disconnected output load topology", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/031-transistor-common-emitter.adigun.json", import.meta.url), "utf8"));
  project.nets.find(net => net.id === "OUTPUT_AC").endpoints = ["cout:2"];
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "blocked");
  assert.equal(analysis.scopeRecording, undefined);
});
