import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";

test("NPN emitter follower exposes its solved DC operating-point channels", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/032-emitter-follower.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.equal(analysis.result.kind, "npn-emitter-follower");
  const timeline = createFeedbackTimeline(project, analysis);
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  for (const [net, voltage] of [["GND", 0], ["VCC", 5], ["INPUT", 2.5], ["OUTPUT", 1.8]]) {
    assert.ok(scopeChannels(project, analysis, live).includes(net));
    const trace = scopeTrace(project, analysis, live, net);
    assert.equal(trace.model, "Ideal NPN emitter-follower DC estimate");
    assert.ok(Math.abs(trace.voltage - voltage) < 1e-9, net);
    assert.deepEqual(trace.points.map(point => point[1]), [voltage, voltage]);
  }
});

test("emitter follower scope does not record an incorrectly wired output", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/032-emitter-follower.adigun.json", import.meta.url), "utf8"));
  project.nets.find(net => net.id === "OUTPUT").endpoints = ["load:1"];
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "blocked");
  assert.equal(analysis.scopeDcRecording, undefined);
});
