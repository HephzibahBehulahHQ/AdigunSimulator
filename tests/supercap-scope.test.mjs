import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";

test("supercapacitor hold-up scope follows the solved discharge samples", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/010-supercapacitor-hold-up.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "transient");
  const live = { status: "ready", kind: "transient", sampleIndex: timeline.length - 1, data: timeline.frame(timeline.length - 1) };
  const channels = scopeChannels(project, analysis, live);
  assert.ok(channels.includes("CAP_LOAD"));
  assert.ok(channels.includes("SUPPLY"));
  assert.ok(channels.includes("GND"));
  const trace = scopeTrace(project, analysis, live, "CAP_LOAD");
  assert.equal(trace.kind, "transient");
  assert.match(trace.model, /analytical model samples/);
  assert.equal(trace.points.length, analysis.result.samples.length);
  assert.equal(trace.points[0][1], analysis.result.samples[0].voltage);
  assert.equal(trace.points.at(-1)[1], analysis.result.samples.at(-1).voltage);
  const unwired = structuredClone(project);
  unwired.nets = unwired.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "diode-1:K") })).filter(net => net.endpoints.length);
  assert.equal((await import("../js/analytical-scope-recording.mjs")).analyticalScopeRecording(unwired, analysis), null);
});

