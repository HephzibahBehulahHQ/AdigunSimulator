import { netEdges } from "./net-edges.mjs";

export const wirePairKey = (a,b) => JSON.stringify([a,b].sort());
export const wirePointValid = p => Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<=100000);
export function validateSchematicWires(project,pinExists) {
  if(project.schematicWires===undefined)return [];
  const errors=[],ids=new Set(),pairs=new Set();
  const fail=message=>errors.push({rule:"SCHEMATIC_WIRE",message});
  if(!Array.isArray(project.schematicWires)||project.schematicWires.length>5000){fail("Schematic wires must be an array of at most 5000 paths.");return errors;}
  const edges=new Set((Array.isArray(project.nets)?project.nets:[]).filter(n=>Array.isArray(n?.endpoints)).flatMap(n=>netEdges(n).filter(e=>Array.isArray(e)&&e.length===2).map(e=>wirePairKey(...e))));
  for(const w of project.schematicWires){
    if(!w||typeof w!=="object"||typeof w.id!=="string"||!w.id.trim()||w.id.length>100||ids.has(w.id)){fail("Each schematic wire needs a unique identifier.");continue;}
    ids.add(w.id);
    if(w.netHint!==undefined&&(typeof w.netHint!=="string"||!w.netHint.trim()||w.netHint.length>200))fail(`Wire ${w.id} has an invalid original net name.`);
    if(typeof w.from!=="string"||!pinExists(w.from)||!(w.to===null||typeof w.to==="string"&&pinExists(w.to)&&w.to!==w.from))fail(`Wire ${w.id} references an unknown or identical terminal.`);
    if(!Array.isArray(w.waypoints)||w.waypoints.length>512||!w.waypoints.every(wirePointValid))fail(`Wire ${w.id} needs at most 512 finite drawing-coordinate waypoints.`);
    if(w.to===null){if(!wirePointValid(w.end))fail(`Dangling wire ${w.id} needs a finite endpoint.`);}
    else {const key=wirePairKey(w.from,w.to);if(!edges.has(key)||pairs.has(key))fail(`Wire ${w.id} must map uniquely to an existing native electrical edge.`);pairs.add(key);if(w.end!==undefined)fail(`Connected wire ${w.id} must not have a dangling endpoint.`);}
  }
  return errors;
}
