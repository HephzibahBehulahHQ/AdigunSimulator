import {
  STARTER_LIBRARY,
  addComponent,
  createProject,
  findLibraryPart,
  getViewReconciliationIssues,
  parseProject,
  runSupportedAnalysis,
  serializeProject,
  updateComponent,
  validateProject
} from "./js/core.mjs";

const STORAGE_KEY = "adigun-simulator.project.v1";
const translations = {
  en: { newProject: "New Project", import: "Import", validate: "Validate", undo: "Undo", redo: "Redo", open: "Open", save: "Save", export: "Export", components: "Components", breadboard: "Breadboard View", schematic: "Schematic View", pcb: "PCB View", properties: "Properties" },
  de: { newProject: "Neues Projekt", import: "Importieren", validate: "Prüfen", undo: "Rückgängig", redo: "Wiederholen", open: "Öffnen", save: "Speichern", export: "Exportieren", components: "Bauteile", breadboard: "Steckbrett", schematic: "Schaltplan", pcb: "Leiterplatte", properties: "Eigenschaften" },
  yo: { newProject: "Iṣẹ́ tuntun", import: "Gbé wọlé", validate: "Ṣàyẹ̀wò", undo: "Padà", redo: "Tún ṣe", open: "Ṣí", save: "Fipamọ́", export: "Gbé jáde", components: "Àwọn ẹ̀yà", breadboard: "Pátákó ìdánwò", schematic: "Àwòrán asopọ", pcb: "PCB", properties: "Àwọn àbùdá" },
  pcm: { newProject: "New Project", import: "Bring am enter", validate: "Check am", undo: "Undo am", redo: "Do am again", open: "Open", save: "Save", export: "Export", components: "Parts", breadboard: "Breadboard View", schematic: "Circuit drawing", pcb: "PCB View", properties: "Properties" }
};

const state = {
  project: loadProject(),
  selectedLibraryId: null,
  selectedInstanceId: "resistor-1",
  activeView: "breadboard",
  activeInspector: "component",
  scale: 1,
  history: [],
  future: [],
  dirty: true,
  lastValidation: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function loadProject() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseProject(stored) : createProject();
  } catch {
    return createProject();
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, serializeProject(state.project));
  state.dirty = false;
  updateSaveState();
  log("[SAVED] Project stored locally in this browser.");
}

function captureHistory() {
  state.history.push(serializeProject(state.project));
  if (state.history.length > 30) state.history.shift();
  state.future = [];
}

function replaceProject(project, { dirty = true } = {}) {
  state.project = project;
  state.selectedInstanceId = project.components[0]?.instanceId ?? null;
  state.dirty = dirty;
  render();
}

function undo() {
  if (!state.history.length) return log("[INFO] There is no earlier local edit to undo.");
  state.future.push(serializeProject(state.project));
  replaceProject(parseProject(state.history.pop()));
  log("[UNDO] Restored the previous local project state.");
}

function redo() {
  if (!state.future.length) return log("[INFO] There is no later local edit to redo.");
  state.history.push(serializeProject(state.project));
  replaceProject(parseProject(state.future.pop()));
  log("[REDO] Restored the next local project state.");
}

function updateSaveState() {
  $("#save-state").textContent = state.dirty ? "Unsaved changes" : "Saved locally";
  $("#save-state").classList.toggle("saved", !state.dirty);
}

function selectedComponent() {
  return state.project.components.find((item) => item.instanceId === state.selectedInstanceId) ?? null;
}

function renderLibrary() {
  const query = $("#component-search").value.trim().toLowerCase();
  const matching = STARTER_LIBRARY.filter((part) => `${part.type} ${part.id}`.toLowerCase().includes(query));
  $("#component-list").innerHTML = matching.map((part) => `
    <li><button type="button" class="component-item ${part.id === state.selectedLibraryId ? "selected" : ""}" data-library-id="${escape(part.id)}">
      <span class="component-icon">◇</span><span><strong>${escape(part.type)}</strong><small>${escape(part.defaultValue)} · ${escape(part.simulation)}</small></span>
    </button></li>`).join("") || "<li class=\"empty-list\">No starter components match the search.</li>";
  const part = findLibraryPart(state.selectedLibraryId);
  $("#selected-part-type").textContent = part ? part.type : "Select a component";
  $("#selected-part-name").textContent = part ? part.id : "No part selected";
  $("#selected-part-detail").textContent = part ? `${part.status}; simulation: ${part.simulation}.` : "Search the available starter library.";
  $("#add-component").disabled = !part;
}

