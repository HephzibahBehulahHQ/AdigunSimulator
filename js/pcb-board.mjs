import { boardOutlineContainsBox, boardOutlineContainsCircle, boardOutlineContainsSegment, boardOutlineDefinitionErrors } from "./pcb-outline.mjs";
const EPS = 1e-9;
const positive = (value) => Number.isFinite(value) && value > 0;
export function supportedBoardLayers(layers) {
  return Array.isArray(layers) && (layers.length === 1 && layers[0] === "F.Cu" || layers.length === 2 && layers[0] === "F.Cu" && layers[1] === "B.Cu");
}

export function boardDefinitionErrors(board) {
  if (!board) return ["Board setup is missing."];
  const errors = [];
  for (const key of ["widthMm", "heightMm", "minimumClearanceMm"]) if (!positive(board[key])) errors.push(`Board ${key} must be a positive millimetre value.`);
  for (const key of ["thicknessMm", "minimumTraceWidthMm"]) if (board[key] !== undefined && !positive(board[key])) errors.push(`Board ${key} must be a positive millimetre value.`);
  if (positive(board.widthMm) && positive(board.heightMm)) errors.push(...boardOutlineDefinitionErrors(board));
  if (!supportedBoardLayers(board.copperLayers)) errors.push("Copper layers must be F.Cu, optionally followed by B.Cu.");
  return errors;
}

// A net class may tighten, but never lower, a board-wide width floor.
export function minimumPcbTraceWidth(pcb, netId, fallback = 0) {
  if (pcb.netClasses !== undefined && (!Array.isArray(pcb.netClasses) || pcb.netClasses.some((item) => !item || !Array.isArray(item.netIds)))) return Number.NaN;
  const values = [pcb.board?.minimumTraceWidthMm, ...(pcb.netClasses ?? []).filter((item) => item.netIds?.includes(netId)).map((item) => Object.hasOwn(item, "minimumWidthMm") ? item.minimumWidthMm : item.traceWidthMm)].filter((value) => value !== undefined);
  if (values.some((value) => !positive(value))) return Number.NaN;
  return values.length ? Math.max(...values) : fallback;
}

export function boardGeometryErrors(pcb) {
  const errors = [], board = pcb.board;
  const definitionErrors = boardDefinitionErrors(board);
  if (definitionErrors.length) return definitionErrors;
  for (const key of ["pads", "routes", "vias", "keepouts", "copperZones", "mechanicalFeatures"]) if (pcb[key] !== undefined && (!Array.isArray(pcb[key]) || pcb[key].some((item) => !item || typeof item !== "object"))) return [`PCB ${key} must be an array of records.`];
  for (const pad of [...(pcb.pads ?? []), ...(pcb.vias ?? []).map((via) => ({ ...via, technology: "through-hole", reference: `Via ${via.id}` }))]) {
    const hx = pad.technology === "through-hole" ? pad.diameterMm / 2 : pad.widthMm / 2;
    const hy = pad.technology === "through-hole" ? hx : pad.heightMm / 2;
    const fits = pad.technology === "through-hole" ? boardOutlineContainsCircle(board, pad.xMm, pad.yMm, hx) : boardOutlineContainsBox(board, pad.xMm, pad.yMm, hx, hy);
    if (!fits) errors.push(`Copper pad ${pad.reference ?? pad.instanceId ?? "unknown"} leaves the board outline or has invalid dimensions.`);
  }
  for (const route of pcb.routes ?? []) {
    if (!positive(route.widthMm) || !Array.isArray(route.pointsMm) || route.pointsMm.length < 2 || route.pointsMm.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)) || route.pointsMm.slice(1).some((point, index) => !boardOutlineContainsSegment(board, route.pointsMm[index], point, route.widthMm / 2))) errors.push(`Route ${route.netId} copper leaves the board outline or has invalid dimensions.`);
    if (!board.copperLayers.includes(route.layer)) errors.push(`Route ${route.netId} occupies an undeclared copper layer.`);
  }
  if (pcb.vias?.length && board.copperLayers.length !== 2) errors.push("Remove plated vias before removing B.Cu.");
  const boxes = [...(pcb.keepouts ?? []), ...(pcb.copperZones ?? []).map((zone) => ({ ...zone.bounds, id: zone.id }))];
  for (const box of boxes) if (![box.xMm, box.yMm, box.widthMm, box.heightMm].every(Number.isFinite) || box.widthMm <= 0 || box.heightMm <= 0 || !boardOutlineContainsBox(board, box.xMm + box.widthMm / 2, box.yMm + box.heightMm / 2, box.widthMm / 2, box.heightMm / 2)) errors.push(`Keep-out/zone ${box.id ?? "unknown"} leaves the board outline.`);
  for (const zone of pcb.copperZones ?? []) if (!board.copperLayers.includes(zone.layer)) errors.push(`Zone ${zone.id} occupies an undeclared copper layer.`);
  for (const feature of pcb.mechanicalFeatures ?? []) {
    if (feature.type === "mounting-hole") {
      const radius = Math.max(feature.diameterMm ?? feature.drillMm, feature.drillMm) / 2 + (feature.requiredEdgeClearanceMm ?? 0);
      if (!boardOutlineContainsCircle(board, feature.xMm, feature.yMm, radius)) errors.push(`Mounting hole ${feature.id} violates the board edge allowance.`);
    } else if (feature.type === "edge-cutout") {
      if (board.outline?.type === "polygon") { errors.push(`Edge cut-out ${feature.id} is not supported on polygonal board outlines.`); continue; }
      const side = feature.openingSide;
      const onEdge = side === "top" ? Math.abs(feature.yMm) <= EPS : side === "left" ? Math.abs(feature.xMm) <= EPS : side === "bottom" ? Math.abs(feature.yMm + feature.heightMm - board.heightMm) <= EPS : side === "right" && Math.abs(feature.xMm + feature.widthMm - board.widthMm) <= EPS;
      if (!onEdge || !boardOutlineContainsBox(board, feature.xMm + feature.widthMm / 2, feature.yMm + feature.heightMm / 2, feature.widthMm / 2, feature.heightMm / 2)) errors.push(`Edge cut-out ${feature.id} no longer meets its declared board edge.`);
    } else errors.push(`Mechanical feature ${feature.id ?? "unknown"} cannot be checked by this board editor.`);
  }
  return errors;
}

