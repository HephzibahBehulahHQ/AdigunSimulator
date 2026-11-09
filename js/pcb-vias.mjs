/** Stored plated through vias span the two supported copper layers. */
export function validatePcbVias(pcb, netIds) {
  if (pcb?.vias === undefined) return [];
  if (!Array.isArray(pcb.vias)) return ["Vias must be an array."];
  if (pcb.vias.length > 256) return ["At most 256 stored vias are supported."];
  if (pcb.vias.length && ![pcb.board?.widthMm, pcb.board?.heightMm].every((value) => Number.isFinite(value) && value > 0)) return ["Vias require valid board dimensions."];
  const errors = [], seen = new Set();
  if (pcb.vias.length && !(Array.isArray(pcb.board?.copperLayers) && pcb.board.copperLayers.length === 2 && pcb.board.copperLayers[0] === "F.Cu" && pcb.board.copperLayers[1] === "B.Cu")) errors.push("Plated vias require exactly F.Cu and B.Cu.");
  for (const via of pcb.vias) {
    if (!via || typeof via.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(via.id) || seen.has(via.id)) { errors.push("Via identifiers must be unique nonempty letters, digits, underscores or hyphens."); continue; }
    seen.add(via.id);
    if (!via.netId || via.netId === "NC" || (netIds && !netIds.has(via.netId))) errors.push(`Via ${via.id} needs a declared electrical net.`);
    if (![via.xMm, via.yMm, via.diameterMm, via.drillMm].every(Number.isFinite) || via.drillMm <= 0 || via.diameterMm <= via.drillMm) { errors.push(`Via ${via.id} has invalid position, copper diameter or drill.`); continue; }
    const r = via.diameterMm / 2;
    if (via.xMm < r || via.yMm < r || via.xMm > pcb.board.widthMm - r || via.yMm > pcb.board.heightMm - r) errors.push(`Via ${via.id} copper leaves the board outline.`);
    const drills = [...pcb.vias.filter((item) => item && item !== via && seen.has(item.id)), ...(Array.isArray(pcb.pads) ? pcb.pads.filter((pad) => pad?.technology === "through-hole") : [])];
    for (const other of drills) if ([other.xMm, other.yMm, other.drillMm].every(Number.isFinite) && other.drillMm > 0 && Math.hypot(via.xMm - other.xMm, via.yMm - other.yMm) + 1e-9 < (via.drillMm + other.drillMm) / 2) errors.push(`Via ${via.id} drill overlaps another plated hole.`);
  }
  return errors;
}

export function pcbCopperPads(pcb) {
  return [...(Array.isArray(pcb?.pads) ? pcb.pads : []).map((pad) => ({ ...pad, isVia: false })), ...(Array.isArray(pcb?.vias) ? pcb.vias : []).filter((via) => via && typeof via === "object").map((via) => ({
    ...via, instanceId: "@via", pin: via.id, number: via.id,
    reference: `VIA-${via.id}`, technology: "through-hole", isVia: true
  }))];
}
