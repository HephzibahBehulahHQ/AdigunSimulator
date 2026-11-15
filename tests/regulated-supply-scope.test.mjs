import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { createFeedbackTimeline } from "../js/simulation-feedback-timeline.mjs";
import { scopeChannels, scopeTrace } from "../js/oscilloscope-data.mjs";
import { analyticalDcScopeRecording } from "../js/analytical-dc-scope.mjs";

test("linear regulated supply exposes its solved DC output separately from ripple", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/007-linear-regulated-supply.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "dc");
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  const channels = scopeChannels(project, analysis, live);
  assert.ok(channels.includes("DC_5V"));
  assert.ok(channels.includes("DC_GND"));
  const output = scopeTrace(project, analysis, live, "DC_5V");
  assert.equal(output.voltage, analysis.result.outputVoltage);
  assert.equal(output.voltage, 5);
  assert.match(output.model, /ripple voltage reported separately/);
  assert.equal(output.points[0][1], output.points[1][1]);
  const disconnected = structuredClone(project);
  disconnected.nets = disconnected.nets.map(net => ({ ...net, endpoints: net.endpoints.filter(endpoint => endpoint !== "regulator-1:OUT") })).filter(net => net.endpoints.length);
  assert.equal(analyticalDcScopeRecording(disconnected, analysis), null);
});

test("USB-powered LED exposes its solved DC nodes to the scope and blocks a broken J1 feed", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/008-usb-powered-led.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.deepEqual(Object.keys(analysis.scopeDcRecording.nodes).sort(), ["FUSED_5V", "GND", "LED_A", "USB_VBUS"]);
  assert.equal(analysis.scopeDcRecording.nodes.USB_VBUS, 5);
  assert.equal(analysis.scopeDcRecording.nodes.FUSED_5V, 5 - analysis.result.fuseVoltageDrop);
  assert.ok(Math.abs(analysis.scopeDcRecording.nodes.LED_A - 2) < 1e-12);
  assert.equal(analysis.scopeDcRecording.nodes.GND, 0);
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "dc");
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  assert.ok(scopeChannels(project, analysis, live).includes("LED_A"));
  assert.ok(Math.abs(scopeTrace(project, analysis, live, "LED_A").voltage - 2) < 1e-12);
  assert.equal(scopeTrace(project, analysis, live, "GND").voltage, 0);
  const disconnected = structuredClone(project);
  disconnected.nets.find(net => net.id === "USB_VBUS").endpoints = disconnected.nets.find(net => net.id === "USB_VBUS").endpoints.filter(endpoint => endpoint !== "usb-input-1:VUSB");
  assert.equal(runProjectAnalysis(disconnected).state, "blocked");
  assert.equal(analyticalDcScopeRecording(disconnected, runProjectAnalysis(disconnected)), null);
});

