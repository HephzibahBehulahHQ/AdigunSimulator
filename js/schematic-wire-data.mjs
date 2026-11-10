import { validateWireAppearance } from "./project-appearance.mjs";
import { netEdges } from "./net-edges.mjs";
import { sameJunctionPoint } from "./schematic-junction-graph.mjs";

export const wirePairKey = (a,b) => JSON.stringify([a,b].sort());
export const wirePointValid = p => Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<=100000);
export function validateSchematicWires(project,pinExists) {
  if(project.schematicWires===undefined)return validateSchematicJunctions(project);
  const errors=[],ids=new Set(),pairs=new Set();
  const fail=message=>errors.push({rule:"SCHEMATIC_WIRE",message});
  if(!Array.isArray(project.schematicWires)||project.schematicWires.length>5000){fail("Schematic wires must be an array of at most 5000 paths.");return errors;}
  const edges=new Set((Array.isArray(project.nets)?project.nets:[]).filter(n=>Array.isArray(n?.endpoints)).flatMap(n=>netEdges(n).filter(e=>Array.isArray(e)&&e.length===2).map(e=>wirePairKey(...e))));
  for(const w of project.schematicWires){
    if(!w||typeof w!=="object"||typeof w.id!=="string"||!w.id.trim()||w.id.length>100||ids.has(w.id)){fail("Each schematic wire needs a unique identifier.");continue;}
    ids.add(w.id);
    if(!validateWireAppearance(w.appearance))fail(`Wire ${w.id} has invalid color, area or AWG annotations.`);
    if(w.netHint!==undefined&&(typeof w.netHint!=="string"||!w.netHint.trim()||w.netHint.length>200))fail(`Wire ${w.id} has an invalid original net name.`);
    if(typeof w.from!=="string"||!pinExists(w.from)||!(w.to===null||typeof w.to==="string"&&pinExists(w.to)&&w.to!==w.from))fail(`Wire ${w.id} references an unknown or identical terminal.`);
    if(!Array.isArray(w.waypoints)||w.waypoints.length>512||!w.waypoints.every(wirePointValid))fail(`Wire ${w.id} needs at most 512 finite drawing-coordinate waypoints.`);
    if(w.to===null){if(!wirePointValid(w.end))fail(`Dangling wire ${w.id} needs a finite endpoint.`);}
    else {const key=wirePairKey(w.from,w.to);if(!edges.has(key)||pairs.has(key))fail(`Wire ${w.id} must map uniquely to an existing native electrical edge.`);pairs.add(key);if(w.end!==undefined)fail(`Connected wire ${w.id} must not have a dangling endpoint.`);}
  }
  return [...errors,...validateSchematicJunctions(project)];
}

export function validateSchematicJunctions(project){
  if(project.schematicJunctions===undefined)return [];
  const errors=[],fail=message=>errors.push({rule:'SCHEMATIC_JUNCTION',message});
  if(!Array.isArray(project.schematicJunctions)||project.schematicJunctions.length>1000){fail('Junctions must be an array of at most 1000 nodes.');return errors;}
  const wires=Array.isArray(project.schematicWires)?project.schematicWires.filter(w=>w&&Array.isArray(w.waypoints)):[],nets=Array.isArray(project.nets)?project.nets.filter(n=>Array.isArray(n?.endpoints)):[];
  const edges=new Set(nets.flatMap(n=>netEdges(n).filter(e=>Array.isArray(e)&&e.length===2).map(e=>wirePairKey(...e))));
  const paths=new Set(wires.filter(w=>w.to!==null).map(w=>wirePairKey(w.from,w.to))),ids=new Set(),owned=new Set(),positions=[];
  for(const j of project.schematicJunctions){
    if(!j||typeof j.id!=='string'||!j.id.trim()||j.id.length>100||ids.has(j.id)){fail('Each junction needs a unique identifier.');continue;}ids.add(j.id);
    if(!wirePointValid(j.point)||positions.some(p=>sameJunctionPoint(p,j.point)))fail(`Junction ${j.id} needs a unique finite drawing position.`);positions.push(j.point);
    if(!Array.isArray(j.wires)||j.wires.length<2||j.wires.length>64||new Set(j.wires).size!==j.wires.length){fail(`Junction ${j.id} needs 2–64 distinct branches.`);continue;}
    const members=j.wires.map(id=>wires.find(w=>w.id===id));
    if(members.some(w=>!w||[...w.waypoints,...(w.to===null?[w.end]:[])].filter(p=>sameJunctionPoint(p,j.point)).length!==1)){fail(`Junction ${j.id} must be anchored exactly once on each referenced wire.`);continue;}
    if(!nets.some(n=>members.every(w=>n.endpoints.includes(w.from))))fail(`Junction ${j.id} branches must belong to one native electrical net.`);
    if(!Array.isArray(j.bridges)||j.bridges.length>j.wires.length-1){fail(`Junction ${j.id} has invalid native bridge edges.`);continue;}
    const origins=new Set(members.map(w=>w.from));
    for(const edge of j.bridges){
      if(!Array.isArray(edge)||edge.length!==2||edge[0]===edge[1]||!edge.every(p=>origins.has(p))){fail(`Junction ${j.id} has an invalid terminal bridge.`);continue;}
      const key=wirePairKey(...edge);if(!edges.has(key)||paths.has(key)||owned.has(key))fail(`Junction ${j.id} bridge must uniquely own an existing native edge.`);owned.add(key);
    }
  }
  return errors;
}
