import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalScopeRecording } from "../js/analytical-scope-recording.mjs";

test("Arduino button debounce exposes sampled input and GPIO logic traces", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/062-arduino-button-debounce.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "transient");
  const live = { status: "ready", kind: "transient", sampleIndex: timeline.length - 1, data: timeline.frame(timeline.length - 1) };
  const channels = scopeChannels(project, analysis, live);
  assert.ok(channels.includes("BUTTON"));
  assert.ok(channels.includes("D13"));
  const output = scopeTrace(project, analysis, live, "D13");
  assert.equal(output.units, "logic");
  assert.equal(output.points.length, analysis.result.trace.length * 2 - 1);
  assert.ok(output.points.every(([, level]) => [0, 1].includes(level)));
  assert.equal(output.duration, (analysis.result.trace.length - 1) / analysis.result.sampleRateHz);
  const disconnected = structuredClone(project);
  disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "mcu:D13") })).filter(net => net.endpoints.length);
  assert.equal(analyticalScopeRecording(disconnected, analysis), null);
});

