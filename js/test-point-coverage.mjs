const csv=(value)=>`"${String(value).replaceAll('"','""')}"`;
function distanceToPad(test,pad){
 const dx=Math.abs(test.xMm-pad.xMm),dy=Math.abs(test.yMm-pad.yMm),r=test.padDiameterMm/2;
 if(pad.technology==="through-hole")return Math.hypot(dx,dy)-r-pad.diameterMm/2;
 const hx=pad.widthMm/2,hy=pad.heightMm/2;
 return Math.hypot(Math.max(0,dx-hx),Math.max(0,dy-hy))-r;
}
export function reviewTestPointCoverage(project){
 const pcb=project?.pcbFabrication,required=pcb?.requiredTestPointNets??[],points=pcb?.testPoints??[],parts=pcb?.parts??[],pads=pcb?.pads??[],nets=project?.nets??[],board=pcb?.board,checks=[],errors=[];
 const add=(id,label,passed,observed)=>checks.push({id,label,status:passed?"pass":"fail",observed});
 const unique=required.length>0&&new Set(required).size===required.length;
 const coverage=unique&&required.every(net=>points.filter(p=>p.netId===net).length===1);
 add("required-net-coverage","Exactly one test point is declared for each required net",coverage,`${required.filter(net=>points.some(p=>p.netId===net)).length}/${required.length} nets mapped`);
 const mapping=coverage&&points.length===required.length&&points.every(p=>{
   const c=project.components.find(x=>x.instanceId===p.instanceId),part=parts.find(x=>x.instanceId===p.instanceId),pad=pads.find(x=>x.instanceId===p.instanceId&&x.number==="1");
   return c?.libraryId==="testpoint.generic-smd-top-pad"&&part?.reference===p.reference&&part.technology==="smd"&&pad?.reference===p.reference&&pad.pin==="1"&&pad.netId===p.netId&&pad.xMm===p.xMm&&pad.yMm===p.yMm&&pad.widthMm===p.padDiameterMm&&pad.heightMm===p.padDiameterMm&&nets.some(n=>n.id===p.netId&&n.endpoints.includes(p.instanceId+":1"));
 });
 add("netlist-pad-map","Each test-pad contact is attached to its declared project net",mapping,"Component, pad and native net endpoint agree");
 const copper=board?.copperLayers??[];
 const accessible=points.length===required.length&&points.every(p=>p.accessSide==="top"&&p.accessLayer==="F.Cu"&&copper.includes(p.accessLayer)&&Number.isFinite(p.xMm)&&Number.isFinite(p.yMm)&&Number.isFinite(p.padDiameterMm)&&p.padDiameterMm>=1.2&&p.xMm>=2&&p.yMm>=2&&p.xMm<=board.widthMm-2&&p.yMm<=board.heightMm-2);
 add("top-side-access","Test pads are sized and placed on the declared accessible top copper layer",accessible,"Top-side F.Cu; pad diameter ≥ 1.2 mm");
 const spaced=points.every((p,i)=>points.slice(i+1).every(q=>Math.hypot(p.xMm-q.xMm,yDistance(p,q))>=3));
 function yDistance(a,b){return a.yMm-b.yMm;}
 const clear=spaced&&points.every(p=>pads.filter(q=>q.instanceId!==p.instanceId).every(q=>distanceToPad(p,q)>=0.5));
 add("probe-clearance","Test pads are separated and have declared 0.5 mm probe clearance from other pads",clear,"Minimum test-pad spacing 3.0 mm; nearest-pad gap ≥ 0.5 mm");
 const onNet=required.every(net=>nets.some(n=>n.id===net));
 add("required-nets","All required net identifiers exist in the MCU project",onNet,required.join(", "));
 return {status:checks.every(c=>c.status==="pass")?"passed":"failed",checks,errors:checks.filter(c=>c.status==="fail").map(c=>c.label),requiredNetCount:required.length,coveredNetCount:required.filter(net=>points.some(p=>p.netId===net)).length,continuityVerified:false,disclaimer:"Coverage means one declared test pad is mapped to each required native net and placed in an unobstructed top-side metadata region. The four-layer board plan has no route geometry; electrical continuity, probe contact after assembly, probe fixture access, signal integrity and manufacturing qualification are not verified."};
}
export function createTestPointCoverageReport(project){
 const review=reviewTestPointCoverage(project),rows=[["Required Net","Test Point","Pad Diameter (mm)","Access Layer","Side","Coverage"],...(project?.pcbFabrication?.requiredTestPointNets??[]).map(net=>{const tp=(project.pcbFabrication.testPoints??[]).find(p=>p.netId===net);return [net,tp?.reference??"Missing",tp?.padDiameterMm??"",tp?.accessLayer??"",tp?.accessSide??"",tp?"mapped":"missing"];}),["Electrical continuity","Not verified","","","","not-tested"],["Manufacturing qualified","No","","","","not-qualified"]];
 return rows.map(r=>r.map(csv).join(",")).join("\r\n")+"\r\n";
}
