import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runProjectAnalysis} from "../js/analysis-dispatch.mjs";
import {createFeedbackTimeline} from "../js/simulation-feedback-timeline.mjs";
import {createSimulationPlayback} from "../js/simulation-playback.mjs";

async function circuit(){
  const p=JSON.parse(await readFile(new URL('../examples/005-rc-step-response.adigun.json',import.meta.url),'utf8'));
  p.components=p.components.map(c=>({...c,value:c.libraryId==='passive.resistor'?'1 kΩ':c.libraryId==='passive.capacitor'?'1 µF':c.value}));
  p.linearRlcTransient={stopSeconds:.005,timeStepSeconds:.00001};return p;
}
function clockHarness(){
  let wall=0,id=0;const queue=new Map();
  return {options:{now:()=>wall,schedule:(fn,delay)=>{queue.set(++id,{fn,at:wall+delay});return id;},unschedule:id=>queue.delete(id)},advance(ms){wall+=ms;const due=[...queue.entries()].filter(([,j])=>j.at<=wall);for(const [id,j] of due){queue.delete(id);j.fn();}},get size(){return queue.size;}};
}
test("every RC transient sample exposes signed source and capacitor currents with KCL",async()=>{
  const project=await circuit(),analysis=runProjectAnalysis(project),timeline=createFeedbackTimeline(project,analysis);
  assert.equal(analysis.state,"complete",analysis.message);assert.equal(timeline.kind,"transient");assert.equal(timeline.length,500);
  const c=project.components.find(c=>c.libraryId==='passive.capacitor'),r=project.components.find(c=>c.libraryId==='passive.resistor');
  const output=project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:1`)).id;
  const supply=project.components.find(c=>c.libraryId==='power.dc-source');
  const voltage=Number(supply.value.split(' ')[0]);
  for(let i=0;i<500;i+=13){const frame=timeline.frame(i);assert.equal(frame.available,true);assert.ok(Object.values(frame.wires).every(w=>w.currentA!==null));
    const expected=(voltage-frame.nodes[output])/1000;
    const edge=Object.entries(frame.wires).find(([key])=>JSON.parse(key).includes(`${r.instanceId}:2`));
    assert.ok(Math.abs(Math.abs(edge[1].currentA)-expected)<1e-9);
  }
  assert.ok(Math.abs(timeline.frame(99).nodes[output]-voltage*(1-Math.exp(-1)))<.012);
  for(const mutate of [a=>{a.result.samples[1].timeSeconds=a.result.samples[0].timeSeconds;},a=>{a.result.samples[0].branchCurrents[0]=NaN;},a=>{a.result.samples[0].nodeVoltages=[];}]){
    const broken=structuredClone(analysis);mutate(broken);assert.equal(createFeedbackTimeline(project,broken),null);
  }
  const wrong=structuredClone(analysis);wrong.feedbackLayout.branches[0].instanceId='missing';assert.equal(createFeedbackTimeline(project,wrong),null);
});
test("Run advances recorded time, Pause freezes, Step advances exactly one sample, Stop clears",async()=>{
  const p=await circuit(),a=runProjectAnalysis(p),clock=clockHarness(),frames=[];
  const player=createSimulationPlayback({...clock.options,run:project=>({promise:Promise.resolve(runProjectAnalysis(project)),cancel(){}}),onPaint:event=>frames.push(event)});
  player.accept(p,a);assert.equal(player.read().sampleIndex,0);clock.advance(1000);assert.ok(player.read().sampleIndex>=99);
  const runningIndex=player.read().sampleIndex;assert.equal(player.canResume(p),true);player.resume();assert.equal(player.read().sampleIndex,runningIndex);assert.equal(clock.size,1);
  assert.equal(player.pause(),true);const frozen=player.read();clock.advance(1000);assert.equal(player.read().timeSeconds,frozen.timeSeconds);
  assert.equal(player.step(),true);assert.equal(player.read().sampleIndex,frozen.sampleIndex+1);assert.equal(player.read().playback,'paused');
  assert.equal(player.canResume(p),true);player.resume();clock.advance(10000);assert.equal(player.read().playback,'complete');assert.equal(player.read().sampleIndex,499);assert.equal(clock.size,0);
  player.resume();assert.equal(player.read().sampleIndex,0);player.stop();assert.equal(player.read().timeSeconds,0);assert.equal(player.read().data,null);assert.equal(player.read().active,false);assert.equal(clock.size,0);assert.equal(player.step(),false);
  assert.ok(frames.some(event=>event?.frameOnly));
});
test("editing while paused recalculates the same sample and keeps the pause through invalid edits",async()=>{
  const p=await circuit(),clock=clockHarness(),player=createSimulationPlayback({...clock.options,run:project=>({promise:Promise.resolve(runProjectAnalysis(project)),cancel(){}})});
  player.accept(p,runProjectAnalysis(p));clock.advance(800);player.pause();const index=player.read().sampleIndex,old=JSON.stringify(player.read().data.nodes);
  p.components.find(c=>c.libraryId==='passive.resistor').value='2 kΩ';player.observe(p);assert.equal(player.read().data,null);clock.advance(200);await Promise.resolve();
  assert.equal(player.read().playback,'paused');assert.equal(player.read().sampleIndex,index);assert.notEqual(JSON.stringify(player.read().data.nodes),old);
  p.components.find(c=>c.libraryId==='passive.resistor').value='bad';player.observe(p);clock.advance(200);await Promise.resolve();assert.equal(player.read().status,'unsupported');
  p.components.find(c=>c.libraryId==='passive.resistor').value='1 kΩ';player.observe(p);clock.advance(200);await Promise.resolve();assert.equal(player.read().playback,'paused');
  player.stop();
});
test("RL sample feedback follows the inductor current and source passive sign",async()=>{
  const p=await circuit(),c=p.components.find(c=>c.libraryId==='passive.capacitor');
  c.libraryId='passive.inductor';c.reference='L1';c.value='1 H';
  const analysis=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,analysis);
  assert.equal(analysis.state,'complete',analysis.message);
  const sample=analysis.result.samples[99],layout=analysis.feedbackLayout;
  const inductor=sample.branchCurrents[layout.branches.findIndex(b=>b.reference==='L1')];
  const source=sample.branchCurrents[layout.branches.findIndex(b=>b.reference==='V1')];
  assert.ok(Math.abs(inductor-.005*(1-Math.exp(-1)))<.00002);
  assert.ok(Math.abs(source+inductor)<1e-10);
  assert.ok(Object.values(timeline.frame(99).wires).every(w=>w.currentA!==null));
});
test("a one-sample trace completes without scheduling an endless playback timer",async()=>{
  const p=await circuit(),analysis=runProjectAnalysis(p);analysis.result.samples=analysis.result.samples.slice(0,1);
  const clock=clockHarness(),player=createSimulationPlayback({...clock.options,run(){throw new Error('unexpected recalculation');}});
  player.accept(p,analysis);assert.equal(player.read().sampleCount,1);assert.equal(player.read().playback,'complete');assert.equal(clock.size,0);
});
