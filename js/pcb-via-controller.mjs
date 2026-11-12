import { savePcbVia, removePcbVia } from "./pcb-via-edit.mjs";
import { canvasClientPoint } from "./canvas-camera.mjs";
import { pcbPreviewPointToBoardMm } from "./pcb-preview.mjs";

export function createPcbViaEditor({ state, $, $$, t, escape, renderCanvas, render, activateView, captureHistory, validateAndReport, showDialog, log }) {
  let drag = null;
  function refresh() {
    const pcb = state.project.pcbFabrication, board = pcb?.board;
    const enabled = Boolean(Array.isArray(board?.copperLayers) && board.copperLayers.length === 2 && board.copperLayers[0] === "F.Cu" && board.copperLayers[1] === "B.Cu");
    $("#pcb-via-editor").classList.toggle("hidden", state.activeView !== "pcb" || !board);
    $$('[data-action="pcb-via-new"]').forEach((button) => { button.disabled = !enabled; });
    $("#pcb-via-fields").disabled = !enabled;
    const vias = Array.isArray(pcb?.vias) ? pcb.vias : [];
    const selected = vias.find((via) => via.id === state.pcbSelectedViaId);
    if (!selected && state.pcbSelectedViaId) { state.pcbSelectedViaId = null; state.pcbViaDraft = null; }
    state.pcbViaDraft ??= selected ? { ...selected } : { netId: state.project.nets.find((net) => net.id !== "NC")?.id ?? "", xMm: (board?.widthMm ?? 0) / 2, yMm: (board?.heightMm ?? 0) / 2, diameterMm: 0.6, drillMm: 0.3 };
    $("#pcb-via-picker").innerHTML = `<option value="">${escape(t("pcbViaNew"))}</option>${vias.map((via) => `<option value="${escape(via.id)}">${escape(via.id)} · ${escape(via.netId)}</option>`).join("")}`;
    $("#pcb-via-picker").value = selected?.id ?? "";
    $("#pcb-via-net").innerHTML = state.project.nets.filter((net) => net.id !== "NC").map((net) => `<option value="${escape(net.id)}">${escape(net.id)}</option>`).join("");
    $("#pcb-via-net").disabled = Boolean(selected);
    $$("[data-via-field]").forEach((field) => { field.value = state.pcbViaDraft[field.dataset.viaField]; });
    $("#pcb-via-remove").disabled = !selected;
    $("#pcb-via-pick").setAttribute("aria-pressed", String(state.activeTool === "pcb-via"));
    $("#pcb-via-hint").textContent = t(!enabled ? "pcbViaTwoLayers" : state.activeTool === "pcb-via" ? "pcbViaPickHint" : "pcbViaNote");
    $$("#design-canvas .pcb-via").forEach((element) => {
      const active = element.dataset.pcbPad === `@via:${selected?.id}`;
      element.classList.toggle("is-selected", active);
      element.setAttribute("aria-pressed", String(active));
    });
  }
  function select(id) {
    state.pcbSelectedViaId = id || null;
    state.selectedInstanceId = null;
    state.pcbViaDraft = null;
    state.activeTool = "select";
    state.pcbRouteDraft = null;
    state.pcbRouteHintKey = null;
    render();
  }
  function commit(result, removed = false) {
    if (result.status === "blocked") { showDialog(t("pcbViaTitle"), `${t("pcbViaBlocked")} (${result.code})${result.errors?.length ? "\n" + result.errors.join("\n") : ""}`); return; }
    if (result.status === "unchanged") return;
    captureHistory();
    state.project = result.project;
    state.dirty = true;
    state.recoveryActive = true;
    state.lastValidation = null;
    state.pcbSelectedViaId = removed ? null : result.viaId;
    state.selectedInstanceId = null;
    state.pcbViaDraft = null;
    state.pcbRouteDraft = null;
    state.pcbRouteHintKey = null;
    state.activeTool = "select";
    render();
    validateAndReport();
    log(`[PCB VIA] ${result.viaId}: ${removed ? "removed; copper retained" : "saved"}. Run PCB checks before export.`);
  }
  function click(event) {
    if (state.activeView !== "pcb") return false;
    if (state.activeTool === "select") {
      const target = event.target.closest?.("#design-canvas .pcb-via");
      if (!target) return false;
      const id = target.dataset.pcbPad.slice(5);
      select(id);
      $$("#design-canvas .pcb-via").find((element) => element.dataset.pcbPad === `@via:${id}`)?.focus();
      return true;
    }
    if (state.activeTool !== "pcb-via") return false;
    const svg = event.target.closest?.("#design-canvas .pcb-preview-svg");
    if (!svg) return false;
    const point = pcbPreviewPointToBoardMm(state.project, canvasClientPoint({ x: event.clientX, y: event.clientY }, svg.getBoundingClientRect()));
    if (!point) return true;
    if ($("#snap-toggle").checked) { point[0] = Math.round(point[0] * 2) / 2; point[1] = Math.round(point[1] * 2) / 2; }
    state.pcbViaDraft = { ...state.pcbViaDraft, xMm: point[0], yMm: point[1] };
    state.activeTool = "select";
    renderCanvas();
    $("#pcb-via-x").focus();
    return true;
  }
  function pointerDown(event) {
    if (drag) { event.preventDefault?.(); return true; }
    if (state.activeView !== "pcb" || state.activeTool !== "select" || event.button !== 0) return false;
    const target = event.target.closest?.("#design-canvas .pcb-via");
    if (!target) return false;
    if (event.isPrimary === false) { event.preventDefault?.(); return true; }
    const id = target.dataset.pcbPad?.startsWith("@via:") ? target.dataset.pcbPad.slice(5) : null;
    const via = state.project.pcbFabrication?.vias?.find((item) => item.id === id);
    const canvas = target.closest?.("#design-canvas"), svg = target.ownerSVGElement;
    if (!via || !canvas || !svg) return false;
    state.pcbSelectedViaId = id;
    state.selectedInstanceId = null;
    drag = { id, via, pointerId: event.pointerId, start: { x: event.clientX, y: event.clientY }, before: state.project, dirty: state.dirty, canvas, rect: svg.getBoundingClientRect(), moved: false };
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
    return true;
  }
  function pointFromPointer(active, event) {
    const viewPoint = canvasClientPoint({ x: event.clientX, y: event.clientY }, active.rect);
    const point = pcbPreviewPointToBoardMm(active.before, viewPoint);
    if (!point) return null;
    if ($("#snap-toggle").checked) { point[0] = Math.round(point[0] * 2) / 2; point[1] = Math.round(point[1] * 2) / 2; }
    else { point[0] = Math.round(point[0] * 1000) / 1000; point[1] = Math.round(point[1] * 1000) / 1000; }
    return point;
  }
  function pointerMove(event) {
    if (!drag || drag.pointerId !== event.pointerId) return false;
    if (!drag.moved && Math.hypot(event.clientX - drag.start.x, event.clientY - drag.start.y) < 4) return true;
    drag.moved = true;
    const point = pointFromPointer(drag, event);
    if (!point) return true;
    const result = savePcbVia(drag.before, { ...drag.via, xMm: point[0], yMm: point[1] });
    if (result.status === "complete") {
      state.project = result.project;
      state.dirty = true;
      renderCanvas();
    }
    return true;
  }
  function pointerEnd(event, cancelled = false) {
    if (!drag || drag.pointerId !== event.pointerId) return false;
    const active = drag;
    drag = null;
    active.canvas.releasePointerCapture?.(event.pointerId);
    if (!active.moved) {
      if (!cancelled) {
        state.suppressCanvasClick = true;
        select(active.id);
        $$("#design-canvas .pcb-via").find((element) => element.dataset.pcbPad === `@via:${active.id}`)?.focus();
      }
      return true;
    }
    state.suppressCanvasClick = !cancelled;
    state.project = active.before;
    state.dirty = active.dirty;
    if (cancelled) { render(); return true; }
    const point = pointFromPointer(active, event);
    const result = point ? savePcbVia(active.before, { ...active.via, xMm: point[0], yMm: point[1] }) : { status: "blocked", code: "INVALID_COORDINATE" };
    if (result.status === "complete") commit(result);
    else {
      render();
      if (result.status === "blocked") showDialog(t("pcbViaTitle"), `${t("pcbViaBlocked")} (${result.code})${result.errors?.length ? "\n" + result.errors.join("\n") : ""}`);
    }
    return true;
  }
  function keydown(event) {
    if (event.key === "Escape" && drag) { event.preventDefault(); pointerEnd({ pointerId: drag.pointerId }, true); return true; }
    const nudge = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (nudge && state.activeView === "pcb" && state.activeTool === "select") {
      const target = event.target.closest?.("#design-canvas .pcb-via");
      const id = target?.dataset.pcbPad?.startsWith("@via:") ? target.dataset.pcbPad.slice(5) : null;
      const via = state.project.pcbFabrication?.vias?.find((item) => item.id === id);
      if (!via) return false;
      event.preventDefault();
      const step = $("#snap-toggle").checked ? 0.5 : 0.1;
      const moved = savePcbVia(state.project, {
        ...via,
        xMm: Math.round((Number(via.xMm) + nudge[0] * step) * 1000) / 1000,
        yMm: Math.round((Number(via.yMm) + nudge[1] * step) * 1000) / 1000,
      });
      commit(moved);
      if (moved.status === "complete") $$("#design-canvas .pcb-via").find((element) => element.dataset.pcbPad === `@via:${id}`)?.focus();
      return true;
    }
    if (["Delete", "Backspace"].includes(event.key) && state.activeView === "pcb" && state.activeTool === "select") {
      const target = event.target.closest?.("#design-canvas .pcb-via");
      if (target) { event.preventDefault(); commit(removePcbVia(state.project, target.dataset.pcbPad.slice(5)), true); return true; }
    }
    if (["Enter", " "].includes(event.key) && state.activeView === "pcb" && state.activeTool === "select" && event.target.closest?.("#design-canvas .pcb-via")) { event.preventDefault(); return click(event); }
    if (event.key === "Escape" && state.activeTool === "pcb-via") { event.preventDefault(); state.activeTool = "select"; renderCanvas(); return true; }
    return false;
  }
  function action(name) {
    if (name === "pcb-via-new") { activateView("pcb"); select(null); $("#pcb-via-net").focus(); return true; }
    if (name === "pcb-via-pick") { state.activeTool = state.activeTool === "pcb-via" ? "select" : "pcb-via"; state.pcbRouteDraft = null; renderCanvas(); return true; }
    if (name === "pcb-via-remove") { commit(removePcbVia(state.project, state.pcbSelectedViaId), true); return true; }
    return false;
  }
  $("#pcb-via-picker").addEventListener("change", (event) => select(event.target.value));
  $("#pcb-via-form").addEventListener("input", (event) => { if (event.target.dataset.viaField) state.pcbViaDraft[event.target.dataset.viaField] = event.target.value; });
  $("#pcb-via-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries($$("[data-via-field]").map((field) => [field.dataset.viaField, field.dataset.viaField === "netId" ? field.value : Number(field.value)]));
    commit(savePcbVia(state.project, { ...values, id: state.pcbSelectedViaId }));
  });
  return { refresh, click, keydown, action, pointerDown, pointerMove, pointerEnd };
}
