const REQUIRED_PINS = Object.freeze(["SW_1","SW_2","SW_3","PG","FB","AGND","FSW","DEF","SS_TR","AVIN","PVIN_1","PVIN_2","EN","VOS","PGND_1","PGND_2","EP"]);
const REQUIRED_DATASHEET_NAMES = Object.freeze(["SW","SW","SW","PG","FB","AGND","FSW","DEF","SS/TR","AVIN","PVIN","PVIN","EN","VOS","PGND","PGND","EP"]);
const TOLERANCE = 0.011;
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<=TOLERANCE;
const csv=(value)=>`"${String(value).replaceAll('"','""')}"`;
function expectedPosition(number){
  if(number<=4)return [-1.1,[-0.75,-0.25,0.25,0.75][number-1]];
  if(number<=8)return [[-0.75,-0.25,0.25,0.75][number-5],1.1];
  if(number<=12)return [1.1,[0.75,0.25,-0.25,-0.75][number-9]];
  if(number<=16)return [[0.75,0.25,-0.25,-0.75][number-13],-1.1];
  return [0,0];
}
function add(checks,id,label,passed,observed){checks.push({id,label,status:passed?"pass":"fail",observed});}
export function reviewQfnFootprint(project){
  const pcb=project?.pcbFabrication,part=pcb?.parts?.find(item=>item.reference==="U1"),component=project?.components?.find(item=>item.instanceId===part?.instanceId),fp=pcb?.qfnFootprints?.find(item=>item.instanceId===part?.instanceId);
  const checks=[];
  add(checks,"package","Package identity and component",Boolean(part&&component&&part.footprint==="TI_RGT0016C_QFN16_EP"&&fp?.package==="RGT0016C"),fp?.package??"missing");
  const body=fp?.body??{},court=fp?.courtyard??{},stencil=fp?.stencil??{};
  add(checks,"body","3.0 mm nominal package body",near(body.widthMm,3)&&near(body.heightMm,3),`${body.widthMm??"?"} x ${body.heightMm??"?"} mm`);
  const bodyClearance=body.xMm-court.xMm;
  const courtOk=[court.xMm,court.yMm,court.widthMm,court.heightMm].every(Number.isFinite)&&near(court.widthMm,3.8)&&near(court.heightMm,3.8)&&near(court.xMm,body.xMm-0.4)&&near(court.yMm,body.yMm-0.4);
  add(checks,"courtyard","Centered courtyard with at least 0.4 mm body margin",courtOk,`${court.widthMm??"?"} x ${court.heightMm??"?"} mm; margin ${Number.isFinite(bodyClearance)?bodyClearance.toFixed(3):"?"} mm`);
  const pads=(pcb?.pads??[]).filter(pad=>pad.instanceId===part?.instanceId),mapOk=pads.length===17&&REQUIRED_PINS.every((pin,index)=>{const n=index+1,p=pads.find(item=>String(item.number)===String(n));return Boolean(p&&p.pin===pin&&p.datasheetPinName===REQUIRED_DATASHEET_NAMES[index]&&p.reference==="U1");});
  add(checks,"pad-map","Sixteen numbered leads plus exposed pad 17 map to TI pin names",mapOk,`${pads.length} pads`);
  const geometryOk=mapOk&&REQUIRED_PINS.every((_,index)=>{const n=index+1,p=pads.find(item=>String(item.number)===String(n)),[dx,dy]=expectedPosition(n),vertical=n<=4||n>=9&&n<=12;return near(p.xMm,5+dx)&&near(p.yMm,5+dy)&&near(p.widthMm,n===17?1.68:vertical?0.24:0.6)&&near(p.heightMm,n===17?1.68:vertical?0.6:0.24);});
  add(checks,"land-pattern","Pad positions, 0.50 mm pitch, 0.60 x 0.24 mm leads and 1.68 mm exposed pad",geometryOk,"RGT0016C land-pattern metadata");
  const edge=stencil.perimeterApertures??[],edgeOk=edge.length===16&&edge.every(a=>{const n=Number(a.padNumber),p=pads.find(item=>String(item.number)===String(n));return p&&near(a.xMm,p.xMm)&&near(a.yMm,p.yMm)&&a.widthMm>0&&a.heightMm>0&&a.widthMm<=p.widthMm&&a.heightMm<=p.heightMm&&a.widthMm*a.heightMm/(p.widthMm*p.heightMm)>=0.65;});
  add(checks,"lead-stencil","Sixteen contained lead apertures with declared paste coverage",Number.isFinite(stencil.thicknessMm)&&stencil.thicknessMm>0&&edgeOk,`${edge.length} lead apertures; ${stencil.thicknessMm??"?"} mm stencil`);
  const ep=pads.find(p=>String(p.number)==="17"),windows=stencil.exposedPadWindows??[],windowArea=windows.reduce((sum,w)=>sum+w.widthMm*w.heightMm,0),pasteCoveragePercent=ep?windowArea/(ep.widthMm*ep.heightMm)*100:NaN;
  const windowsInside=Boolean(ep&&windows.length===4&&windows.every(w=>[w.xMm,w.yMm,w.widthMm,w.heightMm].every(Number.isFinite)&&w.widthMm>0&&w.heightMm>0&&Math.abs(w.xMm-5)+w.widthMm/2<=ep.widthMm/2+TOLERANCE&&Math.abs(w.yMm-5)+w.heightMm/2<=ep.heightMm/2+TOLERANCE));
  add(checks,"exposed-pad-stencil","Four segmented exposed-pad apertures within the land; 55–80% proposed paste area",windowsInside&&pasteCoveragePercent>=55&&pasteCoveragePercent<=80,`${windows.length} windows; ${Number.isFinite(pasteCoveragePercent)?pasteCoveragePercent.toFixed(1):"?"}%`);
  return {status:checks.every(item=>item.status==="pass")?"passed":"failed",checks,errors:checks.filter(item=>item.status==="fail").map(item=>item.label),pasteCoveragePercent:Number.isFinite(pasteCoveragePercent)?Number(pasteCoveragePercent.toFixed(1)):null,disclaimer:"Bounded review of declared RGT0016C package, pad and stencil geometry. The stencil opening pattern and 0.4 mm courtyard are project proposals; paste transfer, soldering, thermal performance, board clearance to other parts, assembly yield, fabrication DRC and manufacturing qualification are not verified."};
}
export function createQfnFootprintReport(project){
  const result=reviewQfnFootprint(project),rows=[["Check","Observed","Status"],...result.checks.map(item=>[item.label,item.observed,item.status]),["Manufacturing qualified","No","not-checked"]];
  return rows.map(row=>row.map(csv).join(",")).join("\r\n")+"\r\n";
}
