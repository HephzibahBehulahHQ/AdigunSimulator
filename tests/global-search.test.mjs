import assert from "node:assert/strict";
import test from "node:test";
import { isGlobalSearchShortcut, searchGlobalActions } from "../js/global-search.mjs";

const actions = [
  { id: "save", label: "Save project", keywords: "file local" },
  { id: "pcb", label: "PCB view", keywords: "board layout" },
  { id: "help", label: "Open implementation status", keywords: "help status" }
];

test("global search finds tools and help by any order of query terms", () => {
  assert.deepEqual(searchGlobalActions(actions, "view PCB").map((item) => item.id), ["pcb"]);
  assert.deepEqual(searchGlobalActions(actions, "help implementation").map((item) => item.id), ["help"]);
  assert.deepEqual(searchGlobalActions(actions, "local save").map((item) => item.id), ["save"]);
});

test("global search ignores blank queries and requires every term", () => {
  assert.deepEqual(searchGlobalActions(actions, "  "), []);
  assert.deepEqual(searchGlobalActions(actions, "save PCB"), []);
});

test("global search shortcut accepts Ctrl or Command K without Alt", () => {
  assert.equal(isGlobalSearchShortcut({ ctrlKey: true, metaKey: false, altKey: false, key: "k" }), true);
  assert.equal(isGlobalSearchShortcut({ ctrlKey: false, metaKey: true, altKey: false, key: "K" }), true);
  assert.equal(isGlobalSearchShortcut({ ctrlKey: false, metaKey: false, altKey: false, key: "k" }), false);
  assert.equal(isGlobalSearchShortcut({ ctrlKey: true, metaKey: false, altKey: true, key: "k" }), false);
});

test("global search resolves a numeric example ID with or without its title", async () => {
  const { isGlobalExampleQuery, matchGlobalExample } = await import("../js/global-search.mjs");
  const entries = [{ file: "030-reference-buffer.adigun.json", title: "Precision reference buffer" }, { file: "031-transistor-common-emitter.adigun.json", title: "NPN common-emitter amplifier" }];
  assert.equal(isGlobalExampleQuery("031"), true);
  assert.equal(matchGlobalExample(entries, "031"), entries[1]);
  assert.equal(matchGlobalExample(entries, "Example 031 — NPN common-emitter amplifier"), entries[1]);
  assert.equal(matchGlobalExample(entries, "#30"), entries[0]);
  assert.equal(matchGlobalExample(entries, "031 amplifier"), null);
});
