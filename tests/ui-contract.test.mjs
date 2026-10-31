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
  const languageSelect = html.match(/<select id="language">([\s\S]*?)<\/select>/)?.[1] ?? "";
  assert.deepEqual(values(languageSelect, /<option value="([^"]+)">/g), UI_LOCALES);
});

test("the approved corporate logo, official links, and current-year footer are present", async () => {
  const [html, app] = await Promise.all([readFile(indexFile, "utf8"), readFile(appFile, "utf8")]);
  const logo = await readFile(new URL("../assets/brand/hephzibah-behulah-official.jpg", import.meta.url));
  assert.deepEqual([...logo.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.match(html, /src="assets\/brand\/hephzibah-behulah-official\.jpg"/);
  assert.match(html, /alt="[^"]+" data-i18n-alt="corporateLogoAlt"/);
  assert.doesNotMatch(html, /class="logo-mark"/);
  for (const url of [
    "https://hephzibahbehulah.com/",
    "https://github.com/HephzibahBehulahHQ/AdigunSimulator",
    "https://github.com/HephzibahBehulahHQ/AdigunSimulator/issues",
    "https://www.facebook.com/Hephzibahbehulah/",
    "https://x.com/HephzibaBehulah",
    "https://www.instagram.com/hephzibahbehulah",
    "https://www.tiktok.com/@hephzibahbhehulah",
    "https://www.linkedin.com/in/isaacoluwoleadigun/"
  ]) assert.ok(html.includes(`href="${url}"`), `missing approved footer link: ${url}`);
  assert.match(html, /id="copyright-year"/);
  assert.match(app, /yearLabel\.textContent = String\(new Date\(\)\.getFullYear\(\)\)/);
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

test("released example picker points only to tested registry projects", async () => {
  const [html, app, manifestText] = await Promise.all([
    readFile(indexFile, "utf8"), readFile(appFile, "utf8"), readFile(new URL("../examples/manifest.json", import.meta.url), "utf8")
  ]);
  const manifest = JSON.parse(manifestText);
  const releasedFiles = manifest.examples.filter((example) => example.status === "released").map((example) => example.projectFile).sort();
  const pickerFiles = values(html, /<option value="(examples\/[^"]+\.adigun\.json)">/g).sort();
  assert.deepEqual(pickerFiles, releasedFiles);
  assert.match(app, /runSupportedAnalysis\(project\)/);
  assert.match(app, /Loaded and validated/);
});

test("electrical connection controls route through the validated project net model", async () => {
  const [html, app] = await Promise.all([readFile(indexFile, "utf8"), readFile(appFile, "utf8")]);
  for (const id of ["connection-form", "connection-first", "connection-second", "net-list"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(app, /connectPins\(state\.project/);
  assert.match(app, /disconnectPin\(state\.project/);
  assert.match(app, /validateAndReport\(\)/);
});

test("net list supports cross-view probing and accessible selection state", async () => {
  const [app, css] = await Promise.all([readFile(appFile, "utf8"), readFile(new URL("../styles.css", import.meta.url), "utf8")]);
  assert.match(app, /data-net-id=/);
  assert.match(app, /state\.selectedNetId = state\.selectedNetId === netButton\.dataset\.netId/);
  assert.match(app, /aria-pressed="\$\{net\.id === state\.selectedNetId\}"/);
  assert.match(app, /data-net="\$\{escape\(net\.id\)\}"/);
  assert.match(css, /\.placed-component\.is-net-highlight/);
  assert.match(css, /\.wire-layer \.is-net-highlight/);
});

test("keyboard shortcuts expose undo, redo, save, and selection removal", async () => {
  const app = await readFile(appFile, "utf8");
  assert.match(app, /modifier && key === "z"/);
  assert.match(app, /modifier && key === "y"/);
  assert.match(app, /modifier && key === "s"/);
  assert.match(app, /event\.key === "Delete" \|\| event\.key === "Backspace"/);
  assert.match(app, /const editingText = target instanceof HTMLElement/);
});

test("project import validates and confirms replacement before capturing or replacing state", async () => {
  const app = await readFile(appFile, "utf8");
  const parser = app.indexOf("const importedProject = parseProject(await file.text())");
  const confirmation = app.indexOf('if (state.dirty && !confirm("Replace the current project with this imported file?', parser);
  const capture = app.indexOf("captureHistory();", confirmation);
  const replacement = app.indexOf("replaceProject(importedProject, { dirty: false })", capture);
  assert.ok(parser >= 0 && parser < confirmation && confirmation < capture && capture < replacement);
  assert.match(app.slice(app.indexOf('catch (error)', parser), app.indexOf('finally { event.target.value', parser)), /Import blocked/);
});

test("unsaved edits write a local recovery draft and successful saves clear it", async () => {
  const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
  assert.match(source, /writeRecoveryDraft\(localStorage, RECOVERY_KEY, state\.project\)/);
  assert.match(source, /clearRecoveryDraft\(localStorage, RECOVERY_KEY\)/);
  assert.match(source, /Restored the latest unsaved project saved in this browser/);
});

test("the published example catalogue retains all 200 individually specified acceptance rows", async () => {
  const catalogue = await readFile(catalogueFile, "utf8");
  const rows = [...catalogue.matchAll(/^\|\s*(\d{1,3})\s*\|/gm)].map((match) => Number(match[1]));
  assert.equal(rows.length, 200);
  assert.deepEqual(rows, Array.from({ length: 200 }, (_, index) => index + 1));
  assert.match(catalogue, /row specifies[\s\S]*implemented or passed/i);
});

