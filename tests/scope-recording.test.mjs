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

test('LM386 scope records the modeled fundamental and omits clipping waveforms',async()=>{
 const project=await load('038-audio-power-amplifier');
 const analysis=runProjectAnalysis(project),recording=analysis.scopeRecording;
 assert.equal(recording.preferredNet,'SPEAKER_PLUS');
 assert.equal(recording.samples[30].nodeVoltages.AMP_OUT,6.1);
 assert.ok(Math.abs(recording.samples[30].nodeVoltages.SPEAKER_PLUS)>1);
 project.components.find(component=>component.instanceId==='input').value='200 mV';
 const clipped=runProjectAnalysis(project);
 assert.equal(clipped.result.clipped,true);
 assert.equal(clipped.scopeRecording,undefined);
 project.nets.find(net=>net.id==='BYPASS').endpoints=['amplifier:BYPASS'];
 const broken=runProjectAnalysis(project);
 assert.equal(broken.state,'blocked');
 assert.match(broken.message,/pin 7 bypass/);
});

test('electret preamp scope preserves modeled phase and midpoint bias',async()=>{
 const project=await load('037-electret-audio-preamp');
 const analysis=runProjectAnalysis(project),recording=analysis.scopeRecording;
 assert.equal(recording.preferredNet,'OUTPUT');
 const {outputAmplitudeV,outputBiasVoltageV,outputPhaseRad}=analysis.result;
 assert.equal(recording.samples[0].nodeVoltages.OUTPUT,outputBiasVoltageV+outputAmplitudeV*Math.sin(outputPhaseRad));
 assert.equal(recording.samples[120].timeSeconds,0.001);
 const bypass=project.nets.find(net=>net.id==='VREF');
 bypass.endpoints=bypass.endpoints.filter(endpoint=>endpoint!=='reference-bypass:1');
 const broken=runProjectAnalysis(project);
 assert.equal(broken.state,'blocked');
 assert.match(broken.message,/bypass capacitance/);
 assert.equal(broken.scopeRecording,undefined);
});

test('window comparator scope shows both comparator decisions and their AND output',async()=>{
 const project=await load('029-window-comparator');
 const input=project.components.find(component=>component.instanceId==='signal');
 for(const [value,levels] of [['1 V',[0,5,0]],['2.5 V',[5,5,5]],['4 V',[5,0,0]]]){
  input.value=value;
  const analysis=runProjectAnalysis(project);
  const recording=analysis.scopeRecording;
  assert.equal(recording.preferredNet,'WINDOW_OUT');
  for(const sample of recording.samples){
   assert.deepEqual(['LOWER_OK','UPPER_OK','WINDOW_OUT'].map(net=>sample.nodeVoltages[net]),levels);
   assert.equal(sample.nodeVoltages.LOWER_LIMIT,5/3);
   assert.equal(sample.nodeVoltages.UPPER_LIMIT,10/3);
  }
 }
});

test('ideal non-inverting scope shows the modeled gain and suppresses clipping estimates',async()=>{
 const project=await load('024-opamp-noninverting');
 const result=runProjectAnalysis(project);
 const recording=result.scopeRecording;
 assert.equal(recording.preferredNet,'OUTPUT');
 assert.deepEqual(recording.samples[30].nodeVoltages,{GND:0,INPUT:0.1,OUTPUT:0.2});
 assert.equal(recording.samples[30].timeSeconds,0.00025);
 project.components.find(component=>component.instanceId==='signal').value='7 V';
 const clipping=runProjectAnalysis(project);
 assert.equal(clipping.state,'blocked');
 assert.match(clipping.message,/reaches a supply rail/);
 assert.equal(analyticalScopeRecording(project,clipping),null);
});

test('NE556 scope records each channel at its own modeled edges',async()=>{
 const project=await load('023-556-dual-timer');
 const analysis=runProjectAnalysis(project);
 const recording=analyticalScopeRecording(project,analysis);
 assert.equal(recording.preferredNet,'A_OUTPUT');
 for(const [output,timing] of [['A_OUTPUT',analysis.result.channelA],['B_OUTPUT',analysis.result.channelB]]){
  const edges=recording.samples.filter((sample,index)=>
   index>0&&sample.nodeVoltages[output]!==recording.samples[index-1].nodeVoltages[output]);
  assert.equal(edges[0].timeSeconds,timing.highTimeS);
  assert.equal(edges[0].nodeVoltages[output],0);
  assert.equal(edges[1].timeSeconds,timing.periodS);
  assert.equal(edges[1].nodeVoltages[output],5);
 }
 assert.deepEqual(Object.keys(recording.samples[0].nodeVoltages).sort(),['A_OUTPUT','B_OUTPUT','GND','VCC']);
 const revised=structuredClone(project);
 revised.components.find(component=>component.instanceId==='ct-B').value='22 µF';
 const revisedAnalysis=runProjectAnalysis(revised);
 const revisedRecording=analyticalScopeRecording(revised,revisedAnalysis);
 const fallingEdge=(trace,net)=>trace.samples.find(sample=>sample.nodeVoltages[net]===0).timeSeconds;
 assert.equal(fallingEdge(revisedRecording,'A_OUTPUT'),fallingEdge(recording,'A_OUTPUT'));
 assert.equal(fallingEdge(revisedRecording,'B_OUTPUT'),revisedAnalysis.result.channelB.highTimeS);
 assert.ok(fallingEdge(revisedRecording,'B_OUTPUT')>fallingEdge(recording,'B_OUTPUT'));
 const disconnected=structuredClone(project);
 disconnected.nets=disconnected.nets.filter(net=>net.id!=='B_OUTPUT');
 assert.equal(analyticalScopeRecording(disconnected,runProjectAnalysis(disconnected)),null);
});

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

