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
import { BREADBOARD_MODEL, breadboardHoleIds, breadboardHolePoint, breadboardPackagePlacement, deriveBreadboardSchematicNets, normalizeBreadboardHole, validateBreadboardTopology } from "./js/breadboard-topology.mjs";
import { schematicPinPoint } from "./js/schematic-pin-layout.mjs";
import { renderSchematicSymbol } from "./js/schematic-symbols.mjs";
import { renderPcbPreviewSvg, getPcbPreviewScale } from "./js/pcb-preview.mjs";
import { movePcbFootprint } from "./js/pcb-edit.mjs";
import { clearRecoveryDraft, readRecoveryDraft, writeRecoveryDraft } from "./js/recovery-storage.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "./js/pcb-export.mjs";
import { createManufacturingExportPack } from "./js/manufacturing-export-pack.mjs";
import { analyzeDcVoltmeter } from "./js/dc-voltmeter-analysis.mjs";
import { analyzeDcAmmeter } from "./js/dc-ammeter-analysis.mjs";
import { captureTriggeredPulse } from "./js/oscilloscope-trigger.mjs";
import { measureTwoChannelPhase } from "./js/phase-measurement.mjs";
import { captureLogicAnalyzer } from "./js/logic-analyzer-capture.mjs";
import { measureFrequency } from "./js/frequency-counter.mjs";
import { analyzeRcBode } from "./js/rc-bode-analysis.mjs";
import { analyzeRlcStep } from "./js/rlc-transient.mjs";
import { runParameterSweep } from "./js/parameter-sweep.mjs";
import { runMonteCarloTolerance } from "./js/monte-carlo-tolerance.mjs";
import { analyzeThermalWarningBoundary } from "./js/thermal-warning-boundary.mjs";
import { analyzeConvergenceStudy } from "./js/convergence-study.mjs";
import { diagnoseFloatingNode } from "./js/floating-node-diagnosis.mjs";
import { diagnoseSupplyShort } from "./js/short-circuit-diagnosis.mjs";
import { diagnoseMissingGround } from "./js/missing-ground-diagnosis.mjs";
import { reportUnavailableModel } from "./js/model-unavailable-diagnosis.mjs";
import { runNetCrossProbe } from "./js/net-cross-probe.mjs";
import { validateComponentProperty } from "./js/component-property-audit.mjs";
import { createSimulationReport } from "./js/simulation-report.mjs";
import { verifySimulationLockfile } from "./js/simulation-lockfile.mjs";
import { runPlcStartStopSequence } from "./js/plc-start-stop-sequence.mjs";
import { runTrafficLightSequence } from "./js/traffic-light-sequence.mjs";
import { runTankLevelController } from "./js/tank-level-controller.mjs";
import { runConveyorCounter } from "./js/conveyor-counter.mjs";
import { runStarDeltaStarter } from "./js/star-delta-starter.mjs";
import { runForwardReverseInterlock } from "./js/forward-reverse-interlock.mjs";
import { runEmergencyStopConcept } from "./js/emergency-stop-concept.mjs";
import { runDoorInterlockConcept } from "./js/door-interlock-concept.mjs";
import { runTemperatureAlarm } from "./js/temperature-alarm.mjs";
import { runWaterLeakAlarm } from "./js/water-leak-alarm.mjs";
import { runFanThermostat } from "./js/fan-thermostat.mjs";
import { runPwmFanController } from "./js/pwm-fan-controller.mjs";
import { runAutomaticNightLight } from "./js/automatic-night-light.mjs";
import { runSmartIrrigation } from "./js/smart-irrigation.mjs";
import { runGarageDoorConcept } from "./js/garage-door-concept.mjs";
import { runElevatorCallQueue } from "./js/elevator-call-queue.mjs";
import { runFireAlarmZone } from "./js/fire-alarm-zone.mjs";
import { runAccessStrikeLock } from "./js/access-strike-lock.mjs";
import { runWarehouseBeacon } from "./js/warehouse-beacon.mjs";
import { runMachineFaultAnnunciator } from "./js/machine-fault-annunciator.mjs";
import { runBreadboardSchematicSync } from "./js/breadboard-schematic-sync.mjs";
import { runSchematicPcbSync } from "./js/schematic-pcb-sync.mjs";
import { runThreeViewLedHistory } from "./js/three-view-led-history.mjs";
import { projectComponentsForView, runUnsupportedBreadboardPackage } from "./js/view-projection.mjs";
import { runMissingFootprintWorkflow } from "./js/pcb-update-resolution.mjs";
import { runPinIncompatibleSubstitution } from "./js/pin-substitution-preview.mjs";
import { runUnitConversionCalculator } from "./js/unit-conversion-calculator.mjs";
import { runResistorColorCodeReader } from "./js/resistor-color-code.mjs";
import { runLedResistorCalculator } from "./js/led-resistor-calculator.mjs";
import { runVoltageDividerCalculator } from "./js/voltage-divider-calculator.mjs";
import { runRcTimingCalculator } from "./js/rc-timing-calculator.mjs";
import { runOpAmpGainCalculator } from "./js/op-amp-gain-calculator.mjs";
import { runPcbTraceWidthAdvisor } from "./js/pcb-trace-width-advisor.mjs";
import { exportBomCsv, runBomExportPlaceholder } from "./js/bom-report.mjs";
import { explainComponent, runBotComponentExplainer } from "./js/bot-component-explainer.mjs";
import { applyBotFloatingNodeRepairPreview, runBotFloatingNodeRepair } from "./js/bot-floating-node-repair.mjs";
import { applyBotCircuitProposal, runBotCircuitProposal } from "./js/bot-circuit-proposal.mjs";
import { runFourLanguageUiSweep } from "./js/locale-ui-sweep.mjs";
import { runOfflineRecoveryScenario } from "./js/offline-recovery-scenario.mjs";
import { runReleaseCandidateE2E } from "./js/release-candidate-e2e.mjs";

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
  schematicWireStart: null
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
  canvas.className = `design-canvas ${state.activeView} ${state.breadboardPlacementMode ? "is-placement-mode" : ""} ${state.schematicWireMode ? "is-wire-mode" : ""} ${$("#grid-toggle").checked ? "grid-enabled" : ""}`;
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
  canvas.innerHTML = `<div class="canvas-label">${label}</div>${reconciliationNotice}<div class="canvas-scene" style="--pan-x:${state.pan.x}px;--pan-y:${state.pan.y}px">${surface}${wires}${parts}</div>`;
  $("#schematic-wire-mode").setAttribute("aria-pressed", String(state.schematicWireMode));
  $("#schematic-wire-status").textContent = !state.schematicWireMode ? "" : state.schematicWireStart ? t("schematicWireNext") : t("schematicWireStart");
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

