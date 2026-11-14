import { parseExampleProject, canLoadExampleAnalysis } from './js/example-loading.mjs';
import { isGlobalSearchShortcut, searchGlobalActions } from "./js/global-search.mjs";
import { createExampleBrowser } from './js/example-bank-ui.mjs';
import { createDesignTools } from "./js/design-tools-ui.mjs";
import { recordScopeAnalysis } from "./js/scope-launcher.mjs";
import { createCanvasExperience } from './js/canvas-experience.mjs';
import { ladderSettings, ladderUiText, ladderValueLabel } from './js/ladder-components.mjs';
import { wirePaint } from "./js/project-appearance.mjs";
import { createSchematicWireUi } from "./js/schematic-wire-ui.mjs";
import { createCrossingPainter } from "./js/wire-crossings.mjs";
import { STARTER_LIBRARY, addComponent, connectPins, createEmptyProject, disconnectPin, findLibraryPart, getViewReconciliationIssues, moveComponent, removeComponent, parseProject, serializeProject, updateComponent, validateProject } from "./js/core.mjs";
import { TRANSLATIONS, translate } from "./js/i18n.mjs";
import { createAccountClient, createAccountSession } from "./js/account-auth.mjs";
import { createAccountUi } from "./js/account-ui.mjs";
import { createCloudProjectStore } from "./js/cloud-projects.mjs";
import { createCloudProjectsUi } from "./js/cloud-projects-ui.mjs";
import { BREADBOARD_MODEL, breadboardHoleIds, breadboardHolePoint, breadboardPackagePlacement, deriveBreadboardSchematicNets, normalizeBreadboardHole, validateBreadboardTopology } from "./js/breadboard-topology.mjs";
import { renderNucleoG031K8Breadboard } from "./js/nucleo-g031k8.mjs";
import { schematicPinPoint, schematicSymbolSize, schematicGeometry } from "./js/schematic-pin-layout.mjs";
import { editComponentField, editCustomProperties } from "./js/component-edit.mjs";
import { createComponentPropertiesUi } from "./js/component-properties-ui.mjs";
import { netEdges, removeNetEdge, pruneSchematicWires } from "./js/net-edges.mjs";
import { routeSchematicConnection, schematicRoutePath } from "./js/schematic-routing.mjs";
import { startComponentPlacement, rotateComponentPlacement, positionComponentPlacement, placementComponent, placementOverlaps, firstFreeComponentPlacement, commitComponentPlacement, placementText } from "./js/component-placement.mjs";
import { attachDrawMenu, drawMenuMarkup, editorMenuText, transformSchematicComponent, printProjectView } from "./js/editor-menu-tools.mjs";
import { attachMenuDismissal, dismissMenuCommand } from "./js/menu-dismissal.mjs";
import { renderSchematicSymbol } from "./js/schematic-symbols.mjs";
import { junctionRouteSegments } from "./js/schematic-junction-graph.mjs";
import { wireEdgeKey, voltageColor, currentMotion } from "./js/dc-wire-feedback.mjs";
import { createLiveDcFeedback } from "./js/live-dc-feedback.mjs";
import { renderPcbPreviewSvg, getPcbPreviewScale, pcbPreviewPointToBoardMm } from "./js/pcb-preview.mjs";
import { pcbCopperPads } from "./js/pcb-vias.mjs";
import { createPcbNetClassEditor } from "./js/pcb-net-class-controller.mjs";
import { createPcbBoardEditor } from "./js/pcb-board-controller.mjs";
import { createPcbViaEditor } from "./js/pcb-via-controller.mjs";
import { movePcbFootprint } from "./js/pcb-edit.mjs";
import { rotatePcbFootprint } from "./js/pcb-rotate.mjs";
import { createPcbRoute } from "./js/pcb-routing.mjs";
import { CANVAS_ZOOM, createCanvasCamera, zoomCanvasCamera, canvasClientPoint, canvasClientDelta } from "./js/canvas-camera.mjs";
import { PROJECT_STORAGE_KEY, createProjectSession, confirmProjectReplacement } from "./js/project-session.mjs";
import { createRecentProjectStore } from "./js/recent-projects.mjs";
import { exportPcbFabrication, validatePcbFabrication } from "./js/pcb-export.mjs";
import { createManufacturingExportPack } from "./js/manufacturing-export-pack.mjs";

















import { validateComponentProperty } from "./js/component-property-audit.mjs";
import { createSimulationReport } from "./js/simulation-report.mjs";
import { verifySimulationLockfile } from "./js/simulation-lockfile.mjs";























import { projectComponentsForView, unresolvedComponentsForDisplay } from "./js/view-projection.mjs";









import { exportBomCsv, runBomExportPlaceholder } from "./js/bom-report.mjs";
import { exportSpiceNetlist } from "./js/spice-netlist.mjs";
import { explainComponent } from "./js/bot-component-explainer.mjs";
import { formatBotAuditEvent } from "./js/bot-audit-log.mjs";
import { applyBotFloatingNodeRepairPreview, runBotFloatingNodeRepair } from "./js/bot-floating-node-repair.mjs";
import { applyBotCircuitProposal, runBotCircuitProposal } from "./js/bot-circuit-proposal.mjs";
import { analyzeBotCanvas, applyBotSuggestionPreview, buildBotSuggestionPreview, createBotLiveCopilot, explainComponentWiring } from "./js/bot-live-copilot.mjs";


import { runReleaseCandidateE2E } from "./js/release-candidate-e2e.mjs";
import { createSimulationWorkerRun } from "./js/simulation-worker-client.mjs";
import { getManufacturerPartEvidenceSummary, searchManufacturerParts } from "./js/part-catalogue.mjs";
import { answerBotProductQuestion, getBotQuestionClarification, isBotProjectGoalStatement } from "./js/bot-product-help.mjs";

const yearLabel = document.querySelector("#copyright-year");
if (yearLabel) yearLabel.textContent = String(new Date().getFullYear());

const STORAGE_KEY = PROJECT_STORAGE_KEY;
const recentProjects = createRecentProjectStore();

