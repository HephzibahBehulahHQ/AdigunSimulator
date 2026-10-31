import { findLibraryPart } from "./core.mjs";

export function explainComponent(project, target) {
  const component=(project?.components??[]).find(item=>item.instanceId===target||item.reference===target);
  if (!component) return {ok:false,error:"Select a component in the current project first."};
  const part=findLibraryPart(component.libraryId);
  if (!part) return {ok:false,error:"This component is not in the checked-in library, so its identity cannot be verified."};
  const known=[
    {field:"Reference",value:component.reference,source:"Native project"},
    {field:"Configured value",value:component.value||"Not set",source:"Native project"},
    {field:"Library description",value:part.type,source:"Checked-in component library"},
    {field:"Library pins",value:Array.isArray(part.pins)?part.pins.join(", "):"Not recorded",source:"Checked-in component library"},
    {field:"Supported views",value:["breadboard","schematic","pcb"].filter(view=>part.views?.[view]).join(", ")||"None recorded",source:"Checked-in component library"},
    {field:"Simulation model",value:part.simulation??"None declared",source:"Checked-in component library"},
    {field:"Library status",value:part.status??"Not recorded",source:"Checked-in component library"}
  ];
  const unknown=[];
  if(!part.manufacturer)unknown.push("Manufacturer is not recorded in this library entry.");
  if(!part.mpn)unknown.push("Manufacturer part number (MPN) is not recorded.");
  if(!part.datasheet)unknown.push("A verified datasheet link is not recorded.");
  const answer="For "+component.reference+", the project records "+(component.value||"no configured value")+"; the checked-in library describes it as "+part.type+". Sources: "+known.map(item=>item.source).filter((source,index,array)=>array.indexOf(source)===index).join(" and ")+". "+(unknown.length?"Unknown: "+unknown.join(" "):"The library entry includes manufacturer, MPN, and datasheet fields.");
  return {ok:true,kind:"bot-grounded-component-explanation",reference:component.reference,known,unknown,answer,scope:"Local project and checked-in library fields only; no external AI or web lookup."};
}

export function runBotComponentExplainer(project) {
  const config=project?.botExplainComponent;
  if(config?.kind!=="grounded-component-explanation")return {state:"blocked",engine:"Adigun BOT local component explainer",message:"Component explanation configuration is missing.",errors:[{code:"BOT_COMPONENT_CONFIG",message:"Provide a grounded-component-explanation target."}],warnings:[],result:null};
  const explanation=explainComponent(project,config.target);
  if(!explanation.ok)return {state:"blocked",engine:"Adigun BOT local component explainer",message:explanation.error,errors:[{code:"BOT_COMPONENT_UNKNOWN",message:explanation.error}],warnings:[],result:null};
  return {state:"complete",engine:"Adigun BOT local component explainer",message:explanation.scope,errors:[],warnings:explanation.unknown.map(message=>({code:"BOT_FIELD_UNKNOWN",message})),result:explanation};
}
