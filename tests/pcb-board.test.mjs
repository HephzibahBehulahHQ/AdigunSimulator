import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createEmptyProject, parseProject, serializeProject } from "../js/core.mjs";
import { boardDefinitionErrors, boardGeometryErrors, minimumPcbTraceWidth, pcbBoardDefaults, updatePcbBoard } from "../js/pcb-board.mjs";
import { validatePcbFabrication, exportPcbFabrication } from "../js/pcb-export.mjs";
import { createPcbRoute } from "../js/pcb-routing.mjs";
import { createManufacturingExportPack } from "../js/manufacturing-export-pack.mjs";
import { createPcbBoardEditor } from "../js/pcb-board-controller.mjs";
import { renderPcbPreviewSvg } from "../js/pcb-preview.mjs";

const load = async (name = "125-usbc-breakout") => parseProject(await readFile(new URL(`../examples/${name}.adigun.json`, import.meta.url), "utf8"));

test("new empty board retains the empty circuit and requires routes before export", () => {
  const original = createEmptyProject(), before = serializeProject(original), config = pcbBoardDefaults(original);
  const result = updatePcbBoard(original, config);
  assert.equal(result.status, "complete"); assert.equal(serializeProject(original), before);
  assert.equal(result.project.id, original.id); assert.deepEqual(result.project.components, []); assert.deepEqual(result.project.nets, []);
  assert.deepEqual(result.project.pcbFabrication.board.copperLayers, ["F.Cu", "B.Cu"]);
  assert.equal(updatePcbBoard(result.project, config).status, "unchanged");
  assert.equal(exportPcbFabrication(result.project).status, "blocked");
  assert.deepEqual(parseProject(serializeProject(result.project)).pcbFabrication, result.project.pcbFabrication);
});

test("board resizing preserves electrical nets, precise copper, other views and native document identity", async () => {
  const original = await load(), before = serializeProject(original);
  const result = updatePcbBoard(original, { ...pcbBoardDefaults(original), widthMm: 50, heightMm: 26, thicknessMm: 2 });
  assert.equal(result.status, "complete"); assert.equal(serializeProject(original), before);
  for (const key of ["components", "nets", "id"]) assert.deepEqual(result.project[key], original[key]);
  for (const key of ["parts", "pads", "routes", "vias", "keepouts", "connectorPinMap"]) assert.deepEqual(result.project.pcbFabrication[key], original.pcbFabrication[key]);
  assert.equal(validatePcbFabrication(result.project).status, "passed");
  assert.equal(parseProject(serializeProject(result.project)).pcbFabrication.board.thicknessMm, 2);
});

test("bounds include full copper extents, vias, keep-outs, zones and mechanical allowances", async () => {
  const project = await load();
  const pcb = { board: { ...project.pcbFabrication.board, widthMm: 10, heightMm: 10 }, pads: [], routes: [] };
  const cases = [
    { pads: [{ reference: "R1", technology: "smd", xMm: 9.5, yMm: 5, widthMm: 2, heightMm: 1 }] },
    { pads: [{ reference: "J1", technology: "through-hole", xMm: 0.5, yMm: 5, diameterMm: 2 }] },
    { routes: [{ netId: "N", layer: "F.Cu", widthMm: 1, pointsMm: [[1, 9.8], [8, 9.8]] }] },
    { vias: [{ id: "V", xMm: 9.8, yMm: 2, diameterMm: 1 }] },
    { keepouts: [{ id: "K", xMm: 8, yMm: 1, widthMm: 3, heightMm: 2 }] },
    { copperZones: [{ id: "Z", layer: "F.Cu", bounds: { xMm: 1, yMm: 8, widthMm: 2, heightMm: 3 } }] },
    { mechanicalFeatures: [{ id: "M", type: "mounting-hole", xMm: 1, yMm: 5, diameterMm: 2, drillMm: 1, requiredEdgeClearanceMm: 1 }] },
    { mechanicalFeatures: [{ id: "C", type: "edge-cutout", openingSide: "bottom", xMm: 1, yMm: 6, widthMm: 2, heightMm: 2 }] }
  ];
  for (const data of cases) assert.ok(boardGeometryErrors({ ...pcb, ...data }).length, JSON.stringify(data));
  assert.deepEqual(boardGeometryErrors({ ...pcb, pads: [{ technology: "smd", xMm: 9, yMm: 5, widthMm: 2, heightMm: 1 }] }), []);
  assert.equal(updatePcbBoard(project, { ...pcbBoardDefaults(project), widthMm: 30 }).status, "blocked");
});

