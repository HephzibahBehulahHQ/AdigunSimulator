import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalDcScopeRecording } from "../js/analytical-dc-scope.mjs";

test("linear regulated supply exposes its solved DC output separately from ripple", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/007-linear-regulated-supply.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "dc");
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  const channels = scopeChannels(project, analysis, live);
  assert.ok(channels.includes("DC_5V"));
  assert.ok(channels.includes("DC_GND"));
  const output = scopeTrace(project, analysis, live, "DC_5V");
  assert.equal(output.voltage, analysis.result.outputVoltage);
  assert.equal(output.voltage, 5);
  assert.match(output.model, /ripple voltage reported separately/);
  assert.equal(output.points[0][1], output.points[1][1]);
  const disconnected = structuredClone(project);
  disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "regulator-1:OUT") })).filter(net => net.endpoints.length);
  assert.equal(analyticalDcScopeRecording(disconnected, analysis), null);
});

