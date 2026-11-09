import { addComponent, findLibraryPart, moveComponent, updateComponent } from "./core.mjs";
import { schematicGeometry } from "./schematic-pin-layout.mjs";
import { schematicObstacle } from "./schematic-routing.mjs";

export function startComponentPlacement(libraryId) {
  const part = findLibraryPart(libraryId);
  if (!part || !part.views?.schematic) throw new Error("This component has no native schematic representation.");
  return { libraryId, rotation: 0, point: null };
}
export function rotateComponentPlacement(draft) {
  return draft ? { ...draft, rotation: (draft.rotation + 90) % 360 } : null;
}
export function placementComponent(draft) {
  const size = schematicGeometry({ libraryId: draft.libraryId });
  return { libraryId: draft.libraryId, position: { schematic: draft.point ?? [0,0] }, geometry: { schematic: { ...size, rotation: draft.rotation } } };
}
export function positionComponentPlacement(draft, point, snap = true) {
  if (!draft || !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)) return null;
  const prototype = placementComponent({ ...draft, point: [0,0] }), box = schematicObstacle(prototype), step = snap ? 12 : 1;
  const xMin = Math.ceil(Math.max(28, 8-box.left)/step)*step, xMax = Math.floor(Math.min(604,672-box.right)/step)*step;
  const yMin = Math.ceil(Math.max(48,8-box.top)/step)*step, yMax = Math.floor(Math.min(244,292-box.bottom)/step)*step;
  return { ...draft, point: [Math.max(xMin,Math.min(xMax,Math.round(point[0]/step)*step)),Math.max(yMin,Math.min(yMax,Math.round(point[1]/step)*step))] };
}
export function placementOverlaps(project, draft) {
  if (!draft?.point) return false;
  const box = schematicObstacle(placementComponent(draft));
  return project.components.some(component => {
    const other = schematicObstacle(component);
    return box.left < other.right+4 && box.right > other.left-4 && box.top < other.bottom+4 && box.bottom > other.top-4;
  });
}
export function firstFreeComponentPlacement(project, libraryId) {
  const draft = startComponentPlacement(libraryId);
  for (let y=60;y<=228;y+=12) for (let x=48;x<=600;x+=12) {
    const candidate = positionComponentPlacement(draft,[x,y]);
    if (!placementOverlaps(project,candidate)) return candidate;
  }
  return null;
}
export function commitComponentPlacement(project, draft) {
  if (!draft?.point || !findLibraryPart(draft.libraryId)) throw new Error("Choose a component and a canvas position first.");
  if (placementOverlaps(project,draft)) throw new Error("Choose a free area away from existing components and labels.");
  let next = addComponent(project,draft.libraryId);
  const id = next.components.at(-1).instanceId;
  next = moveComponent(next,id,"schematic",draft.point);
  next = updateComponent(next,id,{geometry:placementComponent(draft).geometry});
  return { project: next, instanceId: id };
}

const messages = {
  en: { draw:"Draw", ready:"Click or tap the canvas to place. R rotates; Escape cancels.", blocked:"Choose a free area away from components and labels.", noRoom:"No free schematic space. Move existing parts or start a new project." },
  de: { draw:"Zeichnen", ready:"Zum Platzieren klicken oder tippen. R dreht; Escape bricht ab.", blocked:"Freien Bereich ohne Bauteile und Beschriftungen wählen.", noRoom:"Kein freier Schaltplanplatz. Bauteile verschieben oder neues Projekt öffnen." },
  yo: { draw:"Yà", ready:"Tẹ àwòrán láti gbé ẹ̀yà síbẹ̀. R yí i; Escape fagilé.", blocked:"Yan ààyè òfo láìsí ẹ̀yà tàbí àkọlé.", noRoom:"Kò sí ààyè òfo. Gbé àwọn ẹ̀yà tàbí bẹ̀rẹ̀ iṣẹ́ tuntun." },
  pcm: { draw:"Draw", ready:"Click or tap canvas to place am. R go turn am; Escape go cancel.", blocked:"Choose free space away from parts and labels.", noRoom:"No free space for schematic. Move parts or start new project." }
};
export const placementText = (locale,key) => (messages[locale]??messages.en)[key];
