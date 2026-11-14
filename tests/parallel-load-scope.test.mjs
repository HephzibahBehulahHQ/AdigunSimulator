import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";

test("5 V Parallel Resistor Load exposes solved constant-voltage scope channels", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/004-parallel-resistor-load.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.equal(analysis.result.kind, "resistive-network");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "dc");
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  const channels = scopeChannels(project, analysis, live);
  assert.ok(channels.includes("GND"));
  assert.ok(channels.includes("VCC"));
  assert.ok(channels.includes("MID"));
  for (const [net, voltage] of [["GND", 0], ["VCC", 5], ["MID", 5 / 3]]) {
    const trace = scopeTrace(project, analysis, live, net);
    assert.equal(trace.kind, "dc");
    assert.equal(trace.model, "Resistive network DC solution");
    assert.ok(Math.abs(trace.voltage - voltage) < 1e-9, net);
    assert.equal(trace.points[0][1], trace.points[1][1]);
  }
});
