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
  for (const key of ["selectedInstanceId", "selectedNetId", "selectedWire", "wireCursor", "placement", "drag", "activeSimulation", "pcbViaDraft", "pcbRouteDraft", "schematicWireStart", "breadboardSyncPreview", "lastAnalysis"]) assert.equal(state[key], null, key);
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
    const save = realFunction("saveLocal", "function captureHistory", { state, localStorage: storage, STORAGE_KEY: PROJECT_STORAGE_KEY, serializeProject, recentProjects: { save: async () => {} }, projectSession: session, componentPropertiesUi: { resetSession() {} }, updateSaveState() {}, log() {}, t: (key) => key, showDialog: () => errors++ });
    save(); assert.equal(state.dirty, fail); assert.equal(errors, Number(fail));
    if (!fail) { assert.equal(state.currentProjectId, state.project.id); assert.equal(parseProject(records.get(PROJECT_STORAGE_KEY)).id, state.project.id); }
  }
});

test("recent-history storage failure does not invalidate the primary local save", async () => {
  const { state, storage, session } = setup();
  const messages = [];
  const save = realFunction("saveLocal", "function captureHistory", {
    state, localStorage: storage, STORAGE_KEY: PROJECT_STORAGE_KEY, serializeProject,
    recentProjects: { save: async () => { throw new Error("IndexedDB unavailable"); } },
    projectSession: session, componentPropertiesUi: { resetSession() {} }, updateSaveState() {},
    log: (message) => messages.push(message), t: (key) => key, showDialog: () => assert.fail("Primary save should succeed")
  });
  save();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(state.dirty, false);
  assert.ok(storage.getItem(PROJECT_STORAGE_KEY));
  assert.ok(messages.some((message) => message.includes("RECENTS") && message.includes("IndexedDB unavailable")));
});

test("recent project opening respects discard confirmation and restores the saved snapshot", async () => {
  const { state } = setup();
  const original = state.project;
  const savedProject = createProject();
  let closed = false, confirms = false;
  const record = { id: savedProject.id, name: "Recent test", savedAt: 1, serialized: serializeProject(savedProject) };
  const start = source.indexOf("async function openSelectedRecentProject("), end = source.indexOf("function saveLocal", start);
  assert.ok(start >= 0 && end > start);
  const open = runInNewContext(`${source.slice(start, end)}\nopenSelectedRecentProject`, {
    $: (selector) => selector === "#recent-project-picker" ? { value: savedProject.id } : { close: () => { closed = true; } },
    projectSession: { beginLoad: () => () => true, reset: (project, options) => { state.project = project; state.dirty = options.saved !== "local"; state.currentProjectId = options.currentProjectId; } },
    recentProjects: { get: async (id) => id === record.id ? record : null, save: async () => {} },
    parseProject, confirmDiscardChanges: async () => confirms,
    componentPropertiesUi: { resetSession() {} }, log() {}, t: (key) => key, showDialog: () => assert.fail("Unexpected recent-project dialog")
  });
  await open();
  assert.equal(closed, true);
  assert.equal(state.project, original);
  confirms = true;
  await open();
  assert.equal(state.project.id, savedProject.id);
  assert.equal(state.currentProjectId, savedProject.id);
  assert.equal(state.dirty, false);
});

