import { addComponent, connectPins, updateComponent, validateProject } from "./core.mjs";
import { diagnoseFloatingNode } from "./floating-node-diagnosis.mjs";

function fingerprint(project) {
  return JSON.stringify(project);
}

export function buildBotFloatingNodeRepairPreview(project) {
  const diagnosis=diagnoseFloatingNode(project);
  if(!diagnosis.diagnostics||!diagnosis.errors?.some(issue=>issue.code==="FLOATING_DC_NODE")) {
    return {ok:false,error:diagnosis.errors?.[0]?.message??"The configured floating-node diagnosis is unavailable."};
  }
  const config=project.botRepairPreview;
  const target=project.components.find(item=>item.reference===config?.reference);
  const ground=project.components.find(item=>item.libraryId==="ground.signal");
  const floatingNet=project.nets.find(item=>item.id===config?.netId);
  const targetEndpoint=floatingNet?.endpoints.find(item=>item.startsWith(target?.instanceId+":"));
  if(!target||!ground||!targetEndpoint||config?.kind!=="floating-node-bleed-preview") {
    return {ok:false,error:"A configured target pin, floating net, and ground symbol are required for the repair preview."};
  }
  try {
    const baseFingerprint=fingerprint(project);
    let candidate=addComponent(project,"passive.resistor");
    const resistor=candidate.components.at(-1);
    candidate=updateComponent(candidate,resistor.instanceId,{value:"1 MΩ"});
    candidate=connectPins(candidate,targetEndpoint,resistor.instanceId+":1");
    candidate=connectPins(candidate,resistor.instanceId+":2",ground.instanceId+":0");
    const validation=validateProject(candidate);
    if(!validation.valid)return {ok:false,error:"The proposed repair failed project validation.",validation};
    return {
      ok:true,baseFingerprint,candidate,validation,
      proposal:{reference:resistor.reference,libraryId:resistor.libraryId,value:candidate.components.find(item=>item.instanceId===resistor.instanceId).value,from:config.netId,to:"GND"},
      diagnosis:{reference:target.reference,netId:config.netId,issue:diagnosis.errors[0].message},
      warning:"Illustrative 1 MΩ bleed-path proposal only. Check signal loading, intended circuit function, resistor ratings, and the real design before applying."
    };
  } catch(error) {
    return {ok:false,error:error instanceof Error?error.message:"Repair preview could not be constructed."};
  }
}

export function applyBotFloatingNodeRepairPreview(project,preview,{confirmed=false}={}) {
  if(!confirmed)return {ok:false,applied:false,project,message:"No change made; explicit confirmation is required."};
  if(!preview?.ok||preview.baseFingerprint!==fingerprint(project))return {ok:false,applied:false,project,message:"The preview is invalid or the project changed. Rebuild and review the preview."};
  const applied=JSON.parse(JSON.stringify(preview.candidate));
  delete applied.botRepairPreview;
  delete applied.floatingNodeDiagnosis;
  const validation=validateProject(applied);
  if(!validation.valid)return {ok:false,applied:false,project,message:"The proposed project no longer passes validation."};
  return {ok:true,applied:true,project:applied,message:"Confirmed preview applied to the local project."};
}

export function runBotFloatingNodeRepair(project) {
  if(project?.botRepairPreview?.kind!=="floating-node-bleed-preview")return {state:"blocked",engine:"Adigun BOT floating-node repair preview",message:"Repair preview configuration is missing.",errors:[{code:"BOT_REPAIR_CONFIG",message:"Provide a floating-node-bleed-preview configuration."}],warnings:[],result:null};
  const preview=buildBotFloatingNodeRepairPreview(project);
  if(!preview.ok)return {state:"blocked",engine:"Adigun BOT floating-node repair preview",message:preview.error,errors:[{code:"BOT_REPAIR_PREVIEW",message:preview.error}],warnings:[],result:null};
  return {
    state:"complete",engine:"Adigun BOT floating-node repair preview",
    message:"Local proposal only. Nothing was changed; explicit confirmation is required to apply the validated preview.",
    errors:[],warnings:[{code:"BOT_REPAIR_REQUIRES_REVIEW",message:preview.warning}],
    result:{kind:"bot-floating-node-repair-preview",diagnosis:preview.diagnosis,proposal:preview.proposal,validationValid:preview.validation.valid,changeCount:3,applied:false,warning:preview.warning},
    preview
  };
}
