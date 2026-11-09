import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { auditPcbCopper, segmentPadGap, segmentDistance, netPairClearance } from "../js/pcb-copper.mjs";
import { createPcbRoute } from "../js/pcb-routing.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "../js/pcb-export.mjs";
import { renderPcbPreviewSvg } from "../js/pcb-preview.mjs";
const load = async (name) => JSON.parse(await readFile(new URL(`../examples/${name}.adigun.json`, import.meta.url)));

test("copper distances handle crossing, touching, collinear and rectangular geometry", () => {
  assert.equal(segmentDistance([0, 0], [4, 4], [0, 4], [4, 0]), 0);
  assert.equal(segmentDistance([0, 0], [4, 0], [2, 0], [6, 0]), 0);
  assert.equal(segmentDistance([0, 0], [4, 0], [4, 0], [5, 3]), 0);
  assert.equal(segmentDistance([0, 0], [4, 0], [0, 2], [4, 2]), 2);
  const pad = { technology: "smd", xMm: 0, yMm: 0, widthMm: 10, heightMm: 1 };
  assert.equal(segmentPadGap([-6, 1], [6, 1], pad), 0.5);
  assert.equal(segmentPadGap([-6, 0], [6, 0], pad), 0);
  assert.equal(segmentPadGap([0, 0], [0, 0], pad), 0);
});

test("routing and export reject crossing copper even when route endpoints are valid", async () => {
  const project = await load("121-single-sided-led-pcb");
  project.pcbFabrication.routes[0].pointsMm = [[4, 8], [20, 8], [16, 8]];
  assert.ok(auditPcbCopper(project.pcbFabrication).some((issue) => issue.type === "trace-trace"));
  assert.equal(validatePcbFabrication(project).status, "failed");
  const exported = exportPcbFabrication(project);
  assert.notEqual(exported.status, "passed");
  assert.deepEqual(exported.files, {});
});

test("unconnected physical pads still obstruct copper on their layer", async () => {
  const project = await load("121-single-sided-led-pcb");
  project.pcbFabrication.pads.push({ instanceId: "spare", pin: "1", netId: "NC", technology: "smd", widthMm: 1, heightMm: 1, xMm: 20, yMm: 8 });
  const options = { startPad: "resistor-1:2", endPad: "led-1:A" };
  assert.equal(createPcbRoute(project, options).code, "PAD_CLEARANCE");
  assert.ok(auditPcbCopper(project.pcbFabrication).some((issue) => issue.type === "trace-pad" && issue.padIndex === 6));
});

test("top and bottom copper are isolated except for plated pads and rule boundaries are inclusive", () => {
  const pcb = { board: { minimumClearanceMm: 0.2 }, pads: [], routes: [
    { netId: "A", layer: "F.Cu", widthMm: 0.4, pointsMm: [[0, 0], [4, 0]] },
    { netId: "B", layer: "B.Cu", widthMm: 0.4, pointsMm: [[2, -2], [2, 2]] }
  ] };
  assert.deepEqual(auditPcbCopper(pcb), []);
  pcb.pads.push({ netId: "NC", technology: "through-hole", diameterMm: 1, xMm: 2, yMm: 0 });
  assert.equal(auditPcbCopper(pcb).length, 2);
  pcb.pads = [];
  pcb.routes[1] = { netId: "B", layer: "F.Cu", widthMm: 0.4, pointsMm: [[0, 0.6], [4, 0.6]] };
  assert.deepEqual(auditPcbCopper(pcb), []);
  pcb.routes[1].pointsMm = [[0, 0.599], [4, 0.599]];
  assert.equal(auditPcbCopper(pcb).length, 1);
  pcb.netClasses = [{ name: "POWER", netIds: ["A"] }, { name: "SIGNAL", netIds: ["B"] }];
  pcb.netClassRules = [{ classA: "SIGNAL", classB: "POWER", minimumClearanceMm: 0.8 }];
  assert.equal(netPairClearance(pcb, "A", "B"), 0.8);
  assert.equal(netPairClearance(pcb, "B", "A"), 0.8);
  assert.equal(netPairClearance(pcb, "A", "UNCLASSIFIED"), 0.2);
});

test("invalid or excessive copper geometry blocks the audit without claiming clearance", async () => {
  assert.equal(auditPcbCopper({}).at(0).type, "invalid-geometry");
  const project = await load("121-single-sided-led-pcb");
  project.pcbFabrication.routes[0].pointsMm.push(null);
  assert.notEqual(validatePcbFabrication(project).status, "passed");
  project.pcbFabrication.routes = Array.from({ length: 1500 }, () => ({ netId: "A", layer: "F.Cu", widthMm: 0.2, pointsMm: [[0, 0], [1, 1]] }));
  assert.equal(auditPcbCopper(project.pcbFabrication).at(0).type, "work-limit");
});

