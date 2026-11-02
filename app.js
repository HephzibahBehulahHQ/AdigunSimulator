Warning: truncated output (original token count: 47085)
Total output lines: 1999

import { STARTER_LIBRARY, addComponent, createProject, connectPins, createEmptyProject, disconnectPin, findLibraryPart, getViewReconciliationIssues, moveComponent, removeComponent, parseProject, serializeProject, updateComponent, validateProject } from "./js/core.mjs";
import { TRANSLATIONS, translate } from "./js/i18n.mjs";
import { BREADBOARD_MODEL, breadboardHoleIds, breadboardHolePoint, breadboardPackagePlacement, deriveBreadboardSchematicNets, normalizeBreadboardHole, validateBreadboardTopology } from "./js/breadboard-topology.mjs";
import { schematicPinPoint } from "./js/schematic-pin-layout.mjs";
import { renderSchematicSymbol } from "./js/schematic-symbols.mjs";
import { renderPcbPreviewSvg, getPcbPreviewScale, pcbPreviewPointToBoardMm } from "./js/pcb-preview.mjs";
import { movePcbFootprint } from "./js/pcb-edit.mjs";
import { createPcbRoute } from "./js/pcb-routing.mjs";
import { clearRecoveryDraft, readRecoveryDraft, writeRecoveryDraft } from "./js/recovery-storage.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "./js/pcb-export.mjs";
import { createManufacturingExportPack } from "./js/manufacturing-export-pack.mjs";

















import { validateComponentProperty } from "./js/component-property-audit.mjs";
import { createSimulationReport } from "./js/simulation-report.mjs";
import { verifySimulationLockfile } from "./js/simulation-lockfile.mjs";























import { projectComponentsForView } from "./js/view-projection.mjs";









import { exportBomCsv, runBomExportPlaceholder } from "./js/bom-report.mjs";
import { explainComponent } from "./js/bot-component-explainer.mjs";
import { applyBotFloatingNodeRepairPreview, runBotFloatingNodeRepair } from "./js/bot-floating-node-repair.mjs";
import { applyBotCircuitProposal, runBotCircuitProposal } from "./js/bot-circuit-proposal.mjs";
import { analyzeBotCanvas, applyBotSuggestionPreview, buildBotSuggestionPreview, createBotLiveCopilot, explainComponentWiring } from "./js/bot-live-copilot.mjs";


import { runReleaseCandidateE2E } from "./js/release-candidate-e2e.mjs";
import { createSimulationWorkerRun } from "./js/simulation-worker-client.mjs";
import { getManufacturerPartEvidenceSummary, searchManufacturerParts } from "./js/part-catalogue.mjs";
import { answerBotProductQuestion, getBotQuestionClarification, isBotProjectGoalStatement } from "./js/bot-product-help.mjs";

const yearLabel = document.querySelector("#copyright-year");
if (yearLabel) yearLabel.textContent = String(new Date().getFullYear());

const STORAGE_KEY = "adigun-simulator.project.v1";
const RECOVERY_KEY = "adigun-simulator.recovery.v1";
const initialProject = loadProject();

