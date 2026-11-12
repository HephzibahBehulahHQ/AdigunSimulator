import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext as vmRun } from "node:vm";
const runInNewContext=(code,globals)=>vmRun(code,{wireUi:{reset(){},pointerDown:()=>false,pointerMove:()=>false,pointerEnd:()=>false,keydown:()=>false},...globals});
import { TRANSLATIONS } from "../js/i18n.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { pcbCopperPads } from "../js/pcb-vias.mjs";
import { CANVAS_ZOOM, createCanvasCamera, zoomCanvasCamera, canvasClientPoint, canvasClientDelta } from "../js/canvas-camera.mjs";
import { pcbPreviewPointToBoardMm } from "../js/pcb-preview.mjs";
import { parseProject, serializeProject } from "../js/core.mjs";
import { movePcbFootprint } from "../js/pcb-edit.mjs";
import { rotatePcbFootprint } from "../js/pcb-rotate.mjs";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
// Execute the actual UI functions with small DOM boundaries, not copies of their logic.
function uiFunction(name, nextName, globals) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(nextName, start);
  assert.ok(start >= 0 && end > start);
  return runInNewContext(`${source.slice(start, end)}\n${name}`, globals);
}

test("the real Undo/Redo functions round-trip a fractional PCB move and preserve native nets", async () => {
  const original = parseProject(await readFile(new URL("../examples/125-usbc-breakout.adigun.json", import.meta.url), "utf8"));
  const moved = movePcbFootprint(original, "rd1", { x: 0.5, y: 0 }).project;
  const state = { project: moved, history: [serializeProject(original)], future: [] };
  const start = source.indexOf("function replaceProject("), end = source.indexOf("function updateSaveState(", start);
  const actions = runInNewContext(`${source.slice(start, end)}\n({undo,redo})`, { state, wireUi:{reset(){}}, parseProject, serializeProject, render() {}, log() {}, t: (k) => k, showDialog: (title, message) => assert.fail(message) });
  actions.undo();
  assert.deepEqual(state.project.pcbFabrication, original.pcbFabrication);
  actions.redo();
  assert.deepEqual(state.project.pcbFabrication, moved.pcbFabrication);
  assert.deepEqual(state.project.nets, original.nets);
  actions.undo();
  assert.deepEqual(state.project.pcbFabrication, original.pcbFabrication);
});

test("PCB rotation UI commits once, clears a draft, supports Undo/Redo and preserves rejected edits", async () => {
  const original = parseProject(await readFile(new URL("../examples/125-usbc-breakout.adigun.json", import.meta.url), "utf8"));
  const state = { project: original, activeView: "pcb", activeTool: "pcb-route", pcbRouteDraft: { pointsMm: [[1, 2]] }, history: [], future: [] };
  let dialogs = 0, validations = 0;
  const globals = { state, rotatePcbFootprint, parseProject, serializeProject, render() {}, log() {}, t: (k) => k,
    selectedComponent: () => state.project.components.find((c) => c.instanceId === "rd1"),
    captureHistory: () => { state.history.push(serializeProject(state.project)); state.future = []; },
    validateAndReport: () => { validations++; }, showDialog: () => { dialogs++; } };
  const rotate = uiFunction("rotateSelectedPcbFootprint", "function handleAction(", globals);
  rotate(90);
  assert.equal(state.history.length, 1);
  assert.equal(state.activeTool, "select");
  assert.equal(state.pcbRouteDraft, null);
  assert.equal(state.dirty, true);
  assert.equal(validations, 1);
  const rotated = structuredClone(state.project);
  const start = source.indexOf("function replaceProject("), end = source.indexOf("function updateSaveState(", start);
  const actions = runInNewContext(`${source.slice(start, end)}\n({undo,redo})`, globals);
  actions.undo(); assert.deepEqual(state.project.pcbFabrication, original.pcbFabrication);
  actions.redo(); assert.deepEqual(state.project.pcbFabrication, rotated.pcbFabrication);
  assert.deepEqual(state.project.nets, original.nets);
  const before = JSON.stringify(state);
  rotate(45);
  assert.equal(dialogs, 1);
  assert.equal(JSON.stringify(state), before);
  state.activeView = "schematic";
  rotate(90);
  assert.equal(state.project.pcbFabrication.parts.find((p) => p.instanceId === "rd1").rotationDeg, 90);
});

