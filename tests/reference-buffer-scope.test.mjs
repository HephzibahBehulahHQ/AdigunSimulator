import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";

test("precision reference buffer exposes topology-checked DC scope channels", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/030-reference-buffer.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.equal(analysis.result.kind, "reference-buffer");
  assert.equal(analysis.scopeDcRecording.model, "Ideal op-amp reference-buffer DC estimate");
  const timeline = createFeedbackTimeline(project, analysis);
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  for (const [net, voltage] of [["GND", 0], ["VPLUS", 12], ["VMINUS", -12], ["REFERENCE", 2.5], ["OUTPUT", 2.5]]) {
    assert.ok(scopeChannels(project, analysis, live).includes(net));
    const trace = scopeTrace(project, analysis, live, net);
    assert.equal(trace.kind, "dc");
    assert.equal(trace.model, "Ideal op-amp reference-buffer DC estimate");
    assert.ok(Math.abs(trace.voltage - voltage) < 1e-9, net);
    assert.deepEqual(trace.points.map(point => point[1]), [voltage, voltage]);
  }
});

test("reference-buffer scope refuses an output that is not fed back to the inverting input", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/030-reference-buffer.adigun.json", import.meta.url), "utf8"));
  project.nets.find(net => net.id === "OUTPUT").endpoints = ["opamp:OUT", "load:1"];
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.scopeDcRecording, undefined);
});
