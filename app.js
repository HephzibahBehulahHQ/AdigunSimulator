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


import { runReleaseCandidateE2E } from "./js/release-candidate-e2e.mjs";
import { createSimulationWorkerRun } from "./js/simulation-worker-client.mjs";
import { getManufacturerPartEvidenceSummary, searchManufacturerParts } from "./js/part-catalogue.mjs";

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
  updateSaveState();
  log("[SAVED] Project stored locally in this browser.");
}

function captureHistory() {
  state.lastAnalysis = null;
  state.history.push(serializeProject(state.project));
  if (state.history.length > 30) state.history.shift();
  state.future = [];
  state.recoveryActive = true;
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
        <span><strong>${escape(record.manufacturerPartNumber)}</strong><small>${escape(record.manufacturer)} Â· ${escape(record.package ?? record.packageEvidence?.package ?? t("packageUnknown"))}</small></span>
      </button></li>`).join("") || `<li class="empty-list">${escape(t("noManufacturerMatches"))}</li>`;
    const record = matching.find((item) => item.id === state.selectedEvidencePartId) ?? matching[0] ?? null;
    state.selectedEvidencePartId = record?.id ?? null;
    const summary = record ? getManufacturerPartEvidenceSummary(record) : null;
    $("#selected-part-type").textContent = record ? `${record.manufacturer} Â· ${record.category}` : t("selectComponent");
    $("#selected-part-name").textContent = record?.manufacturerPartNumber ?? t("noPartSelected");
    if (record && summary) {
      const link = record.datasheet?.url ? `<a href="${escape(record.datasheet.url)}" target="_blank" rel="noopener noreferrer">${escape(t("openDatasheet"))}</a>` : "";
      const blockers = summary.evidenceBlockerCodes.length ? summary.evidenceBlockerCodes.join(", ") : t("none");
      const pins = summary.pinMap.map((pin) => `${pin.pin}: ${pin.name}${pin.electricalType ? ` (${pin.electricalType})` : ""}`).join(" Â· ") || t("notRecorded");
      const ratings = summary.ratings.map((rating) => `${rating.name}: ${rating.minimum ?? ""}${rating.minimum != null && rating.maximum != null ? "â€“" : ""}${rating.maximum ?? ""} ${rating.unit ?? ""}`.trim()).join(" Â· ") || t("notRecorded");
      const footprint = summary.footprintEvidencePath ? `${summary.footprintEvidenceStatus} Â· ${summary.footprintEvidencePath}` : t("notRecorded");
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
      <span class="component-icon">â—‡</span><span><strong>${escape(part.type)}</strong><small>${escape(part.defaultValue)} Â· ${escape(part.simulation)}</small></span>
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
  const body = symbol ?? `<span class="part-body">${component.libraryId === "diode.led-red" ? "â—" : component.libraryId === "power.dc-source" ? "+ âˆ’" : component.libraryId === "ground.signal" ? "âš" : component.libraryId === "passive.resistor" ? "â–¥" : "â–£"}</span>`;
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
    <g class="board-markings"><text x="39" y="58">+</text><text x="39" y="72">âˆ’</text><text x="39" y="236">+</text><text x="39" y="250">âˆ’</text><text x="340" y="158">CENTER TRENCH</text></g>
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
    return `<button type="button" class="breadboard-pin ${netId ? netClass(netId) : ""}${selected}${netSelected}" data-instance-id="${escape(component.instanceId)}" title="${escape(aria)}" aria-label="${escape(aria)}" style="--pin-x:${(point.x / 680) * 100}%;--pin-y:${(point.y / 300) * 100}%"><span class="physical-pin-name" aria-hidden="true">${selected ? `${escape(component.reference)}.${escape(pin)}` : ""}</span><span class="sr-only">${escape(component.reference)}.${escape(pin)} Â· ${escape(part?.type ?? "Component")} Â· ${escape(hole)}</span></button>`;
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
    return (part?.pins ?? []).map((pin) => ({ value: `${component.instanceId}:${pin}`, label: `${component.reference}.${pin} â€” ${part.type}` }));
  });
  pinSelect.innerHTML = options.map((item) => `<option value="${escape(item.value)}">${escape(item.label)}</option>`).join("");
  if (options.some((item) => item.value === previous)) pinSelect.value = previous;
  $("#breadboard-hole-options").innerHTML = holes.map((hole) => `<option value="${hole}"></option>`).join("");
  const report = validateBreadboardTopology(state.project, { getPartPins: (libraryId) => findLibraryPart(libraryId)?.pins ?? [] });
  const stateLabel = report.state === "complete" ? t("breadboardComplete") : report.state === "blocked" ? t("breadboardBlocked") : t("breadboardIncomplete");
  const issue = report.errors[0] ?? report.warnings[0];
  $("#breadboard-status").textContent = `${stateLabel} Â· ${report.mappedPinCount} ${t("breadboardMappedPins")} Â· ${report.jumperCount} ${t("breadboardJumpers")}${issue ? ` Â· ${issue.message}` : ""}${state.breadboardPlacementMode ? ` Â· ${t("breadboardPlacementActive")}` : ""}`;
  $("#breadboard-placement-mode").setAttribute("aria-pressed", String(state.breadboardPlacementMode));
  $("#breadboard-placement-list").innerHTML = Object.entries(config?.pinHoles ?? {}).map(([endpoint, hole]) => {
    const component = state.project.components.find((item) => endpoint.startsWith(`${item.instanceId}:`));
    return `<li><span>${escape(component?.reference ?? endpoint)} â†’ ${escape(hole)}</span><button type="button" data-bb-unassign="${escape(endpoint)}" aria-label="${escape(t("breadboardRemovePlacement"))} ${escape(endpoint)}">Ã—</button></li>`;
  }).join("") || `<li>${escape(t("breadboardNoPlacements"))}</li>`;
  $("#breadboard-jumper-list").innerHTML = (config?.jumpers ?? []).map((jumper, index) => `<li><span>${escape(jumper.from)} â†” ${escape(jumper.to)}</span><button type="button" data-bb-remove-jumper="${index}" aria-label="${escape(t("breadboardRemoveJumper"))} ${escape(jumper.from)} ${escape(jumper.to)}">Ã—</button></li>`).join("") || `<li>${escape(t("breadboardNoJumpers"))}</li>`;
  const syncPreview = state.breadboardSyncPreview;
  const stale = Boolean(syncPreview && syncPreview.fingerprint !== breadboardSyncFingerprint(state.project));
  $("#breadboard-sync-summary").textContent = !syncPreview
    ? t("breadboardSyncDefault")
    : stale ? t("breadboardSyncStale")
    : syncPreview.state !== "complete" ? t("breadboardSyncBlocked")
    : syncPreview.changed ? `${t("breadboardSyncDiff")} ${syncPreview.mergedNetIds.length} ${t("breadboardSyncMerged")} Â· ${syncPreview.splitNetIds.length} ${t("breadboardSyncSplit")}`
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
  const label = state.activeView === "breadboard" ? (hasPhysicalMap ? t("breadboardPhysicalMapLabel") : t("breadboardNoPhysicalMapLabel")) : state.activeView === "schematic" ? "Shared project net layout â€” not a standards-complete schematic editor." : (hasPcbData ? t("pcbStoredLayoutPreview") : t("pcbNoFootprintData"));
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
  const centroid = pcbPads.length ? [pcbPads.reduce((sum, item) => sum + item.xMm, 0) / pcbPads.length, pcbPads.reduce((sum, item) => sum + item.yMm, 0) / pcbPads.length] : null;
  $("#pcb-footprint-details").classList.toggle("hidden", state.activeView !== "pcb" || !pcbPart);
  $("#pcb-footprint-package").textContent = pcbPart?.footprint ?? "â€”";
  $("#pcb-footprint-position").textContent = centroid ? centroid.map((value) => value.toFixed(2)).join(", ") : "â€”";
  $("#pcb-footprint-pad-count").textContent = String(pcbPads.length);
  $("#pcb-footprint-route-count").textContent = String(pcbRoutes.length);
  $("#component-form").classList.toggle("hidden", state.activeInspector === "project");
  $("#project-form").classList.toggle("hidden", state.activeInspector !== "project");
  $("#simulation-form").classList.remove("hidden");
  $("#workspace-notes").textContent = state.lastAnalysis?.message ?? "Choose a supported example to see its tested model limits.";
  $("#project-name").value = state.project.metadata.name;
  $("#project-locale").value = state.project.metadata.locale;
  $("#component-form button").disabled = !component;
  $("#remove-component").disabled = !component;
  renderConnections();
  renderBreadboardControls();
}

function renderConnections() {
  const options = state.project.components.flatMap((component) => {
    const part = findLibraryPart(component.libraryId);
    return (part?.pins ?? []).map((pin) => ({ value: `${component.instanceId}:${pin}`, label: `${component.reference}.${pin} â€” ${part.type}` }));
  });
  for (const selector of ["#connection-first", "#connection-second"]) {
    const select = $(selector);
    const previous = select.value;
    select.innerHTML = options.map((item) => `<option value="${escape(item.value)}">${escape(item.label)}</option>`).join("");
    if (options.some((item) => item.value === previous)) select.value = previous;
  }
  const probeSelect = $("#digital-probe-nets");
  const priorProbes = new Set([...probeSelect.selectedOptions].map((option) => option.value));
  const configuredProbes = new Set(state.project.digitalEventSimulation?.probeNets ?? []);
  probeSelect.innerHTML = state.project.nets.map((net) => `<option value="${escape(net.id)}">${escape(net.id)}</option>`).join("");
  [...probeSelect.options].forEach((option) => { option.selected = priorProbes.has(option.value) || (!priorProbes.size && configuredProbes.has(option.value)); });
  if (!["digital-events-json", "digital-initial-states"].includes(document.activeElement?.id)) {
    $("#digital-stop-ns").value = String(state.project.digitalEventSimulation?.stopTimeNs ?? 1000);
    $("#digital-events-json").value = JSON.stringify(state.project.digitalEventSimulation?.events ?? [], null, 2);
    $("#digital-initial-states").value = JSON.stringify(state.project.digitalEventSimulation?.initialStates ?? {}, null, 2);
  }
  $("#net-list").innerHTML = state.project.nets.map((net) => `
    <li><button type="button" class="net-select ${net.id === state.selectedNetId ? "active" : ""}" data-net-id="${escape(net.id)}" aria-pressed="${net.id === state.selectedNetId}">${escape(net.id)}</button><ul>${net.endpoints.map((item) => `<li>${escape(item)} <button type="button" class="disconnect-pin" data-endpoint="${escape(item)}" aria-label="${escape(t("disconnect"))} ${escape(item)}">Ã—</button></li>`).join("")}</ul></li>`).join("") || `<li>${escape(t("noConnectedNets"))}</li>`;
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

function renderResultDashboard(analysis) {
  if (!analysis || analysis.state !== "complete") return "";
  const result = analysis.result ?? {};
  const metrics = [];
  let waveform = "";
  if (result.kind === "linear-ac-sweep") {
    metrics.push([t("acPoints"), String(result.samples.length)], [t("acOutputNet"), result.outputNet ?? t("notRecorded")], [t("acStartHz"), `${result.startHz}â€“${result.stopHz} Hz`]);
    const rows = result.samples.map((sample) => `<tr><td>${Number(sample.frequencyHz.toPrecision(6))}</td><td>${sample.output ? Number(sample.output.magnitudeV.toPrecision(6)) : "â€”"}</td><td>${sample.output ? `${Number(sample.output.phaseDegrees.toPrecision(6))}Â°` : "â€”"}</td></tr>`).join("");
    waveform = `<figure class="result-waveform"><figcaption>${escape(t("analysisLinearAcSweep"))}</figcaption><table class="result-table linear-ac-table"><thead><tr><th>${escape(t("acFrequencyHz"))}</th><th>${escape(t("acMagnitude"))}</th><th>${escape(t("acPhase"))}</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "digital-event-simulation") {
    const rows = Object.entries(result.trace).flatMap(([net, points]) => points.map((point) => ({ net, ...point }))).sort((a, b) => a.timeNs - b.timeNs || a.net.localeCompare(b.net));
    metrics.push([t("digitalStopTime"), `${result.stopTimeNs} ns`], [t("digitalEventCount"), String(result.processedEvents)], [t("digitalProbeNets"), result.probeNets.join(", ")]);
    waveform = `<figure class="result-waveform"><figcaption>${escape(t("analysisDigitalEvents"))}</figcaption><table class="result-table"><thead><tr><th>${escape(t("digitalEventTimeNs"))}</th><th>${escape(t("digitalProbeNets"))}</th><th>${escape(t("digitalEventLevel"))}</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.timeNs}</td><td>${escape(row.net)}</td><td>${row.high ? "1 Â· HIGH" : "0 Â· LOW"}</td></tr>`).join("")}</tbody></table><p>${escape(analysis.message)}</p></figure>`;
  } else if (result.kind === "release-candidate-e2e") {
    metrics.push(["Fixtures",String(result.fixtureCount)],["PCB DRC",result.pcbDrc],["BOT project edit",result.botMutation?"Changed":"Read-only"],["Passed gates",String(Object.values(result.checks).filter(Boolean).length)]);
    const rows=Object.entries(result.checks).map(([name,passed])=>'<tr><td>'+escape(name)+'</td><td>'+(passed?"PASS":"FAIL")+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Release candidate Â· build through export</figcaption><table class="result-table"><thead><tr><th>Gate</th><th>Result</th></tr></thead><tbody>'+rows+'</tbody></table><p>BOT cites local project/library fields; PCB export is illustrative, not manufacturing approval.</p></figure>';
  } else if (result.kind === "offline-recovery-scenario") {
    metrics.push(["Draft restored",result.draftSaved?"Yes":"No"],["Storage fallback",result.storageFallbackAvailable?"Native export valid":"Unavailable"],["Recovered edit",result.editedValue],["Silent loss",result.silentLoss?"Detected":"None"]);
    waveform='<figure class="result-waveform"><figcaption>Local offline recovery Â· simulated storage interruption</figcaption><p>Unsaved edit restored from a versioned draft. When browser storage is unavailable, use <strong>File â†’ Export</strong> before closing.</p><p>CI uses an in-memory storage mock; real browser quota and crash behavior are outside this test.</p></figure>';
  } else if (result.kind === "four-language-ui-sweep") {
    metrics.push(["Locales",result.locales.join(" Â· ")],["Declared interface keys",String(result.declaredKeyCount)],["Missing translations",String(result.missingTranslations)],["Rendered pixel check",result.renderedPixelCheck?"Measured":"Not claimed"]);
    waveform='<figure class="result-waveform"><figcaption>Four-language UI source audit</figcaption><p>Translation coverage: '+(result.missingTranslations===0?"complete":"incomplete")+'. Static accessibility and responsive overflow contracts run in the automated catalogue test.</p><p>No rendered pixel measurement is claimed by this source audit.</p></figure>';
  } else if (result.kind === "bot-12v-led-circuit-proposal") {
    metrics.push(["Supply assumption",result.proposal.source],["Series resistor",result.proposal.resistor],["LED Vf assumption",result.proposal.ledVf],["Estimated current",(result.proposal.estimatedCurrentA*1000).toFixed(2)+" mA"],["Resistor dissipation",result.proposal.resistorDissipationW.toFixed(3)+" W"],["Preview applied",result.applied?"Yes":"No Â· confirmation required"]);
    waveform='<figure class="result-waveform"><figcaption>Adigun BOT Â· 12 V LED proposal</figcaption><p>Candidate passes schema validation and supported LED analysis. The original project remains unchanged until confirmation.</p><p>'+escape(result.warning)+'</p></figure>';
  } else if (result.kind === "bot-floating-node-repair-preview") {
    metrics.push(["Diagnosis", result.diagnosis.netId+" Â· "+result.diagnosis.reference], ["Proposed part", result.proposal.reference+" Â· "+result.proposal.value], ["Validation", result.validationValid?"Candidate passes project validation":"Candidate blocked"], ["Applied", result.applied?"Yes":"No Â· confirmation required"]);
    waveform='<figure class="result-waveform"><figcaption>Adigun BOT Â· uncommitted repair preview</figcaption><p>Connect '+escape(result.diagnosis.netId)+' to GND through a proposed '+escape(result.proposal.value)+' resistor. No project change has been applied.</p><p>'+escape(result.warning)+'</p></figure>';
  } else if (result.kind === "bot-grounded-component-explanation") {
    metrics.push(["Component", result.reference], ["Known project/library fields", String(result.known.length)], ["Unknown library fields", String(result.unknown.length)]);
    const rows=result.known.map(item=>'<tr><td>'+escape(item.field)+'</td><td>'+escape(item.value)+'</td><td>'+escape(item.source)+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Adigun BOT Â· source-grounded component facts</figcaption><table class="result-table"><thead><tr><th>Field</th><th>Recorded value</th><th>Source</th></tr></thead><tbody>'+rows+'</tbody></table><p>Unknown: '+result.unknown.map(escape).join(" ")+'</p></figure>';
  } else if (result.kind === "bom-cost-placeholder") {
    metrics.push(["BOM lines", String(result.rowCount)], ["Components", String(result.itemCount)], ["Cost total", result.totalCost === null ? "Unavailable Â· no complete sourced prices" : result.currency + " " + result.totalCost.toFixed(2)]);
    const rows=result.rows.map(item=>'<tr><td>'+escape(item.references)+'</td><td>'+item.quantity+'</td><td>'+escape(item.libraryId)+'</td><td>'+escape(item.description)+'</td><td>'+escape(item.value)+'</td><td>'+(item.unitCost === null ? "â€”" : escape(item.currency + " " + item.unitCost.toFixed(2)))+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Verified-field BOM Â· prices blank without dated source evidence</figcaption><table class="result-table"><thead><tr><th>References</th><th>Qty</th><th>Library part</th><th>Description</th><th>Value</th><th>Unit cost</th></tr></thead><tbody>'+rows+'</tbody></table><p>Export BOM CSV from File. Missing prices are unavailable, not zero.</p></figure>';
  } else if (result.kind === "pcb-trace-width-advisory") {
    metrics.push('<div class="result-metric"><span>Trace cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Model</span><strong>Legacy empirical estimate</strong></div>','<div class="result-metric"><span>Standards status</span><strong>Advisory Â· not compliance</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.currentA+' A</td><td>'+item.copperThicknessUm+' Âµm</td><td>'+escape(item.layerType)+'</td><td>'+item.temperatureRiseC+' Â°C</td><td>'+item.widthMm.toFixed(3)+' mm</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Trace-width estimate Â· IPC-2221 legacy equation</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Current</th><th>Copper</th><th>Layer</th><th>Rise</th><th>Estimated width</th></tr></thead><tbody>'+rows+'</tbody></table><p>'+escape(result.standardLimitation)+'</p></figure>';
  } else if (result.kind === "op-amp-gain-cases") {
    metrics.push('<div class="result-metric"><span>Gain cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Inverting</span><strong>âˆ’Rf / Rin</strong></div>','<div class="result-metric"><span>Non-inverting</span><strong>1 + Rf / Rg</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+escape(item.configuration)+'</td><td>'+(item.inputResistanceOhms??"â€”")+' Î©</td><td>'+item.feedbackResistanceOhms+' Î©</td><td>'+(item.groundResistanceOhms??"â€”")+' Î©</td><td>'+item.gain.toFixed(3)+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Ideal op-amp closed-loop gain from resistor ratios</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Topology</th><th>Rin</th><th>Rf</th><th>Rg</th><th>Gain</th></tr></thead><tbody>'+rows+'</tbody></table><p>Ideal ratios only; amplifier bandwidth, output swing, stability, and supply rails are not modeled.</p></figure>';
  } else if (result.kind === "rc-timing-cases") {
    metrics.push('<div class="result-metric"><span>Calculation cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Results</span><strong>Ï„ and cutoff frequency</strong></div>','<div class="result-metric"><span>Prefix handling</span><strong>Î© to MÎ© Â· pF to F</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.resistanceValue+' '+escape(item.resistanceUnit)+'</td><td>'+item.capacitanceValue+' '+escape(item.capacitanceUnit)+'</td><td>'+(item.timeConstantSeconds*1000).toPrecision(5)+' ms</td><td>'+item.cutoffFrequencyHz.toPrecision(5)+' Hz</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>RC timing Â· time constant and ideal cutoff frequency</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Resistance</th><th>Capacitance</th><th>Time constant</th><th>Cutoff</th></tr></thead><tbody>'+rows+'</tbody></table><p>First-order ideal model; parasitics and loading are not included.</p></figure>';
  } else if (result.kind === "voltage-divider-cases") {
    metrics.push('<div class="result-metric"><span>Calculation cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Loading warnings</span><strong>'+result.loadingWarningCount+'</strong></div>','<div class="result-metric"><span>Model</span><strong>Ideal resistors Â· 5% default limit</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.inputVoltageV+' V</td><td>'+(item.resistanceTopOhms/1000)+' kÎ© / '+(item.resistanceBottomOhms/1000)+' kÎ©</td><td>'+item.unloadedOutputV.toFixed(3)+' V / '+item.loadedOutputV.toFixed(3)+' V</td><td>'+item.loadingChangePercent.toFixed(2)+'% '+(item.warnings.length?"Â· WARNING":"") +'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Divider output Â· unloaded and loaded values</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Input</th><th>R1 / R2</th><th>Unloaded / loaded Vout</th><th>Load change</th></tr></thead><tbody>'+rows+'</tbody></table><p>Ideal resistive model only; downstream input impedance and source tolerance require review.</p></figure>';
  } else if (result.kind === "led-series-resistor-cases") {
    metrics.push('<div class="result-metric"><span>Calculation cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Power warnings</span><strong>'+result.powerWarningCount+'</strong></div>','<div class="result-metric"><span>Selection rule</span><strong>Next E12 value â‰¥ ideal minimum</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.supplyVoltageV+' V âˆ’ '+item.ledForwardVoltageV+' V</td><td>'+item.requiredResistanceOhms.toFixed(1)+' Î© â†’ '+item.recommendedResistanceOhms+' Î©</td><td>'+item.estimatedCurrentmA.toFixed(2)+' mA</td><td>'+item.resistorDissipationW.toFixed(3)+' W'+(item.warnings.length?" Â· WARNING":"")+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>LED resistor estimates Â· voltage, E12 value, current, dissipation</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Available voltage</th><th>Required â†’ recommended</th><th>Estimated current</th><th>Resistor power</th></tr></thead><tbody>'+rows+'</tbody></table><p>Ideal estimates only; select component ratings with thermal derating and verify the actual LED datasheet.</p></figure>';
  } else if (result.kind === "resistor-color-code-cases") {
    metrics.push('<div class="result-metric"><span>Valid readings</span><strong>'+result.validCount+'</strong></div>','<div class="result-metric"><span>Rejected combinations</span><strong>'+result.rejectedCount+'</strong></div>','<div class="result-metric"><span>Supported formats</span><strong>4-band Â· 5-band</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.bands.join(" Â· ")) +'</td><td>'+(item.reading.valid?escape(item.reading.formattedResistance)+" Â±"+item.reading.tolerancePercent+"%":"Rejected: "+escape(item.reading.error))+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Resistor colour code Â· nominal value and tolerance</figcaption><table class="result-table"><thead><tr><th>Color bands</th><th>Reading</th></tr></thead><tbody>'+rows+'</tbody></table></figure>';
  } else if (result.kind === "si-unit-conversion-cases") {
    metrics.push('<div class="result-metric"><span>Conversion cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Method</span><strong>SI scale factors</strong></div>','<div class="result-metric"><span>Rounding</span><strong>Significant digits</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.category)+'</td><td>'+item.value+' '+escape(item.fromUnit)+'</td><td>'+item.convertedValue+' '+escape(item.toUnit)+'</td><td>'+item.precision+' significant digits</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Engineering unit conversions Â· resistance, power, length</figcaption><table class="result-table"><thead><tr><th>Category</th><th>Input</th><th>Converted</th><th>Rounding</th></tr></thead><tbody>'+rows+'</tbody></table></figure>';
  } else if (result.kind === "pin-incompatible-substitution-preview") {
    metrics.push('<div class="result-metric"><span>Substitution</span><strong>'+(result.substitutionBlocked?"Blocked Â· pin roles differ":"Preview passed")+'</strong></div>','<div class="result-metric"><span>Original</span><strong>'+escape(result.originalLibraryId)+' Â· retained</strong></div>','<div class="result-metric"><span>Preview</span><strong>'+escape(result.candidateLibraryId)+' Â· canceled</strong></div>');
    const rows=result.unmappedUsedPins.map(pin=>'<tr><td>'+escape(result.reference)+'.'+escape(pin)+'</td><td>'+escape(result.candidateLibraryId)+'</td><td>No matching pin name</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Candidate pin map Â· cancellation preserved the original</figcaption><table class="result-table"><thead><tr><th>Used source pin</th><th>Candidate</th><th>Preview</th></tr></thead><tbody>'+rows+'</tbody></table><p>A matching 8-pin count is not electrical compatibility. Preview canceled; original project unchanged.</p></figure>';
  } else if (result.kind === "missing-footprint-resolution-report") {
    metrics.push('<div class="result-metric"><span>PCB update</span><strong>Blocked pending footprint review</strong></div>','<div class="result-metric"><span>Missing mappings</span><strong>'+result.missingFootprintCount+'</strong></div>','<div class="result-metric"><span>Automatic substitution</span><strong>No</strong></div>');
    const rows=result.missingFootprints.map(item=>'<tr><td>'+escape(item.reference)+'</td><td>'+escape(item.part)+'</td><td>'+escape(item.reason)+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Required report Â· missing PCB footprint mappings</figcaption><table class="result-table"><thead><tr><th>Reference</th><th>Library part</th><th>Resolution status</th></tr></thead><tbody>'+rows+'</tbody></table><ol>'+result.requiredReport.resolutionOptions.map(option=>'<li>'+escape(option)+'</li>').join("")+'</ol></figure>';
  } else if (result.kind === "unsupported-breadboard-package-reconciliation") {
    metrics.push('<div class="result-metric"><span>Package</span><strong>'+escape(result.reference)+' Â· concept</strong></div>','<div class="result-metric"><span>Breadboard placement</span><strong>Excluded</strong></div>','<div class="result-metric"><span>Reconciliation item</span><strong>'+escape(result.breadboardReconciliation.reason)+'</strong></div>');
    waveform='<figure class="result-waveform"><figcaption>Unsupported package Â· view projection check</figcaption><table class="result-table"><thead><tr><th>View</th><th>Projection</th><th>Result</th></tr></thead><tbody><tr><td>Breadboard</td><td>Reconciliation item</td><td>No placement</td></tr><tr><td>Schematic</td><td>Supported concept</td><td>Visible</td></tr><tr><td>PCB</td><td>Illustrative concept</td><td>'+(result.pcbPlaced?"Visible Â· not manufacturing qualified":"Reconciliation needed")+'</td></tr></tbody></table></figure>';
  } else if (result.kind === "three-view-led-sync-history") {
    metrics.push('<div class="result-metric"><span>Component edit</span><strong>'+escape(result.reference)+" Â· "+escape(result.originalValue)+" â†’ "+escape(result.editedValue)+'</strong></div>','<div class="result-metric"><span>Views updated</span><strong>'+result.availableViews.length+'</strong></div>','<div class="result-metric"><span>History</span><strong>Undo + redo passed</strong></div>');
    waveform='<figure class="result-waveform"><figcaption>One canonical LED project Â· shared view data and history snapshots</figcaption><table class="result-table"><thead><tr><th>Projection</th><th>Component</th><th>Edit</th><th>History check</th></tr></thead><tbody>'+result.availableViews.map(view=>'<tr><td>'+escape(view)+'</td><td>'+escape(result.reference)+'</td><td>'+(result.reconciliationByView[view]?"Reconciliation needed":"Shared edit Â· "+escape(result.editedValue))+'</td><td>'+(result.reconciliationByView[view]?result.reconciliationByView[view]+" items; no placement":"Shared identity preserved")+"</td></tr>").join("")+'<tr><td>Undo</td><td>'+escape(result.reference)+'</td><td>'+escape(result.undoValue)+'</td><td>Original snapshot restored</td></tr><tr><td>Redo</td><td>'+escape(result.reference)+'</td><td>'+escape(result.redoValue)+'</td><td>Edited snapshot restored</td></tr></tbody></table></figure>';
  } else if (result.kind === "schematic-pcb-netlist-pad-sync") {
    const rows=result.netPadMap.map(net=>`<tr><td>${escape(net.netId)}</td><td>${escape(net.schematicEndpoints.join(", "))}</td><td>${escape(net.pcbPads.join(", "))}</td><td>${net.pcbPads.length===net.schematicEndpoints.length?"Preserved":"Missing"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Components / nets</span><strong>${result.componentCount} / ${result.netCount}</strong></div>`,`<div class="result-metric"><span>Pin mapping</span><strong>${result.mappedPinCount} pins</strong></div>`,`<div class="result-metric"><span>Footprint status</span><strong>Illustrative Â· unverified</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Schematic-to-PCB sync Â· net ID and pad endpoint audit</figcaption><table class="result-table"><thead><tr><th>Net ID</th><th>Schematic pins</th><th>Illustrative PCB pads</th><th>Endpoints</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "breadboard-schematic-structural-sync") {
    const rows=result.netIds.map(id=>{const net=result.breadboard.nets.find(item=>item.id===id);return `<tr><td>${escape(id)}</td><td>${escape(net.endpoints.join(", "))}</td><td>${escape(result.schematic.nets.find(item=>item.id===id)?.endpoints.join(", ")??"Missing")}</td><td>${result.schematic.nets.some(item=>item.id===id)?"Same ID":"Missing"}</td></tr>`;}).join("");
    metrics.push(`<div class="result-metric"><span>Components</span><strong>${result.componentCount}</strong></div>`,`<div class="result-metric"><span>Shared nets</span><strong>${result.netCount}</strong></div>`,`<div class="result-metric"><span>Structural match</span><strong>${result.structurallyEqual?"Yes":"No"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Breadboard-to-schematic sync Â· canonical net identity comparison</figcaption><table class="result-table"><thead><tr><th>Net ID</th><th>Breadboard endpoints</th><th>Schematic endpoints</th><th>Identity</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "machine-fault-latched-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${frame.activeFaults.join(", ")||"â€”"}</td><td>${frame.latchedFaults.join(", ")||"â€”"}</td><td>${frame.acknowledgedFaults.join(", ")||"â€”"}</td><td>${frame.faultLampOn?"ON":"OFF"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Steps</span><strong>${result.frameCount}</strong></div>`,`<div class="result-metric"><span>Final latched faults</span><strong>${result.frames.at(-1).latchedFaults.join(", ")||"None"}</strong></div>`,`<div class="result-metric"><span>Clear + acknowledge</span><strong>Both required</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Machine fault annunciator Â· latch and acknowledge table</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Action</th><th>Active</th><th>Latched</th><th>Acknowledged</th><th>Fault lamp</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "warehouse-beacon-state-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.state)}</td><td>${frame.greenOn?"ON":"â€”"}</td><td>${frame.redOn?"ON":"â€”"}</td><td>${frame.amberOn?"ON":"â€”"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Samples / transitions</span><strong>${result.sampleCount} / ${result.transitionCount}</strong></div>`,`<div class="result-metric"><span>One status per sample</span><strong>${result.oneStatusPerFrame?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>Fault indicator</span><strong>Amber + buzzer</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Warehouse beacon Â· occupancy status sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>State</th><th>Green</th><th>Red</th><th>Amber</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "access-strike-allowlist-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.atMs} ms</td><td>${escape(frame.credentialId)}</td><td>${escape(frame.decision)}</td><td>${frame.strikeUnlocked?"UNLOCK":"LOCKED"}</td><td>${escape(frame.reason)}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Grants / denials</span><strong>${result.grantCount} / ${result.denyCount}</strong></div>`,`<div class="result-metric"><span>Unlock interval</span><strong>${result.unlockDurationMs} ms</strong></div>`,`<div class="result-metric"><span>Audit events</span><strong>${result.mockAuditEvents.length} Â· mock</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Access-control mock Â· grant/deny and strike timeline</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Time</th><th>Mock credential</th><th>Decision</th><th>Strike</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "fire-alarm-zone-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.zoneId)}</td><td>${escape(frame.condition)}</td><td>${frame.fireAlarm?"ALARM":"â€”"}</td><td>${frame.trouble?escape(frame.troubleType):"â€”"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Alarm samples</span><strong>${result.alarmSamples}</strong></div>`,`<div class="result-metric"><span>Open / short faults</span><strong>${result.openFaults} / ${result.shortFaults}</strong></div>`,`<div class="result-metric"><span>Fire buzzer</span><strong>Alarm only</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Fire-alarm zone Â· distinct alarm and trouble table</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Zone</th><th>Input</th><th>Alarm</th><th>Trouble</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "elevator-fifo-call-queue") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}${frame.floor===null?"":" "+frame.floor}</td><td>${escape(frame.outcome)}</td><td>${frame.activeTarget??"â€”"}</td><td>${frame.queue.join(", ")||"â€”"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Floor count</span><strong>${result.floorCount}</strong></div>`,`<div class="result-metric"><span>Targets dispatched</span><strong>${result.dispatchedTargets.join(" â†’ ")||"None"}</strong></div>`,`<div class="result-metric"><span>Duplicate calls ignored</span><strong>${result.duplicateCallsIgnored}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Elevator scheduler Â· FIFO request state table</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Event</th><th>Outcome</th><th>Next target</th><th>Queue</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "garage-door-limit-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${escape(frame.mode)}</td><td>${frame.openLimit?"Active":"â€”"}</td><td>${frame.closedLimit?"Active":"â€”"}</td><td>${frame.conflictRejected?"Rejected":"â€”"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Limit stops</span><strong>${result.frames.filter(frame=>frame.action.endsWith("-limit")&&frame.mode==="stopped").length}</strong></div>`,`<div class="result-metric"><span>Conflicts rejected</span><strong>${result.conflictingRequestsRejected}</strong></div>`,`<div class="result-metric"><span>Direction overlap</span><strong>${result.noDriveOverlap?"None":"Detected"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Garage door Â· synthetic limit and direction sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Event</th><th>Mode</th><th>Open limit</th><th>Closed limit</th><th>Decision</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "smart-irrigation-decision-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.moisturePct===null?"Fault":frame.moisturePct+"%"}</td><td>${frame.permitted?"Yes":"No"}</td><td>${frame.dry?"Yes":"No"}</td><td>${frame.waterCommand}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Dry threshold</span><strong>${result.dryThresholdPct}%</strong></div>`,`<div class="result-metric"><span>Water commands</span><strong>${result.wateringSamples}/${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Sensor fault policy</span><strong>Fail off</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Smart irrigation Â· moisture, permission, and fault checks</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Moisture</th><th>Permitted</th><th>Dry</th><th>Pump/valve</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "night-light-lux-threshold") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.lux} lux</td><td>${escape(frame.condition)}</td><td>${frame.ledOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Darkness threshold</span><strong>${result.thresholdLux} lux</strong></div>`,`<div class="result-metric"><span>LED-on samples</span><strong>${result.ledOnSamples}/${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Threshold behavior</span><strong>Below = ON</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Automatic night light Â· synthetic day/night lux samples</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Illuminance</th><th>Condition</th><th>LED command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "pwm-fan-duty-curve") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.tempC} Â°C</td><td>${frame.dutyPercent}%</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Curve knots</span><strong>${result.knotCount}</strong></div>`,`<div class="result-metric"><span>Mapped samples</span><strong>${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Method</span><strong>Linear / clamped</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>PWM fan controller Â· temperature-to-duty mapping</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Temperature</th><th>Duty command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "fan-thermostat-hysteresis") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.tempC} Â°C</td><td>${frame.fanOn?"ON":"OFF"}</td><td>${escape(frame.transition)}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Fan ON threshold</span><strong>${result.fanOnC} Â°C</strong></div>`,`<div class="result-metric"><span>Fan OFF threshold</span><strong>${result.fanOffC} Â°C</strong></div>`,`<div class="result-metric"><span>Fan-on samples</span><strong>${result.fanOnSamples}/${result.sampleCount}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Fan thermostat Â· synthetic temperature sweep</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Temperature</th><th>Fan command</th><th>Transition</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "water-leak-alarm-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.wet?"WET":"Dry"}</td><td>${frame.alarmOn?"ALARM":"Clear"}</td><td>${frame.relayCommand}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Wet episodes</span><strong>${result.alarmEpisodes}</strong></div>`,`<div class="result-metric"><span>Dry recovery</span><strong>${result.dryRecoveryObserved?"Observed":"Not observed"}</strong></div>`,`<div class="result-metric"><span>Sample count</span><strong>${result.sampleCount}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Water-leak alarm Â· synthetic wet/dry sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Sensor</th><th>Alarm</th><th>Relay command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "latched-temperature-alarm") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.tempC} Â°C</td><td>${frame.resetRequested?"Yes":"No"}</td><td>${frame.resetRejected?"Rejected":"â€”"}</td><td>${frame.alarmLatched?"LATCHED":"Clear"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Threshold</span><strong>${result.thresholdC} Â°C</strong></div>`,`<div class="result-metric"><span>Alarm trips</span><strong>${result.tripCount}</strong></div>`,`<div class="result-metric"><span>Hot reset rejected</span><strong>${result.resetRejected?"Yes":"No"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Temperature alarm Â· synthetic sensor samples</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Temperature</th><th>Reset</th><th>Decision</th><th>Alarm</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "door-interlock-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${frame.guardClosed?"Closed":"OPEN"}</td><td>${frame.faultLatched?"YES":"No"}</td><td>${frame.loadEnabled?"ON":"OFF"}</td><td>${frame.resetRejected?"Rejected":"â€”"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Load off while guard open</span><strong>${result.loadAlwaysDisabledWhenOpen?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>Reset while open</span><strong>${result.resetRejectedWhenOpen?"Rejected":"None"}</strong></div>`,`<div class="result-metric"><span>Safety-rated model</span><strong>No</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Door interlock Â· educational guard-state sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Action</th><th>Guard</th><th>Latch</th><th>Load command</th><th>Reset</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "emergency-stop-latched-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${frame.estopHealthy?"Healthy":"TRIPPED"}</td><td>${frame.latched?"YES":"No"}</td><td>${frame.loadEnabled?"ON":"OFF"}</td><td>${frame.resetRejected?"Rejected":"â€”"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Reset while tripped</span><strong>${result.unsafeResetRejected?"Rejected":"None"}</strong></div>`,`<div class="result-metric"><span>Separate start required</span><strong>${result.restartRequiresNewStart?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>Safety-rated model</span><strong>No</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>E-stop latch Â· educational logical sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Action</th><th>E-stop input</th><th>Latch</th><th>Load command</th><th>Reset</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "forward-reverse-interlock-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.request)}</td><td>${escape(frame.direction)}</td><td>${frame.forwardEnergized?"ON":"OFF"}</td><td>${frame.reverseEnergized?"ON":"OFF"}</td><td>${frame.conflictRejected?"Rejected":"Accepted"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Requests</span><strong>${result.frameCount}</strong></div>`,`<div class="result-metric"><span>Conflicts rejected</span><strong>${result.conflictRequestsRejected}</strong></div>`,`<div class="result-metric"><span>Outputs overlap</span><strong>${result.noOverlap?"No":"Yes"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Forward/reverse interlock Â· logical command sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Request</th><th>State</th><th>Forward</th><th>Reverse</th><th>Decision</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "star-delta-transition-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.atMs} ms</td><td>${escape(frame.command)}</td><td>${escape(frame.mode)}</td><td>${frame.starEnergized?"ON":"OFF"}</td><td>${frame.deltaEnergized?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Star interval</span><strong>${result.starTimeMs} ms</strong></div>`,`<div class="result-metric"><span>Dead time</span><strong>${result.deadTimeMs} ms</strong></div>`,`<div class="result-metric"><span>Output overlap</span><strong>${result.noOverlap?"None":"Detected"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Star-delta starter Â· logical interlock transition table</figcaption><table class="result-table"><thead><tr><th>Time</th><th>Event</th><th>Mode</th><th>Star output</th><th>Delta output</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "conveyor-edge-counter") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.photoeye?"Blocked":"Clear"}</td><td>${frame.risingEdge?"Yes":"No"}</td><td>${frame.count}</td><td>${frame.motorRunning?"RUN":"STOP"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Target</span><strong>${result.targetCount}</strong></div>`,`<div class="result-metric"><span>Count</span><strong>${result.finalCount}</strong></div>`,`<div class="result-metric"><span>Stop event</span><strong>${result.stoppedAtEvent??"Not reached"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Conveyor target counter Â· synthetic photoeye sequence</figcaption><table class="result-table"><thead><tr><th>Event</th><th>Photoeye</th><th>Rising edge</th><th>Count</th><th>Motor command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "tank-level-hysteresis") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.levelPct}%</td><td>${frame.pumpOn?"ON":"OFF"}</td><td>${escape(frame.transition)}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Low threshold</span><strong>${result.lowLevelPct}%</strong></div>`,`<div class="result-metric"><span>High threshold</span><strong>${result.highLevelPct}%</strong></div>`,`<div class="result-metric"><span>Pump-on samples</span><strong>${result.pumpOnSamples}/${result.sampleCount}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Tank-level hysteresis Â· synthetic PLC state sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Level</th><th>Pump command</th><th>State</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "traffic-light-fsm-sequence") {
    const rows=result.phases.map(phase=>`<tr><td>${phase.cycle}</td><td>${escape(phase.name)}</td><td>${phase.northSouth.toUpperCase()}</td><td>${phase.eastWest.toUpperCase()}</td><td>${phase.startTimeS}â€“${phase.endTimeS} s</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Cycles</span><strong>${result.cycleCount}</strong></div>`,`<div class="result-metric"><span>Total sequence</span><strong>${result.totalDurationS} s</strong></div>`,`<div class="result-metric"><span>Opposing green</span><strong>No</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Timed traffic-light FSM Â· state table</figcaption><table class="result-table"><thead><tr><th>Cycle</th><th>Phase</th><th>Northâ€“South</th><th>Eastâ€“West</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "plc-start-stop-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.startPressed?"Pressed":"Released"}</td><td>${frame.stopHealthy?"Closed":"Open"}</td><td>${frame.emergencyStopHealthy?"Healthy":"TRIPPED"}</td><td>${frame.contactorEnergized?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Control steps</span><strong>${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Seal-in retained</span><strong>${result.sealInRetained?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>E-stop opens output</span><strong>${result.emergencyStopDropsOutput?"Yes":"No"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>PLC start/stop motor control Â· Boolean concept sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Start</th><th>Stop</th><th>E-stop</th><th>Contactor</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "thermal-warning-boundary") {
    metrics.push(`<div class="result-metric"><span>${result.reference} dissipation</span><strong>${(result.resistorDissipationW*1000).toFixed(1)} mW</strong></div>`,`<div class="result-metric"><span>Entered rating / derated limit</span><strong>${result.ratedPowerW} W / ${(result.deratedLimitW*1000).toFixed(1)} mW</strong></div>`,`<div class="result-metric"><span>Suggested minimum rating</span><strong>â‰¥ ${result.recommendedMinimumRatingW.toFixed(2)} W</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Electrical loading advisory Â· thermal model unavailable</figcaption><p class="model-limit">Temperature rise and thermal safety are not calculated. Verify datasheet ratings and real operating conditions.</p></figure>`;
  } else if (result.kind === "monte-carlo-tolerance") {
    const bins=result.histogram, max=Math.max(...bins.map(bin=>bin.count),1), bars=bins.map((bin,index)=>{const x=32+index*41,y=96-(bin.count/max)*68,w=26,h=96-y;return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"></rect>`;}).join("");
    waveform=`<figure class="result-waveform"><figcaption>Seeded current distribution Â· ${result.sampleCount} trials Â· R tolerance Â±${result.tolerancePct}%</figcaption><svg viewBox="0 0 480 118" role="img" aria-label="Histogram of simulated LED current values"><path class="wave-axis" d="M28 18 V98 H458"></path><g class="histogram-bars">${bars}</g><text x="30" y="114">${(result.minimum*1000).toFixed(2)} mA</text><text x="400" y="114">${(result.maximum*1000).toFixed(2)} mA</text></svg></figure>`;
    metrics.push(`<div class="result-metric"><span>Mean current</span><strong>${(result.mean*1000).toFixed(3)} mA</strong></div>`,`<div class="result-metric"><span>Std. deviation</span><strong>${(result.standardDeviation*1000).toFixed(3)} mA</strong></div>`,`<div class="result-metric"><span>Median current</span><strong>${(result.median*1000).toFixed(3)} mA</strong></div>`);
  } else if (result.kind === "parameter-sweep") {
    const points=result.points, max=Math.max(...points.map(point=>point.currentA),1e-12), path=points.map((point,index)=>{const x=32+(416*index)/(points.length-1),y=94-(point.currentA/max)*68;return (index?"L ":"M ")+x.toFixed(1)+" "+y.toFixed(1);}).join(" ");
    waveform=`<figure class="result-waveform"><figcaption>LED current vs. ${escape(result.parameterReference)} resistance Â· ${points.length} tested values</figcaption><svg viewBox="0 0 480 118" role="img" aria-label="LED current decreases as series resistance increases"><path class="wave-axis" d="M28 18 V98 H458"></path><path class="wave-trace" d="${path}"></path><text x="30" y="114">${points[0].resistanceOhms} Î©</text><text x="400" y="114">${points.at(-1).resistanceOhms} Î©</text></svg></figure>`;
    for(const point of points)metrics.push(`<div class="result-metric"><span>${point.resistanceOhms} Î©</span><strong>${(point.currentA*1000).toFixed(3)} mA</strong></div>`);
  } else if (result.kind === "rlc-step-response") {
    const samples=result.samples, max=Math.max(...samples.map(point=>point.capacitorVoltageV),result.sourceVoltage), path=samples.map((point,index)=>{const x=24+(432*index)/(samples.length-1),y=86-(point.capacitorVoltageV/max)*62;return (index?"L ":"M ")+x.toFixed(1)+" "+y.toFixed(1);}).join(" ");
    waveform=`<figure class="result-waveform"><figcaption>Series RLC pulse response Â· ${result.regime} Â· ${result.dampedFrequencyHz.toFixed(2)} Hz</figcaption><svg viewBox="0 0 480 108" role="img" aria-label="RLC capacitor voltage transient showing damping and ringing"><path class="wave-axis" d="M20 86 H468 M24 16 V90"></path><path class="wave-trace" d="${path}"></path><text x="24" y="104">0 s</text><text x="405" y="104">${result.durationS.toPrecision(3)} s</text></svg></figure>`;
  } else if (result.kind === "rc-bode-plot") {
    const points=result.points, x=index=>30+(420*index)/(points.length-1), yMag=value=>22+Math.min(44,Math.max(0,-value/40*44)), yPhase=value=>75+(-value/90)*34;
    const mag=points.map((point,index)=>(index?"L ":"M ")+x(index).toFixed(1)+" "+yMag(point.magnitudeDb).toFixed(1)).join(" "), phase=points.map((point,index)=>(index?"L ":"M ")+x(index).toFixed(1)+" "+yPhase(point.phaseDeg).toFixed(1)).join(" ");
    waveform=`<figure class="result-waveform"><figcaption>RC low-pass Bode response Â· cutoff ${result.cutoffHz.toFixed(2)} Hz</figcaption><svg viewBox="0 0 480 124" role="img" aria-label="RC Bode plot with magnitude and phase versus logarithmic frequency"><path class="wave-axis" d="M28 20 V112 H458 M28 72 H458"></path><path d="${mag}" fill="none" stroke="#36d5f5" stroke-width="2"></path><path d="${phase}" fill="none" stroke="#ffb55d" stroke-width="2"></path><circle cx="${x(result.cutoffIndex).toFixed(1)}" cy="${yMag(result.cutoffMagnitudeDb).toFixed(1)}" r="4" fill="#ffffff"></circle><text x="30" y="12">Magnitude (dB)</text><text x="30" y="121">Frequency (log Hz)</text><text x="338" y="12" fill="#ffb55d">Phase (deg)</text><text x="${(x(result.cutoffIndex)+6).toFixed(1)}" y="35">fc</text></svg></figure>`;
  } else if (result.kind === "eeprom-ring-logger") {
    metrics.push(["Sample interval", result.samplePeriodMs + " ms"], ["Buffer capacity", String(result.capacity)], ["Samples recorded", String(result.recordedSamples)], ["Overwritten records", String(result.overwrittenRecords)], ["Buffer wrapped", result.bufferWrapped ? "Yes" : "No"], ["Replay values", result.replayValues.join(", ") + " Â°C"]);
  } else if (result.kind === "low-power-sleep-wake") {
    metrics.push(["Run duration", result.durationMs + " ms"], ["MCU sleep current", result.sleepCurrentUa + " ÂµA"], ["MCU run current", result.runCurrentUa + " ÂµA"], ["Wake events", String(result.wakeCount)], ["Awake / asleep", result.awakeTimeMs + " / " + result.sleepTimeMs + " ms"], ["Estimated average supply current", result.averageSupplyCurrentUa.toFixed(2) + " ÂµA"], ["Estimated energy", result.energyMj.toFixed(3) + " mJ"], ["LED load while awake", result.ledPeakCurrentMa.toFixed(2) + " mA"]);
  } else if (result.kind === "fm-front-end-response") {
    metrics.push(["Tuned center", result.centerFrequencyMHz.toFixed(2) + " MHz"], ["Resonator Q", String(result.q)], ["Gain block", result.gainDb.toFixed(1) + " dB"], ["Peak sample", result.peakFrequencyMHz.toFixed(2) + " MHz"], ["Peak total gain", result.peakResponseDb.toFixed(2) + " dB"], ["Peak output amplitude", result.peakOutputAmplitudeV.toFixed(4) + " V"], ["RF transmission", result.rfTransmitted ? "Yes" : "No"], ["FM demodulation", result.demodulationModeled ? "Modeled" : "Not modeled"]);
    const points = result.responsePoints;
    const min = Math.min(...points.map((point) => point.totalGainDb));
    const max = Math.max(...points.map((point) => point.totalGainDb));
    const span = Math.max(0.001, max - min);
    const path = points.map((point, index) => {
      const x = 24 + (432 * index) / Math.max(1, points.length - 1);
      const y = 84 - ((point.totalGainDb - min) / span) * 62;
      return (index ? "L " : "M ") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    waveform = `<figure class="result-waveform"><figcaption>Ideal tuned response Â· peak ${result.peakFrequencyMHz.toFixed(2)} MHz</figcaption><svg viewBox="0 0 480 108" role="img" aria-label="Ideal FM front-end gain versus frequency"><path class="wave-axis" d="M20 84 H468 M24 18 V88"></path><path class="wave-trace" d="${path}"></path><text x="24" y="103">${points[0].frequencyMHz.toFixed(0)} MHz</text><text x="402" y="103">${points.at(-1).frequencyMHz.toFixed(0)} MHz</text></svg></figure>`;
  } else if (result.kind === "ir-remote-action") {
    metrics.push(["Protocol", result.protocol], ["Decoded frame", result.rawCode], ["Address", result.address], ["Command", result.command], ["Selected action", result.action], ["Action mapping entries", String(result.mapEntries)], ["Frame duration", result.frameDurationUs + " Âµs"], ["Action executed", result.actionExecuted ? "Yes" : "No (display only)"]);
  } else if (result.kind === "ethernet-sensor-frame") {
    metrics.push(["Link transitions", result.linkTransitions.join(" â†’ ")], ["Link state", result.linkState], ["Configuration", result.configurationState], ["Transaction", result.transactionState], ["Ethernet-II header", result.headerHex ?? "Not formed"], ["Sensor payload", result.payloadHex ?? "Not formed"], ["Mock frame length", result.frameLengthOctets + " octets"], ["FCS / padding", (result.fcsIncluded ? "FCS included" : "FCS omitted") + " / " + (result.paddingIncluded ? "included" : "omitted")], ["Packet transmission", result.packetTransmitted ? "Yes" : "No (local mock)"]);
  } else if (result.kind === "wifi-relay-control") {
    metrics.push(["Local command", result.command], ["Wi-Fi link", result.linkState], ["Authentication model", result.authentication], ["Command result", result.transactionState], ["Ideal relay driver", result.relayEnergized ? "Energized" : "De-energized"], ["Coil current estimate", result.coilCurrentMa.toFixed(1) + " mA"], ["Physical relay action", result.physicalRelaySwitched ? "Modeled" : "Not modeled"], ["Network transmission", result.networkTransmitted ? "Yes" : "No (local mock)"]);
  } else if (result.kind === "gsm-alarm-mock") {
    metrics.push(["Alarm input", result.alarmState], ["AT commands completed", result.commandsCompleted + " / " + result.commands.length], ["Transaction state", result.transactionState], ["Alert text", result.messageBody ?? "Not prepared"], ["Mock modem accepted", result.modemAccepted ? "Yes" : "No"], ["Delivery confirmed", result.deliveryConfirmed ? "Yes" : "No"], ["Radio transmission", result.radioTransmitted ? "Yes" : "No (local mock)"]);
  } else if (result.kind === "lora-sensor-node") {
    metrics.push(["Node ID", String(result.nodeId)], ["Temperature sample", result.temperatureC.toFixed(1) + " Â°C"], ["Application payload", result.payloadHex], ["Payload size", result.payloadLengthOctets + " octets"], ["Configured airtime", result.airtimeMs + " ms per send"], ["Duty window / configured limit", result.dutyWindowMs + " ms / " + result.dutyLimitPercent + " %"], ["Accepted / rejected requests", result.sentCount + " / " + result.rejectedCount], ["Airtime used", result.usedAirtimeMs + " / " + result.airtimeBudgetMs + " ms"], ["Window duty estimate", result.dutyCyclePercent.toFixed(3) + " %"], ["Radio transmission", result.radioTransmitted ? "Yes" : "No (mock only)"]);
  } else if (result.kind === "ble-beacon-config") {
    metrics.push(["Device name", result.deviceName], ["Flags", "0x" + result.flags.toString(16).padStart(2, "0").toUpperCase()], ["16-bit service UUID", result.serviceUuid], ["Tx power field", result.txPowerDbm + " dBm"], ["Encoded legacy payload", result.payloadHex], ["Advertising data length", result.payloadLengthOctets + " / " + result.legacyMaximumOctets + " octets"], ["Radio transmission", result.radioTransmitted ? "Yes" : "No (configuration only)"]);
  } else if (result.kind === "nfc-uid-display") {
    metrics.push(["Read status", result.readStatus], ["Tag UID", result.uid], ["Authentication", "UID is not authentication"]);
  } else if (result.kind === "epaper-refresh") {
    metrics.push(["Refresh mode", result.refreshMode], ["Frame changes", result.changedTiles + " / " + result.totalTiles], ["Changed fractkm6×­¢G§²ÚîÆ­yÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNİÜ›Û™ÕÜÛÙŞK›™]Ë™š[™
™]O›™]šYOOH‘’ST—ÓÕUŠK™[™Ú[Ï]Ü›Û™ÕÜÛÙŞK›™]Ë™š[™
™]O›™]šYOOH‘’ST—ÓÕUŠK™[™Ú[Ë™š[\Š[™Ú[O™[™Ú[OOH˜Ø\XÚ]Ü‹LNŒHŠNÃBˆ\ÜÙ\™\]X[
[˜[^™T˜Ğ›ÙJÜ›Û™ÕÜÛÙŞJKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH“È[ÙH™\ÜÛœÙHÚİÜÈš[™Ú[™È[™Ø\›œÈÚ[ˆ[Y\İ\[™\œØ[\\È]‹\Ş[˜È

HOˆÃBˆÛÛœİØ[˜[^™T›Ôİ\OX]ØZ][\Ü
‹‹‹ÚœËÜ›Ë]˜[œÚY[›ZœÈŠNÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌM\›Ë]˜[œÚY[\™\ÜÛœÙK˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆÛÛœİİ\ÜY\[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
NØ\ÜÙ\™\]X[
İ\ÜYœİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
İ\ÜYœ™\İ[šÚ[™œ›Ë\İ\\™\ÜÛœÙHŠNÃBˆÛÛœİ™\İ[X[˜[^™T›Ôİ\
›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œ›Ë\İ\\™\ÜÛœÙHŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™YÚ[YK[™\™[\YŠNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[œš[™Ú[™Õš\ÚX›JNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[œXZÕ›ÛYÙUœ™\İ[œ™\İ[œÛİ\˜ÙU›ÛYÙJNÃBˆ\ÜÙ\™\]X[
™\İ[Ø\›š[™ÜË›[™İ
NÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[œØ[\PÛİ[L
NÃBˆÛÛœİÛØ\œÙOR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNØÛØ\œÙKœ›Õ˜[œÚY[[YTİ\ÏLŒNÃBˆÛÛœİØ\›™YX[˜[^™T›Ôİ\
ÛØ\œÙJNÃBˆ\ÜÙ\™\]X[
Ø\›™Yœİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\›ÚÊØ\›™YØ\›š[™ÜËœÛÛYJØ\›š[™ÏOØ\›š[™Ë˜ÛÙOOOH•SQTÕTÔ‘TÓÓUSÓˆŠJNÃBˆÛÛœİœ›ÚÙ[R”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNØœ›ÚÙ[‹›™]Ë™š[™
™]O›™]šYOOH“ĞÈŠK™[™Ú[ÏXœ›ÚÙ[‹›™]Ë™š[™
™]O›™]šYOOH“ĞÈŠK™[™Ú[Ë™š[\Š[™Ú[O™[™Ú[OOH˜Ø\XÚ]Ü‹LNŒHŠNÃBˆ\ÜÙ\™\]X[
[˜[^™T›Ôİ\
œ›ÚÙ[ŠKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH\˜[Y]\ˆİÙY\[˜[^™\È™YH™\Ú\İÜˆ˜[Y\È[™™\ÜÈH^XİYİ\œ™[™[™‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMK\\˜[Y]\‹\İÙY\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİ™\İ[\[”\˜[Y]\”İÙY\
›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œ\˜[Y]\‹\İÙY\ŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œØ[\PÛİ[ÊNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[œÚ[Ë›X\
Ú[OœÚ[œ™\Ú\İ[˜ÙSÚ\ÊKÌŒŒÌÌÌJNÃBˆ\ÜÙ\›ÚÊX]˜XœÊ™\İ[œ™\İ[œÚ[ÖÌK˜İ\œ™[KJËÌŒŒ
JOYKLLŠNÃBˆ\ÜÙ\›ÚÊX]˜XœÊ™\İ[œ™\İ[œÚ[ÖÌWK˜İ\œ™[KJËÌÌÌ
JOYKLLŠNÃBˆ\ÜÙ\›ÚÊX]˜XœÊ™\İ[œ™\İ[œÚ[ÖÌ—K˜İ\œ™[KJËÍÌ
JOYKLLŠNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[œÚ[ÖÌK˜İ\œ™[Oœ™\İ[œ™\İ[œÚ[ÖÌWK˜İ\œ™[JNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[œÚ[ÖÌWK˜İ\œ™[Oœ™\İ[œ™\İ[œÚ[ÖÌ—K˜İ\œ™[JNÃBˆÛÛœİ\XØ]OR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÙ\XØ]Kœ\˜[Y]\”İÙY\˜[Y\ÏVÌŒŒÌÌÌÌNÃBˆ\ÜÙ\™\]X[
[”\˜[Y]\”İÙY\
\XØ]JKœİ]K˜›ØÚÙYŠNÃBˆÛÛœİÛÑ™]ÏR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNİÛÑ™]Ëœ\˜[Y]\”İÙY\˜[Y\ÏVÌŒŒÌÌNÃBˆ\ÜÙ\™\]X[
[”\˜[Y]\”İÙY\
ÛÑ™]ÊKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH[ÛHØ\›ÈÛ\˜[˜ÙHİYH\ÈÙYYY™\›ÙXÚX›K[™›İ[™Y‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌML[[ÛKXØ\›Ë]Û\˜[˜ÙK\[‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİš\œİ\[“[ÛPØ\›ÕÛ\˜[˜ÙJ›Ú™Xİ
K™\X]\[“[ÛPØ\›ÕÛ\˜[˜ÙJ›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
š\œİœİ]K˜ÛÛ\]HŠNØ\ÜÙ\™Y\\]X[
š\œİ™\X]
NÃBˆ\ÜÙ\™\]X[
š\œİœ™\İ[œØ[\PÛİ[L
NØ\ÜÙ\™\]X[
š\œİœ™\İ[œÙYYŒŒLÌJNÃBˆ\ÜÙ\™\]X[
š\œİœ™\İ[š\İÙÜ˜[Kœ™YXÙJ
İ[Kš[ŠOOœİ[JØš[‹˜Ûİ[
KL
NÃBˆ\ÜÙ\›ÚÊš\œİœ™\İ[›Z[š[][OLËÊÌÌ
ŒKŒJJNØ\ÜÙ\›ÚÊš\œİœ™\İ[›X^[][OLËÊÌÌ
ŒMJJNÃBˆ\ÜÙ\›ÚÊš\œİœ™\İ[›Z[š[][Oš\œİœ™\İ[›YX[ŠNØ\ÜÙ\›ÚÊš\œİœ™\İ[›YX[š\œİœ™\İ[›X^[][JNÃBˆÛÛœİ[˜[YR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÚ[˜[Y›[ÛPØ\›ÕÛ\˜[˜ÙKœÙYYLÃBˆ\ÜÙ\™\]X[
[“[ÛPØ\›ÕÛ\˜[˜ÙJ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH\›X[›İ[™\H™\ÜÈ\ÜÚ\][ÛˆÚ]İ]ÛZ[Z[™ÈH\›X[[Ù[‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMLK]\›X[]Ø\›š[™ËX›İ[™\K˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİ™\İ[X[˜[^™U\›X[Ø\›š[™Ğ›İ[™\J›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™\›X[]Ø\›š[™ËX›İ[™\HŠNÃBˆ\ÜÙ\›ÚÊX]˜XœÊ™\İ[œ™\İ[œ™\Ú\İÜ‘\ÜÚ\][Û•ËLKŒNLŒNJOYKLLŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œ˜][™ĞÛÛ˜Ù\›‹YJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[\›X[[Ù[››İ[[Ù[YŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[[\\˜]\™Tš\ÙPË[
NÃBˆ\ÜÙ\›ÚÊ™\İ[Ø\›š[™ÜËœÛÛYJØ\›š[™ÏOØ\›š[™Ë˜ÛÙOOOH•T“PSÓSÑSÓ“ÕÓSÑSQŠJNÃBˆ\ÜÙ\›ÚÊ™\İ[Ø\›š[™ÜËœÛÛYJØ\›š[™ÏOØ\›š[™Ë˜ÛÙOOOH”ÕÑT—ÔUS‘×ÑVÑQQQŠJNÃBˆÛÛœİ[˜[YR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÚ[˜[Y\›X[›İ[™\Kœ˜]YİÙ\•ÏLÃBˆ\ÜÙ\™\]X[
[˜[^™U\›X[Ø\›š[™Ğ›İ[™\J[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÛÛ™\™Ù[˜ÙHİYH™]\›œÈXİ[Û˜X›H[Z]ÈÚ]İ]˜XœšXØ][™ÈÛÛ™\ˆİ]]‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌML‹XÛÛ™\™Ù[˜ÙKY˜Z[\™K\İYK˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆÛÛœİ™\İ[X[˜[^™PÛÛ™\™Ù[˜ÙTİYJ›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜›ØÚÙYŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[[
NÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜËœÛÛ™\’]\˜][ÛœË[
NÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜËœ™\ÜY[XİšXØ[™\İ[[
NÃBˆ\ÜÙ\›ÚÊ™\İ[™\œ›ÜœËœÛÛYJ\œ›ÜO™\œ›Ü‹˜ÛÙOOOH”ÔPÑWÔÓÓ‘T—ÕSURSP“HŠJNÃBˆ\ÜÙ\›ÚÊ™\İ[™\œ›ÜœËœÛÛYJ\œ›ÜO™\œ›Ü‹˜ÛÙOOOHÓÓ•‘T‘ÑSÑWÓ“ÕĞUSTQŠJNÃBˆ\ÜÙ\›X]Ú
™\İ[™\œ›ÜœÖÌK›Y\ÜØYÙKÔÔPÑHÜ\˜][™Ë\Ú[ÛÛ™\‹ÊNÃBˆ\ÜÙ\›ÚÊ™\İ[™XYÛ›ÜİXÜË˜Xİ[ÛœËœÛÛYJXİ[ÛO‹ÜÙ\šY\È™\Ú\İ[˜ÙKË\İ
Xİ[ÛŠJJNÃBˆÛÛœİ[˜[YR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÚ[˜[Y˜ÛÛ™\™Ù[˜ÙTİYK™š^\™OH[šÛ›İÛˆÃBˆ\ÜÙ\™\]X[
[˜[^™PÛÛ™\™Ù[˜ÙTİYJ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBˆ\ÜÙ\™\]X[
[˜[^™PÛÛ™\™Ù[˜ÙTİYJ[˜[Y
K™\œ›ÜœÖÌK˜ÛÙKÓÓ•‘T‘ÑSÑWÑ’VT‘WÕS’Ó“ÕÓˆŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH›Ø][™Ë[›ÙHXYÛ›ÜÚ\ÈY[YšY\ÈHØš™XİÈ[œÜXİ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMLËY›Ø][™Ë[›ÙKYXYÛ›ÜÚ\Ë˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆÛÛœİ™\İ[YXYÛ›ÜÙQ›Ø][™Ó›ÙJ›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜›ØÚÙYŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[[
NÃBˆ\ÜÙ\™\]X[
™\İ[™\œ›ÜœÖÌK˜ÛÙK‘“ĞUS‘×Ñ×Ó“ÑHŠNÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜË›™]Y‘“ĞUS‘ÈŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[™XYÛ›ÜİXÜËš[\\™Ù]Ú[œİ[˜ÙRYˆ˜Ø\XÚ]Ü‹Y›Ø][™È‹™]Yˆ‘“ĞUS‘ÈŸJNÃBˆ\ÜÙ\›ÚÊ™\İ[™XYÛ›ÜİXÜËœİYÙÙ\İ[ÛœËœÛÛYJ][OO‹ØšX\ÈÜˆ›YY™\Ú\İÜ‹Ë\İ
][JJJNÃBˆÛÛœİZ\ÜÚ[™ÏR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÛZ\ÜÚ[™Ë›™]Ï[Z\ÜÚ[™Ë›™]Ë™š[\Š™]O›™]šYOOH‘“ĞUS‘ÈŠNÃBˆ\ÜÙ\™\]X[
XYÛ›ÜÙQ›Ø][™Ó›ÙJZ\ÜÚ[™ÊK™\œ›ÜœÖÌK˜ÛÙK‘“ĞUS‘×Ó“ÑWÕT‘ÑUÓRTÔÒS‘ÈŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÚÜXÚ\˜İZ]š^\™H›ØÚÜÈ™Y›Ü™HÚ[][][ÛˆÚ]›È˜XœšXØ]Yİ\œ™[‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMM\ÚÜXÚ\˜İZ]YXYÛ›ÜÚ\Ë˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ˜[Y][Û]˜[Y]T›Ú™Xİ
›Ú™Xİ
NØ\ÜÙ\™\]X[
˜[Y][Û‹˜[Y˜[ÙJNÃBˆ\ÜÙ\›ÚÊ˜[Y][Û‹™\œ›ÜœËœÛÛYJ\œ›ÜO™\œ›Ü‹œ[OOOH”ÓÕTÑWÔÒÔ•ŠJNÃBˆÛÛœİ™\İ[YXYÛ›ÜÙTİ\TÚÜ
›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜›ØÚÙYŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[[
NÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜË˜[˜[\Ú\Ğ][\Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[™\œ›ÜœÖÌK˜ÛÙK”ÕTWÔÒÔ•ĞÒTÕRUŠNÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜË›™]Y”ÒÔ•ŠNÃBˆ\ÜÙ\›ÚÊ™\İ[™XYÛ›ÜİXÜËœİYÙÙ\İ[ÛœËœÛÛYJ][OO‹Ø™Y›Ü™H[™\™Ú^š[™ËË\İ
][JJJNÃBˆÛÛœİØY™OR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÜØY™K›™]ÖÌK™[™Ú[ÏVÈœÛİ\˜ÙKLNŠÈ—NÃBˆ\ÜÙ\™\]X[
XYÛ›ÜÙTİ\TÚÜ
ØY™JKœ™\İ[™\™Xİİ\TÚÜ˜[ÙJNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHZ\ÜÚ[™ËYÜ›İ[™XYÛ›ÜÚ\È›ØÚÜÈ[™Y[YšY\ÈH™Y™\™[˜ÙH[H‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMMK[Z\ÜÚ[™ËYÜ›İ[™YXYÛ›ÜÚ\Ë˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ˜[Y][Û]˜[Y]T›Ú™Xİ
›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
˜[Y][Û‹˜[YYJNÃBˆ\ÜÙ\›ÚÊ˜[Y][Û‹Ø\›š[™ÜËœÛÛYJØ\›š[™ÏOØ\›š[™Ëœ[OOOH““×Ô‘Q‘T‘SÑHŠJNÃBˆÛÛœİ™\İ[YXYÛ›ÜÙSZ\ÜÚ[™ÑÜ›İ[™
›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜›ØÚÙYŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[[
NÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜËœ[RY““×Ô‘Q‘T‘SÑHŠNÃBˆ\ÜÙ\™\]X[
™\İ[™\œ›ÜœÖÌK˜ÛÙK“RTÔÒS‘×ÑÔ“ÕS‘Ô‘Q‘T‘SÑHŠNÃBˆ\ÜÙ\›ÚÊ™\İ[™XYÛ›ÜİXÜËœİYÙÙ\İ[ÛœË›[™İLŠNÃBˆÛÛœİÜ›İ[™YR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÙÜ›İ[™Y˜ÛÛ\Û™[Ëœ\Ú
Ú[œİ[˜ÙRYˆ™Ü›İ[™\™\İÜ™Y‹Xœ˜\RYˆ™Ü›İ[™œÚYÛ˜[‹™Y™\™[˜ÙNˆ‘Ó‘ˆ‹˜[YNˆŒˆŸJNÃBˆ\ÜÙ\™\]X[
XYÛ›ÜÙSZ\ÜÚ[™ÑÜ›İ[™
Ü›İ[™Y
Kœ™\İ[œ™Y™\™[˜ÙT™\Ù[YJNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH[˜]˜Z[X›K[[Ù[š^\™H\ÈØÚ[X]XË[Û›H[™™]™\ˆÚ[][]\ÈH˜ZÙH[Ù[‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMM‹[[Ù[][˜]˜Z[X›KYXYÛ›ÜÚ\Ë˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\™\Ü[˜]˜Z[X›S[Ù[
›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜›ØÚÙYŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[[
NÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜË˜[˜[\Ú\Ğ][\Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜËœİ]\Ë[˜]˜Z[X›HŠNÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜË™\Ü^S[ÙKœØÚ[X]XË[Û›HŠNÃBˆ\ÜÙ\™\]X[
™\İ[™\œ›ÜœÖÌK˜ÛÙKÓÓTÓ‘S•ÓSÑSÕSURSP“HŠNÃBˆ\ÜÙ\›X]Ú
™\İ[›Y\ÜØYÙKÜÚİÛˆ[ˆHØÚ[X]XËÊNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH™]Ü›ÜÜË\›Ø™H™\Ù\™\ÈHØ[YH™]QXÜ›ÜÜÈ[\ÚYÛˆšY]ÜÈ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMMË[™]\›Ø™KXÜ›ÜÜË\›Ø™K˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİ™\İ[\[“™]Ü›ÜÜÔ›Ø™J›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›™]XÜ›ÜÜË\›Ø™HŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[›™]Y“QĞHŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œÚ\™Y™]YYJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[šY]ÜËÈ˜œ™XY›Ø\™‹œØÚ[X]XÈ‹œØˆ—JNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™[™Ú[Ûİ[ŠNÃBˆ\ÜÙ\™\]X[
™\İ[™XYÛ›ÜİXÜËš[\\™Ù]›™]Y“QĞHŠNÃBˆÛÛœİZ\ÜÚ[™ÏR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÛZ\ÜÚ[™Ë˜Ü›ÜÜÔ›Ø™K›™]YH“RTÔÒS‘ÈÃBˆ\ÜÙ\™\]X[
[“™]Ü›ÜÜÔ›Ø™JZ\ÜÚ[™ÊKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÛÛ\Û™[›Ü\H]Y]XØÙ\È˜[Y™\Ú\İÜˆY]È[™™Z™XİÈ[œØY™H˜[™Ù\È™Y›Ü™H\İÜH]]][Ûˆ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMNXÛÛ\Û™[\›Ü\KX]Y]˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİ™\Ú\İÜ\›Ú™Xİ˜ÛÛ\Û™[Ë™š[™
ÛÛ\Û™[O˜ÛÛ\Û™[œ™Y™\™[˜ÙOOOH”ŒHŠNÃBˆ\ÜÙ\™\]X[
˜[Y]PÛÛ\Û™[›Ü\J™\Ú\İÜ‹ŒŒŒ3ªHŠK˜[YYJNÃBˆ\ÜÙ\™\]X[
˜[Y]PÛÛ\Û™[›Ü\J™\Ú\İÜ‹ŒHóªHŠKœ™\Ú\İ[˜ÙSÚ\ËL
NÃBˆ\ÜÙ\™\]X[
˜[Y]PÛÛ\Û™[›Ü\J™\Ú\İÜ‹Œ3ªHŠK˜[Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
˜[Y]PÛÛ\Û™[›Ü\J™\Ú\İÜ‹ŒYLMH3ªHŠK˜[Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
˜[Y]PÛÛ\Û™[›Ü\J™\Ú\İÜ‹››İH˜[YHŠK˜[Y˜[ÙJNÃBˆÛÛœİ\X]ØZ]™XYš[J™]ÈT“
‹‹‹Ø\šœÈ‹[\Ü›Y]K\›
K]ŠNÃBˆÛÛœİİX›Z]X\œÛXÙJ\š[™^ÙŠ	É
ˆØÛÛ\Û™[Y›Ü›HŠK˜Y]™[\İ[™\ŠœİX›Z]‰ÊK\š[™^ÙŠ	É
ˆÜ™[[İ™KXÛÛ\Û™[ŠK˜Y]™[\İ[™\‰ÊJNÃBˆ\ÜÙ\›ÚÊİX›Z]š[™^ÙŠ˜[Y]PÛÛ\Û™[›Ü\HŠOİX›Z]š[™^ÙŠ˜Ø\\™R\İÜJ
HŠJNÃBˆ\ÜÙ\›ÚÊİX›Z]š[™^ÙŠ˜Ø\\™R\İÜJ
HŠOİX›Z]š[™^ÙŠ\]PÛÛ\Û™[
ŠJNÃBˆ\ÜÙ\›X]Ú
\Ù[˜İ[Ûˆ[™×
ÊNØ\ÜÙ\›X]Ú
\Ù[˜İ[Ûˆ™Y×
ÊNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÚ[][][Ûˆ™\Ü^ÜÈ™\›ÙXÚX›HÈÙ][™ÜË[Ù[™\œÚ[Û‹™\İ[Ë[™Ø\›š[™ÜÈ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌK\˜Ë\İ\\™\ÜÛœÙK˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆÛÛœİ[˜[\Ú\Ï\[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
[˜[\Ú\Ëœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİ™\ÜXÜ™X]TÚ[][][Û”™\Ü
›Ú™Xİ[˜[\Ú\ËÙÙ[™\˜]Y]ˆŒŒ‹LLLÌUŒŒŒˆŸJNÃBˆ\ÜÙ\™\]X[
™\ÜœØÚ[XK˜YYİ[‹\Ú[][][Û‹\™\ÜÌHŠNÃBˆ\ÜÙ\™\]X[
™\ÜœÚ[][][Û‹œÙ][™ÜË˜[˜[\Ú\ÒÚ[™œ˜Ë\İ\\™\ÜÛœÙHŠNÃBˆ\ÜÙ\™\]X[
™\ÜœÚ[][][Û‹›[Ù[™\œÚ[Û‹™š\œİ[Ü™\‹\˜Ë\İ\]ŒHŠNÃBˆ\ÜÙ\›ÚÊ™\ÜœÚ[][][Û‹œÙ][™ÜËœØ[\PÛİ[Œ
NÃBˆ\ÜÙ\™\]X[
™\Üœ™\İ[šÚ[™œ˜Ë\İ\\™\ÜÛœÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\ÜØ\›š[™ÜË[˜[\Ú\ËØ\›š[™ÜÏÏÖ×JNÃBˆ\ÜÙ\›ÚÊ™\Üœ›Ú™Xİ˜ÛÛ\Û™[ËœÛÛYJÛÛ\Û™[O˜ÛÛ\Û™[œ™Y™\™[˜ÙOOOH”ŒH‰‰˜ÛÛ\Û™[˜[YOOOHŒHóªHŠJNÃBˆÛÛœİ[X]ØZ]™XYš[J™]ÈT“
‹‹‹Ú[™^š[‹[\Ü›Y]K\›
K]ŠNÃBˆ\ÜÙ\›X]Ú
[ÚYH™^Ü\Ú[][][Û‹\™\Ü‹ÊNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH[ˆØÚÙš[HÙ[XİÈHØ[YHÈ[Ù[[™]XİÈ›Ú™XİšY‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMŒ\™\›ÙXÚX›K\[‹[ØÚÙš[K˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİX[šY™\İR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÛX[šY™\İšœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ[O[X[šY™\İ™^[\\Ë™š[™
^[\OO™^[\KšYOOHŒMŒ\™\›ÙXÚX›K\[‹[ØÚÙš[HŠNÃBˆ\ÜÙ\™\]X[
[K›ØÚÙš[Qš[K™^[\\ËÌMŒ\™\›ÙXÚX›K\[‹[ØÚÙš[KÜÚ[][][Û‹›ØÚËšœÛÛˆŠNÃBˆÛÛœİØÚÏR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMŒ\™\›ÙXÚX›K\[‹[ØÚÙš[KÜÚ[][][Û‹›ØÚËšœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™Y\\]X[
Ü™X]TÚ[][][Û“ØÚÙš[J›Ú™Xİ
KØÚÊNÃBˆÛÛœİ™\šYšYY]™\šYTÚ[][][Û“ØÚÙš[J›Ú™XİØÚÊNÃBˆ\ÜÙ\™\]X[
™\šYšYY›X]ÚYYJNØ\ÜÙ\™\]X[
™\šYšYY˜XİX[›[Ù[Ù[Xİ[Û‹›[Ù[™\œÚ[Û‹™š\œİ[Ü™\‹\˜Ë\İ\]ŒHŠNÃBˆÛÛœİšYR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÙšY˜ÛÛ\Û™[Ë™š[™
ÛÛ\Û™[O˜ÛÛ\Û™[œ™Y™\™[˜ÙOOOH”ŒHŠK˜[YOHŒKŒHóªHÃBˆ\ÜÙ\™\]X[
™\šYTÚ[][][Û“ØÚÙš[JšYØÚÊK›X]ÚY˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\šYTÚ[][][Û“ØÚÙš[JšYØÚÊK™\œ›ÜœÖÌK˜ÛÙK”•S—ÓĞÒ×ÓRTÓPUÒŠNÃBˆÛÛœİ[X]ØZ]™XYš[J™]ÈT“
‹‹‹Ú[™^š[‹[\Ü›Y]K\›
K]ŠNØ\ÜÙ\›X]Ú
[Ù]KXXİ[ÛH™\šYK\[‹[ØÚÈ‹ÊNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÈ[İÜˆÙX[Z[ˆÛÈÛˆİ\[™›ÜÈÛˆİÜÜˆ[Y\™Ù[˜ŞHİÜ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMŒK\Ë\İ\\İÜ[[İÜ‹XÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[”Ôİ\İÜÙ\]Y[˜ÙJ›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œË\İ\\İÜ\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌK˜ÛÛXİÜ‘[™\™Ú^™Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌWK˜ÛÛXİÜ‘[™\™Ú^™YYJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌ—K˜ÛÛXİÜ‘[™\™Ú^™YYJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌ×K˜ÛÛXİÜ‘[™\™Ú^™Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÍWK˜ÛÛXİÜ‘[™\™Ú^™Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œÙX[[”™]Z[™YYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™[Y\™Ù[˜ŞTİÜ›ÜÓİ]]YJNÃBˆÛÛœİ[˜[YR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNÚ[˜[YœÓ[İÜ”Ù\]Y[˜ÙK™œ˜[Y\ÖÌKœİ\™\ÜÙYH™˜[ÙHÃBˆ\ÜÙ\™\]X[
[”Ôİ\İÜÙ\]Y[˜ÙJ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH˜Y™šXË[YÚÙ\]Y[˜ÙH™\X]ÈØY™H[YYİ]\ÈÚ]İ]ÜÜÚ[™ÈÜ™Y[ˆ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMŒ‹\Ë]˜Y™šXË[YÚ˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[•˜Y™šXÓYÚÙ\]Y[˜ÙJ›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜Y™šXË[YÚYœÛK\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[˜ŞXÛPÛİ[ŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ\ÙPÛİ[M
NÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[İ[\˜][Û”ËL
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ\Ù\ÖÌK››ÜÛİ]œ™YŠNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[œİ]\Ë™]™\Jİ]OOˆJİ]K››ÜÛİ]OOH™Ü™Y[ˆ‰‰œİ]K™X\İÙ\İOOH™Ü™Y[ˆŠJJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[›ÜÜÚ[™ÑÜ™Y[ÛÛ™›Xİ˜[ÙJNÃBˆÛÛœİ[œØY™OR”ÓÓ‹œ\œÙJ”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
JNİ[œØY™K˜Y™šXÓYÚœ\Ù\ÖÌO^Û˜[YNˆ[œØY™H‹›ÜÛİ]ˆ™Ü™Y[ˆ‹X\İÙ\İˆ™Ü™Y[ˆ‹\˜][Û”Î_NÃBˆ\ÜÙ\™\]X[
[•˜Y™šXÓYÚÙ\]Y[˜ÙJ[œØY™JKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH[šÈÛÛ›Û\ˆ\Y\ÈİËÚYÚ\İ\™\Ú\ÈXÜ›ÜÜÈŞ[]XÈ]™[È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMŒË\Ë][šË[]™[XÛÛ›Û\‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[•[šÓ]™[ÛÛ›Û\Š›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™[šË[]™[Z\İ\™\Ú\ÈŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œØ[\PÛİ[L
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ[\Û”Ø[\\ËÊNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YKœ[\ÛŠKİYKYKYKYKYK˜[ÙK˜[ÙK˜[ÙKYKYWJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y[šÓ]™[ÛÛ›Û\‹šYÚ]™[İLŒÃBˆ\ÜÙ\™\]X[
[•[šÓ]™[ÛÛ›Û\Š[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBˆÛÛœİİ]Ù”˜[™ÙO\İXİ\™YÛÛ™J›Ú™Xİ
NÛİ]Ù”˜[™ÙK[šÓ]™[ÛÛ›Û\‹›]™[Ø[\\ÖÌOLLNÃBˆ\ÜÙ\™\]X[
[•[šÓ]™[ÛÛ›Û\Šİ]Ù”˜[™ÙJKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÛÛ™^[ÜˆÛİ[\ˆÛİ[Èš\Ú[™ÈİÙ^YHYÙ\È[™İÜÈ]\™Ù]‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌM\ËXÛÛ™^[Ü‹XÛİ[\‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[ÛÛ™^[ÜÛİ[\Š›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜ÛÛ™^[Ü‹YYÙKXÛİ[\ˆŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™š[˜[Ûİ[ÊNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œİÜY]]™[ÊNØ\ÜÙ\™\]X[
™\İ[œ™\İ[›[İÜ”İÜYYJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK˜Ûİ[
KÌKKK‹‹ËËË×JNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YKœš\Ú[™ÑYÙJKÙ˜[ÙKYK˜[ÙK˜[ÙKYK˜[ÙKYK˜[ÙK˜[ÙK˜[ÙWJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK›[İÜ”[›š[™ÊKİYKYKYKYKYKYK˜[ÙK˜[ÙK˜[ÙK˜[ÙWJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y˜ÛÛ™^[ÜÛİ[\‹\™Ù]Ûİ[LØ\ÜÙ\™\]X[
[ÛÛ™^[ÜÛİ[\Š[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBˆÛÛœİ[˜[YÚYÛ˜[\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YÚYÛ˜[˜ÛÛ™^[ÜÛİ[\‹œİÙ^YQ]™[ÖÌOLNØ\ÜÙ\™\]X[
[ÛÛ™^[ÜÛİ[\Š[˜[YÚYÛ˜[
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHİ\‹Y[Hİ\\ˆ[İ™\È›İYÚ^Û\Ú]™Hİ]]È[™˜[œÚ][ÛˆXY[YH‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMK\İ\‹Y[K\İ\\‹XÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[”İ\‘[Tİ\\Š›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œİ\‹Y[K]˜[œÚ][Û‹\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK›[ÙJKÈœİ\ˆ‹œİ\ˆ‹˜[œÚ][Ûˆ‹˜[œÚ][Ûˆ‹™[H‹™[H‹œİÜY‹œİ\ˆ—JNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[››Óİ™\›\YJNØ\ÜÙ\›ÚÊ™\İ[œ™\İ[™œ˜[Y\Ë™]™\Jœ˜[YOOˆJœ˜[YKœİ\‘[™\™Ú^™Y	‰™œ˜[YK™[Q[™\™Ú^™Y
JJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Yœİ\‘[Tİ\\‹™XY[YS\ÏLØ\ÜÙ\™\]X[
[”İ\‘[Tİ\\Š[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBˆÛÛœİ[›Ü™\™Y\İXİ\™YÛÛ™J›Ú™Xİ
Nİ[›Ü™\™Yœİ\‘[Tİ\\‹™]™[ÖÌ—K˜]\ÏLLØ\ÜÙ\™\]X[
[”İ\‘[Tİ\\Š[›Ü™\™Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH›ÜØ\™Ü™]™\œÙHÙÚXÈ™Z™XİÈ[ˆÜÜÚ]KY\™Xİ[Ûˆ™\]Y\İ[[İÜY‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌM‹Y›ÜØ\™\™]™\œÙK[[İÜ‹XÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[‘›ÜØ\™™]™\œÙR[\›ØÚÊ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK™\™Xİ[ÛŠKÈ™›ÜØ\™‹™›ÜØ\™‹™›ÜØ\™‹œİÜY‹œ™]™\œÙH‹œ™]™\œÙH‹œİÜY—JNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK˜ÛÛ™›Xİ™Z™XİY
KÙ˜[ÙK˜[ÙKYK˜[ÙK˜[ÙKYK˜[ÙWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[˜ÛÛ™›Xİ™\]Y\İÔ™Z™XİYŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[››Óİ™\›\YJNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[™œ˜[Y\Ë™]™\Jœ˜[YOOˆJœ˜[YK™›ÜØ\™[™\™Ú^™Y	‰™œ˜[YKœ™]™\œÙQ[™\™Ú^™Y
JJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™›ÜØ\™™]™\œÙS[İÜ‹™]™[ÖÌKœ™\]Y\İH˜›İØ\ÜÙ\™\]X[
[‘›ÜØ\™™]™\œÙR[\›ØÚÊ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHK\İÜ]Ú™Z™XİÈ™\Ù]Ú[Hš\Y[™™YYÈÙ\\˜]H™\İ\‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMËY[Y\™Ù[˜ŞK\İÜ\ØY™]KXÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[‘[Y\™Ù[˜ŞTİÜÛÛ˜Ù\
›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™[Y\™Ù[˜ŞK\İÜ[]ÚY\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK›ØY[˜X›Y
KİYK˜[ÙK˜[ÙK˜[ÙK˜[ÙKYK˜[ÙWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌ—Kœ™\Ù]™Z™XİYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÍK›]ÚY˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[[œØY™T™\Ù]™Z™XİYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\İ\™\]Z\™\Ó™]Ôİ\YJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™[Y\™Ù[˜ŞTİÜÛÛ˜Ù\™]™[ÖÌK˜Xİ[ÛH˜]]Ë\™\İ\Ø\ÜÙ\™\]X[
[‘[Y\™Ù[˜ŞTİÜÛÛ˜Ù\
[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÛÜˆ[\›ØÚÈ]Ú\ÈØYÙ™ˆÛˆİX\™Ü[š[™È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMYÛÜ‹Z[\›ØÚËXÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[‘ÛÜ’[\›ØÚĞÛÛ˜Ù\
›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™ÛÜ‹Z[\›ØÚË\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK›ØY[˜X›Y
KİYK˜[ÙK˜[ÙK˜[ÙK˜[ÙKYK˜[ÙWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌ—Kœ™\Ù]™Z™XİYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[›ØY[Ø^\Ñ\ØX›YÚ[“Ü[‹YJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\Ù]™Z™XİYÚ[“Ü[‹YJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™ÛÜ’[\›ØÚË™]™[ÖÌK˜Xİ[ÛH˜\\ÜÈØ\ÜÙ\™\]X[
[‘ÛÜ’[\›ØÚĞÛÛ˜Ù\
[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH[\\˜]\™H[\›H]Ú\È]™\ÚÛ[™\Y\ÈØY™H™\Ù]ÛXŞH‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMK][\\˜]\™KX[\›K˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[•[\\˜]\™P[\›J›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›]ÚY][\\˜]\™KX[\›HŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK˜[\›S]ÚY
KÙ˜[ÙKYKYKYKYK˜[ÙKYWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌ×Kœ™\Ù]™Z™XİYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\Ù]™Z™XİYYJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y[\\˜]\™P[\›K™\ÚÛÏLLNØ\ÜÙ\™\]X[
[•[\\˜]\™P[\›J[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBˆÛÛœİ[˜[YØ[\O\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YØ[\K[\\˜]\™P[\›KœØ[\\ÖÌK[\ÏR[™š[š]NØ\ÜÙ\™\]X[
[•[\\˜]\™P[\›J[˜[YØ[\JKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHØ]\ˆXZÈ[\›HšYÙÙ\œÈÛˆÙ][œ][™™XÛİ™\œÈÛˆH[œ]‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÌ]Ø]\‹[XZËX[\›K˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[•Ø]\“XZĞ[\›J›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™Ø]\‹[XZËX[\›K\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK˜[\›SÛŠKÙ˜[ÙKYKYK˜[ÙK˜[ÙKYK˜[ÙWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[˜[\›Q\\ÛÙ\ËŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™T™XÛİ™\SØœÙ\™YYJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YØ]\“XZĞ[\›KÙ]Ø[\\ÖÌOHÙ]Ø\ÜÙ\™\]X[
[•Ø]\“XZĞ[\›J[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH˜[ˆ\›[Üİ]İÚ]Ú\È]\İ\™\Ú\È™\ÚÛÈ[™™]Z[œÈİ]H™]ÙY[ˆ[H‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÌKY˜[‹]\›[Üİ]˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[‘˜[•\›[Üİ]
›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™˜[‹]\›[Üİ]Z\İ\™\Ú\ÈŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK™˜[“ÛŠKÙ˜[ÙKYKYK˜[ÙK˜[ÙKYK˜[ÙWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™˜[“Û”Ø[\\ËÊNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™˜[•\›[Üİ]™˜[“Ù™ÏLÌNØ\ÜÙ\™\]X[
[‘˜[•\›[Üİ]
[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBˆÛÛœİ[˜[YØ[\O\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YØ[\K™˜[•\›[Üİ]œØ[\\ÖÌOLMLNØ\ÜÙ\™\]X[
[‘˜[•\›[Üİ]
[˜[YØ[\JKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHÓH˜[ˆÛÛ›Û\ˆ[\œÛ]\Èİ\™HÛ›İÈ[™Û[\È[™Ú[È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÌ‹\ÛKY˜[‹XÛÛ›Û\‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[”ÛQ˜[ÛÛ›Û\Š›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œÛKY˜[‹Y]KXİ\™HŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK™]T\˜Ù[
KÌŒÌLLJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YœÛQ˜[ÛÛ›Û\‹˜İ\™VÌWK[\ÏLNNØ\ÜÙ\™\]X[
[”ÛQ˜[ÛÛ›Û\Š[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBˆÛÛœİ[˜[Y]O\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y]KœÛQ˜[ÛÛ›Û\‹˜İ\™VÌWK™]T\˜Ù[LLNØ\ÜÙ\™\]X[
[”ÛQ˜[ÛÛ›Û\Š[˜[Y]JKœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHšYÚYÚİÚ]Ú\ÈHQ™[İÈ]È^™\ÚÛ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÌËX]]ÛX]XË[šYÚ[YÚ˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[]]ÛX]XÓšYÚYÚ
›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›šYÚ[YÚ[^]™\ÚÛŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK›YÛŠKİYKYKYK˜[ÙK˜[ÙKYWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[›YÛ”Ø[\\Ë
NÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y˜]]ÛX]XÓšYÚYÚ›^Ø[\\ÖÌOKLNØ\ÜÙ\™\]X[
[]]ÛX]XÓšYÚYÚ
[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH\œšYØ][ÛˆØ]\œÈÛ›HÚ[ˆH[™\›Z]Y[™˜Z[ÈÙ™ˆÛˆÙ[œÛÜˆ˜][‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÍ\ÛX\Z\œšYØ][Û‹[[Ù[˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[”ÛX\\œšYØ][ÛŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œÛX\Z\œšYØ][Û‹YXÚ\Ú[Û‹\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YKØ]\š[™ÊKİYK˜[ÙK˜[ÙK˜[ÙK˜[ÙKYWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™˜][Ñ˜Z[Ù™‹YJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œÙ[œÛÜ‘˜][ËJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YœÛX\\œšYØ][Û‹œØ[\\ÖÌ×KœÙ[œÛÜ‘˜][Y˜[ÙNØ\ÜÙ\™\]X[
[”ÛX\\œšYØ][ÛŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHØ\˜YÙHÛÜˆ[Z]İÚ]Ú\ÈİÜ[İ[Ûˆ[™™Z™XİÜÜÚ]KY\™Xİ[ÛˆÛÛ[X[™È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÍKYØ\˜YÙKYÛÜ‹XÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[‘Ø\˜YÙQÛÜÛÛ˜Ù\
›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™Ø\˜YÙKYÛÜ‹[[Z]\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK›[ÙJKÈ›Ü[š[™È‹œİÜY‹˜ÛÜÚ[™È‹˜ÛÜÚ[™È‹œİÜY‹œİÜY‹›Ü[š[™È—JNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌ×K˜ÛÛ™›Xİ™Z™XİYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜ÛÛ™›Xİ[™Ô™\]Y\İÔ™Z™XİYJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[››Ñš]™Sİ™\›\YJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™Ø\˜YÙQÛÜÛÛ˜Ù\™]™[ÖÌK˜Xİ[ÛHœ™]™\œÙHØ\ÜÙ\™\]X[
[‘Ø\˜YÙQÛÜÛÛ˜Ù\
[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH[]˜]ÜˆØÚY[\ˆ™\Ù\™\È’Q“ÈØ[È[™YÛ›Ü™\È\XØ]H[™[™È›ÛÜˆ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÍ‹Y[]˜]Ü‹XØ[\]Y]YK˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[‘[]˜]ÜØ[]Y]YJ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™[]˜]Ü‹YšY›ËXØ[\]Y]YHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YKœ]Y]YJKÖÌ×KÌË—KÌË—KÌ—K×K×WJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™\Ü]ÚY\™Ù]ËÌË—JNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™\XØ]PØ[ÒYÛ›Ü™YJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™[]˜]ÜØ[]Y]YK™]™[ÖÌK™›ÛÜMØ\ÜÙ\™\]X[
[‘[]˜]ÜØ[]Y]YJ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHš\™KX[\›H›Û™HÙY\È[\›H\İ[˜İœ›ÛHÜ[‹ÜÚÜ›İX›H[œ]È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÍËYš\™KX[\›K^›Û™KXÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[‘š\™P[\›V›Û™J›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™š\™KX[\›K^›Û™K\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO–Ùœ˜[YK™š\™P[\›Kœ˜[YK›İX›U\WJKÖÙ˜[ÙK[KİYK[KÙ˜[ÙK›Ü[‹XÚ\˜İZ]—KÙ˜[ÙKœÚÜXÚ\˜İZ]—KÙ˜[ÙK[WJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[˜[\›TØ[\\ËJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[›Ü[‘˜][ËJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œÚÜ˜][ËJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™š\™P[\›V›Û™KœØ[\\ÖÌK˜ÛÛ™][ÛH[šÛ›İÛˆØ\ÜÙ\™\]X[
[‘š\™P[\›V›Û™J[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHXØÙ\ÜÈİšZÙH[ØÚÈÜ˜[È[İÛ\İYQÈœšYY›H[™]Y]È[šX[È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÎXXØÙ\ÜËXÛÛ›Û\İšZÙK[ØÚË˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[XØÙ\ÜÔİšZÙSØÚÊ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜XØÙ\ÜË\İšZÙKX[İÛ\İ\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK™XÚ\Ú[ÛŠKÈ™Ü˜[Y‹™[šYY‹™[šYY‹™[šYY‹™Ü˜[Y—JNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YKœİšZÙU[›ØÚÙY
KİYKYKYK˜[ÙKYWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÌWK[›ØÚÕ[[\ËÌ
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[›[ØÚĞ]Y]]™[Ë›[™İJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y˜XØÙ\ÜÔİšZÙSØÚË[›ØÚÑ\˜][Û“\ÏMÌØ\ÜÙ\™\]X[
[XØÙ\ÜÔİšZÙSØÚÊ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHØ\™Zİ\ÙH™XXÛÛˆX\ÈØØİ\[˜ŞH[™˜][˜[œÚ][ÛœÈÈ\İ[˜İİ]]È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌMÎK]Ø\™Zİ\ÙKX™XXÛÛ‹XÛÛ˜Ù\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[•Ø\™Zİ\ÙP™XXÛÛŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™Ø\™Zİ\ÙKX™XXÛÛ‹\İ]K\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO–Ùœ˜[YK™Ü™Y[“Û‹œ˜[YKœ™YÛ‹œ˜[YK˜[X™\“Û‹œ˜[YK˜^™\“Û—JKÖİYK˜[ÙK˜[ÙK˜[ÙWKÙ˜[ÙKYK˜[ÙK˜[ÙWKÙ˜[ÙK˜[ÙKYKYWKİYK˜[ÙK˜[ÙK˜[ÙWWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[˜[œÚ][ÛÛİ[ÊNØ\ÜÙ\™\]X[
™\İ[œ™\İ[›Û™Tİ]\Ô\‘œ˜[YKYJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YØ\™Zİ\ÙP™XXÛÛ‹œØ[\\ÖÌOH[šÛ›İÛˆØ\ÜÙ\™\]X[
[•Ø\™Zİ\ÙP™XXÛÛŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH˜][[›[˜ÚX]ÜˆÛX\œÈÛ›HY\ˆXÚÛ›İÛYÙ[Y[[™[˜Xİ]™H[œ]‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌN[XXÚ[™KY˜][X[›[˜ÚX]Ü‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K[œİ\ÜYŠNÃBˆÛÛœİ™\İ[\[“XXÚ[™Q˜][[›[˜ÚX]ÜŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›XXÚ[™KY˜][[]ÚY\Ù\]Y[˜ÙHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK›]ÚY˜][ÊKÖÈ‘ŒH—KÈ‘ŒH—K×KÈ‘Œˆ—KÈ‘Œˆ—K×WJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[™œ˜[Y\Ë›X\
œ˜[YOO™œ˜[YK˜^™\“ÛŠKİYK˜[ÙK˜[ÙKYKYK˜[ÙWJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÍK™˜][[\Û‹YJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™œ˜[Y\ÖÍWKšX[S[\Û‹YJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y›XXÚ[™Q˜][[›[˜ÚX]Ü‹™]™[ÖÌK˜Xİ]™Q˜][ÏVÈ˜˜YY—NØ\ÜÙ\™\]X[
[“XXÚ[™Q˜][[›[˜ÚX]ÜŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHœ™XY›Ø\™Ú\š[™ÈŞ[˜Ú›Ûš^™\ÈÛÛ\Û™[[™™]Y[]Y\È[ÈØÚ[X]XÈ›Ú™Xİ[Ûˆ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNKXœ™XY›Ø\™\ØÚ[X]XË\Ş[˜Ë˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆÛÛœİÛÛ\Û™[YÏ\›Ú™Xİ˜ÛÛ\Û™[Ë›X\
][OOš][Kš[œİ[˜ÙRY
KœÛÜ

NÃBˆÛÛœİœ™XY›Ø\™Y]Y\ØÛÛ›™Xİ[Š›Ú™Xİœ™\Ú\İÜ‹LNŒˆŠNÃBˆÛÛœİÚ\™YXÛÛ›™Xİ[œÊœ™XY›Ø\™Y]œ™\Ú\İÜ‹LNŒˆ‹›YLNHŠNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
Ú\™Y
K˜[YYJNÃBˆÛÛœİ™\İ[\[œ™XY›Ø\™ØÚ[X]XÔŞ[˜ÊÚ\™Y
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜œ™XY›Ø\™\ØÚ[X]XË\İXİ\˜[\Ş[˜ÈŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œİXİ\˜[Q\]X[YJNØ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[˜ÛÛ\Û™[YËÛÛ\Û™[YÊNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[›™]YËš[˜ÛY\Ê“ŒHŠJNØ\ÜÙ\›ÚÊ™\İ[œ™\İ[›™]YËš[˜ÛY\Ê•ĞÈŠJNØ\ÜÙ\›ÚÊ™\İ[œ™\İ[›™]YËš[˜ÛY\Ê‘Ó‘ŠJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[˜œ™XY›Ø\™™\İ[œ™\İ[œØÚ[X]XÊNÃBŸJNÃBƒB\İ
˜Ø][ÙİYHØÚ[X]XË]ËTĞˆ›Ú™Xİ[Ûˆ™\Ù\™\È]™\HMMH™][™Ú[[ˆ[ˆ[\İ˜]]™HYX\‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌN‹\ØÚ[X]XË\Ø‹\Ş[˜Ë˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİ™\İ[\[”ØÚ[X]XÔØ”Ş[˜Ê›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œØÚ[X]XË\Ø‹[™]\İ\Y\Ş[˜ÈŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[›X\[™Ôİ]\Ëš[\İ˜]]™K][™\šYšYYŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜ÛÛ\Û™[Ûİ[JNØ\ÜÙ\™\]X[
™\İ[œ™\İ[›™]Ûİ[ÊNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œÛİ\˜ÙQ[™Ú[Ûİ[™\İ[œ™\İ[œY[™Ú[Ûİ[
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[›™]\İ™\Ù\™YYJNÃBˆÛÛœİZ\ÜÚ[™Ï\İXİ\™YÛÛ™J›Ú™Xİ
NÛZ\ÜÚ[™ËœØÚ[X]XÔØ”Ş[˜ËœYX\œÜ

NØ\ÜÙ\™\]X[
[”ØÚ[X]XÔØ”Ş[˜ÊZ\ÜÚ[™ÊKœİ]K˜›ØÚÙYŠNÃBˆÛÛœİ\XØ]O\İXİ\™YÛÛ™J›Ú™Xİ
NÙ\XØ]KœØÚ[X]XÔØ”Ş[˜ËœYX\ÌWKœYHŒHØ\ÜÙ\™\]X[
[”ØÚ[X]XÔØ”Ş[˜Ê\XØ]JKœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYH™YK]šY]ÈQY]Ú\™\ÈÛÛ\Û™[Y[]H[™™\İÜ™\È[™ËÜ™YÈÛ˜\ÚİÈ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNË]™YK]šY]Ë[Y\›Ú™Xİ˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆ\ÜÙ\™Y\\]X[
Ù]šY]Ô™XÛÛ˜Ú[X][Û’\ÜİY\Ê›Ú™Xİ˜œ™XY›Ø\™ŠK×JNØ\ÜÙ\™Y\\]X[
Ù]šY]Ô™XÛÛ˜Ú[X][Û’\ÜİY\Ê›Ú™XİœØÚ[X]XÈŠK×JNÃBˆÛÛœİØ’\ÜİY\ÏYÙ]šY]Ô™XÛÛ˜Ú[X][Û’\ÜİY\Ê›Ú™XİœØˆŠNØ\ÜÙ\™\]X[
Ø’\ÜİY\Ë›[™İ
NØ\ÜÙ\›ÚÊØ’\ÜİY\ËœÛÛYJ\ÜİYOOš\ÜİYKš[œİ[˜ÙRYOOHœ™\Ú\İÜ‹LHŠJNÃBˆÛÛœİ™\İ[\[•™YUšY]ÓY\İÜJ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™YK]šY]Ë[Y\Ş[˜ËZ\İÜHŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[˜]˜Z[X›UšY]ÜËÈ˜œ™XY›Ø\™‹œØÚ[X]XÈ‹œØˆ—JNØ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[œ™XÛÛ˜Ú[X][ÛUšY]ËØœ™XY›Ø\™ŒØÚ[X]XÎŒØJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œØ”™XÛÛ˜Ú[X][Û‹›[™İ
NÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[šY[]Y\Ô™\Ù\™YYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œÚ\™YY[]KYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[š\İÜT™\İÜ™YYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™YÔ™\İÜ™YYJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[›ÜšYÚ[˜[˜[YKŒÌÌ3ªHŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™Y]Y˜[YKÌ3ªHŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[[™Õ˜[YKŒÌÌ3ªHŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™YÕ˜[YKÌ3ªHŠNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y™YUšY]ÓY\İÜKš[œİ[˜ÙRYH›Z\ÜÚ[™ÈØ\ÜÙ\™\]X[
[•™YUšY]ÓY\İÜJ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYH[œİ\ÜY‘ĞHXÚØYÙH™XÛÛY\ÈHœ™XY›Ø\™™XÛÛ˜Ú[X][Ûˆ][HÚ]İ]XÙ[Y[‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌN][œİ\ÜYXœ™XY›Ø\™\XÚØYÙK˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNÃBˆÛÛœİ›Ø\™\›Ú™XİÛÛ\Û™[Ñ›Ü•šY]Ê›Ú™Xİ˜œ™XY›Ø\™ŠNØ\ÜÙ\™Y\\]X[
›Ø\™˜ÛÛ\Û™[Ë×JNØ\ÜÙ\™\]X[
›Ø\™œ™XÛÛ˜Ú[X][Û’][\Ë›[™İJNØ\ÜÙ\™\]X[
›Ø\™œ™XÛÛ˜Ú[X][Û’][\ÖÌKš[œİ[˜ÙRY˜™ØHŠNÃBˆÛÛœİØÚ[X]XÏ\›Ú™XİÛÛ\Û™[Ñ›Ü•šY]Ê›Ú™XİœØÚ[X]XÈŠNØ\ÜÙ\™\]X[
ØÚ[X]XË˜ÛÛ\Û™[Ë›[™İJNØ\ÜÙ\™Y\\]X[
ØÚ[X]XËœ™XÛÛ˜Ú[X][Û’][\Ë×JNÃBˆÛÛœİØ\›Ú™XİÛÛ\Û™[Ñ›Ü•šY]Ê›Ú™XİœØˆŠNØ\ÜÙ\™\]X[
Ø‹˜ÛÛ\Û™[Ë›[™İJNØ\ÜÙ\™Y\\]X[
Ø‹œ™XÛÛ˜Ú[X][Û’][\Ë×JNÃBˆÛÛœİ™\İ[\[•[œİ\ÜYœ™XY›Ø\™XÚØYÙJ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™[œİ\ÜYXœ™XY›Ø\™\XÚØYÙK\™XÛÛ˜Ú[X][ÛˆŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜œ™XY›Ø\™XÙY˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œØÚ[X]XÔXÙYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œØ”XÙYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™˜XœšXØ][Û”]X[YšYY˜[ÙJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜ÛZ[\ÓX[Y˜Xİ\˜X›K˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y[œİ\ÜYœ™XY›Ø\™XÚØYÙKš[œİ[˜ÙRYH›Z\ÜÚ[™ÈØ\ÜÙ\™\]X[
[•[œİ\ÜYœ™XY›Ø\™XÚØYÙJ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYHZ\ÜÚ[™ËY›Ûİš[ÛÜšÙ›İÈ›ØÚÜÈĞˆ\]H[™™]\›œÈ™\]Z\™Y™\ÛÛ][Ûˆ™\Ü‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNK[Z\ÜÚ[™ËY›Ûİš[]ÛÜšÙ›İË˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê›Ú™Xİ
Kœİ]K˜ÛÛ\]HŠNÃBˆÛÛœİ™Y›Ü™O\Ù\šX[^™T›Ú™Xİ
›Ú™Xİ
K™\İ[\[“Z\ÜÚ[™Ñ›Ûİš[ÛÜšÙ›İÊ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›Z\ÜÚ[™ËY›Ûİš[\™\ÛÛ][Û‹\™\ÜŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œØ•\]P›ØÚÙYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ›Ú™Xİ[˜Ú[™ÙYYJNØ\ÜÙ\™\]X[
Ù\šX[^™T›Ú™Xİ
›Ú™Xİ
K™Y›Ü™JNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[›Z\ÜÚ[™Ñ›Ûİš[Ûİ[›Ú™Xİ˜ÛÛ\Û™[Ë›[™İ
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œXÙYÛÛ\Û™[Ûİ[
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\]Z\™Y™\Üœİ]\Ëœ™\]Z\™YŠNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[›Z\ÜÚ[™Ñ›Ûİš[ËœÛÛYJ][OOš][Kœ™Y™\™[˜ÙOOOH•LH‰‰š][Kœ\OOH˜Xİ]™K›™MMMHŠJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\]Z\™Y™\Ü˜›ØÚÙY™Y™\™[˜Ù\Ë›[™İ›Ú™Xİ˜ÛÛ\Û™[Ë›[™İ
NÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\]Z\™Y™\Üœ™\ÛÛ][Û“Ü[ÛœË›[™İÊNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜]]ÛX]XÔİXœİ]][Û‹˜[ÙJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[[™\šYšYY›Ûİš[Ğ\ÜÚYÛ™Y˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y›Z\ÜÚ[™Ñ›Ûİš[ÛÜšÙ›İË\™Ù]šY]ÏH˜œ™XY›Ø\™Ø\ÜÙ\™\]X[
[“Z\ÜÚ[™Ñ›Ûİš[ÛÜšÙ›İÊ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYH[‹Z[˜ÛÛ\]X›HİXœİ]][Ûˆ\È™]šY]ÙY›ØÚÙY[™Ø[˜Ù[YÚ]İ]Ú[™Ú[™ÈÜšYÚ[˜[‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌN‹\[‹Z[˜ÛÛ\]X›K\İXœİ]][Û‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
›Ú™Xİ
K˜[YYJNØÛÛœİ™Y›Ü™O\Ù\šX[^™T›Ú™Xİ
›Ú™Xİ
NÃBˆÛÛœİ™]šY]ÏXÜ™X]T\İXœİ]][Û”™]šY]Ê›Ú™Xİ
NØ\ÜÙ\™\]X[
™]šY]Ëœİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™]šY]Ë˜›ØÚÙYYJNØ\ÜÙ\™\]X[
™]šY]ËœÛİ\˜ÙT\œ[œË›[™İ
NØ\ÜÙ\™\]X[
™]šY]Ë˜Ø[™Y]Kœ[œË›[™İ
NÃBˆ\ÜÙ\™Y\\]X[
™]šY]ËœÚ\™Y[“˜[Y\Ë×JNØ\ÜÙ\™\]X[
™]šY]Ë[›X\Y\ÙY[œË›[™İ
NØ\ÜÙ\›ÚÊ™]šY]Ë˜Y™™XİY™]Ëš[˜ÛY\Ê•SRS‘ÈŠJNÃBˆÛÛœİØ[˜Ù[YXØ[˜Ù[\İXœİ]][Û”™]šY]Ê™]šY]ÊNØ\ÜÙ\™\]X[
Ø[˜Ù[Y˜Ø[˜Ù[YYJNØ\ÜÙ\™\]X[
Ù\šX[^™T›Ú™Xİ
Ø[˜Ù[Yœ›Ú™Xİ
K™Y›Ü™JNØ\ÜÙ\™\]X[
Ù\šX[^™T›Ú™Xİ
›Ú™Xİ
K™Y›Ü™JNÃBˆÛÛœİ™\İ[\[”[’[˜ÛÛ\]X›TİXœİ]][ÛŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œ[‹Z[˜ÛÛ\]X›K\İXœİ]][Û‹\™]šY]ÈŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œİXœİ]][Û›ØÚÙYYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™]šY]ĞØ[˜Ù[YYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ›Ú™Xİ[˜Ú[™ÙYYJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[›ÜšYÚ[˜[Xœ˜\RY˜Xİ]™K›™MMMHŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜Ø[™Y]SXœ˜\RY˜Xİ]™K›LÎ‹XÛ\ÜØXˆŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[[›X\Y\ÙY[œË›[™İ
NÃBŸJNÃB\İ
˜Ø][ÙİYHÒH[š]ÛÛ™\\ˆ™]\›œÈ™\Ú\İÜ‹İÙ\‹[™İ[™›İ[™Y™\İ[È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNË][š]XÛÛ™\œÚ[Û‹XØ[İ[]Ü‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[•[š]ÛÛ™\œÚ[ÛØ[İ[]ÜŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œÚK][š]XÛÛ™\œÚ[Û‹XØ\Ù\ÈŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[œ™\İ[Ë›X\
][OOš][K˜ÛÛ™\Y˜[YJKÍÌŒKŒLKKŒŒÍM×JNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[œ™\İ[Ë›X\
][OOš][K™[Y[œÚ[ÛŠKÈœ™\Ú\İ[˜ÙH‹œİÙ\ˆ‹›[™İ‹œ™\Ú\İ[˜ÙH—JNÃBˆ\ÜÙ\™Y\\]X[
ÛÛ™\[™Ú[™Y\š[™Õ[š]
‹Œ‹šóªH‹³ªHŠKÛÚÎYK˜[YNŒŒŒ[Y[œÚ[Ûˆœ™\Ú\İ[˜ÙH‹œ›ÛU[š]ˆšóªH‹Õ[š]ˆ³ªH‹™XÚ\Ú[ÛŸJNÃBˆ\ÜÙ\™\]X[
ÛÛ™\[™Ú[™Y\š[™Õ[š]
KšóªH‹›UÈŠK›ÚË˜[ÙJNØ\ÜÙ\™\]X[
ÛÛ™\[™Ú[™Y\š[™Õ[š]
[™š[š]K›[H‹›HŠK›ÚË˜[ÙJNØ\ÜÙ\™\]X[
ÛÛ™\[™Ú[™Y\š[™Õ[š]
K›H‹›H‹LÊK›ÚË˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y[š]ÛÛ™\œÚ[ÛØ[İ[]Ü‹˜Ø\Ù\ÖÌK™œ›ÛU[š]H›UÈØ\ÜÙ\™\]X[
[•[š]ÛÛ™\œÚ[ÛØ[İ[]ÜŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYH™\Ú\İÜˆÛÛÜ‹XÛÙH™XY\ˆXÛÙ\È›İ\‹Ùš]™KX˜[™˜[Y\È[™™Z™XİÈ[˜[Y˜[™È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌN\™\Ú\İÜ‹XÛÛÜ‹XÛÙK\™XY\‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[”™\Ú\İÜÛÛÜÛÙT™XY\Š›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œ™\Ú\İÜ‹XÛÛÜ‹XÛÙKXØ\Ù\ÈŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜[YÛİ[ŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™Z™XİYÛİ[ŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\İ[ÖÌKœ™XY[™Ëœ™\Ú\İ[˜ÙSÚ\ËÌ
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\İ[ÖÌKœ™XY[™ËÛ\˜[˜ÙT\˜Ù[JNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\İ[ÖÌWKœ™XY[™Ëœ™\Ú\İ[˜ÙSÚ\ËL
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\İ[ÖÌWKœ™XY[™ËÛ\˜[˜ÙT\˜Ù[JNÃBˆ\ÜÙ\™\]X[
™XY™\Ú\İÜ˜[™ÊÈ™ÛÛ‹˜œ›İÛˆ‹œ™Y‹™ÛÛ—JK˜[Y˜[ÙJNØ\ÜÙ\™\]X[
™XY™\Ú\İÜ˜[™ÊÈ˜œ›İÛˆ‹˜›XÚÈ‹œ[šÈ‹™ÛÛ—JK˜[Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
™XY™\Ú\İÜ˜[™ÊÈY[İÈ‹š[Û]‹œ™Y‹™ÛÛ—JK™›Ü›X]Y™\Ú\İ[˜ÙKÈóªHŠNØ\ÜÙ\™\]X[
™XY™\Ú\İÜ˜[™ÊÈ˜œ›İÛˆ‹˜›XÚÈ‹˜›XÚÈ‹˜œ›İÛˆ‹˜œ›İÛˆ—JK™›Ü›X]Y™\Ú\İ[˜ÙKŒHóªHŠNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Yœ™\Ú\İÜÛÛÜÛÙT™XY\‹˜Ø\Ù\ÏV×NØ\ÜÙ\™\]X[
[”™\Ú\İÜÛÛÜÛÙT™XY\Š[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYHQ™\Ú\İÜˆØ[İ[]Üˆ›İ[™È\Ø\™ÈLLˆ[™Ø\›œÈÛˆ™\Ú\İÜˆİÙ\ˆ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNK[Y\™\Ú\İÜ‹XØ[İ[]Ü‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[“Y™\Ú\İÜØ[İ[]ÜŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›Y\Ù\šY\Ë\™\Ú\İÜ‹XØ\Ù\ÈŠNÃBˆÛÛœİÜ™Y›YKİÙ\—O\™\İ[œ™\İ[œ™\İ[ÎØ\ÜÙ\›ÚÊX]˜XœÊ™Yœ™\]Z\™Y™\Ú\İ[˜ÙSÚ\ËLLÌ
OYKNJNØ\ÜÙ\™\]X[
™Yœ™XÛÛ[Y[™Y™\Ú\İ[˜ÙSÚ\ËML
NØ\ÜÙ\›ÚÊ™Y™\İ[X]Yİ\œ™[PO\™Y\™Ù]İ\œ™[PJNÃBˆ\ÜÙ\™\]X[
›YKœ™XÛÛ[Y[™Y™\Ú\İ[˜ÙSÚ\ËML
NØ\ÜÙ\›ÚÊ›YK™\İ[X]Yİ\œ™[POX›YK\™Ù]İ\œ™[PJNÃBˆ\ÜÙ\™\]X[
İÙ\‹œ™XÛÛ[Y[™Y™\Ú\İ[˜ÙSÚ\ËMŒ
NØ\ÜÙ\›ÚÊİÙ\‹Ø\›š[™ÜËœÛÛYJØ\›š[™ÏOØ\›š[™Ë˜ÛÙOOOH”‘TÒTÕÔ—ÔÕÑT—ÑVÑQQQŠJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œİÙ\•Ø\›š[™ĞÛİ[JNÃBˆ\ÜÙ\™\]X[
Ø[İ[]SYÙ\šY\Ô™\Ú\İÜŠÜİ\U›ÛYÙUŒ‹Y›ÜØ\™›ÛYÙUŒ‹\™Ù]İ\œ™[PNŒL™\Ú\İÜ”İÙ\”˜][™ÕÎŒŒL_JK›ÚË˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y›Y™\Ú\İÜØ[İ[]Ü‹˜Ø\Ù\ÖÌK\™Ù]İ\œ™[POLØ\ÜÙ\™\]X[
[“Y™\Ú\İÜØ[İ[]ÜŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYH›ÛYÙKY]šY\ˆØ[İ[]Üˆ™\ÜÈ[›ØYY˜][È[™ØY\ÚYØ\›š[™È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNL]›ÛYÙKY]šY\‹XØ[İ[]Ü‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[•›ÛYÙQ]šY\Ø[İ[]ÜŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›ÛYÙKY]šY\‹XØ\Ù\ÈŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[›ØY[™ÕØ\›š[™ĞÛİ[JNÃBˆÛÛœİÛÜ[‹YÚX]WO\™\İ[œ™\İ[œ™\İ[ÎØ\ÜÙ\™\]X[
Ü[‹[›ØYYİ]]‹ŠNØ\ÜÙ\™\]X[
Ü[‹›ØYYİ]]‹ŠNØ\ÜÙ\™\]X[
Ü[‹›ØY[™ĞÚ[™ÙT\˜Ù[
NÃBˆ\ÜÙ\›ÚÊX]˜XœÊYÚ›ØYYİ]]‹MKÌMMÌMMÌM
OYKNJNØ\ÜÙ\›ÚÊYÚ›ØY[™ĞÚ[™ÙT\˜Ù[JNÃBˆ\ÜÙ\™\]X[
X]K›ØYYİ]]‹
NØ\ÜÙ\›ÚÊX]K›ØY[™ĞÚ[™ÙT\˜Ù[ŒÌ
NØ\ÜÙ\›ÚÊX]KØ\›š[™ÜËœÛÛYJØ\›š[™ÏOØ\›š[™Ë˜ÛÙOOOH‘U’QT—ÓĞQS‘ÈŠJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]U›ÛYÙQ]šY\ŠÚ[œ]›ÛYÙUŒL‹™\Ú\İ[˜ÙUÜÚ\ÎŒ™\Ú\İ[˜ÙP›İÛSÚ\ÎŒLJK›ÚË˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]U›ÛYÙQ]šY\ŠÚ[œ]›ÛYÙUŒL‹™\Ú\İ[˜ÙUÜÚ\ÎŒL™\Ú\İ[˜ÙP›İÛSÚ\ÎŒLØY™\Ú\İ[˜ÙSÚ\ÎŒJK›ÚË˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y›ÛYÙQ]šY\Ø[İ[]Ü‹˜Ø\Ù\ÖÌKš[œ]›ÛYÙULØ\ÜÙ\™\]X[
[•›ÛYÙQ]šY\Ø[İ[]ÜŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYHÈ[Z[™ÈØ[İ[]Üˆ[™\ÈXÚ[X[™\Ú\İ[˜ÙH[™Ø\XÚ][˜ÙH™Yš^\È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNLK\˜Ë][Z[™ËXØ[İ[]Ü‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[”˜Õ[Z[™ĞØ[İ[]ÜŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œ˜Ë][Z[™ËXØ\Ù\ÈŠNÃBˆÛÛœİØK‹×O\™\İ[œ™\İ[œ™\İ[ÎØ\ÜÙ\›ÚÊX]˜XœÊK[YPÛÛœİ[ÙXÛÛ™ËLŒJOYKLLŠNØ\ÜÙ\›ÚÊX]˜XœÊK˜İ]Ù™‘œ™\]Y[˜ŞR‹LMNKŒMMMÌLNJOYKN
NÃBˆ\ÜÙ\›ÚÊX]˜XœÊ‹[YPÛÛœİ[ÙXÛÛ™ËLŒÊOYKLLŠNØ\ÜÙ\›ÚÊX]˜XœÊ‹˜İ]Ù™‘œ™\]Y[˜ŞR‹LËŒÎŒÍLÎJOYKN
NÃBˆ\ÜÙ\›ÚÊX]˜XœÊË[YPÛÛœİ[ÙXÛÛ™ËL‹Œ™KMŠOYKLMJNØ\ÜÙ\›ÚÊX]˜XœÊË˜İ]Ù™‘œ™\]Y[˜ŞR‹MÌŒÍËŒMMNMLJOYKMJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]T˜Õ[Z[™ÊÜ™\Ú\İ[˜ÙU˜[YNŒ™\Ú\İ[˜ÙU[š]ˆšóªH‹Ø\XÚ][˜ÙU˜[YNŒKØ\XÚ][˜ÙU[š]ˆ°­QˆŸJK›ÚË˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]T˜Õ[Z[™ÊÜ™\Ú\İ[˜ÙU˜[YNŒK™\Ú\İ[˜ÙU[š]ˆšóªH‹Ø\XÚ][˜ÙU˜[YNŒKØ\XÚ][˜ÙU[š]ˆ›sªHŸJK›ÚË˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Yœ˜Õ[Z[™ĞØ[İ[]Ü‹˜Ø\Ù\ÖÌK˜Ø\XÚ][˜ÙU˜[YOKLNØ\ÜÙ\™\]X[
[”˜Õ[Z[™ĞØ[İ[]ÜŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYHÜX[\ØZ[ˆØ[İ[]ÜˆÛİ™\œÈ›İÜÛÙÚY\È[™™Z™XİÈ™\›ÈÜˆ[˜[Y™\Ú\İÜœÈ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNL‹[ÜX[\YØZ[‹XØ[İ[]Ü‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[“Ü[\ØZ[Ø[İ[]ÜŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›ÜX[\YØZ[‹XØ\Ù\ÈŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[œ™\İ[Ë›X\
][OOš][K™ØZ[ŠKËLLL—JNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\İ[ÖÌKœ\ÙR[™\YYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™\İ[ÖÌWKœ\ÙR[™\Y˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]SÜ[\ØZ[ŠØÛÛ™šYİ\˜][Ûˆš[™\[™È‹[œ]™\Ú\İ[˜ÙSÚ\ÎŒ™YY˜XÚÔ™\Ú\İ[˜ÙSÚ\ÎŒLJK›ÚË˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]SÜ[\ØZ[ŠØÛÛ™šYİ\˜][Ûˆ››Û‹Z[™\[™È‹™YY˜XÚÔ™\Ú\İ[˜ÙSÚ\Î‹LKÜ›İ[™™\Ú\İ[˜ÙSÚ\ÎŒLJK›ÚË˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]SÜ[\ØZ[ŠØÛÛ™šYİ\˜][Ûˆ˜Y™™\ˆ‹™YY˜XÚÔ™\Ú\İ[˜ÙSÚ\ÎŒLÜ›İ[™™\Ú\İ[˜ÙSÚ\ÎŒLJK›ÚË˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y›Ü[\ØZ[Ø[İ[]Ü‹˜Ø\Ù\ÖÌK™™YY˜XÚÔ™\Ú\İ[˜ÙSÚ\ÏLØ\ÜÙ\™\]X[
[“Ü[\ØZ[Ø[İ[]ÜŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYHĞˆ˜XÙK]ÚYYš\ÛÜˆ›İšY\ÈØÛÜY^\›˜[Ú[\›˜[\İ[X]\È[™™Z™XİÈ[˜[Y[œ]È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNLË\Ø‹]˜XÙK]ÚYXYš\ÛÜ‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[”Ø•˜XÙUÚYYš\ÛÜŠ›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œØ‹]˜XÙK]ÚYXYš\ÛÜHŠNØ\ÜÙ\›X]Ú
™\İ[œ™\İ[œİ[™\™[Z]][Û‹ÒTËLŒML‹ÊNÃBˆÛÛœİÙ^\›˜[[\›˜[O\™\İ[œ™\İ[œ™\İ[ÎØ\ÜÙ\›ÚÊX]˜XœÊ^\›˜[ÚY[KLÎMÍÍŒJOYKNJNØ\ÜÙ\›ÚÊX]˜XœÊ[\›˜[ÚY[KL‹ŒÌŒML
OYKNJNØ\ÜÙ\›ÚÊ[\›˜[ÚY[O™^\›˜[ÚY[JNÃBˆ\ÜÙ\™\]X[
Ø[İ[]TØ•˜XÙUÚY
Øİ\œ™[NŒÛÜ\•XÚÛ™\ÜÕ[NŒÍK[\\˜]\™Tš\ÙPÎŒL^Y\•\Nˆ™^\›˜[ŸJK›ÚË˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]TØ•˜XÙUÚY
Øİ\œ™[NŒKÛÜ\•XÚÛ™\ÜÕ[N‹LK[\\˜]\™Tš\ÙPÎŒL^Y\•\Nˆ™^\›˜[ŸJK›ÚË˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ø[İ[]TØ•˜XÙUÚY
Øİ\œ™[NŒKÛÜ\•XÚÛ™\ÜÕ[NŒÍK[\\˜]\™Tš\ÙPÎŒL^Y\•\Nˆ[šÛ›İÛˆŸJK›ÚË˜[ÙJNÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[YœØ•˜XÙUÚYYš\ÛÜ‹˜Ø\Ù\ÖÌK[\\˜]\™Tš\ÙPÏLØ\ÜÙ\™\]X[
[”Ø•˜XÙUÚYYš\ÛÜŠ[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃBƒB\İ
˜Ø][ÙİYH“ÓH^ÜÜ›İ\È™\šYšYYšY[È[™X]™\È[œÛİ\˜ÙYÛÜİ›[šÈ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNMX›ÛKY^ÜXÛÜİ\XÙZÛ\‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[›ÛQ^ÜXÙZÛ\Š›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜›ÛKXÛÜİ\XÙZÛ\ˆŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[š][PÛİ[
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ›İĞÛİ[
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[İ[ÛÜİ[
NÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[œ›İÜË™]™\J›İÏOœ›İË[š]ÛÜİOO[[	‰œ›İË™^[™YÛÜİOO[[
JNÃBˆÛÛœİÜİY^Ü›ÛPÜİŠZ[›ÛT™\Ü
›Ú™Xİ
JNØ\ÜÙ\™\]X[
Üİ‹›ÚËYJNÃBˆ\ÜÙ\›X]Ú
Üİ‹˜Üİ‹È•[š]ÛÜİ‹‘^[™YÛÜİ‹İ\œ™[˜ŞH‹”šXÙHÛİ\˜ÙH‹”šXÙH\ÈÙˆ‹ÊNÃBˆ\ÜÙ\›ÚÊÜİ‹˜Üİ‹œÜ]
——ˆŠK™š[\Š›ÛÛX[ŠK™]™\J[™OOˆ[[™Kš[˜ÛY\Ê‰ŠI‰ˆ[[™Kš[˜ÛY\Ê—ŒˆŠJJNÃBˆÛÛœİÜ›İ\Y\İXİ\™YÛÛ™J›Ú™Xİ
NÙÜ›İ\Y˜ÛÛ\Û™[Ëœ\Ú
Ë‹‹œİXİ\™YÛÛ™J›Ú™Xİ˜ÛÛ\Û™[ÖÌWJK[œİ[˜ÙRYˆœ™\Ú\İÜ‹Lˆ‹™Y™\™[˜ÙNˆ”‹Œ—ˆŸJNÃBˆÛÛœİÜ›İ\Y™\ÜXZ[›ÛT™\Ü
Ü›İ\Y
NØÛÛœİ™\Ú\İÜ”›İÏYÜ›İ\Y™\Üœ›İÜË™š[™
›İÏOœ›İË›Xœ˜\RYOOHœ\ÜÚ]™Kœ™\Ú\İÜˆŠNÃBˆ\ÜÙ\™\]X[
™\Ú\İÜ”›İËœ]X[]KŠNØ\ÜÙ\™\]X[
™\Ú\İÜ”›İËœ™Y™\™[˜Ù\Ë”‹Œ—‹ŒHŠNÃBˆ\ÜÙ\›X]Ú
^Ü›ÛPÜİŠÜ›İ\Y™\Ü
K˜Üİ‹È”‹ˆŒˆˆ‹ŒH‹ÊNÃBˆÛÛœİšXÙY\İXİ\™YÛÛ™J›Ú™Xİ
NÜšXÙY˜ÛÛ\Û™[ÖÌWK™\šYšYYšXÙO^İ[š]ÛÜİŒŒL‹İ\œ™[˜ŞNˆ‘UTˆ‹Ûİ\˜ÙNˆšÎ‹ËÙ^[\K˜ÛÛKÜ\ËÜ™\Ú\İÜˆ‹\ÓÙˆŒŒ‹LLLÌŸNÃBˆÛÛœİšXÙY™\ÜXZ[›ÛT™\Ü
šXÙY
NØ\ÜÙ\™\]X[
šXÙY™\Üœ›İÜË™š[™
›İÏOœ›İË›Xœ˜\RYOOHœ\ÜÚ]™Kœ™\Ú\İÜˆŠK™^[™YÛÜİŒLŠNØ\ÜÙ\™\]X[
šXÙY™\Üİ[ÛÜİ[
NÃBˆÛÛœİ[˜[Y\İXİ\™YÛÛ™J›Ú™Xİ
NÚ[˜[Y˜ÛÛ\Û™[ÖÌK›Xœ˜\RYH[šÛ›İÛ‹œ\Ø\ÜÙ\™\]X[
[›ÛQ^ÜXÙZÛ\Š[˜[Y
Kœİ]K˜›ØÚÙYŠNÃBŸJNÃB\İ
˜Ø][ÙİYHYYİ[ˆ“ÕÛÛ\Û™[^Z[™\ˆÚ]\ÈÛİ\˜ÙHšY[È[™\ØÛÜÙ\È[šÛ›İÛœÈ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNMKX›İY^Z[‹XÛÛ\Û™[˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[›İÛÛ\Û™[^Z[™\Š›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜›İYÜ›İ[™YXÛÛ\Û™[Y^[˜][ÛˆŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œ™Y™\™[˜ÙK”ŒHŠNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[šÛ›İÛ‹œÛÛYJ][OOš][K™šY[OOHÛÛ™šYİ\™Y˜[YH‰‰š][K˜[YOOOHŒÌÌ3ªH‰‰š][KœÛİ\˜ÙOOOH“˜]]™H›Ú™XİŠJNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[šÛ›İÛ‹œÛÛYJ][OOš][K™šY[OOH“Xœ˜\H\ØÜš\[Ûˆ‰‰š][KœÛİ\˜ÙOOOHÚXÚÙYZ[ˆÛÛ\Û™[Xœ˜\HŠJNÃBˆ\ÜÙ\›X]Ú
™\İ[œ™\İ[˜[œİÙ\‹ÔÛİ\˜Ù\Îˆ˜]]™H›Ú™Xİ[™ÚXÚÙYZ[ˆÛÛ\Û™[Xœ˜\KÊNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[[šÛ›İÛ‹œÛÛYJ][OO‹ÓX[Y˜Xİ\™\ˆ\È›İ™XÛÜ™YË\İ
][JJJNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[[šÛ›İÛ‹œÛÛYJ][OOš][Kš[˜ÛY\Ê“X[Y˜Xİ\™\ˆ\[X™\ˆ
TŠH\È›İ™XÛÜ™YˆŠJJNÃBˆ\ÜÙ\›ÚÊ™\İ[œ™\İ[[šÛ›İÛ‹œÛÛYJ][OO‹Ù]\ÚY][šÈ\È›İ™XÛÜ™YË\İ
][JJJNÃBˆ\ÜÙ\›X]Ú
™\İ[›Y\ÜØYÙKÛ›È^\›˜[RHÜˆÙXˆÛÚİ\ÚJNÃBˆ\ÜÙ\™\]X[
^Z[ÛÛ\Û™[
›Ú™Xİ›Z\ÜÚ[™Ë\™Y™\™[˜ÙHŠK›ÚË˜[ÙJNÃBˆÛÛœİ[œİ\ÜY\İXİ\™YÛÛ™J›Ú™Xİ
Nİ[œİ\ÜY˜ÛÛ\Û™[ÖÌWK›Xœ˜\RYH[™\šYšYYœ\Ø\ÜÙ\™\]X[
^Z[ÛÛ\Û™[
[œİ\ÜY”ŒHŠK›ÚË˜[ÙJNÃBŸJNÃB\İ
˜Ø][ÙİYH“Õ›Ø][™Ë[›ÙH™\Z\ˆ™]šY]È˜[Y]\ÈÙ\\˜][H[™™\]Z\™\ÈÛÛ™š\›X][Ûˆ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNM‹X›İY›Ø][™Ë[›ÙK\™\Z\‹\™]šY]Ë˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™Y›Ü™OR”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
NØÛÛœİ™\İ[\[›İ›Ø][™Ó›ÙT™\Z\Š›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜›İY›Ø][™Ë[›ÙK\™\Z\‹\™]šY]ÈŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜[Y][Û•˜[YYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜\YY˜[ÙJNÃBˆ\ÜÙ\™\]X[
”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
K™Y›Ü™JNØ\ÜÙ\™\]X[
™\İ[œ™]šY]Ë˜Ø[™Y]K˜ÛÛ\Û™[Ë›[™İ›Ú™Xİ˜ÛÛ\Û™[Ë›[™İ
ÌJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™]šY]Ëœ›ÜÜØ[˜[YKŒHsªHŠNØ\ÜÙ\™\]X[
™\İ[œ™]šY]Ëœ›ÜÜØ[™œ›ÛK‘“ĞUS‘ÈŠNØ\ÜÙ\™\]X[
™\İ[œ™]šY]Ëœ›ÜÜØ[Ë‘Ó‘ŠNÃBˆ\ÜÙ\™\]X[
\P›İ›Ø][™Ó›ÙT™\Z\”™]šY]Ê›Ú™Xİ™\İ[œ™]šY]ËØÛÛ™š\›YY™˜[Ù_JK˜\YY˜[ÙJNØ\ÜÙ\™\]X[
”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
K™Y›Ü™JNÃBˆÛÛœİXØÙ\YX\P›İ›Ø][™Ó›ÙT™\Z\”™]šY]Ê›Ú™Xİ™\İ[œ™]šY]ËØÛÛ™š\›YYY_JNØ\ÜÙ\™\]X[
XØÙ\Y˜\YYYJNØ\ÜÙ\™\]X[
XØÙ\Yœ›Ú™Xİ˜ÛÛ\Û™[Ë›[™İ›Ú™Xİ˜ÛÛ\Û™[Ë›[™İ
ÌJNÃBˆÛÛœİÚ[™ÙY\İXİ\™YÛÛ™J›Ú™Xİ
NØÚ[™ÙY›Y]Y]K›˜[YJÏHˆY]YØÛÛœİİ[OX\P›İ›Ø][™Ó›ÙT™\Z\”™]šY]ÊÚ[™ÙY™\İ[œ™]šY]ËØÛÛ™š\›YYY_JNØ\ÜÙ\™\]X[
İ[K˜\YY˜[ÙJNØ\ÜÙ\™\]X[
İ[Kœ›Ú™XİÚ[™ÙY
NÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
XØÙ\Yœ›Ú™Xİ
K˜[YYJNÃBŸJNÃB\İ
˜Ø][ÙİYH“ÕLˆˆQ›ÜÜØ[˜[Y]\ÈÙ\\˜][H[™™Z™Xİ[Ûˆ™\Ù\™\ÈH›Ú™Xİ‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNMËX›İXÚ\˜İZ]\›ÜÜØ[˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™Y›Ü™OR”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
NØÛÛœİ™\İ[\[›İÚ\˜İZ]›ÜÜØ[
›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™˜›İLL‹[YXÚ\˜İZ]\›ÜÜØ[ŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜\YY˜[ÙJNÃBˆ\ÜÙ\™\]X[
™\İ[œ™]šY]Ëœ›ÜÜØ[œÛİ\˜ÙKŒLˆˆŠNØ\ÜÙ\™\]X[
™\İ[œ™]šY]Ëœ›ÜÜØ[œ™\Ú\İÜ‹ŒL3ªHŠNÃBˆ\ÜÙ\›ÚÊX]˜XœÊ™\İ[œ™]šY]Ëœ›ÜÜØ[™\İ[X]Yİ\œ™[KLŒJOYKLLŠNØ\ÜÙ\›ÚÊX]˜XœÊ™\İ[œ™]šY]Ëœ›ÜÜØ[œ™\Ú\İÜ‘\ÜÚ\][Û•ËLŒJOYKLLŠNÃBˆ\ÜÙ\™\]X[
˜[Y]T›Ú™Xİ
™\İ[œ™]šY]Ë˜Ø[™Y]JK˜[YYJNØ\ÜÙ\™\]X[
[”İ\ÜY[˜[\Ú\Ê™\İ[œ™]šY]Ë˜Ø[™Y]JKœİ]K˜ÛÛ\]HŠNÃBˆ\ÜÙ\™\]X[
”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
K™Y›Ü™JNÃBˆÛÛœİ™Z™XİYX\P›İÚ\˜İZ]›ÜÜØ[
›Ú™Xİ™\İ[œ™]šY]ËØÛÛ™š\›YY™˜[Ù_JNØ\ÜÙ\™\]X[
™Z™XİY˜\YY˜[ÙJNØ\ÜÙ\™\]X[
™Z™XİYœ›Ú™Xİ›Ú™Xİ
NØ\ÜÙ\™\]X[
”ÓÓ‹œİš[™ÚYJ›Ú™Xİ
K™Y›Ü™JNÃBˆÛÛœİİ[O\İXİ\™YÛÛ™J›Ú™Xİ
NÜİ[K›Y]Y]K›˜[YJÏHˆÚ[™ÙYØ\ÜÙ\™\]X[
\P›İÚ\˜İZ]›ÜÜØ[
İ[K™\İ[œ™]šY]ËØÛÛ™š\›YYY_JK˜\YY˜[ÙJNÃBˆÛÛœİXØÙ\YX\P›İÚ\˜İZ]›ÜÜØ[
›Ú™Xİ™\İ[œ™]šY]ËØÛÛ™š\›YYY_JNØ\ÜÙ\™\]X[
XØÙ\Y˜\YYYJNØ\ÜÙ\™\]X[
XØÙ\Yœ›Ú™Xİ˜ÛÛ\Û™[Ë™š[™
][OOš][K›Xœ˜\RYOOHœİÙ\‹™Ë\Ûİ\˜ÙHŠK˜[YKŒLˆˆŠNÃBŸJNÃB\İ
˜Ø][ÙİYH›İ\‹[[™İXYÙHRHİÙY\Ûİ™\œÈ˜[œÛ][ÛœËXØÙ\ÜÚX›H˜[Y\Ë[™™\ÜÛœÚ]™Hİ™\™›İÈİX\™È‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNNY›İ\‹[[™İXYÙK]ZK\İÙY\˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİ™\İ[\[‘›İ\“[™İXYÙUZTİÙY\
›Ú™Xİ
NØ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™™›İ\‹[[™İXYÙK]ZK\İÙY\ŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[›ØØ[PÛİ[
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[›Z\ÜÚ[™Õ˜[œÛ][ÛœË
NÃBˆÛÛœİ[X]ØZ]™XYš[J™]ÈT“
‹‹‹Ú[™^š[‹[\Ü›Y]K\›
K]ŠNØÛÛœİÜÜÏX]ØZ]™XYš[J™]ÈT“
‹‹‹Üİ[\Ë˜ÜÜÈ‹[\Ü›Y]K\›
K]ŠNÃBˆÛÛœİ]Y]X]Y]ZTÛİ\˜ÙJ[ÜÜÊNØ\ÜÙ\™\]X[
]Y]œ\ÜÙYYK”ÓÓ‹œİš[™ÚYJ]Y]
JNØ\ÜÙ\™\]X[
]Y]›Z\ÜÚ[™Õ˜[œÛ][ÛœË›[™İ
NØ\ÜÙ\™\]X[
]Y][™XÛ\™YÙ^\Ë›[™İ
NØ\ÜÙ\™Y\\]X[
]Y][›X™[Y]ÛœË×JNØ\ÜÙ\™Y\\]X[
]Y][›X™[YÛÛ›ÛË×JNØ\ÜÙ\™Y\\]X[
]Y][›X™[Y[XYÙ\Ë×JNØ\ÜÙ\™Y\\]X[
]Y]™˜Z[YİX\™Ë×JNØ\ÜÙ\™\]X[
]Y]œ™[™\™Y^[ÚXÚË˜[ÙJNÃBŸJNÃB\İ
˜Ø][ÙİYHÙ™›[™H™XÛİ™\H™\İÜ™\ÈH[œØ]™YY][™™\Ù\™\ÈHX[X[^ÜÛˆİÜ˜YÙH˜Z[\™H‹\Ş[˜È

HOˆÃBˆÛÛœİ›Ú™XİR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌNNK[ØØ[[Ù™›[™K\™XÛİ™\K˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİÜšYÚ[˜[\Ù\šX[^™T›Ú™Xİ
›Ú™Xİ
NØÛÛœİ™\İ[\[“Ù™›[™T™XÛİ™\TØÙ[˜\š[Ê›Ú™Xİ
NÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]H‹™\İ[›Y\ÜØYÙJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™›Ù™›[™K\™XÛİ™\K\ØÙ[˜\š[ÈŠNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™Y]Y˜[YKÌ3ªHŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[™˜YØ]™YYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œİÜ˜YÙQ˜[˜XÚĞ]˜Z[X›KYJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[œÚ[[ÜÜË˜[ÙJNÃBˆ\ÜÙ\™\]X[
Ù\šX[^™T›Ú™Xİ
›Ú™Xİ
KÜšYÚ[˜[
NÃBŸJNÃB\İ
˜Ø][ÙİYH™[X\ÙHØ[™Y]H\ÜÙ\ÈZ[[\ÜY]Ú[][][Û‹TËÑË^ÜŞ[˜È[™“Õ\™]šY]ÈØ]\È‹\Ş[˜È

HOˆÃBˆÛÛœİØ[™Y]OR”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÌŒ\™[X\ÙKXØ[™Y]KYL™K˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJNÃBˆÛÛœİYÏVÈŒK[YXİ\œ™[[[Z]\ˆ‹ŒLŒ‹MMMK][Y\‹\Øˆ‹ŒN‹\ØÚ[X]XË\Ø‹\Ş[˜È‹ŒNMKX›İY^Z[‹XÛÛ\Û™[—NÃBˆÛÛœİ›Ú™XİÏSØš™Xİ™œ›ÛQ[šY\Ê]ØZ]›ÛZ\ÙK˜[
YË›X\
\Ş[˜ÈYO–ÚY”ÓÓ‹œ\œÙJ]ØZ]™XYš[J™]ÈT“
‹‹‹Ù^[\\ËÈŠÚY
È‹˜YYİ[‹šœÛÛˆ‹[\Ü›Y]K\›
JJWJJJNÃBˆÛÛœİ™\İ[\[”™[X\ÙPØ[™Y]QL‘Qš^\™\ÊØØ[™Y]K›Ú™XİßJNÃBˆ\ÜÙ\™\]X[
™\İ[œİ]K˜ÛÛ\]H‹™\İ[›Y\ÜØYÙJNØ\ÜÙ\™\]X[
™\İ[œ™\İ[šÚ[™œ™[X\ÙKXØ[™Y]KYL™HŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ™\İ[˜ÚXÚÜËØZ[YK[\ÜYKY]YKÚ[][][ÛYK\˜ÎYK˜ÎYK^ÜYKØÚ[X]XÔØ”Ş[˜ÎYK›İ™]šY]ÎY_JNÃBˆ\ÜÙ\™\]X[
™\İ[œ™\İ[™š^\™PÛİ[
NØ\ÜÙ\™\]X[
™\İ[œ™\İ[œØ‘˜Ëœ\ÜÙYŠNØ\ÜÙ\™\]X[
™\İ[œ™\İ[˜›İ]]][Û‹˜[ÙJNÃBŸJNÃBƒB™[˜İ[ÛˆXZÙT›Ú™Xİ

HÃBˆ™]\›ˆÃBˆY]Y]Nİ\]Y]ˆŒŒ‹LKLUŒŒŒˆŸKBˆÛÛ\Û™[Î–ŞÚ[œİ[˜ÙRYˆœŒH‹ÜÚ][ÛÜØ–ÌLLKØÚ[X]XÎ–ÌLŒLŒ__KÚ[œİ[˜ÙRYˆ™H‹ÜÚ][ÛÜØ–ÌÌL__WKBˆØ‘˜XœšXØ][ÛÃBˆ›Ø\™İÚY[NZYÚ[NŒŒKBˆ\Î–ŞÚ[œİ[˜ÙRYˆœŒH‹™Y™\™[˜ÙNˆ”ŒH‹›Ûİš[ˆ”—ÌŒÈŸKÚ[œİ[˜ÙRYˆ™H‹™Y™\™[˜ÙNˆ‘H‹›Ûİš[ˆ‘ÔÓÑLLŒÈŸWKBˆYÎ–ÃBˆÚ[œİ[˜ÙRYˆœŒH‹[X™\ˆŒH‹™]Yˆ•ĞÈ‹[NKS[NKXÚ›ÛÙŞNˆ›İYÚZÛH‹X[Y]\“[NŒ_KBˆÚ[œİ[˜ÙRYˆœŒH‹[X™\ˆŒˆ‹™]Yˆ”ÒQÈ‹[NŒLS[NKXÚ›ÛÙŞNˆœÛY‹ÚY[NŒKZYÚ[NŒ_KBˆÚ[œİ[˜ÙRYˆ™H‹[X™\ˆŒH‹™]Yˆ”ÒQÈ‹[NŒŒS[NŒLXÚ›ÛÙŞNˆ›İYÚZÛH‹X[Y]\“[NŒ_CBˆKBˆ›İ]\Î–ÃBˆÛ™]Yˆ•ĞÈ‹ÚY[N‹ŒKÚ[Ó[N–ÖÍKWKÍ‹WW_KBˆÛ™]Yˆ”ÒQÈ‹ÚY[N‹ŒKÚ[Ó[N–ÖÌLWKÌMKWKÌŒLW_KBˆÛ™]Yˆ‘Ó‘‹ÚY[N‹ŒKÚ[Ó[N–ÖÌ‹—KÌ‹×W_CBˆCBˆCBˆNÃBŸCB\İ
”Ğˆ›Ûİš[[İ™[Y[ÙY\ÈY[˜ÚÜœÈ[™]XÚY›İ]H[™Ú[ÈÙÙ]\ˆ‹

OOÃBˆÛÛœİ›Ú™Xİ[XZÙT›Ú™Xİ

K™Y›Ü™O\İXİ\™YÛÛ™J›Ú™Xİ
K™\İ[[[İ™TØ‘›Ûİš[
›Ú™XİœŒH‹ŞŒ‹N‹L_JNÃBˆ\ÜÙ\™\]X[
™\İ[œİ]\Ë˜ÛÛ\]HŠNØ\ÜÙ\™\]X[
™\İ[›[İ™YYÛİ[ŠNØ\ÜÙ\™\]X[
™\İ[\]Y›İ]TÚ[ËŠNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ›Ú™XİœØ‘˜XœšXØ][Û‹œYËœÛXÙJŠK›X\
O–Ü[KS[WJKÖÍËKÌL‹WJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ›Ú™XİœØ‘˜XœšXØ][Û‹œ›İ]\Ë›X\
Oœ‹œÚ[Ó[JKÖÖÍËKÍ‹WWKÖÌL‹KÌMKWKÌŒLWKÖÌ‹—KÌ‹×WWJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[œ›Ú™Xİ˜ÛÛ\Û™[ÖÌKœÜÚ][Û‹ÜØ–ÌLŒK—KØÚ[X]XÎ–ÌLŒLŒ_JNÃBˆ\ÜÙ\™Y\\]X[
›Ú™Xİ™Y›Ü™KHÜ\˜][Ûˆ]\İ›İ]]]HHÛİ\˜ÙH›Ú™XİŠNÃBŸJNÃB\İ
”Ğˆ›Ûİš[[İ™[Y[™Z™XİÈ›Ø\™YYÙHİ™\™›İÈÚ]İ]Ú[™Ú[™ÈHÛİ\˜ÙH‹

OOÃBˆÛÛœİ›Ú™Xİ[XZÙT›Ú™Xİ

K™Y›Ü™O\İXİ\™YÛÛ™J›Ú™Xİ
K™\İ[[[İ™TØ‘›Ûİš[
›Ú™XİœŒH‹ŞŒÌKNŒJNÃBˆ\ÜÙ\™Y\\]X[
™\İ[Üİ]\Îˆ˜›ØÚÙY‹ÛÙNˆ“ÕUÓÑ—Ğ“ÕS‘ÈŸJNØ\ÜÙ\™Y\\]X[
›Ú™Xİ™Y›Ü™JNÃBŸJNÃB\İ
”Ğˆ›Ûİš[[İ™[Y[™Z™XİÈ[˜[YÙ[ÛY]H[™[šÛ›İÛˆ›Ûİš[È‹

OOÃBˆÛÛœİ›Ú™Xİ[XZÙT›Ú™Xİ

NÃBˆ\ÜÙ\™Y\\]X[
[İ™TØ‘›Ûİš[
›Ú™Xİ›Z\ÜÚ[™È‹ŞŒKNŒJKÜİ]\Îˆ˜›ØÚÙY‹ÛÙNˆ•S’Ó“ÕÓ—Ñ“ÓÕ’S•ŸJNÃBˆ\ÜÙ\™Y\\]X[
[İ™TØ‘›Ûİš[
›Ú™Xİ™H‹Ş“[X™\‹“˜S‹NŒJKÜİ]\Îˆ˜›ØÚÙY‹ÛÙNˆ’S•SQÑSHŸJNÃBˆ›Ú™XİœØ‘˜XœšXØ][Û‹œYË™š[™
Oœš[œİ[˜ÙRYOOHœŒHŠK[OS[X™\‹“˜SÃBˆ\ÜÙ\™Y\\]X[
[İ™TØ‘›Ûİš[
›Ú™XİœŒH‹ŞŒKNŒJKÜİ]\Îˆ˜›ØÚÙY‹ÛÙNˆ’S•SQÑ“ÓÕ’S•ÑÑSÓQU–HŸJNÃBŸJNÃB\İ
”Ğˆ›Ûİš[[İ™[Y[™\ÜÈ[˜Ú[™ÙY›ÜˆH™\›È[H‹

OOÃBˆÛÛœİ›Ú™Xİ[XZÙT›Ú™Xİ

K™\İ[[[İ™TØ‘›Ûİš[
›Ú™XİœŒH‹ŞŒNŒJNÃBˆ\ÜÙ\™\]X[
™\İ[œİ]\Ë[˜Ú[™ÙYŠNØ\ÜÙ\™\]X[
™\İ[œ›Ú™Xİ›Ú™Xİ
NÃBŸJNÃB