test("rejected history snapshots leave the current project and both history stacks intact", () => {
  for (const direction of ["undo", "redo"]) {
    const state = { project: { id: "preserved" }, history: ['{"invalid":"previous"}'], future: ['{"invalid":"next"}'], botUnsavedOnly: true };
    const before = JSON.stringify(state);
    let dialogs = 0;
    const start = source.indexOf("function replaceProject("), end = source.indexOf("function updateSaveState(", start);
    const actions = runInNewContext(`${source.slice(start, end)}\n({undo,redo})`, { state, wireUi:{reset(){}}, parseProject, serializeProject, render() {}, log() {}, t: (k) => k, showDialog: () => { dialogs++; } });
    actions[direction]();
    assert.equal(dialogs, 1);
    assert.equal(JSON.stringify(state), before);
  }
});

test("real canvas zoom and fit update the whole scene without changing the native project or tool", () => {
  const project = { id: "unchanged-project" };
  const state = { project, scale: 1, pan: { x: 25, y: -10 }, activeTool: "pcb-route" };
  const scene = { style: {} };
  const previewScene = { style: {} };
  const nodes = { "#design-canvas": { clientWidth: 680, clientHeight: 300, querySelector: () => scene }, "#zoom-level": {}, '[data-tool="zoom-in"]': {}, '[data-tool="zoom-out"]': {} };
  nodes["#schematic-mini"] = { clientWidth: 340, clientHeight: 240, querySelector: () => previewScene };
  nodes["#pcb-mini"] = { clientWidth: 0, clientHeight: 0, querySelector: () => null };
  const start = source.indexOf("function applyCanvasCamera(");
  const end = source.indexOf("function renderCanvasFeedback(", start);
  const { apply, zoom } = runInNewContext(`${source.slice(start, end)}\n({apply:applyCanvasCamera,zoom:changeCanvasZoom})`, {
    state, $: (selector) => nodes[selector], CANVAS_ZOOM, createCanvasCamera, zoomCanvasCamera
  });
  apply();
  assert.equal(previewScene.style.transform, "translate(0px, 45px) scale(0.5)");
  zoom("zoom-in");
  assert.equal(state.scale, 1.25);
  assert.equal(nodes["#zoom-level"].textContent, "125%");
  assert.match(scene.style.transform, /scale\(1\.25\)/);
  assert.equal(state.project, project);
  assert.equal(state.activeTool, "pcb-route");
  assert.equal(previewScene.style.transform, "translate(0px, 45px) scale(0.5)", "preview uses one fixed transform independent of main-canvas zoom");
  for (let i = 0; i < 20; i++) zoom("zoom-in");
  assert.equal(state.scale, 8);
  assert.equal(nodes['[data-tool="zoom-in"]'].disabled, true);
  zoom("fit");
  assert.equal(state.scale, 1);
  assert.equal(state.pan.x, 0);
  assert.equal(state.pan.y, 0);
  assert.equal(nodes['[data-tool="zoom-in"]'].disabled, false);
  assert.equal(state.project, project);
});

test("sidebar toggles preserve project, selection, camera and mounted canvas", () => {
  const project = { id: "preserved" }, history = [{ project }], pan = { x: 12, y: -4 };
  const state = { project, history, pan, selectedInstanceId: "R1", leftBarOpen: true, rightBarOpen: true };
  const classes = () => ({ values: new Set(), toggle(name, enabled) { enabled ? this.values.add(name) : this.values.delete(name); } });
  const nodes = { "#workspace": { classList: classes() }, ".library-panel": { classList: classes(), contains: () => true }, ".inspector-panel": { classList: classes(), contains: () => false } };
  const buttons = { left: { expanded: "true", focused: false, setAttribute(key, value) { this.expanded = value; }, focus() { this.focused = true; } }, right: { expanded: "true", setAttribute(key, value) { this.expanded = value; } } };
  const lookup = selector => nodes[selector] ?? buttons[selector.includes('"left"') ? "left" : "right"];
  const set = uiFunction("setWorkspacePanel", "function rotateSelectedPcbFootprint", { state, $: lookup, $$: selector => [lookup(selector)], document: { activeElement: {} } });
  set("left", false); set("right", false);
  assert.equal(state.leftBarOpen, false); assert.equal(state.rightBarOpen, false);
  assert.equal(buttons.left.expanded, "false"); assert.equal(buttons.left.focused, true);
  assert.ok(nodes["#workspace"].classList.values.has("left-panel-closed"));
  set("left", true); set("right", true);
  assert.equal(state.leftBarOpen, true); assert.equal(state.rightBarOpen, true);
  assert.equal(buttons.right.expanded, "true"); assert.equal(nodes["#workspace"].classList.values.size, 0);
  assert.equal(state.project, project); assert.equal(state.history, history); assert.equal(state.pan, pan); assert.equal(state.selectedInstanceId, "R1");
});

