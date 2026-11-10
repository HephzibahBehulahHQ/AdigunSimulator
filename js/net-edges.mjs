export function netEdges(net) {
  return Array.isArray(net.connections) ? net.connections : net.endpoints.slice(1).map(endpoint => [net.endpoints[0], endpoint]);
}
export function pruneSchematicWires(project) {
  if(!Array.isArray(project.schematicWires))return project;
  const edges=new Set(project.nets.flatMap(n=>netEdges(n).map(e=>JSON.stringify([...e].sort()))));
  const kept=project.schematicWires.filter(w=>project.components.some(c=>w.from.startsWith(c.instanceId+":"))&&(w.to===null||edges.has(JSON.stringify([w.from,w.to].sort()))));
  if(project.schematicJunctions?.length){
    const ids=new Set(kept.map(w=>w.id));
    const junctions=project.schematicJunctions.map(j=>({...j,wires:j.wires.filter(id=>ids.has(id))})).filter(j=>j.wires.length>1);
    return reconcileSchematicJunctions({...project,schematicWires:kept},junctions);
  }
  return kept.length===project.schematicWires.length?project:{...project,schematicWires:kept};
}

// Project nets contain physical terminals only. Junction bridge edges are an
// explicit, reversible projection of the native drawing's connected branches.
export function reconcileSchematicJunctions(project, junctions) {
  const pair=(a,b)=>JSON.stringify([a,b].sort());
  const owned=new Set((project.schematicJunctions??[]).flatMap(j=>(j.bridges??[]).map(e=>pair(...e))));
  const used=new Set(project.nets.map(n=>n.id));
  let nets=project.nets.flatMap(n=>splitNetEdges(n,netEdges(n).filter(e=>!owned.has(pair(...e))),used));
  const nextName=()=>{let i=1;while(nets.some(n=>n.id===`N${i}`))i++;return `N${i}`;};
  const wires=new Map((project.schematicWires??[]).map(w=>[w.id,w]));
  const nextJunctions=junctions.map(j=>{
    const bridges=[],first=wires.get(j.wires[0]).from;
    for(const id of j.wires.slice(1)){
      const second=wires.get(id).from,a=nets.find(n=>n.endpoints.includes(first)),b=nets.find(n=>n.endpoints.includes(second));
      if(first===second||(a&&a===b))continue;
      const merged={...(a??b??{}),id:(a??b)?.id??nextName(),endpoints:[...new Set([...(a?.endpoints??[first]),...(b?.endpoints??[second])])],connections:[...(a?netEdges(a):[]),...(b?netEdges(b):[]),[first,second]]};
      nets=nets.filter(n=>n!==a&&n!==b);nets.push(merged);bridges.push([first,second]);
    }
    return {...j,bridges};
  });
  return {...project,nets,schematicJunctions:nextJunctions};
}
export function splitNetEdges(net, edges, usedIds) {
  const neighbours = new Map();
  for (const [a, b] of edges) {
    if (!neighbours.has(a)) neighbours.set(a, new Set());
    if (!neighbours.has(b)) neighbours.set(b, new Set());
    neighbours.get(a).add(b); neighbours.get(b).add(a);
  }
  const remaining = new Set(neighbours.keys()), groups = [];
  while (remaining.size) {
    const queue = [remaining.values().next().value], endpoints = [];
    while (queue.length) {
      const pin = queue.shift(); if (!remaining.delete(pin)) continue;
      endpoints.push(pin); queue.push(...neighbours.get(pin));
    }
    if (endpoints.length < 2) continue;
    let id = net.id;
    if (groups.length) { let i = 1; while (usedIds.has(`N${i}`)) i++; id = `N${i}`; usedIds.add(id); }
    groups.push({ ...net, id, endpoints, connections: edges.filter(([a, b]) => endpoints.includes(a) && endpoints.includes(b)) });
  }
  return groups;
}
export function removeNetEdge(project, netId, first, second) {
  const net = project.nets.find(item => item.id === netId);
  if (!net) return project;
  const edges = netEdges(net), kept = edges.filter(([a, b]) => !((a === first && b === second) || (a === second && b === first)));
  if (kept.length === edges.length) return project;
  const usedIds = new Set(project.nets.map(item => item.id));
  return pruneSchematicWires({ ...project, nets: project.nets.flatMap(item => item === net ? splitNetEdges(net, kept, usedIds) : [item]), metadata: { ...project.metadata, updatedAt: new Date().toISOString() } });
}
