import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { TRANSLATIONS } from "../js/i18n.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
// Execute the actual UI functions with small DOM boundaries, not copies of their logic.
function uiFunction(name, nextName, globals) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(nextName, start);
  assert.ok(start >= 0 && end > start);
  return runInNewContext(`${source.slice(start, end)}\n${name}`, globals);
}

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

test("completed STM32, timer, LED, and reactive results reach rendering without resistor-network assumptions", async () => {
  for (const file of ["070-stm32-timer-pwm", "021-555-astable-blinker", "001-led-current-limiter", "005-rc-step-response", "006-rl-step-response"]) {
    const project = JSON.parse(await readFile(new URL(`../examples/${file}.adigun.json`, import.meta.url), "utf8"));
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete", file);
    let renders = 0;
    const state = { project };
    const log = [];
    const complete = uiFunction("runAnalysis", "async function verifyRunLockfile(", {
      state, log: (line) => log.push(line), renderOutput: () => { renders += 1; }
    });
    complete(analysis);
    assert.equal(renders, 1, file);
    assert.equal(state.lastAnalysis, analysis);
    assert.ok(log.some((line) => line.startsWith("[LIMIT]")), file);
  }
});