test("a pointer click without dragging selects the component before replacing its canvas DOM", () => {
  const project = { id: "untouched" };
  const canvas = { releasePointerCapture() {}, querySelector: () => ({ getBoundingClientRect: () => ({ width:680,height:300 }) }) };
  const state = { project, selectedInstanceId: "R1", drag: { mode: "move", pointerId: 7, instanceId: "U1", start: { x: 100, y: 100 }, canvas } };
  let handler, inspector, renderedSelection;
  const start = source.indexOf('document.addEventListener("pointerup"');
  const end = source.indexOf('\n});', start) + 4;
  runInNewContext(source.slice(start, end), { pcbViaEditor: { pointerEnd: () => false }, state, document: { addEventListener: (_, value) => { handler = value; } }, canvasClientDelta, setInspector: value => { inspector = value; }, renderInspector() {}, updateSaveState() {}, renderCanvas: () => { renderedSelection = state.selectedInstanceId; }, captureHistory: () => { throw new Error("Selection must not edit history"); } });
  handler({ pointerId:7, clientX:100, clientY:100 });
  assert.equal(state.selectedInstanceId, "U1"); assert.equal(renderedSelection,"U1"); assert.equal(inspector,"component"); assert.equal(state.project,project); assert.equal(state.drag,null);
});

test("the document pointercancel handler routes via cancellation before other drag handlers", () => {
  const start = source.indexOf('document.addEventListener("pointercancel"');
  const end = source.indexOf("\n});", start) + 4;
  assert.ok(start >= 0 && end > start);
  const event = { pointerId: 42 };
  let received;
  runInNewContext(source.slice(start, end), {
    pcbViaEditor: { pointerEnd: (actual, cancelled) => { received = { actual, cancelled }; return true; } },
    wireUi: { pointerEnd: () => assert.fail("Via cancellation must be handled before schematic wire drags") },
    document: { addEventListener: (name, handler) => { assert.equal(name, "pointercancel"); handler(event); } }
  });
  assert.deepEqual(received, { actual: event, cancelled: true });
});

test("general canvas drags reject secondary pointers and cannot be replaced mid-drag", () => {
  const start = source.indexOf('document.addEventListener("pointerdown"');
  const end = source.indexOf("\n});", start) + 4;
  assert.ok(start >= 0 && end > start);
  const captures = [], canvas = { setPointerCapture: (id) => captures.push(id) };
  const target = { closest: (selector) => selector === "#design-canvas" ? canvas : null };
  function dispatch(state, event) {
    let handler;
    runInNewContext(source.slice(start, end), {
      pcbViaEditor: { pointerDown: () => false }, wireUi: { pointerDown: () => false }, state,
      document: { addEventListener: (name, callback) => { assert.equal(name, "pointerdown"); handler = callback; } }
    });
    let prevented = false;
    handler({ target, button: 0, ...event, preventDefault: () => { prevented = true; } });
    return prevented;
  }
  const idle = { activeTool: "pan", placement: null, drag: null };
  assert.equal(dispatch(idle, { pointerId: 1, isPrimary: false }), true);
  assert.equal(idle.drag, null); assert.deepEqual(captures, []);
  const activeDrag = { mode: "pan", pointerId: 2 };
  const active = { activeTool: "pan", placement: null, drag: activeDrag };
  assert.equal(dispatch(active, { pointerId: 3, isPrimary: false }), true);
  assert.equal(active.drag, activeDrag); assert.deepEqual(captures, []);
});

test("Escape closes an application menu and restores focus without consuming unrelated keys", () => {
  let focused = 0, prevented = 0;
  const menu = { open: true, querySelector: () => ({ focus: () => { focused++; } }) };
  const handle = uiFunction("handleAppMenuKeydown", 'document.addEventListener("click"', {
    document: { querySelector: () => menu.open ? menu : null }
  });
  const event = { key: "Escape", preventDefault: () => { prevented++; } };
  assert.equal(handle({ ...event, key: "Enter" }), false);
  assert.equal(menu.open, true);
  assert.equal(handle(event), true);
  assert.equal(menu.open, false);
  assert.equal(focused, 1);
  assert.equal(prevented, 1);
  assert.equal(handle(event), false);
});


