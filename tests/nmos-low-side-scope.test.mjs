import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";

async function projectFixture() {
  return JSON.parse(await readFile(new URL("../examples/033-nmos-low-side-switch.adigun.json", import.meta.url), "utf8"));
}

test("NMOS low-side driver exposes modeled steady on and off voltages on real nets", async () => {
  const project = await projectFixture();
  for (const [gateVoltage, expectedOn] of [[5, true], [0, false]]) {
    const candidate = structuredClone(project);
    candidate.components.find(component => component.instanceId === "gate-drive").value = gateVoltage + " V";
    const analysis = runProjectAnalysis(candidate);
    assert.equal(analysis.state, "complete");
    assert.equal(analysis.result.kind, "nmos-low-side-switch");
    assert.equal(analysis.result.switchOn, expectedOn);
    const timeline = createFeedbackTimeline(candidate, analysis);
    const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
    assert.equal(timeline.kind, "dc");
    assert.ok(scopeChannels(candidate, analysis, live).includes("DRAIN"));
    const expected = {
      GND: 0,
      VCC: analysis.result.supplyVoltage,
      GATE: analysis.result.gateVoltage,
      DRAIN: analysis.result.drainSourceVoltageV,
      COIL: analysis.result.supplyVoltage - analysis.result.loadCurrentA * analysis.result.coilResistanceOhm
    };
    for (const [net, voltage] of Object.entries(expected)) {
      const trace = scopeTrace(candidate, analysis, live, net);
      assert.equal(trace.kind, "dc");
      assert.equal(trace.model, "Ideal NMOS low-side driver " + (expectedOn ? "on" : "off") + " steady-state DC estimate; first-order coil-current decay is reported separately");
      assert.ok(Math.abs(trace.voltage - voltage) < 1e-9, net);
      assert.deepEqual(trace.points.map(point => point[1]), [voltage, voltage]);
    }
  }
});

test("NMOS scope does not report channels for reversed flyback-diode wiring", async () => {
  const project = await projectFixture();
  project.nets.find(net => net.id === "DRAIN").endpoints = ["coil-l:2", "mosfet:D", "flyback:K"];
  project.nets.find(net => net.id === "VCC").endpoints = ["supply:+", "coil-r:1", "flyback:A"];
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "blocked");
  assert.equal(analysis.scopeDcRecording, undefined);
});
