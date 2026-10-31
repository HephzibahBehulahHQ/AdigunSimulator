import { createEmptyProject, createProject, parseProject, runSupportedAnalysis, serializeProject, updateComponent, validateProject } from "./core.mjs";
import { validatePcbFabrication, exportPcbFabrication } from "./pcb-export.mjs";
import { runSchematicPcbSync } from "./schematic-pcb-sync.mjs";
import { runBotComponentExplainer } from "./bot-component-explainer.mjs";
export const RELEASE_CANDIDATE_FIXTURES=Object.freeze(["examples/001-led-current-limiter.adigun.json","examples/122-555-timer-pcb.adigun.json","examples/182-schematic-pcb-sync.adigun.json","examples/195-bot-explain-component.adigun.json"]);
export function runReleaseCandidateE2EFixtures(samples) {
  if(samples?.candidate?.releaseCandidateE2E?.kind!=="release-candidate-e2e")return {state:"blocked",engine:"Release-candidate end-to-end suite",message:"Release-candidate configuration is missing.",errors:[{code:"RELEASE_CANDIDATE_CONFIG",message:"Provide a release-candidate-e2e project."}],warnings:[],result:null};
  const ids=["001-led-current-limiter","122-555-timer-pcb","182-schematic-pcb-sync","195-bot-explain-component"],inputs=ids.map(id=>samples?.projects?.[id]);
  if(inputs.some(item=>!item))return {state:"blocked",engine:"Release-candidate end-to-end suite",message:"One or more required sample projects are missing.",errors:[{code:"RELEASE_CANDIDATE_FIXTURE",message:"Load examples 001, 122, 182 and 195."}],warnings:[],result:null};
  try {
    const buildValid=validateProject(createEmptyProject({locale:"en"})).valid&&validateProject(createProject()).valid;
    const imported=inputs.map(item=>parseProject(JSON.stringify(item))),importValid=imported.every(item=>validateProject(item).valid);
    const source=imported[0],resistor=source.components.find(item=>item.libraryId==="passive.resistor");
    if(!resistor)throw new Error("Example 001 has no supported resistor to edit.");
    const edited=updateComponent(source,resistor.instanceId,{value:"470 Ω"}),simulation=runSupportedAnalysis(edited);
    const erc=imported.map(validateProject),drc=validatePcbFabrication(imported[1]),pcb=exportPcbFabrication(imported[1]);
    const native=imported.map(item=>parseProject(serializeProject(item))),sync=runSchematicPcbSync(imported[2]);
    const botBefore=serializeProject(imported[3]),bot=runBotComponentExplainer(imported[3]);
    const checks={build:buildValid,import:importValid&&imported.length===4,edit:edited.components.find(item=>item.instanceId===resistor.instanceId)?.value==="470 Ω",simulation:simulation.state==="complete",erc:erc.every(item=>item.valid),drc:drc.status==="passed",export:native.length===4&&native.every(item=>validateProject(item).valid)&&pcb.status==="passed"&&Object.keys(pcb.files).length===4,schematicPcbSync:sync.state==="complete"&&sync.result.netlistPreserved,botPreview:bot.state==="complete"&&bot.result.kind==="bot-grounded-component-explanation"&&bot.result.known.length>0&&serializeProject(imported[3])===botBefore};
    const failed=Object.entries(checks).filter(([,passed])=>!passed).map(([name])=>name);
    if(failed.length)return {state:"blocked",engine:"Release-candidate end-to-end suite",message:"The release-candidate workflow failed: "+failed.join(", ")+".",errors:failed.map(name=>({code:"RELEASE_CANDIDATE_FAILED",message:name})),warnings:[],result:{kind:"release-candidate-e2e",checks}};
    return {state:"complete",engine:"Release-candidate end-to-end suite",message:"Build, import, edit, supported simulation, project ERC, PCB DRC, native/PCB export, schematic-to-PCB sync, and local BOT evidence all passed. PCB output is illustrative, not manufacturing approval.",errors:[],warnings:[{code:"PCB_EXPORT_NOT_MANUFACTURING_APPROVAL",message:"The example 122 fabrication export is educational; verify actual packages, fabrication rules and hardware before manufacturing."}],result:{kind:"release-candidate-e2e",checks,fixtureCount:4,simulatedLedCurrentA:simulation.result.currentA,pcbDrc:drc.status,pcbExportFiles:Object.keys(pcb.files),botSources:["Native project","Checked-in component library"],botMutation:false}};
  } catch(error) {
    return {state:"blocked",engine:"Release-candidate end-to-end suite",message:error instanceof Error?error.message:"Release-candidate workflow failed.",errors:[{code:"RELEASE_CANDIDATE_EXCEPTION",message:error instanceof Error?error.message:"Unexpected error."}],warnings:[],result:null};
  }
}
export async function runReleaseCandidateE2E(project) {
  if(project?.releaseCandidateE2E?.kind!=="release-candidate-e2e")return {state:"blocked",engine:"Release-candidate end-to-end suite",message:"Release-candidate configuration is missing.",errors:[{code:"RELEASE_CANDIDATE_CONFIG",message:"Provide a release-candidate-e2e project."}],warnings:[],result:null};
  try {
    const responses=await Promise.all(RELEASE_CANDIDATE_FIXTURES.map(path=>fetch(path,{headers:{Accept:"application/json"}})));
    const failed=responses.find(response=>!response.ok);
    if(failed)throw new Error("A checked-in release-candidate fixture could not be loaded (HTTP "+failed.status+").");
    const parsed=await Promise.all(responses.map(response=>response.json()));
    const projects=Object.fromEntries(parsed.map(item=>[item.id.replace(/^example-/,""),item]));
    return runReleaseCandidateE2EFixtures({candidate:project,projects});
  } catch(error) {
    return {state:"blocked",engine:"Release-candidate end-to-end suite",message:error instanceof Error?error.message:"The fixtures could not be loaded.",errors:[{code:"RELEASE_CANDIDATE_LOAD",message:error instanceof Error?error.message:"Fixture load failed."}],warnings:[],result:null};
  }
}
