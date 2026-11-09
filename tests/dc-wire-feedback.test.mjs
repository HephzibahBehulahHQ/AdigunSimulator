import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runProjectAnalysis} from "../js/analysis-dispatch.mjs";
import {buildDcWireFeedback,currentMotion,voltageColor,wireEdgeKey} from "../js/dc-wire-feedback.mjs";
import {createLiveDcFeedback} from "../js/live-dc-feedback.mjs";
const fixture=async name=>JSON.parse(await readFile(new URL(`../examples/${name}.adigun.json`,import.meta.url),"utf8"));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≠ ${b}`);

test("LED flow and voltage use solved values and reflect resistance and supply edits",async()=>{
  const p=await fixture("001-led-current-limiter"),before=JSON.stringify(p);
  const f=buildDcWireFeedback(p,runProjectAnalysis(p));
  assert.equal(f.available,true);assert.deepEqual(f.nodes,{VCC:5,GND:0,LED_A:2});
  const moving=Object.values(f.wires).filter(w=>w.currentA!==0);assert.equal(moving.length,3);
  moving.forEach(w=>near(w.currentA,3/330));assert.equal(JSON.stringify(p),before);
  const r=p.components.find(c=>c.libraryId==="passive.resistor");r.value="660 Ω";
  Object.values(buildDcWireFeedback(p,runProjectAnalysis(p)).wires).filter(w=>w.currentA!==0).forEach(w=>near(w.currentA,3/660));
  p.components.find(c=>c.libraryId==="power.dc-source").value="1 V";
  const off=buildDcWireFeedback(p,runProjectAnalysis(p));assert.equal(off.nodes.LED_A,1);
  assert.ok(Object.values(off.wires).every(w=>w.currentA===0));
});
test("divider and nonlinear BJT currents respect Kirchhoff current law at a branching net",async()=>{
  const p=await fixture("002-dc-voltage-divider"),f=buildDcWireFeedback(p,runProjectAnalysis(p));
  assert.equal(f.nodes.VOUT,6);Object.values(f.wires).filter(w=>w.currentA!==0).forEach(w=>near(w.currentA,.003));
  const q=await fixture("supplemental-npn-ebers-moll-bias"),result=runProjectAnalysis(q),b=buildDcWireFeedback(q,result);
  assert.ok(Object.values(b.wires).every(w=>w.currentA!==null));
  const vcc=Object.entries(b.wires).filter(([key])=>JSON.parse(key)[0]==="VCC").map(([,w])=>w.currentA);
  near(vcc.reduce((a,b)=>a+b,0),-result.result.voltageSources[0].currentA);
  const corrupted=structuredClone(result);corrupted.result.transistors[0].baseCurrentA=1;
  assert.ok(Object.values(buildDcWireFeedback(q,corrupted).wires).some(w=>w.reason==="KCL mismatch"&&w.currentA===null));
});
test("wire loops do not invent current split; bridge currents and voltages remain measurable",async()=>{
  const p=await fixture("001-led-current-limiter"),g=p.nets.find(n=>n.id==="GND");
  const [a,b,c]=g.endpoints;g.connections=[[a,b],[b,c],[c,a]];
  const f=buildDcWireFeedback(p,runProjectAnalysis(p));
  for(const [first,second] of g.connections){const w=f.wires[wireEdgeKey(g.id,first,second)];assert.equal(w.currentA,null);assert.equal(w.voltageV,0);assert.match(w.reason,/indeterminate/);}
  assert.ok(Object.entries(f.wires).filter(([key])=>JSON.parse(key)[0]!=="GND").every(([,w])=>w.currentA!==null));
});
test("unknown/stale models stay unanimated and current magnitude controls direction/speed",async()=>{
  const p=await fixture("001-led-current-limiter");
  for(const a of [null,{state:"stale"},{state:"complete",result:{kind:"digital-event-simulation"}}])assert.equal(buildDcWireFeedback(p,a).available,false);
  assert.equal(currentMotion(0),null);assert.equal(currentMotion(null),null);
  assert.ok(currentMotion(.01).durationSeconds<currentMotion(.001).durationSeconds);
  assert.equal(currentMotion(-.01).reverse,true);assert.equal(currentMotion(-.01,true).reverse,false);
  assert.equal(voltageColor(0),"#94a3b8");assert.equal(voltageColor(-5),"#ff647c");assert.equal(voltageColor(5),"#45e69b");assert.equal(voltageColor(null),null);
});
test("live feedback coalesces edits, rejects stale workers and cancels pending work on reset",async()=>{
  const p=await fixture("001-led-current-limiter"),jobs=[],queue=new Map(),results=[];let next=0;
  const live=createLiveDcFeedback({schedule:fn=>{queue.set(++next,fn);return next;},unschedule:id=>queue.delete(id),onResult:r=>results.push(r),run:project=>{
    let resolve;const j={project,cancelled:false,promise:new Promise(r=>resolve=r),cancel(){this.cancelled=true;},finish(){resolve(runProjectAnalysis(project));}};jobs.push(j);return j;
  }});
  const flush=()=>{const fns=[...queue.values()];queue.clear();fns.forEach(f=>f());};
  live.accept(p,runProjectAnalysis(p));const r=p.components.find(c=>c.libraryId==="passive.resistor");
  r.value="470 Ω";live.observe(p);r.value="680 Ω";live.observe(p);assert.equal(queue.size,1);assert.equal(live.read().data,null);
  flush();assert.equal(jobs.length,1);assert.equal(jobs[0].project.components.find(c=>c.libraryId===r.libraryId).value,"680 Ω");
  r.value="1 kΩ";live.observe(p);assert.equal(jobs[0].cancelled,true);flush();
  jobs[0].finish();await Promise.resolve();assert.equal(results.length,0);
  jobs[1].finish();await Promise.resolve();assert.equal(results.length,1);near(Object.values(live.read().data.wires).find(w=>w.currentA!==0).currentA,.003);
  r.value="2 kΩ";live.observe(p);live.stop();flush();assert.equal(jobs.length,2);assert.equal(live.read().active,false);assert.equal(live.read().data,null);
});
