const clone = (value) => JSON.parse(JSON.stringify(value));
const epsilon = 1e-9;
const pointDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

function pointSegmentDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const denominator = dx * dx + dy * dy;
  const t = denominator ? Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / denominator)) : 0;
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
}

function segmentDistance(a, b, c, d) {
  const onSegment = (p, q, r) => Math.abs(orient(p, q, r)) <= epsilon && r[0] >= Math.min(p[0], q[0]) - epsilon && r[0] <= Math.max(p[0], q[0]) + epsilon && r[1] >= Math.min(p[1], q[1]) - epsilon && r[1] <= Math.max(p[1], q[1]) + epsilon;
  const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if ((o1 * o2 < 0 && o3 * o4 < 0) || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b)) return 0;
  return Math.min(pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b));
}

function segmentHitsRect(a, b, rect, padding) {
  const left = rect.xMm - padding, right = rect.xMm + rect.widthMm + padding;
  const top = rect.yMm - padding, bottom = rect.yMm + rect.heightMm + padding;
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - left], [dx, right - a[0]], [-dy, a[1] - top], [dy, bottom - a[1]]]) {
    if (Math.abs(p) <= epsilon) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  return true;
}

function padRadius(pad) {
  return pad.technology === "through-hole"
    ? Number(pad.diameterMm) / 2
    : Math.hypot(Number(pad.widthMm), Number(pad.heightMm)) / 2;
}

function clearanceFor(pcb, netId, boardClearance) {
  const netClass = (pcb.netClasses ?? []).find((item) => item.netIds?.includes(netId));
  const rules = (pcb.netClassRules ?? []).filter((rule) => netClass && (rule.classA === netClass.name || rule.classB === netClass.name));
  return Math.max(boardClearance, ...rules.map((rule) => Number(rule.minimumClearanceMm)).filter(Number.isFinite));
}