function componentVisual(component, view) {
  const part = findLibraryPart(component.libraryId);
  const type = part?.type ?? "Unknown component";
  const selected = component.instanceId === state.selectedInstanceId ? "is-selected" : "";
  const x = component.position?.[view]?.[0] ?? 120;
  const y = component.position?.[view]?.[1] ?? 120;
  const className = component.libraryId.replaceAll(".", "-");
  return `<button type="button" class="placed-component ${className} ${selected}" data-instance-id="${escape(component.instanceId)}" style="--x:${x}px;--y:${y}px" aria-label="${escape(component.reference)} ${escape(type)}"><span class="part-reference">${escape(component.reference)}</span><span class="part-body">${component.libraryId === "diode.led-red" ? "●" : component.libraryId === "power.dc-source" ? "+ −" : component.libraryId === "ground.signal" ? "⏚" : component.libraryId === "passive.resistor" ? "▥" : "▣"}</span><span class="part-value">${escape(component.value)}</span></button>`;
}

function renderCanvas() {
  const canvas = $("#design-canvas");
  canvas.className = `design-canvas ${state.activeView} ${$("#grid-toggle").checked ? "grid-enabled" : ""}`;
  canvas.setAttribute("aria-label", `${state.activeView} representation. Select a component to inspect it.`);
  const issues = getViewReconciliationIssues(state.project, state.activeView);
  const unavailable = new Set(issues.map((issue) => issue.instanceId));
  const parts = state.project.components.filter((component) => !unavailable.has(component.instanceId)).map((component) => componentVisual(component, state.activeView)).join("");
  const wires = state.activeView === "schematic"
    ? `<svg class="wire-layer" viewBox="0 0 680 300" aria-hidden="true"><path d="M130 145 H255 M325 145 H450 M510 145 V205 H560 M560 205 H95 V145"/><circle cx="255" cy="145" r="4"/><circle cx="450" cy="145" r="4"/></svg>`
    : state.activeView === "pcb"
      ? `<svg class="wire-layer" viewBox="0 0 680 300" aria-hidden="true"><path class="track-red" d="M105 132 H240 V180 H410"/><path class="track-blue" d="M118 195 H330 V142 H500"/></svg>`
      : `<div class="breadboard-board" aria-hidden="true"><i></i><i></i><i></i><i></i></div><svg class="wire-layer" viewBox="0 0 680 300" aria-hidden="true"><path class="jumper-red" d="M112 145 H250 H460"/><path class="jumper-black" d="M112 198 H560"/></svg>`;
  const reconciliationNotice = issues.length ? `<div class="reconciliation-notice"><strong>Reconciliation needed</strong>${issues.map((issue) => `<span>${escape(issue.reference)}: ${escape(issue.reason)}</span>`).join("")}</div>` : "";
  canvas.innerHTML = `<div class="canvas-label">${state.activeView === "breadboard" ? "Topology-aware breadboard representation" : state.activeView === "schematic" ? "Canonical net representation" : "PCB mapping preview — routing/DRC not implemented"}</div>${reconciliationNotice}${wires}${parts}`;
  const miniSchematic = state.project.components.filter((component) => !getViewReconciliationIssues({ components: [component] }, "schematic").length).map((component) => componentVisual(component, "schematic")).join("");
  const miniPcb = state.project.components.filter((component) => !getViewReconciliationIssues({ components: [component] }, "pcb").length).map((component) => componentVisual(component, "pcb")).join("");
  $("#schematic-mini").innerHTML = `<svg class="wire-layer" viewBox="0 0 680 300" aria-hidden="true"><path d="M130 145 H255 M325 145 H450 M510 145 V205 H560 M560 205 H95 V145"/></svg>${miniSchematic}`;
  $("#pcb-mini").innerHTML = `<svg class="wire-layer" viewBox="0 0 680 300" aria-hidden="true"><path class="track-red" d="M105 132 H240 V180 H410"/><path class="track-blue" d="M118 195 H330 V142 H500"/></svg>${miniPcb}`;
}

