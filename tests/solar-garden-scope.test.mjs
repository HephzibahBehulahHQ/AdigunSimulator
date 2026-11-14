import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalDcScopeRecording } from "../js/analytical-dc-scope.mjs";

test("solar garden light exposes solved battery and LDR gate DC nodes", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/009-solar-garden-light.adigun.json", import.meta.url), "utf8"));
  for (const illumination of [100, 0]) {
    project.components.find(component => component.libraryId === "passive.ldr").value = `Rbright 10 kΩ; Rdark 1 MΩ; light ${illumination}%`;
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete");
    const timeline = createFeedbackTimeline(project, analysis);
    assert.equal(timeline.kind, "dc");
    const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
    const channels = scopeChannels(project, analysis, live);
    assert.ok(channels.includes("BAT_POS"));
    assert.ok(channels.includes("GATE"));
    assert.ok(channels.includes("GND"));
    const trace = scopeTrace(project, analysis, live, "GATE");
    assert.equal(trace.voltage, analysis.result.gateVoltage);
    assert.equal(trace.model, "Solar garden light operating-point estimate (battery and LDR gate nodes)");
    assert.equal(trace.points[0][1], trace.points[1][1]);
  }
  const analysis = runProjectAnalysis(project), disconnected = structuredClone(project);
  disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "mosfet-1:G") })).filter(net => net.endpoints.length);
  assert.equal(analyticalDcScopeRecording(disconnected, analysis), null);
});

