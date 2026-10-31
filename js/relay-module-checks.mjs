const cross=(a,b,rect)=>{
  const x0=rect.xMm,y0=rect.yMm,x1=x0+rect.widthMm,y1=y0+rect.heightMm;
  const dx=b[0]-a[0],dy=b[1]-a[1],p=[-dx,dx,-dy,dy],q=[a[0]-x0,x1-a[0],a[1]-y0,y1-a[1]];
  let lo=0,hi=1;
  for(let i=0;i<4;i++){if(p[i]===0){if(q[i]<0)return false;continue;}const t=q[i]/p[i];if(p[i]<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}
  return true;
};
const edgeGap=(a,b)=>{
  const dx=Math.abs(a.xMm-b.xMm),dy=Math.abs(a.yMm-b.yMm);
  if(a.technology==="through-hole"&&b.technology==="through-hole")return Math.hypot(dx,dy)-(a.diameterMm+b.diameterMm)/2;
  if(a.technology==="smd"&&b.technology==="smd")return Math.hypot(Math.max(0,dx-(a.widthMm+b.widthMm)/2),Math.max(0,dy-(a.heightMm+b.heightMm)/2));
  const circle=a.technology==="through-hole"?a:b,rect=a.technology==="smd"?a:b;
  return Math.hypot(Math.max(0,dx-rect.widthMm/2),Math.max(0,dy-rect.heightMm/2))-circle.diameterMm/2;
};
export function validateRelayModule(project){
  const errors=[],pcb=project?.pcbFabrication,classes=pcb?.netClasses??[],rules=pcb?.netClassRules??[],routes=pcb?.routes??[],pads=pcb?.pads??[];
  if(!pcb)return {status:"blocked",errors:["Relay PCB data is missing."],checks:[]};
  const classByNet=new Map();
  for(const cls of classes){
    if(!cls.id||!Number.isFinite(cls.clearanceMm)||cls.clearanceMm<=0||!Number.isFinite(cls.traceWidthMm)||cls.traceWidthMm<=0)errors.push("Net class "+(cls.id??"unnamed")+" has invalid clearance or width.");
    for(const net of cls.netIds??[]){if(classByNet.has(net))errors.push("Net "+net+" is assigned to multiple net classes.");classByNet.set(net,cls.id);}
  }
  for(const net of project.nets??[])if(!classByNet.has(net.id))errors.push("Net "+net.id+" is missing a net class.");
  for(const route of routes){
    const cls=classes.find(item=>item.id===classByNet.get(route.netId));
    if(!cls||route.netClassId!==cls.id)errors.push("Route "+route.netId+" does not use its declared net class.");
    else if(route.widthMm+1e-9<cls.traceWidthMm)errors.push("Route "+route.netId+" is narrower than class "+cls.id+" requires.");
  }
  for(const rule of rules){
    const ca=classes.find(cls=>cls.id===rule.classA),cb=classes.find(cls=>cls.id===rule.classB);
    if(!ca||!cb||!Number.isFinite(rule.clearanceMm)||rule.clearanceMm<=0){errors.push("Clearance rule "+rule.classA+"/"+rule.classB+" is invalid.");continue;}
    const padsA=pads.filter(pad=>ca.netIds.includes(pad.netId)),padsB=pads.filter(pad=>cb.netIds.includes(pad.netId));
    for(const first of padsA)for(const second of padsB)if(edgeGap(first,second)+1e-9<rule.clearanceMm)errors.push("Net classes "+ca.id+"/"+cb.id+" violate "+rule.clearanceMm+" mm at "+first.reference+"."+first.number+" and "+second.reference+"."+second.number+".");
  }
  const annotation=(pcb.isolationAnnotations??[]).find(item=>item.classA==="COIL"&&item.classB==="CONTACT");
  const barrier=(pcb.keepouts??[]).find(item=>item.id==="coil-contact-no-copper-barrier");
  if(!annotation||annotation.clearanceMm<3.2||annotation.contactVoltageLimitVdc>24||annotation.contactCurrentLimitA>1||!String(annotation.note??"").includes("not mains rated"))errors.push("Coil/contact isolation annotation is missing required limits.");
  if(!barrier)errors.push("Coil/contact no-copper barrier is missing.");
  else for(const route of routes)for(let i=1;i<(route.pointsMm??[]).length;i++)if(cross(route.pointsMm[i-1],route.pointsMm[i],barrier)){errors.push("Route "+route.netId+" crosses the coil/contact copper barrier.");break;}
  const coilNets=classes.find(cls=>cls.id==="COIL")?.netIds??[],contactNets=classes.find(cls=>cls.id==="CONTACT")?.netIds??[];
  if(!coilNets.length||!contactNets.length||coilNets.some(net=>contactNets.includes(net)))errors.push("Coil and contact net classes are not electrically distinct.");
  const relay=project.components.find(item=>item.libraryId==="relay.omron-g5v1-dc5"),requiredPins=["COIL1","COIL2","COM","NC","NO"];
  if(!relay||requiredPins.some(pin=>!pads.some(pad=>pad.instanceId===relay.instanceId&&pad.pin===pin)))errors.push("Relay coil/contact pad map is incomplete.");
  return {status:errors.length?"failed":"passed",errors,checks:["net class definitions","route width per class","CONTROL/CONTACT and COIL/CONTACT copper clearances","coil/contact no-copper barrier","coil/contact net separation","relay pad map","isolation annotation limits"]};
}
export function createRelayIsolationReport(project){
  const item=project?.pcbFabrication?.isolationAnnotations?.find(entry=>entry.classA==="COIL"&&entry.classB==="CONTACT");
  const q=value=>'"'+String(value).replaceAll('"','""')+'"';
  const rows=[["Domain A","Domain B","Minimum clearance mm","Relay dielectric withstand VAC","Contact voltage limit VDC","Contact current limit A","Annotation"]];
  if(item)rows.push([item.classA,item.classB,item.clearanceMm,item.relayDielectricWithstandVAC,item.contactVoltageLimitVdc,item.contactCurrentLimitA,item.note]);
  return rows.map(row=>row.map(q).join(",")).join("\r\n")+"\r\n";
}
