import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {analyticalScopeRecording} from '../js/analytical-scope-recording.mjs';
import {createFeedbackTimeline} from '../js/simulation-feedback-timeline.mjs';
import {scopeChannels,scopeTrace,fitScopeWindow} from '../js/oscilloscope-data.mjs';
import {scopeExplanation} from '../js/scope-readout.mjs';
const load=async name=>JSON.parse(await readFile(new URL('../examples/'+name+'.adigun.json',import.meta.url),'utf8'));

test('LED current limiter has a constant DC trace and explains why it does not oscillate',async()=>{
 const p=await load('001-led-current-limiter'),a=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,a);
 const live={status:'ready',kind:'dc',data:timeline.frame(0),sampleIndex:0};
 for(const [channel,voltage] of [['VCC',5],['LED_A',2],['GND',0]]){
  const trace=scopeTrace(p,a,live,channel);assert.equal(trace.voltage,voltage);assert.deepEqual(trace.points,[[0,voltage],[1,voltage]]);
  assert.match(scopeExplanation({analysis:a,live,trace}),/Steady DC.*horizontal/);
 }
});

test('polarity indicator, pushbutton LED and latching LED expose only their solved DC nodes',async()=>{
 const cases=[['002-two-led-polarity-indicator','RED_A',2],['003-pushbutton-led','LED_A',0],['004-latching-led-switch','LED_A',2]];
 for(const [name,probe,expected] of cases){const p=await load(name),a=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,a);assert.equal(a.state,'complete',name);assert.equal(timeline?.kind,'dc',name);const live={status:'ready',kind:'dc',data:timeline.frame(0),sampleIndex:0},trace=scopeTrace(p,a,live,probe);assert.equal(trace?.kind,'dc',name);assert.equal(trace.voltage,expected,name);assert.equal(trace.points[0][1],trace.points[1][1],name);}
 const push=await load('003-pushbutton-led');push.components.find(c=>c.libraryId==='input.pushbutton').value='Pressed';const pressed=runProjectAnalysis(push),timeline=createFeedbackTimeline(push,pressed),ledA=push.nets.find(n=>n.endpoints.includes('led-1:A')).id;assert.equal(timeline?.frame(0).nodes[ledA],2);assert.ok(pressed.result.ledCurrentA>0);
 const latched=await load('004-latching-led-switch');latched.components.find(c=>c.libraryId==='input.spdt-switch').value='Position B';const off=runProjectAnalysis(latched),offTimeline=createFeedbackTimeline(latched,off),offLedA=latched.nets.find(n=>n.endpoints.includes('led-1:A')).id;assert.equal(offTimeline?.frame(0).nodes[offLedA],0);assert.equal(off.result.ledCurrentA,0);
});

test('invalid wiring blocks DC scope records and retains the model repair message',async()=>{
 const p=await load('003-pushbutton-led');p.nets=p.nets.map(n=>({...n,endpoints:n.endpoints.filter(e=>e!=='switch-1:1')})).filter(n=>n.endpoints.length);const analysis=runProjectAnalysis(p);assert.notEqual(analysis.state,'complete');assert.match(analysis.message,/Wire source positive through the pushbutton/);assert.equal(createFeedbackTimeline(p,analysis),null);
});

test('5 V Parallel Resistor Load exposes its solved DC nodes to the oscilloscope',async()=>{
 const p=await load('004-parallel-resistor-load'),a=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,a);
 const live={status:'ready',kind:'dc',data:timeline.frame(0),sampleIndex:0},channels=scopeChannels(p,a,live);
 assert.equal(a.result.kind,'resistive-network');assert.ok(channels.length>0);
 for(const channel of channels){const trace=scopeTrace(p,a,live,channel);assert.equal(trace.kind,'dc');assert.equal(trace.points[0][1],trace.points[1][1]);}
});

