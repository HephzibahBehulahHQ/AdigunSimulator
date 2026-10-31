import { findLibraryPart, validateProject } from "./core.mjs";
export function runSchematicPcbSync(project) {
  const cfg=project?.schematicPcbSync;
  if(cfg?.kind!=="netlist-pad-map-audit"||cfg.mappingStatus!=="illustrative-unverified"||!Array.isArray(cfg.padMap))
    return {state:"blocked",engine:"Schematic-to-PCB net/pad sync audit",message:"Provide an explicitly illustrative, unverified pad map for this structural audit.",errors:[{code:"PCB_SYNC_CONFIGURATION",message:"The pad map must be explicitly marked illustrative-unverified."}],warnings:[],result:null};
  const validation=validateProject(project);if(!validation.valid)return {state:"blocked",engine:"Schematic-to-PCB net/pad sync audit",message:"Resolve schematic project errors before checking its pad map.",errors:validation.errors,warnings:validation.warnings,result:null};
  const components=new Map(project.components.map(component=>[component.reference,component])),mapping=new Map(),usedPads=new Set(),errors=[];
  for(const row of cfg.padMap){const component=components.get(row?.reference),part=component&&findLibraryPart(component.libraryId);const key=row?.reference+":"+row?.pin,padKey=row?.reference+":"+row?.pad;
    if(!component||!part?.pins.includes(row.pin)||typeof row.pad!=="string"||!row.pad||mapping.has(key)||usedPads.has(padKey)){errors.push("Invalid, duplicate, or incompatible reference/pin/pad mapping: "+key);continue;}
    mapping.set(key,row.pad);usedPads.add(padKey);
  }
  const expectedPins=project.components.flatMap(component=>{const part=findLibraryPart(component.libraryId);return (part?.pins??[]).map(pin=>component.reference+":"+pin);});
  const missingPins=expectedPins.filter(key=>!mapping.has(key));
  if(missingPins.length)errors.push("The pad map is missing component pins: "+missingPins.join(", "));
  const netPadMap=project.nets.map(net=>({netId:net.id,schematicEndpoints:[...net.endpoints].sort(),pcbPads:net.endpoints.map(endpoint=>{const [instanceId,pin]=endpoint.split(":");const component=project.components.find(item=>item.instanceId===instanceId);return component?component.reference+":"+mapping.get(component.reference+":"+pin):null;}).sort()}));
  if(netPadMap.some(net=>net.pcbPads.some(pad=>pad===null)))errors.push("Every schematic endpoint must resolve to exactly one mapped PCB pad.");
  const sourceEndpointCount=netPadMap.reduce((sum,net)=>sum+net.schematicEndpoints.length,0),padEndpointCount=netPadMap.reduce((sum,net)=>sum+net.pcbPads.length,0);
  if(errors.length)return {state:"blocked",engine:"Schematic-to-PCB net/pad sync audit",message:"The proposed pad map is incomplete or inconsistent; no transfer report was accepted.",errors:errors.map(message=>({code:"PCB_PAD_MAP_INVALID",message})),warnings:[],result:null};
  return {state:"complete",engine:"Schematic netlist projected through explicit illustrative pad map",message:"All schematic pin endpoints map one-to-one to pad references while preserving net IDs.",errors:[],warnings:[{code:"PCB_FOOTPRINT_NOT_VERIFIED",message:"The mapping is illustrative and unverified; this is not a manufacturer footprint, physical pad geometry, PCB export approval, or DRC/manufacturing check."}],result:{kind:"schematic-pcb-netlist-pad-sync",componentCount:project.components.length,netCount:project.nets.length,mappedPinCount:mapping.size,sourceEndpointCount,padEndpointCount,netlistPreserved:sourceEndpointCount===padEndpointCount&&netPadMap.every(net=>net.pcbPads.length===net.schematicEndpoints.length),mappingStatus:cfg.mappingStatus,netPadMap}};
}
