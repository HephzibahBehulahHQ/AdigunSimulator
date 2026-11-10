export function netEdges(net) {
  return Array.isArray(net.connections) ? net.connections : net.endpoints.slice(1).map(endpoint => [net.endpoints[0], endpoint]);
}
export function pruneSchematicWires(project) {
  if(!Array.isArray(project.schematicWires))return project;
  const edges=new Set(project.nets.flatMap(n=>netEdges(n).map(e=>JSON.stringify([...e].sort()))));
  const kept=project.schematicWires.filter(w=>project.components.some(c=>w.from.startsWith(c.instanceId+":"))&&(w.to===null||edges.has(JSON.stringify([w.from,w.to].sort()))));
  return kept.length===project.schematicWires.length?project:{...project,schematicWires:kept};
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
