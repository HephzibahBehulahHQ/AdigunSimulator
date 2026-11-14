import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalDcScopeRecording } from "../js/analytical-dc-scope.mjs";

test("zener regulator scope exposes solved input and output DC values", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/017-zener-shunt-regulator.adigun.json", import.meta.url), "utf8"));
  for (const sourceVoltage of [9, 4]) {
    project.components.find(component => component.libraryId === "power.dc-source").value = `${sourceVoltage} V`;
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete");
    const timeline = createFeedbackTimeline(project, analysis);
    assert.equal(timeline.kind, "dc");
    const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
    const channels = scopeChannels(project, analysis, live);
    assert.ok(channels.includes("VIN"));
    assert.ok(channels.includes("VOUT"));
    assert.ok(channels.includes("GND"));
    const output = scopeTrace(project, analysis, live, "VOUT");
    assert.equal(output.voltage, analysis.result.outputVoltage);
    assert.equal(output.model.includes("zener conducting"), analysis.result.zenerOn);
    assert.equal(output.points[0][1], output.points[1][1]);
  }
  const analysis = runProjectAnalysis(project), disconnected = structuredClone(project);
  disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "zener-1:K") })).filter(net => net.endpoints.length);
  assert.equal(analyticalDcScopeRecording(disconnected, analysis), null);
});

