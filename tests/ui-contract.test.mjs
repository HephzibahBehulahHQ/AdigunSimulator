import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { UI_KEYS, UI_LOCALES } from "../js/i18n.mjs";

const indexFile = new URL("../index.html", import.meta.url);
const appFile = new URL("../app.js", import.meta.url);
const catalogueFile = new URL("../docs/EXAMPLE_CATALOGUE.md", import.meta.url);

function values(text, expression) {
  return [...text.matchAll(expression)].map((match) => match[1]);
}

test("the interface references only declared translation keys and exposes four locales", async () => {
  const html = await readFile(indexFile, "utf8");
  const keys = values(html, /data-i18n(?:-(?:placeholder|aria|title))?="([^"]+)"/g);
  assert.ok(keys.length > 30);
  for (const key of keys) assert.ok(UI_KEYS.includes(key), `index.html references unknown translation key: ${key}`);
  assert.deepEqual(values(html, /<option value="([^"]+)">/g), UI_LOCALES);
});

test("enabled project commands are implemented while unreleased tools remain disabled", async () => {
  const [html, app] = await Promise.all([readFile(indexFile, "utf8"), readFile(appFile, "utf8")]);
  const actions = [...new Set(values(html, /data-action="([^"]+)"/g))];
  for (const action of actions) assert.match(app, new RegExp(`action === "${action}"`));
  for (const command of ["Simulation", "PCB", "Tools"]) {
    assert.match(html, new RegExp(`<button[^>]*disabled-command[^>]*disabled[^>]*>${command}</button>`));
  }
});

test("diagnostics tabs have an accessible target and a stateful handler", async () => {
  const [html, app] = await Promise.all([readFile(indexFile, "utf8"), readFile(appFile, "utf8")]);
  assert.deepEqual(values(html, /data-output="([^"]+)"/g), ["output", "errors", "warnings"]);
  assert.match(html, /id="issue-list"/);
  assert.match(app, /state\.activeOutput = outputTab\.dataset\.output/);
  assert.match(app, /function renderOutput/);
});

test("the published example catalogue retains all 200 individually specified acceptance rows", async () => {
  const catalogue = await readFile(catalogueFile, "utf8");
  const rows = [...catalogue.matchAll(/^\|\s*(\d{1,3})\s*\|/gm)].map((match) => Number(match[1]));
  assert.equal(rows.length, 200);
  assert.deepEqual(rows, Array.from({ length: 200 }, (_, index) => index + 1));
  assert.match(catalogue, /row specifies[\s\S]*implemented or passed/i);
});

