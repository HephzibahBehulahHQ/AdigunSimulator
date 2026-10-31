import {
  STARTER_LIBRARY,
  addComponent,
  createProject,
  connectPins,
  createEmptyProject,
  disconnectPin,
  findLibraryPart,
  getViewReconciliationIssues,
  moveComponent,
  removeComponent,
  parseProject,
  runSupportedAnalysis,
  serializeProject,
  updateComponent,
  validateProject
} from "./js/core.mjs";
import { TRANSLATIONS, translate } from "./js/i18n.mjs";
import { clearRecoveryDraft, readRecoveryDraft, writeRecoveryDraft } from "./js/recovery-storage.mjs";

const yearLabel = document.querySelector("#copyright-year");
if (yearLabel) yearLabel.textContent = String(new Date().getFullYear());

const STORAGE_KEY = "adigun-simulator.project.v1";
const RECOVERY_KEY = "adigun-simulator.recovery.v1";
const initialProject = loadProject();

const state = {
  project: initialProject.project,
  recoveredDraft: initialProject.recovered,
  recoveryActive: initialProject.recovered,
  selectedLibraryId: null,
  activeCategory: "All",
  selectedInstanceId: "resistor-1",
  activeView: "breadboard",
  activeInspector: "component",
  activeOutput: "output",
  selectedNetId: null,
  activeTool: "select",
  pan: { x: 0, y: 0 },
  drag: null,
  scale: 1,
  history: [],
  future: [],
  dirty: initialProject.recovered,
  lastValidation: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const t = (key) => translate(state.project.metadata.locale, key);

function loadProject() {
  try {
    const recovery = readRecoveryDraft(localStorage, RECOVERY_KEY);
    if (recovery) return { project: recovery.project, recovered: true };
    const stored = localStorage.getItem(STORAGE_KEY);
    return { project: stored ? parseProject(stored) : createProject(), recovered: false };
  } catch {
    return { project: createProject(), recovered: false };
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, serializeProject(state.project));
  clearRecoveryDraft(localStorage, RECOVERY_KEY);
  state.recoveryActive = false;
  state.dirty = false;
  updateSaveState();
  log("[SAVED] Project stored locally in this browser.");
}

function captureHistory() {
  state.history.push(serializeProject(state.project));
  if (state.history.length > 30) state.history.shift();
  state.future = [];
  state.recoveryActive = true;
}

function replaceProject(project, { dirty = true } = {}) {
  state.project = project;
  state.selectedInstanceId = project.components[0]?.instanceId ?? null;
  state.dirty = dirty;
  state.recoveryActive = dirty;
  if (!dirty) clearRecoveryDraft(localStorage, RECOVERY_KEY);
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
  const matching = STARTER_LIBRARY.filter((part) => (state.activeCategory === "All" || part.category === state.activeCategory) && `${part.type} ${part.id} ${part.category}`.toLowerCase().includes(query));
  $("#component-list").innerHTML = matching.map((part) => `
    <li><button type="button" class="component-item ${part.id === state.selectedLibraryId ? "selected" : ""}" data-library-id="${escape(part.id)}">
      <span class="component-icon">◇</span><span><strong>${escape(part.type)}</strong><small>${escape(part.defaultValue)} · ${escape(part.simulation)}</small></span>
    </button></li>`).join("") || `<li class="empty-list">${escape(t("libraryHelp"))}</li>`;
  const part = findLibraryPart(state.selectedLibraryId);
  $("#selected-part-type").textContent = part ? part.type : t("selectComponent");
  $("#selected-part-name").textContent = part ? part.id : t("noPartSelected");
  $("#selected-part-detail").textContent = part ? `${part.status}; simulation: ${part.simulation}.` : t("libraryHelp");
  $("#add-component").disabled = !part;
}

function componentVisual(component, view) {
  const part = findLibraryPart(component.libraryId);
  const type = part?.type ?? "Unknown component";
  const selected = component.instanceId === state.selectedInstanceId ? "is-selected" : "";
  const activeNet = state.project.nets.find((net) => net.id === state.selectedNetId);
  const netSelected = activeNet?.endpoints.some((item) => item.startsWith(`${component.instanceId}:`)) ? "is-net-highlight" : "";
  const x = component.position?.[view]?.[0] ?? 120;
  const y = component.position?.[view]?.[1] ?? 120;
  const className = component.libraryId.replaceAll(".", "-");
  return `<button type="button" class="placed-component ${className} ${selected} ${netSelected}" data-instance-id="${escape(component.instanceId)}" data-placement-view="${escape(view)}" style="--x:${x}px;--y:${y}px" aria-label="${escape(component.reference)} ${escape(type)}"><span class="part-reference">${escape(component.reference)}</span><span class="part-body">${component.libraryId === "diode.led-red" ? "●" : component.libraryId === "power.dc-source" ? "+ −" : component.libraryId === "ground.signal" ? "⏚" : component.libraryId === "passive.resistor" ? "▥" : "▣"}</span><span class="part-value">${escape(component.value)}</span></button>`;
}

function componentCenter(component, view) {
  const [x = 120, y = 120] = component.position?.[view] ?? [];
  return { x: x + 28, y: y + 29 };
}

function netClass(netId) {
  if (/^(gnd|ground|0)$/i.test(netId)) return "net-ground";
  if (/^(vcc|vdd|vin|power)$/i.test(netId)) return "net-power";
  return "net-signal";
}

function netSvg(project, view, unavailable = new Set()) {
  const componentsById = new Map(project.components.map((component) => [component.instanceId, component]));
  const paths = project.nets.flatMap((net) => {
    const points = net.endpoints
      .map((entry) => componentsById.get(String(entry).split(":")[0]))
      .filter((component) => component && !unavailable.has(component.instanceId))
      .map((component) => componentCenter(component, view));
    if (points.length < 2) return [];
    const origin = points[0];
    return points.slice(1).map((point) => `<path class="${netClass(net.id)} ${net.id === state.selectedNetId ? "is-net-highlight" : ""}" d="M${origin.x} ${origin.y} L${point.x} ${origin.y} L${point.x} ${point.y}" data-net="${escape(net.id)}"/>`);
  }).join("");
  return `<svg class="wire-layer" viewBox="0 0 680 300" aria-hidden="true">${paths}</svg>`;
}

function renderCanvas() {
  const canvas = $("#design-canvas");
  canvas.className = `design-canvas ${state.activeView} ${$("#grid-toggle").checked ? "grid-enabled" : ""}`;
  canvas.setAttribute("aria-label", `${state.activeView} representation. Select a component to inspect it.`);
  const issues = getViewReconciliationIssues(state.project, state.activeView);
  const unavailable = new Set(issues.map((issue) => issue.instanceId));
  const parts = state.project.components.filter((component) => !unavailable.has(component.instanceId)).map((component) => componentVisual(component, state.activeView)).join("");
  const surface = state.activeView === "breadboard" ? `<div class="breadboard-board" aria-hidden="true"><i></i><i></i><i></i><i></i></div>` : "";
  const wires = netSvg(state.project, state.activeView, unavailable);
  const reconciliationNotice = issues.length ? `<div class="reconciliation-notice"><strong>Reconciliation needed</strong>${issues.map((issue) => `<span>${escape(issue.reference)}: ${escape(issue.reason)}</span>`).join("")}</div>` : "";
  const label = state.activeView === "breadboard" ? "Shared project net layout — confirm physical breadboard rows before energising." : state.activeView === "schematic" ? "Shared project net layout — not a standards-complete schematic editor." : "PCB mapping preview — routing/DRC not implemented.";
  canvas.innerHTML = `<div class="canvas-label">${label}</div>${reconciliationNotice}<div class="canvas-scene" style="--pan-x:${state.pan.x}px;--pan-y:${state.pan.y}px">${surface}${wires}${parts}</div>`;
  const miniSchematic = state.project.components.filter((component) => !getViewReconciliationIssues({ components: [component] }, "schematic").length).map((component) => componentVisual(component, "schematic")).join("");
  const miniPcb = state.project.components.filter((component) => !getViewReconciliationIssues({ components: [component] }, "pcb").length).map((component) => componentVisual(component, "pcb")).join("");
  $("#schematic-mini").innerHTML = `<div class="canvas-scene">${netSvg(state.project, "schematic", new Set(getViewReconciliationIssues(state.project, "schematic").map((issue) => issue.instanceId)))}${miniSchematic}</div>`;
  $("#pcb-mini").innerHTML = `<div class="canvas-scene">${netSvg(state.project, "pcb", new Set(getViewReconciliationIssues(state.project, "pcb").map((issue) => issue.instanceId)))}${miniPcb}</div>`;
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
  $("#remove-component").disabled = !component;
  renderConnections();
}

function renderConnections() {
  const options = state.project.components.flatMap((component) => {
    const part = findLibraryPart(component.libraryId);
    return (part?.pins ?? []).map((pin) => ({ value: `${component.instanceId}:${pin}`, label: `${component.reference}.${pin} — ${part.type}` }));
  });
  for (const selector of ["#connection-first", "#connection-second"]) {
    const select = $(selector);
    const previous = select.value;
    select.innerHTML = options.map((item) => `<option value="${escape(item.value)}">${escape(item.label)}</option>`).join("");
    if (options.some((item) => item.value === previous)) select.value = previous;
  }
  $("#net-list").innerHTML = state.project.nets.map((net) => `
    <li><button type="button" class="net-select ${net.id === state.selectedNetId ? "active" : ""}" data-net-id="${escape(net.id)}" aria-pressed="${net.id === state.selectedNetId}">${escape(net.id)}</button><ul>${net.endpoints.map((item) => `<li>${escape(item)} <button type="button" class="disconnect-pin" data-endpoint="${escape(item)}" aria-label="${escape(t("disconnect"))} ${escape(item)}">×</button></li>`).join("")}</ul></li>`).join("") || `<li>${escape(t("noConnectedNets"))}</li>`;
}

function renderValidation() {
  const validation = state.lastValidation ?? validateProject(state.project);
  $("#error-count").textContent = validation.errors.length;
  $("#warning-count").textContent = validation.warnings.length;
  $("#validation-summary").textContent = validation.valid
    ? (state.lastValidation ? `${validation.warnings.length} warning(s); no blocking project schema errors.` : t("validationHelp"))
    : `${validation.errors.length} error(s) block analysis.`;
  renderOutput(validation);
}

function renderOutput(validation = state.lastValidation ?? validateProject(state.project)) {
  const isLog = state.activeOutput === "output";
  const issues = state.activeOutput === "errors" ? validation.errors : validation.warnings;
  $$(".output-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.output === state.activeOutput));
  $("#output-log").classList.toggle("hidden", !isLog);
  $("#issue-list").classList.toggle("hidden", isLog);
  if (!isLog) {
    $("#issue-list").textContent = issues.length
      ? issues.map((issue) => `[${issue.rule}] ${issue.message}`).join("\n")
      : `[${state.activeOutput.toUpperCase()}] None.`;
  }
}

function applyLocale() {
  const locale = state.project.metadata.locale;
  const messages = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
  document.documentElement.lang = locale;
  $$("[data-i18n]").forEach((node) => { node.textContent = messages[node.dataset.i18n] ?? TRANSLATIONS.en[node.dataset.i18n] ?? node.textContent; });
  $("[data-i18n-placeholder]").forEach((node) => { node.placeholder = messages[node.dataset.i18nPlaceholder] ?? TRANSLATIONS.en[node.dataset.i18nPlaceholder] ?? node.placeholder; });
  $("[data-i18n-alt]").forEach((node) => { node.alt = messages[node.dataset.i18nAlt] ?? TRANSLATIONS.en[node.dataset.i18nAlt] ?? node.alt; });
  $$("[data-i18n-aria]").forEach((node) => { node.setAttribute("aria-label", messages[node.dataset.i18nAria] ?? TRANSLATIONS.en[node.dataset.i18nAria] ?? node.getAttribute("aria-label")); });
  $$("[data-i18n-title]").forEach((node) => { node.title = messages[node.dataset.i18nTitle] ?? TRANSLATIONS.en[node.dataset.i18nTitle] ?? node.title; });
  $("#language").value = locale;
}

function render() {
  renderLibrary();
  renderCanvas();
  renderInspector();
  renderValidation();
  applyLocale();
  if (state.dirty && state.recoveryActive && !writeRecoveryDraft(localStorage, RECOVERY_KEY, state.project)) {
    log("[RECOVERY] The browser could not store a local recovery draft. Export important work before closing this tab.");
  }
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
  if (!issues.length) log("[VALIDATION] No project errors or warnings were found.");
  else issues.forEach((issue) => log(`[${issue.rule}] ${issue.message}`));
}

function runAnalysis() {
  validateAndReport();
  const result = runSupportedAnalysis(state.project);
  if (result.state === "complete") {
    const { kind } = result.result;
    log(`[ANALYSIS] ${result.engine}`);
    if (kind === "led-current-limiter") {
      const { sourceVoltage, resistance, ledVf, currentA, resistorPowerW, ledOn } = result.result;
      log(`[RESULT] Vsource=${sourceVoltage.toFixed(3)} V, Vf=${ledVf.toFixed(3)} V, R=${resistance.toFixed(3)} Ω`);
      log(`[RESULT] I=${(currentA * 1000).toFixed(3)} mA, Presistor=${(resistorPowerW * 1000).toFixed(3)} mW, LED ${ledOn ? "conducting" : "off"}.`);
    } else if (kind === "voltage-divider") {
      const { sourceVoltage, upperResistance, lowerResistance, outputVoltage, currentA, totalPowerW } = result.result;
      log(`[RESULT] Vsource=${sourceVoltage.toFixed(3)} V, Rupper=${upperResistance.toFixed(3)} Ω, Rlower=${lowerResistance.toFixed(3)} Ω`);
      log(`[RESULT] Vout=${outputVoltage.toFixed(3)} V, I=${(currentA * 1000).toFixed(3)} mA, Ptotal=${(totalPowerW * 1000).toFixed(3)} mW.`);
    } else if (kind === "rc-step-response") {
      const { sourceVoltage, resistance, capacitance, timeConstantS, samples } = result.result;
      log(`[RESULT] Vstep=${sourceVoltage.toFixed(3)} V, R=${resistance.toFixed(3)} Ω, C=${capacitance.toExponential(3)} F, τ=${timeConstantS.toExponential(3)} s.`);
      for (const sample of samples) log(`[TRANSIENT] t=${sample.timeS.toExponential(3)} s, Vc=${sample.capacitorVoltage.toFixed(3)} V, I=${(sample.currentA * 1000).toFixed(3)} mA, PR=${(sample.resistorPowerW * 1000).toFixed(3)} mW`);
    } else if (kind === "rl-step-response") {
      const { sourceVoltage, resistance, inductance, timeConstantS, samples } = result.result;
      log(`[RESULT] Vstep=${sourceVoltage.toFixed(3)} V, R=${resistance.toFixed(3)} Ω, L=${inductance.toExponential(3)} H, τ=${timeConstantS.toExponential(3)} s.`);
      for (const sample of samples) log(`[TRANSIENT] t=${sample.timeS.toExponential(3)} s, I=${(sample.currentA * 1000).toFixed(3)} mA, VL=${sample.inductorVoltage.toFixed(3)} V, PR=${(sample.resistorPowerW * 1000).toFixed(3)} mW`);
    } else {
      const { sourceVoltage, sourceCurrentA, nodeVoltages, resistors } = result.result;
      log(`[RESULT] Vsource=${sourceVoltage.toFixed(3)} V, Isource=${(sourceCurrentA * 1000).toFixed(3)} mA.`);
      for (const [node, voltage] of Object.entries(nodeVoltages)) log(`[NODE] ${node}=${voltage.toFixed(3)} V`);
      for (const item of resistors) log(`[RESISTOR] ${item.reference}: V=${item.voltage.toFixed(3)} V, I=${(item.currentA * 1000).toFixed(3)} mA, P=${(item.powerW * 1000).toFixed(3)} mW`);
    }
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
    replaceProject(createEmptyProject({ locale: state.project.metadata.locale }));
    log("[NEW] Created a blank circuit project.");
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
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.activeCategory = categoryButton.dataset.category;
    $$(".category-filter").forEach((button) => button.classList.toggle("active", button === categoryButton));
    renderLibrary();
  }
  const instanceButton = event.target.closest("[data-instance-id]");
  if (instanceButton) { state.selectedInstanceId = instanceButton.dataset.instanceId; render(); }
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) activateView(viewButton.dataset.view);
  const inspector = event.target.closest("[data-inspector]");
  if (inspector) setInspector(inspector.dataset.inspector);
  const outputTab = event.target.closest("[data-output]");
  if (outputTab) { state.activeOutput = outputTab.dataset.output; renderOutput(); }
  const tool = event.target.closest("[data-tool]");
  if (tool) {
    if (tool.dataset.tool === "zoom-in") state.scale = Math.min(1.5, state.scale + 0.1);
    if (tool.dataset.tool === "zoom-out") state.scale = Math.max(0.6, state.scale - 0.1);
    if (["select", "pan"].includes(tool.dataset.tool)) state.activeTool = tool.dataset.tool;
    $$("[data-tool]").forEach((button) => button.classList.toggle("active", button === tool && !["zoom-in", "zoom-out"].includes(tool.dataset.tool)));
    $("#zoom-level").textContent = `${Math.round(state.scale * 100)}%`;
    $("#design-canvas").style.setProperty("--canvas-scale", state.scale);
  }
  const collapse = event.target.closest("[data-collapse]");
  if (collapse) document.querySelector(`.${collapse.dataset.collapse}`).classList.toggle("collapsed");
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const editingText = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  const modifier = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();
  if (modifier && key === "z") {
    event.preventDefault();
    if (event.shiftKey) redo(); else undo();
    return;
  }
  if (modifier && key === "y") { event.preventDefault(); redo(); return; }
  if (modifier && key === "s") { event.preventDefault(); saveLocal(); return; }
  if (!editingText && (event.key === "Delete" || event.key === "Backspace")) {
    const component = selectedComponent();
    if (!component) return;
    event.preventDefault();
    captureHistory();
    state.project = removeComponent(state.project, component.instanceId);
    state.selectedInstanceId = state.project.components[0]?.instanceId ?? null;
    state.dirty = true;
  state.recoveryActive = true;
    state.lastValidation = null;
    render();
    validateAndReport();
    log(`[REMOVE] Removed ${component.reference} and cleaned its net endpoints.`);
  }
});

