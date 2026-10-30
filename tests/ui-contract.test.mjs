import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { UI_KEYS, UI_LOCALES } from "../js/i18n.mjs";

const indexFile = new URL("../index.html", import.meta.url);
const appFile = new URL("../app.js", import.meta.url);

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

