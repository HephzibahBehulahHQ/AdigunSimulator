import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createPcbViaEditor } from "../js/pcb-via-controller.mjs";
import { savePcbVia } from "../js/pcb-via-edit.mjs";
import { getPcbPreviewScale } from "../js/pcb-preview.mjs";
import { parseProject, serializeProject } from "../js/core.mjs";

async function harness() {
  const project = parseProject(await readFile(new URL("../examples/125-usbc-breakout.adigun.json", import.meta.url), "utf8"));
  const state = { project, activeView: "pcb", activeTool: "select", pcbSelectedViaId: null, pcbViaDraft: null };
  const nodes = {}, history = [], dialogs = [];
  const element = () => ({ value: "", dataset: {}, events: {}, attributes: {}, classList: { toggle() {} }, addEventListener(name, fn) { this.events[name] = fn; }, setAttribute(name, value) { this.attributes[name] = value; }, focus() { this.focused = true; } });
  const $ = (id) => nodes[id] ??= element();
  const fields = ["netId", "xMm", "yMm", "diameterMm", "drillMm"].map((key) => {
    const e = key === "netId" ? $("#pcb-via-net") : key === "xMm" ? $("#pcb-via-x") : element();
    e.dataset.viaField = key; return e;
  });
  const rect = { left: 100, top: 80, width: 1020, height: 450 };
  const svg = { getBoundingClientRect: () => rect };
  const captures = [];
  const canvas = { setPointerCapture: (id) => captures.push(`set:${id}`), releasePointerCapture: (id) => captures.push(`release:${id}`) };
  const viaTarget = element(); viaTarget.dataset.pcbPad = "@via:J1-A4"; viaTarget.ownerSVGElement = svg;
  viaTarget.closest = (selector) => selector === "#design-canvas" ? canvas : selector === "#design-canvas .pcb-via" ? viaTarget : null;
  const button = element();
  const $$ = (selector) => selector === "[data-via-field]" ? fields : selector === "#design-canvas .pcb-via" ? [viaTarget] : selector === '[data-action="pcb-via-new"]' ? [button] : [];
  const editor = createPcbViaEditor({ state, $, $$, t: (key) => key, escape: (text) => String(text).replaceAll("<", "&lt;").replaceAll('"', "&quot;"), renderCanvas: () => editor.refresh(), render: () => editor.refresh(), activateView: (view) => { state.activeView = view; }, captureHistory: () => history.push(serializeProject(state.project)), validateAndReport() {}, showDialog: (title, text) => dialogs.push({ title, text }), log() {} });
  editor.refresh();
  const fill = (values) => fields.forEach((field) => { if (field.dataset.viaField in values) { field.value = String(values[field.dataset.viaField]); $("#pcb-via-form").events.input({ target: field }); } });
  const submit = () => $("#pcb-via-form").events.submit({ preventDefault() {} });
  return { editor, state, nodes, history, dialogs, fields, fill, submit, viaTarget, button, $, rect, captures, canvas };
}

function clientAt(project, xMm, yMm, rect) {
  const board = project.pcbFabrication.board, scale = getPcbPreviewScale(board);
  const x0 = (680 - board.widthMm * scale) / 2, y0 = (300 - board.heightMm * scale) / 2;
  return { clientX: rect.left + (x0 + xMm * scale) * rect.width / 680, clientY: rect.top + (y0 + yMm * scale) * rect.height / 300 };
}

test("via inspector submits real edits once and rejected edits preserve the native project and history", async () => {
  const h = await harness(), original = structuredClone(h.state.project);
  h.fill({ netId: "VBUS", xMm: 25, yMm: 17, diameterMm: 0.6, drillMm: 0.3 }); h.submit();
  assert.equal(h.history.length, 1); assert.equal(h.state.pcbSelectedViaId, "via-1");
  assert.equal(h.$("#pcb-via-net").disabled, true);
  assert.equal(h.state.dirty, true); assert.equal(h.state.recoveryActive, true);
  assert.deepEqual(parseProject(h.history[0]), original);
  h.fill({ xMm: 26 }); h.submit();
  assert.equal(h.history.length, 2); assert.equal(h.state.project.pcbFabrication.vias.at(-1).xMm, 26);
  const before = serializeProject(h.state.project);
  h.fill({ xMm: 0 }); h.submit();
  assert.equal(h.dialogs.length, 1); assert.equal(h.history.length, 2);
  assert.equal(serializeProject(h.state.project), before);
  assert.equal(h.editor.action("pcb-via-remove"), true);
  assert.equal(h.history.length, 3); assert.equal(h.state.pcbSelectedViaId, null);
  assert.deepEqual(h.state.project.pcbFabrication, original.pcbFabrication);
  assert.deepEqual(h.state.project.nets, original.nets);
});

