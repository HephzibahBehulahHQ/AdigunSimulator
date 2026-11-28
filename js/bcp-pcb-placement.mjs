import { padCopperSections } from "./pcb-pad-geometry.mjs";
import { findNativeBipolar } from "./bcp-native-parts.mjs";
import sot89 from "../library/assets/footprints/nexperia.bcx51-115/footprint.json" with { type: "json" };
import sot223 from "../library/assets/footprints/nexperia.bcp51-115/footprint.json" with { type: "json" };
import { boardGeometryErrors } from "./pcb-board.mjs";
import { auditPcbCopper } from "./pcb-copper.mjs";

const defaultBoard = { widthMm: 40, heightMm: 24, copperLayers: ["F.Cu"], minimumClearanceMm: 0.2 };

export function placeNativeBipolarFootprint(project, component, definition) {
  const land = definition.package === "SOT89" ? sot89 : sot223;
  const current = project.pcbFabrication ?? { board: { ...defaultBoard, copperLayers: ["F.Cu"] }, parts: [], pads: [], routes: [] };
  if (current.copperZones?.length || !Array.isArray(current.parts) || !Array.isArray(current.pads) || !Array.isArray(current.routes) ||
      !current.board || boardGeometryErrors(current).length || auditPcbCopper(current).length) return project;
  const { board } = current;
  const part = {
    instanceId: component.instanceId, reference: component.reference, footprint: definition.package, technology: "smd",
    manufacturer: "Nexperia", manufacturerPartNumber: definition.defaultValue,
    sourceUrl: `https://assets.nexperia.com/documents/package-information/${definition.package}.pdf`
  };
  const clearance = board.minimumClearanceMm;
  const occupied = [...current.pads, ...(current.vias ?? [])].flatMap(padCopperSections);
  for (let y = 5; y <= board.heightMm - 5 && y <= 205; y += 10) {
    for (let x = 5; x <= board.widthMm - 5 && x <= 205; x += 10) {
      const pads = land.pads.map(({ number, xMm, yMm, ...geometry }) => ({
        ...structuredClone(geometry),
        instanceId: component.instanceId, reference: component.reference, number, pin: number,
        technology: "smd", xMm: x + xMm, yMm: y + yMm, netId: "NC"
      }));
      const sections = pads.flatMap(padCopperSections);
      const overlaps = sections.some(pad => occupied.some(other =>
        Math.abs(pad.xMm - other.xMm) < (pad.widthMm + (other.widthMm ?? other.diameterMm)) / 2 + clearance &&
        Math.abs(pad.yMm - other.yMm) < (pad.heightMm + (other.heightMm ?? other.diameterMm)) / 2 + clearance
      ));
      const keepoutConflict = sections.some(pad => (current.keepouts ?? []).some(box =>
        Math.abs(pad.xMm - box.xMm - box.widthMm / 2) <= (pad.widthMm + box.widthMm) / 2 + clearance &&
        Math.abs(pad.yMm - box.yMm - box.heightMm / 2) <= (pad.heightMm + box.heightMm) / 2 + clearance
      ));
      if (overlaps || keepoutConflict) continue;
      const next = { ...current, parts: [...current.parts, part], pads: [...current.pads, ...pads] };
      if (!boardGeometryErrors(next).length && !auditPcbCopper(next).length) return { ...project, pcbFabrication: next };
    }
  }
  return project;
}

export function syncNativeBipolarPadNets(project) {
  const pcb = project.pcbFabrication;
  if (!pcb?.parts?.length) return project;
  const instances = new Set(project.components.filter(component => findNativeBipolar(component.libraryId)).map(component => component.instanceId));
  if (!instances.size) return project;
  const nets = new Map(project.nets.flatMap(net => net.endpoints.map(pin => [pin, net.id])));
  const pads = pcb.pads.map(pad => instances.has(pad.instanceId)
    ? { ...pad, netId: nets.get(pad.instanceId + ":" + pad.pin) ?? "NC" }
    : pad);
  return { ...project, pcbFabrication: { ...pcb, pads } };
}
