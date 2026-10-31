const pin=(project,number)=>project.pcbFabrication?.pads?.find((x)=>x.reference==="U1"&&String(x.number)===String(number));
const netHas=(project,net,instance,pinName)=>Boolean(project.nets.find((x)=>x.id===net)?.endpoints.includes(instance+":"+pinName));
export function reviewFourLayerMcuBoard(project){
 const checks=[],add=(id,ok,detail)=>checks.push({id,status:ok?"pass":"fail",detail}),pcb=project?.pcbFabrication;
 if(!pcb)return {status:"failed",checks:[{id:"pcb-data",status:"fail",detail:"PCB plan data is missing."}]};
 const expected=["PB9","PC14","PC15","VDD_VDDA","VSS_VSSA","NRST","PA0","PA1","PA2","PA3","PA4","PA5","PA6","PA7","PB0","PB1","PB2","PA8","PA9","PC6","PA10","PA11","PA12","PA13_SWDIO","PA14_SWDCLK","PA15","PB3","PB4","PB5","PB6","PB7","PB8"];
 add("lqfp32-pin-map",pcb.pads.filter((x)=>x.reference==="U1").length===32&&expected.every((name,index)=>{const x=pin(project,index+1);return x?.pin===name;}),"Every LQFP32 pad has a unique numbered manufacturer pin-map entry.");
 const required=[["VDD33","mcu","VDD_VDDA"],["GND","mcu","VSS_VSSA"],["VDD33","decouple-hf","1"],["GND","decouple-hf","2"],["VDD33","decouple-bulk","+"],["GND","decouple-bulk","-"]];
 add("no-missing-power-pins",required.every(([net,id,pinName])=>netHas(project,net,id,pinName))&&pin(project,4)?.netId==="VDD33"&&pin(project,5)?.netId==="GND","STM32 VDD/VDDA pin 4 and VSS/VSSA pin 5 are mapped to the power and return nets with both local decouplers.");
 add("swd-header",netHas(project,"SWDIO","mcu","PA13_SWDIO")&&netHas(project,"SWDIO","swd","SWDIO")&&netHas(project,"SWCLK","mcu","PA14_SWDCLK")&&netHas(project,"SWCLK","swd","SWCLK")&&netHas(project,"VDD33","swd","VDD")&&netHas(project,"GND","swd","GND"),"SWD connector power, ground, SWDIO and SWCLK are assigned.");
 const stack=pcb.stackup??[];
 add("four-layer-stackup",pcb.board?.copperLayers?.length===4&&stack.length===4&&stack.map((x)=>x.layer).join("|")==="F.Cu|In1.Cu|In2.Cu|B.Cu","Four copper layers are defined in order.");
 add("reference-and-return-path",stack[1]?.role==="Continuous solid ground plane"&&stack[1]?.primaryNet==="GND"&&stack[0]?.referenceLayer==="In1.Cu"&&stack[3]?.referenceLayer==="In1.Cu"&&pcb.stackupRules?.continuousGroundPlane==="In1.Cu"&&/Do not split/i.test(pcb.stackupRules?.doNotSplitReturnUnder??""),"L2 is a continuous GND reference; outer signal layers reference L2 and return paths must not cross splits.");
 return {status:checks.every((x)=>x.status==="pass")?"passed":"failed",checks,disclaimer:"Stack-up and pin-planning review only. The current PCB exporter handles single-layer F.Cu boards; this four-layer plan has not been routed, DRC-checked, fabricated, or validated for signal/power integrity."};
}
export function createLayerStackupReport(project){
 const review=reviewFourLayerMcuBoard(project),rows=[["Check","Status","Detail"],...review.checks.map((x)=>[x.id,x.status,x.detail]),["Scope","informational",review.disclaimer]];
 return rows.map((row)=>row.map((x)=>'"'+String(x).replaceAll('"','""')+'"').join(",")).join("\r\n")+"\r\n";
}
