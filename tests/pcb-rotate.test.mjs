import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { rotatePcbFootprint } from "../js/pcb-rotate.mjs";
import { movePcbFootprint } from "../js/pcb-edit.mjs";
import { parseProject, serializeProject } from "../js/core.mjs";
import { createPcbPlacementReport } from "../js/pcb-placement-report.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "../js/pcb-export.mjs";
import { renderPcbPreviewSvg } from "../js/pcb-preview.mjs";

const usb = () => readFile(new URL("../examples/125-usbc-breakout.adigun.json", import.meta.url), "utf8").then(parseProject);
const owned = (project) => project.pcbFabrication.pads.filter((pad) => pad.instanceId === "rd1");

test("a quarter-turn rotates SMD pads, swaps their axes and preserves native identity and other views", async () => {
  const original = await usb(), before = serializeProject(original);
  const result = rotatePcbFootprint(original, "rd1", 90);
  assert.equal(result.status, "complete");
  assert.equal(result.rotationDeg, 90);
  assert.equal(result.rotatedPadCount, 2);
  assert.deepEqual(owned(result.project).map((p) => [p.xMm, p.yMm, p.widthMm, p.heightMm]), [[18, 8, 0.7, 1], [18, 10, 0.7, 1]]);
  assert.deepEqual(result.project.nets, original.nets);
  assert.deepEqual(result.project.components, original.components);
  assert.deepEqual(result.project.pcbFabrication.vias, original.pcbFabrication.vias);
  assert.deepEqual(result.project.pcbFabrication.pads.filter((p) => p.instanceId !== "rd1"), original.pcbFabrication.pads.filter((p) => p.instanceId !== "rd1"));
  assert.deepEqual(parseProject(serializeProject(result.project)), result.project);
  assert.equal(serializeProject(original), before);
  const csv = createPcbPlacementReport(result.project);
  assert.match(csv, /"R1","5.1 kΩ; CC1 Rd","R_0603_generic","smd","18.000","9.000","90"/);
  const svg = renderPcbPreviewSvg(result.project);
  assert.match(svg, /data-pcb-pad="rd1:1"[^>]+data-x-mm="18.000" data-y-mm="8.000"/);
});

test("rotation moves only attached vertices on matching nets, preserving other copper and vias", async () => {
  const project = await usb();
  project.pcbFabrication.routes.push({ netId: "OTHER", pointsMm: [[17, 9], [19, 9]], widthMm: 0.25, layer: "F.Cu" });
  const result = rotatePcbFootprint(project, "rd1", -90);
  assert.equal(result.status, "complete");
  assert.equal(result.rotationDeg, 270);
  let changed = 0;
  result.project.pcbFabrication.routes.forEach((route, i) => route.pointsMm.forEach((point, j) => {
    const before = project.pcbFabrication.routes[i].pointsMm[j];
    const pad = owned(project).find((p) => p.netId === route.netId && p.xMm === before[0] && p.yMm === before[1]);
    if (pad) { assert.deepEqual(point, pad.pin === "1" ? [18, 10] : [18, 8]); changed++; }
    else assert.deepEqual(point, before);
  }));
  assert.ok(changed > 0);
  assert.equal(result.updatedRoutePoints, changed);
});

