import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createPcbRoute } from "../js/pcb-routing.mjs";
import { pcbPreviewPointToBoardMm, renderPcbPreviewSvg } from "../js/pcb-preview.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "../js/pcb-export.mjs";

const fixture = () => ({
  metadata: { updatedAt: "before" },
  nets: [{ id: "SIG", endpoints: ["r1:2", "d1:A"] }, { id: "VCC", endpoints: ["j1:1"] }],
  pcbFabrication: {
    board: { widthMm: 40, heightMm: 24, copperLayers: ["F.Cu"], minimumClearanceMm: 0.35 },
    parts: [{ instanceId: "r1" }, { instanceId: "d1" }, { instanceId: "j1" }],
    pads: [
      { instanceId: "r1", pin: "2", netId: "SIG", technology: "smd", widthMm: 1, heightMm: 1, xMm: 10, yMm: 10 },
      { instanceId: "d1", pin: "A", netId: "SIG", technology: "smd", widthMm: 1, heightMm: 1, xMm: 20, yMm: 10 },
      { instanceId: "j1", pin: "1", netId: "VCC", technology: "through-hole", diameterMm: 2, drillMm: 1, xMm: 10, yMm: 14 }
    ],
    routes: [],
    netClasses: [{ name: "SIGNAL", netIds: ["SIG"], minimumWidthMm: 0.25 }],
    netClassRules: [],
    keepouts: []
  }
});

test("interactive route joins only two pads on the same declared net and preserves source", () => {
  const project = fixture();
  const result = createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A", waypoints: [[15, 8]] });
  assert.equal(result.status, "complete");
  assert.equal(result.netId, "SIG");
  assert.deepEqual(result.pointsMm, [[10, 10], [15, 8], [20, 10]]);
  assert.equal(result.widthMm, 0.25);
  assert.deepEqual(result.project.pcbFabrication.routes[0].pointsMm, result.pointsMm);
  assert.deepEqual(project.pcbFabrication.routes, []);
});

test("route rejects cross-net pads, no-connects, unknown pads, and unsupported layers", () => {
  const project = fixture();
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "j1:1" }).code, "NET_MISMATCH");
  assert.equal(createPcbRoute(project, { startPad: "missing:1", endPad: "d1:A" }).code, "UNKNOWN_PAD");
  project.pcbFabrication.pads[0].netId = "NC";
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A" }).code, "NO_CONNECT_PAD");
  assert.equal(createPcbRoute(fixture(), { startPad: "r1:2", endPad: "d1:A", layer: "B.Cu" }).code, "UNSUPPORTED_COPPER_LAYER");
});

test("route enforces board bounds and the net-class minimum width", () => {
  const project = fixture();
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A", waypoints: [[-1, 8]] }).code, "ROUTE_OUT_OF_BOUNDS");
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A", widthMm: 0.2 }).code, "TRACE_WIDTH_BELOW_MINIMUM");
  project.nets[0].endpoints = ["r1:2"];
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A" }).code, "INVALID_ROUTE_ENDPOINTS");
});

test("route rejects a direct segment that crosses outside a concave polygon outline", () => {
  const project = fixture();
  project.pcbFabrication.board.outline = { type: "polygon", pointsMm: [[0,0],[40,0],[40,24],[30,24],[30,8],[10,8],[10,24],[0,24]] };
  project.pcbFabrication.pads[0].xMm = 5; project.pcbFabrication.pads[0].yMm = 20;
  project.pcbFabrication.pads[1].xMm = 35; project.pcbFabrication.pads[1].yMm = 20;
  project.pcbFabrication.pads[2].xMm = 5; project.pcbFabrication.pads[2].yMm = 14;
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A" }).code, "ROUTE_OUT_OF_BOUNDS");
});