test('unconfigured RC/RL examples expose their actual model curve and pin-mapped nodes',async()=>{
 for(const name of ['005-rc-step-response','006-rl-step-response','011-rc-charge-discharge']){
  const p=await load(name),before=JSON.stringify(p),a=runProjectAnalysis(p),r=a.result,record=a.scopeRecording,timeline=createFeedbackTimeline(p,a);
  assert.equal(JSON.stringify(p),before);assert.equal(record.samples.length,501);assert.equal(timeline.length,501);
  const field=r.kind==='rl-step-response'?'inductorVoltage':'capacitorVoltage';
  for(const sample of r.samples){const actual=record.samples.find(s=>Math.abs(s.timeSeconds-sample.timeS)<1e-12);assert.ok(actual);assert.ok(Math.abs(actual.nodeVoltages[record.preferredNet]-sample[field])<1e-12);}
  const live={status:'ready',kind:'transient',data:timeline.frame(100),sampleIndex:100};
  const trace=scopeTrace(p,a,live,record.preferredNet);assert.equal(trace.points.length,101);assert.equal(trace.voltage,record.samples[100].nodeVoltages[record.preferredNet]);
  assert.equal(scopeExplanation({analysis:a,live,trace}),'');
  assert.equal(analyticalScopeRecording(p,{...a,state:'blocked'}),null);
  const invalid=structuredClone(p);invalid.nets=invalid.nets.filter(n=>n.id!==record.preferredNet);assert.equal(analyticalScopeRecording(invalid,a),null);
 }
});

test('RC discharge retains the charged initial voltage and grounded switch common',async()=>{
 const p=await load('011-rc-charge-discharge');p.components.find(c=>c.libraryId==='input.spdt-switch').value='Discharge (B)';
 const a=runProjectAnalysis(p),record=a.scopeRecording;
 assert.equal(a.result.mode,'discharge');assert.equal(record.samples[0].nodeVoltages.RC_NODE,5);assert.equal(record.samples[0].nodeVoltages.SW_COM,0);
 assert.ok(Math.abs(record.samples.at(-1).nodeVoltages.RC_NODE-5*Math.exp(-5))<1e-12);
});

test('scope distinguishes not run, stopped, failed and non-recording calculations in four languages',()=>{
 for(const locale of ['en','de','yo','pcm']){
  const a=scopeExplanation({locale,live:{status:'idle'}}),b=scopeExplanation({locale,live:{playback:'stopped'}}),c=scopeExplanation({locale,analysis:{state:'blocked',message:'Source short'},live:{status:'unsupported'}}),d=scopeExplanation({locale,analysis:{state:'complete',engine:'BOM report'},live:{status:'unsupported'}});
  assert.equal(new Set([a,b,c,d]).size,4);assert.match(c,/Source short/);assert.match(d,/BOM report/);
 }
});

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
test('PWM LED dimmer scope records the modeled gate input and does not claim a simulated power-stage output',async()=>{
 const p=await load('005-pwm-led-dimmer'),a=runProjectAnalysis(p),record=a.scopeRecording;
 assert.equal(a.state,'complete');assert.ok(record);assert.equal(record.preferredNet,'GATE');assert.match(record.model,/power stage not transient-simulated/);
 assert.equal(record.samples.at(-1).timeSeconds,4/a.result.frequencyHz);
 const period=1/a.result.frequencyHz,high=period*a.result.effectiveDutyFraction;
 assert.ok(record.samples.find(s=>s.timeSeconds<high).nodeVoltages.GATE>0);
 assert.equal(record.samples.find(s=>s.timeSeconds>=high+period*1e-8).nodeVoltages.GATE,0);
 const timeline=createFeedbackTimeline(p,a);assert.equal(timeline.kind,'transient');
 const live={status:'ready',kind:'transient',sampleIndex:timeline.length-1,data:timeline.frame(timeline.length-1)};
 const trace=scopeTrace(p,a,live,'GATE');assert.equal(trace.kind,'transient');assert.ok(trace.points.some(([,v])=>v===0));assert.ok(trace.points.some(([,v])=>v===a.result.gateHighVoltage));
 const disconnected=structuredClone(p);disconnected.nets=disconnected.nets.map(n=>({...n,endpoints:n.endpoints.filter(e=>e!=='mosfet-1:G')})).filter(n=>n.endpoints.length>0);
 assert.equal(analyticalScopeRecording(disconnected,a),null);
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