test("canvas feedback preserves the review disclosure and escapes project text outside the drawing", () => {
  for (const locale of ["en", "de", "yo", "pcm"]) {
    const nodes = Object.fromEntries(["canvas-view-label", "view-reconciliation", "view-reconciliation-summary", "view-reconciliation-items"].map((id) => [`#${id}`, { open: true }]));
    const render = uiFunction("renderCanvasFeedback", "function renderCanvas(", {
      $: (selector) => nodes[selector], t: (key) => TRANSLATIONS[locale][key],
      escape: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    });
    render([{ reference: "<R1>", reason: "<img src=x> & unmapped" }], TRANSLATIONS[locale].pcbStoredLayoutPreview);
    assert.equal(nodes["#canvas-view-label"].textContent, TRANSLATIONS[locale].pcbStoredLayoutPreview);
    assert.equal(nodes["#view-reconciliation"].hidden, false);
    assert.equal(nodes["#view-reconciliation"].open, true);
    assert.equal(nodes["#view-reconciliation-summary"].textContent, `${TRANSLATIONS[locale].viewReconciliationNeeded} (1)`);
    assert.equal(nodes["#view-reconciliation-items"].innerHTML, "<li>&lt;R1&gt;: &lt;img src=x&gt; &amp; unmapped</li>");
    render([], "New view");
    assert.equal(nodes["#view-reconciliation"].hidden, true);
    assert.equal(nodes["#view-reconciliation-items"].innerHTML, "");
  }
});

test("Enter and Space select a PCB via through the real route interaction handler", () => {
  for (const key of ["Enter", " "]) {
    const state = { activeView: "pcb", activeTool: "pcb-route", project: { pcbFabrication: {
      pads: [], vias: [{ id: "test", netId: "VCC", xMm: 2, yMm: 3, diameterMm: 0.6, drillMm: 0.3 }]
    } } };
    const pad = { dataset: { pcbPad: "@via:test", pcbNet: "VCC", xMm: "2", yMm: "3" } };
    let prevented = 0;
    const event = { key, target: { closest: (selector) => ["[data-pcb-pad]", "#design-canvas"].includes(selector) ? pad : null }, preventDefault: () => { prevented++; }, stopPropagation() {} };
    const start = source.indexOf("function handlePcbRouteCanvasClick(");
    const end = source.indexOf('document.addEventListener("click"', start);
    const activate = runInNewContext(`${source.slice(start, end)}\nhandlePcbRouteKeydown`, {
      state, pcbCopperPads, $: () => ({ value: "B.Cu" }), render() {}, log() {}
    });
    assert.equal(activate(event), true);
    assert.equal(state.pcbRouteDraft.startPad, "@via:test");
    assert.equal(JSON.stringify(state.pcbRouteDraft.pointsMm), "[[2,3]]");
    assert.equal(prevented, 1);
    assert.equal(activate({ ...event, key: "ArrowRight" }), false);
    state.activeTool = "select";
    assert.equal(activate(event), false);
  }
});

test("route board clicks use zoomed coordinates, snap to millimetres and reject points outside the board", async () => {
  const project = parseProject(await readFile(new URL("../examples/125-usbc-breakout.adigun.json", import.meta.url), "utf8"));
  const state = { activeView: "pcb", activeTool: "pcb-route", project, pcbRouteDraft: { pointsMm: [[2, 3]] } };
  const rect = { left: 100, top: 80, width: 1020, height: 450 };
  const svg = { getBoundingClientRect: () => rect };
  const click = uiFunction("handlePcbRouteCanvasClick", "function handlePcbRouteKeydown(", {
    state, canvasClientPoint, pcbPreviewPointToBoardMm, $: () => ({ checked: true }), renderCanvas() {}
  });
  const event = (worldX, worldY) => ({ clientX: rect.left + worldX * 1.5, clientY: rect.top + worldY * 1.5,
    target: { closest: (selector) => selector === "#design-canvas" ? {} : selector === ".pcb-preview-svg" ? svg : null } });
  const before = serializeProject(project);
  assert.equal(click(event(434, 223)), true);
  assert.deepEqual(state.pcbRouteDraft.pointsMm.at(-1), [30, 17]);
  assert.equal(state.pcbRouteHintKey, "pcbRouteWaypoint");
  click(event(434, 223));
  assert.equal(state.pcbRouteDraft.pointsMm.length, 2);
  click(event(20, 20));
  assert.equal(state.pcbRouteHintKey, "pcbRouteBlocked");
  assert.equal(state.pcbRouteDraft.pointsMm.length, 2);
  assert.equal(serializeProject(project), before);
});

