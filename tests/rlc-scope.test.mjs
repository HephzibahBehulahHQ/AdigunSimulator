import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalScopeRecording } from "../js/analytical-scope-recording.mjs";

test("RLC transient scope preserves the modeled capacitor waveform and topology", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/148-rlc-transient-response.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.equal(analysis.result.kind, "rlc-step-response");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "transient");
  assert.equal(timeline.length, analysis.result.sampleCount);
  const live = { status: "ready", kind: "transient", sampleIndex: timeline.length - 1, data: timeline.frame(timeline.length - 1) };
  const channels = scopeChannels(project, analysis, live);
  assert.ok(channels.includes("L_C"));
  assert.ok(channels.includes("VCC"));
  assert.ok(channels.includes("GND"));
  const trace = scopeTrace(project, analysis, live, "L_C");
  assert.equal(trace.model, "RLC step response (analytical model samples)");
  assert.equal(trace.points.length, analysis.result.samples.length);
  assert.equal(trace.points.at(-1)[0], analysis.result.durationS);
  assert.equal(trace.points[1][1], analysis.result.samples[1].capacitorVoltageV);
  assert.ok(analysis.result.samples.some(sample => sample.capacitorVoltageV > analysis.result.sourceVoltage));
  const unwired = structuredClone(project);
  unwired.nets = unwired.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "inductor-1:2") })).filter(net => net.endpoints.length);
  assert.equal(analyticalScopeRecording(unwired, analysis), null);
});

