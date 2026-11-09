import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { createEmptyProject, createProject, serializeProject, parseProject } from "../js/core.mjs";
import { createProjectSession, confirmProjectReplacement, PROJECT_STORAGE_KEY, TRANSIENT_PROJECT_KEYS } from "../js/project-session.mjs";

function setup() {
  const state = { project: createProject(), dirty: true };
  const records = new Map([[PROJECT_STORAGE_KEY, serializeProject(state.project)], [TRANSIENT_PROJECT_KEYS[0], "old draft"], ["theme", "dark"]]);
  const storage = { removeItem: (key) => records.delete(key), getItem: (key) => records.get(key), setItem: (key, value) => records.set(key, value) };
  return { state, records, storage, session: createProjectSession(state, { storage: () => storage }) };
}
function target() {
  const listeners = new Map();
  return { listeners, addEventListener: (type, listener) => listeners.set(type, listener), removeEventListener: (type) => listeners.delete(type), fire: (type, event = {}) => listeners.get(type)?.(event) };
}

test("reset removes all project/history/selection/view/draft state while preserving manual saves", () => {
  const { state, records, session } = setup();
  const saved = records.get(PROJECT_STORAGE_KEY);
  let cancelled = 0;
  Object.assign(state, { currentProjectId: "old", selectedInstanceId: "old", selectedNetId: "net", history: ["old"], future: ["redo"], pan: { x: 90, y: -30 }, scale: 5, drag: {}, activeSimulation: { cancel: () => cancelled++ }, pcbViaDraft: {}, pcbRouteDraft: {}, schematicWireStart: {}, breadboardSyncPreview: {}, activeView: "pcb", lastAnalysis: { result: "old" } });
  session.reset();
  assert.equal(state.dirty, false);
  assert.equal(state.currentProjectId, null);
  assert.deepEqual(state.project.components, []);
  assert.deepEqual(state.project.nets, []);
  assert.equal(state.project.pcbFabrication, undefined);
  assert.deepEqual(state.history, []); assert.deepEqual(state.future, []);
  assert.deepEqual(state.pan, { x: 0, y: 0 }); assert.equal(state.scale, 1);
  for (const key of ["selectedInstanceId", "selectedNetId", "drag", "activeSimulation", "pcbViaDraft", "pcbRouteDraft", "schematicWireStart", "breadboardSyncPreview", "lastAnalysis"]) assert.equal(state[key], null, key);
  assert.equal(cancelled, 1); assert.equal(state.activeView, "breadboard");
  assert.equal(records.get(PROJECT_STORAGE_KEY), saved);
  assert.equal(records.get("theme"), "dark");
  assert.equal(records.has(TRANSIENT_PROJECT_KEYS[0]), false);
  const firstId = state.project.id; session.reset(); assert.notEqual(state.project.id, firstId);
});

test("only dirty beforeunload warns; cancellation never deletes transient or saved data", () => {
  const { state, records, session } = setup(), window = target();
  session.install(window);
  const event = { prevented: false, preventDefault() { this.prevented = true; } };
  window.fire("beforeunload", event);
  assert.equal(event.prevented, true); assert.equal(event.returnValue, "");
  assert.equal(records.get(TRANSIENT_PROJECT_KEYS[0]), "old draft");
  assert.ok(records.has(PROJECT_STORAGE_KEY));
  state.dirty = false;
  const clean = { preventDefault() { assert.fail("Clean close must not warn"); } };
  window.fire("beforeunload", clean);
  assert.equal(Object.hasOwn(clean, "returnValue"), false);
  window.fire("visibilitychange", { hidden: true });
  assert.equal(records.get(TRANSIENT_PROJECT_KEYS[0]), "old draft");
});

test("confirmed departure clears only transient state and removes listeners; BFCache resumes empty", () => {
  for (const persisted of [false, true]) {
    const { state, records, session } = setup(), window = target();
    session.install(window);
    const pending = session.beginLoad();
    window.fire("pagehide", { persisted });
    assert.equal(pending(), false);
    assert.equal(records.has(TRANSIENT_PROJECT_KEYS[0]), false);
    assert.ok(records.has(PROJECT_STORAGE_KEY));
    if (persisted) {
      window.fire("pageshow", { persisted: true });
      assert.deepEqual(state.project.components, []); assert.equal(state.dirty, false);
    } else assert.equal(window.listeners.size, 0);
  }
});

test("explicit disposal removes every lifecycle listener", () => {
  const { session } = setup(), window = target();
  const dispose = session.install(window); dispose(); dispose();
  assert.equal(window.listeners.size, 0);
});

test("inaccessible storage cannot prevent clean reset", () => {
  const state = { project: createProject(), dirty: true };
  const session = createProjectSession(state, { storage: () => { throw new Error("denied"); } });
  assert.equal(session.clearTransient(), false);
  session.reset(); assert.equal(state.dirty, false); assert.equal(state.project.components.length, 0);
});

