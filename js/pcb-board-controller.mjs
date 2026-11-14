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
    const input = Object.fromEntries($$("[data-board-field]").map((field) => {
      const key = field.dataset.boardField;
      if (key === "copperLayers") return [key, field.value.split(",")];
      if (key === "outlineType" || key === "outlinePoints") return [key, field.value];
      return [key, Number(field.value)];
    }));
    if (input.outlineType) {
      if (input.outlineType === "rectangle") input.outline = "rectangle";
      else if (input.outlineType === "polygon") input.outline = { type: "polygon", pointsMm: input.outlinePoints.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
        const trimmed = line.trim();
        const values = trimmed.includes(",") ? trimmed.split(",").map((value) => value.trim()) : trimmed.split(/\s+/);
        return values.length === 2 ? values.map((value) => value === "" ? Number.NaN : Number(value)) : [Number.NaN, Number.NaN];
      }) };
    }
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
