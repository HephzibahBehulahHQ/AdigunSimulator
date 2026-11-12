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

test("late imports/exam