test("board picking converts transformed coordinates into a draft without committing, and Escape cancels", async () => {
  const h = await harness();
  h.$("#snap-toggle").checked = true;
  h.editor.action("pcb-via-pick");
  assert.equal(h.state.activeTool, "pcb-via");
  const rect = { left: 100, top: 80, width: 1020, height: 450 };
  const svg = { getBoundingClientRect: () => rect };
  assert.equal(h.editor.click({ clientX: 610, clientY: 305, target: { closest: () => svg } }), true);
  assert.equal(h.state.pcbViaDraft.xMm, 21); assert.equal(h.state.pcbViaDraft.yMm, 10);
  assert.equal(h.history.length, 0); assert.equal(h.state.activeTool, "select");
  assert.equal(h.$("#pcb-via-x").focused, true);
  h.editor.action("pcb-via-pick");
  let prevented = false;
  assert.equal(h.editor.keydown({ key: "Escape", preventDefault: () => { prevented = true; } }), true);
  assert.equal(prevented, true); assert.equal(h.state.activeTool, "select"); assert.equal(h.history.length, 0);
});

test("Enter selects a stored via for editing, route mode keeps its own keyboard handler and one-layer boards disable editing", async () => {
  const h = await harness();
  const event = { key: "Enter", target: { closest: () => h.viaTarget }, preventDefault() {} };
  assert.equal(h.editor.keydown(event), true);
  assert.equal(h.state.pcbSelectedViaId, "J1-A4"); assert.equal(h.viaTarget.focused, true);
  assert.equal(h.state.selectedInstanceId, null);
  assert.equal(h.viaTarget.attributes["aria-pressed"], "true");
  h.state.activeTool = "pcb-route"; assert.equal(h.editor.keydown(event), false);
  h.state.project.pcbFabrication.board.copperLayers = ["F.Cu"];
  h.editor.refresh();
  assert.equal(h.button.disabled, true); assert.equal(h.$("#pcb-via-fields").disabled, true);
  assert.equal(h.$("#pcb-via-hint").textContent, "pcbViaTwoLayers");
  h.state.project.pcbFabrication.board.copperLayers = ["F.Cu", "B.Cu", "In1.Cu"];
  h.editor.refresh(); assert.equal(h.$("#pcb-via-fields").disabled, true);
});

test("Delete on a via removes only that via and never the previously selected component", async () => {
  const h = await harness();
  h.state.selectedInstanceId = "usb";
  const components = structuredClone(h.state.project.components), nets = structuredClone(h.state.project.nets);
  let prevented = false;
  assert.equal(h.editor.keydown({ key: "Delete", target: { closest: () => h.viaTarget }, preventDefault: () => { prevented = true; } }), true);
  assert.equal(prevented, true); assert.equal(h.history.length, 1);
  assert.equal(h.state.project.pcbFabrication.vias.some((v) => v.id === "J1-A4"), false);
  assert.deepEqual(h.state.project.components, components); assert.deepEqual(h.state.project.nets, nets);
});

test("arrow keys nudge a focused via by the documented snap increment and retain one history entry per move", async () => {
  const h = await harness();
  const before = structuredClone(h.state.project);
  const created = savePcbVia(h.state.project, { netId: "VBUS", xMm: 25, yMm: 17, diameterMm: 0.6, drillMm: 0.3 });
  assert.equal(created.status, "complete");
  h.state.project = created.project;
  h.viaTarget.dataset.pcbPad = `@via:${created.viaId}`;
  h.$("#snap-toggle").checked = true;
  let prevented = false;
  assert.equal(h.editor.keydown({ key: "ArrowRight", target: { closest: () => h.viaTarget }, preventDefault: () => { prevented = true; } }), true);
  assert.equal(prevented, true);
  assert.equal(h.state.project.pcbFabrication.vias.at(-1).xMm, 25.5);
  assert.equal(h.history.length, 1);
  assert.equal(h.viaTarget.focused, true);
  h.$("#snap-toggle").checked = false;
  assert.equal(h.editor.keydown({ key: "ArrowDown", target: { closest: () => h.viaTarget }, preventDefault() {} }), true);
  assert.equal(h.state.project.pcbFabrication.vias.at(-1).yMm, 17.1);
  assert.equal(h.history.length, 2);
  assert.deepEqual(h.state.project.nets, before.nets);
  const moved = structuredClone(h.state.project.pcbFabrication.vias.at(-1));
  h.state.activeTool = "pcb-route";
  assert.equal(h.editor.keydown({ key: "ArrowLeft", target: { closest: () => h.viaTarget }, preventDefault() {} }), false);
  assert.deepEqual(h.state.project.pcbFabrication.vias.at(-1), moved);
  assert.equal(h.history.length, 2);
});