const state = {
  project: createEmptyProject(),
  currentProjectId: null,
  savedDisposition: "empty",
  lastAnalysis: null,
  lastAnalysisProjectKey: null,
  feedbackConfig: null,
  selectedLibraryId: null,
  selectedEvidencePartId: null,
  libraryMode: "starter",
  activeCategory: "All",
  selectedInstanceId: null,
  activeView: "breadboard",
  activeInspector: "component",
  leftBarOpen: true,
  rightBarOpen: true,
  openMenuKey: null,
  activeOutput: "output",
  selectedNetId: null,
  selectedWire: null,
  placement: null,
  wireCursor: null,
  activeTool: "select",
  pan: { x: 0, y: 0 },
  drag: null,
  scale: 1,
  history: [],
  future: [],
  dirty: false,
  botUnsavedOnly: false,
  lastValidation: null,
  breadboardSyncPreview: null,
  breadboardPlacementMode: false,
  schematicWireMode: false,
  schematicWireStart: null,
  pcbRouteDraft: null,
  pcbSelectedViaId: null,
  pcbViaDraft: null,
  pcbRouteHintKey: null,
  activeSimulation: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const t = (key) => translate(state.project.metadata.locale, key);
const pcbViaEditor = createPcbViaEditor({ state, $, $$, t, escape, renderCanvas, render, activateView, captureHistory, validateAndReport, showDialog, log });
const pcbBoardEditor = createPcbBoardEditor({ state, $, $$, t, captureHistory, render, activateView, log });
const pcbNetClassEditor = createPcbNetClassEditor({ state, $, $$, t, escape, captureHistory, render, activateView, log });
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
  const messageKeys = { "missing-gate-input": "botMissingInputMessage", "unobserved-gate-output": "botOutputMessage", "goal-question": "botGoalQuestionMessage", "unwired-component": "botUnwiredMessage", "missing-gate-rails": "botRailsMessage", "missing-supply-pins": "botRailsMessage", "driver-conflict": "botConflictMessage" };
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

function recordBotAuditEvent(event) {
  const message = formatBotAuditEvent(event);
  if (message) log(message);
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
  const finding = currentBotFinding;
  const preview = buildBotSuggestionPreview(state.project, finding);
  if (!preview.ok) { $("#bot-response").textContent = preview.error; recordBotAuditEvent({ type: "preview-blocked", findingId: finding.id, action: finding.action }); return; }
  currentBotPreview = preview;
  $("#bot-preview-summary").textContent = `${preview.summary} Nothing is saved automatically.`;
  $("#bot-suggestion-preview").hidden = false;
  recordBotAuditEvent({ type: "preview-prepared", findingId: finding.id, action: finding.action });
}

function applyBotSuggestion() {
  if (!currentBotPreview) return;
  const preview = currentBotPreview;
  const action = currentBotFinding?.action ?? "reviewed-action";
  const outcome = applyBotSuggestionPreview(state.project, preview, { confirmed: true });
  if (!outcome.ok) { $("#bot-response").textContent = outcome.message; $("#bot-suggestion-preview").hidden = true; currentBotPreview = null; recordBotAuditEvent({ type: "preview-apply-blocked", findingId: preview.findingId, action }); return; }
  captureHistory();
  state.botUnsavedOnly = true;
  state.dirty = true;
  replaceProject(outcome.project);
  renderBotFinding(null);
  $("#bot-response").textContent = `${outcome.message} Use Undo to roll back this accepted change; save manually when ready.`;
  recordBotAuditEvent({ type: "preview-applied", findingId: preview.findingId, action });
}

const dcFeedback = createLiveDcFeedback({
  run: project => createSimulationWorkerRun(state.feedbackConfig?projectWithSelectedAnalysis(project,state.feedbackConfig.key,state.feedbackConfig.value):project),
  onResult: result => { recordScopeAnalysis(state,result,()=>designTools.paint()); renderOutput(); },
  onPaint: event => { if(event?.frameOnly)paintSimulationFrame();else {renderCanvas();wireUi.paintMeasurements();} renderFeedbackControls(); }
});
const FEEDBACK_MOTION_TEXT={en:["Device preference","Animate","Reduce motion"],de:["Geräteeinstellung","Animieren","Bewegung reduzieren"],yo:["Ètò ẹ̀rọ","Ṣe àwòrán ìṣàn","Dín ìṣípò kù"],pcm:["Device setting","Show movement","Reduce movement"]};
const FEEDBACK_TEXT = {
  en:["Canvas feedback","Current animation","Conventional current","Electron direction","Run a supported DC circuit to show calculated flow.","Updating calculated DC values…","DC flow · positive green, negative red, ground gray · speed is visual","Flow unavailable for this model or unresolved circuit."],
  de:["Rückmeldung im Zeichenbereich","Stromanimation","Technische Stromrichtung","Elektronenrichtung","Unterstützte DC-Schaltung für den Stromfluss berechnen.","DC-Messwerte werden aktualisiert…","DC-Fluss · positiv grün, negativ rot, Masse grau · visuelle Geschwindigkeit","Für dieses Modell oder die ungelöste Schaltung nicht verfügbar."],
  yo:["Àbájáde lórí kánfásì","Àwòrán ìṣàn","Ìtọ́sọ́nà ìṣàn àṣà","Ìtọ́sọ́nà ẹlẹ́ktrọ́nì","Ṣiṣirò àyíká DC tí a ṣe àtìlẹ́yìn fún láti rí ìṣàn.","A ń tún iye DC ṣe…","Ìṣàn DC · rere aláwọ̀ ewé, òdì pupa, ilẹ̀ grẹ́yì · ìyára àwòrán","Ìṣàn kò sí fún àwòṣe tàbí àyíká tí a kò tíì yanjú."],
  pcm:["Canvas feedback","Current movement","Normal current direction","Electron direction","Run supported DC circuit make calculated flow show.","DC values dey update…","DC flow · positive green, negative red, ground gray · speed na picture","Flow no dey for this model or circuit wey never solve."]
};
function renderFeedbackControls(){
  const words=FEEDBACK_TEXT[state.project.metadata.locale]??FEEDBACK_TEXT.en, live=dcFeedback.read();
  ["feedback-live-label","feedback-motion-label","feedback-conventional","feedback-electron"].forEach((id,i)=>{document.getElementById(id).textContent=words[i];});
  $("#feedback-status").hidden=!$("#feedback-live").checked;
  $("#feedback-status").textContent=words[live.status==="updating"?5:live.status==="ready"?6:live.status==="idle"?4:7];
  const motionWords=FEEDBACK_MOTION_TEXT[state.project.metadata.locale]??FEEDBACK_MOTION_TEXT.en;
  [...$("#feedback-motion").options].forEach((option,i)=>{option.textContent=motionWords[i];});
  $("#feedback-direction").setAttribute("aria-label",words[2]+" / "+words[3]);
  $("#stop-simulation").disabled=!state.activeSimulation&&!live.active;
  renderSimulationHud();
}
const SIM_HUD_TEXT={
  en:["Pause","Stop","Step","Reset","Running","Paused","Stopped","Idle","Complete","Calculated transient playback","DC steady state","Run a linear transient calculation to step through samples."],
  de:["Pause","Stopp","Schritt","Zurücksetzen","Läuft","Pausiert","Gestoppt","Bereit","Abgeschlossen","Berechneter Transientenverlauf","DC-Arbeitspunkt","Zuerst eine lineare Transientenberechnung für Einzelschritte ausführen."],
  yo:["Dá dúró díẹ̀","Dá dúró","Ìgbésẹ̀","Tún bẹ̀rẹ̀","Ń ṣiṣẹ́","Dúró díẹ̀","Ti dá dúró","Ṣetán","Parí","Àfihàn àbájáde ìṣirò àkókò","Ipò DC tó dúró","Ṣe ìṣirò àkókò kí o tó tẹ̀lé àwọn ìgbésẹ̀."],
  pcm:["Pause","Stop","Step","Reset","E dey run","E pause","E stop","Ready","Complete","Calculated transient playback","DC steady state","Run linear transient calculation before you step through samples."]
};
function renderSimulationHud(){
  const live=dcFeedback.read(), words=SIM_HUD_TEXT[state.project.metadata.locale]??SIM_HUD_TEXT.en, busy=Boolean(state.activeSimulation);
  const hud=$("#simulation-hud");hud.dataset.playback=busy?"running":live.playback;
  ["pause","stop","step","reset"].forEach((name,i)=>{const button=$(`#hud-${name}`);button.querySelector("span:last-child").textContent=words[i];button.title=name==="step"&&live.kind!=="transient"?words[11]:words[i];});
  $("#hud-pause").disabled=busy||live.playback!=="running"||!live.active;
  $("#hud-step").disabled=busy||live.status!=="ready"||live.kind!=="transient"||live.sampleIndex>=live.sampleCount-1;
  for(const button of $$('[data-action="stop-simulation"]'))button.disabled=!busy&&!live.active;
  const label=words[({running:4,paused:5,stopped:6,idle:7,complete:8})[live.playback]??7];
  $("#simulation-time").textContent=live.kind==="transient"?`${label} · t=${live.timeSeconds.toPrecision(4)} s · ${live.sampleIndex+1}/${live.sampleCount} · ${live.speed.toPrecision(3)}×`:live.kind==="dc"?`${label} · ${words[10]}`:`${busy?words[4]:label} · t=0 s`;
  $("#simulation-time").title=live.kind==="transient"?words[9]:live.kind==="dc"?words[10]:words[11];
  document.querySelector(".canvas-area").classList.toggle("simulation-paused",["paused","complete"].includes(live.playback));
  if(live.kind==="transient"&&live.status==="ready")$("#feedback-status").textContent=words[9]+" · t="+live.timeSeconds.toPrecision(4)+" s";
  if(typeof designTools!=="undefined")designTools.paint();
}
function paintSimulationFrame(){
  const data=$("#feedback-live").checked?dcFeedback.read().data:null, electron=$("#feedback-direction").value==="electron";
  for(const node of $$('#design-canvas [data-instance-id]'))node.classList.toggle('ladder-energized',data?.blocks?.[node.dataset.instanceId]?.on===true);
  for(const hit of $$(".schematic-wire-layer .wire-hit[data-feedback-net]")){
    const {feedbackNet:wireNet,feedbackFirst:wireFirst,feedbackSecond:wireSecond}=hit.dataset, base=hit.nextElementSibling;
    const measured=data?.wires?.[wireEdgeKey(wireNet,wireFirst,wireSecond)], color=voltageColor(measured?.voltageV), motion=currentMotion(measured?.currentA,electron);
    if(base.dataset.customColor||color)base.style.stroke=base.dataset.customColor||color;else base.style.removeProperty("stroke");
    base.style.opacity=measured?.currentA===0?".45":".8";
    const title=hit.querySelector("title");if(title&&measured)title.textContent=`${wireNet}: ${measured.voltageV?.toPrecision(4)??"?"} V; ${Number.isFinite(measured.currentA)?measured.currentA.toPrecision(4)+" A":measured.reason}`;
    let flow=base.nextElementSibling?.classList.contains("wire-flow")?base.nextElementSibling:null;
    if(!motion||$("#feedback-motion").value==="reduce"){flow?.remove();continue;}
    if(!flow){flow=document.createElementNS("http://www.w3.org/2000/svg","path");flow.setAttribute("class","wire-flow");flow.setAttribute("d",base.getAttribute("d"));flow.setAttribute("aria-hidden","true");base.after(flow);}
    flow.style.stroke=color??"#72f4ed";flow.style.setProperty("--flow-duration",motion.durationSeconds+"s");flow.style.animationDirection=motion.reverse?"reverse":"normal";flow.dataset.currentA=String(measured.currentA);
  }
  const netByPin=new Map(state.project.nets.flatMap(net=>net.endpoints.map(pin=>[pin,net.id])));
  for(const target of $$(".schematic-pin-terminal[data-schematic-endpoint]")){
    const voltage=data?.nodes?.[netByPin.get(target.dataset.schematicEndpoint)],color=voltageColor(voltage),dot=target.querySelector(".schematic-pin-dot");
    if(color){dot.style.fill=color;dot.style.stroke=color;const title=target.querySelector("title");if(title)title.textContent=`${target.dataset.schematicEndpoint}: ${data?.units==='logic'?voltage+' logic':voltage.toPrecision(4)+' V'}`;}
    else{dot.style.removeProperty("fill");dot.style.removeProperty("stroke");}
  }
  renderSimulationHud();
  wireUi.paintMeasurements();
}
const wireUi = createSchematicWireUi({
  getState:()=>state, canvas:$("#design-canvas"), panel:$("#wire-properties"), crossingNotice:$("#wire-crossing-notice"), snap:()=>$("#snap-toggle").checked,
  commit:(next,before)=>{state.project=before;captureHistory();state.project=next;state.dirty=true;state.lastValidation=null;},
  render:()=>{renderCanvas();renderInspector();renderValidation();updateSaveState();}, showInspector:()=>setInspector("component"),
  getFeedback:()=>dcFeedback.read().data, onError:message=>showDialog(t("schematic"),message)
});
const designTools = createDesignTools({document,window,getState:()=>state,getLive:()=>dcFeedback.read(),getRoute:()=>wireUi.selectedRoute(),commit:next=>{captureHistory();state.project=next;state.dirty=true;state.lastValidation=null;},render});
const exampleBrowser=createExampleBrowser({document,fetch:(...args)=>fetch(...args),getLocale:()=>state.project.metadata.locale,translate:t});
const canvasExperience=createCanvasExperience({document,window,getLocale:()=>state.project.metadata.locale});
window.addEventListener("pagehide",event=>{if(!event.persisted){designTools.dispose();canvasExperience.dispose();exampleBrowser.dispose();}});
const projectSession = createProjectSession(state, { storage: () => localStorage, onReset: () => {
  dcFeedback.stop(false);
  designTools.reset();
  canvasExperience.reset();
  wireUi.reset();
  state.feedbackConfig=null;
  state.selectedWire = null; state.wireCursor = null; state.placement = null;
  setSimulationWorkerBusy(false);
  botLiveCopilot.dispose();
  botLiveCopilot.setGoal("");
  $("#bot-goal").value = "";
  renderBotFinding(null);
  lastBotHover = null;
  $("#output-log").textContent = "";
  $("#issue-list").textContent = "";
  clearExampleSelection();
  $("#simulation-analysis-mode").value = "automatic";
  for (const id of ["#nonlinear-dc-controls", "#ac-sweep-controls", "#linear-transient-controls", "#digital-event-controls"]) $(id).classList.add("hidden");
  render();
} });

function clearExampleSelection() {
  const picker = $("#example-picker");
  picker.value = "";
  picker.dispatchEvent(new Event("change", { bubbles: true }));
}

function confirmDiscardChanges() {
  return confirmProjectReplacement({ state, dialog: $("#unsaved-dialog") });
}

async function resetCanvas() {
  // Invalidate earlier file/example requests even if this reset is later cancelled.
  projectSession.invalidateLoads();
  if (!await confirmDiscardChanges()) return;
  projectSession.reset();
  log("[NEW] Created a blank circuit project.");
}

async function openSavedProject() {
  const isCurrent = projectSession.beginLoad();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return showDialog(t("openSavedProject"), t("noSavedProject"));
    const project = parseProject(stored);
    if (!await confirmDiscardChanges() || !isCurrent()) return;
    projectSession.reset(project, { saved: "local", currentProjectId: project.id });
    recentProjects.save(project, stored).catch((error) => log(`[RECENTS] ${error.message}`));
    log("[OPENED] Explicitly reopened the project saved in this browser.");
  } catch (error) { showDialog(t("openSavedProject"), error.message); }
}

function deleteSavedProject() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return showDialog(t("deleteSavedProject"), t("noSavedProject"));
    const project = parseProject(stored);
    if (!confirm(`${t("deleteSavedProjectPrompt")}\n\n${project.metadata.name}`)) return;
    localStorage.removeItem(STORAGE_KEY);
    if (state.savedDisposition === "local" && state.currentProjectId === project.id) {
      state.dirty = true;
      updateSaveState();
    }
    log("[SAVED COPY REMOVED] Recent snapshots remain available.");
    showDialog(t("deleteSavedProject"), t("savedProjectDeleted"));
  } catch (error) { showDialog(t("deleteSavedProject"), error.message); }
}

function populateRecentProjectPicker(records) {
  const picker = $("#recent-project-picker");
  picker.replaceChildren(...records.map((record) => {
    const option = document.createElement("option");
    option.value = record.id;
    option.textContent = `${record.name} · ${new Date(record.savedAt).toLocaleString()}`;
    return option;
  }));
  picker.value = records[0]?.id ?? "";
  picker.disabled = records.length === 0;
  $("#recent-project-open").disabled = !picker.value;
  $("#recent-project-remove").disabled = !picker.value;
  return picker;
}

async function openRecentProjectsDialog() {
  try {
    const records = await recentProjects.list();
    populateRecentProjectPicker(records);
    $("#recent-project-status").hidden = true;
    if (!records.length) return showDialog(t("openRecentProject"), t("noRecentProjects"));
    $("#recent-project-dialog").showModal();
  } catch (error) { showDialog(t("openRecentProject"), error.message); }
}

async function removeSelectedRecentProject() {
  const id = $("#recent-project-picker").value;
  if (!id) return;
  try {
    const record = await recentProjects.get(id);
    if (!record) return void openRecentProjectsDialog();
    if (!confirm(`${t("removeRecentProjectPrompt")}\n\n${record.name}`)) return;
    await recentProjects.delete(id);
    const records = await recentProjects.list();
    populateRecentProjectPicker(records);
    const status = $("#recent-project-status");
    status.textContent = records.length
      ? t("recentProjectRemoved")
      : `${t("recentProjectRemoved")} ${t("noRecentProjects")}`;
    status.hidden = false;
    $("#recent-project-picker").disabled = records.length === 0;
  } catch (error) { showDialog(t("openRecentProject"), error.message); }
}

async function openSelectedRecentProject() {
  const id = $("#recent-project-picker").value;
  if (!id) return;
  $("#recent-project-dialog").close();
  const isCurrent = projectSession.beginLoad();
  try {
    const record = await recentProjects.get(id);
    if (!record || !isCurrent()) return;
    const project = parseProject(record.serialized);
    if (!await confirmDiscardChanges() || !isCurrent()) return;
    projectSession.reset(project, { saved: "local", currentProjectId: project.id });
    componentPropertiesUi.resetSession();
    recentProjects.save(project, record.serialized).catch((error) => log(`[RECENTS] ${error.message}`));
    log(`[OPENED] Reopened recent local project “${record.name}”.`);
  } catch (error) { showDialog(t("openRecentProject"), error.message); }
}

function saveLocal() {
  try {
    const project = state.project;
    const serialized = serializeProject(project);
    localStorage.setItem(STORAGE_KEY, serialized);
    recentProjects.save(project, serialized).catch((error) => log(`[RECENTS] ${error.message}`));
    componentPropertiesUi.resetSession();
    projectSession.markSaved("local");
    updateSaveState();
    log("[SAVED] Project stored locally in this browser.");
  } catch (error) { showDialog(t("save"), error.message); }
}

function captureHistory() {
  componentPropertiesUi.resetSession();
  state.lastAnalysis = null;
  state.history.push(serializeProject(state.project));
  if (state.history.length > 30) state.history.shift();
  state.future = [];
  state.botUnsavedOnly = false;
}

function replaceProject(project, { dirty = true } = {}) {
  wireUi.reset();
  state.lastAnalysis = null;
  state.project = project;
  state.selectedInstanceId = project.components.some(item => item.instanceId === state.selectedInstanceId) ? state.selectedInstanceId : project.components[0]?.instanceId ?? null;
  state.selectedWire = null; state.wireCursor = null;
  state.pcbSelectedViaId = null;
  state.pcbViaDraft = null;
  state.dirty = dirty;
  render();
}

function undo() {
  if (!state.history.length) return log("[INFO] There is no earlier local edit to undo.");
  let restored;
  try { restored = parseProject(state.history.at(-1)); }
  catch (error) { showDialog(t("undo"), error.message); log(`[UNDO BLOCKED] ${error.message}`); return; }
  state.botUnsavedOnly = false;
  state.future.push(serializeProject(state.project));
  state.history.pop();
  replaceProject(restored);
  log("[UNDO] Restored the previous local project state.");
}