document.addEventListener("pointerdown", (event) => {
  const canvas = event.target.closest("#design-canvas");
  if (!canvas) return;
  const component = event.target.closest(".placed-component");
  const point = { x: event.clientX, y: event.clientY };
  if (component && state.activeTool === "select") {
    const item = state.project.components.find((candidate) => candidate.instanceId === component.dataset.instanceId);
    if (!item) return;
    state.drag = { mode: "move", pointerId: event.pointerId, instanceId: item.instanceId, start: point, startPosition: [...item.position[state.activeView]], canvas };
    canvas.setPointerCapture?.(event.pointerId);
    return;
  }
  if (!component && state.activeTool === "pan") {
    state.drag = { mode: "pan", pointerId: event.pointerId, start: point, startPan: { ...state.pan }, canvas };
    canvas.setPointerCapture?.(event.pointerId);
  }
});

document.addEventListener("pointermove", (event) => {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const deltaX = event.clientX - state.drag.start.x;
  const deltaY = event.clientY - state.drag.start.y;
  if (state.drag.mode === "pan") {
    state.pan = { x: Math.max(-120, Math.min(120, state.drag.startPan.x + deltaX)), y: Math.max(-80, Math.min(80, state.drag.startPan.y + deltaY)) };
    const scene = $("#design-canvas .canvas-scene");
    if (scene) { scene.style.setProperty("--pan-x", `${state.pan.x}px`); scene.style.setProperty("--pan-y", `${state.pan.y}px`); }
    return;
  }
  const rect = state.drag.canvas.getBoundingClientRect();
  const scaleX = 680 / rect.width;
  const scaleY = 300 / rect.height;
  const x = state.drag.startPosition[0] + (deltaX * scaleX);
  const y = state.drag.startPosition[1] + (deltaY * scaleY);
  const visual = state.drag.canvas.querySelector(`[data-instance-id="${CSS.escape(state.drag.instanceId)}"]`);
  if (visual) { visual.style.setProperty("--x", `${x}px`); visual.style.setProperty("--y", `${y}px`); }
});