test("layer removal cannot strand routes, plated vias or zones; multilayer plans stay intact", async () => {
  const original = await load(), before = serializeProject(original);
  assert.equal(updatePcbBoard(original, { ...pcbBoardDefaults(original), copperLayers: ["F.Cu"] }).status, "blocked");
  assert.equal(serializeProject(original), before);
  const planned = await load("130-four-layer-mcu-board-plan"), plannedBefore = serializeProject(planned);
  assert.equal(updatePcbBoard(planned, { ...pcbBoardDefaults(planned), copperLayers: ["F.Cu", "B.Cu"] }).status, "blocked");
  assert.equal(serializeProject(planned), plannedBefore);
  const single = await load("121-single-sided-led-pcb");
  const expanded = updatePcbBoard(single, { ...pcbBoardDefaults(single), copperLayers: ["F.Cu", "B.Cu"] });
  assert.equal(expanded.status, "complete");
  assert.equal(updatePcbBoard(expanded.project, { ...pcbBoardDefaults(expanded.project), copperLayers: ["F.Cu"] }).status, "complete");
});

test("invalid board rules and malformed geometry fail without mutation", async () => {
  const p = await load(), before = serializeProject(p), defaults = pcbBoardDefaults(p);
  for (const key of ["widthMm", "heightMm", "thicknessMm", "minimumClearanceMm", "minimumTraceWidthMm"]) {
    for (const bad of [0, -1, NaN, Infinity, "1"]) assert.equal(updatePcbBoard(p, { ...defaults, [key]: bad }).status, "blocked", `${key}=${bad}`);
  }
  for (const layers of [[], ["B.Cu"], ["F.Cu", "F.Cu"], ["F.Cu", "In1.Cu", "B.Cu"], null]) assert.ok(boardDefinitionErrors({ ...defaults, copperLayers: layers }).length);
  assert.equal(updatePcbBoard({ ...p, pcbFabrication: { ...p.pcbFabrication, pads: [null] } }, defaults).status, "blocked");
  assert.ok(boardDefinitionErrors({ ...defaults, outline: "circle" }).length);
  assert.equal(updatePcbBoard({ ...p, pcbFabrication: { ...p.pcbFabrication, board: { ...p.pcbFabrication.board, outline: "circle" } } }, defaults).status, "blocked");
  assert.equal(serializeProject(p), before);
});

test("routing uses the strictest board and matching class floor; legacy projects retain defaults", async () => {
  const p = await load("121-single-sided-led-pcb"), pcb = p.pcbFabrication, route = pcb.routes[0];
  const endpoints = [route.pointsMm[0], route.pointsMm.at(-1)].map(([x,y]) => pcb.pads.find(pad=>pad.netId===route.netId && pad.xMm===x && pad.yMm===y)).map(pad=>`${pad.instanceId}:${pad.pin}`);
  pcb.board.minimumTraceWidthMm = 0.8;
  pcb.netClasses = [{ id: "relaxed", netIds: [route.netId], minimumWidthMm: 0.1 }, { id: "strict", netIds: [route.netId], traceWidthMm: 0.9 }];
  assert.equal(minimumPcbTraceWidth(pcb, route.netId), 0.9);
  assert.equal(minimumPcbTraceWidth({ ...pcb, netClasses: [{ netIds: [route.netId], minimumWidthMm: 0.1, traceWidthMm: 1.2 }] }, route.netId), 0.8);
  assert.equal(createPcbRoute(p, { startPad: endpoints[0], endPad: endpoints[1], widthMm: 0.2 }).code, "TRACE_WIDTH_BELOW_MINIMUM");
  assert.equal(createPcbRoute(p, { startPad: endpoints[0], endPad: endpoints[1], widthMm: 0.85 }).code, "TRACE_WIDTH_BELOW_MINIMUM");
  const wide = createPcbRoute(p, { startPad: endpoints[0], endPad: endpoints[1], waypoints: route.pointsMm.slice(1,-1) });
  assert.equal(wide.status, "complete"); assert.equal(wide.widthMm, 0.9);
  delete pcb.board.minimumTraceWidthMm; delete pcb.netClasses;
  assert.equal(minimumPcbTraceWidth(pcb, route.netId, 0.25), 0.25);
});

