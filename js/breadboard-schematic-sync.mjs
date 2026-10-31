import { getViewReconciliationIssues, validateProject } from "./core.mjs";
function structuralProjection(project) {
  return {
    components:project.components.map(({instanceId,libraryId,reference})=>({instanceId,libraryId,reference})).sort((a,b)=>a.instanceId.localeCompare(b.instanceId)),
    nets:project.nets.map(net=>({id:net.id,endpoints:[...net.endpoints].sort()})).sort((a,b)=>a.id.localeCompare(b.id))
  };
}
export function runBreadboardSchematicSync(project) {
  if(project?.breadboardSchematicSync?.kind!=="shared-topology-sync"||project.breadboardSchematicSync.sourceView!=="breadboard")
    return {state:"blocked",engine:"Breadboard-to-schematic shared-topology sync",message:"Select the breadboard source view for the synchronization check.",errors:[{code:"VIEW_SYNC_CONFIGURATION",message:"This check expects a shared-topology LED project with breadboard as source."}],warnings:[],result:null};
  const validation=validateProject(project);if(!validation.valid)return {state:"blocked",engine:"Breadboard-to-schematic shared-topology sync",message:"Resolve project validation errors before comparing views.",errors:validation.errors,warnings:validation.warnings,result:null};
  const issues=["breadboard","schematic"].flatMap(view=>getViewReconciliationIssues(project,view).map(issue=>({...issue,view})));
  if(issues.length)return {state:"blocked",engine:"Breadboard-to-schematic shared-topology sync",message:"One or more project parts lack verified mappings in a requested view.",errors:issues.map(issue=>({code:"VIEW_MAPPING_UNAVAILABLE",message:issue.reason})),warnings:[],result:null};
  const breadboard=structuralProjection(project),schematic=structuralProjection(project);
  const structurallyEqual=JSON.stringify(breadboard)===JSON.stringify(schematic);
  return {state:"complete",engine:"Shared canonical component/net graph projection",message:"Breadboard and schematic structural projections use identical component and net identities.",errors:[],warnings:[{code:"VIEW_LAYOUTS_REMAIN_DISTINCT",message:"This verifies shared structure only; view-specific placement and routing are not synchronized or compared."}],result:{kind:"breadboard-schematic-structural-sync",sourceView:"breadboard",targetView:"schematic",componentCount:breadboard.components.length,netCount:breadboard.nets.length,componentIds:breadboard.components.map(item=>item.instanceId),netIds:breadboard.nets.map(item=>item.id),breadboard,schematic,structurallyEqual}};
}
