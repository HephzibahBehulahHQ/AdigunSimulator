import { createEmptyProject, serializeProject } from "./core.mjs";

// Only this legacy transient key is disposable. Manual saves remain reopenable.
export const PROJECT_STORAGE_KEY = "adigun-simulator.project.v1";
export const TRANSIENT_PROJECT_KEYS = ["adigun-simulator.recovery.v1"];

export function createProjectSession(state, { storage, onReset = () => {} } = {}) {
  let revision = 0;
  function clearTransient() {
    try {
      const target = storage();
      for (const key of TRANSIENT_PROJECT_KEYS) target.removeItem(key);
      return true;
    } catch { return false; } // Privacy mode must not prevent a blank boot/reset.
  }
  function invalidateLoads() { revision++; }
  function beginLoad() {
    const ticket = ++revision;
    const snapshot = serializeProject(state.project);
    return () => ticket === revision && snapshot === serializeProject(state.project);
  }
  function reset(project = createEmptyProject({ locale: state.project?.metadata.locale ?? "en" }), { dirty = false, saved = "empty", currentProjectId = null } = {}) {
    invalidateLoads();
    const simulation = state.activeSimulation;
    state.activeSimulation = null;
    simulation?.cancel();
    Object.assign(state, {
      project, currentProjectId, dirty, savedDisposition: saved,
      selectedInstanceId: null, selectedLibraryId: null, selectedEvidencePartId: null,
      selectedNetId: null, selectedWire: null, wireCursor: null, placement: null, history: [], future: [], pan: { x: 0, y: 0 }, scale: 1,
      drag: null, activeTool: "select", activeView: "breadboard",
      activeInspector: "component", activeOutput: "output", lastAnalysis: null,
      lastValidation: null, botUnsavedOnly: false, breadboardSyncPreview: null,
      breadboardPlacementMode: false, schematicWireMode: false, schematicWireStart: null,
      pcbRouteDraft: null, pcbSelectedViaId: null, pcbViaDraft: null, pcbRouteHintKey: null
    });
    clearTransient();
    onReset();
  }
  function markSaved(disposition) {
    invalidateLoads();
    state.dirty = false;
    state.botUnsavedOnly = false;
    state.savedDisposition = disposition;
    if (disposition === "local") state.currentProjectId = state.project.id;
    clearTransient();
  }
  function install(target, { onLeave = () => {} } = {}) {
    const beforeUnload = (event) => {
      if (!state.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const pageHide = (event) => {
      // A cancelled beforeunload never reaches pagehide. Hiding a tab is not leaving.
      clearTransient();
      invalidateLoads();
      onLeave(event);
      if (!event.persisted) dispose();
    };
    const pageShow = (event) => { if (event.persisted) reset(); };
    function dispose() {
      target.removeEventListener("beforeunload", beforeUnload);
      target.removeEventListener("pagehide", pageHide);
      target.removeEventListener("pageshow", pageShow);
    }
    target.addEventListener("beforeunload", beforeUnload);
    target.addEventListener("pagehide", pageHide);
    target.addEventListener("pageshow", pageShow);
    return dispose;
  }
  return { reset, markSaved, beginLoad, invalidateLoads, clearTransient, install };
}

export function confirmProjectReplacement({ state, dialog }) {
  if (!state.dirty) return Promise.resolve(true);
  if (dialog.open) return Promise.resolve(false);
  return new Promise((resolve) => {
    dialog.returnValue = "cancel";
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "discard"), { once: true });
    dialog.showModal();
  });
}
