import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalScopeRecording } from "../js/analytical-scope-recording.mjs";

test("active low-pass examples expose phase-aware, labeled frequency estimates", async () => {
  for (const name of ["039-active-low-pass", "123-opamp-filter-pcb"]) {
    const project = JSON.parse(await readFile(new URL(`../examples/${name}.adigun.json`, import.meta.url), "utf8"));
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete", name);
    const timeline = createFeedbackTimeline(project, analysis);
    const live = { status: "ready", kind: "transient", sampleIndex: timeline.length - 1, data: timeline.frame(timeline.length - 1) };
    const channels = scopeChannels(project, analysis, live);
    assert.ok(channels.includes("INPUT"), name);
    assert.ok(channels.includes("OUTPUT"), name);
    assert.ok(channels.includes("GND"), name);
    const output = scopeTrace(project, analysis, live, "OUTPUT");
    assert.match(output.model, /frequency-domain estimate, not transient simulation/, name);
    assert.ok(output.points.some(([, voltage]) => voltage > 0), name);
    assert.ok(output.points.some(([, voltage]) => voltage < 0), name);
    const disconnected = structuredClone(project);
    const cap = project.components.find(component => component.libraryId === "passive.capacitor");
    disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== `${cap.instanceId}:1`) })).filter(net => net.endpoints.length);
    assert.equal(analyticalScopeRecording(disconnected, analysis), null, name);
  }
});