function redo() {
  if (!state.future.length) return log("[INFO] There is no later local edit to redo.");
  let restored;
  try { restored = parseProject(state.future.at(-1)); }
  catch (error) { showDialog(t("redo"), error.message); log(`[REDO BLOCKED] ${error.message}`); return; }
  state.botUnsavedOnly = false;
  state.history.push(serializeProject(state.project));
  state.future.pop();
  replaceProject(restored);
  log("[REDO] Restored the next local project state.");
}

function updateSaveState() {
  $("#save-state").textContent = state.dirty ? t("unsavedChanges") : t(state.savedDisposition === "cloud" ? "savedToCloud" : state.savedDisposition === "local" ? "savedLocally" : state.savedDisposition === "export" ? "projectExported" : "emptyProject");
  $("#active-project-name").textContent = state.project.metadata.name;
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
  const expandedCategories = new Map($$(".library-category").map(group => [group.dataset.categoryGroup, group.open]));
  const categoryLabels = new Map($$(".category-filter").map(button => [button.dataset.category, button.textContent]));
  const categoryOrder = [...categoryLabels.keys(), ...new Set(matching.map(part => part.category))];
  const categories = [...new Set(categoryOrder)].filter(category => matching.some(part => part.category === category));
  const partRow = (part) => `
    <li><button type="button" class="component-item ${part.id === state.selectedLibraryId ? "selected" : ""}" data-library-id="${escape(part.id)}" draggable="true">
      <span class="component-icon" aria-hidden="true">${renderSchematicSymbol(part) ?? "◇"}</span><span><strong>${escape(part.type)}</strong><small>${escape(part.defaultValue)} · ${escape(part.simulation)}</small></span>
    </button></li>`;
  $("#component-list").innerHTML = categories.map((category, index) => {
    const open = query || state.activeCategory !== "All" || (expandedCategories.get(category) ?? index < 3);
    return `<li><details class="library-category" data-category-group="${escape(category)}" ${open ? "open" : ""}><summary>${escape(categoryLabels.get(category) ?? category)}</summary><ul>${matching.filter(part => part.category === category).map(partRow).join("")}</ul></details></li>`;
  }).join("") || `<li class="empty-list">${escape(t("libraryHelp"))}</li>`;
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
  const symbol = view === "schematic" ? renderSchematicSymbol(part, component) : null;
  const symbolSize = view === "schematic" ? schematicGeometry(component) : schematicSymbolSize(component.libraryId);
  const body = symbol ?? `<span class="part-body">${component.libraryId === "diode.led-red" ? "●" : component.libraryId === "power.dc-source" ? "+ −" : component.libraryId === "ground.signal" ? "⏚" : component.libraryId === "passive.resistor" ? "▥" : "▣"}</span>`;
  return `<button type="button" class="placed-component ${className} ${selected} ${netSelected}" data-instance-id="${escape(component.instanceId)}" data-placement-view="${escape(view)}" style="--x:${x}px;--y:${y}px;--symbol-width:${symbolSize.width}px;--symbol-height:${symbolSize.height}px;--symbol-rotation:${symbolSize.rotation ?? 0}deg;--symbol-mirror-x:${symbolSize.mirrorX ? -1 : 1};--symbol-mirror-y:${symbolSize.mirrorY ? -1 : 1}" aria-label="${escape(component.reference)} ${escape(type)}"><span class="part-reference">${escape(component.reference)}</span>${body}<span class="part-value" title="${escape(component.value)}">${escape(component.libraryId.startsWith('plc.')?ladderValueLabel(component):component.value)}</span></button>`;
}

function unmappedComponentVisual(component, view, reason) {
  const part = findLibraryPart(component.libraryId), type = part?.type ?? "Unknown component";
  const [x = 120, y = 120] = component.position?.[view] ?? [];
  const selected = component.instanceId === state.selectedInstanceId ? "is-selected" : "";
  return `<button type="button" class="placed-component unmapped-component ${selected}" data-instance-id="${escape(component.instanceId)}" data-placement-view="${escape(view)}" style="--x:${x}px;--y:${y}px" title="${escape(reason)}" aria-label="${escape(component.reference)} ${escape(type)}: ${escape(reason)}"><span class="part-reference">${escape(component.reference)}</span><span class="unmapped-component-indicator" aria-hidden="true">⚠</span><span class="unmapped-component-label">${escape(view.toUpperCase())} mapping needed</span></button>`;
}

function componentCenter(component, view) {
  const [x = 120, y = 120] = component.position?.[view] ?? [];
  return { x: x + 28, y: y + 29 };
}

function resizeHandle() {
  const component = selectedComponent();
  if (!component || state.activeView !== "schematic" || state.activeTool !== "select" || state.schematicWireMode) return "";
  const geometry = schematicGeometry(component), [x, y] = component.position.schematic;
  return `<div class="component-selection" style="left:${x}px;top:${y}px;width:${geometry.width}px;height:${geometry.height}px"><button type="button" class="component-resize" data-resize-instance="${escape(component.instanceId)}" aria-label="Resize ${escape(component.reference)}" title="Resize ${escape(component.reference)}"></button></div>`;
}

function commitComponentEdit(next, capture = true) {
  if (JSON.stringify(next.components) === JSON.stringify(state.project.components)) return;
  if (capture) captureHistory();
  state.project = next;
  state.lastAnalysis = null;
  state.lastValidation = null;
  state.dirty = true;
  renderCanvas();
  renderInspector();
  updateSaveState();
  renderValidation();
  notifyBotCanvas();
}

function updateNodeProps(instanceId, key, value, capture = true) {
  commitComponentEdit(editComponentField(state.project, instanceId, key, value), capture);
}

function placeLibraryComponent(libraryId, point = null) {
  const part = findLibraryPart(libraryId);
  if (!part) return;
  // PCB land patterns must come from native package data, never an arbitrary dropped symbol.
  const view = state.activeView === "pcb" || !part.views?.[state.activeView] ? "schematic" : state.activeView;
  if (!point && view === "schematic") {
    const free = firstFreeComponentPlacement(state.project, libraryId);
    if (!free) { showDialog(placementText(state.project.metadata.locale,"draw"),placementText(state.project.metadata.locale,"noRoom")); return; }
    point = free.point;
  }
  let project = addComponent(state.project, libraryId);
  const id = project.components.at(-1).instanceId;
  if (point) project = moveComponent(project, id, view, point, { snap: $("#snap-toggle").checked });
  captureHistory();
  state.project = project;
  state.placement = null;
  state.selectedInstanceId = id;
  state.selectedWire = null;
  state.dirty = true;
  state.lastValidation = null;
  state.activeView = view;
  setInspector("component");
  activateView(view);
  render();
}

function beginComponentPlacement(libraryId) {
  const draft = startComponentPlacement(libraryId);
  state.schematicWireMode = false; state.schematicWireStart = null; state.wireCursor = null;
  state.activeTool = "select"; state.selectedWire = null;
  activateView("schematic");
  state.placement = draft;
  renderCanvas();
}

function placementGhost() {
  if (!state.placement?.point || state.activeView !== "schematic") return "";
  const part = findLibraryPart(state.placement.libraryId), item = placementComponent(state.placement);
  const {width,height,rotation} = item.geometry.schematic, [x,y] = item.position.schematic;
  const blocked = placementOverlaps(state.project,state.placement);
  return `<div class="placement-ghost ${blocked ? "placement-blocked" : ""}" aria-hidden="true" style="left:${x}px;top:${y}px;--symbol-width:${width}px;--symbol-height:${height}px;--symbol-rotation:${rotation}deg">${renderSchematicSymbol(part)}<span>${escape(part.type)}</span></div>`;
}

function updatePlacementPreview(point = null) {
  $("#draw-components").textContent = placementText(state.project.metadata.locale,"draw");
  if (point && state.placement) state.placement = positionComponentPlacement(state.placement,point,$("#snap-toggle").checked);
  const scene = $("#design-canvas .canvas-scene");
  scene?.querySelector(".placement-ghost")?.remove();
  scene?.insertAdjacentHTML("beforeend",placementGhost());
  $("#design-canvas").classList.toggle("is-placement-mode",Boolean(state.placement));
  const key = placementOverlaps(state.project,state.placement) ? "blocked" : "ready";
  $("#placement-status").textContent = state.placement ? placementText(state.project.metadata.locale,key) : "";
}

function finishComponentPlacement(point) {
  const draft = positionComponentPlacement(state.placement,point,$("#snap-toggle").checked);
  if (!draft) return;
  if (placementOverlaps(state.project,draft)) { state.placement=draft; updatePlacementPreview(); return; }
  const result = commitComponentPlacement(state.project,draft);
  captureHistory(); state.project=result.project; state.selectedInstanceId=result.instanceId;
  state.placement=null; state.dirty=true; state.lastValidation=null;
  setInspector("component"); render();
}

function deleteSelectedWire() {
  if(wireUi.deleteSelected())return true;
  if (!state.selectedWire) return false;
  const { netId, first, second } = state.selectedWire;
  const next = removeNetEdge(state.project, netId, first, second);
  if (next !== state.project) {
    captureHistory(); state.project = next; state.dirty = true; state.lastValidation = null;
  }
  state.selectedWire = null; state.selectedNetId = null;
  render();
  return true;
}

function netClass(netId) {
  if (/^(gnd|ground|0)$/i.test(netId)) return "net-ground";
  if (/^(vcc|vdd|vin|power)$/i.test(netId)) return "net-power";
  return "net-signal";
}

function netSvg(project, view, unavailable = new Set(), interactive = true) {
  const feedback=view==="schematic"&&$("#feedback-live").checked?dcFeedback.read().data:null;
  const componentsById = new Map(project.components.map((component) => [component.instanceId, component]));
  const endpointPoint = (endpoint) => {
    const [instanceId, ...pinParts] = String(endpoint).split(":");
    const component = componentsById.get(instanceId);
    if (!component || unavailable.has(instanceId)) return null;
    if (view !== "schematic") return componentCenter(component, view);
    const part = findLibraryPart(component.libraryId);
    return part ? schematicPinPoint(component, part.pins, pinParts.join(":")) : null;
  };
  const previousRoutes = [], crossingPainter=createCrossingPainter(), nativeRoutes=view==="schematic"?wireUi.routes(project,unavailable):null;
  const entries=nativeRoutes?nativeRoutes.map(native=>({net:{id:native.netId??"Open"},first:native.first,second:native.second,native})):project.nets.flatMap(net=>netEdges(net).map(([first,second])=>({net,first,second})));
  const paths = entries.map(({net,first,second,native}) => {
    const origin = endpointPoint(first), point = second===null?native?.points?.at(-1):endpointPoint(second);
    if (!origin || !point) return "";
    const route = nativeRoutes ? native?.points?.map(([x,y])=>({x,y})) : routeSchematicConnection(project.components.filter(component => !unavailable.has(component.instanceId)), findLibraryPart, first, second, previousRoutes.filter(item => item.net !== net.id).map(item => item.route), netClass(net.id) === "net-ground" ? "bottom" : netClass(net.id) === "net-power" ? "top" : null);
    if (!route) return `<text class="unrouted-wire" x="${origin.x}" y="${origin.y - 13}">${escape(net.id)}: route blocked</text>`;
    previousRoutes.push({ net: net.id, route });
    const segments=native?junctionRouteSegments(project,native):[{points:route.map(p=>[p.x,p.y]),measurementFirst:first,measurementSecond:second}];
    return segments.map(segment=>{
    const path = crossingPainter.path(segment.points), custom=wirePaint(project,native??{first,second});
    const measured=feedback?.wires?.[wireEdgeKey(net.id,segment.measurementFirst,segment.measurementSecond)];
    const color=voltageColor(measured?.voltageV), motion=currentMotion(measured?.currentA,$("#feedback-direction").value==="electron");
    const title=measured?`<title>${escape(net.id)}: ${measured.voltageV===null?"?":measured.voltageV.toPrecision(4)} V; ${measured.currentA===null?escape(measured.reason):measured.currentA.toPrecision(4)+" A (first → second)"}</title>`:"";
    const flow=motion&&$("#feedback-motion").value!=="reduce"?`<path class="wire-flow" d="${path}" style="stroke:${color??"#72f4ed"};--flow-duration:${motion.durationSeconds}s;animation-direction:${motion.reverse?"reverse":"normal"}" data-current-a="${measured.currentA}" aria-hidden="true"/>`:"";
    const selected = state.selectedWire?.netId === net.id && state.selectedWire.first === first && state.selectedWire.second === second;
    const attrs = interactive ? `${native?.wireId?`data-wire-id="${escape(native.wireId)}" `:""}data-wire-first="${escape(first)}" data-wire-second="${escape(second)}" data-wire-net="${escape(net.id)}" role="button" tabindex="0" aria-label="${escape(net.id)}: ${escape(first)} → ${escape(second)}"` : "";
    return `<path class="wire-crossing-gap" d="${path}"/><path class="wire-hit ${selected ? "selected-wire" : ""}" d="${path}" data-feedback-net="${escape(net.id)}" data-feedback-first="${escape(segment.measurementFirst)}" data-feedback-second="${escape(segment.measurementSecond)}" ${attrs}>${title}</path><path class="${second===null?"dangling-wire":netClass(net.id)} ${net.id === state.selectedNetId ? "is-net-highlight" : ""} ${selected ? "selected-wire" : ""}" d="${path}" data-net="${escape(net.id)}" data-custom-color="${custom.color??""}" style="${custom.color||color?`stroke:${custom.color??color};`:""}${custom.width?`stroke-width:${custom.width};`:""}${color?`opacity:${measured.currentA===0?.45:.8}`:""}"/>${flow}`;
    }).join("");
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
      const labelX = point.x + (side === "left" ? -4 : side === "right" ? 4 : 0);
      const anchor = side === "left" ? "end" : side === "right" ? "start" : "middle";
      const origin = state.schematicWireStart === endpoint ? "is-wire-origin" : "";
      const voltage=net?feedback?.nodes?.[net.id]:null, nodeColor=voltageColor(voltage);
      return `<g class="schematic-pin-terminal schematic-pin-target ${net ? netClass(net.id) : "net-signal"} ${origin}" data-schematic-endpoint="${escape(endpoint)}" ${interactive ? 'role="button" tabindex="0"' : ""} aria-label="${escape(endpoint)}">${nodeColor?`<title>${escape(endpoint)}: ${dcFeedback.read().data?.units==='logic'?voltage+' logic':voltage.toPrecision(4)+' V'}</title>`:""}<circle class="schematic-pin-hit" cx="${point.x}" cy="${point.y}" r="8"/><circle class="schematic-pin-dot" cx="${point.x}" cy="${point.y}" r="2.4" ${nodeColor?`style="fill:${nodeColor};stroke:${nodeColor}"`:""}/><text x="${labelX}" y="${point.y - 4}" text-anchor="${anchor}">${component.libraryId === "ground.signal" ? "" : escape(pin)}</text></g>`;
    });
  }).join("") : "";
  const draft = view==="schematic"?wireUi.extraPaths(project,interactive,crossingPainter):"", handles=view==="schematic"?wireUi.handles(project,interactive):"";
  return `<svg class="wire-layer schematic-wire-layer" viewBox="0 0 680 300" ${interactive ? 'aria-label="Schematic wires and pins"' : 'aria-hidden="true"'}>${paths}${draft}</svg><svg class="wire-layer schematic-terminal-layer" viewBox="0 0 680 300" ${interactive ? 'aria-label="Component terminals"' : 'aria-hidden="true"'}>${terminals}${handles}</svg>`;
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
    const nucleoBoard = renderNucleoG031K8Breadboard(project, component);
    if (nucleoBoard) return nucleoBoard;
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
  state.lastValidation = null;
  render();
  validateAndReport();
  log(message);
}