test("late imports/examples cannot overwrite reset, edits, newer requests or explicit reopen", () => {
  for (const action of ["reset", "edit", "save", "new-request", "reopen", "none"]) {
    const { state, session } = setup(); const pending = session.beginLoad();
    if (action === "reset") session.reset();
    if (action === "edit") state.project.metadata.name = "newer edit";
    if (action === "new-request") session.beginLoad();
    if (action === "save") session.markSaved("local");
    if (action === "reopen") session.reset(createProject(), { saved: "local" });
    assert.equal(pending(), action === "none", action);
  }
});

test("in-app cancellation/Escape preserves work; discard confirms and clean state skips dialog", async () => {
  for (const choice of ["cancel", "discard"]) {
    const state = { dirty: true }, dialog = { open: false, addEventListener(type, listener) { this.onClose = listener; }, showModal() { this.open = true; } };
    const confirmation = confirmProjectReplacement({ state, dialog });
    assert.equal(dialog.returnValue, "cancel");
    assert.equal(await confirmProjectReplacement({ state, dialog }), false);
    dialog.returnValue = choice; dialog.onClose();
    assert.equal(await confirmation, choice === "discard");
    assert.equal(state.dirty, true);
  }
  assert.equal(await confirmProjectReplacement({ state: { dirty: false }, dialog: { showModal() { assert.fail("Clean project must not prompt"); } } }), true);
});

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
function realFunction(name, next, globals) {
  const start = source.indexOf(`function ${name}(`), end = source.indexOf(next, start);
  assert.ok(start >= 0 && end > start);
  return runInNewContext(`${source.slice(start, end)}\n${name}`, globals);
}

test("actual Save clears dirty only after storage succeeds and remains explicitly reopenable", () => {
  for (const fail of [false, true]) {
    const { state, storage, records, session } = setup(); let errors = 0;
    if (fail) storage.setItem = () => { throw new Error("quota"); };
    const save = realFunction("saveLocal", "function captureHistory", { state, localStorage: storage, STORAGE_KEY: PROJECT_STORAGE_KEY, serializeProject, projectSession: session, componentPropertiesUi: { resetSession() {} }, updateSaveState() {}, log() {}, t: (key) => key, showDialog: () => errors++ });
    save(); assert.equal(state.dirty, fail); assert.equal(errors, Number(fail));
    if (!fail) { assert.equal(state.currentProjectId, state.project.id); assert.equal(parseProject(records.get(PROJECT_STORAGE_KEY)).id, state.project.id); }
  }
});

test("actual native export clears dirty only after successful browser handoff", () => {
  for (const fail of [false, true]) {
    const { state, session } = setup(); let errors = 0, clicked = 0, revoked = 0;
    const link = { click() { if (fail) throw new Error("download unavailable"); clicked++; } };
    const exportProject = realFunction("exportProject", "\nfunction ", { state, projectSession: session, componentPropertiesUi: { resetSession() {} }, serializeProject, Blob, document: { createElement: () => link }, URL: { createObjectURL: () => "blob:test", revokeObjectURL: () => revoked++ }, setTimeout: (fn) => fn(), updateSaveState() {}, log() {}, t: (key) => key, showDialog: () => errors++ });
    exportProject(); assert.equal(state.dirty, fail); assert.equal(errors, Number(fail)); assert.equal(clicked, Number(!fail)); assert.equal(revoked, 1);
  }
});

test("actual import remains dirty and cannot complete after a newer reset", async () => {
  for (const resetDuringRead of [false, true]) {
    const { state, session } = setup(); state.dirty = false;
    let handler, finishRead;
    const start = source.indexOf('$("#import-file").addEventListener("change"');
    const end = source.indexOf("// Boot is deliberately empty", start);
    runInNewContext(source.slice(start, end), { $: () => ({ addEventListener: (_, fn) => { handler = fn; } }), state, projectSession: session, componentPropertiesUi: { resetSession() {} }, parseProject, confirmDiscardChanges: async () => true, log() {}, showDialog: (_, message) => assert.fail(message) });
    const imported = createProject();
    const event = { target: { files: [{ name: "fixture.json", text: () => new Promise((resolve) => { finishRead = resolve; }) }], value: "fixture" } };
    const loading = handler(event);
    if (resetDuringRead) session.reset();
    finishRead(serializeProject(imported)); await loading;
    assert.equal(state.dirty, !resetDuringRead);
    assert.equal(state.project.components.length === 0, resetDuringRead);
    assert.equal(event.target.value, "");
    if (!resetDuringRead) assert.equal(state.project.id, imported.id);
  }
});


test("open confirmation blocks canvas shortcuts without consuming native Escape", () => {
  const start = source.indexOf('document.addEventListener("keydown", (event) => {');
  const end = source.indexOf('\n});', start) + 4;
  let handler;
  runInNewContext(source.slice(start, end), { document: { addEventListener: (_, fn) => { handler = fn; }, querySelector: () => ({ open: true }) }, handleAppMenuKeydown: () => assert.fail("Menu/canvas shortcuts must not run behind modal") });
  for (const key of ["Delete", "Backspace", "Escape", "z"]) handler({ key, preventDefault: () => assert.fail("Native dialog controls must remain usable") });
});