test("stored net-class identifiers, widths and pair rules also govern edited and exported copper", async () => {
  const project = await load("121-single-sided-led-pcb");
  const pcb = project.pcbFabrication;
  pcb.netClasses = [
    { id: "SIGNAL", netIds: ["LED_A"], clearanceMm: 0.4, traceWidthMm: 0.5 },
    { id: "POWER", netIds: ["VCC"], clearanceMm: 0.3, traceWidthMm: 0.5 }
  ];
  pcb.netClassRules = [{ classA: "SIGNAL", classB: "POWER", clearanceMm: 0.8 }];
  assert.equal(netPairClearance(pcb, "LED_A", "VCC"), 0.8);
  assert.equal(netPairClearance(pcb, "VCC", "LED_A"), 0.8);
  assert.equal(netPairClearance(pcb, "LED_A", "GND"), 0.4);
  const options = { startPad: "resistor-1:2", endPad: "led-1:A" };
  assert.equal(createPcbRoute(project, { ...options, widthMm: 0.3 }).code, "TRACE_WIDTH_BELOW_MINIMUM");
  const routed = createPcbRoute(project, options);
  assert.equal(routed.status, "complete");
  assert.equal(routed.project.pcbFabrication.routes.at(-1).netClassId, "SIGNAL");
  assert.equal(routed.widthMm, 0.5);
  pcb.netClassRules[0].clearanceMm = 50;
  assert.equal(exportPcbFabrication(project).status, "blocked");
});

test("manufacturing export audits every repaired catalogue PCB instead of trusting old snapshots", async () => {
  for (const name of ["122-555-timer-pcb", "123-opamp-filter-pcb", "124-arduino-shield", "125-usbc-breakout", "126-bme280-breakout", "127-relay-module-pcb", "128-audio-amplifier-pcb", "129-buck-converter-pcb", "134-panel-mount-controller"]) {
    const project = await load(name);
    assert.deepEqual(auditPcbCopper(project.pcbFabrication), [], name);
    assert.equal(exportPcbFabrication(project).status, "passed", name);
  }
});

test("panel controller input route now clears the ground pad and ground return", async () => {
  const project = await load("134-panel-mount-controller");
  assert.deepEqual(auditPcbCopper(project.pcbFabrication), []);
  assert.equal(exportPcbFabrication(project).status, "passed");
});

test("USB-C plated vias bridge layers, appear in both copper files and are drilled", async () => {
  const project = await load("125-usbc-breakout"), pcb = project.pcbFabrication;
  assert.equal(pcb.vias.length, 10);
  assert.deepEqual(pcb.board.copperLayers, ["F.Cu", "B.Cu"]);
  const result = exportPcbFabrication(project);
  assert.equal(result.status, "passed", result.drc.errors.join("; "));
  for (const name of ["board-F_Cu.gbr", "board-B_Cu.gbr"]) assert.match(result.files[name], /C,0\.4\*%/);
  assert.match(result.files["board-PTH.drl"], /C0\.2\n/);
  assert.equal(result.files["board-PTH.drl"].split("\n").filter((line) => /^X\d+Y\d+$/.test(line)).length, 14);
  assert.match(renderPcbPreviewSvg(project), /data-pcb-pad="@via:J1-A4"/);
  assert.match(renderPcbPreviewSvg(project), /aria-label="Via J1-A4 net VBUS F.Cu to B.Cu"/);
  assert.doesNotMatch(result.files["BOM.csv"], /VIA-/);
});

test("via validation rejects invalid drills, nets, duplicates and unsupported stacks", async () => {
  const original = await load("125-usbc-breakout");
  for (const mutate of [
    (pcb) => { pcb.vias[0].drillMm = pcb.vias[0].diameterMm; },
    (pcb) => { pcb.vias[0].netId = "MISSING"; },
    (pcb) => { pcb.vias[0].xMm = 0; },
    (pcb) => { pcb.vias.push({ ...pcb.vias[0] }); },
    (pcb) => { pcb.board.copperLayers = ["F.Cu"]; },
    (pcb) => { pcb.vias = [null]; },
    (pcb) => { pcb.pads[0].isVia = true; pcb.pads[0].instanceId = "unlisted-component"; },
    (pcb) => { pcb.vias.pop(); }
  ]) {
    const project = structuredClone(original); mutate(project.pcbFabrication);
    assert.equal(exportPcbFabrication(project).status, "blocked");
  }
});

test("routes can terminate at stored vias but separate copper islands cannot pass export", async () => {
  const project = await load("121-single-sided-led-pcb"), pcb = project.pcbFabrication;
  pcb.board.copperLayers = ["F.Cu", "B.Cu"];
  pcb.vias = [{ id: "a", netId: "VCC", xMm: 8, yMm: 8, diameterMm: 0.6, drillMm: 0.3 }];
  const routed = createPcbRoute(project, { startPad: "source-1:+", endPad: "@via:a", layer: "B.Cu" });
  assert.equal(routed.status, "complete");
  assert.equal(exportPcbFabrication(routed.project).status, "passed");
  pcb.vias.push({ id: "b", netId: "VCC", xMm: 12, yMm: 8, diameterMm: 0.6, drillMm: 0.3 });
  pcb.routes = pcb.routes.filter((r) => r.netId !== "VCC");
  pcb.routes.push(
    { netId: "VCC", layer: "F.Cu", widthMm: 0.4, pointsMm: [[4, 8], [8, 8]] },
    { netId: "VCC", layer: "F.Cu", widthMm: 0.4, pointsMm: [[16, 8], [12, 8]] }
  );
  assert.deepEqual(auditPcbCopper(pcb), []);
  const drc = validatePcbFabrication(project);
  assert.equal(drc.status, "failed");
  assert.ok(drc.errors.includes("Net VCC has disconnected copper groups."));
  assert.ok(!drc.errors.some((error) => error.includes("not reached")), "All pads are covered, but the net is split.");
});
