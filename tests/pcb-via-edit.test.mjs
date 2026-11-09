import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { savePcbVia, removePcbVia } from "../js/pcb-via-edit.mjs";
import { validatePcbVias } from "../js/pcb-vias.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "../js/pcb-export.mjs";
import { parseProject, serializeProject } from "../js/core.mjs";
import { createPcbRoute } from "../js/pcb-routing.mjs";

const load = () => readFile(new URL("../examples/125-usbc-breakout.adigun.json", import.meta.url), "utf8").then(parseProject);
const via = (overrides = {}) => ({ netId: "SIG", xMm: 10, yMm: 10, diameterMm: 0.6, drillMm: 0.3, ...overrides });
const fixture = () => ({ metadata: { updatedAt: "before" }, nets: [{ id: "SIG", endpoints: [] }, { id: "OTHER", endpoints: [] }], pcbFabrication: {
  board: { widthMm: 20, heightMm: 20, copperLayers: ["F.Cu", "B.Cu"], minimumClearanceMm: 0.2 }, parts: [], pads: [], vias: [],
  routes: [{ netId: "SIG", layer: "F.Cu", widthMm: 0.25, pointsMm: [[3, 10], [17, 10]] }, { netId: "SIG", layer: "B.Cu", widthMm: 0.25, pointsMm: [[10, 3], [10, 17]] }]
} });

test("via create, move, resize and remove round-trip native data without changing canonical nets", async () => {
  const original = await load(), before = structuredClone(original);
  const added = savePcbVia(original, via({ netId: "VBUS", xMm: 25, yMm: 17 }));
  assert.equal(added.status, "complete"); assert.equal(added.viaId, "via-1");
  const moved = savePcbVia(added.project, via({ id: added.viaId, netId: "VBUS", xMm: 26, yMm: 17, diameterMm: 0.7 }));
  assert.equal(moved.status, "complete");
  assert.deepEqual(parseProject(serializeProject(moved.project)), moved.project);
  assert.equal(moved.project.pcbFabrication.vias.at(-1).xMm, 26);
  assert.equal(moved.project.pcbFabrication.vias.at(-1).diameterMm, 0.7);
  assert.deepEqual(moved.project.nets, original.nets);
  assert.deepEqual(moved.project.components, original.components);
  const removed = removePcbVia(moved.project, added.viaId);
  assert.equal(removed.status, "complete");
  assert.deepEqual(removed.project.pcbFabrication, original.pcbFabrication);
  assert.deepEqual(original, before);
});

test("a via on trace interiors creates explicit anchors and moves them together on both layers", () => {
  const original = fixture();
  const added = savePcbVia(original, via());
  assert.equal(added.status, "complete"); assert.equal(added.updatedRoutePoints, 2);
  assert.deepEqual(added.project.pcbFabrication.routes.map((r) => r.pointsMm), [[[3, 10], [10, 10], [17, 10]], [[10, 3], [10, 10], [10, 17]]]);
  const moved = savePcbVia(added.project, via({ id: added.viaId, xMm: 12, yMm: 12 }));
  assert.equal(moved.status, "complete"); assert.equal(moved.updatedRoutePoints, 2);
  assert.deepEqual(moved.project.pcbFabrication.routes.map((r) => r.pointsMm), [[[3, 10], [12, 12], [17, 10]], [[10, 3], [12, 12], [10, 17]]]);
  assert.deepEqual(removePcbVia(moved.project, added.viaId).project.pcbFabrication.routes, moved.project.pcbFabrication.routes);
});

test("via copper respects other-net pads, no-connect pads, back-layer traces and class spacing", () => {
  for (const netId of ["OTHER", "NC"]) {
    const project = fixture(); project.pcbFabrication.routes = [];
    project.pcbFabrication.pads.push({ instanceId: "p", pin: "1", netId, technology: "smd", xMm: 10, yMm: 11, widthMm: 1, heightMm: 1 });
    assert.equal(savePcbVia(project, via({ diameterMm: 1.2 })).code, "PAD_CLEARANCE");
  }
  const project = fixture();
  project.pcbFabrication.routes = [{ netId: "OTHER", layer: "B.Cu", widthMm: 0.25, pointsMm: [[3, 11], [17, 11]] }];
  assert.equal(savePcbVia(project, via({ diameterMm: 1.6 })).code, "COPPER_CLEARANCE");
  project.pcbFabrication.netClasses = [{ id: "SIGNAL", netIds: ["SIG"], clearanceMm: 0.8 }];
  assert.equal(savePcbVia(project, via()).code, "COPPER_CLEARANCE");
});

