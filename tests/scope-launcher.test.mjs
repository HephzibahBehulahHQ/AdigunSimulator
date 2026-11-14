import test from "node:test";
import assert from "node:assert/strict";
import { createScopeLauncher, recordScopeAnalysis } from "../js/scope-launcher.mjs";

function createFixture() {
  const listeners = new Map();
  const attributes = new Map();
  const button = {
    hidden: false,
    title: "",
    addEventListener: (name, handler) => listeners.set(name, handler),
    setAttribute: (name, value) => attributes.set(name, value),
    remove: () => { button.removed = true; },
    listeners,
    attributes
  };
  const document = { createElement: tag => {
    assert.equal(tag, "button");
    return button;
  } };
  const canvas = { appended: null, append: node => { canvas.appended = node; } };
  let opens = 0;
  const launcher = createScopeLauncher({ document, canvas, onOpen: () => { opens += 1; } });
  return { launcher, button, canvas, listeners, attributes, opens: () => opens };
}

test("floating oscilloscope launcher appears after a successful current-project run and opens", () => {
  const fixture = createFixture();
  const state = { project: { id: "buck-101", revision: 1 } };
  fixture.launcher.update(state, "Open oscilloscope");
  assert.equal(fixture.button.hidden, true);

  recordScopeAnalysis(state, { state: "complete", result: { kind: "buck-converter" } }, () => {
    fixture.launcher.update(state, "Open oscilloscope");
  });

  assert.equal(fixture.canvas.appended, fixture.button);
  assert.equal(fixture.button.hidden, false);
  assert.equal(fixture.button.className, "scope-launcher");
  assert.equal(fixture.attributes.get("aria-label"), "Open oscilloscope");
  let stopped = false;
  fixture.listeners.get("click")({ stopPropagation: () => { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(fixture.opens(), 1);
});

test("launcher stays hidden for failed runs and stale project results", () => {
  const fixture = createFixture();
  const state = { project: { id: "buck-101", revision: 1 } };

  recordScopeAnalysis(state, { state: "blocked" }, () => fixture.launcher.update(state, "Open oscilloscope"));
  assert.equal(fixture.button.hidden, true);

  recordScopeAnalysis(state, { state: "complete" }, () => fixture.launcher.update(state, "Open oscilloscope"));
  assert.equal(fixture.button.hidden, false);

  state.project = { ...state.project, revision: 2 };
  fixture.launcher.update(state, "Open oscilloscope");
  assert.equal(fixture.button.hidden, true);

  fixture.launcher.remove();
  assert.equal(fixture.button.removed, true);
});
