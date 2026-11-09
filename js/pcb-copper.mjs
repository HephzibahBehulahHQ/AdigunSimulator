import { readPcbNetClasses } from "./pcb-net-classes.mjs";
import { pcbCopperPads, validatePcbVias } from "./pcb-vias.mjs";
const EPS = 1e-9;
export function pointSegmentDistance(point, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared ? Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared)) : 0;
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
}
export function segmentDistance(a, b, c, d) {
  const cross = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const o1 = cross(a, b, c), o2 = cross(a, b, d), o3 = cross(c, d, a), o4 = cross(c, d, b);
  if (o1 * o2 < 0 && o3 * o4 < 0) return 0;
  return Math.min(pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b));
}
export function segmentPadGap(a, b, pad) {
  if (pad.technology === "through-hole") return pointSegmentDistance([pad.xMm, pad.yMm], a, b) - pad.diameterMm / 2;
  const left = pad.xMm - pad.widthMm / 2, right = pad.xMm + pad.widthMm / 2;
  const top = pad.yMm - pad.heightMm / 2, bottom = pad.yMm + pad.heightMm / 2;
  const inside = ([x, y]) => x >= left && x <= right && y >= top && y <= bottom;
  if (inside(a) || inside(b)) return 0;
  const corners = [[left, top], [right, top], [right, bottom], [left, bottom]];
  return Math.min(...corners.map((corner, i) => segmentDistance(a, b, corner, corners[(i + 1) % 4])));
}
export const padOnLayer = (pad, layer) => layer === "F.Cu" || (layer === "B.Cu" && pad.technology === "through-hole");
export function netPairClearance(pcb, a, b) {
  const policy = readPcbNetClasses(pcb);
  if (policy.errors.length) return Infinity;
  const first = policy.classes.filter(item=>item.netIds.includes(a)), second = policy.classes.filter(item=>item.netIds.includes(b));
  const aa = first.map(item=>item.id), bb = second.map(item=>item.id);
  const rules = policy.rules.filter(rule=>(aa.includes(rule.classA)&&bb.includes(rule.classB))||(aa.includes(rule.classB)&&bb.includes(rule.classA)));
  return Math.max(pcb.board.minimumClearanceMm, ...[...first,...second,...rules].map(item=>item.minimumClearanceMm).filter(Number.isFinite));
}

/** Copper-only audit: round traces, circular plated pads, axis-aligned rectangular top pads. */
export function auditPcbCopper(pcb) {
  const point = (value) => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
  if (!pcb?.board || !Number.isFinite(pcb.board.minimumClearanceMm) || pcb.board.minimumClearanceMm <= 0 || !Array.isArray(pcb.pads) || !Array.isArray(pcb.routes)
    || pcb.pads.some((pad) => !pad || ![pad.xMm, pad.yMm].every(Number.isFinite) || (pad.technology === "through-hole" ? !Number.isFinite(pad.diameterMm) || pad.diameterMm <= 0 : pad.technology !== "smd" || ![pad.widthMm, pad.heightMm].every((n) => Number.isFinite(n) && n > 0)))
    || pcb.routes.some((route) => !route || !["F.Cu", "B.Cu"].includes(route.layer) || !Number.isFinite(route.widthMm) || route.widthMm <= 0 || !Array.isArray(route.pointsMm) || route.pointsMm.length < 2 || !route.pointsMm.every(point))) return [{ type: "invalid-geometry" }];
  if (validatePcbVias(pcb).length) return [{ type: "invalid-geometry" }];
  if (readPcbNetClasses(pcb).errors.length) return [{ type: "invalid-rules" }];
  const pads = pcbCopperPads(pcb);
  const segments = pcb.routes.reduce((sum, route) => sum + route.pointsMm.length - 1, 0);
  if ((segments + pads.length) ** 2 > 2_000_000) return [{ type: "work-limit" }];
  const issues = [];
  for (const [index, route] of pcb.routes.entries()) {
    for (let k = 1; k < route.pointsMm.length; k++) {
      const a = route.pointsMm[k - 1], b = route.pointsMm[k];
      for (const [padIndex, pad] of pads.entries()) {
        if ((pad.netId === route.netId && pad.netId !== "NC") || !padOnLayer(pad, route.layer)) continue;
        const gap = segmentPadGap(a, b, pad) - route.widthMm / 2;
        const required = netPairClearance(pcb, route.netId, pad.netId);
        if (gap + EPS < required) issues.push({ type: "trace-pad", routeIndex: index, padIndex, segmentIndex: k - 1, gapMm: gap, requiredMm: required });
      }
      for (let j = index + 1; j < pcb.routes.length; j++) {
        const other = pcb.routes[j];
        if (other.layer !== route.layer || other.netId === route.netId) continue;
        const required = netPairClearance(pcb, route.netId, other.netId);
        for (let n = 1; n < other.pointsMm.length; n++) {
          const gap = segmentDistance(a, b, other.pointsMm[n - 1], other.pointsMm[n]) - (route.widthMm + other.widthMm) / 2;
          if (gap + EPS < required) issues.push({ type: "trace-trace", routeIndex: index, otherRouteIndex: j, segmentIndex: k - 1, otherSegmentIndex: n - 1, gapMm: gap, requiredMm: required });
        }
      }
    }
  }
  return issues;
}

/** After geometry validation, require one physically connected copper group per net. */
export function disconnectedPcbNets(pcb) {
  const pads = pcbCopperPads(pcb), routes = pcb.routes;
  const parent = Array.from({ length: pads.length + routes.length }, (_, i) => i);
  const root = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const join = (a, b) => { parent[root(a)] = root(b); };
  for (const [ri, route] of routes.entries()) {
    const node = pads.length + ri;
    for (const [pi, pad] of pads.entries()) {
      if (pad.netId !== route.netId || !padOnLayer(pad, route.layer)) continue;
      if (route.pointsMm.slice(1).some((b, i) => segmentPadGap(route.pointsMm[i], b, pad) <= route.widthMm / 2 + EPS)) join(node, pi);
    }
    for (let j = 0; j < ri; j++) {
      const other = routes[j];
      if (route.netId !== other.netId || route.layer !== other.layer) continue;
      if (route.pointsMm.slice(1).some((b, i) => other.pointsMm.slice(1).some((d, k) => segmentDistance(route.pointsMm[i], b, other.pointsMm[k], d) <= (route.widthMm + other.widthMm) / 2 + EPS))) join(node, pads.length + j);
    }
  }
  const groups = new Map();
  pads.forEach((pad, i) => { if (pad.netId !== "NC") { const set = groups.get(pad.netId) ?? new Set(); set.add(root(i)); groups.set(pad.netId, set); } });
  return [...groups].filter(([, set]) => set.size > 1).map(([net]) => net);
}
