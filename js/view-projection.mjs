import { findLibraryPart, getViewReconciliationIssues, validateProject } from "./core.mjs";
import { MANUFACTURER_PART_RECORDS } from "./part-catalogue.mjs";

const breadboardRestrictions = new Map(MANUFACTURER_PART_RECORDS
  .filter(part => part.breadboard?.compatible === false && part.breadboard.adapter)
  .map(part => [`${part.manufacturer}:${part.manufacturerPartNumber}`, part.breadboard.adapter]));

function declaredNonPhysical(project, view) {
  if (view === "schematic") return new Set();
  const items = view === "breadboard" ? project?.breadboard?.nonPhysicalItems : project?.pcbFabrication?.nonPhysicalItems;
  return new Set((items ?? []).map(item => item.instanceId));
}

function componentViewIssue(project, component, view) {
  const capabilityIssue = getViewReconciliationIssues({ components: [component] }, view)[0];
  const part = findLibraryPart(component.libraryId);
  if (view === "schematic" && component.libraryId === "input.ir-nec-optical-fixture") return capabilityIssue ?? null;
  if (!part?.pins?.length) return capabilityIssue ?? { instanceId: component.instanceId, reference: component.reference, view, reason: "The component has no verified pin mapping in the current library." };
  if (view === "breadboard") {
    if (declaredNonPhysical(project, view).has(component.instanceId)) return null;
    const physicalPart = project?.pcbFabrication?.parts?.find(item => item.instanceId === component.instanceId);
    const adapter = physicalPart && breadboardRestrictions.get(`${physicalPart.manufacturer}:${physicalPart.manufacturerPartNumber}`);
    if (adapter) {
      return { instanceId: component.instanceId, reference: component.reference, view, reason: `${component.reference} requires an adapter for breadboard placement. ${adapter}` };
    }
    const holes = project?.breadboard?.pinHoles ?? {};
    const allPinsMapped = part.pins.every(pin => {
      const hole = holes[`${component.instanceId}:${pin}`];
      return typeof hole === "string" && /^(?:[A-J]\d{1,2}|(?:TP|TM|BP|BM)\d{1,2})$/i.test(hole.trim());
    });
    return allPinsMapped || !capabilityIssue ? null : capabilityIssue;
  }
  if (view === "pcb") {
    if (declaredNonPhysical(project, view).has(component.instanceId)) return null;
    const fabrication = project?.pcbFabrication;
    const physicalPart = fabrication?.parts?.find(item => item.instanceId === component.instanceId);
    const mappedPads = fabrication?.pads?.filter(pad => pad.instanceId === component.instanceId) ?? [];
    const pinsMapped = part.pins.every(pin => mappedPads.filter(pad => pad.pin === pin).length === 1);
    return physicalPart?.footprint && physicalPart?.manufacturerPartNumber && physicalPart?.sourceUrl && pinsMapped
      ? null
      : part.mappingDiagnostics?.pcb
        ? { instanceId: component.instanceId, reference: component.reference, view, reason: part.mappingDiagnostics.pcb }
        : { instanceId: component.instanceId, reference: component.reference, view, reason: `${component.reference} has no complete source-backed PCB footprint and pad map.` };
  }
  return capabilityIssue ?? null;
}

export function projectComponentsForView(project, view) {
  const virtual = declaredNonPhysical(project, view);
  const reconciliationItems = (project?.components ?? []).filter(component => !virtual.has(component.instanceId)).map(component => componentViewIssue(project, component, view)).filter(Boolean);
  const excluded = new Set(reconciliationItems.map(item => item.instanceId));
  return { components: (project?.components ?? []).filter(component => !excluded.has(component.instanceId) && !virtual.has(component.instanceId)), reconciliationItems };
}

// A component is placed in a physical view only when its instance-level pin map is complete.
export function unresolvedComponentsForDisplay(project, view) {
  const virtual = declaredNonPhysical(project, view);
  return (project?.components ?? []).filter(component => !virtual.has(component.instanceId)).map(component => componentViewIssue(project, component, view)).filter(Boolean);
}

export function runUnsupportedBreadboardPackage(project) {
  const cfg=project?.unsupportedBreadboardPackage;
  if(cfg?.kind!=="view-capability-reconciliation"||cfg.view!=="breadboard"||typeof cfg.instanceId!=="string")return {state:"blocked",engine:"View capability reconciliation",message:"Declare the unsupported component and view.",errors:[{code:"VIEW_RECONCILIATION_CONFIGURATION",message:"An instance and target view are required."}],warnings:[],result:null};
  const validation=validateProject(project);if(!validation.valid)return {state:"blocked",engine:"View capability reconciliation",message:"Resolve project schema errors before projecting the view.",errors:validation.errors,warnings:[],result:null};
  const target=project.components.find(component=>component.instanceId===cfg.instanceId);if(!target)return {state:"blocked",engine:"View capability reconciliation",message:"The declared target component is missing.",errors:[{code:"VIEW_RECONCILIATION_TARGET",message:"Target instance does not exist."}],warnings:[],result:null};
  const projections=Object.fromEntries(["breadboard","schematic","pcb"].map(view=>[view,projectComponentsForView(project,view)]));
  const breadboard=projections.breadboard,issue=breadboard.reconciliationItems.find(item=>item.instanceId===cfg.instanceId),placed=breadboard.components.some(component=>component.instanceId===cfg.instanceId);
  if(!issue||placed)return {state:"blocked",engine:"View capability reconciliation",message:"Unsupported parts must be reported and excluded from the breadboard placement projection.",errors:[{code:"UNSUPPORTED_PART_PLACED",message:"An unsupported package was not correctly reconciled."}],warnings:[],result:null};
  return {state:"complete",engine:"Library view-capability projection",message:"The package remains in the project and appears as a breadboard reconciliation item; no unsupported placement is rendered.",errors:[],warnings:[{code:"BREADBOARD_PACKAGE_UNSUPPORTED",message:"The conceptual BGA has no breadboard mapping; its stored coordinate is not a physical placement."}],result:{kind:"unsupported-breadboard-package-reconciliation",componentCount:project.components.length,instanceId:target.instanceId,reference:target.reference,package:target.libraryId,breadboardPlaced:false,breadboardReconciliationCount:breadboard.reconciliationItems.length,breadboardReconciliation:issue,schematicPlaced:projections.schematic.components.some(component=>component.instanceId===target.instanceId),pcbPlaced:projections.pcb.components.some(component=>component.instanceId===target.instanceId),fabricationQualified:project.pcbFabrication?.bgaEscapePlan?.fabricationQualified===true,claimsManufacturable:project.pcbFabrication?.bgaEscapePlan?.claimsManufacturable===true}};
}

