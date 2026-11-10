import { netEdges } from './net-edges.mjs';
const pair=(a,b)=>JSON.stringify([a,b].sort());
export const sameJunctionPoint=(a,b)=>Boolean(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7);
export const junctionNode=id=>`@junction/${id}`;
export const openWireNode=id=>`@open/${id}`;
export const junctionBridgeKeys=project=>new Set((project.schematicJunctions??[]).flatMap(j=>j.bridges.map(e=>pair(...e))));
export function junctionWireNodes(project,wire,first=wire.from,second=wire.to){
  const reverse=first!==wire.from,coordinates=[null,...wire.waypoints,wire.to===null?wire.end:null];
  if(reverse)coordinates.reverse();
  const nodes=[{pin:first,index:0}];
  for(const j of project.schematicJunctions??[]){
    if(!j.wires.includes(wire.id))continue;
    const index=coordinates.findIndex(p=>sameJunctionPoint(p,j.point));
    if(index>0)nodes.push({pin:junctionNode(j.id),index});
  }
  const last=coordinates.length-1;
  if(!nodes.some(n=>n.index===last))nodes.push({pin:second??openWireNode(wire.id),index:last});
  return nodes.sort((a,b)=>a.index-b.index);
}
export function junctionRouteSegments(project,route){
  const wire=project.schematicWires?.find(w=>w.id===route.wireId);
  if(!wire)return [{...route,measurementFirst:route.first,measurementSecond:route.second}];
  const nodes=junctionWireNodes(project,wire,route.first,route.second);
  return nodes.slice(1).map((node,i)=>({...route,measurementFirst:nodes[i].pin,measurementSecond:node.pin,points:route.points.slice(nodes[i].index,node.index+1)}));
}
export function junctionElectricalEdges(project,net){
  const bridges=junctionBridgeKeys(project),stored=project.schematicWires??[],edges=[];
  function add(first,second,wire){
    const nodes=wire?junctionWireNodes(project,wire,first,second):[{pin:first},{pin:second}];
    for(let i=1;i<nodes.length;i++)edges.push([nodes[i-1].pin,nodes[i].pin]);
  }
  for(const [a,b] of netEdges(net))if(!bridges.has(pair(a,b)))add(a,b,stored.find(w=>w.to!==null&&pair(w.from,w.to)===pair(a,b)));
  for(const wire of stored)if(wire.to===null&&net.endpoints.includes(wire.from))add(wire.from,null,wire);
  return edges;
}
