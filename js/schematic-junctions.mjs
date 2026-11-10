import { reconcileSchematicJunctions } from './net-edges.mjs';
import { sameJunctionPoint } from './schematic-junction-graph.mjs';
import { checkedWireProject,editWireRoute,nearestWireSegment,resolveSchematicWires,snapWirePoint,storeSchematicWire } from './schematic-wires.mjs';

// Include bends and open ends, but never infer a join from a visual crossing.
function crossing(a,b,c,d){
  const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],q=[c[0]-a[0],c[1]-a[1]],cross=(u,v)=>u[0]*v[1]-u[1]*v[0],den=cross(r,s);
  if(Math.abs(den)<1e-9)return null;
  const t=cross(q,s)/den,u=cross(q,r)/den;
  return t>=-1e-7&&t<=1+1e-7&&u>=-1e-7&&u<=1+1e-7?[a[0]+t*r[0],a[1]+t*r[1]]:null;
}
const eligible=(route,p)=>!sameJunctionPoint(route.points[0],p)&&(route.second===null||!sameJunctionPoint(route.points.at(-1),p));
export function findJunctionCandidates(project,route,limit=100000){
  const candidates=[];let checks=0;
  if(!route?.points)return {candidates,limited:false};
  for(const other of resolveSchematicWires(project)){
    if(!other.points||(route.wireId&&other.wireId===route.wireId)||(route.first===other.first&&route.second===other.second))continue;
    for(let a=1;a<route.points.length;a++)for(let b=1;b<other.points.length;b++){
      if(++checks>limit)return {candidates,limited:true};
      const p=crossing(route.points[a-1],route.points[a],other.points[b-1],other.points[b]);
      if(!p||!eligible(route,p)||!eligible(other,p))continue;
      const point=snapWirePoint(p),joint=project.schematicJunctions?.find(j=>sameJunctionPoint(j.point,point));
      if(joint?.wires.includes(route.wireId)&&joint.wires.includes(other.wireId))continue;
      if(!candidates.some(c=>c.other.first===other.first&&c.other.second===other.second&&sameJunctionPoint(c.point,point)))candidates.push({point,other});
    }
  }
  return {candidates,limited:false};
}
export function addSchematicJunction(project,first,second,position){
  const point=snapWirePoint(position);let next=project;const ids=[];
  for(const route of [first,second]){
    const hit=nearestWireSegment(route.points,point);
    if(!hit||hit.distance>.02||!eligible(route,point))throw new Error('Choose a real wire crossing or an open endpoint on another wire.');
    const points=route.points.slice(1,-1).map(p=>[...p]);
    if(!points.some(p=>sameJunctionPoint(p,point))&&!(route.second===null&&sameJunctionPoint(route.points.at(-1),point)))points.splice(hit.index,0,point);
    next=editWireRoute(next,route,points);
    ids.push(next.schematicWires.find(w=>w.from===route.first&&w.to===route.second||w.from===route.second&&w.to===route.first).id);
  }
  if(ids[0]===ids[1])throw new Error('A junction needs two different wires.');
  const existing=next.schematicJunctions?.find(j=>sameJunctionPoint(j.point,point));
  let id=existing?.id;if(!id){let n=1;while(next.schematicJunctions?.some(j=>j.id===`J${n}`))n++;id=`J${n}`;}
  const junction={id,point,wires:[...new Set([...(existing?.wires??[]),...ids])],bridges:[]};
  return checkedWireProject(reconcileSchematicJunctions(next,[...(next.schematicJunctions??[]).filter(j=>j.id!==id),junction]));
}
export function removeSchematicJunction(project,id){
  return checkedWireProject(reconcileSchematicJunctions(project,(project.schematicJunctions??[]).filter(j=>j.id!==id)));
}
export function finishWireAtJunction(project,draft,id){
  const junction=project.schematicJunctions?.find(j=>j.id===id);if(!junction)throw new Error('Junction not found.');
  const waypoints=draft.waypoints.filter((p,i)=>i!==draft.waypoints.length-1||!sameJunctionPoint(p,junction.point));
  const next=storeSchematicWire(project,{...draft,waypoints,end:junction.point});
  const wire=next.schematicWires.find(w=>w.id===draft.id)??next.schematicWires.at(-1);
  return checkedWireProject(reconcileSchematicJunctions(next,next.schematicJunctions.map(j=>j.id===id?{...j,wires:[...new Set([...j.wires,wire.id])]}:j)));
}