export function pcbBoardDefaults(project) {
  const pcb = project?.pcbFabrication, board = pcb?.board;
  const widths = (Array.isArray(pcb?.routes) ? pcb.routes : []).map((route) => route?.widthMm).filter(positive);
  return { widthMm: board?.widthMm ?? 50, heightMm: board?.heightMm ?? 30, thicknessMm: board?.thicknessMm ?? 1.6,
    copperLayers: board?.copperLayers ?? ["F.Cu", "B.Cu"], minimumClearanceMm: board?.minimumClearanceMm ?? 0.2,
    minimumTraceWidthMm: board?.minimumTraceWidthMm ?? (widths.length ? Math.min(...widths) : 0.25) };
}

export function updatePcbBoard(project, input) {
  const previous = project?.pcbFabrication;
  if (!project || !Array.isArray(project.components) || !Array.isArray(project.nets)) return { status: "blocked", errors: ["A native project is required."] };
  if (previous && (!previous.board || !supportedBoardLayers(previous.board.copperLayers) || previous.stackup)) return { status: "blocked", errors: ["This editor supports rectangular or polygonal F.Cu or F.Cu/B.Cu boards without a detailed stackup. Polygon vertices are preserved but cannot be edited here."] };
  const required = ["widthMm", "heightMm", "thicknessMm", "minimumClearanceMm", "minimumTraceWidthMm"];
  if (!input || required.some((key) => !positive(input[key]))) return { status: "blocked", errors: ["All board dimensions and rule values must be positive millimetres."] };
  const board = { ...(previous?.board ?? { outline: "rectangle" }), ...Object.fromEntries(required.map((key) => [key, input[key]])), copperLayers: input.copperLayers };
  const errors = boardDefinitionErrors(board);
  if (errors.length) return { status: "blocked", errors };
  const pcb = { parts: [], pads: [], routes: [], ...previous, board };
  for (const key of ["parts", "pads", "routes", "vias", "keepouts", "copperZones", "mechanicalFeatures", "netClasses"]) if (pcb[key] !== undefined && (!Array.isArray(pcb[key]) || pcb[key].some((item) => !item || typeof item !== "object"))) return { status: "blocked", errors: [`PCB ${key} must be an array of records.`] };
  const geometryErrors = boardGeometryErrors(pcb);
  if (geometryErrors.length) return { status: "blocked", errors: geometryErrors };
  if (previous && JSON.stringify(previous.board) === JSON.stringify(board)) return { status: "unchanged", project };
  const next = structuredClone(project);
  next.pcbFabrication = structuredClone(pcb);
  next.metadata = { ...next.metadata, updatedAt: new Date().toISOString() };
  return { status: "complete", project: next };
}
