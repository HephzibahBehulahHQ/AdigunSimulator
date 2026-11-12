import assert from "node:assert/strict";
import test from "node:test";
import { searchGlobalActions } from "../js/global-search.mjs";

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
