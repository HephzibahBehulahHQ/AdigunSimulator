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
  lastValidation: null
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
  const canvasArea = document.querySelector(".canvas-area");
  canvasArea.classList.toggle("has-overview", state.activeView === "breadboard");
  document.querySelectorAll("[data-mini-view]").forEach((panel) => { panel.hidden = panel.dataset.miniView !== "schematic" || state.activeView !== "breadboard"; });
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
  $("#component-form").classList.toggle("hidden", state.activeInspector === "project");
  $("#project-form").classList.toggle("hidden", state.activeInspector !== "project");
  $("#simulation-form").classList.remove("hidden");
  $("#workspace-notes").textContent = state.lastAnalysis?.message ?? "Choose a supported example to see its tested model limits.";
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

function renderResultDashboard(analysis) {
  if (!analysis || analysis.state !== "complete") return "";
  const result = analysis.result ?? {};
  const metrics = [];
  let waveform = "";
  if (result.kind === "eeprom-ring-logger") {
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
  state.lastAnalysis = result;
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
  renderOutput();
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
  if (action === "run-simulation") runAnalysis();
  if (action === "help") showDialog("Implementation status", "The workspace has a generic starter library, local project storage, four interface locales, 98 released and tested catalogue examples, and bounded analytical models. PCB view is a placement preview without routing or DRC; the application is not a general SPICE engine.");
}

document.addEventListener("click", (event) => {
  state.userInteracted = true;
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action) handleAction(action);
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
    state.lastAnalysis = analysis;
    state.selectedInstanceId = project.components.find((item) => item.libraryId === "passive.resistor")?.instanceId ?? project.components[0]?.instanceId ?? null;
    render();
    log(`[EXAMPLE] Loaded and validated ${project.metadata.name}.`);
  } catch (error) {
    showDialog("Example unavailable", error instanceof Error ? error.message : "The selected example could not be loaded.");
  }
});
$("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("light"));
$("#help-button").addEventListener("click", () => showDialog("Implementation status", "The workspace has a generic starter library, local project storage, four interface locales, 98 released and tested catalogue examples, and bounded analytical models. PCB view is a placement preview without routing or DRC; the application is not a general SPICE engine."));
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