function renderResultDashboard(analysis) {
  if (!analysis || analysis.state !== "complete") return "";
  const result = analysis.result ?? {};
  const metrics = [];
  let waveform = "";
  if (result.kind === "release-candidate-e2e") {
    metrics.push(["Fixtures",String(result.fixtureCount)],["PCB DRC",result.pcbDrc],["BOT project edit",result.botMutation?"Changed":"Read-only"],["Passed gates",String(Object.values(result.checks).filter(Boolean).length)]);
    const rows=Object.entries(result.checks).map(([name,passed])=>'<tr><td>'+escape(name)+'</td><td>'+(passed?"PASS":"FAIL")+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Release candidate · build through export</figcaption><table class="result-table"><thead><tr><th>Gate</th><th>Result</th></tr></thead><tbody>'+rows+'</tbody></table><p>BOT cites local project/library fields; PCB export is illustrative, not manufacturing approval.</p></figure>';
  } else if (result.kind === "offline-recovery-scenario") {
    metrics.push(["Draft restored",result.draftSaved?"Yes":"No"],["Storage fallback",result.storageFallbackAvailable?"Native export valid":"Unavailable"],["Recovered edit",result.editedValue],["Silent loss",result.silentLoss?"Detected":"None"]);
    waveform='<figure class="result-waveform"><figcaption>Local offline recovery · simulated storage interruption</figcaption><p>Unsaved edit restored from a versioned draft. When browser storage is unavailable, use <strong>File → Export</strong> before closing.</p><p>CI uses an in-memory storage mock; real browser quota and crash behavior are outside this test.</p></figure>';
  } else if (result.kind === "four-language-ui-sweep") {
    metrics.push(["Locales",result.locales.join(" · ")],["Declared interface keys",String(result.declaredKeyCount)],["Missing translations",String(result.missingTranslations)],["Rendered pixel check",result.renderedPixelCheck?"Measured":"Not claimed"]);
    waveform='<figure class="result-waveform"><figcaption>Four-language UI source audit</figcaption><p>Translation coverage: '+(result.missingTranslations===0?"complete":"incomplete")+'. Static accessibility and responsive overflow contracts run in the automated catalogue test.</p><p>No rendered pixel measurement is claimed by this source audit.</p></figure>';
  } else if (result.kind === "bot-12v-led-circuit-proposal") {
    metrics.push(["Supply assumption",result.proposal.source],["Series resistor",result.proposal.resistor],["LED Vf assumption",result.proposal.ledVf],["Estimated current",(result.proposal.estimatedCurrentA*1000).toFixed(2)+" mA"],["Resistor dissipation",result.proposal.resistorDissipationW.toFixed(3)+" W"],["Preview applied",result.applied?"Yes":"No · confirmation required"]);
    waveform='<figure class="result-waveform"><figcaption>Adigun BOT · 12 V LED proposal</figcaption><p>Candidate passes schema validation and supported LED analysis. The original project remains unchanged until confirmation.</p><p>'+escape(result.warning)+'</p></figure>';
  } else if (result.kind === "bot-floating-node-repair-preview") {
    metrics.push(["Diagnosis", result.diagnosis.netId+" · "+result.diagnosis.reference], ["Proposed part", result.proposal.reference+" · "+result.proposal.value], ["Validation", result.validationValid?"Candidate passes project validation":"Candidate blocked"], ["Applied", result.applied?"Yes":"No · confirmation required"]);
    waveform='<figure class="result-waveform"><figcaption>Adigun BOT · uncommitted repair preview</figcaption><p>Connect '+escape(result.diagnosis.netId)+' to GND through a proposed '+escape(result.proposal.value)+' resistor. No project change has been applied.</p><p>'+escape(result.warning)+'</p></figure>';
  } else if (result.kind === "bot-grounded-component-explanation") {
    metrics.push(["Component", result.reference], ["Known project/library fields", String(result.known.length)], ["Unknown library fields", String(result.unknown.length)]);
    const rows=result.known.map(item=>'<tr><td>'+escape(item.field)+'</td><td>'+escape(item.value)+'</td><td>'+escape(item.source)+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Adigun BOT · source-grounded component facts</figcaption><table class="result-table"><thead><tr><th>Field</th><th>Recorded value</th><th>Source</th></tr></thead><tbody>'+rows+'</tbody></table><p>Unknown: '+result.unknown.map(escape).join(" ")+'</p></figure>';
  } else if (result.kind === "bom-cost-placeholder") {
    metrics.push(["BOM lines", String(result.rowCount)], ["Components", String(result.itemCount)], ["Cost total", result.totalCost === null ? "Unavailable · no complete sourced prices" : result.currency + " " + result.totalCost.toFixed(2)]);
    const rows=result.rows.map(item=>'<tr><td>'+escape(item.references)+'</td><td>'+item.quantity+'</td><td>'+escape(item.libraryId)+'</td><td>'+escape(item.description)+'</td><td>'+escape(item.value)+'</td><td>'+(item.unitCost === null ? "—" : escape(item.currency + " " + item.unitCost.toFixed(2)))+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Verified-field BOM · prices blank without dated source evidence</figcaption><table class="result-table"><thead><tr><th>References</th><th>Qty</th><th>Library part</th><th>Description</th><th>Value</th><th>Unit cost</th></tr></thead><tbody>'+rows+'</tbody></table><p>Export BOM CSV from File. Missing prices are unavailable, not zero.</p></figure>';
  } else if (result.kind === "pcb-trace-width-advisory") {
    metrics.push('<div class="result-metric"><span>Trace cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Model</span><strong>Legacy empirical estimate</strong></div>','<div class="result-metric"><span>Standards status</span><strong>Advisory · not compliance</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.currentA+' A</td><td>'+item.copperThicknessUm+' µm</td><td>'+escape(item.layerType)+'</td><td>'+item.temperatureRiseC+' °C</td><td>'+item.widthMm.toFixed(3)+' mm</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Trace-width estimate · IPC-2221 legacy equation</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Current</th><th>Copper</th><th>Layer</th><th>Rise</th><th>Estimated width</th></tr></thead><tbody>'+rows+'</tbody></table><p>'+escape(result.standardLimitation)+'</p></figure>';
  } else if (result.kind === "op-amp-gain-cases") {
    metrics.push('<div class="result-metric"><span>Gain cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Inverting</span><strong>−Rf / Rin</strong></div>','<div class="result-metric"><span>Non-inverting</span><strong>1 + Rf / Rg</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+escape(item.configuration)+'</td><td>'+(item.inputResistanceOhms??"—")+' Ω</td><td>'+item.feedbackResistanceOhms+' Ω</td><td>'+(item.groundResistanceOhms??"—")+' Ω</td><td>'+item.gain.toFixed(3)+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Ideal op-amp closed-loop gain from resistor ratios</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Topology</th><th>Rin</th><th>Rf</th><th>Rg</th><th>Gain</th></tr></thead><tbody>'+rows+'</tbody></table><p>Ideal ratios only; amplifier bandwidth, output swing, stability, and supply rails are not modeled.</p></figure>';
  } else if (result.kind === "rc-timing-cases") {
    metrics.push('<div class="result-metric"><span>Calculation cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Results</span><strong>τ and cutoff frequency</strong></div>','<div class="result-metric"><span>Prefix handling</span><strong>Ω to MΩ · pF to F</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.resistanceValue+' '+escape(item.resistanceUnit)+'</td><td>'+item.capacitanceValue+' '+escape(item.capacitanceUnit)+'</td><td>'+(item.timeConstantSeconds*1000).toPrecision(5)+' ms</td><td>'+item.cutoffFrequencyHz.toPrecision(5)+' Hz</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>RC timing · time constant and ideal cutoff frequency</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Resistance</th><th>Capacitance</th><th>Time constant</th><th>Cutoff</th></tr></thead><tbody>'+rows+'</tbody></table><p>First-order ideal model; parasitics and loading are not included.</p></figure>';
  } else if (result.kind === "voltage-divider-cases") {
    metrics.push('<div class="result-metric"><span>Calculation cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Loading warnings</span><strong>'+result.loadingWarningCount+'</strong></div>','<div class="result-metric"><span>Model</span><strong>Ideal resistors · 5% default limit</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.inputVoltageV+' V</td><td>'+(item.resistanceTopOhms/1000)+' kΩ / '+(item.resistanceBottomOhms/1000)+' kΩ</td><td>'+item.unloadedOutputV.toFixed(3)+' V / '+item.loadedOutputV.toFixed(3)+' V</td><td>'+item.loadingChangePercent.toFixed(2)+'% '+(item.warnings.length?"· WARNING":"") +'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Divider output · unloaded and loaded values</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Input</th><th>R1 / R2</th><th>Unloaded / loaded Vout</th><th>Load change</th></tr></thead><tbody>'+rows+'</tbody></table><p>Ideal resistive model only; downstream input impedance and source tolerance require review.</p></figure>';
  } else if (result.kind === "led-series-resistor-cases") {
    metrics.push('<div class="result-metric"><span>Calculation cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Power warnings</span><strong>'+result.powerWarningCount+'</strong></div>','<div class="result-metric"><span>Selection rule</span><strong>Next E12 value ≥ ideal minimum</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.id)+'</td><td>'+item.supplyVoltageV+' V − '+item.ledForwardVoltageV+' V</td><td>'+item.requiredResistanceOhms.toFixed(1)+' Ω → '+item.recommendedResistanceOhms+' Ω</td><td>'+item.estimatedCurrentmA.toFixed(2)+' mA</td><td>'+item.resistorDissipationW.toFixed(3)+' W'+(item.warnings.length?" · WARNING":"")+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>LED resistor estimates · voltage, E12 value, current, dissipation</figcaption><table class="result-table"><thead><tr><th>Case</th><th>Available voltage</th><th>Required → recommended</th><th>Estimated current</th><th>Resistor power</th></tr></thead><tbody>'+rows+'</tbody></table><p>Ideal estimates only; select component ratings with thermal derating and verify the actual LED datasheet.</p></figure>';
  } else if (result.kind === "resistor-color-code-cases") {
    metrics.push('<div class="result-metric"><span>Valid readings</span><strong>'+result.validCount+'</strong></div>','<div class="result-metric"><span>Rejected combinations</span><strong>'+result.rejectedCount+'</strong></div>','<div class="result-metric"><span>Supported formats</span><strong>4-band · 5-band</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.bands.join(" · ")) +'</td><td>'+(item.reading.valid?escape(item.reading.formattedResistance)+" ±"+item.reading.tolerancePercent+"%":"Rejected: "+escape(item.reading.error))+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Resistor colour code · nominal value and tolerance</figcaption><table class="result-table"><thead><tr><th>Color bands</th><th>Reading</th></tr></thead><tbody>'+rows+'</tbody></table></figure>';
  } else if (result.kind === "si-unit-conversion-cases") {
    metrics.push('<div class="result-metric"><span>Conversion cases</span><strong>'+result.caseCount+'</strong></div>','<div class="result-metric"><span>Method</span><strong>SI scale factors</strong></div>','<div class="result-metric"><span>Rounding</span><strong>Significant digits</strong></div>');
    const rows=result.results.map(item=>'<tr><td>'+escape(item.category)+'</td><td>'+item.value+' '+escape(item.fromUnit)+'</td><td>'+item.convertedValue+' '+escape(item.toUnit)+'</td><td>'+item.precision+' significant digits</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Engineering unit conversions · resistance, power, length</figcaption><table class="result-table"><thead><tr><th>Category</th><th>Input</th><th>Converted</th><th>Rounding</th></tr></thead><tbody>'+rows+'</tbody></table></figure>';
  } else if (result.kind === "pin-incompatible-substitution-preview") {
    metrics.push('<div class="result-metric"><span>Substitution</span><strong>'+(result.substitutionBlocked?"Blocked · pin roles differ":"Preview passed")+'</strong></div>','<div class="result-metric"><span>Original</span><strong>'+escape(result.originalLibraryId)+' · retained</strong></div>','<div class="result-metric"><span>Preview</span><strong>'+escape(result.candidateLibraryId)+' · canceled</strong></div>');
    const rows=result.unmappedUsedPins.map(pin=>'<tr><td>'+escape(result.reference)+'.'+escape(pin)+'</td><td>'+escape(result.candidateLibraryId)+'</td><td>No matching pin name</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Candidate pin map · cancellation preserved the original</figcaption><table class="result-table"><thead><tr><th>Used source pin</th><th>Candidate</th><th>Preview</th></tr></thead><tbody>'+rows+'</tbody></table><p>A matching 8-pin count is not electrical compatibility. Preview canceled; original project unchanged.</p></figure>';
  } else if (result.kind === "missing-footprint-resolution-report") {
    metrics.push('<div class="result-metric"><span>PCB update</span><strong>Blocked pending footprint review</strong></div>','<div class="result-metric"><span>Missing mappings</span><strong>'+result.missingFootprintCount+'</strong></div>','<div class="result-metric"><span>Automatic substitution</span><strong>No</strong></div>');
    const rows=result.missingFootprints.map(item=>'<tr><td>'+escape(item.reference)+'</td><td>'+escape(item.part)+'</td><td>'+escape(item.reason)+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Required report · missing PCB footprint mappings</figcaption><table class="result-table"><thead><tr><th>Reference</th><th>Library part</th><th>Resolution status</th></tr></thead><tbody>'+rows+'</tbody></table><ol>'+result.requiredReport.resolutionOptions.map(option=>'<li>'+escape(option)+'</li>').join("")+'</ol></figure>';
  } else if (result.kind === "unsupported-breadboard-package-reconciliation") {
    metrics.push('<div class="result-metric"><span>Package</span><strong>'+escape(result.reference)+' · concept</strong></div>','<div class="result-metric"><span>Breadboard placement</span><strong>Excluded</strong></div>','<div class="result-metric"><span>Reconciliation item</span><strong>'+escape(result.breadboardReconciliation.reason)+'</strong></div>');
    waveform='<figure class="result-waveform"><figcaption>Unsupported package · view projection check</figcaption><table class="result-table"><thead><tr><th>View</th><th>Projection</th><th>Result</th></tr></thead><tbody><tr><td>Breadboard</td><td>Reconciliation item</td><td>No placement</td></tr><tr><td>Schematic</td><td>Supported concept</td><td>Visible</td></tr><tr><td>PCB</td><td>Illustrative concept</td><td>'+(result.pcbPlaced?"Visible · not manufacturing qualified":"Reconciliation needed")+'</td></tr></tbody></table></figure>';
  } else if (result.kind === "three-view-led-sync-history") {
    metrics.push('<div class="result-metric"><span>Component edit</span><strong>'+escape(result.reference)+" · "+escape(result.originalValue)+" → "+escape(result.editedValue)+'</strong></div>','<div class="result-metric"><span>Views updated</span><strong>'+result.availableViews.length+'</strong></div>','<div class="result-metric"><span>History</span><strong>Undo + redo passed</strong></div>');
    waveform='<figure class="result-waveform"><figcaption>One canonical LED project · shared view data and history snapshots</figcaption><table class="result-table"><thead><tr><th>Projection</th><th>Component</th><th>Edit</th><th>History check</th></tr></thead><tbody>'+result.availableViews.map(view=>'<tr><td>'+escape(view)+'</td><td>'+escape(result.reference)+'</td><td>'+(result.reconciliationByView[view]?"Reconciliation needed":"Shared edit · "+escape(result.editedValue))+'</td><td>'+(result.reconciliationByView[view]?result.reconciliationByView[view]+" items; no placement":"Shared identity preserved")+"</td></tr>").join("")+'<tr><td>Undo</td><td>'+escape(result.reference)+'</td><td>'+escape(result.undoValue)+'</td><td>Original snapshot restored</td></tr><tr><td>Redo</td><td>'+escape(result.reference)+'</td><td>'+escape(result.redoValue)+'</td><td>Edited snapshot restored</td></tr></tbody></table></figure>';
  } else if (result.kind === "schematic-pcb-netlist-pad-sync") {
    const rows=result.netPadMap.map(net=>`<tr><td>${escape(net.netId)}</td><td>${escape(net.schematicEndpoints.join(", "))}</td><td>${escape(net.pcbPads.join(", "))}</td><td>${net.pcbPads.length===net.schematicEndpoints.length?"Preserved":"Missing"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Components / nets</span><strong>${result.componentCount} / ${result.netCount}</strong></div>`,`<div class="result-metric"><span>Pin mapping</span><strong>${result.mappedPinCount} pins</strong></div>`,`<div class="result-metric"><span>Footprint status</span><strong>Illustrative · unverified</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Schematic-to-PCB sync · net ID and pad endpoint audit</figcaption><table class="result-table"><thead><tr><th>Net ID</th><th>Schematic pins</th><th>Illustrative PCB pads</th><th>Endpoints</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "breadboard-schematic-structural-sync") {
    const rows=result.netIds.map(id=>{const net=result.breadboard.nets.find(item=>item.id===id);return `<tr><td>${escape(id)}</td><td>${escape(net.endpoints.join(", "))}</td><td>${escape(result.schematic.nets.find(item=>item.id===id)?.endpoints.join(", ")??"Missing")}</td><td>${result.schematic.nets.some(item=>item.id===id)?"Same ID":"Missing"}</td></tr>`;}).join("");
    metrics.push(`<div class="result-metric"><span>Components</span><strong>${result.componentCount}</strong></div>`,`<div class="result-metric"><span>Shared nets</span><strong>${result.netCount}</strong></div>`,`<div class="result-metric"><span>Structural match</span><strong>${result.structurallyEqual?"Yes":"No"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Breadboard-to-schematic sync · canonical net identity comparison</figcaption><table class="result-table"><thead><tr><th>Net ID</th><th>Breadboard endpoints</th><th>Schematic endpoints</th><th>Identity</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "machine-fault-latched-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${frame.activeFaults.join(", ")||"—"}</td><td>${frame.latchedFaults.join(", ")||"—"}</td><td>${frame.acknowledgedFaults.join(", ")||"—"}</td><td>${frame.faultLampOn?"ON":"OFF"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Steps</span><strong>${result.frameCount}</strong></div>`,`<div class="result-metric"><span>Final latched faults</span><strong>${result.frames.at(-1).latchedFaults.join(", ")||"None"}</strong></div>`,`<div class="result-metric"><span>Clear + acknowledge</span><strong>Both required</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Machine fault annunciator · latch and acknowledge table</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Action</th><th>Active</th><th>Latched</th><th>Acknowledged</th><th>Fault lamp</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "warehouse-beacon-state-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.state)}</td><td>${frame.greenOn?"ON":"—"}</td><td>${frame.redOn?"ON":"—"}</td><td>${frame.amberOn?"ON":"—"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Samples / transitions</span><strong>${result.sampleCount} / ${result.transitionCount}</strong></div>`,`<div class="result-metric"><span>One status per sample</span><strong>${result.oneStatusPerFrame?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>Fault indicator</span><strong>Amber + buzzer</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Warehouse beacon · occupancy status sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>State</th><th>Green</th><th>Red</th><th>Amber</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "access-strike-allowlist-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.atMs} ms</td><td>${escape(frame.credentialId)}</td><td>${escape(frame.decision)}</td><td>${frame.strikeUnlocked?"UNLOCK":"LOCKED"}</td><td>${escape(frame.reason)}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Grants / denials</span><strong>${result.grantCount} / ${result.denyCount}</strong></div>`,`<div class="result-metric"><span>Unlock interval</span><strong>${result.unlockDurationMs} ms</strong></div>`,`<div class="result-metric"><span>Audit events</span><strong>${result.mockAuditEvents.length} · mock</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Access-control mock · grant/deny and strike timeline</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Time</th><th>Mock credential</th><th>Decision</th><th>Strike</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "fire-alarm-zone-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.zoneId)}</td><td>${escape(frame.condition)}</td><td>${frame.fireAlarm?"ALARM":"—"}</td><td>${frame.trouble?escape(frame.troubleType):"—"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Alarm samples</span><strong>${result.alarmSamples}</strong></div>`,`<div class="result-metric"><span>Open / short faults</span><strong>${result.openFaults} / ${result.shortFaults}</strong></div>`,`<div class="result-metric"><span>Fire buzzer</span><strong>Alarm only</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Fire-alarm zone · distinct alarm and trouble table</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Zone</th><th>Input</th><th>Alarm</th><th>Trouble</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "elevator-fifo-call-queue") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}${frame.floor===null?"":" "+frame.floor}</td><td>${escape(frame.outcome)}</td><td>${frame.activeTarget??"—"}</td><td>${frame.queue.join(", ")||"—"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Floor count</span><strong>${result.floorCount}</strong></div>`,`<div class="result-metric"><span>Targets dispatched</span><strong>${result.dispatchedTargets.join(" → ")||"None"}</strong></div>`,`<div class="result-metric"><span>Duplicate calls ignored</span><strong>${result.duplicateCallsIgnored}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Elevator scheduler · FIFO request state table</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Event</th><th>Outcome</th><th>Next target</th><th>Queue</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "garage-door-limit-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${escape(frame.mode)}</td><td>${frame.openLimit?"Active":"—"}</td><td>${frame.closedLimit?"Active":"—"}</td><td>${frame.conflictRejected?"Rejected":"—"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Limit stops</span><strong>${result.frames.filter(frame=>frame.action.endsWith("-limit")&&frame.mode==="stopped").length}</strong></div>`,`<div class="result-metric"><span>Conflicts rejected</span><strong>${result.conflictingRequestsRejected}</strong></div>`,`<div class="result-metric"><span>Direction overlap</span><strong>${result.noDriveOverlap?"None":"Detected"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Garage door · synthetic limit and direction sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Event</th><th>Mode</th><th>Open limit</th><th>Closed limit</th><th>Decision</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "smart-irrigation-decision-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.moisturePct===null?"Fault":frame.moisturePct+"%"}</td><td>${frame.permitted?"Yes":"No"}</td><td>${frame.dry?"Yes":"No"}</td><td>${frame.waterCommand}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Dry threshold</span><strong>${result.dryThresholdPct}%</strong></div>`,`<div class="result-metric"><span>Water commands</span><strong>${result.wateringSamples}/${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Sensor fault policy</span><strong>Fail off</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Smart irrigation · moisture, permission, and fault checks</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Moisture</th><th>Permitted</th><th>Dry</th><th>Pump/valve</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "night-light-lux-threshold") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.lux} lux</td><td>${escape(frame.condition)}</td><td>${frame.ledOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Darkness threshold</span><strong>${result.thresholdLux} lux</strong></div>`,`<div class="result-metric"><span>LED-on samples</span><strong>${result.ledOnSamples}/${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Threshold behavior</span><strong>Below = ON</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Automatic night light · synthetic day/night lux samples</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Illuminance</th><th>Condition</th><th>LED command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "pwm-fan-duty-curve") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.tempC} °C</td><td>${frame.dutyPercent}%</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Curve knots</span><strong>${result.knotCount}</strong></div>`,`<div class="result-metric"><span>Mapped samples</span><strong>${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Method</span><strong>Linear / clamped</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>PWM fan controller · temperature-to-duty mapping</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Temperature</th><th>Duty command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "fan-thermostat-hysteresis") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.tempC} °C</td><td>${frame.fanOn?"ON":"OFF"}</td><td>${escape(frame.transition)}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Fan ON threshold</span><strong>${result.fanOnC} °C</strong></div>`,`<div class="result-metric"><span>Fan OFF threshold</span><strong>${result.fanOffC} °C</strong></div>`,`<div class="result-metric"><span>Fan-on samples</span><strong>${result.fanOnSamples}/${result.sampleCount}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Fan thermostat · synthetic temperature sweep</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Temperature</th><th>Fan command</th><th>Transition</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "water-leak-alarm-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.wet?"WET":"Dry"}</td><td>${frame.alarmOn?"ALARM":"Clear"}</td><td>${frame.relayCommand}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Wet episodes</span><strong>${result.alarmEpisodes}</strong></div>`,`<div class="result-metric"><span>Dry recovery</span><strong>${result.dryRecoveryObserved?"Observed":"Not observed"}</strong></div>`,`<div class="result-metric"><span>Sample count</span><strong>${result.sampleCount}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Water-leak alarm · synthetic wet/dry sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Sensor</th><th>Alarm</th><th>Relay command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "latched-temperature-alarm") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.tempC} °C</td><td>${frame.resetRequested?"Yes":"No"}</td><td>${frame.resetRejected?"Rejected":"—"}</td><td>${frame.alarmLatched?"LATCHED":"Clear"}</td><td>${frame.buzzerOn?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Threshold</span><strong>${result.thresholdC} °C</strong></div>`,`<div class="result-metric"><span>Alarm trips</span><strong>${result.tripCount}</strong></div>`,`<div class="result-metric"><span>Hot reset rejected</span><strong>${result.resetRejected?"Yes":"No"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Temperature alarm · synthetic sensor samples</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Temperature</th><th>Reset</th><th>Decision</th><th>Alarm</th><th>Buzzer</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "door-interlock-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${frame.guardClosed?"Closed":"OPEN"}</td><td>${frame.faultLatched?"YES":"No"}</td><td>${frame.loadEnabled?"ON":"OFF"}</td><td>${frame.resetRejected?"Rejected":"—"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Load off while guard open</span><strong>${result.loadAlwaysDisabledWhenOpen?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>Reset while open</span><strong>${result.resetRejectedWhenOpen?"Rejected":"None"}</strong></div>`,`<div class="result-metric"><span>Safety-rated model</span><strong>No</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Door interlock · educational guard-state sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Action</th><th>Guard</th><th>Latch</th><th>Load command</th><th>Reset</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "emergency-stop-latched-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.action)}</td><td>${frame.estopHealthy?"Healthy":"TRIPPED"}</td><td>${frame.latched?"YES":"No"}</td><td>${frame.loadEnabled?"ON":"OFF"}</td><td>${frame.resetRejected?"Rejected":"—"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Reset while tripped</span><strong>${result.unsafeResetRejected?"Rejected":"None"}</strong></div>`,`<div class="result-metric"><span>Separate start required</span><strong>${result.restartRequiresNewStart?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>Safety-rated model</span><strong>No</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>E-stop latch · educational logical sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Action</th><th>E-stop input</th><th>Latch</th><th>Load command</th><th>Reset</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "forward-reverse-interlock-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${escape(frame.request)}</td><td>${escape(frame.direction)}</td><td>${frame.forwardEnergized?"ON":"OFF"}</td><td>${frame.reverseEnergized?"ON":"OFF"}</td><td>${frame.conflictRejected?"Rejected":"Accepted"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Requests</span><strong>${result.frameCount}</strong></div>`,`<div class="result-metric"><span>Conflicts rejected</span><strong>${result.conflictRequestsRejected}</strong></div>`,`<div class="result-metric"><span>Outputs overlap</span><strong>${result.noOverlap?"No":"Yes"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Forward/reverse interlock · logical command sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Request</th><th>State</th><th>Forward</th><th>Reverse</th><th>Decision</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "star-delta-transition-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.atMs} ms</td><td>${escape(frame.command)}</td><td>${escape(frame.mode)}</td><td>${frame.starEnergized?"ON":"OFF"}</td><td>${frame.deltaEnergized?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Star interval</span><strong>${result.starTimeMs} ms</strong></div>`,`<div class="result-metric"><span>Dead time</span><strong>${result.deadTimeMs} ms</strong></div>`,`<div class="result-metric"><span>Output overlap</span><strong>${result.noOverlap?"None":"Detected"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Star-delta starter · logical interlock transition table</figcaption><table class="result-table"><thead><tr><th>Time</th><th>Event</th><th>Mode</th><th>Star output</th><th>Delta output</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "conveyor-edge-counter") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.photoeye?"Blocked":"Clear"}</td><td>${frame.risingEdge?"Yes":"No"}</td><td>${frame.count}</td><td>${frame.motorRunning?"RUN":"STOP"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Target</span><strong>${result.targetCount}</strong></div>`,`<div class="result-metric"><span>Count</span><strong>${result.finalCount}</strong></div>`,`<div class="result-metric"><span>Stop event</span><strong>${result.stoppedAtEvent??"Not reached"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Conveyor target counter · synthetic photoeye sequence</figcaption><table class="result-table"><thead><tr><th>Event</th><th>Photoeye</th><th>Rising edge</th><th>Count</th><th>Motor command</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "tank-level-hysteresis") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.levelPct}%</td><td>${frame.pumpOn?"ON":"OFF"}</td><td>${escape(frame.transition)}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Low threshold</span><strong>${result.lowLevelPct}%</strong></div>`,`<div class="result-metric"><span>High threshold</span><strong>${result.highLevelPct}%</strong></div>`,`<div class="result-metric"><span>Pump-on samples</span><strong>${result.pumpOnSamples}/${result.sampleCount}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Tank-level hysteresis · synthetic PLC state sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Level</th><th>Pump command</th><th>State</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "traffic-light-fsm-sequence") {
    const rows=result.phases.map(phase=>`<tr><td>${phase.cycle}</td><td>${escape(phase.name)}</td><td>${phase.northSouth.toUpperCase()}</td><td>${phase.eastWest.toUpperCase()}</td><td>${phase.startTimeS}–${phase.endTimeS} s</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Cycles</span><strong>${result.cycleCount}</strong></div>`,`<div class="result-metric"><span>Total sequence</span><strong>${result.totalDurationS} s</strong></div>`,`<div class="result-metric"><span>Opposing green</span><strong>No</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Timed traffic-light FSM · state table</figcaption><table class="result-table"><thead><tr><th>Cycle</th><th>Phase</th><th>North–South</th><th>East–West</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "plc-start-stop-sequence") {
    const rows=result.frames.map(frame=>`<tr><td>${frame.step}</td><td>${frame.startPressed?"Pressed":"Released"}</td><td>${frame.stopHealthy?"Closed":"Open"}</td><td>${frame.emergencyStopHealthy?"Healthy":"TRIPPED"}</td><td>${frame.contactorEnergized?"ON":"OFF"}</td></tr>`).join("");
    metrics.push(`<div class="result-metric"><span>Control steps</span><strong>${result.sampleCount}</strong></div>`,`<div class="result-metric"><span>Seal-in retained</span><strong>${result.sealInRetained?"Yes":"No"}</strong></div>`,`<div class="result-metric"><span>E-stop opens output</span><strong>${result.emergencyStopDropsOutput?"Yes":"No"}</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>PLC start/stop motor control · Boolean concept sequence</figcaption><table class="result-table"><thead><tr><th>Step</th><th>Start</th><th>Stop</th><th>E-stop</th><th>Contactor</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "thermal-warning-boundary") {
    metrics.push(`<div class="result-metric"><span>${result.reference} dissipation</span><strong>${(result.resistorDissipationW*1000).toFixed(1)} mW</strong></div>`,`<div class="result-metric"><span>Entered rating / derated limit</span><strong>${result.ratedPowerW} W / ${(result.deratedLimitW*1000).toFixed(1)} mW</strong></div>`,`<div class="result-metric"><span>Suggested minimum rating</span><strong>≥ ${result.recommendedMinimumRatingW.toFixed(2)} W</strong></div>`);
    waveform=`<figure class="result-waveform"><figcaption>Electrical loading advisory · thermal model unavailable</figcaption><p class="model-limit">Temperature rise and thermal safety are not calculated. Verify datasheet ratings and real operating conditions.</p></figure>`;
  } else if (result.kind === "monte-carlo-tolerance") {
    const bins=result.histogram, max=Math.max(...bins.map(bin=>bin.count),1), bars=bins.map((bin,index)=>{const x=32+index*41,y=96-(bin.count/max)*68,w=26,h=96-y;return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"></rect>`;}).join("");
    waveform=`<figure class="result-waveform"><figcaption>Seeded current distribution · ${result.sampleCount} trials · R tolerance ±${result.tolerancePct}%</figcaption><svg viewBox="0 0 480 118" role="img" aria-label="Histogram of simulated LED current values"><path class="wave-axis" d="M28 18 V98 H458"></path><g class="histogram-bars">${bars}</g><text x="30" y="114">${(result.minimum*1000).toFixed(2)} mA</text><text x="400" y="114">${(result.maximum*1000).toFixed(2)} mA</text></svg></figure>`;
    metrics.push(`<div class="result-metric"><span>Mean current</span><strong>${(result.mean*1000).toFixed(3)} mA</strong></div>`,`<div class="result-metric"><span>Std. deviation</span><strong>${(result.standardDeviation*1000).toFixed(3)} mA</strong></div>`,`<div class="result-metric"><span>Median current</span><strong>${(result.median*1000).toFixed(3)} mA</strong></div>`);
  } else if (result.kind === "parameter-sweep") {
    const points=result.points, max=Math.max(...points.map(point=>point.currentA),1e-12), path=points.map((point,index)=>{const x=32+(416*index)/(points.length-1),y=94-(point.currentA/max)*68;return (index?"L ":"M ")+x.toFixed(1)+" "+y.toFixed(1);}).join(" ");
    waveform=`<figure class="result-waveform"><figcaption>LED current vs. ${escape(result.parameterReference)} resistance · ${points.length} tested values</figcaption><svg viewBox="0 0 480 118" role="img" aria-label="LED current decreases as series resistance increases"><path class="wave-axis" d="M28 18 V98 H458"></path><path class="wave-trace" d="${path}"></path><text x="30" y="114">${points[0].resistanceOhms} Ω</text><text x="400" y="114">${points.at(-1).resistanceOhms} Ω</text></svg></figure>`;
    for(const point of points)metrics.push(`<div class="result-metric"><span>${point.resistanceOhms} Ω</span><strong>${(point.currentA*1000).toFixed(3)} mA</strong></div>`);
  } else if (result.kind === "rlc-step-response") {
    const samples=result.samples, max=Math.max(...samples.map(point=>point.capacitorVoltageV),result.sourceVoltage), path=samples.map((point,index)=>{const x=24+(432*index)/(samples.length-1),y=86-(point.capacitorVoltageV/max)*62;return (index?"L ":"M ")+x.toFixed(1)+" "+y.toFixed(1);}).join(" ");
    waveform=`<figure class="result-waveform"><figcaption>Series RLC pulse response · ${result.regime} · ${result.dampedFrequencyHz.toFixed(2)} Hz</figcaption><svg viewBox="0 0 480 108" role="img" aria-label="RLC capacitor voltage transient showing damping and ringing"><path class="wave-axis" d="M20 86 H468 M24 16 V90"></path><path class="wave-trace" d="${path}"></path><text x="24" y="104">0 s</text><text x="405" y="104">${result.durationS.toPrecision(3)} s</text></svg></figure>`;
  } else if (result.kind === "rc-bode-plot") {
    const points=result.points, x=index=>30+(420*index)/(points.length-1), yMag=value=>22+Math.min(44,Math.max(0,-value/40*44)), yPhase=value=>75+(-value/90)*34;
    const mag=points.map((point,index)=>(index?"L ":"M ")+x(index).toFixed(1)+" "+yMag(point.magnitudeDb).toFixed(1)).join(" "), phase=points.map((point,index)=>(index?"L ":"M ")+x(index).toFixed(1)+" "+yPhase(point.phaseDeg).toFixed(1)).join(" ");
    waveform=`<figure class="result-waveform"><figcaption>RC low-pass Bode response · cutoff ${result.cutoffHz.toFixed(2)} Hz</figcaption><svg viewBox="0 0 480 124" role="img" aria-label="RC Bode plot with magnitude and phase versus logarithmic frequency"><path class="wave-axis" d="M28 20 V112 H458 M28 72 H458"></path><path d="${mag}" fill="none" stroke="#36d5f5" stroke-width="2"></path><path d="${phase}" fill="none" stroke="#ffb55d" stroke-width="2"></path><circle cx="${x(result.cutoffIndex).toFixed(1)}" cy="${yMag(result.cutoffMagnitudeDb).toFixed(1)}" r="4" fill="#ffffff"></circle><text x="30" y="12">Magnitude (dB)</text><text x="30" y="121">Frequency (log Hz)</text><text x="338" y="12" fill="#ffb55d">Phase (deg)</text><text x="${(x(result.cutoffIndex)+6).toFixed(1)}" y="35">fc</text></svg></figure>`;
  } else if (result.kind === "eeprom-ring-logger") {
    metrics.push(["Sample interval", result.samplePeriodMs + " ms"], ["Buffer capacity", String(result.capacity)], ["Samples recorded", String(result.recordedSamples)], ["Overwritten records", String(result.overwrittenRecords)], ["Buffer wrapped", result.bufferWrapped ? "Yes" : "No"], ["Replay values", result.replayValues.join(", ") + " °C"]);
  } else if (result.kind === "low-power-sleep-wake") {
    metrics.push(["Run duration", result.durationMs + " ms"], ["MCU sleep current", result.sleepCurrentUa + " µA"], ["MCU run current", result.runCurrentUa + " µA"], ["Wake events", String(result.wakeCount)], ["Awake / asleep", result.awakeTimeMs + " / " + result.sleepTimeMs + " ms"], ["Estimated average supply current", result.averageSupplyCurrentUa.toFixed(2) + " µA"], ["Estimated energy", result.energyMj.toFixed(3) + " mJ"], ["LED load while awake", result.ledPeakCurrentMa.toFixed(2) + " mA"]);
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
    waveform = `<figure class="result-waveform"><figcaption>Ideal tuned response · peak ${result.peakFrequencyMHz.toFixed(2)} MHz</figcaption><svg viewBox="0 0 480 108" role="img" aria-label="Ideal FM front-end gain versus frequency"><path class="wave-axis" d="M20 84 H468 M24 18 V88"></path><path class="wave-trace" d="${path}"></path><text x="24" y="103">${points[0].frequencyMHz.toFixed(0)} MHz</text><text x="402" y="103">${points.at(-1).frequencyMHz.toFixed(0)} MHz</text></svg></figure>`;
  } else if (result.kind === "ir-remote-action") {
    metrics.push(["Protocol", result.protocol], ["Decoded frame", result.rawCode], ["Address", result.address], ["Command", result.command], ["Selected action", result.action], ["Action mapping entries", String(result.mapEntries)], ["Frame duration", result.frameDurationUs + " µs"], ["Action executed", result.actionExecuted ? "Yes" : "No (display only)"]);
  } else if (result.kind === "ethernet-sensor-frame") {
    metrics.push(["Link transitions", result.linkTransitions.join(" → ")], ["Link state", result.linkState], ["Configuration", result.configurationState], ["Transaction", result.transactionState], ["Ethernet-II header", result.headerHex ?? "Not formed"], ["Sensor payload", result.payloadHex ?? "Not formed"], ["Mock frame length", result.frameLengthOctets + " octets"], ["FCS / padding", (result.fcsIncluded ? "FCS included" : "FCS omitted") + " / " + (result.paddingIncluded ? "included" : "omitted")], ["Packet transmission", result.packetTransmitted ? "Yes" : "No (local mock)"]);
  } else if (result.kind === "wifi-relay-control") {
    metrics.push(["Local command", result.command], ["Wi-Fi link", result.linkState], ["Authentication model", result.authentication], ["Command result", result.transactionState], ["Ideal relay driver", result.relayEnergized ? "Energized" : "De-energized"], ["Coil current estimate", result.coilCurrentMa.toFixed(1) + " mA"], ["Physical relay action", result.physicalRelaySwitched ? "Modeled" : "Not modeled"], ["Network transmission", result.networkTransmitted ? "Yes" : "No (local mock)"]);
  } else if (result.kind === "gsm-alarm-mock") {
    metrics.push(["Alarm input", result.alarmState], ["AT commands completed", result.commandsCompleted + " / " + result.commands.length], ["Transaction state", result.transactionState], ["Alert text", result.messageBody ?? "Not prepared"], ["Mock modem accepted", result.modemAccepted ? "Yes" : "No"], ["Delivery confirmed", result.deliveryConfirmed ? "Yes" : "No"], ["Radio transmission", result.radioTransmitted ? "Yes" : "No (local mock)"]);
  } else if (result.kind === "lora-sensor-node") {
    metrics.push(["Node ID", String(result.nodeId)], ["Temperature sample", result.temperatureC.toFixed(1) + " °C"], ["Application payload", result.payloadHex], ["Payload size", result.payloadLengthOctets + " octets"], ["Configured airtime", result.airtimeMs + " ms per send"], ["Duty window / configured limit", result.dutyWindowMs + " ms / " + result.dutyLimitPercent + " %"], ["Accepted / rejected requests", result.sentCount + " / " + result.rejectedCount], ["Airtime used", result.usedAirtimeMs + " / " + result.airtimeBudgetMs + " ms"], ["Window duty estimate", result.dutyCyclePercent.toFixed(3) + " %"], ["Radio transmission", result.radioTransmitted ? "Yes" : "No (mock only)"]);
  } else if (result.kind === "ble-beacon-config") {
    metrics.push(["Device name", result.deviceName], ["Flags", "0x" + result.flags.toString(16).padStart(2, "0").toUpperCase()], ["16-bit service UUID", result.serviceUuid], ["Tx power field", result.txPowerDbm + " dBm"], ["Encoded legacy payload", result.payloadHex], ["Advertising data length", result.payloadLengthOctets + " / " + result.legacyMaximumOctets + " octets"], ["Radio transmission", result.radioTransmitted ? "Yes" : "No (configuration only)"]);
  } else if (result.kind === "nfc-uid-display") {
    metrics.push(["Read status", result.readStatus], ["Tag UID", result.uid], ["Authentication", "UID is not authentication"]);
  } else if (result.kind === "epaper-refresh") {
    metrics.push(["Refresh mode", result.refreshMode], ["Frame changes", result.changedTiles + " / " + result.totalTiles], ["Changed fraction", (result.changeFraction * 100).toFixed(1) + " %"], ["Panel power", result.panelPower], ["Woke from sleep", result.wakeOccurred ? "Yes" : "No"], ["Estimated duration", result.estimatedDurationMs + " ms"], ["Refresh complete", result.refreshCompleted ? "Yes" : "No"], ["Partial count after", String(result.partialsSinceFullAfter)], ["State sequence", result.stateSequence.join(" → ")]);
  } else if (result.kind === "solar-mpp-sweep") {
    metrics.push(["Open-circuit voltage",result.openCircuitVoltageV.toFixed(2)+" V"],["Short-circuit current",(result.shortCircuitCurrentA*1000).toFixed(1)+" mA"],["Configured MPP",result.configuredMppVoltageV.toFixed(2)+" V · "+(result.configuredMppCurrentA*1000).toFixed(1)+" mA"],["Best sampled point",result.maximumPowerPoint.voltageV.toFixed(2)+" V · "+(result.maximumPowerPoint.currentA*1000).toFixed(1)+" mA"],["Sampled power",result.maximumPowerPoint.powerW.toFixed(3)+" W"],["Converter output estimate",result.conversionOutputPowerW.toFixed(3)+" W"],["Sweep points",String(result.sampleCount)],["Model boundary","Static curve sweep; no tracking algorithm or hardware modeled"]);
  } else if (result.kind === "usb-c-pd-sink") {
    metrics.push(["Negotiation state",result.negotiationState],["Selected VBUS",result.selectedVoltageV.toFixed(2)+" V"],["Load current",(result.loadCurrentA*1000).toFixed(1)+" mA"],["Load power",result.loadPowerW.toFixed(2)+" W"],["Available profiles",result.availableProfilesV.map(v=>v+" V").join(", ")],["Decision",result.reason],["Model boundary","Fixed-profile policy estimate; no USB-PD signaling or compliance test"]);
  } else if (result.kind === "usb-c-pd-source") {
    metrics.push(["Source state",result.sourceState],["Negotiation state",result.negotiationState],["Selected PDO",result.selectedVoltageV+" V · "+result.selectedCurrentLimitA+" A"],["Advertised PDOs",result.advertisedProfiles.map(p=>p.voltageV+" V / "+p.currentLimitA+" A").join(", ")],["Output voltage",result.outputVoltageV.toFixed(2)+" V"],["Load current",(result.loadCurrentA*1000).toFixed(1)+" mA"],["Load power",result.loadPowerW.toFixed(2)+" W"],["Model boundary","Fixed-PDO policy estimate; no USB-PD signaling or compliance test"]);
  } else if (result.kind === "poe-pd-input") {
    metrics.push(["Active feed",result.activeFeed],["Input polarity",result.inputPolarity],["Rectified input",result.rectifiedInputVoltageV.toFixed(2)+" V"],["DC/DC stage",result.converterEnabled ? "Enabled" : "Disabled"],["Output voltage",result.outputVoltageV.toFixed(2)+" V"],["Load current",(result.loadCurrentA*1000).toFixed(1)+" mA"],["Load power",result.loadPowerW.toFixed(2)+" W"],["Model boundary","Ideal feed bridge and DC/DC estimate; no PoE compliance or RJ45 mapping"]);
  } else if (result.kind === "constant-current-led-driver") {
    metrics.push(["Regulation state",result.regulationState],["LED forward voltage",result.ledForwardVoltageV.toFixed(2)+" V"],["LED current",(result.ledCurrentA*1000).toFixed(1)+" mA"],["Sense voltage",result.senseVoltageV.toFixed(3)+" V"],["Compliance headroom",result.headroomV.toFixed(2)+" V"],["LED power",result.ledPowerW.toFixed(2)+" W"],["Input power estimate",result.inputPowerW.toFixed(2)+" W"],["Warning",result.warning||"None"],["Model boundary","Ideal average current regulation; no switching or thermal simulation"]);
  } else if (result.kind === "mosfet-half-bridge") {
    metrics.push(["Gate timing",result.gateSequence.map(state=>state.phase+" "+(state.durationS*1e6).toFixed(2)+" µs").join(" · ")],["High-side duty",result.highDutyPercent+" %"],["Low-side duty",result.lowDutyPercent+" %"],["Dead-time fraction",(result.deadTimeFraction*100).toFixed(1)+" %"],["High-side on current",(result.highSideOnCurrentA*1000).toFixed(1)+" mA"],["Average high-side current",(result.highSideAverageCurrentA*1000).toFixed(1)+" mA"],["Shoot-through overlap",result.shootThrough ? "Detected" : "None"],["Model boundary","Ideal dead-time timing and resistive-load estimate"]);
  } else if (result.kind === "reverse-polarity-protection") {
    metrics.push(["Input polarity",result.inputPolarity],["Protector",result.protectedOn?"Conducting":"Reverse blocked"],["Input / output voltage",result.inputVoltageV.toFixed(2)+" / "+result.outputVoltageV.toFixed(2)+" V"],["Load current / power",(result.loadCurrentA*1000).toFixed(1)+" mA / "+result.loadPowerW.toFixed(3)+" W"],["MOSFET path drop",result.forwardDropV.toFixed(2)+" V"],["Model boundary","Ideal polarity test; no transient or safety qualification"]);
  } else if (result.kind === "surge-protected-input") {
    metrics.push(["Surge pulse",result.pulsePeakVoltageV.toFixed(1)+" V · "+(result.pulseWidthS*1000).toFixed(2)+" ms"],["TVS clamp / energy",result.clampVoltageV.toFixed(1)+" V · "+(result.absorbedEnergyJ*1000).toFixed(2)+" mJ"],["Fuse I²t",result.fuseI2tDemand.toFixed(4)+" / "+result.fuseI2tLimit.toFixed(4)+" A²s · "+(result.fuseWarning?"warning":"within hold")],["Protected output",result.outputEnabled?result.outputVoltageV.toFixed(2)+" V":"Disabled · fuse tripped"],["Filtered transient",result.filteredSurgeOutputVoltageV.toFixed(2)+" V"],["RC time constant",(result.filterTimeConstantS*1000).toFixed(2)+" ms"],["Model boundary","Single-pulse educational estimate; no surge compliance or hardware safety qualification"]);
  } else if (result.kind === "hotswap-protection") {
    metrics.push(["Input / output state",result.busVoltageV.toFixed(1)+" V / "+(result.outputEnabled?"Enabled":"Tripped or disabled")],["Capacitive inrush", (result.rawInrushCurrentA*1000).toFixed(1)+" mA raw · "+(result.inrushCurrentA*1000).toFixed(1)+" mA limited"],["Ramp / estimated charge time",(result.rampTimeS*1000).toFixed(1)+" / "+(result.estimatedChargeTimeS*1000).toFixed(2)+" ms"],["Steady load current",(result.loadCurrentA*1000).toFixed(1)+" mA"],["Overload limit / trip",(result.overloadLimitA*1000).toFixed(0)+" mA / "+(result.overloadTrip?"Yes":"No")],["MOSFET dissipation",result.mosfetPowerW.toFixed(3)+" W"],["Model boundary","Ideal current-limit estimate; no SOA or thermal qualification"]);
  } else if (result.kind === "electronic-load") {
    metrics.push(["DUT supply / current limit",result.supplyVoltageV.toFixed(2)+" V / "+(result.maxCurrentA*1000).toFixed(0)+" mA"],["Shunt resistance / tolerance",result.shuntResistanceOhm+" Ω / ±"+result.tolerancePercent+" %"],["Current-step results",result.steps.map(step=>(step.requestedCurrentA*1000).toFixed(0)+"→"+(step.measuredCurrentA*1000).toFixed(0)+" mA").join(" · ")],["MOSFET dissipation",result.steps.map(step=>step.mosfetPowerW.toFixed(2)+" W").join(" · ")],["All steps within tolerance",result.allStepsWithinTolerance?"Yes":"No"],["Model boundary","Ideal steady-state loop; transient and SOA behavior not modeled"]);
  } else if (result.kind === "inverter-waveform") {
    metrics.push(["DC bus / modulation",result.busVoltageV.toFixed(1)+" V / "+result.modulationIndex.toFixed(2)],["Carrier / output frequency",result.carrierFrequencyHz+" Hz / "+result.outputFrequencyHz+" Hz"],["Unfiltered / filtered RMS",result.unfilteredFundamentalVrms.toFixed(2)+" / "+result.filteredOutputVrms.toFixed(2)+" V"],["LC resonance",result.filterResonanceHz.toFixed(1)+" Hz"],["Target tolerance",result.targetVrms+" V ±"+result.tolerancePercent+" % · "+(result.targetMet?"met":"not met")],["Load current / power",(result.loadCurrentRmsA*1000).toFixed(1)+" mA / "+result.loadPowerW.toFixed(2)+" W"],["Model boundary","Fundamental and passive filter estimate; PWM waveform not modeled"]);
  } else if (result.kind === "ups-transfer") {
    metrics.push(["Mains / selected source",result.mainsAvailable?"Present":"Lost · "+result.sourceSelected],["UPS output",result.outputEnabled?result.outputVoltageV.toFixed(2)+" V":"Disabled"],["Load current / power",(result.loadCurrentA*1000).toFixed(1)+" mA / "+result.loadPowerW.toFixed(2)+" W"],["Battery state of charge",result.stateOfChargePercent+" %"],["Estimated / required hold-up",result.estimatedHoldUpMin.toFixed(1)+" / "+result.requiredHoldUpMin+" min"],["Hold-up window",result.holdUpSatisfied?"Met":"Not met"],["Charge / discharge current",(result.batteryChargeCurrentA*1000).toFixed(0)+" / "+(result.batteryDischargeCurrentA*1000).toFixed(0)+" mA"],["Model boundary","Ideal energy and transfer estimate; no runtime or safety guarantee"]);
  } else if (result.kind === "ssr-ac-switch") {
    metrics.push(["Control / relay state",result.control+" / "+result.loadState],["Fault",result.fault],["AC source",result.sourceRmsVoltageV+" V RMS · "+result.frequencyHz+" Hz"],["Load voltage / current",result.loadVoltageRmsV.toFixed(2)+" V RMS / "+(result.loadCurrentRmsA*1000).toFixed(2)+" mA RMS"],["Off-state leakage",(result.offLeakageCurrentA*1000).toFixed(2)+" mA"],["Load power",result.loadPowerW.toFixed(3)+" W"],["Model boundary","Ideal AC SSR estimate; isolation is not a physical safety qualification"]);
  } else if (result.kind === "triac-ac-dimmer") {
    metrics.push(["AC input",result.sourceRmsVoltageV.toFixed(1)+" V RMS · "+result.frequencyHz+" Hz"],["Phase angle",result.phaseAngleDeg+"°"],["Zero-cross synchronization",result.zeroCrossLocked?"Locked":"Lost"],["Triac firing",result.firingEnabled?"Enabled":"Inhibited"],["Lamp voltage / current",result.lampVoltageRmsV.toFixed(2)+" V RMS / "+(result.lampCurrentRmsA*1000).toFixed(1)+" mA RMS"],["Lamp power",result.lampPowerW.toFixed(2)+" W"],["Model boundary","RMS estimator only; no mains safety, isolation, or switching model"]);
  } else if (result.kind === "igbt-inverter-leg") {
    metrics.push(["Switching state",result.switchingState],["High / low gate",String(result.highGateOn)+" / "+String(result.lowGateOn)],["Fault input",result.fault],["Interlock",result.interlockActive?"Active":"Inactive"],["Output / load current",result.outputVoltageV.toFixed(2)+" V / "+(result.loadCurrentA*1000).toFixed(1)+" mA"],["Load power",result.loadPowerW.toFixed(2)+" W"],["Model boundary","Ideal IGBT logic and resistive-load estimate; no switching or safety qualification"]);
  } else if (result.kind === "bms-cell-monitor") {
    metrics.push(["Stack voltage",result.stackVoltageV.toFixed(2)+" V"],["Cell range",result.minimumCellV.toFixed(3)+"–"+result.maximumCellV.toFixed(3)+" V"],["Fault state",result.faultState],["Over-voltage cells",result.overVoltageCells.join(", ")||"None"],["Under-voltage cells",result.underVoltageCells.join(", ")||"None"],["Balance requests",result.cellsToBalance.join(", ")||"None"],["Balancing / protection","Report only; not actuated"],["Model boundary","Ideal thresholds; no cell chemistry or safety qualification"]);
  } else if (result.kind === "liion-charge") {
    metrics.push(["Cell present",result.cellPresent?"Yes":"No"],["Charge phase",result.phase],["Cell voltage",result.cellVoltageV.toFixed(3)+" V"],["Charge current",(result.chargeCurrentA*1000).toFixed(1)+" mA"],["Temperature",result.temperatureC.toFixed(1)+" °C"],["Battery power",(result.batteryPowerW*1000).toFixed(1)+" mW"],["Input current",(result.inputCurrentA*1000).toFixed(1)+" mA"],["Charging",result.chargingEnabled?"Enabled":"Inhibited"],["Model boundary","Ideal CC/CV estimator; no cell or charger safety qualification"]);
  } else if (result.kind === "buckboost-converter") {
    metrics.push(["Conversion mode",result.mode],["Input → target",result.inputVoltageV.toFixed(2)+" V → "+result.outputTargetV.toFixed(2)+" V"],["Regulated estimate",result.outputVoltageV.toFixed(2)+" V"],["Duty cycle",result.dutyCyclePercent.toFixed(1)+" %"],["Input / load current",(result.inputCurrentA*1000).toFixed(2)+" mA / "+(result.loadCurrentA*1000).toFixed(2)+" mA"],["Inductor / output ripple",(result.inductorRipplePpA*1000).toFixed(2)+" mA / "+(result.outputRipplePpV*1000).toFixed(2)+" mV p-p"],["Assumed efficiency",result.assumedEfficiencyPercent.toFixed(1)+" %"],["Model boundary","Ideal average model; switching waveforms not modeled"]);
  } else if (result.kind === "boost-converter") {
    metrics.push(["Input voltage",result.inputVoltageV.toFixed(2)+" V"],["Duty cycle",result.dutyCyclePercent.toFixed(1)+" %"],["Average output",result.outputVoltageV.toFixed(3)+" V"],["Input / load current",(result.inputCurrentA*1000).toFixed(2)+" mA / "+(result.loadCurrentA*1000).toFixed(2)+" mA"],["Inductor ripple",(result.inductorRipplePpA*1000).toFixed(2)+" mA p-p"],["Output ripple",(result.outputRipplePpV*1000).toFixed(2)+" mV p-p"],["Conduction mode",result.conductionMode],["Estimated efficiency",result.estimatedEfficiencyPercent.toFixed(1)+" %"],["Model boundary","Average CCM estimate; switching loop and hardware not modeled"]);
  } else if (result.kind === "buck-converter") {
    metrics.push(["Input voltage",result.inputVoltageV.toFixed(2)+" V"],["Duty cycle",result.dutyCyclePercent.toFixed(1)+" %"],["Average output",result.outputVoltageV.toFixed(3)+" V"],["Load current", (result.loadCurrentA*1000).toFixed(2)+" mA"],["Inductor ripple", (result.inductorRipplePpA*1000).toFixed(2)+" mA p-p"],["Output ripple", (result.outputRipplePpV*1000).toFixed(2)+" mV p-p"],["Conduction mode",result.conductionMode],["Estimated efficiency",result.estimatedEfficiencyPercent.toFixed(1)+" %"],["Model boundary","Average CCM estimate; switching loop and hardware not modeled"]);
  } else if (result.kind === "seven-segment-clock") {
    metrics.push(["Time before",result.initialTime],["Clock ticks",String(result.ticks)+" at "+result.tickHz+" Hz"],["Time after",result.outputTime],["Midnight rollovers",String(result.midnightRollovers)],["Display",result.displayDigits+" digit "+result.displayType],["Firmware / hardware","Not modeled"]);
    waveform="<figure class=\"result-waveform\"><figcaption>Seven-segment clock · "+result.outputTime+"</figcaption><svg viewBox=\"0 0 480 112\" role=\"img\" aria-label=\"Six seven-segment clock digits\"><rect x=\"10\" y=\"10\" width=\"460\" height=\"92\" rx=\"8\" fill=\"#071a24\" stroke=\"#32cfe0\"></rect><text x=\"240\" y=\"69\" text-anchor=\"middle\" fill=\"#67e9ed\" font-family=\"monospace\" font-size=\"42\">"+result.outputTime+"</text></svg></figure>";
  } else if (result.kind === "oled-status-panel") {
    metrics.push(["Panel state", result.displayState], ["Temperature", result.temperatureC===null?"Missing":result.temperatureC.toFixed(1)+" °C"], ["Humidity", result.humidityPct===null?"Missing":result.humidityPct.toFixed(0)+" %"], ["Pressure", result.pressureHpa===null?"Missing":result.pressureHpa.toFixed(0)+" hPa"], ["Missing sensors", result.missingSensors.join(", ")||"None"], ["Display format", result.displayColumns+" × "+result.displayRows], ["Line overflow", result.overflowLines.length?"Yes":"No"]);
    waveform="<figure class=\"result-waveform\"><figcaption>OLED status panel · "+result.displayState+"</figcaption><svg viewBox=\"0 0 480 112\" role=\"img\" aria-label=\"Two-line OLED status panel\"><rect x=\"12\" y=\"12\" width=\"456\" height=\"88\" rx=\"8\" fill=\"#071a24\" stroke=\"#32cfe0\"></rect><text x=\"28\" y=\"50\" fill=\"#67e9ed\" font-family=\"monospace\" font-size=\"20\">"+result.displayLines[0]+"</text><text x=\"28\" y=\"82\" fill=\"#67e9ed\" font-family=\"monospace\" font-size=\"20\">"+result.displayLines[1]+"</text></svg></figure>";
  } else if (result.kind === "rgb-pwm-controller") {
    metrics.push(["Requested colour", result.cssColor], ["PWM frequency", result.frequencyHz.toFixed(0) + " Hz"], ["Red duty / current", result.channels.R.dutyCyclePercent.toFixed(1) + " % / " + result.channels.R.averageCurrentMa.toFixed(2) + " mA"], ["Green duty / current", result.channels.G.dutyCyclePercent.toFixed(1) + " % / " + result.channels.G.averageCurrentMa.toFixed(2) + " mA"], ["Blue duty / current", result.channels.B.dutyCyclePercent.toFixed(1) + " % / " + result.channels.B.averageCurrentMa.toFixed(2) + " mA"], ["Total average current", result.totalAverageCurrentMa.toFixed(2) + " mA"], ["Per-channel limit", result.peakChannelCurrentLimitMa + " mA peak"], ["Mapping", "8-bit linear PWM"]);
    waveform="<figure class=\"result-waveform\"><figcaption>RGB output · "+result.cssColor+"</figcaption><svg viewBox=\"0 0 480 84\" role=\"img\" aria-label=\"Requested RGB PWM colour\"><rect x=\"20\" y=\"18\" width=\"440\" height=\"48\" rx=\"8\" fill=\""+result.cssColor+"\"></rect></svg></figure>";
  } else if (result.kind === "digital-volume-control") {
    metrics.push(["Input level", result.inputPeakV.toFixed(3) + " V peak"], ["Output level", result.outputPeakV.toFixed(3) + " V peak"], ["Volume command", result.command + " / " + (result.steps - 1)], ["Control position", result.commandPercent.toFixed(0) + " %"], ["Gain", result.gainDb.toFixed(1) + " dB"], ["Output RMS", result.outputRmsV.toFixed(3) + " V"], ["Loaded output", (result.loadResistanceOhm / 1000).toFixed(0) + " kΩ"], ["Model", "Linear digital potentiometer"]);
    waveform="<figure class=\"result-waveform\"><figcaption>Digital volume · "+result.commandPercent.toFixed(0)+"%</figcaption><svg viewBox=\"0 0 480 72\" role=\"img\" aria-label=\"Digital volume level\"><rect x=\"20\" y=\"24\" width=\"440\" height=\"24\" rx=\"12\" fill=\"#173044\"></rect><rect x=\"20\" y=\"24\" width=\""+(440*result.attenuationRatio).toFixed(1)+"\" height=\"24\" rx=\"12\" fill=\"#36d9a7\"></rect></svg></figure>";
  } else if (result.kind === "pwm-audio-dac") {
    metrics.push(["PWM frequency", result.frequencyHz.toFixed(0) + " Hz"], ["Duty cycle", result.dutyCyclePercent.toFixed(1) + " %"], ["Average output", result.averageOutputV.toFixed(3) + " V"], ["Steady-state ripple", (result.rippleVpp * 1000).toFixed(2) + " mV p-p"], ["RC time constant", (result.timeConstantSeconds * 1000).toFixed(2) + " ms"], ["Loaded high target", result.highPeakV.toFixed(3) + " V"], ["Minimum valley", result.lowValleyV.toFixed(3) + " V"], ["Duty tracking", result.tracksDutyCycle ? "Yes" : "No"]);
  } else if (result.kind === "audio-summing-mixer") {
    metrics.push(["Input 1", result.input1V.toFixed(3) + " V"], ["Input 2", result.input2V.toFixed(3) + " V"], ["R1 weighting", (result.weight1 * 100).toFixed(1) + " %"], ["R2 weighting", (result.weight2 * 100).toFixed(1) + " %"], ["Summing node", result.sumNodeV.toFixed(3) + " V"], ["Buffered output", result.outputV.toFixed(3) + " V"], ["Clipping", result.clipped ? "Yes" : "No"], ["Model", "Resistive weighted average"]);
  } else if (result.kind === "guitar-buffer-response") {
    metrics.push(["Pickup source resistance", result.sourceResistanceOhm.toFixed(0) + " Ω"], ["Buffer input resistance", (result.inputResistanceOhm / 1000000).toFixed(2) + " MΩ"], ["Input impedance ratio", result.inputImpedanceRatio.toFixed(0) + "×"], ["Coupling capacitor", (result.couplingCapacitanceF * 1e9).toFixed(0) + " nF"], ["Output load", (result.outputLoadOhm / 1000).toFixed(0) + " kΩ"], ["1 kHz gain", result.midbandGainRatio.toFixed(3) + "×"], ["High input impedance", result.highInputImpedance ? "Yes" : "No"], ["Unity gain in band", result.unityGainInBand ? "Yes" : "No"]);
    const points=result.responsePoints,min=Math.min(...points.map(point=>point.gainRatio)),max=Math.max(...points.map(point=>point.gainRatio)),span=Math.max(0.001,max-min),path=points.map((point,index)=>((index?"L ":"M ")+(24+432*index/Math.max(1,points.length-1)).toFixed(1)+" "+(82-(point.gainRatio-min)/span*62).toFixed(1))).join(" ");
    waveform="<figure class=\"result-waveform\"><figcaption>Pickup-to-buffer AC response</figcaption><svg viewBox=\"0 0 480 100\" role=\"img\" aria-label=\"Guitar buffer gain by frequency\"><path class=\"wave-axis\" d=\"M20 82 H468 M24 16 V88\"></path><path class=\"wave-trace\" d=\""+path+"\"></path></svg></figure>";
  } else if (result.kind === "audio-tone-spectrum") {
    metrics.push(["Tone frequency", result.frequencyHz.toFixed(1) + " Hz"], ["Peak amplitude", result.amplitudePeakV.toFixed(3) + " V"], ["Sample rate", result.sampleRateHz.toFixed(0) + " samples/s"], ["Capture", (result.durationSeconds * 1000).toFixed(2) + " ms"], ["Rising zero crossings", String(result.positiveZeroCrossings)], ["Measured frequency", result.measuredFrequencyHz.toFixed(1) + " Hz"], ["Fundamental amplitude", result.fundamentalAmplitudeV.toFixed(4) + " V"], ["Second harmonic", result.secondHarmonicDbc.toFixed(1) + " dBc"], ["THD estimate", result.thdPercent.toExponential(2) + " %"]);
    const points=result.sampleTrace,low=Math.min(...points),high=Math.max(...points),range=Math.max(0.001,high-low),path=points.map((value,index)=>((index?"L ":"M ")+(24+432*index/Math.max(1,points.length-1)).toFixed(1)+" "+(82-(value-low)/range*62).toFixed(1))).join(" ");
    waveform="<figure class=\"result-waveform\"><figcaption>Ideal sampled sine · "+result.frequencyHz.toFixed(0)+" Hz</figcaption><svg viewBox=\"0 0 480 100\" role=\"img\" aria-label=\"Generated audio tone waveform\"><path class=\"wave-axis\" d=\"M20 82 H468 M24 16 V88\"></path><path class=\"wave-trace\" d=\""+path+"\"></path></svg></figure>";
  } else if (result.kind === "electret-mic-meter") {
    metrics.push(["Microphone bias", result.micBiasCurrentMa.toFixed(2) + " mA"], ["Mic terminal voltage", result.micSupplyVoltageV.toFixed(2) + " V"], ["Input level", (result.inputPeakV * 1000).toFixed(1) + " mV peak"], ["Frequency", result.frequencyHz.toFixed(0) + " Hz"], ["Preamp gain", result.gain.toFixed(1) + "×"], ["Rectified envelope", (result.rectifiedPeakV * 1000).toFixed(1) + " mV"], ["LED segments", result.ledSegmentsOn + " / 10"], ["Model scope", "Ideal signal chain"]);
    const bars=result.segments.map((segment,index)=>"<rect x=\"" + (24+index*44) + "\" y=\"26\" width=\"34\" height=\"48\" rx=\"4\" fill=\"" + (segment.on?"#38d9a9":"#1b3344") + "\" stroke=\"" + (segment.on?"#83ffe0":"#537286") + "\"></rect>").join("");
    waveform = "<figure class=\"result-waveform\"><figcaption>Calibrated audio level · " + result.ledSegmentsOn + "/10 segments</figcaption><svg viewBox=\"0 0 480 100\" role=\"img\" aria-label=\"Ten segment audio level meter\">" + bars + "</svg></figure>";
  } else if (result.kind === "usb-uart-console") {
    metrics.push(["Baud rate", result.baud + " bit/s"], ["Framing", result.dataBits + result.parity[0].toUpperCase() + result.stopBits], ["TX bytes", result.txHex.join(" ")], ["TX text", result.txAscii], ["RX bytes", result.rxHex.join(" ") || "None"], ["RX text", result.rxAscii || "None"], ["TX duration", (result.txDurationSeconds * 1000).toFixed(3) + " ms"], ["RX duration", (result.rxDurationSeconds * 1000).toFixed(3) + " ms"], ["USB enumeration", "Not modeled"], ["Host contact", "None"]);
  } else if (result.kind === "i2c-level-shifter") {
    metrics.push(["Low-voltage rail", result.lowRailV.toFixed(2) + " V"], ["High-voltage rail", result.highRailV.toFixed(2) + " V"], ["Low-side pull-ups", result.lowPullupOhm + " Ω"], ["High-side pull-ups", result.highPullupOhm + " Ω"], ["Transitions checked", String(result.transitionCount)], ["Low-side driven lows", String(result.lowSideDriveTransitions)], ["High-side driven lows", String(result.highSideDriveTransitions)], ["Peak static pull-up current", result.peakCombinedPullupSinkCurrentMa.toFixed(3) + " mA"], ["Rail overvoltage", "None in ideal model"], ["Bidirectional test", result.bidirectionalTransitionsVerified ? "Passed" : "Failed"]);
  } else if (result.kind === "rfid-inventory") {
    metrics.push(["Frequency band", result.bandMHz.toFixed(2) + " MHz"], ["Inventory slots", String(result.slotCount)], ["Fixture tags", String(result.tagCount)], ["Unique UIDs", String(result.uniqueUidCount)], ["Duplicate UID count", String(result.duplicateUidCount)], ["Occupied slots", String(result.occupiedSlots)], ["Collision slots", String(result.collisionSlotCount)], ["Inventory complete", result.inventoryComplete ? "Yes" : "No"], ["RF transmission", "Not modeled"], ["Anti-collision protocol", "Not modeled"]);
  } else if (result.kind === "rfid-access") {
    metrics.push(["Tag UID", result.uid], ["Access decision", result.accessState], ["Lock output", result.lockOutput ? "Unlocked (simulated)" : "Locked"], ["Allowlist entries", String(result.allowlistEntries)], ["Credential model", result.authentication]);
  } else if (result.kind === "gnss-rmc") {
    metrics.push(["Sentence", result.sentenceType], ["UTC time", result.utcTime], ["Fix status", result.fixStatus], ["Latitude", result.latitude.toFixed(5) + "°"], ["Longitude", result.longitude.toFixed(5) + "°"], ["Speed", result.speedKnots.toFixed(1) + " kn"], ["Checksum", result.checksumValid ? "Valid" : "Invalid"]);
  } else if (result.kind === "rs485-addressed-poll") {
    metrics.push(["Polled node", result.pollAddress], ["Temperature", result.temperatureC.toFixed(1) + " °C"], ["Responding nodes", String(result.respondingNodes)], ["Silent nodes", String(result.silentNodes)], ["Simultaneous drivers", String(result.simultaneousDrivers)], ["Combined termination", result.busTerminationOhm.toFixed(1) + " Ω"]);
  } else if (result.kind === "can-node-pair") {
    metrics.push(["CAN identifier", result.identifier], ["Data bytes", result.dataBytes.join(" ")], ["Bit rate", (result.bitrate / 1000).toFixed(0) + " kbit/s"], ["Frame received", result.received ? "Yes" : "No"], ["ACK", result.acknowledged ? "Yes" : "No"], ["Combined termination", result.busTerminationOhm.toFixed(1) + " Ω"]);
  } else if (result.kind === "mcu-watchdog") {
    metrics.push(["Watchdog timeout", result.timeoutMs + " ms"], ["Run duration", result.runDurationMs + " ms"], ["Accepted service calls", String(result.servicesAccepted)], ["Watchdog resets", String(result.resetCount)], ["Reset time", result.resetAtMs === null ? "Not triggered" : result.resetAtMs + " ms"], ["Controller state", result.controllerState], ["Heartbeat output", result.heartbeatHigh ? "HIGH" : "LOW"]);
  } else if (result.kind === "stm32-timer-pwm") {
    const frequencyText = result.frequencyHz >= 1000 ? (result.frequencyHz / 1000).toFixed(2) + " kHz" : result.frequencyHz.toFixed(2) + " Hz";
    metrics.push(["PWM frequency", frequencyText], ["Duty cycle", (result.dutyCycle * 100).toFixed(1) + " %"], ["LED current while on", (result.peakLedCurrentA * 1000).toFixed(2) + " mA"], ["Estimated average LED current", (result.averageLedCurrentA * 1000).toFixed(2) + " mA"]);
    const duty = Math.max(0, Math.min(1, result.dutyCycle));
    const pulse = 106 * duty;
    let path = "M 24 84";
    for (let cycle = 0; cycle < 4; cycle += 1) {
      const x = 24 + cycle * 112;
      path += " M " + x + " 84 V 24 H " + (x + pulse) + " V 84";
    }
    waveform = `<figure class="result-waveform"><figcaption>Ideal PWM output · ${escape(frequencyText)} · ${(duty * 100).toFixed(1)}% duty</figcaption><svg viewBox="0 0 480 108" role="img" aria-label="Ideal PWM output waveform"><path class="wave-axis" d="M20 84 H468 M24 18 V88"></path><path class="wave-trace" d="${path}"></path><text x="24" y="103">0</text><text x="414" y="103">Time (ms)</text></svg></figure>`;
  } else {
    for (const [key, value] of Object.entries(result)) {
      if (key === "kind" || key === "firmwareExecuted" || value === null || typeof value === "object") continue;
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
      const display = typeof value === "number" ? (Math.abs(value) >= 1000 ? value.toLocaleString() : Number(value.toPrecision(5))).toString() : String(value);
      metrics.push([label, display]);
      if (metrics.length >= 8) break;
    }
  }
  const cards = metrics.map(([label, value]) => `<article class="result-metric"><span>${escape(label)}</span><strong>${escape(value)}</strong></article>`).join("");
  return `<div class="result-dashboard-heading"><strong><span class="result-status-dot"></span>Simulation completed</strong><small>${escape(analysis.engine)}</small></div><div class="result-dashboard-body"><div class="result-metric-grid">${cards}</div>${waveform}</div><p class="result-limit">${escape(analysis.message)}</p>`;
}
function renderOutput(validation = state.lastValidation ?? validateProject(state.project)) {
  const isLog = state.activeOutput === "output";
  const showDashboard = isLog && state.lastAnalysis?.state === "complete";
  const issues = state.activeOutput === "errors" ? validation.errors : validation.warnings;
  $(".output-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.output === state.activeOutput));
  const dashboard = $("#result-dashboard");
  dashboard.classList.toggle("hidden", !showDashboard);
  $("#export-simulation-report").disabled = state.lastAnalysis?.state !== "complete";
  dashboard.innerHTML = showDashboard ? renderResultDashboard(state.lastAnalysis) : "";
  $("#workspace-notes").textContent = state.lastAnalysis?.message ?? "Choose a supported example to see its tested model limits.";
  $("#output-log").classList.toggle("hidden", !isLog || showDashboard);
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
  $("#bot-repair-apply").hidden = !state.project.botRepairPreview;
  $("#bot-proposal-apply").hidden = !state.project.botCircuitProposal;
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
  if(state.project.releaseCandidateE2E){
    validateAndReport();
    state.lastAnalysis={state:"running",engine:"Release-candidate end-to-end suite",message:"Loading checked-in acceptance fixtures.",result:null};
    renderOutput();
    runReleaseCandidateE2E(state.project).then(result=>{
      state.lastAnalysis=result;
      if(result.state==="complete")log("[E2E] All release-candidate gates passed.");
      else log("[E2E] "+(result.errors?.[0]?.message??result.message));
      renderOutput();
    }).catch(error=>{
      state.lastAnalysis={state:"blocked",engine:"Release-candidate end-to-end suite",message:error instanceof Error?error.message:"The workflow failed.",errors:[],warnings:[],result:null};
      renderOutput();
    });
    return;
  }
  validateAndReport();
  const result = state.project.offlineRecoveryScenario ? runOfflineRecoveryScenario(state.project) : state.project.localeUiSweep ? runFourLanguageUiSweep(state.project) : state.project.botCircuitProposal ? runBotCircuitProposal(state.project) : state.project.botRepairPreview ? runBotFloatingNodeRepair(state.project) : state.project.botExplainComponent ? runBotComponentExplainer(state.project) : state.project.bomExportPlaceholder ? runBomExportPlaceholder(state.project) : state.project.pcbTraceWidthAdvisor ? runPcbTraceWidthAdvisor(state.project) : state.project.opAmpGainCalculator ? runOpAmpGainCalculator(state.project) : state.project.rcTimingCalculator ? runRcTimingCalculator(state.project) : state.project.voltageDividerCalculator ? runVoltageDividerCalculator(state.project) : state.project.ledResistorCalculator ? runLedResistorCalculator(state.project) : state.project.resistorColorCodeReader ? runResistorColorCodeReader(state.project) : state.project.unitConversionCalculator ? runUnitConversionCalculator(state.project) : state.project.substitutionPreview ? runPinIncompatibleSubstitution(state.project) : state.project.missingFootprintWorkflow ? runMissingFootprintWorkflow(state.project) : state.project.unsupportedBreadboardPackage ? runUnsupportedBreadboardPackage(state.project) : state.project.threeViewLedHistory ? runThreeViewLedHistory(state.project) : state.project.schematicPcbSync ? runSchematicPcbSync(state.project) : state.project.breadboardSchematicSync ? runBreadboardSchematicSync(state.project) : state.project.machineFaultAnnunciator ? runMachineFaultAnnunciator(state.project) : state.project.warehouseBeacon ? runWarehouseBeacon(state.project) : state.project.accessStrikeLock ? runAccessStrikeLock(state.project) : state.project.fireAlarmZone ? runFireAlarmZone(state.project) : state.project.elevatorCallQueue ? runElevatorCallQueue(state.project) : state.project.garageDoorConcept ? runGarageDoorConcept(state.project) : state.project.smartIrrigation ? runSmartIrrigation(state.project) : state.project.automaticNightLight ? runAutomaticNightLight(state.project) : state.project.pwmFanController ? runPwmFanController(state.project) : state.project.fanThermostat ? runFanThermostat(state.project) : state.project.waterLeakAlarm ? runWaterLeakAlarm(state.project) : state.project.temperatureAlarm ? runTemperatureAlarm(state.project) : state.project.doorInterlock ? runDoorInterlockConcept(state.project) : state.project.emergencyStopConcept ? runEmergencyStopConcept(state.project) : state.project.forwardReverseMotor ? runForwardReverseInterlock(state.project) : state.project.starDeltaStarter ? runStarDeltaStarter(state.project) : state.project.conveyorCounter ? runConveyorCounter(state.project) : state.project.tankLevelController ? runTankLevelController(state.project) : state.project.trafficLight ? runTrafficLightSequence(state.project) : state.project.plcMotorSequence ? runPlcStartStopSequence(state.project) : state.project.crossProbe ? runNetCrossProbe(state.project) : state.project.modelAvailabilityFixture ? reportUnavailableModel(state.project) : state.project.missingGroundFixture ? diagnoseMissingGround(state.project) : state.project.shortCircuitFixture ? diagnoseSupplyShort(state.project) : state.project.floatingNodeDiagnosis ? diagnoseFloatingNode(state.project) : state.project.convergenceStudy ? analyzeConvergenceStudy(state.project) : state.project.thermalBoundary ? analyzeThermalWarningBoundary(state.project) : state.project.monteCarloTolerance ? runMonteCarloTolerance(state.project) : state.project.parameterSweep ? runParameterSweep(state.project) : state.project.instrument?.type === "dc-voltmeter" ? analyzeDcVoltmeter(state.project) : state.project.instrument?.type === "dc-ammeter" ? analyzeDcAmmeter(state.project) : state.project.phaseScope ? measureTwoChannelPhase(state.project) : state.project.logicCapture ? captureLogicAnalyzer(state.project) : state.project.bodeAnalysis ? analyzeRcBode(state.project) : state.project.rlcTransient ? analyzeRlcStep(state.project) : state.project.frequencyCounter ? measureFrequency(state.project) : state.project.oscilloscope ? captureTriggeredPulse(state.project) : runSupportedAnalysis(state.project);
  state.lastAnalysis = result;
  if (result.state === "complete") {
    const { kind } = result.result;
    log(`[ANALYSIS] ${result.engine}`);
    if(kind==="schematic-pcb-netlist-pad-sync")log(`[SCHEMATIC → PCB] ${result.result.componentCount} components, ${result.result.netCount} nets, ${result.result.mappedPinCount} mapped pins; all endpoints preserved. Pad map: ${result.result.mappingStatus}.`);
    if(kind==="breadboard-schematic-structural-sync")log(`[VIEW SYNC] ${result.result.componentCount} component(s), ${result.result.netCount} net(s); ${result.result.sourceView} and ${result.result.targetView} structures ${result.result.structurallyEqual?"match":"differ"}.`);
    if(kind==="machine-fault-latched-sequence")log(`[FAULT PANEL CONCEPT] ${result.result.frameCount} input steps; final latched faults: ${result.result.frames.at(-1).latchedFaults.join(", ")||"none"}.`);
    if(kind==="warehouse-beacon-state-sequence")log(`[WAREHOUSE BEACON] ${result.result.sampleCount} states, ${result.result.transitionCount} transitions; exclusive status indication: ${result.result.oneStatusPerFrame}.`);
    if(kind==="access-strike-allowlist-sequence")log(`[ACCESS MOCK] ${result.result.grantCount} grant(s), ${result.result.denyCount} denial(s); ${result.result.mockAuditEvents.length} mock audit event(s).`);
    if(kind==="fire-alarm-zone-sequence")log(`[FIRE ZONE CONCEPT] ${result.result.alarmSamples} alarm sample(s); ${result.result.openFaults} open and ${result.result.shortFaults} short faults distinguished.`);
    if(kind==="elevator-fifo-call-queue")log(`[ELEVATOR QUEUE CONCEPT] ${result.result.eventCount} events; queued targets ${result.result.dispatchedTargets.join(", ")||"none"}; duplicate calls coalesced: ${result.result.duplicateCallsIgnored}.`);
    if(kind==="garage-door-limit-sequence")log(`[GARAGE DOOR CONCEPT] ${result.result.conflictingRequestsRejected} conflict request(s) rejected; drive overlap: ${result.result.noDriveOverlap?"none":"detected"}.`);
    if(kind==="smart-irrigation-decision-sequence")log(`[IRRIGATION CONCEPT] ${result.result.wateringSamples}/${result.result.sampleCount} samples water; ${result.result.sensorFaults} sensor fault(s), all fail off: ${result.result.faultsFailOff}.`);
    if(kind==="night-light-lux-threshold")log(`[NIGHT LIGHT] ${result.result.thresholdLux} lux threshold; LED on ${result.result.ledOnSamples}/${result.result.sampleCount} samples.`);
    if(kind==="pwm-fan-duty-curve")log(`[PWM FAN] ${result.result.knotCount} temperature/duty knots; ${result.result.sampleCount} samples mapped.`);
    if(kind==="fan-thermostat-hysteresis")log(`[FAN THERMOSTAT] ON at ${result.result.fanOnC} °C, OFF at ${result.result.fanOffC} °C; fan on ${result.result.fanOnSamples}/${result.result.sampleCount} samples.`);
    if(kind==="water-leak-alarm-sequence")log(`[LEAK ALARM CONCEPT] ${result.result.alarmEpisodes} wet episode(s); dry recovery observed: ${result.result.dryRecoveryObserved}.`);
    if(kind==="latched-temperature-alarm")log(`[TEMPERATURE ALARM] Threshold ${result.result.thresholdC} °C; ${result.result.tripCount} trip(s); reset while hot rejected: ${result.result.resetRejected}.`);
    if(kind==="door-interlock-sequence")log(`[GUARD LOGIC CONCEPT] Load stayed disabled while open: ${result.result.loadAlwaysDisabledWhenOpen}; open-guard reset rejected: ${result.result.resetRejectedWhenOpen}.`);
    if(kind==="emergency-stop-latched-sequence")log(`[E-STOP LOGIC CONCEPT] ${result.result.unsafeResetRejected?"unsafe reset rejected":"no rejected reset"}; load restart requires separate start: ${result.result.restartRequiresNewStart}.`);
    if(kind==="forward-reverse-interlock-sequence")log(`[DIRECTION PLC CONCEPT] ${result.result.conflictRequestsRejected} opposite-direction request(s) rejected; overlap: ${result.result.noOverlap?"none":"detected"}.`);
    if(kind==="star-delta-transition-sequence")log(`[STAR-DELTA CONCEPT] ${result.result.frameCount} transition samples; star/delta overlap: ${result.result.noOverlap?"none":"detected"}.`);
    if(kind==="conveyor-edge-counter")log(`[CONVEYOR PLC CONCEPT] Count ${result.result.finalCount}/${result.result.targetCount}; logical motor ${result.result.motorStopped?"stopped":"running"} at event ${result.result.stoppedAtEvent??"not reached"}.`);
    if(kind==="tank-level-hysteresis")log(`[TANK PLC CONCEPT] ${result.result.sampleCount} synthetic level samples; pump on ${result.result.pumpOnSamples} sample(s), thresholds ${result.result.lowLevelPct}%/${result.result.highLevelPct}%.`);
    if(kind==="traffic-light-fsm-sequence")log(`[TRAFFIC FSM] ${result.result.cycleCount} cycle(s), ${result.result.totalDurationS} s, ${result.result.opposingGreenConflict?"CONFLICT":"no opposing green conflict"}.`);
    if(kind==="plc-start-stop-sequence")log(`[PLC CONCEPT] ${result.result.sampleCount} control steps; seal-in retained: ${result.result.sealInRetained}; e-stop dropped output: ${result.result.emergencyStopDropsOutput}.`);
    if(kind==="net-cross-probe")log(`[CROSS-PROBE] Selected net ${result.result.netId} across ${result.result.views.join(", ")} using the shared project net ID.`);
    if(kind==="dc-voltmeter")log(`[METER] ${result.result.measuredVoltageV.toFixed(4)} ${result.result.unit} from ${result.result.positiveLeadNet} to ${result.result.negativeLeadNet} (${result.result.polarity} polarity).`);
    if(kind==="dc-ammeter")log(`[METER] ${(result.result.displayMilliAmps).toFixed(4)} mA (${result.result.polarity} polarity; burden ${result.result.burdenVoltageV.toFixed(4)} V).`);
    if(kind==="oscilloscope-trigger")log(`[SCOPE] ${result.result.triggerEdge} edge locked at ${result.result.triggerLevelV.toFixed(3)} V; trigger time ${result.result.triggerTimeMs.toFixed(3)} ms; ${result.result.sampleCount} samples.`);
    if(kind==="two-channel-phase")log(`[SCOPE] Channel B phase offset ${result.result.phaseOffsetDeg.toFixed(2)} ${result.result.unit} at ${result.result.frequencyHz.toFixed(2)} Hz.`);
    if(kind==="logic-analyzer-capture")log(`[LOGIC] Trigger locked on ${result.result.triggerChannel} ${result.result.triggerEdge} edge at sample ${result.result.triggerSampleIndex}; channels ${result.result.channelLabels}.`);
    if(kind==="frequency-counter")log(`[COUNTER] ${result.result.measuredFrequencyHz.toFixed(6)} ${result.result.unit}; period ${result.result.measuredPeriodMs.toFixed(6)} ms over ${result.result.cyclesMeasured} cycles.`);
    if(kind==="rc-bode-plot")log(`[BODE] Cutoff ${result.result.cutoffHz.toFixed(3)} Hz; at cutoff ${result.result.cutoffMagnitudeDb.toFixed(3)} dB and ${result.result.cutoffPhaseDeg.toFixed(2)} deg.`);
    if(kind==="rlc-step-response"){log(`[TRANSIENT] ${result.result.regime} RLC response; peak ${result.result.peakVoltageV.toFixed(3)} V; ${result.warnings.length} timestep warning(s).`);for(const warning of result.warnings??[])log(`[WARNING] ${warning.code}: ${warning.message}`);}
    if(kind==="parameter-sweep"){log(`[SWEEP] ${result.result.sampleCount} resistance points for ${result.result.parameterReference}; current falls from ${(result.result.points[0].currentA*1000).toFixed(3)} mA to ${(result.result.points.at(-1).currentA*1000).toFixed(3)} mA.`);for(const warning of result.warnings??[])log(`[WARNING] ${warning.code}: ${warning.message}`);}
    if(kind==="monte-carlo-tolerance"){log(`[MONTE CARLO] ${result.result.sampleCount} seeded trials; mean ${(result.result.mean*1000).toFixed(3)} mA, range ${(result.result.minimum*1000).toFixed(3)}–${(result.result.maximum*1000).toFixed(3)} mA.`);for(const warning of result.warnings??[])log(`[WARNING] ${warning.code}: ${warning.message}`);}
    if(kind==="thermal-warning-boundary"){log(`[THERMAL ADVISORY] ${result.result.reference} electrical dissipation ${(result.result.resistorDissipationW*1000).toFixed(1)} mW; derated entered limit ${(result.result.deratedLimitW*1000).toFixed(1)} mW.`);for(const warning of result.warnings??[])log(`[WARNING] ${warning.code}: ${warning.message}`);}
    if (kind === "led-current-limiter") {
      const { sourceVoltage, resistance, ledVf, currentA, resistorPowerW, ledOn } = result.result;
      log(`[RESULT] Vsource=${sourceVoltage.toFixed(3)} V, Vf=${ledVf.toFixed(3)} V, R=${resistance.toFixed(3)} Ω`);
      log(`[RESULT] I=${(currentA * 1000).toFixed(3)} mA, Presistor=${(resistorPowerW * 1000).toFixed(3)} mW, LED ${ledOn ? "conducting" : "off"}.`);
    } else if (kind === "net-cross-probe") {
      log(`[CROSS-PROBE] ${result.result.endpointCount} endpoint(s) on ${result.result.netId}; selection synchronized in all three views.`);
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
  } else { log(`[${result.state.toUpperCase()}] ${result.message ?? result.errors?.[0]?.message ?? "Analysis is unavailable."}`); for(const error of result.errors??[])log(`[DIAGNOSTIC] ${error.code}: ${error.message}`); if(result.diagnostics?.ruleId)log(`[RULE] ${result.diagnostics.ruleId}`); if(result.diagnostics?.status==="unavailable")log(`[COMPONENT STATUS] ${result.diagnostics.componentReference}: unavailable · schematic only · simulation not attempted.`); for(const action of result.diagnostics?.actions??result.diagnostics?.suggestions??[])log(`[SUGGESTION] ${action}`); }
  if(result.diagnostics?.jumpTarget){state.selectedInstanceId=result.diagnostics.jumpTarget.instanceId??state.selectedInstanceId;state.selectedNetId=result.diagnostics.jumpTarget.netId;state.activeView="schematic";render();}
  renderOutput();
}

async function verifyRunLockfile() {
  const path=state.project.reproducibilityLockFile;
  if(!path){showDialog("Run lock unavailable","This project does not reference a run lockfile.");return;}
  try{const response=await fetch(path,{headers:{Accept:"application/json"}});if(!response.ok)throw new Error(`The run lock request returned ${response.status}.`);const lock=JSON.parse(await response.text());const report=verifySimulationLockfile(state.project,lock);if(report.matched){log(`[LOCK] Verified ${lock.modelSelection.modelVersion} with the locked component library and values.`);showDialog("Run lock verified",`${lock.modelSelection.modelVersion} matches the checked-in component, setting, and model lock.`);}else{const message=report.errors[0]?.message??"The run lock did not match.";log(`[LOCK] Mismatch: ${message}`);showDialog("Run lock mismatch",message);}}catch(error){showDialog("Run lock unavailable",error instanceof Error?error.message:"The lockfile could not be checked.");}
}

function exportSimulationReport() {
  if(state.lastAnalysis?.state!=="complete"){showDialog("Report unavailable","Run a supported analysis successfully before exporting its report.");return;}
  const report=createSimulationReport(state.project,state.lastAnalysis);
  const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download=`${state.project.metadata.name.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"adigun-simulation"}-report.json`;link.click();URL.revokeObjectURL(url);
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
  if (action === "help") showDialog("Implementation status", "The workspace has a generic starter library, local project storage, four interface locales, 199 released and tested catalogue examples, bounded analytical models, and a single-sided PCB export preview for projects that include fabrication data. Its checks do not replace manufacturer validation; the application is not a general SPICE engine.");
}

document.addEventListener("click", (event) => {
  state.userInteracted = true;
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
  if (event.key === "Escape" && (state.breadboardPlacementMode || state.schematicWireMode)) {
    event.preventDefault();
    state.breadboardPlacementMode = false;
    state.schematicWireMode = false;
    state.schematicWireStart = null;
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
  if (pcbFootprintTarget && state.activeView === "pcb" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
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
      $("#design-canvas [data-pcb-footprint=\"${CSS.escape(instanceId)}\"]")?.focus();
      log(`[PCB] ${instanceId} nudged by ${step} mm.`);
    } else if (result.status === "blocked") {
      showDialog(t("pcbMenu"), result.code === "OUT_OF_BOUNDS" ? t("pcbMoveOutOfBounds") : t("pcbMoveNoFootprint"));
    } else {
      render();
      $("#design-canvas [data-pcb-footprint=\"${CSS.escape(instanceId)}\"]")?.focus();
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
        const message = result.code === "OUT_OF_BOUNDS" ? t("pcbMoveOutOfBounds") : t("pcbMoveNoFootprint");
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
$("#run-simulation").addEventListener("click", runAnalysis);
$("#run-validation").addEventListener("click", validateAndReport);
$("#export-simulation-report").addEventListener("click", exportSimulationReport);
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
    state.lastAnalysis = analysis;
    state.selectedInstanceId = project.components.find((item) => item.libraryId === "passive.resistor")?.instanceId ?? project.components[0]?.instanceId ?? null;
    render();
    log(`[EXAMPLE] Loaded and validated ${project.metadata.name}.`);
  } catch (error) {
    showDialog("Example unavailable", error instanceof Error ? error.message : "The selected example could not be loaded.");
  }
});
$("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("light"));
$("#help-button").addEventListener("click", () => showDialog("Implementation status", "The workspace has a generic starter library, local project storage, four interface locales, 199 released and tested catalogue examples, and bounded analytical models. PCB view is a placement preview without routing or DRC; the application is not a general SPICE engine."));
$("#dialog-close").addEventListener("click", () => $("#status-dialog").close());
$("#bot-collapse").addEventListener("click", () => $("#bot").classList.toggle("minimized"));
$("#bot-form").addEventListener("submit", (event) => { event.preventDefault(); answerBotFromSelection(); });
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
    .then((documentText) => {
      if (state.userInteracted || state.dirty || localStorage.getItem(STORAGE_KEY) || state.project.id !== initialProject.project.id) return;
      const project = parseProject(documentText);
      const analysis = runSupportedAnalysis(project);
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

