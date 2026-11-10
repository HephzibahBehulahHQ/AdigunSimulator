import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {analyticalScopeRecording} from '../js/analytical-scope-recording.mjs';
import {createFeedbackTimeline} from '../js/simulation-feedback-timeline.mjs';
import {scopeChannels,scopeTrace,fitScopeWindow} from '../js/oscilloscope-data.mjs';
const load=async name=>JSON.parse(await readFile(new URL('../examples/'+name+'.adigun.json',import.meta.url),'utf8'));

test('reported missing-footprint circuit preserves its report and provides actual ideal 555 output timing',async()=>{
 const p=await load('185-missing-footprint-workflow'),before=JSON.stringify(p),a=runProjectAnalysis(p),r=a.scopeRecording;
 assert.equal(a.result.kind,'missing-footprint-resolution-report');assert.equal(a.scopeElectrical.result.kind,'ne555-astable');assert.equal(JSON.stringify(p),before);
 assert.ok(r.samples.length<=2000);assert.equal(r.preferredNet,'OUTPUT');assert.deepEqual([...new Set(r.samples.map(s=>s.nodeVoltages.OUTPUT))].sort(),[0,5]);
 const timeline=createFeedbackTimeline(p,a),i=200,live={status:'ready',kind:timeline.kind,sampleIndex:i,data:timeline.frame(i)};
 assert.equal(scopeChannels(p,a,live)[0],'OUTPUT');const trace=scopeTrace(p,a,live,'OUTPUT');assert.equal(trace.points.length,i+1);assert.deepEqual(trace.points.at(-1),[r.samples[i].timeSeconds,r.samples[i].nodeVoltages.OUTPUT]);assert.equal(trace.model,'Ideal 555 output timing');
 assert.equal(scopeTrace(p,a,{...live,status:'updating'},'OUTPUT'),null);
});
test('555 and STM32 records use the successful model period, duty and actual supply',async()=>{
 for(const name of ['021-555-astable-blinker','070-stm32-timer-pwm']){
  const p=await load(name),a=runProjectAnalysis(p),r=a.scopeRecording,period=a.result.periodS??1/a.result.frequencyHz,high=period*a.result.dutyCycle;
  assert.ok(r.samples.every((s,i)=>Object.values(s.nodeVoltages).every(Number.isFinite)&&(!i||s.timeSeconds>r.samples[i-1].timeSeconds)));
  assert.equal(r.samples.at(-1).timeSeconds,period*4);
  const before=r.samples.filter(s=>s.timeSeconds<high).at(-1),after=r.samples.find(s=>s.timeSeconds>=high+period*1e-8);
  assert.ok(before.nodeVoltages[r.preferredNet]>0);assert.equal(after.nodeVoltages[r.preferredNet],0);
 }
});
test('monostable trigger state and model rejection cannot invent a periodic waveform',async()=>{
 const p=await load('022-555-monostable'),a=runProjectAnalysis(p),r=a.scopeRecording;
 assert.ok(r);assert.equal(r.samples.at(-1).nodeVoltages[r.preferredNet],0);
 const bad={...a,state:'blocked'};assert.equal(analyticalScopeRecording(p,bad),null);assert.equal(analyticalScopeRecording(p,{state:'complete',result:{kind:'unsupported'}}),null);
});
test('scope uses whole viewport boundaries, including menus and side panels',async()=>{
 const source=await readFile(new URL('../js/design-tools-ui.mjs',import.meta.url),'utf8');
 const fn=source.slice(source.indexOf(' function bounds()'),source.indexOf(' function position()'));
 const bounds=runInNewContext(fn+'bounds()',{window:{innerWidth:1280,innerHeight:720}});
 assert.deepEqual(JSON.parse(JSON.stringify(bounds)),{x:4,y:4,width:1272,height:712});
 const moved=fitScopeWindow({x:10,y:8,width:380,height:240},bounds);assert.equal(moved.x,10);assert.equal(moved.y,8);
 const mobile=fitScopeWindow({x:1200,y:900,width:600,height:500},{x:4,y:4,width:352,height:792});assert.equal(mobile.width,352);assert.ok(mobile.y+mobile.height<=796);
});
test('battery comparator exposes actual solved DC nodes in the scope above and below its trip point',async()=>{
 const p=await load('006-battery-discharge-monitor');
 for(const voltage of [9,6]){
  p.components.find(c=>c.libraryId==='power.dc-source').value=voltage+' V';
  const a=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,a);assert.equal(a.state,'complete');assert.equal(timeline.kind,'dc');
  const u=p.components.find(c=>c.libraryId==='active.comparator-ideal'),output=p.nets.find(n=>n.endpoints.includes(u.instanceId+':OUT')).id,sense=p.nets.find(n=>n.endpoints.includes(u.instanceId+':SENSE')).id;
  const live={status:'ready',kind:'dc',sampleIndex:0,data:timeline.frame(0)};
  const trace=scopeTrace(p,a,live,output);assert.equal(trace.kind,'dc');assert.equal(trace.voltage,a.result.comparatorOutputVoltage);assert.equal(live.data.nodes[sense],a.result.senseVoltage);assert.equal(trace.model,'Ideal comparator DC estimate');
  assert.deepEqual(trace.points,[[0,voltage===9?0:6],[1,voltage===9?0:6]]);
  assert.ok(Object.values(live.data.wires).every(w=>w.reason===null));assert.equal(scopeTrace(p,a,{...live,status:'updating'},output),null);
 }
});