test("stricter saved rules are allowed but prevent fabrication until violated copper is fixed", async () => {
  const p = await load();
  const result = updatePcbBoard(p, { ...pcbBoardDefaults(p), minimumTraceWidthMm: 1 });
  assert.equal(result.status, "complete");
  const exported = exportPcbFabrication(result.project);
  assert.equal(exported.status, "blocked"); assert.deepEqual(exported.files, {});
  assert.ok(exported.drc.errors.some(message=>message.includes("minimum trace width")));
  const clearance = updatePcbBoard(p, { ...pcbBoardDefaults(p), minimumClearanceMm: 1 });
  assert.equal(clearance.status, "complete"); assert.equal(exportPcbFabrication(clearance.project).status, "blocked");
});

test("export rejects copper crossing the outline even when its center stays inside", async () => {
  const p = await load("121-single-sided-led-pcb");
  const pad = p.pcbFabrication.pads[0]; pad.xMm = pad.technology === "through-hole" ? pad.diameterMm/4 : pad.widthMm/4;
  const result = exportPcbFabrication(p);
  assert.equal(result.status, "blocked"); assert.ok(result.drc.errors.some(message=>message.includes("Copper pad") && message.includes("board outline")));
});

test("polygon board outlines validate, render and export their declared Edge.Cuts path", async () => {
  const p = await load("121-single-sided-led-pcb"), board = p.pcbFabrication.board;
  board.outline = { type: "polygon", pointsMm: [[0,3],[3,0],[37,0],[40,3],[40,21],[37,24],[3,24],[0,21]] };
  assert.deepEqual(boardDefinitionErrors(board), []);
  assert.deepEqual(boardGeometryErrors(p.pcbFabrication), []);
  assert.equal(validatePcbFabrication(p).status, "passed");
  const svg = renderPcbPreviewSvg(p);
  assert.match(svg, /<polygon class="pcb-board-outline"/);
  assert.doesNotMatch(svg, /<rect class="pcb-board-outline"/);
  const result = exportPcbFabrication(p);
  assert.equal(result.status, "passed", result.drc.errors.join("; "));
  const edgeCuts = result.files["board-Edge_Cuts.gbr"];
  assert.ok(edgeCuts.includes("X0003000000Y0000000000D01*"));
  assert.ok(edgeCuts.includes("X0000000000Y0003000000D02*"));
  const edited = updatePcbBoard(p, { ...pcbBoardDefaults(p), thicknessMm: 2 });
  assert.equal(edited.status, "complete");
  assert.deepEqual(edited.project.pcbFabrication.board.outline, board.outline);
});