function applyCanvasCamera() {
  applyMiniCanvasCamera();
  const canvas = $("#design-canvas"), scene = canvas.querySelector(".canvas-scene");
  const camera = createCanvasCamera(canvas.clientWidth, canvas.clientHeight, state.scale, state.pan);
  if (!scene || !camera) return null;
  state.scale = camera.zoom;
  state.pan = camera.pan;
  scene.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
  $("#zoom-level").textContent = `${Math.round(camera.zoom * 100)}%`;
  $('[data-tool="zoom-in"]').disabled = camera.zoom >= CANVAS_ZOOM.max;
  $('[data-tool="zoom-out"]').disabled = camera.zoom <= CANVAS_ZOOM.min;
  return camera;
}

function applyMiniCanvasCamera() {
  for (const id of ["#schematic-mini", "#pcb-mini"]) {
    const canvas = $(id), scene = canvas.querySelector(".canvas-scene");
    const camera = createCanvasCamera(canvas.clientWidth, canvas.clientHeight);
    if (scene && camera) scene.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
  }
}

function changeCanvasZoom(tool) {
  const current = applyCanvasCamera();
  if (!current) return;
  const next = tool === "fit" ? createCanvasCamera(current.width, current.height)
    : zoomCanvasCamera(current, current.zoom * (tool === "zoom-in" ? CANVAS_ZOOM.step : 1 / CANVAS_ZOOM.step));
  state.scale = next.zoom;
  state.pan = next.pan;
  applyCanvasCamera();
}

function renderCanvasFeedback(issues, label) {
  $("#canvas-view-label").textContent = label;
  $("#view-reconciliation").hidden = issues.length === 0;
  $("#view-reconciliation-summary").textContent = `${t("viewReconciliationNeeded")} (${issues.length})`;
  $("#view-reconciliation-items").innerHTML = issues.map((issue) => `<li>${escape(issue.reference)}: ${escape(issue.reason)}</li>`).join("");
}

function renderCanvas() {
  dcFeedback.observe(state.project);
  renderFeedbackControls();
  const canvas = $("#design-canvas");
  canvas.className = `design-canvas ${state.activeView} ${state.breadboardPlacementMode ? "is-placement-mode" : ""} ${state.schematicWireMode ? "is-wire-mode" : ""} ${state.activeTool === "pcb-route" ? "is-pcb-route-mode" : ""} ${$("#grid-toggle").checked ? "grid-enabled" : ""}`;
  const canvasArea = document.querySelector(".canvas-area");
  canvasArea.classList.toggle("feedback-animate",$("#feedback-motion").value==="animate");
  canvasArea.classList.toggle("has-overview", state.activeView === "breadboard");
  document.querySelectorAll("[data-mini-view]").forEach((panel) => { panel.hidden = panel.dataset.miniView !== "schematic" || state.activeView !== "breadboard"; });
  canvas.setAttribute("aria-label", `${state.activeView} representation. Select a component to inspect it.`);
  const projection = projectComponentsForView(state.project, state.activeView);
  const issues = unresolvedComponentsForDisplay(state.project, state.activeView);
  const unavailable = new Set(issues.map((issue) => issue.instanceId));
  const isBreadboard = state.activeView === "breadboard";
  const isPcb = state.activeView === "pcb";
  const hasPhysicalMap = Object.keys(state.project.breadboard?.pinHoles ?? {}).length > 0;
  const pcbData = state.project.pcbFabrication;
  const hasPcbData = isPcb && Boolean(pcbData?.board && Number.isFinite(pcbData.board.widthMm) && Number.isFinite(pcbData.board.heightMm) && Array.isArray(pcbData.parts) && Array.isArray(pcbData.pads) && Array.isArray(pcbData.routes));
  const pcbRouteLayerSelect = $("#pcb-route-layer");
  const pcbCopperLayers = pcbData?.board?.copperLayers ?? [];
  $("#pcb-route-layer-control").hidden = !hasPcbData;
  [...pcbRouteLayerSelect.options].forEach((option) => { option.disabled = !pcbCopperLayers.includes(option.value); });
  if (!pcbCopperLayers.includes(pcbRouteLayerSelect.value)) pcbRouteLayerSelect.value = pcbCopperLayers.includes("F.Cu") ? "F.Cu" : (pcbCopperLayers[0] ?? "");
  const placedParts = isBreadboard && hasPhysicalMap
    ? breadboardPinMarkers(state.project) + projection.components.filter(component => !Object.keys(state.project.breadboard.pinHoles).some(endpoint => endpoint.startsWith(`${component.instanceId}:`))).map(component => componentVisual(component, "breadboard")).join("")
    : hasPcbData ? "" : projection.components.map((component) => componentVisual(component, state.activeView)).join("");
  const parts = placedParts + issues.map(issue => { const component=state.project.components.find(item=>item.instanceId===issue.instanceId); return component ? unmappedComponentVisual(component,state.activeView,issue.reason) : ""; }).join("");
  const surface = isBreadboard ? breadboardBoardSvg(state.project) : isPcb ? renderPcbPreviewSvg(state.project, t("pcbNoFootprintData")) : "";
  const wires = isBreadboard
    ? breadboardWireSvg(state.project)
    : isPcb ? (hasPcbData ? "" : pcbAirwireSvg(state.project, unavailable))
      : netSvg(state.project, state.activeView, unavailable);
  const label = state.activeView === "breadboard" ? (hasPhysicalMap ? t("breadboardPhysicalMapLabel") : t("breadboardNoPhysicalMapLabel")) : state.activeView === "schematic" ? t("schematicLayoutPreview") : (hasPcbData ? t("pcbStoredLayoutPreview") : t("pcbNoFootprintData"));
  renderCanvasFeedback(issues, label);
  canvas.innerHTML = `<div class="canvas-scene">${isPcb && hasPcbData ? renderPcbPreviewSvg(state.project, t("pcbNoFootprintData"), state.pcbRouteDraft) : surface}${wires}${parts}${resizeHandle()}</div>`;
  applyCanvasCamera();
  updatePlacementPreview();
  ["select", "pan"].forEach((tool) => {
    const button = $(`[data-tool="${tool}"]`);
    button.classList.toggle("active", state.activeTool === tool);
    button.setAttribute("aria-pressed", String(state.activeTool === tool));
  });
  $("#schematic-wire-mode").setAttribute("aria-pressed", String(state.schematicWireMode));
  $("#schematic-wire-status").textContent = !state.schematicWireMode ? "" : state.schematicWireStart ? t("schematicWireNext") : t("schematicWireStart");
  $("#pcb-route-mode").disabled = !hasPcbData;
  $("#pcb-route-mode").setAttribute("aria-pressed", String(state.activeTool === "pcb-route"));
  $("#pcb-route-status").textContent = state.activeTool !== "pcb-route" ? "" : t(state.pcbRouteHintKey ?? (state.pcbRouteDraft ? "pcbRouteWaypoint" : "pcbRouteStart"));
  canvas.classList.toggle("is-pcb-via-mode", state.activeTool === "pcb-via");
  pcbViaEditor.refresh();
  $$('[data-tool]').forEach((button) => button.classList.toggle("active", button.dataset.tool === state.activeTool));
  const miniSchematic = state.project.components.filter((component) => !getViewReconciliationIssues({ components: [component] }, "schematic").length).map((component) => componentVisual(component, "schematic")).join("");
  const miniPcb = state.project.components.filter((component) => !getViewReconciliationIssues({ components: [component] }, "pcb").length).map((component) => componentVisual(component, "pcb")).join("");
  $("#schematic-mini").innerHTML = `<div class="canvas-scene">${netSvg(state.project, "schematic", new Set(getViewReconciliationIssues(state.project, "schematic").map((issue) => issue.instanceId)), false)}${miniSchematic}</div>`;
  $("#pcb-mini").innerHTML = `<div class="canvas-scene">${netSvg(state.project, "pcb", new Set(getViewReconciliationIssues(state.project, "pcb").map((issue) => issue.instanceId)))}${miniPcb}</div>`;
  applyMiniCanvasCamera();
  if(typeof canvasExperience!=="undefined")canvasExperience.paint();
  if(typeof designTools!=="undefined")designTools.paint();
}