function renderInspector() {
  const component = selectedComponent();
  const part = component && findLibraryPart(component.libraryId);
  $("#property-type").value = part?.type ?? "No component selected";
  $("#property-reference").value = component?.reference ?? "";
  $("#property-value").value = component?.value ?? "";
  $("#property-status").value = part?.status ?? "Unresolved library part";
  $("#component-form").classList.toggle("hidden", state.activeInspector !== "component");
  $("#project-form").classList.toggle("hidden", state.activeInspector !== "project");
  $("#simulation-form").classList.toggle("hidden", state.activeInspector !== "simulation");
  $("#project-name").value = state.project.metadata.name;
  $("#project-locale").value = state.project.metadata.locale;
  $("#component-form button").disabled = !component;
}

function renderValidation() {
  const validation = state.lastValidation ?? validateProject(state.project);
  $("#error-count").textContent = validation.errors.length;
  $("#warning-count").textContent = validation.warnings.length;
  $("#validation-summary").textContent = validation.valid
    ? `${validation.warnings.length} warning(s); no blocking project schema errors.`
    : `${validation.errors.length} error(s) block analysis.`;
}

function applyLocale() {
  const locale = state.project.metadata.locale;
  const messages = translations[locale] ?? translations.en;
  document.documentElement.lang = locale;
  $$('[data-i18n]').forEach((node) => { node.textContent = messages[node.dataset.i18n] ?? translations.en[node.dataset.i18n] ?? node.textContent; });
  $("#language").value = locale;
}

function render() {
  renderLibrary();
  renderCanvas();
  renderInspector();
  renderValidation();
  applyLocale();
  updateSaveState();
}

function log(message) {
  const output = $("#output-log");
  output.textContent = `${output.textContent.trim()}\n${message}`.trim();
  output.scrollTop = output.scrollHeight;
}

function showDialog(title, message) {
  $("#dialog-title").textContent = title;
  $("#dialog-message").textContent = message;
  $("#status-dialog").showModal();
}

function validateAndReport() {
  state.lastValidation = validateProject(state.project);
  renderValidation();
  const issues = [...state.lastValidation.errors, ...state.lastValidation.warnings];
  if (!issues.length) log("[VALIDATION] No schema errors or warnings were found in the current starter project.");
  else issues.forEach((issue) => log(`[${issue.rule}] ${issue.message}`));
}

function runAnalysis() {
  validateAndReport();
  const result = runSupportedAnalysis(state.project);
  if (result.state === "complete") {
    const { sourceVoltage, resistance, ledVf, currentA, resistorPowerW, ledOn } = result.result;
    log(`[ANALYSIS] ${result.engine}`);
    log(`[RESULT] Vsource=${sourceVoltage.toFixed(3)} V, Vf=${ledVf.toFixed(3)} V, R=${resistance.toFixed(3)} Ω`);
    log(`[RESULT] I=${(currentA * 1000).toFixed(3)} mA, Presistor=${(resistorPowerW * 1000).toFixed(3)} mW, LED ${ledOn ? "conducting" : "off"}.`);
    log(`[LIMIT] ${result.message}`);
  } else log(`[${result.state.toUpperCase()}] ${result.message}`);
}