test("removing a recent project requires confirmation and leaves other saved copies untouched", async () => {
  const picker = { value: "recent-1", replaceChildren(...options) { this.options = options; } };
  const openButton = { disabled: false }, removeButton = { disabled: false }, status = { hidden: true, textContent: "" };
  const record = { id: "recent-1", name: "Local draft", savedAt: 1, serialized: "snapshot" };
  let confirmed = false, deleted = false;
  const recentProjects = {
    async get(id) { return id === record.id && !deleted ? record : null; },
    async delete(id) { assert.equal(id, record.id); deleted = true; },
    async list() { return deleted ? [] : [record]; }
  };
  const selectors = {
    "#recent-project-picker": picker,
    "#recent-project-open": openButton,
    "#recent-project-remove": removeButton,
    "#recent-project-status": status
  };
  const start = source.indexOf("function populateRecentProjectPicker("), end = source.indexOf("async function openSelectedRecentProject(", start);
  assert.ok(start >= 0 && end > start);
  const remove = runInNewContext(`${source.slice(start, end)}\nremoveSelectedRecentProject`, {
    $: selector => selectors[selector], recentProjects,
    document: { createElement: () => ({}) }, confirm: () => confirmed,
    t: key => key, showDialog: () => assert.fail("Unexpected removal error")
  });

  await remove();
  assert.equal(deleted, false);
  confirmed = true;
  await remove();
  assert.equal(deleted, true);
  assert.equal(picker.value, "");
  assert.equal(picker.disabled, true);
  assert.equal(openButton.disabled, true);
  assert.equal(removeButton.disabled, true);
  assert.equal(status.hidden, false);
  assert.match(status.textContent, /recentProjectRemoved/);
});

test("deleting the saved project copy confirms, preserves Recent snapshots, and dirties its open project", () => {
  const project = createProject();
  const storage = new Map([[PROJECT_STORAGE_KEY, serializeProject(project)]]);
  const recentSnapshots = [{ id: project.id, serialized: serializeProject(project) }];
  const state = { project, currentProjectId: project.id, savedDisposition: "local", dirty: false };
  let confirmed = false, updates = 0;
  const messages = [];
  const start = source.indexOf("function deleteSavedProject("), end = source.indexOf("function populateRecentProjectPicker(", start);
  assert.ok(start >= 0 && end > start);
  const remove = runInNewContext(`${source.slice(start, end)}\ndeleteSavedProject`, {
    state, STORAGE_KEY: PROJECT_STORAGE_KEY, localStorage: {
      getItem: key => storage.get(key) ?? null,
      removeItem: key => storage.delete(key)
    }, parseProject, confirm: prompt => { messages.push(prompt); return confirmed; },
    updateSaveState: () => updates++, log: value => messages.push(value),
    t: key => key, showDialog: (title, body) => messages.push({ title, body })
  });

  remove();
  assert.equal(storage.has(PROJECT_STORAGE_KEY), true);
  assert.equal(state.dirty, false);
  assert.equal(updates, 0);
  confirmed = true;
  remove();
  assert.equal(storage.has(PROJECT_STORAGE_KEY), false);
  assert.equal(state.dirty, true);
  assert.equal(updates, 1);
  assert.equal(recentSnapshots.length, 1);
  assert.ok(messages[1].includes("deleteSavedProjectPrompt"));
  assert.ok(messages[1].includes(project.metadata.name));
  assert.ok(messages.some(message => message?.body === "savedProjectDeleted"));
});

test("deleting a local saved copy does not dirty a different or cloud-saved open project", () => {
  const saved = createProject(), open = createProject();
  const storage = new Map([[PROJECT_STORAGE_KEY, serializeProject(saved)]]);
  const state = { project: open, currentProjectId: open.id, savedDisposition: "cloud", dirty: false };
  let updates = 0;
  const start = source.indexOf("function deleteSavedProject("), end = source.indexOf("function populateRecentProjectPicker(", start);
  const remove = runInNewContext(`${source.slice(start, end)}\ndeleteSavedProject`, {
    state, STORAGE_KEY: PROJECT_STORAGE_KEY, localStorage: { getItem: key => storage.get(key), removeItem: key => storage.delete(key) },
    parseProject, confirm: () => true, updateSaveState: () => updates++, log() {},
    t: key => key, showDialog() {}
  });
  remove();
  assert.equal(storage.has(PROJECT_STORAGE_KEY), false);
  assert.equal(state.dirty, false);
  assert.equal(updates, 0);
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
