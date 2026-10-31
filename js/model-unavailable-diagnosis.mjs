export function reportUnavailableModel(project) {
  const request=project?.modelAvailabilityFixture;
  const component=project.components?.find(item=>item.reference===request?.reference);
  if(!request||request.status!=="unavailable"||!component)return {state:"blocked",engine:"Component model availability check",message:"The requested model record is missing or inconsistent.",errors:[{code:"MODEL_STATUS_CONFIGURATION",message:"Select a component and declare the unavailable model status explicitly."}],warnings:[],result:null};
  return {state:"blocked",engine:"Component model availability check",message:`${component.reference} is shown in the schematic, but its requested ${request.modelName} model is unavailable.`,errors:[{code:"COMPONENT_MODEL_UNAVAILABLE",message:`No executable ${request.modelName} model is installed for ${component.reference}. The component remains a schematic representation and was not simulated.`}],warnings:[],result:null,diagnostics:{componentReference:component.reference,componentId:component.instanceId,status:"unavailable",displayMode:"schematic-only",analysisAttempted:false,requiredAction:"Install and validate a compatible model before simulation."}};
}