function exportProject() {
  const blob = new Blob([serializeProject(state.project)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.project.metadata.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "adigun-project"}.adigun.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  log("[EXPORTED] Native project JSON downloaded.");
}

function activateView(view) {
  state.activeView = view;
  $$(".view-tab").forEach((tab) => { const active = tab.dataset.view === view; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", String(active)); });
  renderCanvas();
}

function setInspector(tab) {
  state.activeInspector = tab;
  $$(".inspector-tab").forEach((button) => button.classList.toggle("active", button.dataset.inspector === tab));
  renderInspector();
}

function handleAction(action) {
  if (action === "new-project") {
    if (state.dirty && !confirm("Create a new project? Unsaved local changes can still be exported first.")) return;
    state.history = [];
    state.future = [];
    state.lastValidation = null;
    replaceProject(createProject());
    log("[NEW] Created a new LED demonstration project.");
  }
  if (action === "import-project") $("#import-file").click();
  if (action === "save") saveLocal();
  if (action === "export") exportProject();
  if (action === "validate") validateAndReport();
  if (action === "undo") undo();
  if (action === "redo") redo();
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action) handleAction(action);
  const libraryButton = event.target.closest("[data-library-id]");
  if (libraryButton) { state.selectedLibraryId = libraryButton.dataset.libraryId; renderLibrary(); }
  const instanceButton = event.target.closest("[data-instance-id]");
  if (instanceButton) { state.selectedInstanceId = instanceButton.dataset.instanceId; render(); }
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) activateView(viewButton.dataset.view);
  const inspector = event.target.closest("[data-inspector]");
  if (inspector) setInspector(inspector.dataset.inspector);
  const tool = event.target.closest("[data-tool]");
  if (tool) {
    if (tool.dataset.tool === "zoom-in") state.scale = Math.min(1.5, state.scale + 0.1);
    if (tool.dataset.tool === "zoom-out") state.scale = Math.max(0.6, state.scale - 0.1);
    $$("[data-tool]").forEach((button) => button.classList.toggle("active", button === tool && !["zoom-in", "zoom-out"].includes(tool.dataset.tool)));
    $("#zoom-level").textContent = `${Math.round(state.scale * 100)}%`;
    $("#design-canvas").style.setProperty("--canvas-scale", state.scale);
  }
  const collapse = event.target.closest("[data-collapse]");
  if (collapse) document.querySelector(`.${collapse.dataset.collapse}`).classList.toggle("collapsed");
});

$("#component-search").addEventListener("input", renderLibrary);
$("#global-search").addEventListener("input", (event) => { $("#component-search").value = event.target.value; renderLibrary(); });
$("#add-component").addEventListener("click", () => {
  if (!state.selectedLibraryId) return;
  captureHistory();
  state.project = addComponent(state.project, state.selectedLibraryId);
  state.selectedInstanceId = state.project.components.at(-1).instanceId;
  state.dirty = true;
  log(`[ADD] Added ${selectedComponent().reference} from the starter generic library.`);
  render();
});
$("#component-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const component = selectedComponent();
  if (!component) return;
  captureHistory();
  state.project = updateComponent(state.project, component.instanceId, { reference: $("#property-reference").value.trim(), value: $("#property-value").value.trim() });
  state.dirty = true;
  validateAndReport();
  render();
});
$("#project-form").addEventListener("submit", (event) => {
  event.preventDefault();
  captureHistory();
  state.project = { ...state.project, metadata: { ...state.project.metadata, name: $("#project-name").value.trim(), updatedAt: new Date().toISOString() } };
  state.dirty = true;
  render();
});
$("#language").addEventListener("change", (event) => {
  state.project = { ...state.project, metadata: { ...state.project.metadata, locale: event.target.value } };
  state.dirty = true;
  render();
});
$("#grid-toggle").addEventListener("change", renderCanvas);
$("#run-simulation").addEventListener("click", runAnalysis);
$("#run-validation").addEventListener("click", validateAndReport);
$("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("light"));
$("#help-button").addEventListener("click", () => showDialog("Implementation status", "Implemented: local project document, starter library, shared component identity, local save/import/export, validation, four base UI locales, and one analytical DC LED calculation. Not implemented: 1,000 verified parts, general SPICE/digital simulation, real PCB routing/DRC/manufacturing, cloud accounts, or an AI service."));
$("#dialog-close").addEventListener("click", () => $("#status-dialog").close());
$("#bot-collapse").addEventListener("click", () => $("#bot").classList.toggle("minimized"));
$("#import-file").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    captureHistory();
    replaceProject(parseProject(await file.text()));
    log(`[IMPORTED] ${file.name} loaded after schema validation.`);
  } catch (error) {
    showDialog("Import blocked", error instanceof Error ? error.message : "The selected file is not a supported project.");
  } finally { event.target.value = ""; }
});

render();

