import { parseExampleProject, canLoadExampleAnalysis } from './js/example-loading.mjs';
import { isGlobalSearchShortcut, searchGlobalActions } from "./js/global-search.mjs";
import { createExampleBrowser } from './js/example-bank-ui.mjs';
import { createDesignTools } from "./js/design-tools-ui.mjs";
import { createCanvasExperience } from './js/canvas-experience.mjs';
import { ladderSettings, ladderUiText, ladderValueLabel } from './js/ladder-components.mjs';
import { wirePaint } from "./js/project-appearance.mjs";
import { createSchematicWireUi } from "./js/schematic-wire-ui.mjs";
import { createCrossingPainter } from "./js/wire-crossings.mjs";
import { STARTER_LIBRARY, addComponent, connectPins, createEmptyProject, disconnectPin, findLibraryPart, getViewReconciliationIssues, moveComponent, removeComponent, parseProject, serializeProject, updateComponent, validateProject } from "./js/core.mjs";
import { TRANSLATIONS, translate } from "./js/i18n.mjs";
import { BREADBOARD_MODEL, breadboardHoleIds, breadboardHolePoint, breadboardPackagePlacement, deriveBreadboardSchematicNets, normalizeBreadboardHole, validateBreadboardTopology } from "./js/breadboard-topology.mjs";
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























import { projectComponentsForView } from "./js/view-projection.mjs";









import { exportBomCsv, runBomExportPlaceholder } from "./js/bom-report.mjs";
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

f