test("pointer drag previews a via move and commits one guarded, undoable edit", async () => {
  const h = await harness();
  const created = savePcbVia(h.state.project, { netId: "VBUS", xMm: 25, yMm: 17, diameterMm: 0.6, drillMm: 0.3 });
  h.state.project = created.project; h.viaTarget.dataset.pcbPad = `@via:${created.viaId}`; h.editor.refresh();
  const original = h.state.project, beforeNets = structuredClone(original.nets);
  h.$("#snap-toggle").checked = true;
  const from = clientAt(original, 25, 17, h.rect), to = clientAt(original, 25.5, 17.5, h.rect);
  const target = { closest: (selector) => selector === "#design-canvas .pcb-via" ? h.viaTarget : selector === "#design-canvas" ? h.canvas : null };
  assert.equal(h.editor.pointerDown({ ...from, button: 0, pointerId: 4, target, preventDefault() {} }), true);
  assert.equal(h.editor.pointerMove({ ...from, clientX: from.clientX + 1, pointerId: 4 }), true);
  assert.equal(h.state.project, original); assert.equal(h.history.length, 0);
  assert.equal(h.editor.pointerMove({ ...to, pointerId: 4 }), true);
  assert.equal(h.state.project.pcbFabrication.vias.find((via) => via.id === created.viaId).xMm, 25.5);
  assert.equal(h.history.length, 0);
  assert.equal(h.editor.pointerEnd({ ...to, pointerId: 4 }), true);
  const moved = h.state.project.pcbFabrication.vias.find((via) => via.id === created.viaId);
  assert.deepEqual([moved.xMm, moved.yMm], [25.5, 17.5]);
  assert.equal(h.history.length, 1); assert.deepEqual(parseProject(h.history[0]), original);
  assert.deepEqual(h.state.project.nets, beforeNets); assert.equal(h.state.suppressCanvasClick, true);
  assert.deepEqual(h.captures, ["set:4", "release:4"]);
});

test("via drag cancellation restores the original project and blocked drops do not create history", async () => {
  const h = await harness();
  const created = savePcbVia(h.state.project, { netId: "VBUS", xMm: 25, yMm: 17, diameterMm: 0.6, drillMm: 0.3 });
  h.state.project = created.project; h.viaTarget.dataset.pcbPad = `@via:${created.viaId}`; h.editor.refresh();
  const original = h.state.project;
  const from = clientAt(original, 25, 17, h.rect), to = clientAt(original, 25.5, 17.5, h.rect);
  const target = { closest: (selector) => selector === "#design-canvas .pcb-via" ? h.viaTarget : selector === "#design-canvas" ? h.canvas : null };
  h.editor.pointerDown({ ...from, button: 0, pointerId: 5, target, preventDefault() {} });
  h.editor.pointerMove({ ...to, pointerId: 5 });
  assert.equal(h.editor.keydown({ key: "Escape", preventDefault() {} }), true);
  assert.equal(h.state.project, original); assert.equal(h.history.length, 0);
  const outside = { clientX: h.rect.left + h.rect.width + 40, clientY: from.clientY };
  h.editor.pointerDown({ ...from, button: 0, pointerId: 6, target, preventDefault() {} });
  h.editor.pointerMove({ ...outside, pointerId: 6 });
  assert.equal(h.editor.pointerEnd({ ...outside, pointerId: 6 }), true);
  assert.equal(h.state.project, original); assert.equal(h.history.length, 0);
  assert.equal(h.dialogs.length, 1);
});

test("pointer cancellation restores the original via and releases pointer capture without history", async () => {
  const h = await harness();
  const created = savePcbVia(h.state.project, { netId: "VBUS", xMm: 25, yMm: 17, diameterMm: 0.6, drillMm: 0.3 });
  h.state.project = created.project; h.state.dirty = true; h.viaTarget.dataset.pcbPad = `@via:${created.viaId}`; h.editor.refresh();
  const original = h.state.project, from = clientAt(original, 25, 17, h.rect), to = clientAt(original, 25.5, 17.5, h.rect);
  const target = { closest: (selector) => selector === "#design-canvas .pcb-via" ? h.viaTarget : selector === "#design-canvas" ? h.canvas : null };
  h.editor.pointerDown({ ...from, button: 0, pointerId: 8, target, preventDefault() {} });
  h.editor.pointerMove({ ...to, pointerId: 8 });
  assert.notEqual(h.state.project, original);
  assert.equal(h.editor.pointerEnd({ pointerId: 8 }, true), true);
  assert.equal(h.state.project, original); assert.equal(h.state.dirty, true); assert.equal(h.history.length, 0);
  assert.deepEqual(h.captures, ["set:8", "release:8"]);
});

test("a via pointer click selects it without creating a move history entry", async () => {
  const h = await harness(), project = h.state.project;
  const point = clientAt(project, 7.75, 3.7, h.rect);
  const target = { closest: (selector) => selector === "#design-canvas .pcb-via" ? h.viaTarget : selector === "#design-canvas" ? h.canvas : null };
  assert.equal(h.editor.pointerDown({ ...point, button: 0, pointerId: 7, target, preventDefault() {} }), true);
  assert.equal(h.editor.pointerEnd({ ...point, pointerId: 7 }), true);
  assert.equal(h.state.pcbSelectedViaId, "J1-A4");
  assert.equal(h.viaTarget.attributes["aria-pressed"], "true");
  assert.equal(h.viaTarget.focused, true);
  assert.equal(h.state.project, project); assert.equal(h.history.length, 0);
});
