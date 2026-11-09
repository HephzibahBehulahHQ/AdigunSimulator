import { pcbCopperPads, validatePcbVias } from "./pcb-vias.mjs";
import { auditPcbCopper, netPairClearance, pointSegmentDistance, segmentPadGap } from "./pcb-copper.mjs";

export function savePcbVia(project, input = {}) {
  const pcb = project?.pcbFabrication;
  if (!pcb?.board || !Array.isArray(pcb.pads) || !Array.isArray(pcb.routes) || (pcb.vias !== undefined && !Array.isArray(pcb.vias))) return { status: "blocked", code: "NO_PCB_DATA" };
  const existing = input.id ? (pcb.vias ?? []).find((via) => via.id === input.id) : null;
  if (input.id && !existing) return { status: "blocked", code: "UNKNOWN_VIA" };
  if (existing && input.netId !== existing.netId) return { status: "blocked", code: "VIA_NET_CHANGE" };
  let id = existing?.id;
  if (!id) { let number = 1; while ((pcb.vias ?? []).some((via) => via.id === `via-${number}`)) number++; id = `via-${number}`; }
  const via = { id, netId: input.netId, xMm: input.xMm, yMm: input.yMm, diameterMm: input.diameterMm, drillMm: input.drillMm };
  const next = structuredClone(project);
  next.pcbFabrication.vias = existing ? next.pcbFabrication.vias.map((item) => item.id === id ? { ...item, ...via } : item) : [...(next.pcbFabrication.vias ?? []), via];
  const errors = validatePcbVias(next.pcbFabrication, new Set((project.nets ?? []).map((net) => net.id)));
  if (errors.length) return { status: "blocked", code: "INVALID_VIA", errors };
  if (existing && ["netId", "xMm", "yMm", "diameterMm", "drillMm"].every((key) => existing[key] === via[key])) return { status: "unchanged", project, viaId: id };
  let updatedRoutePoints = 0;
  const anchor = existing ?? via, origin = [anchor.xMm, anchor.yMm];
  const near = (point) => Math.hypot(point[0] - origin[0], point[1] - origin[1]) <= 0.001;
  const move = (point) => {
    if (!existing || !near(point)) return point;
    updatedRoutePoints++;
    return [point[0] + via.xMm - anchor.xMm, point[1] + via.yMm - anchor.yMm];
  };
  next.pcbFabrication.routes = next.pcbFabrication.routes.map((route) => {
    if (route?.netId !== via.netId || !Array.isArray(route.pointsMm) || !route.pointsMm.every((p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))) return route;
    const pointsMm = [];
    route.pointsMm.forEach((point, i) => {
      pointsMm.push(move(point));
      const end = route.pointsMm[i + 1];
      if (end && !near(point) && !near(end) && pointSegmentDistance(origin, point, end) <= 0.001) { pointsMm.push([via.xMm, via.yMm]); updatedRoutePoints++; }
    });
    return { ...route, pointsMm };
  });
  const issues = auditPcbCopper(next.pcbFabrication);
  if (issues.length) return { status: "blocked", code: issues.some((issue) => ["invalid-geometry", "work-limit"].includes(issue.type)) ? "INVALID_EXISTING_GEOMETRY" : "COPPER_CLEARANCE" };
  const point = [via.xMm, via.yMm], radius = via.diameterMm / 2;
  for (const pad of pcbCopperPads(next.pcbFabrication)) {
    if (pad.netId === via.netId) continue;
    if (segmentPadGap(point, point, pad) - radius + 1e-9 < netPairClearance(next.pcbFabrication, via.netId, pad.netId)) return { status: "blocked", code: "PAD_CLEARANCE" };
  }
  const keepouts = pcb.keepouts ?? [];
  if (!Array.isArray(keepouts) || keepouts.some((box) => !box || ![box.xMm, box.yMm, box.widthMm, box.heightMm].every(Number.isFinite) || box.widthMm <= 0 || box.heightMm <= 0)) return { status: "blocked", code: "INVALID_KEEP_OUT" };
  for (const box of keepouts) {
    const obstacle = { technology: "smd", xMm: box.xMm + box.widthMm / 2, yMm: box.yMm + box.heightMm / 2, widthMm: box.widthMm, heightMm: box.heightMm };
    if (segmentPadGap(point, point, obstacle) <= radius) return { status: "blocked", code: "KEEP_OUT" };
    for (const route of next.pcbFabrication.routes) for (let i = 1; i < route.pointsMm.length; i++) {
      if (segmentPadGap(route.pointsMm[i - 1], route.pointsMm[i], obstacle) <= route.widthMm / 2) return { status: "blocked", code: "KEEP_OUT" };
    }
  }
  if (next.metadata) next.metadata.updatedAt = new Date().toISOString();
  return { status: "complete", project: next, viaId: id, updatedRoutePoints };
}

/** Removal retains all copper and canonical nets; connectivity must be checked again. */
export function removePcbVia(project, id) {
  const vias = project?.pcbFabrication?.vias;
  if (!Array.isArray(vias) || !vias.some((via) => via.id === id)) return { status: "blocked", code: "UNKNOWN_VIA" };
  const next = structuredClone(project);
  next.pcbFabrication.vias = next.pcbFabrication.vias.filter((via) => via.id !== id);
  if (next.metadata) next.metadata.updatedAt = new Date().toISOString();
  return { status: "complete", project: next, viaId: id };
}