function renderInspector() {
  const component = selectedComponent();
  for(const button of $$('[data-action^="transform-"]'))button.disabled=!component || (state.activeView!=="schematic" && !(state.activeView==="pcb" && button.dataset.action.startsWith("transform-rotate")));
  const part = component && findLibraryPart(component.libraryId);
  $("#property-type").value = part?.type ?? "No component selected";
  if (document.activeElement !== $("#property-reference")) $("#property-reference").value = component?.reference ?? "";
  if (document.activeElement !== $("#property-value")) $("#property-value").value = component?.value ?? "";
  $("#property-status").value = part?.status ?? "Unresolved library part";
  const pcbPart = state.project.pcbFabrication?.parts?.find((item) => item.instanceId === component?.instanceId);
  const pcbPads = state.project.pcbFabrication?.pads?.filter((item) => item.instanceId === component?.instanceId) ?? [];
  const padNets = new Set(pcbPads.map((item) => item.netId));
  const pcbRoutes = (state.project.pcbFabrication?.routes ?? []).filter((item) => padNets.has(item.netId));
  const centroid = pcbPads.length ? [pcbPads.reduce((sum, item) => sum + item.xMm, 0) / pcbPads.length, pcbPads.reduce((sum, item) => sum + item.yMm, 0) / pcbPads.length] : null;
  $("#pcb-footprint-details").classList.toggle("hidden", state.activeView !== "pcb" || !pcbPart);
  $("#pcb-footprint-package").textContent = pcbPart?.footprint ?? "—";
  $("#pcb-footprint-position").textContent = centroid ? centroid.map((value) => value.toFixed(2)).join(", ") : "—";
  $("#pcb-footprint-pad-count").textContent = String(pcbPads.length);
  $("#pcb-footprint-route-count").textContent = String(pcbRoutes.length);
  $("#pcb-footprint-rotation").textContent = `${pcbPart?.rotationDeg ?? 0}°`;
  $("#component-form").classList.toggle("hidden", state.activeInspector === "project");
  $("#project-form").classList.toggle("hidden", state.activeInspector !== "project");
  $("#simulation-form").classList.remove("hidden");
  $("#workspace-notes").textContent = state.lastAnalysis?.message ?? "Choose a supported example to see its tested model limits.";
  $("#project-name").value = state.project.metadata.name;
  $("#project-locale").value = state.project.metadata.locale;
  $("#component-form button").disabled = !component;
  $("#remove-component").disabled = !component;
  componentPropertiesUi.render();
  wireUi.renderPanel();
  if(!$("#wire-properties").hidden)$("#component-form").classList.add("hidden");
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
  $('#ladder-controls').hidden=!state.project.components.some(c=>c.libraryId.startsWith('plc.'));
  for(const node of $$('[data-ladder-label]'))node.textContent=ladderUiText(state.project.metadata.locale,Number(node.dataset.ladderLabel));
  if(!['ladder-scan-ms','ladder-duration-ms'].includes(document.activeElement?.id)){$('#ladder-scan-ms').value=state.project.ladderSimulation?.scanMs??10;$('#ladder-duration-ms').value=state.project.ladderSimulation?.durationMs??2000;}
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
  if(result.kind==='ladder-scan'){
    metrics.push(['Instructions',String(result.instructionCount)],['Scan',result.scanMs+' ms'],['Recorded scans',String(result.samples.length)]);
    waveform='<div class="ladder-results"><p>Logical scan · output tags update together; contact feedback takes one scan. No physical current or motor model.</p><table><thead><tr><th>Output / tag</th><th>Final bit</th></tr></thead><tbody>'+Object.entries(result.samples.at(-1).bits).map(([tag,value])=>`<tr><td>${escape(tag)}</td><td>${value}</td></tr>`).join('')+'</tbody></table></div>';
  } else if (result.kind === "linear-ac-sweep") {
    metrics.push([t("acPoints"), String(result.samples.length)], [t("acOutputNet"), result.outputNet ?? t("notRecorded")], [t("acStartHz"), `${result.startHz}–${result.stopHz} Hz`]);
    const rows = result.samples.map((sample) => `<tr><td>${Number(sample.frequencyHz.toPrecision(6))}</td><td>${sample.output ? Number(sample.output.magnitudeV.toPrecision(6)) : "—"}</td><td>${sample.output ? `${Number(sample.output.phaseDegrees.toPrecision(6))}°` : "—"}</td></tr>`).join("");
    waveform = `<figure class="result-waveform"><figcaption>${escape(t("analysisLinearAcSweep"))}</figcaption><table class="result-table linear-ac-table"><thead><tr><th>${escape(t("acFrequencyHz"))}</th><th>${escape(t("acMagnitude"))}</th><th>${escape(t("acPhase"))}</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  } else if (result.kind === "nonlinear-dc-operating-point") {
    metrics.push([t("nonlinearJunctionTemperature"), `${result.temperatureC} °C`], [t("nonlinearIterations"), String(result.iterations)], [t("nonlinearResidual"), result.nonlinearKclAndConstraintResidual.toExponential(2)], [t("nonlinearLinearResidual"), result.linearizedSolveResidual.toExponential(2)], [t("nonlinearPowerBalance"), `${result.powerBalanceW.toExponential(2)} W`]);
    const nodeRows = Object.entries(result.nodeVoltages).map(([net, voltage]) => `<tr><td>${escape(net)}</td><td>${Number(voltage.toPrecision(7))} V</td></tr>`).join("");
    const diodeRows = result.diodes.map((item) => `<tr><td>${escape(item.reference)}</td><td>${Number(item.voltage.toPrecision(7))} V</td><td>${Number(item.junctionVoltageV.toPrecision(7))} V</td><td>${Number((item.currentA * 1000).toPrecision(7))} mA</td><td>${Number(item.seriesResistanceOhm.toPrecision(6))} Ω</td><td>${Number((item.seriesResistancePowerW * 1000).toPrecision(7))} mW</td><td>${Number((item.powerW * 1000).toPrecision(7))} mW</td></tr>`).join("");
    const diodeTable = diodeRows ? `<h4>${escape(t("nonlinearDiodeResults"))}</h4><table class="result-table"><thead><tr><th>${escape(t("reference"))}</th><th>${escape(t("nonlinearVoltage"))}</th><th>${escape(t("nonlinearJunctionVoltage"))}</th><th>${escape(t("nonlinearCurrent"))}</th><th>${escape(t("nonlinearSeriesResistance"))}</th><th>${escape(t("nonlinearSeriesPower"))}</th><th>${escape(t("nonlinearPower"))}</th></tr></thead><tbody>${diodeRows}</tbody></table>` : "";
    const transistorRows = result.transistors.map((item) => `<tr><td>${escape(item.reference)}</td><td>${escape(item.type)}</td><td>${Number(item.vBE.toPrecision(7))} V</td><td>${Number((item.baseCurrentA * 1e6).toPrecision(7))} µA</td><td>${Number((item.collectorCurrentA * 1000).toPrecision(7))} mA</td><td>${Number((item.emitterCurrentA * 1000).toPrecision(7))} mA</td><td>${Number((item.powerW * 1000).toPrecision(7))} mW</td></tr>`).join("");
    const transistorTable = transistorRows ? `<h4>${escape(t("nonlinearTransistorResults"))}</h4><table class="result-table"><thead><tr><th>${escape(t("reference"))}</th><th>${escape(t("nonlinearTransistorType"))}</th><th>${escape(t("nonlinearVbe"))}</th><th>${escape(t("nonlinearBaseCurrent"))}</th><th>${escape(t("nonlinearCollectorCurrent"))}</th><th>${escape(t("nonlinearEmitterCurrent"))}</th><th>${escape(t("nonlinearPower"))}</th></tr></thead><tbody>${transistorRows}</tbody></table>` : "";
    waveform = `<figure class="result-waveform"><figcaption>${escape(t("analysisNonlinearDc"))}</figcaption><h4>${escape(t("nonlinearNodeVoltages"))}</h4><table class="result-table"><thead><tr><th>${escape(t("nonlinearNet"))}</th><th>${escape(t("nonlinearVoltage"))}</th></tr></thead><tbody>${nodeRows}</tbody></table>${diodeTable}${transistorTable}<p>${escape(analysis.message)}</p><p>${escape(analysis.warnings?.[0]?.message ?? "")}</p></figure>`;
  } else if (result.kind === "linear-rlc-transient") {
    const values = result.samples.map((sample) => sample.voltageV);
    const min = Math.min(0, ...values), max = Math.max(0, ...values), span = Math.max(max - min, 1e-12);
    const points = result.samples.filter((_, index) => index === 0 || index === result.samples.length - 1 || index % Math.max(1, Math.ceil(result.samples.length / 120)) === 0).map((sample) => `${(4 + sample.timeSeconds / result.stopSeconds * 592).toFixed(2)},${(92 - (sample.voltageV - min) / span * 80).toFixed(2)}`).join(" ");
    const initialSummary = [...Object.entries(result.initialConditions.capacitorVoltageVByReference).map(([reference, value]) => `${reference}=${value} V`), ...Object.entries(result.initialConditions.inductorCurrentAByReference).map(([reference, value]) => `${reference}=${value} A`)].join("; ") || "0 V / 0 A";
    metrics.push([t("transientSampleCount"), String(result.sampleCount)], [t("transientStopSeconds"), `${result.stopSeconds} s`], [t("transientOutputNet"), result.outputNet], [t("transientInitialConditions"), initialSummary], [t("transientFinalVoltage"), `${values.at(-1).toPrecision(6)} V`], [t("transientResidual"), result.maximumRelativeResidual.toExponential(2)]);
    waveform = `<figure class="result-waveform"><figcaption>${escape(t("analysisLinearTransient"))} · ${escape(result.outputNet)}</figcaption><svg viewBox="0 0 600 110" role="img" aria-label="${escape(t("transientTraceLabel"))}"><path class="wave-axis" d="M4 92H596 M4 12V92"/><polyline class="wave-trace" points="${points}"/></svg><p>${escape(analysis.message)}</p><p>${escape(analysis.warnings?.[0]?.message ?? "")}</p></figure>`;
  } else if (result.kind === "digital-event-simulation") {
    const rows = Object.entries(result.trace).flatMap(([net, points]) => points.map((point) => ({ net, ...point }))).sort((a, b) => a.timeNs - b.timeNs || a.net.localeCompare(b.net));
    metrics.push([t("digitalStopTime"), `${result.stopTimeNs} ns`], [t("digitalEventCount"), String(result.processedEvents)], [t("digitalProbeNets"), result.probeNets.join(", ")]);
    waveform = `<figure class="result-waveform"><figcaption>${escape(t("analysisDigitalEvents"))}</figcaption><table class="result-table"><thead><tr><th>${escape(t("digitalEventTimeNs"))}</th><th>${escape(t("digitalProbeNets"))}</th><th>${escape(t("digitalEventLevel"))}</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.timeNs}</td><td>${escape(row.net)}</td><td>${row.high ? "1 · HIGH" : "0 · LOW"}</td></tr>`).join("")}</tbody></table><p>${escape(analysis.message)}</p></figure>`;
  } else if (result.kind === "release-candidate-e2e") {
    metrics.push(["Fixtures",String(result.fixtureCount)],["PCB DRC",result.pcbDrc],["BOT project edit",result.botMutation?"Changed":"Read-only"],["Passed gates",String(Object.values(result.checks).filter(Boolean).length)]);
    const rows=Object.entries(result.checks).map(([name,passed])=>'<tr><td>'+escape(name)+'</td><td>'+(passed?"PASS":"FAIL")+'</td></tr>').join("");
    waveform='<figure class="result-waveform"><figcaption>Release candidate · build through export</figcaption><table class="result-table"><thead><tr><th>Gate</th><th>Result</th></tr></thead><tbody>'+rows+'</tbody></table><p>BOT cites local project/library fields; PCB export is illustrative, not manufacturing approval.</p></figure>';
  } else if (result.kind === "offline-recovery-scenario") {
    metrics.push(["Draft restored",result.draftSaved?"Yes":"No"],["Storage fallback",result.storageFallbackAvailable?"Native export valid":"Unavailable"],["Recovered edit",result.editedValue],["Silent loss",result.silentLoss?"Detected":"None"]);
    waveform='<figure class="result-waveform"><figcaption>Storage recovery fixture · not application session restore</figcaption><p>This explicit test fixture restores an edit in simulated storage. The application itself always boots empty. When browser storage is unavailable, use <strong>File → Export</strong> before closing.</p><p>CI uses an in-memory storage mock; real browser quota and crash behavior are outside this test.</p></figure>';
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
  $$(".output-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.output === state.activeOutput));
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
  $$("[data-i18n-placeholder]").forEach((node) => { node.placeholder = messages[node.dataset.i18nPlaceholder] ?? TRANSLATIONS.en[node.dataset.i18nPlaceholder] ?? node.placeholder; });
  $$("[data-i18n-alt]").forEach((node) => { node.alt = messages[node.dataset.i18nAlt] ?? TRANSLATIONS.en[node.dataset.i18nAlt] ?? node.alt; });
  $$("[data-i18n-aria]").forEach((node) => { node.setAttribute("aria-label", messages[node.dataset.i18nAria] ?? TRANSLATIONS.en[node.dataset.i18nAria] ?? node.getAttribute("aria-label")); });
  $$("[data-i18n-title]").forEach((node) => { node.title = messages[node.dataset.i18nTitle] ?? TRANSLATIONS.en[node.dataset.i18nTitle] ?? node.title; });
  $("#language").value = locale;
}

function renderAcSweepOutputOptions() {
  const select = $("#ac-output-net");
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">${escape(t("acAutoOutputLabel"))}</option>${(state.project.nets ?? []).map((net) => `<option value="${escape(net.id)}">${escape(net.id)}</option>`).join("")}`;
  if ((state.project.nets ?? []).some((net) => net.id === current)) select.value = current;
}

function renderLinearTransientOutputOptions() {
  const select = $("#transient-output-net");
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">${escape(t("acAutoOutputLabel"))}</option>${(state.project.nets ?? []).map((net) => `<option value="${escape(net.id)}">${escape(net.id)}</option>`).join("")}`;
  if ((state.project.nets ?? []).some((net) => net.id === current)) select.value = current;
}

function render() {
  applyLocale();
  if(typeof exampleBrowser!=="undefined")exampleBrowser.paint();
  for(const button of $$("[data-editor-label]"))button.textContent=editorMenuText(state.project.metadata.locale,button.dataset.editorLabel);
  if(typeof designTools!=="undefined")designTools.paint();
  const drawContent=$("#draw-menu-content");
  if(drawContent.dataset.locale!==state.project.metadata.locale){drawContent.innerHTML=drawMenuMarkup(state.project.metadata.locale);drawContent.dataset.locale=state.project.metadata.locale;}
  for(const button of $$(".canvas-toolbar button, .project-actions > button"))button.title=button.getAttribute("aria-label")||button.textContent.trim();
  renderAcSweepOutputOptions();
  renderLinearTransientOutputOptions();
  renderLibrary();
  renderCanvas();
  renderInspector();
  renderValidation();
  $("#bot-repair-apply").hidden = !state.project.botRepairPreview;
  $("#bot-proposal-apply").hidden = !state.project.botCircuitProposal;
  updateSaveState();
  notifyBotCanvas();
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

function showImplementationStatus() {
  showDialog(t("implementationStatus"), t("implementationStatusBody"));
}

function validateAndReport() {
  state.lastValidation = validateProject(state.project);
  renderValidation();
  const issues = [...state.lastValidation.errors, ...state.lastValidation.warnings];
  if (!issues.length) log("[VALIDATION] No project errors or warnings were found.");
  else issues.forEach((issue) => log(`[${issue.rule}] ${issue.message}`));
}

function isAnalysisWorkerEligible(project) {
  return Boolean(project && !project.releaseCandidateE2E);
}

function projectWithSelectedAnalysis(project, key, config) {
  const selected = { ...project };
  delete selected.linearAcSweep;
  delete selected.linearRlcTransient;
  delete selected.digitalEventSimulation;
  delete selected.shockleyDcOperatingPoint;
  selected[key] = config;
  return selected;
}

function setSimulationWorkerBusy(busy) {
  for (const button of $$('[data-action="run-simulation"]')) button.disabled = busy;
  $("#run-simulation").disabled = busy;
  $("#stop-simulation").disabled = !busy;
  renderSimulationHud();
}

function stopSimulation() {
  dcFeedback.stop();
  const run = state.activeSimulation;
  if (!run) return;
  state.activeSimulation = null;
  run.cancel();
  setSimulationWorkerBusy(false);
  state.lastAnalysis = { state: "cancelled", engine: "Worker-isolated bounded analysis", message: "The analysis was cancelled." };
  notifyBotCanvas();
  log("[CANCELLED] The analysis worker was stopped; no result was produced.");
  renderOutput();
}

function runAnalysis(workerResult = null) {
  if(workerResult===null)dcFeedback.stop();
  if(workerResult === null && state.project.releaseCandidateE2E){
    validateAndReport();
    state.lastAnalysis={state:"running",engine:"Release-candidate end-to-end suite",message:"Loading checked-in acceptance fixtures.",result:null};
    renderOutput();
    notifyBotCanvas();
    const isCurrent = projectSession.beginLoad();
    runReleaseCandidateE2E(state.project).then(result=>{
      if (!isCurrent()) return;
      state.lastAnalysis=result;
      notifyBotCanvas();
      if(result.state==="complete")log("[E2E] All release-candidate gates passed.");
      else log("[E2E] "+(result.errors?.[0]?.message??result.message));
      renderOutput();
    }).catch(error=>{
      if (!isCurrent()) return;
      state.lastAnalysis={state:"blocked",engine:"Release-candidate end-to-end suite",message:error instanceof Error?error.message:"The workflow failed.",errors:[],warnings:[],result:null};
      notifyBotCanvas();
      renderOutput();
    });
    return;
  }
  if (workerResult === null) {
    if (state.activeSimulation) return;
    validateAndReport();
    if (isAnalysisWorkerEligible(state.project)) {
      const analysisMode = $("#simulation-analysis-mode").value;
      let projectForAnalysis = state.project;
      if (analysisMode === "nonlinear-dc") projectForAnalysis = projectWithSelectedAnalysis(state.project, "shockleyDcOperatingPoint", { temperatureC: Number($("#nonlinear-dc-temperature").value) });
      if (analysisMode === "linear-ac") projectForAnalysis = projectWithSelectedAnalysis(state.project, "linearAcSweep", { startHz: Number($("#ac-start-hz").value), stopHz: Number($("#ac-stop-hz").value), pointsPerDecade: Number($("#ac-points-per-decade").value), outputNet: $("#ac-output-net").value || undefined });
      if (analysisMode === "linear-transient") {
        let initialConditions;
        try { initialConditions = JSON.parse($("#transient-initial-conditions").value); }
        catch { state.lastAnalysis = { state: "blocked", engine: "Linear RLC transient configuration", message: "Initial conditions must be valid JSON." }; renderValidation(); return; }
        projectForAnalysis = projectWithSelectedAnalysis(state.project, "linearRlcTransient", { stopSeconds: Number($("#transient-stop-seconds").value), timeStepSeconds: Number($("#transient-time-step").value), outputNet: $("#transient-output-net").value || undefined, initialConditions });
      }
      if (analysisMode === "digital-events") {
        let events, initialStates;
        try {
          events = JSON.parse($("#digital-events-json").value);
          initialStates = JSON.parse($("#digital-initial-states").value);
        } catch { state.lastAnalysis = { state: "blocked", engine: "Digital event configuration", message: "Input events and initial states must be valid JSON." }; renderValidation(); return; }
        projectForAnalysis = projectWithSelectedAnalysis(state.project, "digitalEventSimulation", { stopTimeNs: Number($("#digital-stop-ns").value), events, initialStates, probeNets: [...$("#digital-probe-nets").selectedOptions].map((option) => option.value) });
        if (JSON.stringify(projectForAnalysis.digitalEventSimulation) !== JSON.stringify(state.project.digitalEventSimulation)) {
          captureHistory();
          state.project = { ...projectForAnalysis, metadata: { ...projectForAnalysis.metadata, updatedAt: new Date().toISOString() } };
          projectForAnalysis = state.project;
          state.dirty = true;
          renderConnections();
        }
      }
      const projectSnapshot = JSON.stringify(state.project);
      const feedbackKey=({"nonlinear-dc":"shockleyDcOperatingPoint","linear-transient":"linearRlcTransient"})[analysisMode];
      state.feedbackConfig=feedbackKey?{key:feedbackKey,value:structuredClone(projectForAnalysis[feedbackKey])}:null;
      const run = createSimulationWorkerRun(projectForAnalysis);
      state.activeSimulation = run;
      state.lastAnalysis = { state: "running", engine: "Worker-isolated bounded analysis", message: "Running the supported analysis in a background worker." };
      notifyBotCanvas();
      setSimulationWorkerBusy(true);
      renderOutput();
      run.promise.then((result) => {
        if (state.activeSimulation !== run) return;
        state.activeSimulation = null;
        setSimulationWorkerBusy(false);
        notifyBotCanvas();
        if (JSON.stringify(state.project) !== projectSnapshot) {
          state.lastAnalysis = { state: "stale", engine: "Worker-isolated bounded analysis", message: "The project changed while analysis was running. Run the analysis again for the current design." };
          renderOutput();
          return;
        }
        runAnalysis(result);
      });
      return;
    }
  }
  const result = workerResult;
  recordScopeAnalysis(state,result,()=>designTools.paint());
  // Playback and the scope are independent of optional canvas highlighting.
  dcFeedback.accept(state.project,result);
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
    } else if (kind === "resistive-network") {
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

function exportSpiceNetlistFile() {
  const exported = exportSpiceNetlist(state.project);
  if (!exported.ok) { showDialog(t("exportSpiceNetlist"), exported.error); return; }
  const name = state.project.metadata.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "adigun-project";
  const blob = new Blob([exported.netlist], { type: "text/plain;charset=utf-8" }), url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url;
  link.download = `${name}-ideal-spice.cir`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  log("[SPICE] Exported supported generic ideal sources and passive components; analysis directives and manufacturer models are not included.");
}

function exportProject() {
  let url;
  try {
    const blob = new Blob([serializeProject(state.project)], { type: "application/json" });
    const link = document.createElement("a");
    url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${state.project.metadata.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "adigun-project"}.adigun.json`;
    link.click();
    componentPropertiesUi.resetSession();
    projectSession.markSaved("export");
    updateSaveState();
    log("[EXPORTED] Native project download handed to the browser. Check your downloads for the saved file.");
  } catch (error) { showDialog(t("export"), error.message); }
  finally { if (url) setTimeout(() => URL.revokeObjectURL(url), 1500); }
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
  if(view!=="schematic"&&state.schematicWireMode)wireUi.pause();
  state.activeView = view;
  if (view !== "breadboard") state.breadboardPlacementMode = false;
  if (view !== "schematic") { state.placement = null; state.schematicWireMode = false; state.schematicWireStart = null; }
  if (view !== "pcb") { state.pcbRouteDraft = null; state.pcbRouteHintKey = null; if (["pcb-route", "pcb-via"].includes(state.activeTool)) state.activeTool = "select"; }
  $$(".view-tab").forEach((tab) => { const active = tab.dataset.view === view; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", String(active)); });
  renderCanvas();
  renderInspector();
}

function setInspector(tab) {
  setWorkspacePanel("right", true);
  state.activeInspector = tab;
  $$(".inspector-tab").forEach((button) => button.classList.toggle("active", button.dataset.inspector === tab));
  renderInspector();
}

function setWorkspacePanel(side, open) {
  if (!["left", "right"].includes(side)) return;
  const panel = $(side === "left" ? ".library-panel" : ".inspector-panel");
  state[side === "left" ? "leftBarOpen" : "rightBarOpen"] = Boolean(open);
  panel.classList.toggle("collapsed", !open);
  $("#workspace").classList.toggle(`${side}-panel-closed`, !open);
  $$(`[data-panel-toggle="${side}"]`).forEach(button => button.setAttribute("aria-expanded", String(Boolean(open))));
  if (!open && panel.contains(document.activeElement)) $(`[data-panel-toggle="${side}"]`).focus();
}

function rotateSelectedPcbFootprint(degrees) {
  const component = selectedComponent();
  if (state.activeView !== "pcb" || !component) return;
  const result = rotatePcbFootprint(state.project, component.instanceId, degrees);
  if (result.status === "blocked") {
    showDialog(t("pcbMenu"), result.code === "OUT_OF_BOUNDS" ? t("pcbMoveOutOfBounds") : t("pcbRotateBlocked"));
    log(`[PCB] Rotation blocked: ${result.code}.`);
    return;
  }
  if (result.status !== "complete") return;
  captureHistory();
  state.project = result.project;
  state.dirty = true;
  state.lastValidation = null;
  state.pcbRouteDraft = null;
  state.pcbRouteHintKey = null;
  state.activeTool = "select";
  render();
  validateAndReport();
  log(`[PCB] ${component.reference}: ${result.rotationDeg}° clockwise from initial layout; ${result.updatedRoutePoints} attached trace point(s) updated. Run PCB checks before export.`);
}

function handleAction(action) {
  if(action === "ladder-settings"){try{const config=ladderSettings({scanMs:Number($('#ladder-scan-ms').value),durationMs:Number($('#ladder-duration-ms').value)},state.project.components.length,state.project.nets.length);commitComponentEdit({...state.project,ladderSimulation:config,metadata:{...state.project.metadata,updatedAt:new Date().toISOString()}});}catch(error){showDialog(ladderUiText(state.project.metadata.locale,0),error.message);}return;}
  if(action === "canvas-experience"){canvasExperience.action();return;}
  if (action === "color-palette" || action === "oscilloscope") { designTools.action(action); return; }
  if(action.startsWith("transform-")){
    const key=action.slice(10),component=selectedComponent();if(!component)return;
    if(state.activeView==="pcb" && ["rotateLeft","rotateRight"].includes(key)){rotateSelectedPcbFootprint(key==="rotateLeft"?-90:90);return;}
    if(state.activeView!=="schematic")return;
    try{commitComponentEdit(transformSchematicComponent(state.project,component.instanceId,key));}
    catch(error){showDialog(t("editMenu"),error.message==="TRANSFORM_SPACE"?editorMenuText(state.project.metadata.locale,"transformBlocked"):error.message);}
    return;
  }
  if(action === "delete-selection"){deleteCanvasSelection();return;}
  if(action === "print-project"){printProjectView({document,window,project:state.project,view:state.activeView,viewLabel:t(state.activeView)});return;}
  if (pcbNetClassEditor.action(action)) return;
  if (pcbBoardEditor.action(action)) return;
  if (pcbViaEditor.action(action)) return;
  if (action === "pcb-rotate-left") rotateSelectedPcbFootprint(-90);
  if (action === "pcb-rotate-right") rotateSelectedPcbFootprint(90);
  if (action === "new-project" || action === "close-project") void resetCanvas();
  if (action === "open-saved-project") void openSavedProject();
  if (action === "delete-saved-project") deleteSavedProject();
  if (action === "open-recent-project") void openRecentProjectsDialog();
  if (action === "import-project") $("#import-file").click();
  if (action === "save") saveLocal();
  if (action === "export") exportProject();
  if (action === "bom-export") exportBomCsvFile();
  if (action === "spice-export") exportSpiceNetlistFile();
  if (action === "verify-run-lock") verifyRunLockfile();
  if (action === "pcb-drc") runPcbChecks();
  if (action === "pcb-export") exportPcbFiles();
  if (action === "validate") validateAndReport();
  if (action === "undo") undo();
  if (action === "redo") redo();
  if (action === "run-simulation") { if(dcFeedback.canResume(state.project))dcFeedback.resume();else runAnalysis(); }
  if (action === "stop-simulation") stopSimulation();
  if (action === "pause-simulation") dcFeedback.pause();
  if (action === "step-simulation") dcFeedback.step();
  if (action === "reset-simulation") { stopSimulation();state.lastAnalysis=null;state.lastAnalysisProjectKey=null;renderOutput();renderSimulationHud(); }
  if (action === "schematic-wire-mode") {state.placement=null;activateView("schematic");wireUi.toggle();}
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
    const next = pruneSchematicWires({ ...state.project, nets: preview.nets, metadata: { ...state.project.metadata, updatedAt: new Date().toISOString() } });
    const validation = validateProject(next);
    if (!validation.valid) return showDialog(t("breadboardSyncReview"), validation.errors.map((issue) => issue.message).join(" "));
    captureHistory();
    state.project = next;
    state.breadboardSyncPreview = null;
    state.dirty = true;
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
      const routePad = pcbCopperPads(state.project.pcbFabrication).find((item) => `${item.instanceId}:${item.pin}` === pad.dataset.pcbPad);
      if ($("#pcb-route-layer").value === "B.Cu" && routePad?.technology !== "through-hole") {
        state.pcbRouteHintKey = "pcbRouteBottomThroughHole";
        renderCanvas();
        return true;
      }
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
    const result = createPcbRoute(state.project, { startPad: state.pcbRouteDraft.startPad, endPad: pad.dataset.pcbPad, waypoints: state.pcbRouteDraft.pointsMm.slice(1), layer: $("#pcb-route-layer").value });
    if (result.status === "complete") {
      captureHistory();
      state.project = result.project;
      state.dirty = true;
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
      state.pcbRouteHintKey = result.code === "BOTTOM_LAYER_REQUIRES_THROUGH_HOLE" ? "pcbRouteBottomThroughHole" : "pcbRouteBlocked";
      renderCanvas();
      showDialog(t("pcbMenu"), `${t(state.pcbRouteHintKey)} (${result.code})`);
      log(`[PCB] Interactive route blocked: ${result.code}.`);
    }
    return true;
  }
  if (event.target.closest(".pcb-footprint-hit")) { event.preventDefault(); event.stopPropagation(); return true; }
  const svg = event.target.closest(".pcb-preview-svg");
  if (!svg || !state.pcbRouteDraft) return false;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return true;
  const viewPoint = canvasClientPoint({ x: event.clientX, y: event.clientY }, rect);
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

function handlePcbRouteKeydown(event) {
  if (!["Enter", " "].includes(event.key) || !event.target.closest?.("[data-pcb-pad]")) return false;
  return handlePcbRouteCanvasClick(event);
}

function handleAppMenuKeydown(event) {
  if (event.key !== "Escape") return false;
  const menu = document.querySelector(".app-menu[open]");
  if (!menu) return false;
  menu.open = false;
  menu.querySelector("summary").focus();
  event.preventDefault();
  return true;
}


document.addEventListener("click", (event) => {
  const suppressCanvasClick = state.suppressCanvasClick;
  state.suppressCanvasClick = false;
  if (suppressCanvasClick && event.target.closest("#design-canvas")) return;
  if(wireUi.click(event))return;
  if (state.placement && event.target.closest("#design-canvas")) {
    const point = canvasClientPoint({ x:event.clientX, y:event.clientY }, $("#design-canvas .canvas-scene").getBoundingClientRect());
    if (point) finishComponentPlacement(point);
    return;
  }
  document.querySelectorAll(".app-menu[open]").forEach((menu) => { if (!menu.contains(event.target)) menu.open = false; });
  if (pcbViaEditor.click(event)) return;
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
  if (event.target.closest("#design-canvas") && !event.target.closest("[data-instance-id], [data-schematic-endpoint], [data-wire-net], [data-resize-instance], [data-pcb-pad]") && !(state.breadboardPlacementMode && event.target.closest("[data-breadboard-hole]"))) {
    state.selectedInstanceId = null; state.selectedWire = null; state.selectedNetId = null;
    renderCanvas(); renderInspector();
  }
  const holeTarget = event.target.closest("[data-breadboard-hole]");
  if (holeTarget && state.breadboardPlacementMode && state.activeView === "breadboard") {
    const placed = assignBreadboardPin($("#breadboard-pin").value, holeTarget.dataset.breadboardHole);
    if (placed) { state.breadboardPlacementMode = false; render(); }
    return;
  }
  dismissMenuCommand(event.target);
  const libraryButton = event.target.closest("[data-library-id]");
  if (libraryButton) { state.selectedLibraryId = libraryButton.dataset.libraryId; renderLibrary(); beginComponentPlacement(state.selectedLibraryId); }
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.activeCategory = categoryButton.dataset.category;
    $$(".category-filter").forEach((button) => button.classList.toggle("active", button === categoryButton));
    renderLibrary();
  }
  const instanceButton = event.target.closest("[data-instance-id]");
  if (instanceButton) { state.selectedWire = null; state.selectedInstanceId = instanceButton.dataset.instanceId; setInspector("component"); render(); showBotWiringExplanation(state.selectedInstanceId); }
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) activateView(viewButton.dataset.view);
  const inspector = event.target.closest("[data-inspector]");
  if (inspector) setInspector(inspector.dataset.inspector);
  const outputTab = event.target.closest("[data-output]");
  if (outputTab) { state.activeOutput = outputTab.dataset.output; renderOutput(); }
  const tool = event.target.closest("[data-tool]");
  if (tool) {
    if (["select", "pan", "pcb-route"].includes(tool.dataset.tool)) state.placement = null;
    if (["zoom-in", "zoom-out", "fit"].includes(tool.dataset.tool)) { changeCanvasZoom(tool.dataset.tool); return; }
    if (["select", "pan"].includes(tool.dataset.tool)) { state.activeTool = tool.dataset.tool; state.pcbRouteDraft = null; state.pcbRouteHintKey = null; }
    if (tool.dataset.tool === "pcb-route") {
      if (state.activeTool === "pcb-route") { state.activeTool = "select"; state.pcbRouteDraft = null; state.pcbRouteHintKey = null; }
      else { activateView("pcb"); state.activeTool = "pcb-route"; state.pcbRouteDraft = null; state.pcbRouteHintKey = null; }
    }
    $$("[data-tool]").forEach((button) => button.classList.toggle("active", button === tool && !["zoom-in", "zoom-out"].includes(tool.dataset.tool)));
    if (["select", "pan", "pcb-route"].includes(tool.dataset.tool)) renderCanvas();
  }
  const collapse = event.target.closest("[data-collapse]");
  if (collapse) setWorkspacePanel(collapse.dataset.collapse === "library-panel" ? "left" : "right", false);
  const panelToggle = event.target.closest("[data-panel-toggle]");
  if (panelToggle) { const side = panelToggle.dataset.panelToggle; setWorkspacePanel(side, !state[side === "left" ? "leftBarOpen" : "rightBarOpen"]); }
});

document.addEventListener("keydown", (event) => {
  if (document.querySelector("dialog[open]")) return;
  if (isGlobalSearchShortcut(event)) {
    const editable = event.target.closest?.("input, textarea, select, [contenteditable='true']");
    if (!editable || event.target.id === "global-search") {
      event.preventDefault();
      if ($(".global-search").hidden) $("#global-search-toggle").click();
      else $("#global-search").focus();
      return;
    }
  }
  if (state.placement && event.key === "Escape") {
    event.preventDefault(); state.placement=null; updatePlacementPreview(); return;
  }
  if (state.placement && event.key.toLowerCase() === "r" && !event.target.closest?.("input, textarea, select, [contenteditable=true]")) {
    event.preventDefault(); state.placement=rotateComponentPlacement(state.placement);
    if (state.placement.point) state.placement=positionComponentPlacement(state.placement,state.placement.point,$("#snap-toggle").checked);
    updatePlacementPreview(); return;
  }
  if (handleAppMenuKeydown(event)) return;
  if(wireUi.keydown(event))return;
  if (pcbViaEditor.keydown(event)) return;
  if (handlePcbRouteKeydown(event)) return;
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
  const schematicTarget = event.target.closest?.("[data-schematic-endpoint], [data-wire-net]");
  if (schematicTarget && ["Enter", " "].includes(event.key)) { event.preventDefault(); schematicTarget.dispatchEvent(new MouseEvent("click", { bubbles: true })); return; }
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
    event.preventDefault(); deleteCanvasSelection();
  }
});

function deleteCanvasSelection(){
    if (deleteSelectedWire()) return;
    const component = selectedComponent();
    if (!component) return;
    captureHistory();
    state.project = removeComponent(state.project, component.instanceId);
    state.selectedInstanceId = state.project.components[0]?.instanceId ?? null;
    state.dirty = true;
    state.lastValidation = null;
    render();
    validateAndReport();
    log(`[REMOVE] Removed ${component.reference} and cleaned its net endpoints.`);
}

document.addEventListener("pointerdown", (event) => {
  if (pcbViaEditor.pointerDown(event)) return;
  if(wireUi.pointerDown(event))return;
  const canvas = event.target.closest("#design-canvas");
  if (!canvas || event.button !== 0 || state.placement) return;
  if (state.drag || event.isPrimary === false) { event.preventDefault?.(); return; }
  const component = event.target.closest(".placed-component");
  const pcbFootprint = state.activeView === "pcb" && state.activeTool === "select" ? event.target.closest(".pcb-footprint-hit") : null;
  const point = { x: event.clientX, y: event.clientY };
  if (state.activeTool === "pan") {
    state.drag = { mode: "pan", pointerId: event.pointerId, start: point, startPan: { ...state.pan }, canvas };
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    return;
  }
  if (pcbFootprint) {
    const svg = pcbFootprint.ownerSVGElement;
    state.drag = { mode: "move-pcb", pointerId: event.pointerId, instanceId: pcbFootprint.dataset.pcbFootprint, start: point, svg, canvas };
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    return;
  }
  const handle = event.target.closest("[data-resize-instance]");
  if (handle && state.activeView === "schematic" && state.activeTool === "select") {
    const item = selectedComponent(); if (!item) return;
    state.drag = { mode: "resize", pointerId: event.pointerId, instanceId: item.instanceId, start: point, startGeometry: schematicGeometry(item), startProject: state.project, startDirty: state.dirty, canvas };
    canvas.setPointerCapture?.(event.pointerId); event.preventDefault(); return;
  }
  if (component && state.activeTool === "select") {
    const item = state.project.components.find((candidate) => candidate.instanceId === component.dataset.instanceId);
    if (!item) return;
    state.drag = { mode: "move", pointerId: event.pointerId, instanceId: item.instanceId, start: point, startPosition: [...item.position[state.activeView]], startProject: state.project, startDirty: state.dirty, canvas };
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    return;
  }
});

document.addEventListener("pointermove", (event) => {
  if (pcbViaEditor.pointerMove(event)) return;
  if(wireUi.pointerMove(event))return;
  if (state.placement && event.target.closest?.("#design-canvas")) {
    updatePlacementPreview(canvasClientPoint({ x:event.clientX,y:event.clientY }, $("#design-canvas .canvas-scene").getBoundingClientRect()));
    return;
  }

  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const deltaX = event.clientX - state.drag.start.x;
  const deltaY = event.clientY - state.drag.start.y;
  if (state.drag.mode === "pan") {
    state.pan = { x: state.drag.startPan.x + deltaX, y: state.drag.startPan.y + deltaY };
    applyCanvasCamera();
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
  const delta = canvasClientDelta({ x: deltaX, y: deltaY }, state.drag.canvas.querySelector(".canvas-scene").getBoundingClientRect());
  if (!delta) return;
  if (state.drag.mode === "resize") {
    const width = Math.min(240, Math.max(28, state.drag.startGeometry.width + delta.x));
    const height = Math.min(180, Math.max(29, state.drag.startGeometry.height + delta.y));
    state.project = editComponentField(editComponentField(state.drag.startProject, state.drag.instanceId, "width", width), state.drag.instanceId, "height", height);
  } else {
    state.project = moveComponent(state.drag.startProject, state.drag.instanceId, state.activeView, [state.drag.startPosition[0] + delta.x, state.drag.startPosition[1] + delta.y], { snap: $("#snap-toggle").checked });
  }
  state.selectedInstanceId = state.drag.instanceId;
  state.dirty = true;
  renderCanvas(); renderInspector(); updateSaveState();
});

document.addEventListener("pointercancel", (event) => {
  if (pcbViaEditor.pointerEnd(event, true)) return;
  if(wireUi.pointerEnd(event,true))return;
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const drag = state.drag;
  state.drag = null;
  state.suppressCanvasClick = false;
  drag.canvas.releasePointerCapture?.(event.pointerId);
  if (drag.mode === "pan") state.pan = drag.startPan;
  if (drag.startProject) { state.project = drag.startProject; state.dirty = drag.startDirty; }
  renderCanvas(); renderInspector(); updateSaveState();
});

document.addEventListener("pointerup", (event) => {
  if (pcbViaEditor.pointerEnd(event)) return;
  if(wireUi.pointerEnd(event))return;
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const drag = state.drag;
  state.suppressCanvasClick = true;
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
  state.selectedWire = null;
    setInspector("component");
    if (result.status === "complete") {
      captureHistory();
      state.project = result.project;
      state.dirty = true;
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
  if (drag.mode === "resize") {
    const next = state.project;
    state.project = drag.startProject; state.dirty = drag.startDirty;
    commitComponentEdit(next); renderInspector(); return;
  }
  if (drag.mode !== "move") return;
  const delta = canvasClientDelta({ x: event.clientX - drag.start.x, y: event.clientY - drag.start.y }, drag.canvas.querySelector(".canvas-scene").getBoundingClientRect());
  state.selectedInstanceId = drag.instanceId;
  state.selectedWire = null;
  setInspector("component");
  if (!delta || Math.hypot(delta.x, delta.y) < 0.001) { if (drag.startProject) { state.project = drag.startProject; state.dirty = drag.startDirty; } renderCanvas(); renderInspector(); updateSaveState(); return; }
  const x = drag.startPosition[0] + delta.x;
  const y = drag.startPosition[1] + delta.y;
  if (drag.startProject) { state.project = drag.startProject; state.dirty = drag.startDirty; }
  captureHistory();
  state.project = moveComponent(state.project, drag.instanceId, state.activeView, [x, y], { snap: $("#snap-toggle").checked });
  state.selectedInstanceId = drag.instanceId;
  state.selectedWire = null;
  state.dirty = true;
  state.lastValidation = null;
  render();
});

$("#component-search").addEventListener("input", renderLibrary);
function globalSearchActions() {
  return [...document.querySelectorAll("button[data-action], button[data-view], #help-button")]
    .filter((button) => !button.disabled)
    .map((element) => ({
      element,
      label: element.getAttribute("aria-label") || element.title || element.textContent.trim(),
      keywords: element.dataset.globalSearchTerms || ""
    }))
    .filter((action) => action.label);
}
function activateGlobalSearchAction(query) {
  const normalized = query.trim().toLocaleLowerCase();
  const match = searchGlobalActions(globalSearchActions(), query).find((action) => action.label.toLocaleLowerCase() === normalized);
  if (!match) return false;
  $("#global-search").value = "";
  $("#global-search-actions").replaceChildren();
  $("#component-search").value = "";
  renderLibrary();
  $(".global-search").hidden = true;
  $("#global-search-toggle").setAttribute("aria-expanded", "false");
  match.element.click();
  return true;
}
$("#global-search").addEventListener("input", (event) => {
  const query = event.target.value;
  $("#component-search").value = query;
  renderLibrary();
  const matches = searchGlobalActions(globalSearchActions(), query);
  $("#global-search-actions").replaceChildren(...matches.map((action) => {
    const option = document.createElement("option");
    option.value = action.label;
    return option;
  }));
});
$("#add-component").addEventListener("click", () => placeLibraryComponent(state.selectedLibraryId));
$("#component-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const component = selectedComponent();
  if (!component) return;
  try {
    const referenced = editComponentField(state.project, component.instanceId, "reference", $("#property-reference").value);
    const next = editComponentField(referenced, component.instanceId, "value", $("#property-value").value);
    commitComponentEdit(next);
    validateAndReport();
  } catch (error) { $("#component-property-error").textContent = error.message; }
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
  state.lastValidation = null;
  render();
  validateAndReport();
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
  accountUi?.refreshLocale();
});
$("#grid-toggle").addEventListener("change", renderCanvas);
$("#feedback-live").addEventListener("change",()=>{renderCanvas();wireUi.paintMeasurements();});
$("#feedback-motion").addEventListener("change",renderCanvas);
$("#feedback-direction").addEventListener("change",renderCanvas);
window.addEventListener("pagehide",()=>dcFeedback.stop(false));
$("#pcb-route-layer").addEventListener("change", () => { state.pcbRouteDraft = null; state.pcbRouteHintKey = null; renderCanvas(); });
$("#run-simulation").addEventListener("click", () => handleAction("run-simulation"));
for(const input of $$("#nonlinear-dc-controls input, #ac-sweep-controls input, #ac-sweep-controls select, #linear-transient-controls input, #linear-transient-controls select, #linear-transient-controls textarea, #digital-event-controls input, #digital-event-controls select, #digital-event-controls textarea"))["input","change"].forEach(event=>input.addEventListener(event,()=>{stopSimulation();state.lastAnalysisProjectKey=null;}));
$("#simulation-analysis-mode").addEventListener("change", (event) => {
  stopSimulation();state.lastAnalysisProjectKey=null;
  $("#nonlinear-dc-controls").classList.toggle("hidden", event.target.value !== "nonlinear-dc");
  $("#ac-sweep-controls").classList.toggle("hidden", event.target.value !== "linear-ac");
  $("#linear-transient-controls").classList.toggle("hidden", event.target.value !== "linear-transient");
  $("#digital-event-controls").classList.toggle("hidden", event.target.value !== "digital-events");
});
$("#run-validation").addEventListener("click", validateAndReport);
$("#export-simulation-report").addEventListener("click", exportSimulationReport);
$("#load-example").addEventListener("click", async () => {
  const path = $("#example-picker").value;
  if (!path) return;
  const isCurrent = projectSession.beginLoad();
  try {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`The example request returned ${response.status}.`);
    const project = parseExampleProject(await response.text(),path);
    if (!isCurrent()) return;
    const analysis = project.releaseCandidateE2E
      ? await runReleaseCandidateE2E(project)
      : await createSimulationWorkerRun(project).promise;
    if (!canLoadExampleAnalysis(path,analysis)) throw new Error("The selected example does not pass its supported analysis check.");
    if (!isCurrent() || !await confirmDiscardChanges() || !isCurrent()) return;
    projectSession.reset(project, { dirty: true });
    state.lastAnalysis = analysis;
    $("#example-picker").value = path;
    state.selectedInstanceId = project.components.find((item) => item.libraryId === "passive.resistor")?.instanceId ?? project.components[0]?.instanceId ?? null;
    render();
    log(`[EXAMPLE] Loaded and validated ${project.metadata.name}.`);
    menuDismissal.complete($(".example-menu"));
  } catch (error) {
    if (!isCurrent()) return;
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
  if (event.key === "Escape") {
    $(".global-search").hidden = true;
    $("#global-search-toggle").setAttribute("aria-expanded", "false");
    $("#global-search-toggle").focus();
  }
  if (event.key === "Enter") {
    if (activateGlobalSearchAction(event.currentTarget.value)) event.preventDefault();
  }
});
$("#global-search").addEventListener("change", (event) => activateGlobalSearchAction(event.currentTarget.value));
$("#dialog-close").addEventListener("click", () => $("#status-dialog").close());
$("#recent-project-open").addEventListener("click", () => { void openSelectedRecentProject(); });
$("#recent-project-picker").addEventListener("change", () => {
  const enabled = Boolean($("#recent-project-picker").value);
  $("#recent-project-open").disabled = !enabled;
  $("#recent-project-remove").disabled = !enabled;
});
$("#recent-project-remove").addEventListener("click", () => { void removeSelectedRecentProject(); });
$("#bot-collapse").addEventListener("click", () => {
  const minimized = $("#bot").classList.toggle("minimized");
  $("#bot-collapse").setAttribute("aria-expanded", String(!minimized));
  $("#bot-collapse").textContent = minimized ? "+" : "−";
});
$("#bot-form").addEventListener("submit", (event) => { event.preventDefault(); answerBotFromSelection(); });
$("#bot-question-form").addEventListener("submit", (event) => { event.preventDefault(); answerBotQuestion(); });
$("#bot-live-toggle").addEventListener("change", (event) => {
  botLiveCopilot.setEnabled(event.target.checked);
  $("#bot-response").textContent = event.target.checked ? "Live checks are on. Suggestions use current project connections and library pin data." : "Live co-pilot is off. You can still ask Adigun BOT to explain the selected part.";
});
$("#bot-suggestion-accept").addEventListener("click", prepareBotSuggestionPreview);
$("#bot-suggestion-dismiss").addEventListener("click", () => { if (currentBotFinding) { const finding = currentBotFinding; botLiveCopilot.dismiss(finding.id); recordBotAuditEvent({ type: "suggestion-dismissed", findingId: finding.id }); } renderBotFinding(null); });
$("#bot-suggestion-more").addEventListener("click", () => { const detail = $("#bot-suggestion-detail"); detail.hidden = !detail.hidden; });
$("#bot-preview-apply").addEventListener("click", applyBotSuggestion);
$("#bot-preview-cancel").addEventListener("click", () => { if (currentBotPreview) recordBotAuditEvent({ type: "preview-cancelled", findingId: currentBotPreview.findingId, action: currentBotFinding?.action }); currentBotPreview = null; $("#bot-suggestion-preview").hidden = true; });
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
  const isCurrent = projectSession.beginLoad();
  try {
    const importedProject = parseProject(await file.text());
    if (!isCurrent() || !await confirmDiscardChanges() || !isCurrent()) return;
    projectSession.reset(importedProject, { dirty: true });
    log(`[IMPORTED] ${file.name} loaded after schema validation.`);
  } catch (error) {
    if (!isCurrent()) return;
    showDialog("Import blocked", error instanceof Error ? error.message : "The selected file is not a supported project.");
  } finally { event.target.value = ""; }
});

// Boot is deliberately empty; only explicit Open/Example actions load a design.
projectSession.clearTransient();
const componentPropertiesUi = createComponentPropertiesUi({
  form: $("#component-form"), getState: () => state, commit: updateNodeProps,
  customCommit: (id, rows, capture) => commitComponentEdit(editCustomProperties(state.project, id, rows), capture)
});
render();

let accountUi;
const accountClient = createAccountClient();
const accountSession = createAccountSession(accountClient, {
  onState: accountState => accountUi?.renderState(accountState),
  getRedirectUrl: () => `${window.location.origin}${window.location.pathname}`
});
const cloudProjectsUi = createCloudProjectsUi({
  document,
  account: accountSession,
  store: createCloudProjectStore(accountClient, { getUserId: () => accountSession.state.user?.id }),
  translate,
  getLocale: () => state.project.metadata.locale,
  getProject: () => state.project,
  onSaved: () => {
    projectSession.markSaved("cloud");
    updateSaveState();
    log("[CLOUD SAVED] The current project was explicitly saved to your account.");
  },
  onOpenDocument: async (documentData, { source, version }) => {
    let project;
    try { project = parseProject(JSON.stringify(documentData)); }
    catch { showDialog(t("cloudProjectsTitle"), t("cloudInvalidProject")); return; }
    const isCurrent = projectSession.beginLoad();
    if (!await confirmDiscardChanges() || !isCurrent()) return;
    projectSession.reset(project, { saved: "cloud", currentProjectId: project.id });
    componentPropertiesUi.resetSession();
    updateSaveState();
    log(source === "cloud-revision"
      ? `[CLOUD OPENED] Opened version ${version} as a local working copy; cloud data was not changed.`
      : `[CLOUD OPENED] Opened cloud project version ${version}.`);
  }
});
accountUi = createAccountUi({
  document,
  account: accountSession,
  translate,
  getLocale: () => state.project.metadata.locale,
  onCloudSave: () => cloudProjectsUi.openSaveDialog?.(),
  onCloudManage: () => cloudProjectsUi.openManager?.(),
  onAccountState: accountState => cloudProjectsUi.renderState(accountState)
});
void accountSession.initialize();
window.addEventListener("pagehide", () => { accountUi.dispose(); cloudProjectsUi.dispose(); }, { once: true });

const disposeDrawMenu=attachDrawMenu($("#draw-menu"),beginComponentPlacement);
window.addEventListener("pagehide",event=>{if(!event.persisted)disposeDrawMenu();});

document.addEventListener("dragstart", event => {
  const part = event.target.closest?.("[data-library-id]");
  if (!part || !findLibraryPart(part.dataset.libraryId)) return;
  state.placement=null; updatePlacementPreview();
  event.dataTransfer.setData("application/x-adigun-component", part.dataset.libraryId);
  event.dataTransfer.effectAllowed = "copy";
});
$("#design-canvas").addEventListener("dragover", event => {
  if (![...event.dataTransfer.types].includes("application/x-adigun-component")) return;
  event.preventDefault(); event.dataTransfer.dropEffect = "copy";
});
$("#design-canvas").addEventListener("drop", event => {
  const id = event.dataTransfer.getData("application/x-adigun-component");
  if (!findLibraryPart(id)) return;
  event.preventDefault();
  const point = canvasClientPoint({ x: event.clientX, y: event.clientY }, $("#design-canvas .canvas-scene").getBoundingClientRect());
  if (point) placeLibraryComponent(id, point);
});
$("#design-canvas").addEventListener("contextmenu", event => {
  if (state.placement) { event.preventDefault(); state.placement=null; updatePlacementPreview(); return; }
  if (!state.schematicWireMode) return;
  event.preventDefault(); wireUi.pause();
});

const menuDismissal = attachMenuDismissal($$(".app-menu"), { onActiveChange: key => { state.openMenuKey = key; } });
window.addEventListener("pagehide", event => { if (event.persisted) menuDismissal.clearPending(); else menuDismissal.dispose(); });

const canvasResizeObserver = new ResizeObserver(applyCanvasCamera);
canvasResizeObserver.observe($("#design-canvas"));
canvasResizeObserver.observe($("#schematic-mini"));
projectSession.install(window, { onLeave: (event) => {
  const simulation = state.activeSimulation;
  state.activeSimulation = null;
  simulation?.cancel();
  if (!event.persisted) canvasResizeObserver.disconnect();
} });