export function createPcbRoute(project, { startPad, endPad, waypoints = [], layer = "F.Cu", widthMm } = {}) {
  const pcb = project?.pcbFabrication;
  const board = pcb?.board;
  if (!pcb || !board || !Array.isArray(pcb.parts) || !Array.isArray(pcb.pads) || !Array.isArray(pcb.routes)) return { status: "blocked", code: "NO_PCB_DATA" };
  if (![board.widthMm, board.heightMm, board.minimumClearanceMm].every(Number.isFinite) || board.widthMm <= 0 || board.heightMm <= 0 || board.minimumClearanceMm <= 0) return { status: "blocked", code: "INVALID_BOARD_RULES" };
  if (!Array.isArray(board.copperLayers) || !board.copperLayers.includes(layer) || !["F.Cu", "B.Cu"].includes(layer)) return { status: "blocked", code: "UNSUPPORTED_COPPER_LAYER" };

  const getPad = (id) => pcb.pads.find((pad) => `${pad.instanceId}:${pad.pin}` === id);
  const from = getPad(startPad), to = getPad(endPad);
  if (!from || !to) return { status: "blocked", code: "UNKNOWN_PAD" };
  if (from.netId === "NC" || to.netId === "NC") return { status: "blocked", code: "NO_CONNECT_PAD" };
  if (from.netId !== to.netId) return { status: "blocked", code: "NET_MISMATCH" };
  if (layer === "B.Cu" && [from, to].some((pad) => pad.technology !== "through-hole")) return { status: "blocked", code: "BOTTOM_LAYER_REQUIRES_THROUGH_HOLE" };
  const declaredNet = project.nets?.find((net) => net.id === from.netId);
  if (startPad === endPad || !declaredNet || !declaredNet.endpoints?.includes(startPad) || !declaredNet.endpoints?.includes(endPad)) return { status: "blocked", code: "INVALID_ROUTE_ENDPOINTS" };
  if (![from, to].every((pad) => pcb.parts.some((part) => part.instanceId === pad.instanceId))) return { status: "blocked", code: "UNKNOWN_FOOTPRINT" };

  const netClass = (pcb.netClasses ?? []).find((item) => item.netIds?.includes(from.netId));
  const minimumWidth = Number(netClass?.minimumWidthMm ?? board.minimumTraceWidthMm ?? 0.25);
  const traceWidth = widthMm === undefined ? minimumWidth : Number(widthMm);
  if (!Number.isFinite(minimumWidth) || minimumWidth <= 0 || !Number.isFinite(traceWidth) || traceWidth + epsilon < minimumWidth) return { status: "blocked", code: "TRACE_WIDTH_BELOW_MINIMUM" };
  if (pcb.pads.some((pad) => !Number.isFinite(pad.xMm) || !Number.isFinite(pad.yMm) || !Number.isFinite(padRadius(pad)) || padRadius(pad) <= 0)) return { status: "blocked", code: "INVALID_EXISTING_GEOMETRY" };
  if (pcb.routes.some((route) => !Number.isFinite(route.widthMm) || route.widthMm <= 0 || !Array.isArray(route.pointsMm) || route.pointsMm.length < 2 || route.pointsMm.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)))) return { status: "blocked", code: "INVALID_EXISTING_GEOMETRY" };

  const pointsMm = [
    [Number(from.xMm), Number(from.yMm)],
    ...waypoints.map((point) => Array.isArray(point) ? [Number(point[0]), Number(point[1])] : [Number.NaN, Number.NaN]),
    [Number(to.xMm), Number(to.yMm)]
  ];
  if (pointsMm.some((point) => !point.every(Number.isFinite) || point[0] < traceWidth / 2 || point[1] < traceWidth / 2 || point[0] > board.widthMm - traceWidth / 2 || point[1] > board.heightMm - traceWidth / 2)) return { status: "blocked", code: "ROUTE_OUT_OF_BOUNDS" };
  if (pointsMm.some((point, index) => index > 0 && pointDistance(point, pointsMm[index - 1]) <= epsilon)) return { status: "blocked", code: "ZERO_LENGTH_SEGMENT" };

  const clearance = clearanceFor(pcb, from.netId, board.minimumClearanceMm);
  const otherPads = pcb.pads.filter((pad) => pad.netId !== from.netId && pad.netId !== "NC" && (layer === "F.Cu" || pad.technology === "through-hole"));
  const otherRoutes = pcb.routes.filter((route) => route.netId !== from.netId && route.layer === layer);
  const keepouts = pcb.keepouts ?? [];
  for (let i = 1; i < pointsMm.length; i++) {
    const a = pointsMm[i - 1], b = pointsMm[i];
    for (const pad of otherPads) {
      const required = clearance + traceWidth / 2 + padRadius(pad);
      if (pointSegmentDistance([Number(pad.xMm), Number(pad.yMm)], a, b) + epsilon < required) return { status: "blocked", code: "PAD_CLEARANCE" };
    }
    for (const route of otherRoutes) {
      const required = clearance + (traceWidth + Number(route.widthMm)) / 2;
      for (let j = 1; j < (route.pointsMm ?? []).length; j++) {
        if (segmentDistance(a, b, route.pointsMm[j - 1], route.pointsMm[j]) + epsilon < required) return { status: "blocked", code: "ROUTE_CLEARANCE" };
      }
    }
    for (const keepout of keepouts) {
      if (![keepout.xMm, keepout.yMm, keepout.widthMm, keepout.heightMm].every(Number.isFinite) || keepout.widthMm <= 0 || keepout.heightMm <= 0) return { status: "blocked", code: "INVALID_KEEPOUT" };
      if (segmentHitsRect(a, b, keepout, traceWidth / 2)) return { status: "blocked", code: "ROUTE_KEEPOUT" };
    }
  }

  const next = clone(project);
  const identical = (route) => {
    if (route.netId !== from.netId || route.layer !== layer || route.widthMm !== traceWidth || route.pointsMm?.length !== pointsMm.length) return false;
    return route.pointsMm.every((point, index) => pointDistance(point, pointsMm[index]) <= epsilon)
      || route.pointsMm.every((point, index) => pointDistance(point, pointsMm.at(-1 - index)) <= epsilon);
  };
  if (pcb.routes.some(identical)) return { status: "unchanged", project };
  next.pcbFabrication.routes.push({ netId: from.netId, layer, widthMm: traceWidth, pointsMm });
  next.metadata = { ...next.metadata, updatedAt: new Date().toISOString() };
  return { status: "complete", project: next, netId: from.netId, layer, widthMm: traceWidth, pointsMm };
}

