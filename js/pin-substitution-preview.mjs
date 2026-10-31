import { findLibraryPart, parseProject, serializeProject, updateComponent, validateProject } from "./core.mjs";

export function createPartSubstitutionPreview(project) {
  const cfg=project?.substitutionPreview,validation=validateProject(project);
  if(!validation.valid)return {state:"blocked",errors:validation.errors};
  if(cfg?.kind!=="pin-map-compatibility-preview")return {state:"blocked",errors:[{code:"SUBSTITUTION_PREVIEW_CONFIG",message:"Declare a pin-map compatibility preview."}]};
  const source=project.components.find(component=>component.instanceId===cfg.targetInstanceId),sourcePart=source&&findLibraryPart(source.libraryId),candidate=findLibraryPart(cfg.candidateLibraryId);
  if(!source||!sourcePart||!candidate)return {state:"blocked",errors:[{code:"SUBSTITUTION_PART_MISSING",message:"The original or candidate library part is unavailable."}]};
  const usedPins=project.nets.flatMap(net=>net.endpoints.filter(endpoint=>endpoint.startsWith(source.instanceId+":")).map(endpoint=>endpoint.slice(source.instanceId.length+1))),candidatePins=new Set(candidate.pins),sharedPinNames=sourcePart.pins.filter(pin=>candidatePins.has(pin)),unmappedUsedPins=[...new Set(usedPins)].filter(pin=>!candidatePins.has(pin));
  const affectedNets=project.nets.filter(net=>net.endpoints.some(endpoint=>endpoint.startsWith(source.instanceId+":"))).map(net=>net.id),compatible=unmappedUsedPins.length===0&&sharedPinNames.length===sourcePart.pins.length;
  const sourceSnapshot=serializeProject(project),candidateDraft=updateComponent(project,source.instanceId,{libraryId:candidate.id});
  return {state:"complete",blocked:!compatible,sourceSnapshot,sourcePart,candidate,candidateDraft,sharedPinNames,unmappedUsedPins,affectedNets,originalReference:source.reference,originalLibraryId:source.libraryId,originalValue:source.value};
}

export function cancelPartSubstitutionPreview(preview) {
  if(!preview?.sourceSnapshot)return {cancelled:false,project:null};
  return {cancelled:true,project:parseProject(preview.sourceSnapshot)};
}

export function runPinIncompatibleSubstitution(project) {
  const preview=createPartSubstitutionPreview(project);
  if(preview.state!=="complete")return {state:"blocked",engine:"Pin-map substitution preview",message:"The substitution preview could not be prepared.",errors:preview.errors,warnings:[],result:null};
  const cancelled=cancelPartSubstitutionPreview(preview),projectUnchanged=cancelled.cancelled&&serializeProject(cancelled.project)===preview.sourceSnapshot;
  return {state:"complete",engine:"Pin-map compatibility preview and cancel/restore",message:preview.blocked&&projectUnchanged?"Substitution is blocked because pin roles do not map; cancelling restores the unchanged original project.":"Candidate passes this educational pin-name check.",errors:[],warnings:preview.blocked?[{code:"PIN_MAP_INCOMPATIBLE",message:"Matching package pin count does not establish electrical interchangeability."}]:[],result:{kind:"pin-incompatible-substitution-preview",substitutionBlocked:preview.blocked,previewCancelled:cancelled.cancelled,projectUnchanged,reference:preview.originalReference,originalLibraryId:preview.originalLibraryId,candidateLibraryId:preview.candidate.id,sourcePinCount:preview.sourcePart.pins.length,candidatePinCount:preview.candidate.pins.length,sharedPinNames:preview.sharedPinNames,unmappedUsedPins:preview.unmappedUsedPins,affectedNets:preview.affectedNets,originalValue:preview.originalValue,candidateValuePreview:preview.candidateDraft.components.find(component=>component.instanceId===preview.candidateDraft.substitutionPreview?.targetInstanceId)?.value??preview.originalValue}};
}