test("polygon edge checks reject concave crossings, outside copper and malformed outlines", () => {
  const board = { widthMm: 10, heightMm: 10, thicknessMm: 1.6, copperLayers: ["F.Cu"], minimumClearanceMm: 0.2,
    outline: { type: "polygon", pointsMm: [[0,0],[10,0],[10,4],[4,4],[4,10],[0,10]] } };
  assert.deepEqual(boardDefinitionErrors(board), []);
  const copperOutside = { board, pads: [{ technology: "through-hole", xMm: 8, yMm: 8, diameterMm: 0.4 }], routes: [] };
  assert.ok(boardGeometryErrors(copperOutside).some(message => message.includes("Copper pad") && message.includes("outline")));
  const concaveCrossing = { board, pads: [], routes: [{ netId: "N", layer: "F.Cu", widthMm: 0.2, pointsMm: [[2,8],[8,2]] }] };
  assert.ok(boardGeometryErrors(concaveCrossing).some(message => message.includes("Route N")));
  const cutout = { board, pads: [], routes: [], mechanicalFeatures: [{ id: "C1", type: "edge-cutout", openingSide: "left", xMm: 0, yMm: 2, widthMm: 2, heightMm: 2 }] };
  assert.ok(boardGeometryErrors(cutout).some(message => message.includes("not supported on polygonal")));
  assert.ok(boardDefinitionErrors({ ...board, outline: { type: "polygon", pointsMm: [[0,0],[10,10],[0,10],[10,0]] } }).length);
  assert.ok(boardDefinitionErrors({ ...board, outline: { type: "polygon", pointsMm: [[0,0],[10,0],[10,0],[0,10]] } }).length);
});

test("manufacturing pack reports the actual updated board and supported layer scope", async () => {
  const p = await load(), changed = updatePcbBoard(p, { ...pcbBoardDefaults(p), widthMm: 48, heightMm: 25, thicknessMm: 2 }).project;
  const pack = createManufacturingExportPack(changed);
  assert.equal(pack.status, "passed"); const manifest = JSON.parse(pack.files["Export-Manifest.json"]);
  assert.equal(manifest.board.minimumClearanceMm, changed.pcbFabrication.board.minimumClearanceMm);
  assert.equal(manifest.board.minimumTraceWidthMm, changed.pcbFabrication.board.minimumTraceWidthMm);
  assert.equal(manifest.board.widthMm, 48); assert.equal(manifest.board.thicknessMm, 2);
  assert.deepEqual(manifest.board.copperLayers, ["F.Cu", "B.Cu"]);
  assert.ok(manifest.limitations.some(message=>message.includes("one/two-copper-layer")));
  assert.ok(pack.files["board-B_Cu.gbr"]);
});

test("board dialog commits once, preserves rejected edits and detects stale projects", async () => {
  const state = { project: await load(), dirty: false, activeTool: "pcb-route", pcbRouteDraft: {} }, nodes = {}, history = [], logs = [];
  const $ = id => nodes[id] ??= { value: "", textContent: "", events: {}, addEventListener(name, fn) { this.events[name] = fn; }, showModal() { this.open = true; }, close() { this.open = false; } };
  const fields = Object.keys(pcbBoardDefaults(state.project)).map(key=>({ dataset: { boardField: key }, value: "" }));
  const editor = createPcbBoardEditor({ state, $, $$: () => fields, t: key=>key, captureHistory: ()=>history.push(serializeProject(state.project)), render() {}, activateView: view=>state.activeView=view, log: message=>logs.push(message) });
  const set = (key,value)=>fields.find(f=>f.dataset.boardField===key).value=String(value);
  const submit = () => $("#pcb-board-form").events.submit({ preventDefault() {} });
  editor.action("pcb-board-setup"); set("widthMm", 50); submit();
  assert.equal(history.length, 1); assert.equal(state.dirty, true); assert.equal(state.activeView,"pcb"); assert.equal(state.pcbRouteDraft,null);
  assert.equal(state.project.pcbFabrication.board.widthMm,50);
  editor.action("pcb-board-setup"); submit(); assert.equal(history.length,1);
  editor.action("pcb-board-setup"); set("widthMm",1); submit(); assert.equal(history.length,1); assert.ok($("#pcb-board-error").textContent.startsWith("pcbBoardBlocked")); assert.equal($("#pcb-board-dialog").open,true);
  $("#pcb-board-cancel").events.click(); assert.equal($("#pcb-board-dialog").open,false);
  editor.action("pcb-board-setup"); state.project=structuredClone(state.project); submit(); assert.equal(history.length,1); assert.equal($("#pcb-board-error").textContent,"pcbBoardStale");
  state.project=parseProject(history[0]); assert.equal(state.project.pcbFabrication.board.widthMm,42);
});
