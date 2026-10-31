const BALLS=Object.freeze(Array.from({length:16},(_,i)=>String.fromCharCode(65+Math.floor(i/4))+(i%4+1)));
const TOLERANCE=0.011;
const csv=(value)=>`"${String(value).replaceAll('"','""')}"`;
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<=TOLERANCE;
export function reviewBgaEscapeConcept(project){
  const pcb=project?.pcbFabrication,part=pcb?.parts?.find(item=>item.reference==="U1"),component=project?.components?.find(item=>item.instanceId===part?.instanceId),plan=pcb?.bgaEscapePlan;
  const checks=[];
  const add=(id,label,passed,observed)=>checks.push({id,label,status:passed?"pass":"fail",observed});
  add("concept-package","Concept package identity",Boolean(part&&component&&part.footprint==="CONCEPT_BGA_4X4_0P8"&&plan?.instanceId===part.instanceId),part?.footprint??"missing");
  const pads=(pcb?.pads??[]).filter(p=>p.instanceId===part?.instanceId),mapValid=pads.length===16&&BALLS.every(ball=>pads.some(p=>p.number===ball&&p.pin===ball&&p.reference==="U1"));
  add("ball-map","All sixteen A1–D4 ball designators are unique and present",mapValid,`${pads.length} lands`);
  const map=plan?.ballMap??[],coordinatesValid=map.length===16&&BALLS.every((ball,i)=>{const row=Math.floor(i/4),col=i%4,x=10+(col-1.5)*0.8,y=10+(row-1.5)*0.8,p=pads.find(item=>item.number===ball),declared=map.find(item=>item.ball===ball);return Boolean(p&&declared&&near(p.xMm,x)&&near(p.yMm,y)&&near(declared.xMm,x)&&near(declared.yMm,y)&&near(p.widthMm,0.35)&&near(p.heightMm,0.35));});
  add("grid-geometry","Declared 0.80 mm concept pitch and 0.35 mm square lands",coordinatesValid,`${plan?.pitchMm??"?"} mm pitch; ${plan?.landDiameterMm??"?"} mm land`);
  const gap=Number(plan?.pitchMm)-Number(plan?.landDiameterMm);
  add("nominal-gap","Nominal land-to-land gap from declared assumptions",near(gap,0.45),Number.isFinite(gap)?gap.toFixed(2)+" mm":"unknown");
  const honest=plan?.layerCount===2&&plan?.escapeRouting?.available===false&&plan?.escapeRouting?.performed===false&&(plan?.escapeVias??[]).length===0&&plan?.fabricationQualified===false&&plan?.claimsManufacturable===false&&(pcb?.routes??[]).length===0;
  add("capability-disclosure","No unsupported router, via-escape or manufacturability claim",honest,"No routed escapes; manufacturing status not assessed");
  return {status:checks.every(c=>c.status==="pass")?"passed":"failed",checks,errors:checks.filter(c=>c.status==="fail").map(c=>c.label),nominalLandGapMm:Number.isFinite(gap)?Number(gap.toFixed(2)):null,disclaimer:"Concept-only 4 × 4 BGA occupancy and declared-parameter review. Grid pitch and land diameter are illustrative assumptions, not a vendor footprint. AdigunSimulator does not route BGA escapes or vias, check layer transitions, model stack-up/fabrication limits, or determine whether this design is manufacturable."};
}
export function createBgaEscapeReport(project){
  const result=reviewBgaEscapeConcept(project),rows=[["Check","Observed","Status"],...result.checks.map(c=>[c.label,c.observed,c.status]),["Escape routing performed","No","not-supported"],["Manufacturability","Not assessed","not-qualified"]];
  return rows.map(r=>r.map(csv).join(",")).join("\r\n")+"\r\n";
}
