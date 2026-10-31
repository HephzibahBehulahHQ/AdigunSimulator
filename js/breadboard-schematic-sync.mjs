import { findLibraryPart, getViewReconciliationIssues, validateProject } from "./core.mjs";
import { deriveBreadboardSchematicNets } from "./breadboard-topology.mjs";
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
  const physicalSync=deriveBreadboardSchematicNets(project,{getPartPins:libraryId=>findLibraryPart(libraryId)?.pins??[]});
  if(physicalSync.state!=="complete")return {state:"blocked",engine:"Breadboard-to-schematic physical netlist sync",message:physicalSync.message,errors:physicalSync.errors,warnings:physicalSync.warnings,result:null};
  const breadboard=structuralProjection({...project,nets:physicalSync.nets}),schematic=structuralProjection(project);
  const structurallyEqual=JSON.stringify(breadboard)===JSON.stringify(schematic);
  if(!structurallyEqual)return {state:"incomplete",engine:"Breadboard-to-schematic physical netlist sync",message:"Breadboard connections differ from the schematic. Review and apply a physical-to-schematic netlist sync in the breadboard editor.",errors:[],warnings:[{code:"BREADBOARD_SCHEMATIC_NET_MISMATCH",message:"The derived physical nets do not match the canonical schematic netlist."}],result:{kind:"breadboard-schematic-structural-sync",sourceView:"breadboard",targetView:"schematic",componentCount:breadboard.components.length,netCount:breadboard.nets.length,componentIds:breadboard.components.map(item=>item.instanceId),netIds:breadboard.nets.map(item=>item.id),breadboard,schematic,structurallyEqual,physicalNetsMatchSchematic:false,proposedNets:physicalSync.nets}};
  return {state:"complete",engine:"Breadboard-to-schematic physical netlist sync",message:"Physical breadboard wiring resolves to the same canonical netlist used by the schematic and PCB views.",errors:[],warnings:[{code:"VIEW_LAYOUTS_REMAIN_DISTINCT",message:"Component placement remains view-specific; this check confirms physical connectivity maps to shared canonical nets."}],result:{kind:"breadboard-schematic-structural-sync",sourceView:"breadboard",targetView:"schematic",componentCount:breadboard.components.length,netCount:breadboard.nets.length,componentIds:breadboard.components.map(item=>item.instanceId),netIds:breadboard.nets.map(item=>item.id),breadboard,schematic,structurallyEqual,physicalNetsMatchSchematic:true}};
}
