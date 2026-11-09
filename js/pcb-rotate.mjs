const round = (value) => Number(value.toFixed(9));

/** Clockwise quarter-turns in the PCB's x-right/y-down coordinates, about its pad centroid. */
export function rotatePcbFootprint(project, instanceId, degrees) {
  const pcb = project?.pcbFabrication, board = pcb?.board;
  if (!board || !Array.isArray(pcb.parts) || !Array.isArray(pcb.pads) || !Array.isArray(pcb.routes)) return { status: "blocked", code: "NO_PCB_DATA" };
  const part = pcb.parts.find((item) => item.instanceId === instanceId);
  if (!part) return { status: "blocked", code: "UNKNOWN_FOOTPRINT" };
  if (!Number.isInteger(degrees) || degrees % 90 !== 0) return { status: "blocked", code: "UNSUPPORTED_ROTATION" };
  const priorRotation = part.rotationDeg === undefined ? 0 : part.rotationDeg;
  if (!Number.isInteger(priorRotation) || priorRotation < 0 || priorRotation >= 360 || priorRotation % 90 !== 0) return { status: "blocked", code: "INVALID_ROTATION" };
  const turns = ((degrees / 90) % 4 + 4) % 4;
  if (!turns) return { status: "unchanged", project };
  const pads = pcb.pads.filter((pad) => pad.instanceId === instanceId);
  if (!pads.length) return { status: "blocked", code: "NO_FOOTPRINT_PADS" };
  if (pcb.routes.some((route) => !Array.isArray(route.pointsMm) || route.pointsMm.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)))) return { status: "blocked", code: "INVALID_ROUTE_GEOMETRY" };
  if (![board.widthMm, board.heightMm].every((v) => Number.isFinite(v) && v > 0) || pads.some((pad) =>
    ![pad.xMm, pad.yMm].every(Number.isFinite) || !["smd", "through-hole"].includes(pad.technology) ||
    !(pad.technology === "smd" ? [pad.widthMm, pad.heightMm] : [pad.diameterMm, pad.drillMm]).every((v) => Number.isFinite(v) && v > 0) ||
    (pad.technology === "through-hole" && pad.drillMm >= pad.diameterMm))) return { status: "blocked", code: "INVALID_FOOTPRINT_GEOMETRY" };
  const center = [pads.reduce((sum, pad) => sum + pad.xMm, 0) / pads.length, pads.reduce((sum, pad) => sum + pad.yMm, 0) / pads.length];
  const transform = ([x, y]) => {
    let dx = x - center[0], dy = y - center[1];
    for (let i = 0; i < turns; i++) [dx, dy] = [-dy, dx];
    return [round(center[0] + dx), round(center[1] + dy)];
  };
  const rotated = pads.map((pad) => {
    const [xMm, yMm] = transform([pad.xMm, pad.yMm]);
    return { ...pad, xMm, yMm, ...(pad.technology === "smd" && turns % 2 ? { widthMm: pad.heightMm, heightMm: pad.widthMm } : {}) };
  });
  if (rotated.some((pad) => {
    const rx = (pad.technology === "smd" ? pad.widthMm : pad.diameterMm) / 2;
    const ry = (pad.technology === "smd" ? pad.heightMm : pad.diameterMm) / 2;
    return pad.xMm - rx < 0 || pad.yMm - ry < 0 || pad.xMm + rx > board.widthMm || pad.yMm + ry > board.heightMm;
  })) return { status: "blocked", code: "OUT_OF_BOUNDS" };
  const next = structuredClone(project);
  let padIndex = 0, updatedRoutePoints = 0;
  next.pcbFabrication.pads = next.pcbFabrication.pads.map((pad) => pad.instanceId === instanceId ? structuredClone(rotated[padIndex++]) : pad);
  next.pcbFabrication.parts.find((item) => item.instanceId === instanceId).rotationDeg = (priorRotation + turns * 90) % 360;
  next.pcbFabrication.routes = next.pcbFabrication.routes.map((route) => ({ ...route, pointsMm: route.pointsMm?.map((point) => {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) || !pads.some((pad) => pad.netId === route.netId && Math.hypot(point[0] - pad.xMm, point[1] - pad.yMm) <= 0.001)) return point;
    updatedRoutePoints++;
    return transform(point);
  }) }));
  if (next.metadata) next.metadata.updatedAt = new Date().toISOString();
  return { status: "complete", project: next, rotatedPadCount: pads.length, updatedRoutePoints, rotationDeg: (priorRotation + turns * 90) % 360 };
}