test('USB LED, NTC divider and LDR examples expose measured analytical DC outputs',async()=>{
 const cases=[['008-usb-powered-led','LED_A',2],['019-ntc-temperature-divider','VOUT',2.5],['020-ldr-night-light','LED_A',2]];
 for(const [name,probe,expected] of cases){const p=await load(name),a=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,a);assert.equal(a.state,'complete',name);assert.equal(timeline?.kind,'dc',name);const trace=scopeTrace(p,a,{status:'ready',kind:'dc',data:timeline.frame(0),sampleIndex:0},probe);assert.ok(Math.abs(trace?.voltage-expected)<1e-9,name);assert.equal(trace?.points[0][1],trace?.points[1][1],name);}
 const ldr=await load('020-ldr-night-light');ldr.components.find(c=>c.libraryId==='passive.ldr').value='Rbright 10 kΩ; Rdark 1 MΩ; light 100%';
 const bright=runProjectAnalysis(ldr),timeline=createFeedbackTimeline(ldr,bright),ledA=ldr.nets.find(n=>n.endpoints.includes('led-1:A')).id;
 assert.equal(bright.result.ledOn,false);assert.ok(Math.abs(timeline?.frame(0).nodes[ledA])<1e-9);
});

test('digital event projects expose sampled pin transitions as logic-level scope traces',async()=>{
 for(const name of ['supplemental-digital-event-simulation','supplemental-mux-event-simulation','supplemental-d-flip-flop-events']){
  const p=await load(name),analysis=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,analysis);assert.equal(analysis.state,'complete',name);assert.equal(analysis.scopeRecording.units,'logic',name);assert.equal(timeline.kind,'transient',name);
  const channel=analysis.result.probeNets[0],live={status:'ready',kind:'transient',sampleIndex:timeline.length-1,data:timeline.frame(timeline.length-1)},trace=scopeTrace(p,analysis,live,channel);assert.equal(trace.units,'logic',name);assert.equal(trace.duration,analysis.result.stopTimeNs*1e-9,name);
  assert.ok(trace.points.every(([time,value])=>Number.isFinite(time)&&[0,1].includes(value)),name);assert.ok(trace.points.some((point,index)=>index>0&&point[0]===trace.points[index-1][0]&&point[1]!==trace.points[index-1][1]),name);
 }
});

test('UART transmitter exposes the complete 8N1 frame as modeled TX logic',async()=>{
 const p=await load('056-uart-transmitter'),analysis=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,analysis);
 assert.equal(analysis.state,'complete');
 const {frameBits,bitPeriodSeconds,frameDurationSeconds}=analysis.result;
 const live={status:'ready',kind:'transient',sampleIndex:timeline.length-1,data:timeline.frame(timeline.length-1)};
 const trace=scopeTrace(p,analysis,live,'TX');
 assert.equal(trace.units,'logic');
 assert.equal(trace.duration,frameDurationSeconds);
 assert.deepEqual(trace.points.filter((_,i)=>i%2===0),[...frameBits.map((bit,i)=>[i*bitPeriodSeconds,Number(bit)]),[frameDurationSeconds,1]]);
});

test('UART receiver plots the supplied RX frame through a low stop bit',async()=>{
 const p=await load('057-uart-receiver');
 p.components.find(c=>c.instanceId==='serial-frame').value='Bits 0,1,0,1,0,0,1,0,1,0; Baud 9600';
 const analysis=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,analysis);
 assert.equal(analysis.result.framingError,true);
 const index=timeline.length-1,live={status:'ready',kind:'transient',sampleIndex:index,data:timeline.frame(index)};
 const trace=scopeTrace(p,analysis,live,'RX');
 assert.equal(trace.units,'logic');
 assert.deepEqual(trace.points.at(-1),[10/9600,0]);
});