test("four turns and inverse turns restore pad and route geometry without changing drills", async () => {
  const original = movePcbFootprint(await usb(), "output", { x: -15, y: 0 }).project;
  for (const instance of ["rd1", "output"]) {
    let project = original;
    for (let i = 0; i < 4; i++) {
      const result = rotatePcbFootprint(project, instance, 90);
      assert.equal(result.status, "complete");
      project = result.project;
    }
    for (const [i, pad] of project.pcbFabrication.pads.entries()) {
      const before = original.pcbFabrication.pads[i];
      assert.ok(Math.abs(pad.xMm - before.xMm) < 1e-8 && Math.abs(pad.yMm - before.yMm) < 1e-8);
      assert.equal(pad.drillMm, before.drillMm);
      assert.equal(pad.diameterMm, before.diameterMm);
      assert.equal(pad.widthMm, before.widthMm);
      assert.equal(pad.heightMm, before.heightMm);
    }
    for (const [i, route] of project.pcbFabrication.routes.entries()) route.pointsMm.forEach((p, j) => assert.ok(Math.hypot(p[0] - original.pcbFabrication.routes[i].pointsMm[j][0], p[1] - original.pcbFabrication.routes[i].pointsMm[j][1]) < 1e-8));
    assert.equal(project.pcbFabrication.parts.find((p) => p.instanceId === instance).rotationDeg, 0);
  }
  const right = rotatePcbFootprint(original, "rd1", 90).project;
  assert.deepEqual(owned(rotatePcbFootprint(right, "rd1", -90).project), owned(original));
});

test("rotation rejects edge overflow and malformed geometry without mutating the project", async () => {
  const original = await usb();
  for (const [change, code] of [
    [(p) => { owned(p).forEach((pad, i) => { pad.xMm = 0.6; pad.yMm = 9 + i * 2; }); }, "OUT_OF_BOUNDS"],
    [(p) => { owned(p)[0].widthMm = 0; }, "INVALID_FOOTPRINT_GEOMETRY"],
    [(p) => { owned(p)[0].xMm = NaN; }, "INVALID_FOOTPRINT_GEOMETRY"],
    [(p) => { owned(p)[0].technology = "unknown"; }, "INVALID_FOOTPRINT_GEOMETRY"],
    [(p) => { p.pcbFabrication.routes[0].pointsMm = null; }, "INVALID_ROUTE_GEOMETRY"],
    [(p) => { p.pcbFabrication.parts.find((x) => x.instanceId === "rd1").rotationDeg = 45; }, "INVALID_ROTATION"]
  ]) {
    const project = structuredClone(original); change(project); const before = structuredClone(project);
    assert.deepEqual(rotatePcbFootprint(project, "rd1", 90), { status: "blocked", code });
    assert.deepEqual(project, before);
  }
  assert.equal(rotatePcbFootprint({}, "rd1", 90).code, "NO_PCB_DATA");
  assert.equal(rotatePcbFootprint(original, "unknown", 90).code, "UNKNOWN_FOOTPRINT");
  for (const degrees of [45, 0.5, NaN, "90"]) assert.equal(rotatePcbFootprint(original, "rd1", degrees).code, "UNSUPPORTED_ROTATION");
  for (const degrees of [0, 360, -720]) assert.equal(rotatePcbFootprint(original, "rd1", degrees).project, original);
});

test("invalid saved rotation blocks fabrication and placement export instead of reporting zero", async () => {
  for (const invalid of [45, -90, 360, "90", null, NaN]) {
    const project = await usb(); project.pcbFabrication.parts[0].rotationDeg = invalid;
    assert.ok(validatePcbFabrication(project).errors.some((e) => e.includes("invalid quarter-turn rotation")));
    assert.equal(exportPcbFabrication(project).status, "blocked");
    assert.throws(() => createPcbPlacementReport(project), /Invalid PCB rotation/);
  }
});

test("rotation that stretches copper into a different net fails DRC and cannot export fabrication files", async () => {
  const original = await usb();
  assert.equal(validatePcbFabrication(original).status, "passed");
  const rotated = rotatePcbFootprint(original, "rd1", 90).project;
  const result = validatePcbFabrication(rotated);
  assert.equal(result.status, "failed");
  assert.ok(result.errors.some((error) => error.includes("clearance") && error.includes("USB_DM")));
  const exported = exportPcbFabrication(rotated);
  assert.equal(exported.status, "blocked");
  assert.deepEqual(exported.files, {});
  assert.deepEqual(rotated.nets, original.nets);
});
