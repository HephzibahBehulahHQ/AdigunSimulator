import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createPcbViaEditor } from "../js/pcb-via-controller.mjs";
import { savePcbVia } from "../js/pcb-via-edit.mjs";
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
  const viaTarget = element(); viaTarget.dataset.pcbPad = "@via:J1-A4";
  const button = element();
  const $$ = (selector) => selector === "[data-via-field]" ? fields : selector === "#design-canvas .pcb-via" ? [viaTarget] : selector === '[data-action="pcb-via-new"]' ? [button] : [];
  const editor = createPcbViaEditor({ state, $, $$, t: (key) => key, escape: (text) => String(text).replaceAll("<", "&lt;").replaceAll('"', "&quot;"), renderCanvas: () => editor.refresh(), render: () => editor.refresh(), activateView: (view) => { state.activeView = view; }, captureHistory: () => history.push(serializeProject(state.project)), validateAndReport() {}, showDialog: (title, text) => dialogs.push({ title, text }), log() {} });
  editor.refresh();
  const fill = (values) => fields.forEach((field) => { if (field.dataset.viaField in values) { field.value = String(values[field.dataset.viaField]); $("#pcb-via-form").events.input({ target: field }); } });
  const submit = () => $("#pcb-via-form").events.submit({ preventDefault() {} });
  return { editor, state, nodes, history, dialogs, fields, fill, submit, viaTarget, button, $ };
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
