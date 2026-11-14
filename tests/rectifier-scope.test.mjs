import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalScopeRecording } from "../js/analytical-scope-recording.mjs";

test("bridge rectifier and smoothing capacitor expose modeled output waveforms", async () => {
  for (const [name, expectedKind] of [["015-bridge-rectifier", "bridge-rectifier-waveform"], ["016-smoothing-capacitor", "bridge-smoothing-capacitor"]]) {
    const project = JSON.parse(await readFile(new URL(`../examples/${name}.adigun.json`, import.meta.url), "utf8"));
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete", name);
    assert.equal(analysis.result.kind, expectedKind, name);
    const timeline = createFeedbackTimeline(project, analysis);
    const live = { status: "ready", kind: "transient", sampleIndex: timeline.length - 1, data: timeline.frame(timeline.length - 1) };
    const channels = scopeChannels(project, analysis, live);
    assert.ok(channels.includes("RECT_POS"), name);
    assert.ok(channels.includes("RECT_NEG"), name);
    const output = scopeTrace(project, analysis, live, "RECT_POS");
    assert.match(output.model, /analytical model samples/, name);
    assert.equal(output.points.length, analysis.result.waveform.length, name);
    for (const [index, sample] of analysis.result.waveform.entries()) {
      assert.equal(output.points[index][0], sample.timeS, name);
      assert.equal(output.points[index][1], sample.outputVoltage, name);
    }
    const disconnected = structuredClone(project);
    disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "bridge-1:POS") })).filter(net => net.endpoints.length);
    assert.equal(analyticalScopeRecording(disconnected, analysis), null, name);
  }
});