const state = {
  project: initialProject.project,
  recoveredDraft: initialProject.recovered,
  lastAnalysis: null,
  userInteracted: false,
  recoveryActive: initialProject.recovered,
  selectedLibraryId: null,
  selectedEvidencePartId: null,
  libraryMode: "starter",
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
  botUnsavedOnly: false,
  lastValidation: null,
  breadboardSyncPreview: null,
  breadboardPlacementMode: false,
  schematicWireMode: false,
  schematicWireStart: null,
  pcbRouteDraft: null,
  pcbRouteHintKey: null,
  activeSimulation: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const t = (key) => translate(state.project.metadata.locale, key);
const botUnconnectedSince = new Map(state.project.components.map((item) => [item.instanceId, Date.now()]));
let currentBotFinding = null;
let currentBotPreview = null;
let lastBotHover = null;

function renderBotFinding(finding) {
  currentBotFinding = finding;
  const panel = $("#bot-suggestion");
  if (!panel) return;
  panel.hidden = !finding;
  $("#bot-suggestion-preview").hidden = true;
  $("#bot-suggestion-detail").hidden = true;
  currentBotPreview = null;
  if (!finding) return;
  const messageKeys = { "missing-gate-input": "botMissingInputMessage", "unobserved-gate-output": "botOutputMessage", "goal-question": "botGoalQuestionMessage", "unwired-component": "botUnwiredMessage", "missing-gate-rails": "botRailsMessage", "driver-conflict": "botConflictMessage" };
  const key = messageKeys[finding.kind] ?? "botGoalQuestionMessage";
  const message = t(key).replaceAll("{reference}", finding.reference ?? "").replaceAll("{pin}", finding.pin ?? "").replaceAll("{pins}", finding.pins ?? "").replaceAll("{net}", finding.net ?? "").replaceAll("{drivers}", finding.drivers ?? "");
  $("#bot-suggestion-title").textContent = t("botSuggestionHeading");
  $("#bot-suggestion-message").textContent = message;
  $("#bot-suggestion-detail").textContent = finding.detail;
  $("#bot-suggestion-accept").hidden = !finding.action || finding.action === "ask-goal";
}

function notifyBotCanvas() {
  const liveIds = new Set(state.project.components.map((item) => item.instanceId));
  for (const item of state.project.components) if (!botUnconnectedSince.has(item.instanceId)) botUnconnectedSince.set(item.instanceId, Date.now());
  for (const id of botUnconnectedSince.keys()) if (!liveIds.has(id)) botUnconnectedSince.delete(id);
  const active = document.activeElement;
  const typing = Boolean(active?.matches?.('textarea, [contenteditable="true"], input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"])'));
  botLiveCopilot.notify(state.project, { dragging: Boolean(state.drag), busy: Boolean(state.activeSimulation) || state.lastAnalysis?.state === "running", typing, unconnectedSince: Object.fromEntries(botUnconnectedSince) });
}

const botLiveCopilot = createBotLiveCopilot({ onSuggestion: renderBotFinding });

function showBotWiringExplanation(target) {
  const result = explainComponentWiring(state.project, target);
  if (result.ok) $("#bot-response").textContent = result.answer;
}

function answerBotQuestion() {
  const question = $("#bot-goal").value.trim();
  if (!question) return;
  if (isBotProjectGoalStatement(question)) {
    botLiveCopilot.setGoal(question);
    $("#bot-response").textContent = `For this session, I will use this project goal: ${question}`;
  } else {
    const productAnswer = answerBotProductQuestion(question, state.project.metadata.locale);
    if (productAnswer?.action === "switch-view") {
      activateView(productAnswer.view);
      $("#bot-response").textContent = productAnswer.answer;
      log(`[BOT] Switched to ${productAnswer.view} view at the user's request.`);
      $("#bot-goal").blur();
      notifyBotCanvas();
      return;
    }
    if (productAnswer) {
      $("#bot-response").textContent = productAnswer.answer;
      $("#bot-goal").blur();
      notifyBotCanvas();
      return;
    }
    const explanation = explainComponentWiring(state.project, state.selectedInstanceId);
    const findings = analyzeBotCanvas(state.project, { goal: botLiveCopilot.getGoal(), unconnectedSince: Object.fromEntries(botUnconnectedSince) });
    const grounded = findings[0]?.message ?? "The current native project has no detected missing gate input, unconnected gate output, missing gate rail, or shared logic output.";
    $("#bot-response").textContent = explanation.ok ? `${explanation.answer} Live checks: ${grounded}` : `I can answer from current project wiring and the checked-in library only. ${grounded} ${getBotQuestionClarification(state.project.metadata.locale)}`;
  }
  $("#bot-goal").blur();
  notifyBotCanvas();
}

function prepareBotSuggestionPreview() {
  if (!currentBotFinding) return;
  if (!currentBotFinding.action || currentBotFinding.action === "ask-goal") { $("#bot-goal").focus(); return; }
  const preview = buildBotSuggestionPreview(state.project, currentBotFinding);
  if (!preview.ok) { $("#bot-response").textContent = preview.error; return; }
  currentBotPreview = preview;
  $("#bot-preview-summary").textContent = `${preview.summary} Nothing is saved automatically.`;
  $("#bot-suggestion-preview").hidden = false;
}

function applyBotSuggestion() {
  if (!currentBotPreview) return;
  const outcome = applyBotSuggestionPreview(state.project, currentBotPreview, { confirmed: true });
  if (!outcome.ok) { $("#bot-response").textContent = outcome.message; $("#bot-suggestion-preview").hidden = true; currentBotPreview = null; return; }
  captureHistory();
  state.botUnsavedOnly = true;
  state.dirty = true;
  replaceProject(outcome.project);
  renderBotFinding(null);
  $("#bot-response").textContent = `${outcome.message} Use Undo to roll back this accepted change; save manually when ready.`;
  log("[BOT] Accepted a reviewed live preview. The change remains unsaved until the user saves it.");
}

function loadProject() {
  try {
    const recovery = readRecoveryDraft(localStorage, RECOVERY_KEY);
    if (recovery) return { project: recovery.project, recovered: true, fresh: false };
    const stored = localStorage.getItem(STORAGE_KEY);
    return { project: stored ? parseProject(stored) : createProject(), recovered: false, fresh: !stored };
  } catch {
    return { project: createProject(), recovered: false, fresh: false };
  }
}

function saveLocal() {
  localStorage.setItem(STORAGE_KEY, serializeProject(state.project));
  clearRecoveryDraft(localStorage, RECOVERY_KEY);
  state.recoveryActive = false;
  state.dirty = false;
  state.botUnsavedOnly = false;
  updateSaveState();
  log("[SAVED] Project stored locally in this browser.");
}

function captureHistory() {
  state.lastAnalysis = null;
  state.history.push(serializeProject(state.project));
  if (state.history.length > 30) state.history.shift();
  state.future = [];
  state.recoveryActive = true;
  state.botUnsavedOnly = false;
}

function replaceProject(project, { dirty = true } = {}) {
  state.lastAnalysis = null;
  state.project = project;
  state.selectedInstanceId = project.components[0]?.instanceId ?? null;
  state.dirty = dirty;
  state.recoveryActive = dirty;
  if (!dirty) clearRecoveryDraft(localStorage, RECOVERY_KEY);
  render();
}

function undo() {
  if (!state.history.length) return log("[INFO] There is no earlier local edit to undo.");
  state.botUnsavedOnly = false;
  state.future.push(serializeProject(state.project));
  replaceProject(parseProject(state.history.pop()));
  log("[UNDO] Restored the previous local project state.");
}

function redo() {
  if (!state.future.length) return log("[INFO] There is no later local edit to redo.");
  state.botUnsavedOnly = false;
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
  const evidenceMode = state.libraryMode === "evidence";
  $("#category-filters").classList.toggle("hidden", evidenceMode);
  $("#library-status").textContent = evidenceMode ? t("evidenceLibraryNotice") : t("libraryNotice");
  $("#component-search").placeholder = evidenceMode ? t("searchManufacturerParts") : t("searchLibrary");
  if (evidenceMode) {
    const matching = searchManufacturerParts(query);
    $("#component-list").setAttribute("aria-label", t("manufacturerEvidenceMode"));
    $("#component-list").innerHTML = matching.map((record) => `
      <li><button type="button" class="component-item evidence-item ${record.id === state.selectedEvidencePartId ? "selected" : ""}" data-evidence-part-id="${escape(record.id)}">
        <span class="evidence-status evidence-status-${escape(record.verificationStatus)}">${escape(t(record.verificationStatus === "verified" ? "verifiedStatus" : "candidateStatus"))}</span>
        <span><strong>${escape(record.manufacturerPartNumber)}</strong><small>${escape(record.manufacturer)} · ${escape(record.package ?? record.packageEvidence?.package ?? t("packageUnknown"))}</small></span>
      </button></li>`).join("") || `<li class="empty-list">${escape(t("noManufacturerMatches"))}</li>`;
    const record = matching.find((item) => item.id === state.selectedEvidencePartId) ?? matching[0] ?? null;
    state.selectedEvidencePartId = record?.id ?? null;
    const summary = record ? getManufacturerPartEvidenceSummary(record) : null;
    $("#selected-part-type").textContent = record ? `${record.manufacturer} · ${record.category}` : t("selectComponent");
    $("#selected-part-name").textContent = record?.manufacturerPartNumber ?? t("noPartSelected");
    if (record && summary) {
      const link = record.datasheet?.url ? `<a href="${escape(record.datasheet.url)}" target="_blank" rel="noopener noreferrer">${escape(t("openDatasheet"))}</a>` : "";
      const blockers = summary.evidenceBlockerCodes.length ? summary.evidenceBlockerCodes.join(", ") : t("none");
      const pins = summary.pinMap.map((pin) => `${pin.pin}: ${pin.name}${pin.electricalType ? ` (${pin.electricalType})` : ""}`).join(" · ") || t("notRecorded");
      const ratings = summary.ratings.map((rating) => `${rating.name}: ${rating.minimum ?? ""}${rating.minimum != null && rating.maximum != null ? "–" : ""}${rating.maximum ?? ""} ${rating.unit ?? ""}`.trim()).join(" · ") || t("notRecorded");
      const footprint = summary.footprintEvidencePath ? `${summary.footprintEvidenceStatus} · ${summary.footprintEvidencePath}` : t("notRecorded");
      const reviewState = summary.readyForHumanReview ? t("readyForReviewLabel") : t("evidenceIncompleteLabel");
      $("#selected-part-detail").innerHTML = `<span>${escape(t("packageLabel"))}: ${escape(record.package ?? record.packageEvidence?.package ?? t("packageUnknown"))}</span><span>${escape(t("lifecycleLabel"))}: ${escape(record.lifecycle ?? t("unknown"))}</span><span>${escape(t("simulationLabel"))}: ${escape(summary.simulationStatus)}</span><span>${escape(t("pinMapLabel"))}: ${escape(pins)}</span><span>${escape(t("ratingsLabel"))}: ${escape(ratings)}</span><span>${escape(t("footprintEvidenceLabel"))}: ${escape(footprint)}</span><span>${escape(t("datasheetIntegrityLabel"))}: ${escape(summary.datasheetChecksumPresent ? "SHA-256 recorded" : t("notRecorded"))}</span><span>${escape(t("reviewBlockersLabel"))}: ${escape(blockers)}</span><span>${escape(reviewState)}</span>${summary.requiresHumanReview ? `<span>${escape(t("humanReviewRequired"))}</span>` : ""}${link}<strong>${escape(record.verificationStatus === "verified" ? t("verifiedStatus") : t("candidateStatus"))}</strong>`;
    } else {
      $("#selected-part-detail").textContent = t("noManufacturerMatches");
    }
    $("#add-component").hidden = true;
    return;
  }
  $("#component-list").setAttribute("aria-label", t("starterLibraryMode"));
  $("#add-component").hidden = false;
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
  const symbol = view === "schematic" ? renderSchematicSymbol(part) : null;
  const body = symbol ?? `<span class="part-body">${component.libraryId === "diode.led-red" ? "●" : component.libraryId === "power.dc-source" ? "+ −" : component.libraryId === "ground.signal" ? "⏚" : component.libraryId === "passive.resistor" ? "▥" : "▣"}</span>`;
  return `<button type="button" class="placed-component ${className} ${selected} ${netSelected}" data-instance-id="${escape(component.instanceId)}" data-placement-view="${escape(view)}" style="--x:${x}px;--y:${y}px" aria-label="${escape(component.reference)} ${escape(type)}"><span class="part-reference">${escape(component.reference)}</span>${body}<span class="part-value">${escape(component.value)}</span></button>`;
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
  const endpointPoint = (endpoint) => {
    const [instanceId, ...pinParts] = String(endpoint).split(":");
    const component = componentsById.get(instanceId);
    if (!component || unavailable.has(instanceId)) return null;
    if (view !== "schematic") return componentCenter(component, view);
    const part = findLibraryPart(component.libraryId);
    return part ? schematicPinPoint(component, part.pins, pinParts.join(":")) : null;
  };
  const paths = project.nets.flatMap((net) => {
    const points = net.endpoints.map((endpoint) => ({ endpoint, point: endpointPoint(endpoint) })).filter((item) => item.point);
    if (points.length < 2) return [];
    const origin = points[0].point;
    const path = points.slice(1).map(({ point }) => {
      const bendX = Math.round((origin.x + point.x) / 2);
      return `M${origin.x} ${origin.y} H${bendX} V${point.y} H${point.x}`;
    }).join(" ");
    return [`<path class="${netClass(net.id)} ${net.id === state.selectedNetId ? "is-net-highlight" : ""}" d="${path}" data-net="${escape(net.id)}"/>`];
  }).join("");
  const terminals = view === "schematic" ? project.components.flatMap((component) => {
    if (unavailable.has(component.instanceId)) return [];
    const pins = findLibraryPart(component.libraryId)?.pins ?? [];
    return pins.map((pin) => {
      const endpoint = `${component.instanceId}:${pin}`;
      const point = endpointPoint(endpoint);
      if (!point) return "";
      const net = project.nets.find((item) => item.endpoints.includes(endpoint));
      const side = point.side;
      const labelX = point.x + (side === "left" ? -4 : 4);
      const anchor = side === "left" ? "end" : "start";
      const origin = state.schematicWireStart === endpoint ? "is-wire-origin" : "";
      return `<g class="schematic-pin-terminal schematic-pin-target ${net ? netClass(net.id) : "net-signal"} ${origin}" data-schematic-endpoint="${escape(endpoint)}" aria-label="${escape(endpoint)}"><circle class="schematic-pin-hit" cx="${point.x}" cy="${point.y}" r="8"/><circle class="schematic-pin-dot" cx="${point.x}" cy="${point.y}" r="2.4"/><text x="${labelX}" y="${point.y - 4}" text-anchor="${anchor}">${escape(pin)}</text></g>`;
    });
  }).join("") : "";
  return `<svg class="wire-layer schematic-wire-layer" viewBox="0 0 680 300" aria-hidden="true">${paths}${terminals}</svg>`;
}


function pcbAirwireSvg(project, unavailable = new Set()) {
  const componentsById = new Map(project.components.map((component) => [component.instanceId, component]));
  const paths = project.nets.flatMap((net) => {
    const components = [...new Set(net.endpoints.map((endpoint) => String(endpoint).split(":")[0]))]
      .map((id) => componentsById.get(id)).filter((component) => component && !unavailable.has(component.instanceId));
    if (components.length < 2) return [];
    const points = components.map((component) => componentCenter(component, "pcb"));
    const origin = points[0];
    return points.slice(1).map((point) => `<path class="pcb-airwire ${netClass(net.id)}" d="M${origin.x} ${origin.y} L${point.x} ${point.y}" data-net="${escape(net.id)}"/>`);
  }).join("");
  return `<svg class="wire-layer pcb-airwire-layer" viewBox="0 0 680 300" aria-hidden="true">${paths}</svg>`;
}

function breadboardBoardSvg(project) {
  const holes = breadboardHoleIds().map((id) => {
    const { x, y } = breadboardHolePoint(id);
    const rail = /^(TP|TM|BP|BM)/.test(id);
    return `<g class="board-hole-target" data-breadboard-hole="${id}" role="button" aria-label="Place selected component pin at ${id}" tabindex="-1"><circle class="board-hole-hit" cx="${x}" cy="${y}" r="7"/><circle class="board-hole ${rail ? "rail-hole" : ""}" cx="${x}" cy="${y}" r="${rail ? 3.1 : 2.1}"/></g>`;
  }).join("");
  return `<svg class="breadboard-art" viewBox="0 0 680 300" preserveAspectRatio="none" role="img" aria-label="Generic thirty-column breadboard with 300 terminal holes, 120 rail holes and four split rails">
    <rect class="board-plate" x="34" y="38" width="612" height="224" rx="13"/>
    <path class="board-trench" d="M48 151 H632"/>
    <path class="board-rail-positive" d="M54 54 H330 M350 54 H626 M54 232 H330 M350 232 H626"/>
    <path class="board-rail-negative" d="M54 68 H330 M350 68 H626 M54 246 H330 M350 246 H626"/>
    <path class="board-rail-break" d="M340 49 V73 M340 227 V251"/>
    <g class="board-hole-field">${holes}</g>
    ${breadboardPackageSvg(project)}
    <g class="board-markings"><text x="39" y="58">+</text><text x="39" y="72">−</text><text x="39" y="236">+</text><text x="39" y="250">−</text><text x="340" y="158">CENTER TRENCH</text></g>
  </svg>`;
}


function breadboardPackageSvg(project) {
  return project.components.map((component) => {
    const placement = breadboardPackagePlacement(component, project);
    if (!placement) return "";
    const scale = (572 / 29) / 2.54;
    const halfSpan = placement.leadSpanPixels / 2;
    const transform = `translate(${placement.center.x} ${placement.center.y}) rotate(${placement.angleDegrees})`;
    if (placement.kind === "axial-resistor" || placement.kind === "axial-diode") {
      const bodyHalf = Math.min(placement.bodyLengthMm * scale / 2, halfSpan * .8);
      const bodyWidth = placement.bodyWidthMm * scale;
      const diode = placement.kind === "axial-diode";
      return `<g class="breadboard-package ${diode ? "axial-diode-package" : "resistor-package"}" transform="${transform}" aria-label="${escape(component.reference)} generic axial ${diode ? "diode" : "resistor"} package">
        <path class="package-leads" d="M${-halfSpan} 0 H${-bodyHalf} M${bodyHalf} 0 H${halfSpan}"/>
        <rect class="${diode ? "axial-diode-body" : "resistor-body"}" x="${-bodyHalf}" y="${-bodyWidth / 2}" width="${bodyHalf * 2}" height="${bodyWidth}" rx="${diode ? 5 : 4}"/>
        ${diode ? `<path class="diode-cathode-band" d="M${bodyHalf - 7} ${-bodyWidth / 2} V${bodyWidth / 2}"/>` : `<path class="resistor-band" d="M-13 -7 V7 M-4 -7 V7 M5 -7 V7 M13 -7 V7"/>`}
      </g>`;
    }
    if (placement.kind === "through-hole-led-5mm") {
      const radius = placement.bodyDiameterMm * scale / 2;
      return `<g class="breadboard-package led-package" transform="${transform}" aria-label="${escape(component.reference)} generic 5 millimeter through-hole LED">
        <path class="package-leads" d="M${-halfSpan} 0 H0 M0 0 H${halfSpan}"/>
        <circle class="led-body" cx="0" cy="0" r="${radius}"/>
        <path class="led-lens" d="M-9 -9 Q0 -22 9 -9 M0 -15 V15"/>
      </g>`;
    }
    if (placement.kind === "radial-capacitor") {
      const radius = placement.bodyDiameterMm * scale / 2;
      const leads = placement.pinPoints.map((point) => {
        const dx = placement.bodyCenter.x - point.x, dy = placement.bodyCenter.y - point.y;
        const length = Math.hypot(dx, dy), endX = placement.bodyCenter.x - dx / length * radius * .82, endY = placement.bodyCenter.y - dy / length * radius * .82;
        return `M${point.x} ${point.y} L${endX} ${endY}`;
      }).join(" ");
      return `<g class="breadboard-package capacitor-package" aria-label="${escape(component.reference)} generic radial capacitor">
        <path class="package-leads" d="${leads}"/>
        <ellipse class="capacitor-body" cx="${placement.bodyCenter.x}" cy="${placement.bodyCenter.y}" rx="${radius}" ry="${radius * .78}"/>
        <path class="capacitor-top" d="M${placement.bodyCenter.x-radius*.65} ${placement.bodyCenter.y} H${placement.bodyCenter.x+radius*.65}"/>
      </g>`;
    }
    if (placement.kind === "to92-transistor") {
      const cos = Math.cos(placement.angleDegrees * Math.PI / 180), sin = Math.sin(placement.angleDegrees * Math.PI / 180);
      const localPins = placement.pinPoints.map((point) => {
        const dx = point.x - placement.bodyCenter.x, dy = point.y - placement.bodyCenter.y;
        return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
      });
      const halfWidth = placement.bodyWidthMm * scale / 2, halfHeight = placement.bodyHeightMm * scale / 2;
      const leads = localPins.map((point) => `M${point.x} ${point.y} L${point.x} ${halfHeight}`).join(" ");
      return `<g class="breadboard-package transistor-package" transform="translate(${placement.bodyCenter.x} ${placement.bodyCenter.y}) rotate(${placement.angleDegrees})" aria-label="${escape(component.reference)} generic TO-92 body for an ideal NPN behavior model">
        <path class="package-leads" d="${leads}"/>
        <path class="to92-body" d="M${-halfWidth} ${halfHeight} V0 A${halfWidth} ${halfHeight} 0 0 1 ${halfWidth} 0 V${halfHeight} Z"/>
        <path class="to92-face" d="M${-halfWidth*.7} ${halfHeight-4} H${halfWidth*.7}"/>
      </g>`;
    }
    return "";
  }).join("");
}
function breadboardWireSvg(project) {
  const config = project.breadboard;
  if (!config || !Array.isArray(config.jumpers)) return "";
  const netByEndpoint = new Map();
  for (const net of project.nets ?? []) for (const endpoint of net.endpoints ?? []) netByEndpoint.set(endpoint, net.id);
  const netForHole = (hole) => {
    const endpoint = Object.entries(config.pinHoles ?? {}).find(([, assigned]) => normalizeBreadboardHole(assigned) === hole)?.[0];
    return endpoint ? netByEndpoint.get(endpoint) : undefined;
  };
  const paths = config.jumpers.map((jumper, index) => {
    const from = normalizeBreadboardHole(jumper.from), to = normalizeBreadboardHole(jumper.to);
    const start = from && breadboardHolePoint(from), end = to && breadboardHolePoint(to);
    if (!start || !end) return "";
    const netId = netForHole(from) ?? netForHole(to);
    const highlight = netId && netId === state.selectedNetId ? " is-net-highlight" : "";
    const lift = Math.max(14, Math.min(38, Math.abs(end.x - start.x) * .08));
    return `<path class="jumper-wire ${netId ? netClass(netId) : "net-signal"}${highlight}" d="M${start.x} ${start.y} C${start.x} ${start.y - lift}, ${end.x} ${end.y - lift}, ${end.x} ${end.y}" data-jumper-index="${index}"/>`;
  }).join("");
  return `<svg class="wire-layer breadboard-wire-layer" viewBox="0 0 680 300" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>`;
}

function breadboardPinMarkers(project) {
  const config = project.breadboard;
  if (!config?.pinHoles) return "";
  const netByEndpoint = new Map();
  for (const net of project.nets ?? []) for (const endpoint of net.endpoints ?? []) netByEndpoint.set(endpoint, net.id);
  return Object.entries(config.pinHoles).map(([endpoint, rawHole]) => {
    const hole = normalizeBreadboardHole(rawHole), split = endpoint.indexOf(":");
    const component = project.components.find((item) => item.instanceId === endpoint.slice(0, split));
    if (!hole || !component) return "";
    const pin = endpoint.slice(split + 1), part = findLibraryPart(component.libraryId), point = breadboardHolePoint(hole);
    const netId = netByEndpoint.get(endpoint);
    const selected = component.instanceId === state.selectedInstanceId ? " selected" : "";
    const netSelected = netId && netId === state.selectedNetId ? " is-net-highlight" : "";
    const aria = `${component.reference} pin ${pin} at breadboard hole ${hole}`;
    return `<button type="button" class="breadboard-pin ${netId ? netClass(netId) : ""}${selected}${netSelected}" data-instance-id="${escape(component.instanceId)}" title="${escape(aria)}" aria-label="${escape(aria)}" style="--pin-x:${(point.x / 680) * 100}%;--pin-y:${(point.y / 300) * 100}%"><span class="physical-pin-name" aria-hidden="true">${selected ? `${escape(component.reference)}.${escape(pin)}` : ""}</span><span class="sr-only">${escape(component.reference)}.${escape(pin)} · ${escape(part?.type ?? "Component")} · ${escape(hole)}</span></button>`;
  }).join("");
}


function breadboardSyncFingerprint(project) {
  return JSON.stringify({ components: project.components, nets: project.nets, breadboard: project.breadboard });
}

function renderBreadboardControls() {
  const config = state.project.breadboard;
  const pinSelect = $("#breadboard-pin");
  const holes = breadboardHoleIds();
  const previous = pinSelect.value;
  const options = state.project.components.flatMap((component) => {
    const part = findLibraryPart(component.libraryId);
    return (part?.pins ?? []).map((pin) => ({ value: `${component.instanceId}:${pin}`, label: `${component.reference}.${pin} — ${part.type}` }));
  });
  pinSelect.innerHTML = options.map((item) => `<option value="${escape(item.value)}">${escape(item.label)}</option>`).join("");
  if (options.some((item) => item.value === previous)) pinSelect.value = previous;
  $("#breadboard-hole-options").innerHTML = holes.map((hole) => `<option value="${hole}"></option>`).join("");
  const report = validateBreadboardTopology(state.project, { getPartPins: (libraryId) => findLibraryPart(libraryId)?.pins ?? [] });
  const stateLabel = report.state === "complete" ? t("breadboardComplete") : report.state === "blocked" ? t("breadboardBlocked") : t("breadboardIncomplete");
  const issue = report.errors[0] ?? report.warnings[0];
  $("#breadboard-status").textContent = `${stateLabel} · ${report.mappedPinCount} ${t("breadboardMappedPins")} · ${report.jumperCount} ${t("breadboardJumpers")}${issue ? ` · ${issue.message}` : ""}${state.breadboardPlacementMode ? ` · ${t("breadboardPlacementActive")}` : ""}`;
  $("#breadboard-placement-mode").setAttribute("aria-pressed", String(state.breadboardPlacementMode));
  $("#breadboard-placement-list").innerHTML = Object.entries(config?.pinHoles ?? {}).map(([endpoint, hole]) => {
    const component = state.project.components.find((item) => endpoint.startsWith(`${item.instanceId}:`));
    return `<li><span>${escape(component?.reference ?? endpoint)} → ${escape(hole)}</span><button type="button" data-bb-unassign="${escape(endpoint)}" aria-label="${escape(t("breadboardRemovePlacement"))} ${escape(endpoint)}">×</button></li>`;
  }).join("") || `<li>${escape(t("breadboardNoPlacements"))}</li>`;
  $("#breadboard-jumper-list").innerHTML = (config?.jumpers ?? []).map((jumper, index) => `<li><span>${escape(jumper.from)} ↔ ${escape(jumper.to)}</span><button type="button" data-bb-remove-jumper="${index}" aria-label="${escape(t("breadboardRemoveJumper"))} ${escape(jumper.from)} ${escape(jumper.to)}">×</button></li>`).join("") || `<li>${escape(t("breadboardNoJumpers"))}</li>`;
  const syncPreview = state.breadboardSyncPreview;
  const stale = Boolean(syncPreview && syncPreview.fingerprint !== breadboardSyncFingerprint(state.project));
  $("#breadboard-sync-summary").textContent = !syncPreview
    ? t("breadboardSyncDefault")
    : stale ? t("breadboardSyncStale")
    : syncPreview.state !== "complete" ? t("breadboardSyncBlocked")
    : syncPreview.changed ? `${t("breadboardSyncDiff")} ${syncPreview.mergedNetIds.length} ${t("breadboardSyncMerged")} · ${syncPreview.splitNetIds.length} ${t("breadboardSyncSplit")}`
    : t("breadboardSyncReady");
  $("#breadboard-sync-net-list").innerHTML = syncPreview?.state === "complete" && !stale
    ? syncPreview.nets.map((net) => `<li><strong>${escape(net.id)}</strong><span>${net.endpoints.map(escape).join(", ")}</span></li>`).join("") || `<li>${escape(t("breadboardSyncNoNets"))}</li>`
    : "";
  $("#breadboard-sync-apply").hidden = !syncPreview || syncPreview.state !== "complete";
  $("#breadboard-sync-apply").disabled = !syncPreview || syncPreview.state !== "complete" || !syncPreview.changed || stale;

}

function commitBreadboardEdit(project, message) {
  captureHistory();
  state.project = { ...project, metadata: { ...project.metadata, updatedAt: new Date().toISOString() } };
  state.dirty = true;
  state.recoveryActive = true;
  state.lastValidation = null;
  render();
  validateAndReport();
  log(message);
}

function renderCanvas() {
  const canvas = $("#design-canvas");
  canvas.className = `design-canvas ${state.activeView} ${state.breadboardPlacementMode ? "is-placement-mode" : ""} ${state.schematicWireMode ? "is-wire-mode" : ""} ${state.activeTool === "pcb-route" ? "is-pcb-route-mode" : ""} ${$("#grid-toggle").checked ? "grid-enabled" : ""}`;
  const canvasArea = document.querySelector(".canvas-area");
  canvasArea.classList.toggle("has-overview", state.activeView === "breadboard");
  document.querySelectorAll("[data-mini-view]").forEach((panel) => { panel.hidden = panel.dataset.miniView !== "schematic" || state.activeView !== "breadboard"; });
  canvas.setAttribute("aria-label", `${state.activeView} representation. Select a component to inspect it.`);
  const projection = projectComponentsForView(state.project, state.activeView);
  const issues = projection.reconciliationItems;
  const unavailable = new Set(issues.map((issue) => issue.instanceId));
  const isBreadboard = state.activeView === "breadboard";
  const isPcb = state.activeView === "pcb";
  const hasPhysicalMap = Object.keys(state.project.breadboard?.pinHoles ?? {}).length > 0;
  const pcbData = state.project.pcbFabrication;
  const hasPcbData = isPcb && Boolean(pcbData?.board && Number.isFinite(pcbData.board.widthMm) && Number.isFinite(pcbData.board.heightMm) && Array.isArray(pcbData.parts) && Array.isArray(pcbData.pads) && Array.isArray(pcbData.routes));
  const parts = isBreadboard && hasPhysicalMap
    ? breadboardPinMarkers(state.project)
    : hasPcbData ? "" : projection.components.map((component) => componentVisual(component, state.activeView)).join("");
  const surface = isBreadboard ? breadboardBoardSvg(state.project) : isPcb ? renderPcbPreviewSvg(state.project, t("pcbNoFootprintData")) : "";
  const wires = isBreadboard
    ? breadboardWireSvg(state.project)
    : isPcb ? (hasPcbData ? "" : pcbAirwireSvg(state.project, unavailable))
      : netSvg(state.project, state.activeView, unavailable);
  const reconciliationNotice = issues.length ? `<div class="reconciliation-notice"><strong>Reconciliation needed</strong>${issues.map((issue) => `<span>${escape(issue.reference)}: ${escape(issue.reason)}</span>`).join("")}</div>` : "";
  const label = state.activeView === "breadboard" ? (hasPhysicalMap ? t("breadboardPhysicalMapLabel") : t("breadboardNoPhysicalMapLabel")) : state.activeView === "schematic" ? "Shared project net layout — not a standards-complete schematic editor." : (hasPcbData ? t("pcbStoredLayoutPreview") : t("pcbNoFootprintData"));
  canvas.innerHTML = `<div class="canvas-label">${label}</div>${reconciliationNotice}<div class="canvas-scene" style="--pan-x:${state.pan.x}px;--pan-y:${state.pan.y}px">${isPcb && hasPcbData ? renderPcbPreviewSvg(state.project, t("pcbNoFootprintData"), state.pcbRouteDraft) : surface}${wires}${parts}</div>`;
  $("#schematic-wire-mode").setAttribute("aria-pressed", String(state.schematicWireMode));
  $("#schematic-wire-status").textContent = !state.schematicWireMode ? "" : state.schematicWireStart ? t("schematicWireNext") : t("schematicWireStart");
  $("#pcb-route-mode").disabled = !hasPcbData;
  $("#pcb-route-mode").setAttribute("aria-pressed", String(state.activeTool === "pcb-route"));
  $("#pcb-route-status").textContent = state.activeTool !== "pcb-route" ? "" : t(state.pcbRouteHintKey ?? (state.pcbRouteDraft ? "pcbRouteWaypoint" : "pcbRouteStart"));
  $$('[data-tool]').forEach((button) => button.classList.toggle("active", button.dataset.tool === state.activeTool));
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
  const pcbPart = state.project.pcbFabrication?.parts?.find((item) => item.instanceId === component?.instanceId);
  const pcbPads = state.project.pcbFabrication?.pads?.filter((item) => item.instanceId === component?.instanceId) ?? [];
  const padNets = new Set(pcbPads.map((item) => item.netId));
  const pcbRoutes = (state.project.pcbFabrication?.routes ?? []).filter((item) => padNets.has(item.netId));
  const centroid = pcbPads.length ? [pcbPads.reduce((sum, item) => sum + item.xMm, 0) / pcbPads.length, pcbPads.reduce((sum, item) => sum + item.yMm, 0) / pcbPads.leng…27085 tokens truncated…oject.metadata.name.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"adigun-simulation"}-report.json`;link.click();URL.revokeObjectURL(url);
  log("[REPORT] Exported the simulation settings, model version, results, and warnings.");
}

function confirmBotCircuitProposal() {
  const analysis=runBotCircuitProposal(state.project);
  if(analysis.state!=="complete"){showDialog("Circuit proposal unavailable",analysis.errors[0]?.message??analysis.message);return;}
  const proposal=analysis.result.proposal;
  if(!confirm("Replace this project with the proposed "+proposal.source+" LED circuit using a "+proposal.resistor+" series resistor? Check the actual LED and resistor ratings before building.")){log("[BOT] Circuit proposal rejected; project unchanged.");return;}
  const outcome=applyBotCircuitProposal(state.project,analysis.preview,{confirmed:true});
  if(!outcome.ok){showDialog("Proposal not applied",outcome.message);return;}
  captureHistory();replaceProject(outcome.project);log("[BOT] Confirmed circuit proposal applied locally. Verify the exact physical part ratings before construction.");
}

function confirmBotRepairPreview() {
  const analysis=runBotFloatingNodeRepair(state.project);
  if(analysis.state!=="complete"){showDialog("Repair preview unavailable",analysis.errors[0]?.message??analysis.message);return;}
  const proposal=analysis.result.proposal;
  if(!confirm("Apply the previewed "+proposal.value+" bleed resistor from "+proposal.from+" to "+proposal.to+"? Review signal loading and circuit intent first.")){log("[BOT] Repair preview canceled; project unchanged.");return;}
  const outcome=applyBotFloatingNodeRepairPreview(state.project,analysis.preview,{confirmed:true});
  if(!outcome.ok){showDialog("Repair not applied",outcome.message);return;}
  captureHistory();replaceProject(outcome.project);log("[BOT] Confirmed preview applied locally. Recheck circuit behavior and validation.");
}

function answerBotFromSelection() {
  const selected=state.project.components.find(item=>item.instanceId===state.selectedInstanceId);
  const result=explainComponent(state.project,selected?.instanceId);
  const response=$("#bot-response");
  response.textContent=result.ok?result.answer:result.error;
  log(result.ok?"[BOT] Answered from project and checked-in library fields only.":"[BOT] "+result.error);
}

function exportBomCsvFile() {
  const analysis = runBomExportPlaceholder(state.project);
  if (analysis.state !== "complete") { showDialog("BOM export unavailable", analysis.errors[0]?.message ?? "Run the BOM example or add supported components first."); return; }
  const exported = exportBomCsv({ ok: true, rows: analysis.result.rows });
  if (!exported.ok) { showDialog("BOM export unavailable", exported.error); return; }
  const blob = new Blob([exported.csv], { type: "text/csv;charset=utf-8" }), url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = "adigun-bom.csv"; link.click(); URL.revokeObjectURL(url);
  log("[BOM] Exported verified project/library fields; prices without source evidence are blank.");
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

function runPcbChecks() {
  const report=validatePcbFabrication(state.project);
  const summary=report.status==="passed"?"Bounded PCB checks passed.":report.errors.join("\n");
  showDialog("PCB fabrication checks",summary+"\\n\\nChecks: "+report.checks.join(", ")+"\\nThese checks are educational and do not replace manufacturer validation.");
  log(`[PCB DRC] ${report.status.toUpperCase()} — ${report.errors.length} issue(s).`);
}
function exportPcbFiles() {
  const result=createManufacturingExportPack(state.project);
  if(result.status!=="passed"){
    showDialog("PCB export blocked",(result.errors??result.drc?.errors??[]).join("\\n"));
    log("[PCB EXPORT] Blocked until the bounded checks pass.");
    return;
  }
  const stem=state.project.metadata.name.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"adigun-pcb";
  for(const [name,content] of Object.entries(result.files)){
    const mime=name.endsWith(".csv")?"text/csv":name.endsWith(".pdf")?"application/pdf":name.endsWith(".json")?"application/json":name.endsWith(".txt")?"text/plain":"application/octet-stream";
    const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=stem+"-"+name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  log("[PCB EXPORT] Downloaded the Gerber, drill, BOM, placement, assembly overview, manifest, and SHA-256 checksum pack.");
}
function activateView(view) {
  state.activeView = view;
  if (view !== "breadboard") state.breadboardPlacementMode = false;
  if (view !== "schematic") { state.schematicWireMode = false; state.schematicWireStart = null; }
  if (view !== "pcb") { state.pcbRouteDraft = null; state.pcbRouteHintKey = null; if (state.activeTool === "pcb-route") state.activeTool = "select"; }
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
  if (action === "bom-export") exportBomCsvFile();
  if (action === "verify-run-lock") verifyRunLockfile();
  if (action === "pcb-drc") runPcbChecks();
  if (action === "pcb-export") exportPcbFiles();
  if (action === "validate") validateAndReport();
  if (action === "undo") undo();
  if (action === "redo") redo();
  if (action === "run-simulation") runAnalysis();
  if (action === "stop-simulation") stopSimulation();
  if (action === "schematic-wire-mode") {
    if (state.schematicWireMode) { state.schematicWireMode = false; state.schematicWireStart = null; }
    else { activateView("schematic"); state.schematicWireMode = true; state.schematicWireStart = null; }
    render();
  }
  if (action === "breadboard-placement-mode") {
    if (state.breadboardPlacementMode) { state.breadboardPlacementMode = false; render(); return; }
    if (!$("#breadboard-pin").value) return showDialog(t("breadboardEditor"), t("breadboardSelectPinFirst"));
    activateView("breadboard");
    state.breadboardPlacementMode = true;
    render();
    requestAnimationFrame(() => $("#design-canvas [data-breadboard-hole]")?.focus());
  }

  if (action === "breadboard-sync-review") {
    const preview = deriveBreadboardSchematicNets(state.project, { getPartPins: (libraryId) => findLibraryPart(libraryId)?.pins ?? [] });
    state.breadboardSyncPreview = { ...preview, fingerprint: breadboardSyncFingerprint(state.project) };
    renderBreadboardControls();
    log(preview.message);
  }
  if (action === "breadboard-sync-apply") {
    const preview = state.breadboardSyncPreview;
    if (!preview || preview.state !== "complete" || preview.fingerprint !== breadboardSyncFingerprint(state.project) || !preview.changed) {
      state.breadboardSyncPreview = null;
      renderBreadboardControls();
      return showDialog(t("breadboardSyncReview"), t("breadboardSyncStale"));
    }
    const next = { ...state.project, nets: preview.nets, metadata: { ...state.project.metadata, updatedAt: new Date().toISOString() } };
    const validation = validateProject(next);
    if (!validation.valid) return showDialog(t("breadboardSyncReview"), validation.errors.map((issue) => issue.message).join(" "));
    captureHistory();
    state.project = next;
    state.breadboardSyncPreview = null;
    state.dirty = true;
    state.recoveryActive = true;
    state.lastValidation = null;
    render();
    validateAndReport();
    log("[SYNC] Applied reviewed physical breadboard connectivity to the canonical netlist shared by schematic and PCB views.");
  }
  if (action === "help") showImplementationStatus();
}

function handlePcbRouteCanvasClick(event) {
  if (state.activeView !== "pcb" || state.activeTool !== "pcb-route" || !event.target.closest("#design-canvas")) return false;
  const pad = event.target.closest("[data-pcb-pad]");
  if (pad) {
    event.preventDefault();
    event.stopPropagation();
    state.selectedInstanceId = pad.dataset.instanceId;
    if (pad.dataset.pcbNet === "NC") { showDialog(t("pcbMenu"), t("pcbRouteBlocked")); return true; }
    if (!state.pcbRouteDraft) {
      state.pcbRouteDraft = { startPad: pad.dataset.pcbPad, netId: pad.dataset.pcbNet, pointsMm: [[Number(pad.dataset.xMm), Number(pad.dataset.yMm)]] };
      state.pcbRouteHintKey = "pcbRouteWaypoint";
      render();
      log(`[PCB] Route start selected at ${pad.dataset.pcbPad} on ${pad.dataset.pcbNet}.`);
      return true;
    }
    if (pad.dataset.pcbNet !== state.pcbRouteDraft.netId) {
      state.pcbRouteHintKey = "pcbRouteDifferentNet";
      renderCanvas();
      return true;
    }
    const result = createPcbRoute(state.project, { startPad: state.pcbRouteDraft.startPad, endPad: pad.dataset.pcbPad, waypoints: state.pcbRouteDraft.pointsMm.slice(1) });
    if (result.status === "complete") {
      captureHistory();
      state.project = result.project;
      state.dirty = true;
      state.recoveryActive = true;
      state.lastValidation = null;
      state.pcbRouteDraft = null;
      state.pcbRouteHintKey = "pcbRouteReady";
      render();
      log(`[PCB] Added a ${result.layer} route on ${result.netId} using ${result.pointsMm.length} point(s), ${result.widthMm} mm wide. Run PCB checks before export.`);
    } else if (result.status === "unchanged") {
      state.pcbRouteDraft = null;
      state.pcbRouteHintKey = "pcbRouteReady";
      renderCanvas();
    } else {
      state.pcbRouteHintKey = "pcbRouteBlocked";
      renderCanvas();
      showDialog(t("pcbMenu"), `${t("pcbRouteBlocked")} (${result.code})`);
      log(`[PCB] Interactive route blocked: ${result.code}.`);
    }
    return true;
  }
  if (event.target.closest(".pcb-footprint-hit")) { event.preventDefault(); event.stopPropagation(); return true; }
  const svg = event.target.closest(".pcb-preview-svg");
  if (!svg || !state.pcbRouteDraft) return false;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return true;
  const viewPoint = [(event.clientX - rect.left) * 680 / rect.width, (event.clientY - rect.top) * 300 / rect.height];
  const point = pcbPreviewPointToBoardMm(state.project, viewPoint);
  const board = state.project.pcbFabrication?.board;
  if (!point || point[0] < 0 || point[1] < 0 || point[0] > board.widthMm || point[1] > board.heightMm) {
    state.pcbRouteHintKey = "pcbRouteBlocked";
    renderCanvas();
    return true;
  }
  if ($("#snap-toggle").checked) { point[0] = Math.round(point[0] * 2) / 2; point[1] = Math.round(point[1] * 2) / 2; }
  const previous = state.pcbRouteDraft.pointsMm.at(-1);
  if (!previous || Math.hypot(point[0] - previous[0], point[1] - previous[1]) > 0.001) state.pcbRouteDraft.pointsMm.push(point);
  state.pcbRouteHintKey = "pcbRouteWaypoint";
  renderCanvas();
  return true;
}

document.addEventListener("click", (event) => {
  state.userInteracted = true;
  if (handlePcbRouteCanvasClick(event)) return;
  const libraryModeButton = event.target.closest("[data-library-mode]");
  if (libraryModeButton) {
    state.libraryMode = libraryModeButton.dataset.libraryMode;
    $$("[data-library-mode]").forEach((button) => {
      const active = button === libraryModeButton;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderLibrary();
    return;
  }
  const evidencePartButton = event.target.closest("[data-evidence-part-id]");
  if (evidencePartButton) {
    state.selectedEvidencePartId = evidencePartButton.dataset.evidencePartId;
    renderLibrary();
    return;
  }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action) handleAction(action);
  const schematicPinTarget = event.target.closest("[data-schematic-endpoint]");
  if (schematicPinTarget && state.schematicWireMode && state.activeView === "schematic") {
    const endpoint = schematicPinTarget.dataset.schematicEndpoint;
    if (!state.schematicWireStart) { state.schematicWireStart = endpoint; renderCanvas(); return; }
    if (state.schematicWireStart === endpoint) { state.schematicWireStart = null; renderCanvas(); return; }
    try {
      captureHistory();
      state.project = connectPins(state.project, state.schematicWireStart, endpoint);
      state.schematicWireMode = false;
      state.schematicWireStart = null;
      state.dirty = true;
      state.recoveryActive = true;
      state.lastValidation = null;
      render();
      validateAndReport();
      log(`[SCHEMATIC] Connected ${endpoint} to the selected pin in the shared netlist.`);
    } catch (error) {
      showDialog(t("schematic"), error instanceof Error ? error.message : t("schematicWireFailed"));
    }
    return;
  }
  const holeTarget = event.target.closest("[data-breadboard-hole]");
  if (holeTarget && state.breadboardPlacementMode && state.activeView === "breadboard") {
    const placed = assignBreadboardPin($("#breadboard-pin").value, holeTarget.dataset.breadboardHole);
    if (placed) { state.breadboardPlacementMode = false; render(); }
    return;
  }
  if (event.target.closest(".app-menu-popover")) event.target.closest("details").open = false;
  const libraryButton = event.target.closest("[data-library-id]");
  if (libraryButton) { state.selectedLibraryId = libraryButton.dataset.libraryId; renderLibrary(); }
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.activeCategory = categoryButton.dataset.category;
    $$(".category-filter").forEach((button) => button.classList.toggle("active", button === categoryButton));
    renderLibrary();
  }
  const instanceButton = event.target.closest("[data-instance-id]");
  if (instanceButton) { state.selectedInstanceId = instanceButton.dataset.instanceId; render(); showBotWiringExplanation(state.selectedInstanceId); }
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
    if (["select", "pan"].includes(tool.dataset.tool)) { state.activeTool = tool.dataset.tool; state.pcbRouteDraft = null; state.pcbRouteHintKey = null; }
    if (tool.dataset.tool === "pcb-route") {
      if (state.activeTool === "pcb-route") { state.activeTool = "select"; state.pcbRouteDraft = null; state.pcbRouteHintKey = null; }
      else { activateView("pcb"); state.activeTool = "pcb-route"; state.pcbRouteDraft = null; state.pcbRouteHintKey = null; }
    }
    $$("[data-tool]").forEach((button) => button.classList.toggle("active", button === tool && !["zoom-in", "zoom-out"].includes(tool.dataset.tool)));
    $("#zoom-level").textContent = `${Math.round(state.scale * 100)}%`;
    $("#design-canvas").style.setProperty("--canvas-scale", state.scale);
    if (["select", "pan", "pcb-route"].includes(tool.dataset.tool)) renderCanvas();
  }
  const collapse = event.target.closest("[data-collapse]");
  if (collapse) document.querySelector(`.${collapse.dataset.collapse}`).classList.toggle("collapsed");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.breadboardPlacementMode || state.schematicWireMode || state.activeTool === "pcb-route")) {
    event.preventDefault();
    state.breadboardPlacementMode = false;
    state.schematicWireMode = false;
    state.schematicWireStart = null;
    if (state.activeTool === "pcb-route") state.activeTool = "select";
    state.pcbRouteDraft = null;
    state.pcbRouteHintKey = null;
    render();
    return;
  }
  const holeTarget = event.target.closest?.("[data-breadboard-hole]");
  if (holeTarget && state.breadboardPlacementMode) {
    const holeIds = breadboardHoleIds();
    const index = holeIds.indexOf(holeTarget.dataset.breadboardHole);
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
      const nextHole = holeIds[(index + direction + holeIds.length) % holeIds.length];
      $(`#design-canvas [data-breadboard-hole="${nextHole}"]`)?.focus();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const placed = assignBreadboardPin($("#breadboard-pin").value, holeTarget.dataset.breadboardHole);
      if (placed) { state.breadboardPlacementMode = false; render(); }
      return;
    }
  }
  const pcbFootprintTarget = event.target.closest?.(".pcb-footprint-hit");
  if (pcbFootprintTarget && state.activeView === "pcb" && state.activeTool === "select" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    const step = $("#snap-toggle").checked ? 0.5 : 0.1;
    const delta = { x: event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0, y: event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0 };
    const instanceId = pcbFootprintTarget.dataset.pcbFootprint;
    const result = movePcbFootprint(state.project, instanceId, delta);
    state.selectedInstanceId = instanceId;
    if (result.status === "complete") {
      captureHistory();
      state.project = result.project;
      state.dirty = true;
      state.recoveryActive = true;
      state.lastValidation = null;
      render();
      validateAndReport();
      $(`#design-canvas [data-pcb-footprint="${CSS.escape(instanceId)}"]`)?.focus();
      log(`[PCB] ${instanceId} nudged by ${step} mm.`);
    } else if (result.status === "blocked") {
      showDialog(t("pcbMenu"), result.code === "OUT_OF_BOUNDS" ? t("pcbMoveOutOfBounds") : result.code === "INVALID_FOOTPRINT_GEOMETRY" ? t("pcbMoveInvalidGeometry") : t("pcbMoveNoFootprint"));
    } else {
      render();
      $(`#design-canvas [data-pcb-footprint="${CSS.escape(instanceId)}"]`)?.focus();
    }
    return;
  }
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
  const pcbFootprint = state.activeView === "pcb" && state.activeTool === "select" ? event.target.closest(".pcb-footprint-hit") : null;
  const point = { x: event.clientX, y: event.clientY };
  if (pcbFootprint) {
    const svg = pcbFootprint.ownerSVGElement;
    state.drag = { mode: "move-pcb", pointerId: event.pointerId, instanceId: pcbFootprint.dataset.pcbFootprint, start: point, svg, canvas };
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    return;
  }
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
  if (state.drag.mode === "move-pcb") {
    const rect = state.drag.svg.getBoundingClientRect();
    const viewX = deltaX * (680 / rect.width), viewY = deltaY * (300 / rect.height);
    const scale = getPcbPreviewScale(state.project.pcbFabrication?.board);
    if (!scale) return;
    state.drag.previewDelta = { x: viewX / scale, y: viewY / scale };
    const group = state.drag.svg.querySelector(`[data-pcb-footprint="${CSS.escape(state.drag.instanceId)}"]`);
    if (group) group.setAttribute("transform", `translate(${viewX} ${viewY})`);
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

document.addEventListener("pointercancel", (event) => {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const drag = state.drag;
  state.drag = null;
  drag.canvas.releasePointerCapture?.(event.pointerId);
  if (drag.mode === "move-pcb") renderCanvas();
});

document.addEventListener("pointerup", (event) => {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const drag = state.drag;
  state.drag = null;
  drag.canvas.releasePointerCapture?.(event.pointerId);
  if (drag.mode === "move-pcb") {
    const rect = drag.svg.getBoundingClientRect();
    const scale = getPcbPreviewScale(state.project.pcbFabrication?.board);
    if (!scale) { renderCanvas(); return; }
    const delta = { x: (event.clientX - drag.start.x) * (680 / rect.width) / scale, y: (event.clientY - drag.start.y) * (300 / rect.height) / scale };
    if ($("#snap-toggle").checked) { delta.x = Math.round(delta.x * 2) / 2; delta.y = Math.round(delta.y * 2) / 2; }
    const result = movePcbFootprint(state.project, drag.instanceId, delta);
    state.selectedInstanceId = drag.instanceId;
    if (result.status === "complete") {
      captureHistory();
      state.project = result.project;
      state.dirty = true;
      state.recoveryActive = true;
      state.lastValidation = null;
      render();
      validateAndReport();
      log(`[PCB] ${drag.instanceId} moved ${result.movedPadCount} pad(s); ${result.updatedRoutePoints} attached route point(s) updated.`);
    } else {
      render();
      if (result.status === "blocked") {
        const message = result.code === "OUT_OF_BOUNDS" ? t("pcbMoveOutOfBounds") : result.code === "INVALID_FOOTPRINT_GEOMETRY" ? t("pcbMoveInvalidGeometry") : t("pcbMoveNoFootprint");
        showDialog(t("pcbMenu"), message);
        log(`[PCB] Footprint move blocked: ${result.code}.`);
      }
    }
    return;
  }
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
  const propertyCheck=validateComponentProperty(component,$("#property-value").value);
  if(!propertyCheck.valid){showDialog("Property not applied",propertyCheck.errors.map(error=>error.message).join("\\n"));log(`[PROPERTY] ${component.reference} edit blocked: ${propertyCheck.errors[0].code}.`);return;}
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
  if (state.project.breadboard?.pinHoles) {
    const endpointPrefix = `${component.instanceId}:`;
    state.project = { ...state.project, breadboard: { ...state.project.breadboard, pinHoles: Object.fromEntries(Object.entries(state.project.breadboard.pinHoles).filter(([endpoint]) => !endpoint.startsWith(endpointPrefix))) } };
  }
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

function assignBreadboardPin(endpoint, hole) {
  const normalizedHole = normalizeBreadboardHole(hole);
  if (!endpoint || !normalizedHole) return showDialog(t("breadboardEditor"), t("breadboardInvalidHole"));
  const [instanceId, ...pinParts] = endpoint.split(":");
  const pin = pinParts.join(":");
  const component = state.project.components.find((item) => item.instanceId === instanceId);
  if (!component || !findLibraryPart(component.libraryId)?.pins.includes(pin)) return showDialog(t("breadboardEditor"), t("breadboardUnknownPin"));
  const current = state.project.breadboard ?? { model: BREADBOARD_MODEL.id, pinHoles: {}, jumpers: [] };
  const next = { ...state.project, breadboard: { ...current, model: BREADBOARD_MODEL.id, pinHoles: { ...(current.pinHoles ?? {}), [endpoint]: normalizedHole }, jumpers: current.jumpers ?? [] } };
  commitBreadboardEdit(next, `[BREADBOARD] Placed ${endpoint} at ${normalizedHole}.`);
  return true;
}

$("#breadboard-pin-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (assignBreadboardPin($("#breadboard-pin").value, $("#breadboard-hole").value)) $("#breadboard-hole").value = "";
});
$("#breadboard-placement-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-bb-unassign]");
  if (!button) return;
  const current = state.project.breadboard;
  if (!current?.pinHoles?.[button.dataset.bbUnassign]) return;
  const pinHoles = { ...current.pinHoles };
  delete pinHoles[button.dataset.bbUnassign];
  commitBreadboardEdit({ ...state.project, breadboard: { ...current, pinHoles } }, `[BREADBOARD] Removed physical placement for ${button.dataset.bbUnassign}.`);
});
$("#breadboard-jumper-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const from = normalizeBreadboardHole($("#breadboard-jumper-from").value);
  const to = normalizeBreadboardHole($("#breadboard-jumper-to").value);
  if (!from || !to || from === to) return showDialog(t("breadboardEditor"), t("breadboardInvalidJumper"));
  const current = state.project.breadboard ?? { model: BREADBOARD_MODEL.id, pinHoles: {}, jumpers: [] };
  const next = { ...state.project, breadboard: { ...current, model: BREADBOARD_MODEL.id, pinHoles: current.pinHoles ?? {}, jumpers: [...(current.jumpers ?? []), { from, to }] } };
  $("#breadboard-jumper-from").value = "";
  $("#breadboard-jumper-to").value = "";
  commitBreadboardEdit(next, `[BREADBOARD] Added physical jumper ${from}–${to}.`);
});
$("#breadboard-jumper-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-bb-remove-jumper]");
  if (!button) return;
  const current = state.project.breadboard;
  const index = Number(button.dataset.bbRemoveJumper);
  if (!Number.isInteger(index) || !current?.jumpers?.[index]) return;
  const jumpers = current.jumpers.filter((_, itemIndex) => itemIndex !== index);
  commitBreadboardEdit({ ...state.project, breadboard: { ...current, jumpers } }, "[BREADBOARD] Removed a physical jumper.");
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
$("#run-simulation").addEventListener("click", () => runAnalysis());
$("#simulation-analysis-mode").addEventListener("change", (event) => {
  $("#ac-sweep-controls").classList.toggle("hidden", event.target.value !== "linear-ac");
  $("#linear-transient-controls").classList.toggle("hidden", event.target.value !== "linear-transient");
  $("#digital-event-controls").classList.toggle("hidden", event.target.value !== "digital-events");
});
$("#run-validation").addEventListener("click", validateAndReport);
$("#export-simulation-report").addEventListener("click", exportSimulationReport);
$("#load-example").addEventListener("click", async () => {
  const path = $("#example-picker").value;
  try {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`The example request returned ${response.status}.`);
    const project = parseProject(await response.text());
    const analysis = project.releaseCandidateE2E
      ? await runReleaseCandidateE2E(project)
      : await createSimulationWorkerRun(project).promise;
    if (analysis.state !== "complete") throw new Error("The selected example does not pass its supported analysis check.");
    if (state.dirty && !confirm("Replace the current project with this released example? Export unsaved work first if you need it.")) return;
    state.history = [];
    state.future = [];
    state.lastValidation = null;
    state.activeOutput = "output";
    replaceProject(project, { dirty: false });
    state.lastAnalysis = analysis;
    state.selectedInstanceId = project.components.find((item) => item.libraryId === "passive.resistor")?.instanceId ?? project.components[0]?.instanceId ?? null;
    render();
    log(`[EXAMPLE] Loaded and validated ${project.metadata.name}.`);
  } catch (error) {
    showDialog("Example unavailable", error instanceof Error ? error.message : "The selected example could not be loaded.");
  }
});
$("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("light"));
$("#global-search-toggle").addEventListener("click", () => {
  const search = $(".global-search");
  search.hidden = !search.hidden;
  $("#global-search-toggle").setAttribute("aria-expanded", String(!search.hidden));
  if (!search.hidden) $("#global-search").focus();
});
$("#global-search").addEventListener("keydown", (event) => {
  if (event.key === "Escape") { $(".global-search").hidden = true; $("#global-search-toggle").focus(); }
});
$("#dialog-close").addEventListener("click", () => $("#status-dialog").close());
$("#bot-collapse").addEventListener("click", () => $("#bot").classList.toggle("minimized"));
$("#bot-form").addEventListener("submit", (event) => { event.preventDefault(); answerBotFromSelection(); });
$("#bot-question-form").addEventListener("submit", (event) => { event.preventDefault(); answerBotQuestion(); });
$("#bot-live-toggle").addEventListener("change", (event) => {
  botLiveCopilot.setEnabled(event.target.checked);
  $("#bot-response").textContent = event.target.checked ? "Live checks are on. Suggestions use current project connections and library pin data." : "Live co-pilot is off. You can still ask Adigun BOT to explain the selected part.";
});
$("#bot-suggestion-accept").addEventListener("click", prepareBotSuggestionPreview);
$("#bot-suggestion-dismiss").addEventListener("click", () => { if (currentBotFinding) botLiveCopilot.dismiss(currentBotFinding.id); renderBotFinding(null); });
$("#bot-suggestion-more").addEventListener("click", () => { const detail = $("#bot-suggestion-detail"); detail.hidden = !detail.hidden; });
$("#bot-preview-apply").addEventListener("click", applyBotSuggestion);
$("#bot-preview-cancel").addEventListener("click", () => { currentBotPreview = null; $("#bot-suggestion-preview").hidden = true; });
document.addEventListener("focusout", (event) => { if (event.target.closest("#bot-content")) setTimeout(notifyBotCanvas, 0); });
document.addEventListener("pointerover", (event) => {
  const target = event.target.closest("[data-instance-id]");
  const instanceId = target?.dataset.instanceId;
  if (instanceId && instanceId !== lastBotHover) { lastBotHover = instanceId; showBotWiringExplanation(instanceId); }
});
$("#bot-repair-apply").addEventListener("click", confirmBotRepairPreview);
$("#bot-proposal-apply").addEventListener("click", confirmBotCircuitProposal);
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
if (initialProject.fresh) {
  const starterPath = "examples/070-stm32-timer-pwm.adigun.json";
  $("#example-picker").value = starterPath;
  fetch(starterPath, { headers: { Accept: "application/json" } })
    .then((response) => { if (!response.ok) throw new Error("Starter example unavailable."); return response.text(); })
    .then(async (documentText) => {
      if (state.userInteracted || state.dirty || localStorage.getItem(STORAGE_KEY) || state.project.id !== initialProject.project.id) return;
      const project = parseProject(documentText);
      const analysis = await createSimulationWorkerRun(project).promise;
      if (analysis.state !== "complete") return;
      replaceProject(project, { dirty: false });
      state.selectedInstanceId = "resistor";
      state.activeView = "breadboard";
      state.activeInspector = "component";
      state.lastAnalysis = analysis;
      $("#example-picker").value = starterPath;
      render();
      log("[STARTER] Loaded the tested STM32 timer PWM sample.");
    })
    .catch(() => {});
}


