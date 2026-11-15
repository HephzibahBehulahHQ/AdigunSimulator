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

test("9 V divider exposes its solved DC output to the scope and blocks an open junction", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/009-dc-voltage-divider-3k-1k.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.deepEqual(analysis.scopeDcRecording.nodes, { VCC: 9, VOUT: 2.25, GND: 0 });
  assert.equal(analysis.scopeDcRecording.preferredNet, "VOUT");
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "dc");
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  assert.ok(scopeChannels(project, analysis, live).includes("VOUT"));
  assert.equal(scopeTrace(project, analysis, live, "VOUT").voltage, 2.25);
  assert.equal(scopeTrace(project, analysis, live, "GND").voltage, 0);
  const disconnected = structuredClone(project);
  disconnected.nets.find(net => net.id === "VOUT").endpoints = disconnected.nets.find(net => net.id === "VOUT").endpoints.filter(endpoint => endpoint !== "resistor-top-1:2");
  const failed = runProjectAnalysis(disconnected);
  assert.equal(failed.state, "blocked");
  assert.match(failed.message, /join the two resistors at VOUT/);
  assert.equal(analyticalDcScopeRecording(disconnected, failed), null);
});

test("12 V parallel load exposes its solved MID voltage and blocks an open branch", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/010-parallel-load-12v.adigun.json", import.meta.url), "utf8"));
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete");
  assert.equal(analysis.scopeDcRecording.nodes.VCC, 12);
  assert.equal(analysis.scopeDcRecording.nodes.GND, 0);
  assert.ok(Math.abs(analysis.scopeDcRecording.nodes.MID - 6.545454545454546) < 1e-12);
  const timeline = createFeedbackTimeline(project, analysis);
  assert.equal(timeline.kind, "dc");
  const live = { status: "ready", kind: "dc", sampleIndex: 0, data: timeline.frame(0) };
  assert.ok(scopeChannels(project, analysis, live).includes("MID"));
  assert.ok(Math.abs(scopeTrace(project, analysis, live, "MID").voltage - 6.545454545454546) < 1e-12);
  const disconnected = structuredClone(project);
  disconnected.nets.find(net => net.id === "MID").endpoints = disconnected.nets.find(net => net.id === "MID").endpoints.filter(endpoint => endpoint !== "resistor-branch-1:1");
  const failed = runProjectAnalysis(disconnected);
  assert.equal(failed.state, "blocked");
  assert.match(failed.message, /R3 must connect both pins to named project nets/);
  assert.equal(analyticalDcScopeRecording(disconnected, failed), null);
});

