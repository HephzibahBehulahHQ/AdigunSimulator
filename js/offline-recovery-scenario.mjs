import { parseProject, serializeProject, updateComponent, validateProject } from "./core.mjs";
import { readRecoveryDraft, writeRecoveryDraft } from "./recovery-storage.mjs";

export function runOfflineRecoveryScenario(project) {
  if(project?.offlineRecoveryScenario?.kind!=="local-offline-recovery")return {state:"blocked",engine:"Local offline recovery scenario",message:"Recovery scenario configuration is missing.",errors:[{code:"RECOVERY_SCENARIO_CONFIG",message:"Provide a local-offline-recovery fixture."}],warnings:[],result:null};
  const source=project.components?.find(item=>item.instanceId===project.offlineRecoveryScenario.editInstanceId);
  if(!source)return {state:"blocked",engine:"Local offline recovery scenario",message:"The configured edit target is missing.",errors:[{code:"RECOVERY_EDIT_TARGET",message:"Check the fixture editInstanceId."}],warnings:[],result:null};
  const original=serializeProject(project);
  const edited=updateComponent(project,source.instanceId,{value:project.offlineRecoveryScenario.editedValue});
  const memory=new Map();
  const storage={getItem:key=>memory.has(key)?memory.get(key):null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
  const saved=writeRecoveryDraft(storage,"adigun-example-recovery",edited,"2026-10-31T00:00:00.000Z");
  const restored=saved?readRecoveryDraft(storage,"adigun-example-recovery"):null;
  const storageUnavailable={getItem(){throw new Error("Storage unavailable");},setItem(){throw new Error("Storage unavailable");},removeItem(){throw new Error("Storage unavailable");}};
  const fallbackSaved=writeRecoveryDraft(storageUnavailable,"adigun-example-recovery",edited);
  const exportText=serializeProject(edited);
  let exportedProject=null;
  try{exportedProject=parseProject(exportText);}catch{}
  const restoredValue=restored?.project.components.find(item=>item.instanceId===source.instanceId)?.value;
  const exportedValue=exportedProject?.components.find(item=>item.instanceId===source.instanceId)?.value;
  const recoveredWithoutLoss=saved&&restoredValue===project.offlineRecoveryScenario.editedValue&&exportedValue===project.offlineRecoveryScenario.editedValue&&validateProject(restored.project).valid&&validateProject(exportedProject).valid&&serializeProject(project)===original;
  if(!recoveredWithoutLoss)return {state:"blocked",engine:"Local offline recovery scenario",message:"The recovery or manual-export path did not preserve the unsaved edit.",errors:[{code:"RECOVERY_DATA_LOSS",message:"The edited value was not recoverable from both draft and export paths."}],warnings:[],result:{kind:"offline-recovery-scenario",draftSaved:saved,storageFallbackAvailable:!fallbackSaved}};
  return {
    state:"complete",engine:"Local offline recovery scenario",
    message:"The simulated browser draft restores the edit. If browser storage is unavailable, a validated native-project export still preserves it; export before closing the tab.",
    errors:[],warnings:[{code:"RECOVERY_EXPORT_IF_STORAGE_UNAVAILABLE",message:"This deterministic test uses an in-memory storage mock. In a real browser, download File → Export before leaving if draft storage fails."}],
    result:{kind:"offline-recovery-scenario",draftSaved:saved,storageFallbackAvailable:!fallbackSaved,editedValue:restoredValue,restoredProjectValid:true,manualExportValid:true,silentLoss:false,exportAction:"File → Export"}
  };
}
