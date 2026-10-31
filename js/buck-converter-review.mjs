const close=(a,b,limit)=>Math.hypot(a.xMm-b.xMm,a.yMm-b.yMm)<=limit;
const part=(p,ref)=>p.components.find((x)=>x.reference===ref);
const pad=(p,ref,pin)=>p.pcbFabrication?.pads?.find((x)=>x.reference===ref&&x.pin===pin);
export function reviewBuckPowerLayout(project){
 const checks=[], add=(id,ok,detail)=>checks.push({id,status:ok?"pass":"fail",detail}), pcb=project?.pcbFabrication;
 if(!pcb)return {status:"failed",checks:[{id:"pcb-data",status:"fail",detail:"PCB data is missing."}]};
 const classes=new Map((pcb.netClasses??[]).map((x)=>[x.id,x]));
 const routes=new Map((pcb.routes??[]).map((x)=>[x.netId,x]));
 const declared=(pcb.netClasses??[]).flatMap((x)=>x.netIds??[]);
 const routed=(pcb.routes??[]).map((x)=>x.netId);
 add("net-class-assignment",new Set(declared).size===declared.length&&[...new Set(routed)].every((x)=>declared.includes(x))&&declared.every((x)=>routed.includes(x)),"Every copper net has exactly one declared class and route.");
 const widths={VIN:["POWER_IN",1.5],SW:["SWITCH_NODE",1],VOUT:["POWER_OUT",1.5],GND:["POWER_RETURN",1.5]};
 add("high-current-widths",Object.entries(widths).every(([net,[id,min]])=>{const route=routes.get(net),cls=classes.get(id);return Boolean(route&&cls&&route.netClassId===id&&cls.netIds.includes(net)&&route.widthMm>=min&&cls.traceWidthMm>=min);}),"VIN, SW, VOUT and GND meet the example's declared trace-width floor.");
 const checklist=pcb.powerLayoutReview?.checklist??[];
 add("layout-checklist",checklist.length===6&&checklist.every((x)=>x.status==="pass"),"All declared switcher layout review items are marked passed.");
 const uin=pad(project,"U1","VIN"),usw=pad(project,"U1","SW"),ugnd=pad(project,"U1","GND"),dK=pad(project,"D1","K"),dA=pad(project,"D1","A"),c4p=pad(project,"C4","1"),c4m=pad(project,"C4","2");
 add("input-bypass-placement",Boolean(uin&&ugnd&&c4p&&c4m&&close(uin,c4p,8)&&close(ugnd,c4m,14)),"Input bypass pads are placed near regulator input and return.");
 add("catch-diode-placement",Boolean(usw&&ugnd&&dK&&dA&&close(usw,dK,8)&&close(ugnd,dA,8)),"Schottky cathode is near SW and anode is near the power return.");
 const buck=part(project,"U1"),l=part(project,"L1");
 const net=(n,c,p)=>Boolean(c&&project.nets.find((x)=>x.id===n)?.endpoints.includes(c.instanceId+":"+p));
 add("switch-inductor-loop",Boolean(buck&&l&&net("SW",buck,"SW")&&net("SW",part(project,"D1"),"K")&&net("SW",l,"1")&&net("VOUT",l,"2")),"SW reaches the catch diode and inductor; the inductor alone feeds VOUT.");
 add("feedback-sense",Boolean(buck&&pad(project,"U1","FB")?.netId==="VOUT"&&pad(project,"U1","SW")?.netId==="SW"),"LM2596 fixed-output feedback senses VOUT and remains distinct from SW.");
 add("switch-node-copper",Boolean(routes.get("SW")&&routes.get("SW").pointsMm.length<=3&&routes.get("SW").widthMm<=1.2),"Switch-node route is kept to a compact three-point path.");
 return {status:checks.every((x)=>x.status==="pass")?"passed":"failed",checks,disclaimer:"Educational single-layer PCB review only; the bounded DRC and routing checklist do not establish output regulation, ripple, efficiency, thermal performance, EMC, current capability, or manufacturing approval."};
}
export function createPowerLayoutReport(project){
 const r=reviewBuckPowerLayout(project), rows=[["Check","Status","Detail"],...r.checks.map((x)=>[x.id,x.status,x.detail]),["Scope","informational",r.disclaimer]];
 return rows.map((row)=>row.map((x)=>'"'+String(x).replaceAll('"','""')+'"').join(",")).join("\r\n")+"\r\n";
}
