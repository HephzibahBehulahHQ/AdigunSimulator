import {LADDER_MODELS,ladderParameters,ladderSettings} from './ladder-components.mjs';
// Input image and output tags are sampled once per scan. Wire propagation is
// topological; physical cycles are rejected. Tag feedback takes one scan.
export function runLadderSimulation(project){
 try {
  const components=project.components,nets=project.nets;
  if(!Array.isArray(components)||!components.length||components.length>256||!Array.isArray(nets)||nets.length>512)throw new Error('Use 1–256 ladder instructions and at most 512 nets.');
  const {scanMs,durationMs}=ladderSettings(project.ladderSimulation,components.length,nets.length);
  const models=new Map(),params=new Map(),endpoint=new Map(),drivers=new Map(),state=new Map(),writers=new Map(),inputDefs=new Map();
  for(const c of components){const m=LADDER_MODELS[c.libraryId];if(!m)throw new Error('Ladder scan accepts ladder instructions only; keep electrical power and analog models separate.');if(models.has(c.instanceId))throw new Error('Duplicate ladder identity.');models.set(c.instanceId,m);const p=ladderParameters(c);params.set(c.instanceId,p);state.set(c.instanceId,{q:false,cv:0,prev:false,prevDown:false,start:null,elapsedMs:0});
   if(p.tag&&!['input','contact-no','contact-nc'].includes(m.kind)){const others=writers.get(p.tag)??[];if(others.length&&(!['coil-set','coil-reset'].includes(m.kind)||others.some(x=>!['coil-set','coil-reset'].includes(x))))throw new Error('Output tags require one writer, or a set/reset coil pair.');if(others.includes(m.kind))throw new Error('Duplicate tag writer.');writers.set(p.tag,[...others,m.kind]);}
  }
  for(const net of nets){if(drivers.has(net.id)||!Array.isArray(net.endpoints))throw new Error('Invalid ladder net.');const list=[];drivers.set(net.id,list);for(const ep of net.endpoints){if(endpoint.has(ep))throw new Error('A ladder terminal belongs to one net.');const i=ep.lastIndexOf(':'),id=ep.slice(0,i),pin=ep.slice(i+1),m=models.get(id);if(!m||![...m.inputs,...m.outputs].includes(pin))throw new Error('Unknown ladder terminal.');endpoint.set(ep,net.id);if(m.outputs.includes(pin))list.push({id,pin});}}
  const inputPins=m=>m.kind.startsWith('coil')?['L']:m.inputs;
  const dependencies=new Map(components.map(c=>[c.instanceId,new Set(inputPins(models.get(c.instanceId)).flatMap(pin=>(drivers.get(endpoint.get(c.instanceId+':'+pin))??[]).map(d=>d.id)))]));
  const order=[],remaining=new Set(components.map(c=>c.instanceId));while(remaining.size){const ready=[...remaining].filter(id=>[...dependencies.get(id)].every(d=>!remaining.has(d)));if(!ready.length)throw new Error('Wire feedback cycles are unsupported; use a tagged coil/contact for scan feedback.');for(const id of ready){remaining.delete(id);order.push(id);}}
  const byId=new Map(components.map(c=>[c.instanceId,c]));
  for(const c of components){const m=models.get(c.instanceId),p=params.get(c.instanceId);if(['input','contact-no','contact-nc'].includes(m.kind)&&!writers.has(p.tag)){const signature=JSON.stringify({state:p.state,events:p.events});if(inputDefs.has(p.tag)&&inputDefs.get(p.tag).signature!==signature)throw new Error('Contacts sharing an input tag must use identical state/events.');inputDefs.set(p.tag,{...p,signature});}
   if(m.kind!=='rail-right')for(const pin of inputPins(m)){if(['RESET','LOAD'].includes(pin))continue;if(!(drivers.get(endpoint.get(c.instanceId+':'+pin))??[]).length)throw new Error(`${c.reference}.${pin} needs a driven connection.`);}
   if(m.kind.startsWith('coil')){const net=endpoint.get(c.instanceId+':R');if(!net||!components.some(r=>models.get(r.instanceId).kind==='rail-right'&&endpoint.get(r.instanceId+':L')===net))throw new Error(`${c.reference}.R must connect to the right return rail.`);}
  }
  let bits=Object.fromEntries([...writers.keys()].map(t=>[t,0]));const initials=new Map();for(const c of components){const p=params.get(c.instanceId);if(p.initial!==undefined){if(initials.has(p.tag)&&initials.get(p.tag)!==p.initial)throw new Error('Set/reset coils must agree on their initial tag value.');initials.set(p.tag,p.initial);bits[p.tag]=p.initial;}}
  const samples=[];
  for(let timeMs=0;timeMs<=durationMs;timeMs+=scanMs){
   const image={...bits},next={...bits},values=new Map(),blocks={},netValues=Object.fromEntries(nets.map(n=>[n.id,0]));
   for(const [tag,p] of inputDefs){let v=p.state;for(const event of p.events){if(event.timeMs>timeMs)break;v=event.value;}image[tag]=v;}
   for(const id of order){const m=models.get(id),p=params.get(id),s=state.get(id),c=byId.get(id),read=pin=>Boolean((drivers.get(endpoint.get(id+':'+pin))??[]).some(d=>values.get(d.id+':'+d.pin))),a=read(m.inputs[0]),rise=a&&!s.prev,fall=!a&&s.prev;let q=false,outputs={};
    if(m.kind==='rail-left')q=true;
    else if(m.kind==='input')q=Boolean(image[p.tag]);
    else if(m.kind==='contact-no'||m.kind==='contact-nc')q=a&&(m.kind==='contact-no'?Boolean(image[p.tag]):!image[p.tag]);
    else if(m.kind.startsWith('coil')){q=m.kind==='coil-negated'?!a:a;if(m.kind==='coil-set')next[p.tag]=Number(a||next[p.tag]);else if(m.kind==='coil-reset')next[p.tag]=Number(!a&&next[p.tag]);else next[p.tag]=Number(q);}
    else if(m.kind==='ton'){if(!a)s.start=null;else if(s.start===null)s.start=timeMs;s.elapsedMs=a?Math.min(p.presetMs,timeMs-s.start):0;q=a&&s.elapsedMs>=p.presetMs;}
    else if(m.kind==='tof'){if(a){s.start=null;s.elapsedMs=0;q=true;}else{if(fall)s.start=timeMs;if(s.start!==null)s.elapsedMs=Math.min(p.presetMs,timeMs-s.start);q=s.start!==null&&s.elapsedMs<p.presetMs;}}
    else if(m.kind==='tp'){if(rise&&(s.start===null||timeMs-s.start>=p.presetMs))s.start=timeMs;s.elapsedMs=s.start===null?0:Math.min(p.presetMs,timeMs-s.start);q=s.start!==null&&s.elapsedMs<p.presetMs;}
    else if(m.kind==='r-trig'||m.kind==='f-trig')q=m.kind==='r-trig'?rise:fall;
    else if(['ctu','ctd','ctud'].includes(m.kind)){const down=m.kind==='ctd'?a:read('CD'),downEdge=down&&!s.prevDown;if(read('RESET'))s.cv=0;else if(read('LOAD'))s.cv=p.preset;else if(m.kind==='ctu'){if(rise)s.cv=Math.min(65535,s.cv+1);}else if(m.kind==='ctd'){if(downEdge)s.cv=Math.max(0,s.cv-1);}else if(rise!==downEdge)s.cv=Math.max(0,Math.min(65535,s.cv+(rise?1:-1)));q=m.kind==='ctd'?s.cv===0:s.cv>=p.preset;s.prevDown=down;if(m.kind==='ctud')outputs={QU:q,QD:s.cv===0};}
    else if(m.kind==='sr'||m.kind==='rs'){const reset=read('RESET');q=m.kind==='sr'?a||(!reset&&s.q):!reset&&(a||s.q);}
    else if(m.kind.startsWith('compare-')){const x=p.left,y=p.right;q=a&&({eq:x===y,ne:x!==y,gt:x>y,ge:x>=y,lt:x<y,le:x<=y}[m.kind.slice(8)]);}
    s.q=Boolean(q);s.prev=a;
    if(p.tag&&writers.has(p.tag)&&!m.kind.startsWith('coil')&&!['input','contact-no','contact-nc'].includes(m.kind))next[p.tag]=Number(q);
    if(!Object.keys(outputs).length)outputs=Object.fromEntries(m.outputs.map(pin=>[pin,q]));for(const [pin,v] of Object.entries(outputs)){values.set(id+':'+pin,Boolean(v));const net=endpoint.get(id+':'+pin);if(net!==undefined)netValues[net] ||= Number(v);}
    blocks[id]={reference:c.reference,on:Boolean(q),elapsedMs:s.elapsedMs,count:s.cv};
   }
   // When both set/reset coils are true in one scan, reset wins deterministically.
   for(const c of components)if(models.get(c.instanceId).kind==='coil-reset'&&blocks[c.instanceId].on)next[params.get(c.instanceId).tag]=0;
   bits=next;samples.push({timeSeconds:timeMs/1000,nets:netValues,bits:{...image,...bits},blocks});
  }
  return {state:'complete',engine:'Native bounded ladder scan',message:'Logical scan results; no mains, motor, coil-current, contact-bounce or safety certification model.',errors:[],warnings:[],result:{kind:'ladder-scan',scanMs,durationMs,samples,instructionCount:components.length}};
 }catch(error){return {state:'blocked',engine:'Native bounded ladder scan',message:error.message,errors:[{code:'LADDER_INPUT',message:error.message}],warnings:[],result:null};}
}
