export function runNetCrossProbe(project) {
  const request=project?.crossProbe;
  const net=project.nets?.find(item=>item.id===request?.netId);
  if(!net)return {state:"blocked",engine:"Synchronized net cross-probe",message:"Select a net that exists in the native project.",errors:[{code:"CROSS_PROBE_NET_MISSING",message:"The requested net ID was not found; reload the design and select an existing net."}],warnings:[],result:null};
  const views=["breadboard","schematic","pcb"];
  return {state:"complete",engine:"Shared project net cross-probe",message:"Selection uses the same native net ID in breadboard, schematic, and PCB views.",errors:[],warnings:[{code:"VIEW_RENDER_LIMIT",message:"The cross-probe synchronizes logical selection; each view remains a distinct representation and does not imply completed PCB routing."}],result:{kind:"net-cross-probe",netId:net.id,endpointCount:net.endpoints.length,views,sharedNetId:true},diagnostics:{jumpTarget:{netId:net.id},activeView:"schematic"}};
}
