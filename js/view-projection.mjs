import { getViewReconciliationIssues, validateProject } from "./core.mjs";

export function projectComponentsForView(project,view) {
  const reconciliationItems=getViewReconciliationIssues(project,view),excluded=new Set(reconciliationItems.map(item=>item.instanceId));
  return {components:(project?.components??[]).filter(component=>!excluded.has(component.instanceId)),reconciliationItems};
}

export function runUnsupportedBreadboardPackage(project) {
  const cfg=project?.unsupportedBreadboardPackage;
  if(cfg?.kind!=="view-capability-reconciliation"||cfg.view!=="breadboard"||typeof cfg.instanceId!=="string")return {state:"blocked",engine:"View capability reconciliation",message:"Declare the unsupported component and view.",errors:[{code:"VIEW_RECONCILIATION_CONFIGURATION",message:"An instance and target view are required."}],warnings:[],result:null};
  const validation=validateProject(project);if(!validation.valid)return {state:"blocked",engine:"View capability reconciliation",message:"Resolve project schema errors before projecting the view.",errors:validation.errors,warnings:[],result:null};
  const target=project.components.find(component=>component.instanceId===cfg.instanceId);if(!target)return {state:"blocked",engine:"View capability reconciliation",message:"The declared target component is missing.",errors:[{code:"VIEW_RECONCILIATION_TARGET",message:"Target instance does not exist."}],warnings:[],result:null};
  const projections=Object.fromEntries(["breadboard","schematic","pcb"].map(view=>[view,projectComponentsForView(project,view)]));
  const breadboard=projections.breadboard,issue=breadboard.reconciliationItems.find(item=>item.instanceId===cfg.instanceId),placed=breadboard.components.some(component=>component.instanceId===cfg.instanceId);
  if(!issue||placed)return {state:"blocked",engine:"View capability reconciliation",message:"Unsupported parts must be reported and excluded from the breadboard placement projection.",errors:[{code:"UNSUPPORTED_PART_PLACED",message:"An unsupported package was not correctly reconciled."}],warnings:[],result:null};
  return {state:"complete",engine:"Library view-capability projection",message:"The package remains in the project and appears as a breadboard reconciliation item; no unsupported placement is rendered.",errors:[],warnings:[{code:"BREADBOARD_PACKAGE_UNSUPPORTED",message:"The conceptual BGA has no breadboard mapping; its stored coordinate is not a physical placement."}],result:{kind:"unsupported-breadboard-package-reconciliation",componentCount:project.components.length,instanceId:target.instanceId,reference:target.reference,package:target.libraryId,breadboardPlaced:false,breadboardReconciliationCount:breadboard.reconciliationItems.length,breadboardReconciliation:issue,schematicPlaced:projections.schematic.components.some(component=>component.instanceId===cfg.instanceId),pcbPlaced:projections.pcb.components.some(component=>component.instanceId===cfg.instanceId),fabricationQualified:project.pcbFabrication?.bgaEscapePlan?.fabricationQualified===true,claimsManufacturable:project.pcbFabrication?.bgaEscapePlan?.claimsManufacturable===true}};
}