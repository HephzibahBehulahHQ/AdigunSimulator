import { connectPins, findLibraryPart } from "./core.mjs";
import { netEdges, removeNetEdge, reconcileSchematicJunctions } from "./net-edges.mjs";
import { junctionBridgeKeys, sameJunctionPoint } from "./schematic-junction-graph.mjs";
import { schematicPinPoint } from "./schematic-pin-layout.mjs";
import { routeSchematicConnection } from "./schematic-routing.mjs";
import { validateSchematicWires, wirePairKey, wirePointValid } from "./schematic-wire-data.mjs";

export function wirePinPoint(project,endpoint){const [id,...pin]=String(endpoint).split(":"),c=project.components.find(c=>c.instanceId===id);return c?schematicPinPoint(c,findLibraryPart(c.libraryId)?.pins??[],pin.join(":")):null;}
export function snapWirePoint(point,snap=false){if(!wirePointValid(point))throw new Error("Invalid wire point.");return point.map(n=>Math.round(n/(snap?12:.01))*(snap?12:.01));}
const xy=p=>[p.x,p.y];
export function checkedWireProject(project){const next={...project,metadata:{...project.metadata,updatedAt:new Date().toISOString()}};const errors=validateSchematicWires(next,p=>Boolean(wirePinPoint(next,p)));if(errors.length)throw new Error(errors[0].message);return next;}
function updated(project,wires){return checkedWireProject({...project,schematicWires:wires});}
const nextId=project=>{let i=1;while(project.schematicWires?.some(w=>w.id===`W${i}`))i++;return `W${i}`;};
export function storeSchematicWire(project,{id,from,to=null,waypoints=[],end,netHint}){
  const existing=(project.schematicWires??[]).find(w=>to!==null&&wirePairKey(w.from,w.to)===wirePairKey(from,to));
  const wire={id:id??existing?.id??nextId(project),from,to,waypoints:waypoints.map(p=>snapWirePoint(p))};if(to===null){wire.end=snapWirePoint(end);if(netHint)wire.netHint=netHint;}
  return updated(project,[...(project.schematicWires??[]).filter(w=>w.id!==wire.id&&w.id!==existing?.id),wire]);
}
export function finishSchematicWire(project,draft,to){
  // Materialize legacy stars before connecting so unrelated stored edge geometry stays attached.
  const next=connectPins({...project,nets:project.nets.map(n=>({...n,connections:netEdges(n)}))},draft.from,to);
  const net=next.nets.find(n=>n.endpoints.includes(draft.from)&&n.endpoints.includes(to));
  if(draft.netHint&&!next.nets.some(n=>n.id===draft.netHint))net.id=draft.netHint;
  net.connections??=netEdges(net);
  if(!net.connections.some(([a,b])=>wirePairKey(a,b)===wirePairKey(draft.from,to)))net.connections.push([draft.from,to]);
  return storeSchematicWire(next,{id:draft.id,from:draft.from,to,waypoints:draft.waypoints});
}
export function removeSchematicWire(project,selection){
  if(selection.wireId){const w=project.schematicWires?.find(w=>w.id===selection.wireId);if(w?.to===null)return discardDanglingWire(project,w.id);}
  return removeNetEdge(project,selection.netId,selection.first,selection.second);
}
export function discardDanglingWire(project,id){const wires=(project.schematicWires??[]).filter(w=>w.id!==id),junctions=(project.schematicJunctions??[]).map(j=>({...j,wires:j.wires.filter(w=>w!==id)})).filter(j=>j.wires.length>1);return updated(reconcileSchematicJunctions({...project,schematicWires:wires},junctions),wires);}
export function resumeSchematicWire(wire){if(wire.to!==null)throw new Error("Only an open endpoint can resume.");return {id:wire.id,from:wire.from,netHint:wire.netHint,waypoints:[...wire.waypoints.map(p=>[...p]),[...wire.end]]};}
export function joinDanglingWire(project,draft,targetId){
  const target=project.schematicWires?.find(w=>w.id===targetId&&w.to===null);
  if(!target||target.id===draft.id||target.from===draft.from)throw new Error("Choose a different dangling wire with a different source terminal.");
  const next=discardDanglingWire(project,target.id);
  const joined=finishSchematicWire(next,{...draft,netHint:draft.netHint===target.netHint?draft.netHint:undefined,waypoints:[...draft.waypoints,target.end,...target.waypoints.slice().reverse()]},target.from);
  const wire=joined.schematicWires.find(w=>w.from===draft.from&&w.to===target.from);
  const junctions=(project.schematicJunctions??[]).map(j=>({...j,wires:[...new Set(j.wires.map(id=>id===target.id||id===draft.id?wire.id:id))]})).filter(j=>j.wires.length>1);
  return checkedWireProject(reconcileSchematicJunctions(joined,junctions));
}
export function resolveSchematicWires(project,unavailable=new Set()){
  const components=project.components.filter(c=>!unavailable.has(c.instanceId)),previous=[],stored=project.schematicWires??[],result=[],bridges=junctionBridgeKeys(project);
  for(const net of project.nets)for(const [first,second] of netEdges(net)){
    if(bridges.has(wirePairKey(first,second)))continue;
    const w=stored.find(w=>w.to!==null&&wirePairKey(w.from,w.to)===wirePairKey(first,second));
    let points;
    if(w){const a=wirePinPoint(project,w.from),b=wirePinPoint(project,w.to);if(a&&b)points=[xy(a),...w.waypoints,xy(b)];if(w.from!==first)points?.reverse();}
    else points=routeSchematicConnection(components,findLibraryPart,first,second,previous.filter(r=>r.netId!==net.id).map(r=>r.points.map(([x,y])=>({x,y}))),/^(gnd|ground|0)$/i.test(net.id)?"bottom":/^(vcc|vdd|vin|power)$/i.test(net.id)?"top":null)?.map(xy);
    const entry={netId:net.id,first,second,wireId:w?.id??null,points:points??null};result.push(entry);if(points)previous.push(entry);
  }
  for(const w of stored.filter(w=>w.to===null)){const a=wirePinPoint(project,w.from);if(a)result.push({wireId:w.id,first:w.from,second:null,netId:project.nets.find(n=>n.endpoints.includes(w.from))?.id??null,points:[xy(a),...w.waypoints,w.end]});}
  return result;
}
export function editWireRoute(project,route,waypoints){
  let next=project;const old=route.points.slice(1,-1);
  for(const j of project.schematicJunctions??[]){if(!j.wires.includes(route.wireId))continue;const i=old.findIndex(p=>sameJunctionPoint(p,j.point));if(i<0)continue;
    if(waypoints.length!==old.length){if(!waypoints.some(p=>sameJunctionPoint(p,j.point)))throw new Error('Remove the junction explicitly before deleting its waypoint.');}
    else if(!sameJunctionPoint(waypoints[i],j.point))next=moveSchematicJunction(next,j.id,waypoints[i]);
  }
  return storeSchematicWire(next,{id:route.wireId,from:route.first,to:route.second,waypoints,end:route.second===null?route.points.at(-1):undefined,netHint:project.schematicWires?.find(w=>w.id===route.wireId)?.netHint});
}
export function moveSchematicJunction(project,id,point){
  const j=project.schematicJunctions?.find(j=>j.id===id);if(!j)throw new Error('Junction not found.');point=snapWirePoint(point);
  const wires=project.schematicWires.map(w=>j.wires.includes(w.id)?{...w,waypoints:w.waypoints.map(p=>sameJunctionPoint(p,j.point)?point:p),...(w.to===null&&sameJunctionPoint(w.end,j.point)?{end:point}:{})}:w);
  return checkedWireProject({...project,schematicWires:wires,schematicJunctions:project.schematicJunctions.map(item=>item===j?{...j,point}:item)});
}
export function nearestWireSegment(points,point){let best=null;for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;if(!length)continue;const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/length)),p=[a[0]+t*dx,a[1]+t*dy],distance=Math.hypot(point[0]-p[0],point[1]-p[1]);if(!best||distance<best.distance)best={index:i,t,point:p,distance};}return best;}
export function splitSchematicWire(project,route){
  if(!route.second)throw new Error("Select a connected wire to split.");
  let index=0,length=0;for(let i=0;i<route.points.length-1;i++){const d=Math.hypot(route.points[i+1][0]-route.points[i][0],route.points[i+1][1]-route.points[i][1]);if(d>length){length=d;index=i;}}
  if(length<24)throw new Error("Wire segment is too short to create two separately selectable open endpoints.");
  const a=route.points[index],b=route.points[index+1],at=t=>a.map((v,i)=>v+(b[i]-v)*t);
  let next=removeNetEdge(project,route.netId,route.first,route.second);
  next=storeSchematicWire(next,{from:route.first,netHint:route.netId,waypoints:route.points.slice(1,index+1),end:at(.5-8/length)});
  const left=next.schematicWires.at(-1);
  next=storeSchematicWire(next,{from:route.second,netHint:route.netId,waypoints:route.points.slice(index+1,-1).reverse(),end:at(.5+8/length)});
  const right=next.schematicWires.at(-1),junctions=(project.schematicJunctions??[]).map(j=>({...j,wires:j.wires.flatMap(id=>id!==route.wireId?[id]:[left,right].filter(w=>w.waypoints.some(p=>sameJunctionPoint(p,j.point))).map(w=>w.id))})).filter(j=>j.wires.length>1);
  return checkedWireProject(reconcileSchematicJunctions(next,junctions));
}