document.addEventListener("pointerup", (event) => {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const drag = state.drag;
  state.drag = null;
  drag.canvas.releasePointerCapture?.(event.pointerId);
  if (drag.mode !== "move") return;
  const rect = drag.canvas.getBoundingClientRect();
  const x = drag.startPosition[0] + ((event.clientX - drag.start.x) * (680 / rect.width));
  const y = drag.startPosition[1] + ((event.clientY - drag.start.y) * (300 / rect.height));
  captureHistory();
  state.project = moveComponent(state.project, drag.instanceId, state.activeView, [x, y], { snap: $("#snap-toggle").checked });
  state.selectedInstanceId = drag.instanceId;
  state.dirty = true;
  state.recoveryActive = true;
  state.lastValidation = null;
  render();
});

$("#component-search").addEventListener("input", renderLibrary);
$("#global-search").addEventListener("input", (event) => { $("#component-search").value = event.target.value; renderLibrary(); });
$("#add-component").addEventListener("click", () => {
  if (!state.selectedLibraryId) return;
  captureHistory();
  state.project = addComponent(state.project, state.selectedLibraryId);
  state.selectedInstanceId = state.project.components.at(-1).instanceId;
  state.dirty = true;
  state.recoveryActive = true;
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
  state.recoveryActive = true;
  validateAndReport();
  render();
});
$("#remove-component").addEventListener("click", () => {
  const component = selectedComponent();
  if (!component) return;
  captureHistory();
  state.project = removeComponent(state.project, component.instanceId);
  state.selectedInstanceId = state.project.components[0]?.instanceId ?? null;
  state.dirty = true;
  state.recoveryActive = true;
  state.lastValidation = null;
  render();
  validateAndReport();
  log(`[REMOVE] Removed ${component.reference} and cleaned its net endpoints.`);
});
$("#connection-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    captureHistory();
    state.project = connectPins(state.project, $("#connection-first").value, $("#connection-second").value);
    state.dirty = true;
  state.recoveryActive = true;
    state.lastValidation = null;
    render();
    validateAndReport();
  } catch (error) {
    showDialog("Connection not added", error instanceof Error ? error.message : "The selected pins could not be connected.");
  }
});
$("#net-list").addEventListener("click", (event) => {
  const netButton = event.target.closest("[data-net-id]");
  if (netButton) {
    state.selectedNetId = state.selectedNetId === netButton.dataset.netId ? null : netButton.dataset.netId;
    render();
    return;
  }
  const button = event.target.closest("[data-endpoint]");
  if (!button) return;
  captureHistory();
  state.project = disconnectPin(state.project, button.dataset.endpoint);
  state.dirty = true;
  state.recoveryActive = true;
  state.lastValidation = null;
  render();
  validateAndReport();
});
$("#project-form").addEventListener("submit", (event) => {
  event.preventDefault();
  captureHistory();
  state.project = { ...state.project, metadata: { ...state.project.metadata, name: $("#project-name").value.trim(), updatedAt: new Date().toISOString() } };
  state.dirty = true;
  state.recoveryActive = true;
  render();
});
$("#language").addEventListener("change", (event) => {
  state.project = { ...state.project, metadata: { ...state.project.metadata, locale: event.target.value } };
  state.dirty = true;
  state.recoveryActive = true;
  render();
});
$("#grid-toggle").addEventListener("change", renderCanvas);
$("#run-simulation").addEventListener("click", runAnalysis);
$("#run-validation").addEventListener("click", validateAndReport);
$("#load-example").addEventListener("click", async () => {
  const path = $("#example-picker").value;
  try {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`The example request returned ${response.status}.`);
    const project = parseProject(await response.text());
    const analysis = runSupportedAnalysis(project);
    if (analysis.state !== "complete") throw new Error("The selected example does not pass its supported analysis check.");
    if (state.dirty && !confirm("Replace the current project with this released example? Export unsaved work first if you need it.")) return;
    state.history = [];
    state.future = [];
    state.lastValidation = null;
    state.activeOutput = "output";
    replaceProject(project, { dirty: false });
    log(`[EXAMPLE] Loaded and validated ${project.metadata.name}.`);
  } catch (error) {
    showDialog("Example unavailable", error instanceof Error ? error.message : "The selected example could not be loaded.");
  }
});
$("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("light"));
$("#help-button").addEventListener("click", () => showDialog("Implementation status", "Implemented: local project document, starter library, shared identity and net layouts, local save/import/export, validation, four UI locales, sixteen released catalogue examples plus ten supplemental studies, bounded DC analysis for LED, voltage-divider, red/green LED polarity indicator, pushbutton LED with pull-down, latching SPDT LED switch, and linear resistor networks with ideal voltage and current sources, first-order RC and RL responses, selectable RC charge/discharge, RC low-pass and high-pass frequency response, supplemental RL low-pass response, and ideal PWM LED average-current, low-battery comparator, and linear-supply ripple/dropout and USB LED PTC warning, and solar garden-light day/night and supercapacitor hold-up and passive RC tone-control sampled full-wave bridge-rectifier and reservoir-capacitor ripple analyses. Not implemented: a 1,000 verified-part catalogue, general SPICE, nonlinear or digital simulation, real PCB routing/DRC/manufacturing, cloud accounts, or an AI service."));
$("#dialog-close").addEventListener("click", () => $("#status-dialog").close());
$("#bot-collapse").addEventListener("click", () => $("#bot").classList.toggle("minimized"));
$("#import-file").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    const importedProject = parseProject(await file.text());
    if (state.dirty && !confirm("Replace the current project with this imported file? Export unsaved work first if you need it.")) return;
    captureHistory();
    state.lastValidation = null;
    state.activeOutput = "output";
    replaceProject(importedProject, { dirty: false });
    log(`[IMPORTED] ${file.name} loaded after schema validation.`);
  } catch (error) {
    showDialog("Import blocked", error instanceof Error ? error.message : "The selected file is not a supported project.");
  } finally { event.target.value = ""; }
});

render();
if (state.recoveredDraft) log("[RECOVERY] Restored the latest unsaved project saved in this browser.");