test("localization updates every placeholder and image alt without aborting startup", () => {
  for (const locale of ["en", "de", "yo", "pcm"]) {
    const placeholders = [0, 1].map(() => ({ dataset: { i18nPlaceholder: "locale" }, placeholder: "old" }));
    const images = [0, 1].map(() => ({ dataset: { i18nAlt: "corporateLogoAlt" }, alt: "old" }));
    const language = {};
    const document = { documentElement: {} };
    const elements = { "[data-i18n-placeholder]": placeholders, "[data-i18n-alt]": images };
    const apply = uiFunction("applyLocale", "function renderAcSweepOutputOptions(", {
      state: { project: { metadata: { locale } } }, document, TRANSLATIONS,
      $: (selector) => selector === "#language" ? language : elements[selector]?.[0],
      $$: (selector) => elements[selector] ?? []
    });
    apply();
    assert.equal(document.documentElement.lang, locale);
    assert.equal(language.value, locale);
    placeholders.forEach((element) => assert.equal(element.placeholder, TRANSLATIONS[locale].locale));
    images.forEach((element) => assert.equal(element.alt, TRANSLATIONS[locale].corporateLogoAlt));
  }
});

test("diagnostic tab selection updates all tabs and renders an empty error list", () => {
  const makeElement = (dataset = {}) => ({ dataset, classes: {}, classList: { toggle(name, active) { this.owner.classes[name] = active; } } });
  const elements = Object.fromEntries(["#result-dashboard", "#export-simulation-report", "#workspace-notes", "#output-log", "#issue-list"].map((id) => [id, makeElement()]));
  const tabs = ["output", "errors", "warnings"].map((output) => makeElement({ output }));
  [...Object.values(elements), ...tabs].forEach((element) => { element.classList.owner = element; });
  const render = uiFunction("renderOutput", "function applyLocale(", {
    state: { activeOutput: "errors", lastAnalysis: null },
    $: (selector) => selector === ".output-tab" ? tabs[0] : elements[selector],
    $$: (selector) => selector === ".output-tab" ? tabs : []
  });
  render({ errors: [], warnings: [] });
  assert.deepEqual(tabs.map((tab) => tab.classes.active), [false, true, false]);
  assert.equal(elements["#issue-list"].textContent, "[ERRORS] None.");
});

test("completed results feed playback even when canvas feedback is disabled", async () => {
  for (const file of ["070-stm32-timer-pwm", "021-555-astable-blinker", "001-led-current-limiter", "005-rc-step-response", "006-rl-step-response"]) {
    const project = JSON.parse(await readFile(new URL(`../examples/${file}.adigun.json`, import.meta.url), "utf8"));
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete", file);
    let renders = 0;
    const state = { project };
    const log = [];
    const feedback = [];
    const complete = uiFunction("runAnalysis", "async function verifyRunLockfile(", {
      state, log: (line) => log.push(line), renderOutput: () => { renders += 1; },
      $: selector => { assert.equal(selector,"#feedback-live"); return {checked:false}; },
      dcFeedback: {accept: (p,result)=>feedback.push([p,result])}
    });
    complete(analysis);
    assert.equal(renders, 1, file);
    assert.equal(state.lastAnalysis, analysis);
    assert.equal(state.lastAnalysisProjectKey,JSON.stringify(project));
    assert.deepEqual(feedback,[[project,analysis]]);
    assert.ok(log.some((line) => line.startsWith("[LIMIT]")), file);
  }
});


test("completed DC feedback refreshes wire and junction inspector measurements without a transient frame",()=>{
  const start=source.indexOf('const dcFeedback = createLiveDcFeedback('),end=source.indexOf('const FEEDBACK_MOTION_TEXT',start);let callbacks;const calls=[];
  vmRun(source.slice(start,end),{createLiveDcFeedback:options=>{callbacks=options;return {};},renderCanvas:()=>calls.push('canvas'),wireUi:{paintMeasurements:()=>calls.push('measurements')},renderFeedbackControls:()=>calls.push('controls'),paintSimulationFrame:()=>calls.push('frame')});
  callbacks.onPaint({frameOnly:false});assert.deepEqual(calls,['canvas','measurements','controls']);calls.length=0;
  callbacks.onPaint({frameOnly:true});assert.deepEqual(calls,['frame','controls']);
});


test("canvas feedback toggle redraws without stopping or restarting scope playback",()=>{
  const start=source.indexOf('$("#feedback-live").addEventListener("change"'),end=source.indexOf('\n',start);
  let change;const calls=[];
  vmRun(source.slice(start,end),{$:()=>({addEventListener:(_,fn)=>{change=fn;}}),renderCanvas:()=>calls.push('canvas'),wireUi:{paintMeasurements:()=>calls.push('measurements')},dcFeedback:{stop:()=>assert.fail('must not stop playback'),accept:()=>assert.fail('must not restart playback')}});
  change();assert.deepEqual(calls,['canvas','measurements']);
});