test("route avoids foreign pads, foreign copper, and keepouts", () => {
  const project = fixture();
  project.pcbFabrication.pads[2].xMm = 15;
  project.pcbFabrication.pads[2].yMm = 14;
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A", waypoints: [[15, 14]] }).code, "PAD_CLEARANCE");
  project.pcbFabrication.pads.pop();
  project.pcbFabrication.routes.push({ netId: "VCC", layer: "F.Cu", widthMm: 0.4, pointsMm: [[15, 7], [15, 13]] });
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A", waypoints: [[15, 10]] }).code, "ROUTE_CLEARANCE");
  project.pcbFabrication.routes = [];
  project.pcbFabrication.keepouts.push({ id: "KO1", xMm: 14, yMm: 9, widthMm: 2, heightMm: 2 });
  assert.equal(createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A", waypoints: [[15, 10]] }).code, "ROUTE_KEEPOUT");
});

test("repeated routes are unchanged rather than duplicated", () => {
  const project = fixture();
  const first = createPcbRoute(project, { startPad: "r1:2", endPad: "d1:A" });
  const second = createPcbRoute(first.project, { startPad: "r1:2", endPad: "d1:A" });
  assert.equal(second.status, "unchanged");
  assert.equal(second.project.pcbFabrication.routes.length, 1);
  const reverse = createPcbRoute(first.project, { startPad: "d1:A", endPad: "r1:2" });
  assert.equal(reverse.status, "unchanged");
});

test("PCB pad targets are keyboard addressable and preview coordinates map back to millimetres", () => {
  const project = fixture();
  const svg = renderPcbPreviewSvg(project);
  assert.match(svg, /data-pcb-pad="r1:2"[^>]*role="button" tabindex="0"/);
  const scale = Math.min(588 / 40, 208 / 24);
  const origin = [(680 - 40 * scale) / 2, (300 - 24 * scale) / 2];
  assert.deepEqual(pcbPreviewPointToBoardMm(project, [origin[0] + 10 * scale, origin[1] + 10 * scale]), [10, 10]);
});

test("in-progress route is displayed as a non-exportable dashed preview", () => {
  const svg = renderPcbPreviewSvg(fixture(), "unavailable", { pointsMm: [[10, 10], [15, 8]] });
  assert.match(svg, /class="pcb-route-draft" points=/);
});

test("a manual route on the released single-sided PCB example remains checkable and exportable", async () => {
  const project = JSON.parse(await readFile(new URL("../examples/121-single-sided-led-pcb.adigun.json", import.meta.url), "utf8"));
  const result = createPcbRoute(project, { startPad: "resistor-1:2", endPad: "led-1:A", waypoints: [[20, 11]] });
  assert.equal(result.status, "complete");
  assert.equal(validatePcbFabrication(result.project).status, "passed");
  assert.equal(exportPcbFabrication(result.project).status, "passed");
  assert.equal(project.pcbFabrication.routes.length, 3);
});

test("two-layer boards route bottom copper between plated pads and export separate Gerbers", async () => {
  const singleSided = JSON.parse(await readFile(new URL("../examples/121-single-sided-led-pcb.adigun.json", import.meta.url), "utf8"));
  const blocked = structuredClone(singleSided);
  blocked.pcbFabrication.board.copperLayers = ["F.Cu", "B.Cu"];
  assert.equal(createPcbRoute(blocked, { startPad: "resistor-1:2", endPad: "led-1:A", layer: "B.Cu" }).code, "BOTTOM_LAYER_REQUIRES_THROUGH_HOLE");

  const crossingTopSmd = structuredClone(singleSided);
  crossingTopSmd.pcbFabrication.board.copperLayers = ["F.Cu", "B.Cu"];
  for (const id of ["resistor-1:2", "led-1:A"]) {
    const pad = crossingTopSmd.pcbFabrication.pads.find((item) => `${item.instanceId}:${item.pin}` === id);
    pad.technology = "through-hole";
    pad.diameterMm = 1.2;
    pad.drillMm = 0.6;
  }
  const topOnlySmd = crossingTopSmd.pcbFabrication.pads.find((pad) => pad.instanceId === "led-1" && pad.pin === "K");
  topOnlySmd.xMm = 20;
  topOnlySmd.yMm = 8;
  assert.equal(createPcbRoute(crossingTopSmd, { startPad: "resistor-1:2", endPad: "led-1:A", waypoints: [[20, 8]], layer: "B.Cu" }).status, "complete");

  const project = structuredClone(singleSided);
  project.pcbFabrication.board.copperLayers = ["F.Cu", "B.Cu"];
  project.pcbFabrication.parts.forEach((part) => { part.technology = "through-hole"; });
  project.pcbFabrication.pads.forEach((pad) => {
    if (pad.technology !== "smd") return;
    pad.technology = "through-hole";
    pad.diameterMm = 1.2;
    pad.drillMm = 0.6;
    delete pad.widthMm;
    delete pad.heightMm;
  });
  const result = createPcbRoute(project, { startPad: "resistor-1:2", endPad: "led-1:A", waypoints: [[20, 11]], layer: "B.Cu" });
  assert.equal(result.status, "complete");
  assert.equal(result.layer, "B.Cu");
  assert.equal(validatePcbFabrication(result.project).status, "passed");
  const exported = exportPcbFabrication(result.project);
  assert.equal(exported.status, "passed");
  assert.ok(exported.files["board-F_Cu.gbr"]);
  assert.match(exported.files["board-B_Cu.gbr"], /X0020000000Y0011000000D01/);
  assert.match(exported.files["board-B_Cu.gbr"], /B\.Cu educational output/);
});

