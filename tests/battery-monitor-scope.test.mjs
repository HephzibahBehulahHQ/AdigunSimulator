import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalDcScopeRecording } from "../js/analytical-dc-scope.mjs";

test("battery discharge monitor exposes solved DC levels above and below its trip point", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/006-battery-discharge-monitor.adigun.json", import.meta.url), "utf8"));
  for (const voltage of [9, 7]) {
    project.components.find(component => component.libraryId === "power.dc-source").value = `${voltage} V`;
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete");
    const timeline = createFeedbackTimeline(project, analysis);
    assert.equal(timeline.kind, "dc");
    const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
    const channels = scopeChannels(project, analysis, live);
    assert.ok(channels.includes("VBAT"));
    assert.ok(channels.includes("SENSE"));
    assert.ok(channels.includes("ALARM"));
    assert.ok(channels.includes("GND"));
    const alarm = scopeTrace(project, analysis, live, "ALARM");
    assert.equal(alarm.voltage, analysis.result.comparatorOutputVoltage);
    assert.equal(alarm.model.includes("below trip"), analysis.result.lowBattery);
    assert.equal(alarm.points[0][1], alarm.points[1][1]);
  }
  const analysis = runProjectAnalysis(project), disconnected = structuredClone(project);
  disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "comparator-1:SENSE") })).filter(net => net.endpoints.length);
  assert.equal(analyticalDcScopeRecording(disconnected, analysis), null);
});

