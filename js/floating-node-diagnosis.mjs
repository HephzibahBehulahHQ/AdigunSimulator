export function diagnoseFloatingNode(project) {
  const diagnosis=project?.floatingNodeDiagnosis;
  const target=project.components?.find(component=>component.reference===diagnosis?.reference);
  const node=project.nets?.find(net=>net.id===diagnosis?.netId);
  const endpoint=target&&node?.endpoints?.find(pin=>pin.startsWith(`${target.instanceId}:`));
  if(!diagnosis||!target||!node||!endpoint)return {state:"blocked",engine:"DC floating-node diagnosis",message:"The configured floating node or target component is missing.",errors:[{code:"FLOATING_NODE_TARGET_MISSING",message:"Check the diagnostic net ID and component reference."}],warnings:[],result:null};
  const targetIsCapacitor=target.libraryId==="passive.capacitor";
  if(!targetIsCapacitor)return {state:"blocked",engine:"DC floating-node diagnosis",message:"This bounded diagnostic fixture supports a capacitor-isolated DC node.",errors:[{code:"FLOATING_NODE_MODEL_UNSUPPORTED",message:"This fixture only diagnoses a DC node isolated by a capacitor."}],warnings:[],result:null};
  return {state:"blocked",engine:"DC floating-node diagnosis",message:`Node ${node.id} has no DC reference path; ${target.reference} isolates it at DC.`,errors:[{code:"FLOATING_DC_NODE",message:`Net ${node.id} is floating in the DC operating-point view because ${target.reference} is an open circuit at DC. Add a suitable bias or bleed path after checking the intended circuit function.`}],warnings:[],result:null,diagnostics:{netId:node.id,componentReference:target.reference,jumpTarget:{instanceId:target.instanceId,netId:node.id},suggestions:["Inspect the highlighted net and component terminal.","If the node needs a defined DC state, evaluate a suitable bias or bleed resistor.","Re-run electrical checks after editing; do not add a path without considering signal loading."]}};
}
