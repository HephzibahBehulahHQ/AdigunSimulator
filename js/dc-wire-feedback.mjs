import { netEdges } from "./net-edges.mjs";

export const wireEdgeKey = (net, first, second) => JSON.stringify([net, first, second]);
export function voltageColor(voltage) {
  return !Number.isFinite(voltage) ? null : Math.abs(voltage) < 1e-9 ? "#94a3b8" : voltage > 0 ? "#45e69b" : "#ff647c";
}
export function currentMotion(current, electronFlow = false) {
  if (!Number.isFinite(current) || Math.abs(current) < 1e-12) return null;
  // Visualization scale, not carrier velocity. Monotonic logarithmic compression.
  const speed = Math.min(96, 6 + 12 * Math.log10(1 + Math.abs(current) / 1e-6));
  return { durationSeconds: 16 / speed, reverse: (current < 0) !== electronFlow };
}

export function buildDcWireFeedback(project, analysis) {
  const unavailable = reason => ({ available: false, reason, nodes: {}, wires: {} });
  if (analysis?.state !== "complete") return unavailable("No completed calculation.");
  const result = analysis.result;
  if (!result) return unavailable("No solved quantities.");
  const byRef = new Map(project.components.map(c=>[c.reference,c]));
  const byType = id => project.components.filter(c=>c.libraryId===id);
  const pinNet = new Map(project.nets.flatMap(n=>n.endpoints.map(p=>[p,n.id])));
  const endpoint = (c,p) => `${c.instanceId}:${p}`;
  const net = (c,p) => pinNet.get(endpoint(c,p));
  const currents = new Map(), nodes = { ...(result.nodeVoltages ?? {}) };
  const terminal = (c,p,i) => { if(c && Number.isFinite(i)) currents.set(endpoint(c,p),i); };
  const branch = (c,a,b,i) => { terminal(c,a,i);terminal(c,b,-i); };
  const setNode = (c,p,v) => { const id=net(c,p); if(id && Number.isFinite(v)) nodes[id]=v; };
  const source = byType("power.dc-source");
  for(const c of byType("ground.signal")) terminal(c,"0",0);
  if (result.kind === "linear-rlc-frame" && result.terminalCurrents) {
    for(const [pin,current] of Object.entries(result.terminalCurrents)) if(Number.isFinite(current))currents.set(pin,current);
  } else if (result.kind === "led-current-limiter" && source.length===1 && byType("passive.resistor").length===1 && byType("diode.led-red").length===1 && project.components.length===4) {
    const v=source[0],r=byType("passive.resistor")[0],d=byType("diode.led-red")[0];
    const supply=net(v,"+"),ground=net(v,"-"),anode=net(d,"A");
    if(!supply || !ground || !anode || net(d,"K")!==ground || !["1","2"].some(p=>net(r,p)===supply) || !["1","2"].some(p=>net(r,p)===anode)) return unavailable("Model topology does not match solved LED circuit.");
    setNode(v,"+",result.sourceVoltage);setNode(v,"-",0);setNode(d,"A",result.sourceVoltage-result.currentA*result.resistance);
    branch(v,"+","-",-result.currentA);branch(d,"A","K",result.currentA);
    branch(r,"1","2",net(r,"1")===supply?result.currentA:-result.currentA);
  } else if(result.kind === "voltage-divider" && source.length===1 && byType("passive.resistor").length===2 && project.components.length===4) {
    const v=source[0];setNode(v,"+",result.sourceVoltage);setNode(v,"-",0);branch(v,"+","-",-result.currentA);
    const middle=project.nets.filter(n=>n.id!==net(v,"+") && n.id!==net(v,"-"));
    if(middle.length!==1) return unavailable("Model topology does not match solved divider.");
    nodes[middle[0].id]=result.outputVoltage;
    for(const r of byType("passive.resistor")) branch(r,"1","2",Math.sign(nodes[net(r,"1")]-nodes[net(r,"2")])*result.currentA);
  } else if (result.nodeVoltages && ["resistive-network","multi-source-resistive-network","linear-dc-mna-network","nonlinear-dc-operating-point"].includes(result.kind)) {
    for(const r of result.resistors??[]) branch(byRef.get(r.reference),"1","2",r.currentA);
    for(const d of result.diodes??[]) branch(byRef.get(d.reference),"A","K",d.currentA);
    for(const q of result.transistors??[]) { const c=byRef.get(q.reference);terminal(c,"B",q.baseCurrentA);terminal(c,"C",q.collectorCurrentA);terminal(c,"E",q.emitterCurrentA); }
    for(const v of result.voltageSources??result.sources??[]) branch(byRef.get(v.reference),"+","-",v.currentA);
    if(result.kind==="resistive-network" && source.length===1) branch(source[0],"+","-",-result.sourceCurrentA);
    for(const i of result.currentSources??[]) branch(byRef.get(i.reference),"+","-",-(i.currentA??i.outputCurrentA));
  } else return unavailable("This model does not expose complete DC terminal currents and node voltages.");

  const wires={};
  for(const n of project.nets) {
    const edges=netEdges(n), known=n.endpoints.every(p=>currents.has(p));
    const neighbours=new Map();
    edges.forEach(([a,b],index)=>{for(const [from,to] of [[a,b],[b,a]]){if(!neighbours.has(from))neighbours.set(from,[]);neighbours.get(from).push({to,index});}});
    const balance=n.endpoints.reduce((sum,p)=>sum+(currents.get(p)??0),0);
    const scale=n.endpoints.reduce((sum,p)=>sum+Math.abs(currents.get(p)??0),0);
    const balanced=known && Math.abs(balance)<=1e-10+scale*1e-6;
    for(let e=0;e<edges.length;e++) {
      const [first,second]=edges[e], reached=new Set([second]), pending=[second];
      // Removing this edge isolates its downstream terminals only for a bridge.
      while(pending.length) {const p=pending.pop();for(const {to,index} of neighbours.get(p)??[])if(index!==e&&!reached.has(to)){reached.add(to);pending.push(to);}}
      const unique=!reached.has(first);
      const currentA=balanced&&unique?[...reached].reduce((sum,p)=>sum+currents.get(p),0):null;
      wires[wireEdgeKey(n.id,first,second)]={voltageV:Number.isFinite(nodes[n.id])?nodes[n.id]:null,currentA,reason:!known?"Unmeasured terminal":!balanced?"KCL mismatch":!unique?"Ideal wire loop: current split is indeterminate":null};
    }
  }
  return {available:true,kind:result.kind,nodes,wires,reason:`${result.kind==="linear-rlc-frame"?"Calculated transient sample":"DC operating point"}; motion indicates current magnitude, not physical carrier speed.`};
}
