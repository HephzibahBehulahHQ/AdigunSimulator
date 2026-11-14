import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalScopeRecording } from "../js/analytical-scope-recording.mjs";

test("TVS scope shows the modeled rectangular clamp event without edge dynamics", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/018-tvs-surge-clamp.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  const timeline = createFeedbackTimeline(project, analysis);
  const live = { status: "ready", kind: "transient", sampleIndex: timeline.length - 1, data: timeline.frame(timeline.length - 1) };
  const channels = scopeChannels(project, analysis, live);
  assert.ok(channels.includes("VIN"));
  assert.ok(channels.includes("VOUT"));
  assert.ok(channels.includes("GND"));
  const output = scopeTrace(project, analysis, live, "VOUT");
  const input = scopeTrace(project, analysis, live, "VIN");
  assert.match(output.model, /rise time and recovery dynamics omitted/);
  assert.equal(output.points.length, 5);
  assert.equal(output.points[0][1], analysis.result.idleOutputVoltage);
  assert.equal(output.points[1][1], analysis.result.pulseOutputVoltage);
  assert.equal(output.points[2][0], analysis.result.pulseWidthS);
  assert.equal(output.points[3][1], analysis.result.idleOutputVoltage);
  assert.equal(input.points[1][1], analysis.result.pulseVoltage);
  assert.equal(input.duration, 2 * analysis.result.pulseWidthS);
  const disconnected = structuredClone(project);
  disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "tvs-1:K") })).filter(net => net.endpoints.length);
  assert.equal(analyticalScopeRecording(disconnected, analysis), null);
});

