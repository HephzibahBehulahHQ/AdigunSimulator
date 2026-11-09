import { pcbBoardDefaults, updatePcbBoard } from "./pcb-board.mjs";
import { validatePcbFabrication } from "./pcb-export.mjs";

export function createPcbBoardEditor({ state, $, $$, t, captureHistory, render, activateView, log }) {
  const dialog = $("#pcb-board-dialog"), form = $("#pcb-board-form");
  let openedProject = null;
  function action(name) {
    if (name !== "pcb-board-setup") return false;
    const values = pcbBoardDefaults(state.project);
    for (const field of $$("[data-board-field]")) field.value = field.dataset.boardField === "copperLayers" ? values.copperLayers.join(",") : values[field.dataset.boardField];
    $("#pcb-board-error").textContent = "";
    openedProject = state.project;
    dialog.showModal();
    return true;
  }
  $("#pcb-board-cancel").addEventListener("click", () => dialog.close());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.project !== openedProject) { $("#pcb-board-error").textContent = t("pcbBoardStale"); return; }
    const input = Object.fromEntries($$("[data-board-field]").map((field) => [field.dataset.boardField, field.dataset.boardField === "copperLayers" ? field.value.split(",") : Number(field.value)]));
    const result = updatePcbBoard(state.project, input);
    if (result.status === "blocked") { $("#pcb-board-error").textContent = `${t("pcbBoardBlocked")} ${result.errors.join(" ")}`; return; }
    if (result.status === "unchanged") { dialog.close(); return; }
    captureHistory();
    state.project = result.project;
    state.dirty = true;
    state.lastValidation = null;
    state.pcbRouteDraft = null;
    state.pcbRouteHintKey = null;
    state.pcbViaDraft = null;
    state.activeTool = "select";
    dialog.close();
    activateView("pcb");
    render();
    const check = validatePcbFabrication(state.project);
    log(`[PCB BOARD] ${t("pcbBoardApplied")} ${check.status === "passed" ? "Bounded PCB checks passed." : `PCB checks blocked: ${check.errors.join(" ")}`}`);
  });
  return { action };
}