test("plated drills cannot overlap another via or through-hole drill even on the same net", () => {
  const project = fixture(); project.pcbFabrication.vias = [{ id: "old", ...via() }];
  assert.equal(savePcbVia(project, via({ xMm: 10.1 })).code, "INVALID_VIA");
  project.pcbFabrication.vias = [];
  project.pcbFabrication.pads = [{ instanceId: "p", pin: "1", netId: "SIG", technology: "through-hole", xMm: 10, yMm: 10, diameterMm: 1.5, drillMm: 0.8 }];
  const saved = savePcbVia(project, via());
  assert.equal(saved.code, "INVALID_VIA");
  assert.ok(saved.errors.some((e) => e.includes("drill overlaps")));
  project.pcbFabrication.vias = [{ id: "imported", ...via() }];
  assert.ok(validatePcbVias(project.pcbFabrication).some((e) => e.includes("drill overlaps")));
});

test("via geometry, known nets, layer stack, IDs and count are guarded without mutation", () => {
  for (const changes of [{ xMm: 0.1 }, { drillMm: 0.6 }, { diameterMm: 0 }, { xMm: NaN }, { netId: "NC" }, { netId: "MISSING" }]) {
    const project = fixture(), before = structuredClone(project);
    assert.equal(savePcbVia(project, via(changes)).status, "blocked");
    assert.deepEqual(project, before);
  }
  const single = fixture(); single.pcbFabrication.board.copperLayers = ["F.Cu"];
  assert.equal(savePcbVia(single, via()).code, "INVALID_VIA");
  single.pcbFabrication.board.copperLayers = ["F.Cu", "B.Cu", "In1.Cu"];
  assert.equal(savePcbVia(single, via()).code, "INVALID_VIA");
  const added = savePcbVia(fixture(), via());
  assert.equal(savePcbVia(added.project, via({ id: added.viaId })).status, "unchanged");
  assert.equal(savePcbVia(added.project, via({ id: added.viaId, netId: "OTHER" })).code, "VIA_NET_CHANGE");
  assert.equal(savePcbVia(added.project, via({ id: "missing" })).code, "UNKNOWN_VIA");
  assert.equal(removePcbVia(added.project, "missing").code, "UNKNOWN_VIA");
  const many = fixture(); many.pcbFabrication.vias = Array.from({ length: 256 }, (_, i) => ({ id: `v${i}`, ...via({ xMm: 1 + i % 16, yMm: 1 + Math.floor(i / 16) }) }));
  assert.equal(savePcbVia(many, via({ xMm: 18, yMm: 18 })).code, "INVALID_VIA");
});

test("via and stretched copper respect mechanical keep-outs", () => {
  const project = fixture(); project.pcbFabrication.routes = [];
  project.pcbFabrication.keepouts = [{ xMm: 10.2, yMm: 9, widthMm: 1, heightMm: 2 }];
  assert.equal(savePcbVia(project, via()).code, "KEEP_OUT");
  const added = savePcbVia(fixture(), via());
  added.project.pcbFabrication.keepouts = [{ xMm: 13, yMm: 8.7, widthMm: 0.4, heightMm: 0.4 }];
  assert.equal(savePcbVia(added.project, via({ id: added.viaId, yMm: 8 })).code, "KEEP_OUT");
});

test("a newly isolated via prevents fabrication output until connectivity is repaired or it is removed", async () => {
  const original = await load();
  const added = savePcbVia(original, via({ netId: "VBUS", xMm: 25, yMm: 17 }));
  assert.equal(validatePcbFabrication(added.project).status, "failed");
  assert.deepEqual(exportPcbFabrication(added.project).files, {});
  assert.equal(validatePcbFabrication(removePcbVia(added.project, added.viaId).project).status, "passed");
});

test("routing a created via restores connectivity and moving it retains valid fabrication output", async () => {
  const added = savePcbVia(await load(), via({ netId: "VBUS", xMm: 26, yMm: 17, diameterMm: 0.7 }));
  const routed = createPcbRoute(added.project, { startPad: `@via:${added.viaId}`, endPad: "output:1", waypoints: [[40, 17], [40, 3]], layer: "B.Cu" });
  assert.equal(routed.status, "complete");
  const moved = savePcbVia(routed.project, via({ id: added.viaId, netId: "VBUS", xMm: 27, yMm: 17, diameterMm: 0.7 }));
  assert.equal(moved.status, "complete"); assert.equal(moved.updatedRoutePoints, 1);
  assert.equal(validatePcbFabrication(moved.project).status, "passed");
  const exported = exportPcbFabrication(moved.project);
  assert.equal(exported.status, "passed");
  for (const file of ["board-F_Cu.gbr", "board-B_Cu.gbr"]) assert.ok(exported.files[file].includes("X0027000000Y0017000000D03*"), `Via missing from ${file}`);
  assert.ok(exported.files["board-PTH.drl"].includes("X0027000000Y0017000000"));
  assert.ok(exported.files["board-PTH.drl"].includes("C0.3"));
  assert.doesNotMatch(exported.files["BOM.csv"], /via-1/);
  assert.deepEqual(moved.project.nets, added.project.nets);
});
