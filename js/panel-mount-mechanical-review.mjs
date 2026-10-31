import { validatePcbFabrication } from "./pcb-export.mjs";
const near=(a,b,t=0.011)=>Number.isFinite(a)&&Math.abs(a-b)<=t;
const csv=(value)=>`"${String(value).replaceAll('"','""')}"`;
export function reviewPanelMountMechanicals(project){
  const pcb=project?.pcbFabrication,board=pcb?.board,features=pcb?.mechanicalFeatures??[],keepouts=pcb?.keepouts??[],holes=features.filter(f=>f.type==="mounting-hole"),cuts=features.filter(f=>f.type==="edge-cutout"),checks=[];
  const add=(id,label,passed,observed)=>checks.push({id,label,status:passed?"pass":"fail",observed});
  const finiteBoard=Number.isFinite(board?.widthMm)&&Number.isFinite(board?.heightMm)&&board.widthMm>0&&board.heightMm>0;
  add("board","Board outline dimensions",finiteBoard,`${board?.widthMm??"?"} x ${board?.heightMm??"?"} mm`);
  const holeValid=holes.length===4&&holes.every(h=>{const edge=Math.min(h.xMm-h.diameterMm/2,h.yMm-h.diameterMm/2,board.widthMm-h.xMm-h.diameterMm/2,board.heightMm-h.yMm-h.diameterMm/2),ko=keepouts.find(k=>k.id===h.keepoutId&&k.mechanicalFeatureId===h.id),side=h.diameterMm/2+h.copperClearanceMm;return [h.xMm,h.yMm,h.diameterMm,h.drillMm,h.requiredEdgeClearanceMm,h.copperClearanceMm].every(Number.isFinite)&&h.diameterMm>h.drillMm&&h.drillMm>0&&edge+1e-9>=h.requiredEdgeClearanceMm&&ko&&near(ko.xMm,h.xMm-side)&&near(ko.yMm,h.yMm-side)&&near(ko.widthMm,h.diameterMm+2*h.copperClearanceMm)&&near(ko.heightMm,h.diameterMm+2*h.copperClearanceMm);});
  const spacing=holes.every((a,i)=>holes.slice(i+1).every(b=>Math.hypot(a.xMm-b.xMm,a.yMm-b.yMm)>=((a.diameterMm+b.diameterMm)/2+1)));
  add("holes","Four M3-clearance mounting holes, edge margin and linked copper keepouts",holeValid&&spacing,holes.length===4?"4 × Ø5.0; drill Ø3.2 mm":"incomplete or inconsistent");
  const slot=cuts.length===1&&cuts[0],slotKeepout=slot&&keepouts.find(k=>k.id===slot.keepoutId&&k.mechanicalFeatureId===slot.id);
  const cutOk=Boolean(finiteBoard&&slot&&slot.openingSide==="top"&&[slot.xMm,slot.yMm,slot.widthMm,slot.heightMm,slot.requiredEdgeClearanceMm].every(Number.isFinite)&&near(slot.yMm,0)&&slot.xMm>=slot.requiredEdgeClearanceMm&&slot.widthMm>0&&slot.heightMm>0&&slot.xMm+slot.widthMm<=board.widthMm-slot.requiredEdgeClearanceMm&&slot.heightMm<board.heightMm&&slotKeepout&&near(slotKeepout.xMm,slot.xMm-0.5)&&near(slotKeepout.yMm,0)&&near(slotKeepout.widthMm,slot.widthMm+1)&&near(slotKeepout.heightMm,slot.heightMm+0.5));
  add("cutout","Top-edge panel/connector cutout and linked copper-clearance keepout",cutOk,slot?`${slot.widthMm} x ${slot.heightMm} mm at top edge`:"missing");
  const drc=validatePcbFabrication(project);
  add("drc","Electrical PCB design-rule check including linked mechanical keepouts",drc.status==="passed",drc.status);
  return {status:checks.every(c=>c.status==="pass")?"passed":"failed",checks,errors:[...checks.filter(c=>c.status==="fail").map(c=>c.label),...(drc.errors??[])],drc,disclaimer:"Mechanical coordinates and keepouts are reviewed as declared project geometry. This repository's single-layer electrical checker does not export mechanical holes or edge cut-outs; controller behavior and manufacturing qualification are not covered."};
}
export function createPanelMountMechanicalReport(project){
 const result=reviewPanelMountMechanicals(project),rows=[["Check","Observed","Status"],...result.checks.map(c=>[c.label,c.observed,c.status]),["Mechanical Gerber/drill export","Not implemented","not-supported"],["Manufacturing qualified","No","not-qualified"]];
 return rows.map(r=>r.map(csv).join(",")).join("\r\n")+"\r\n";
}