test('I²C sensor scope follows the modeled read and stops on address NACK',async()=>{
 const p=await load('058-i2c-sensor-read');
 const levels=(analysis,skip)=>analysis.scopeRecording.samples.flatMap((sample,i,samples)=>
  i&&!samples[i-1].nodeVoltages.SCL&&sample.nodeVoltages.SCL&&!skip.includes(i)?[sample.nodeVoltages.SDA]:[]);
 const bits=(byte)=>Array.from({length:8},(_,i)=>(byte>>(7-i))&1);
 const analysis=runProjectAnalysis(p);
 assert.deepEqual(levels(analysis,[39,78]),[...bits(0x90),0,...bits(0),0,...bits(0x91),0,...bits(0x2a),1]);
 assert.equal(analysis.scopeRecording.units,'logic');
 const fixture=p.components.find(c=>c.instanceId==='transaction');
 fixture.value='Address 0x49; Register 0x00; Baud 100000; ACK yes';
 assert.deepEqual(levels(runProjectAnalysis(p),[21]),[...bits(0x92),1]);
 fixture.value='Address 0x48; Register 0x01; Baud 100000; ACK yes';
 assert.equal(runProjectAnalysis(p).scopeRecording,undefined);
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
test('TPS3710 battery monitor exposes measured steady-state DC nodes without inventing a high-impedance output voltage',async()=>{
 const p=await load('006-battery-discharge-monitor');
 for(const voltage of [9,7.4]){
  p.components.find(c=>c.libraryId==='power.dc-source').value=voltage+' V';
  const a=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,a);assert.equal(a.state,'complete');assert.equal(timeline.kind,'dc');
  const u=p.components.find(c=>c.libraryId==='active.tps3710-ideal'),output=p.nets.find(n=>n.endpoints.includes(u.instanceId+':OUT')).id,sense=p.nets.find(n=>n.endpoints.includes(u.instanceId+':SENSE')).id;
  const live={status:'ready',kind:'dc',sampleIndex:0,data:timeline.frame(0)};
  assert.equal(live.data.model,'TPS3710 battery monitor steady-state DC operating point (not transient simulation)');
  assert.equal(live.data.nodes.VBAT,voltage);assert.equal(live.data.nodes.GND,0);assert.equal(live.data.nodes[sense],a.result.senseVoltage);
  assert.equal(a.result.lowBattery,voltage===7.4);
  if(a.result.lowBattery){const trace=scopeTrace(p,a,live,output);assert.equal(trace.kind,'dc');assert.equal(trace.voltage,0);assert.equal(trace.model,live.data.model);assert.deepEqual(trace.points,[[0,0],[1,0]]);}
  else{assert.equal(Object.hasOwn(live.data.nodes,output),false);assert.equal(scopeChannels(p,a,live)[0],sense);assert.equal(scopeTrace(p,a,live,output),null);}
  assert.ok(Object.values(live.data.wires).every(w=>w.reason===null));assert.equal(scopeTrace(p,a,{...live,status:'updating'},output),null);
 }
});

test('RC, RL and tone-control frequency responses produce labeled steady-state sine estimates',async()=>{
 const cases=[['012-rc-low-pass','FILTER_OUT'],['013-rc-high-pass','HP_OUT'],['014-passive-tone-control','OUTPUT'],['supplemental-rl-low-pass','FILTER_OUT']];
 for(const [name,net] of cases){const p=await load(name),analysis=runProjectAnalysis(p),record=analysis.scopeRecording;assert.equal(analysis.state,'complete',name);assert.ok(record,name);assert.equal(record.preferredNet,net,name);assert.match(record.model,/frequency-domain estimate, not transient simulation/,name);const trace=scopeTrace(p,analysis,{status:'ready',kind:'transient',sampleIndex:record.samples.length-1,data:{available:true,nodes:record.samples.at(-1).nodeVoltages}},net);assert.equal(trace.kind,'transient',name);assert.ok(trace.points.length>400,name);assert.ok(trace.points.some(([,v])=>v>0),name);assert.ok(trace.points.some(([,v])=>v<0),name);}
});

test('LM2596 adjustable example produces its scoped ripple estimate with the physical output terminal',async()=>{
 const p=await load('101-buck-converter-baseline'),a=runProjectAnalysis(p),record=analyticalScopeRecording(p,a);
 assert.equal(a.state,'complete',a.message);
 assert.equal(record?.kind,'analytical-output-recording');
 assert.match(record.model,/not switching-transient simulation/);
 assert.equal(record.preferredNet,'VOUT');
 assert.ok(record.samples.length>100);
 assert.ok(record.samples.every(sample=>Number.isFinite(sample.nodeVoltages.VOUT)));
});


test('LM2577 boost example exposes only the modeled CCM output-ripple estimate',async()=>{
 const p=await load('102-boost-converter-baseline'),a=runProjectAnalysis(p),record=analyticalScopeRecording(p,a);
 assert.equal(a.state,'complete',a.message);
 assert.equal(record?.kind,'analytical-output-recording');
 assert.match(record.model,/not switching-transient simulation/);
 assert.equal(record.preferredNet,'VOUT');
 assert.equal(record.samples.length,481);
 const values=record.samples.map(sample=>sample.nodeVoltages.VOUT);
 assert.ok(values.every(Number.isFinite));
 assert.ok(Math.abs(Math.max(...values)-Math.min(...values)-a.result.outputRipplePpV)/a.result.outputRipplePpV<0.01);
});
