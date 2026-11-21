// Sample existing successful analytical models. These are ideal output estimates,
// not fabricated measurements or a substitute for nonlinear transient simulation.
export function analyticalScopeRecording(project,analysis){
 if(analysis?.state!=='complete')return null;
 const r=analysis.result,kind=r?.kind;
 if(kind==='buck-converter')return lm2596AdjustableRecording(project,r)??buckAverageRecording(project,r);
 if(kind==='boost-converter'&&r.device==='LM2577T-ADJ/NOPB')return lm2577BoostRecording(project,r);
 if(kind==='digital-event-simulation')return digitalEventRecording(project,r);
 if(kind==='mcu-button-debounce')return buttonDebounceRecording(project,r);
 if(['rc-step-response','rl-step-response','rc-charge-discharge'].includes(kind))return firstOrderRecording(project,r);
 if(kind==='rlc-step-response')return rlcStepRecording(project,r);
 if(kind==='supercap-hold-up')return supercapHoldUpRecording(project,r);
 if(['bridge-rectifier-waveform','bridge-smoothing-capacitor'].includes(kind))return rectifierWaveformRecording(project,r);
 if(kind==='tvs-pulse-clamp')return tvsPulseRecording(project,r);
 if(kind==='pwm-led-average')return pwmGateRecording(project,r);
 if(['rc-low-pass','rc-high-pass','rl-low-pass','passive-tone-control'].includes(kind))return frequencyResponseRecording(project,r);
 if(kind==='active-low-pass')return activeLowPassRecording(project,r);
 if(kind==='npn-common-emitter')return commonEmitterRecording(project,r);
 if(kind==='ne556-dual-astable')return dualTimerRecording(project,r);
 if(['comparator-threshold','schmitt-trigger'].includes(kind))return comparatorRecording(project,r);
 if(kind==='window-comparator')return windowComparatorRecording(project,r);
 if(kind==='electret-audio-preamp')return electretPreampRecording(project,r);
 if(['opamp-noninverting','opamp-inverting','opamp-voltage-follower'].includes(kind))return opAmpMidbandRecording(project,r);
 if(!['ne555-astable','ne555-monostable','stm32-timer-pwm'].includes(kind))return null;
 const timer=project.components.find(c=>c.libraryId===(kind.startsWith('ne555')?'active.ne555':'active.stm32-timer-ideal'));
 if(!timer)return null;
 const net=pin=>project.nets.find(n=>n.endpoints.includes(timer.instanceId+':'+pin))?.id;
 const output=net(kind.startsWith('ne555')?'3':'PA0'),power=net(kind.startsWith('ne555')?'8':'VCC'),ground=net(kind.startsWith('ne555')?'1':'GND');
 const source=project.components.find(c=>c.libraryId==='power.dc-source'),match=source?.value.match(/^\s*([\d.eE+-]+)\s*(m?V)\s*$/),voltage=r.supplyVoltage??(match?Number(match[1])*(match[2]==='mV'?.001:1):NaN);
 const mono=kind==='ne555-monostable',period=mono?r.pulseWidthS:kind==='ne555-astable'?r.periodS:1/r.frequencyHz,duty=mono?1:r.dutyCycle;
 if(!output||!power||!ground||!Number.isFinite(voltage)||!Number.isFinite(period)||period<=0||!Number.isFinite(duty)||duty<0||duty>1)return null;
 const duration=period*(mono?1.5:4),times=new Set(Array.from({length:501},(_,i)=>duration*i/500));
 // Include actual ideal edge instants and the immediately preceding side.
 for(let cycle=0;cycle<4;cycle++)for(const t of [cycle*period,(cycle+duty)*period])if(t>0&&t<duration){times.add(t);times.add(Math.max(0,t-period*1e-9));}
 const samples=[...times].sort((a,b)=>a-b).map(timeSeconds=>{
  const phase=((timeSeconds%period)+period)%period,high=mono?r.triggered&&timeSeconds<period:duty===1||(duty>0&&phase<period*duty);
  return {timeSeconds,nodeVoltages:{[ground]:0,[power]:voltage,[output]:high?voltage:0}};
 });
 return {kind:'analytical-output-recording',model:kind==='stm32-timer-pwm'?'Ideal STM32 PWM output':'Ideal 555 output timing',preferredNet:output,samples};
}

function electretPreampRecording(project,result) {
 const amp=project.components.find(component=>component.libraryId==='active.opamp-ideal');
 if(!amp)return null;
 const net=pin=>project.nets.find(item=>item.endpoints.includes(`${amp.instanceId}:${pin}`))?.id;
 const [output,supply,ground]=['OUT','VCC','VEE'].map(net);
 const {signalFrequencyHz:frequency,outputAmplitudeV:amplitude,outputPhaseRad:phase,outputBiasVoltageV:bias,supplyVoltage}=result;
 if(!output||!supply||!ground||new Set([output,supply,ground]).size!==3||
    ![frequency,amplitude,phase,bias,supplyVoltage].every(Number.isFinite)||frequency<=0||amplitude<0||
    bias-amplitude<0||bias+amplitude>supplyVoltage)return null;
 const samples=Array.from({length:481},(_,index)=>{
  const cycle=index/120;
  return {timeSeconds:cycle/frequency,nodeVoltages:{
   [output]:bias+amplitude*Math.sin(2*Math.PI*cycle+phase),[supply]:supplyVoltage,[ground]:0
  }};
 });
 return {kind:'analytical-output-recording',model:'Ideal electret preamp steady-state sine',preferredNet:output,samples};
}

function windowComparatorRecording(project,result) {
 const gate=project.components.find(component=>['active.logic-and-ideal','active.sn74hc08n-first-gate'].includes(component.libraryId));
 if(!gate)return null;
 const net=(component,pin)=>project.nets.find(item=>item.endpoints.includes(`${component.instanceId}:${pin}`))?.id;
 const [lowOk,highOk,output,supply,ground]=['A','B','Y','VCC','GND'].map(pin=>net(gate,pin));
 const comparators=project.components.filter(component=>component.libraryId==='active.comparator-dual-ideal');
 const lower=comparators.find(component=>net(component,'OUT')===lowOk);
 const upper=comparators.find(component=>net(component,'OUT')===highOk);
 if(!lower||!upper)return null;
 const input=net(lower,'IN+'),low=net(lower,'IN-'),high=net(upper,'IN+');
 const nets=[lowOk,highOk,output,supply,ground,input,low,high];
 if(!nets.every(Boolean)||new Set(nets).size!==nets.length||net(upper,'IN-')!==input)return null;
 const {supplyVoltage,inputVoltage,lowerThresholdV,upperThresholdV,lowerComparatorHigh,upperComparatorHigh,windowActive}=result;
 if(![supplyVoltage,inputVoltage,lowerThresholdV,upperThresholdV].every(Number.isFinite)||
    lowerComparatorHigh!==(inputVoltage>lowerThresholdV)||upperComparatorHigh!==(inputVoltage<upperThresholdV)||
    windowActive!==(lowerComparatorHigh&&upperComparatorHigh))return null;
 const nodeVoltages={[supply]:supplyVoltage,[ground]:0,[input]:inputVoltage,[low]:lowerThresholdV,[high]:upperThresholdV,
  [lowOk]:lowerComparatorHigh?supplyVoltage:0,[highOk]:upperComparatorHigh?supplyVoltage:0,[output]:windowActive?supplyVoltage:0};
 return {kind:'analytical-output-recording',model:'Ideal window comparator steady-state levels',preferredNet:output,
  samples:[0,1].map(timeSeconds=>({timeSeconds,nodeVoltages:{...nodeVoltages}}))};
}

function comparatorRecording(project, result) {
 const schmitt=result.kind==='schmitt-trigger';
 const comparator=project.components.find(component=>component.libraryId===(schmitt?'active.schmitt-trigger-ideal':'active.comparator-dual-ideal'));
 if(!comparator)return null;
 const net=(component,pin)=>project.nets.find(item=>item.endpoints.includes(`${component.instanceId}:${pin}`))?.id;
 const [output,supply,ground,sense,threshold]=['OUT','VCC','GND','IN+','IN-'].map(pin=>net(comparator,pin));
 const signalSources=schmitt?project.components.filter(component=>component.libraryId==='power.dc-source'&&
  net(component,'-')===ground&&![supply,threshold].includes(net(component,'+'))):[];
 const input=schmitt?(signalSources.length===1?net(signalSources[0],'+'):null):sense;
 const nets=[output,supply,ground,input,threshold];
 if(!nets.every(Boolean)||new Set(nets).size!==nets.length)return null;
 const {supplyVoltage,inputVoltage,outputHigh}=result;
 const thresholdVoltage=schmitt?result.referenceVoltage:result.thresholdVoltage;
 if(![supplyVoltage,inputVoltage,thresholdVoltage].every(Number.isFinite)||
    (!schmitt&&outputHigh!==(inputVoltage>thresholdVoltage)))return null;
 const nodeVoltages={
  [supply]:supplyVoltage,[ground]:0,[input]:inputVoltage,[threshold]:thresholdVoltage
 };
 if(typeof outputHigh==='boolean')nodeVoltages[output]=outputHigh?supplyVoltage:0;
 return {kind:'analytical-output-recording',model:schmitt?'Ideal Schmitt trigger steady-state levels':'Ideal comparator steady-state levels',
  preferredNet:typeof outputHigh==='boolean'?output:input,
  samples:[0,1].map(timeSeconds=>({timeSeconds,nodeVoltages:{...nodeVoltages}}))};
}

function opAmpMidbandRecording(project, result) {
 const amp=project.components.find(component=>component.libraryId==='active.opamp-ideal');
 const source=project.components.find(component=>component.libraryId==='power.ac-source');
 const ground=project.components.find(component=>component.libraryId==='ground.signal');
 if(!amp||!source||!ground)return null;
 const net=(component,pin)=>project.nets.find(item=>item.endpoints.includes(`${component.instanceId}:${pin}`))?.id;
 const input=net(source,'+'),output=net(amp,'OUT'),reference=net(ground,'0');
 if(!input||!output||!reference||new Set([input,output,reference]).size!==3||net(source,'-')!==reference)return null;
 const {gainVPerV,inputAmplitudeV,outputAmplitudeV}=result;
 if(![gainVPerV,inputAmplitudeV,outputAmplitudeV].every(Number.isFinite)||inputAmplitudeV<=0||
    Math.abs(outputAmplitudeV-Math.abs(gainVPerV)*inputAmplitudeV)>1e-9)return null;

 // Use a display reference because the ideal midband model has no frequency input.
 const referenceFrequencyHz=1000;
 const samples=Array.from({length:481},(_,index)=>{
  const phase=index/120;
  const inputVoltage=inputAmplitudeV*Math.sin(2*Math.PI*phase);
  return {timeSeconds:phase/referenceFrequencyHz,nodeVoltages:{
   [reference]:0,[input]:inputVoltage,[output]:gainVPerV*inputVoltage
  }};
 });
 return {kind:'analytical-output-recording',model:'Ideal op-amp midband gain (1 kHz display reference)',preferredNet:output,samples};
}

function dualTimerRecording(project, result) {
 const timer=project.components.find(component=>component.libraryId==='active.ne556');
 if(!timer||!Number.isFinite(result.supplyVoltage)||result.supplyVoltage<=0)return null;
 const net=pin=>project.nets.find(item=>item.endpoints.includes(`${timer.instanceId}:${pin}`))?.id;
 const power=net('14'),ground=net('7');
 const channels=[
  {output:net('5'),timing:result.channelA},
  {output:net('9'),timing:result.channelB}
 ];
 if(![power,ground,...channels.map(channel=>channel.output)].every(Boolean)||
    new Set([power,ground,...channels.map(channel=>channel.output)]).size!==4||
    net('4')!==power||net('10')!==power)return null;
 if(channels.some(({timing})=>!timing||!Number.isFinite(timing.periodS)||
    !Number.isFinite(timing.highTimeS)||timing.highTimeS<=0||timing.highTimeS>=timing.periodS))return null;

 const periods=channels.map(({timing})=>timing.periodS);
 // Bound the recording to 128 cycles of the faster channel.
 const duration=Math.min(4*Math.max(...periods),128*Math.min(...periods));
 const events=new Map();
 for(const {output,timing:{periodS,highTimeS}} of channels){
  for(let cycle=0;cycle<128&&cycle*periodS<duration;cycle++){
   for(const [time,voltage] of [[cycle*periodS,result.supplyVoltage],[cycle*periodS+highTimeS,0]]){
    if(time>=duration)continue;
    if(!events.has(time))events.set(time,{});
    events.get(time)[output]=voltage;
   }
  }
 }
 const levels={[power]:result.supplyVoltage,[ground]:0};
 const samples=[];
 for(const [timeSeconds,changes] of [...events].sort(([a],[b])=>a-b)){
  if(timeSeconds>0)samples.push({timeSeconds,nodeVoltages:{...levels}});
  Object.assign(levels,changes);
  samples.push({timeSeconds,nodeVoltages:{...levels}});
 }
 samples.push({timeSeconds:duration,nodeVoltages:{...levels}});
 return {kind:'analytical-output-recording',model:'Ideal NE556 dual astable timing (phase-normalized outputs, hardware levels omitted)',preferredNet:channels[0].output,samples};
}

// This records the ideal PWM control input, not a simulated MOSFET/LED output.
function pwmGateRecording(project,r){
 const pwm=project.components.filter(c=>c.libraryId==='power.pwm-source'),switches=project.components.filter(c=>c.libraryId==='active.nmos-switch');
 if(pwm.length!==1||switches.length!==1)return null;
 const source=pwm[0],mosfet=switches[0],net=(component,pin)=>project.nets.find(n=>n.endpoints.includes(`${component.instanceId}:${pin}`))?.id;
 const gate=net(source,'+'),ground=net(source,'-'),gateNode=net(mosfet,'G'),sourceNode=net(mosfet,'S');
 const frequency=r.frequencyHz,duty=r.effectiveDutyFraction,voltage=r.gateHighVoltage;
 if(!gate||!ground||gate!==gateNode||ground!==sourceNode||!Number.isFinite(frequency)||frequency<=0||!Number.isFinite(duty)||duty<0||duty>1||!Number.isFinite(voltage)||voltage<0)return null;
 const period=1/frequency,duration=period*4,times=new Set(Array.from({length:501},(_,i)=>duration*i/500));
 for(let cycle=0;cycle<4;cycle++)for(const t of [cycle*period,(cycle+duty)*period])if(t>0&&t<duration){times.add(t);times.add(Math.max(0,t-period*1e-9));}
 const samples=[...times].sort((a,b)=>a-b).map(timeSeconds=>{const phase=((timeSeconds%period)+period)%period;return {timeSeconds,nodeVoltages:{[ground]:0,[gate]:duty===1||(duty>0&&phase<period*duty)?voltage:0}};});
 return {kind:'analytical-output-recording',model:'Ideal PWM gate drive (analytical control input; power stage not transient-simulated)',preferredNet:gate,samples};
}

// Evaluate the same successful first-order model at display resolution. Preserve
// its physical net identities and initial condition; never synthesize a sine wave.
// Preserve the event queue's actual logic transitions; no analog edge shape is inferred.
function digitalEventRecording(project,r){
 const stop=r.stopTimeNs,probes=r.probeNets,trace=r.trace,nets=new Set(project.nets.map(n=>n.id));
 if(!Number.isFinite(stop)||stop<=0||!Array.isArray(probes)||!probes.length||!trace||probes.some(net=>!nets.has(net)||!Array.isArray(trace[net])||!trace[net].length))return null;
 const events=[];
 for(const net of probes){let previous=-1;for(const event of trace[net]){if(!Number.isFinite(event.timeNs)||event.timeNs<previous||event.timeNs<0||event.timeNs>stop||typeof event.high!=='boolean')return null;previous=event.timeNs;events.push({net,timeNs:event.timeNs,high:event.high});}if(trace[net][0].timeNs!==0)return null;}
 const times=[...new Set([...events.map(event=>event.timeNs),stop])].sort((a,b)=>a-b),state=Object.fromEntries(probes.map(net=>[net,0])),samples=[];
 for(const timeNs of times){for(const event of events)if(event.timeNs===timeNs)state[event.net]=event.high?1:0;samples.push({timeSeconds:timeNs*1e-9,nodeVoltages:{...state}});}
 return {kind:'analytical-output-recording',units:'logic',model:'Digital event simulation (modeled logic transitions)',preferredNet:probes[0],samples};
}

function firstOrderRecording(project,r){
 const inductive=r.kind==='rl-step-response',switched=r.kind==='rc-charge-discharge';
 const source=project.components.find(c=>c.libraryId==='power.dc-source');
 const storage=project.components.find(c=>c.libraryId===(inductive?'passive.inductor':'passive.capacitor'));
 const resistor=project.components.find(c=>c.libraryId==='passive.resistor');
 const switchPart=switched?project.components.find(c=>c.libraryId==='input.spdt-switch'):null;
 if(!source||!storage||!resistor||(switched&&!switchPart))return null;
 const net=(c,pin)=>project.nets.find(n=>n.endpoints.includes(c.instanceId+':'+pin))?.id;
 const power=net(source,'+'),ground=net(source,'-'),output=net(storage,'1'),input=net(resistor,'1');
 if(!power||!ground||!output||!input||new Set([power,ground,output]).size!==3||net(storage,'2')!==ground||net(resistor,'2')!==output)return null;
 if(switched?(net(switchPart,'COM')!==input||net(switchPart,'A')!==power||net(switchPart,'B')!==ground||!['charge','discharge'].includes(r.mode)):input!==power)return null;
 const tau=r.timeConstantS,voltage=r.sourceVoltage;
 if(!Number.isFinite(tau)||tau<=0||!Number.isFinite(voltage)||!Array.isArray(r.samples)||!r.samples.length)return null;
 const duration=r.samples.at(-1).timeS;
 if(!Number.isFinite(duration)||duration<=0)return null;
 const discharge=switched&&r.mode==='discharge';
 const samples=Array.from({length:501},(_,i)=>{
  const timeSeconds=duration*i/500,decay=Math.exp(-timeSeconds/tau);
  const nodeVoltages={[ground]:0,[power]:voltage,[output]:voltage*(inductive||discharge?decay:1-decay)};
  if(switched)nodeVoltages[input]=discharge?0:voltage;
  return {timeSeconds,nodeVoltages};
 });
 return {kind:'analytical-output-recording',model:inductive?'Ideal RL step response':`Ideal RC ${discharge?'discharge':'charge'} response`,preferredNet:output,samples};
}

// Reconstruct a steady-state sine from the response point the analytical model
// actually solved. This is a frequency-domain estimate, not a transient solve.
function frequencyResponseRecording(project,r){
 const kind=r.kind,source=project.components.filter(c=>c.libraryId==='power.ac-source'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(source.length!==1||grounds.length!==1)return null;
 const inputPart=source[0],input=project.nets.find(n=>n.endpoints.includes(`${inputPart.instanceId}:+`))?.id,returnNet=project.nets.find(n=>n.endpoints.includes(`${inputPart.instanceId}:-`))?.id,ground=project.nets.find(n=>n.endpoints.includes(`${grounds[0].instanceId}:0`))?.id;
 if(!input||!returnNet||returnNet!==ground)return null;
 const response=Array.isArray(r.samples)?r.samples:Array.isArray(r.response)?r.response:[];
 const cutoff=r.cutoffHz,point=response.filter(s=>[s.frequencyHz,s.gain,s.phaseRad,s.inputAmplitudeV??r.inputAmplitudeV,s.outputAmplitudeV].every(Number.isFinite)&&s.frequencyHz>0).sort((a,b)=>Math.abs(Math.log(a.frequencyHz/cutoff))-Math.abs(Math.log(b.frequencyHz/cutoff)))[0];
 if(!Number.isFinite(cutoff)||cutoff<=0||!point)return null;
 const net=(component,pin)=>project.nets.find(n=>n.endpoints.includes(`${component.instanceId}:${pin}`))?.id;
 let output;
 if(kind==='rc-low-pass'){
  const resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),caps=project.components.filter(c=>c.libraryId==='passive.capacitor');
  if(resistors.length!==1||caps.length!==1||net(resistors[0],'1')!==input||net(resistors[0],'2')!==net(caps[0],'1')||net(caps[0],'2')!==returnNet)return null;
  output=net(caps[0],'1');
 }else if(kind==='rc-high-pass'){
  const resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),caps=project.components.filter(c=>c.libraryId==='passive.capacitor');
  if(resistors.length!==1||caps.length!==1||net(caps[0],'1')!==input||net(caps[0],'2')!==net(resistors[0],'1')||net(resistors[0],'2')!==returnNet)return null;
  output=net(resistors[0],'1');
 }else if(kind==='rl-low-pass'){
  const resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),inductors=project.components.filter(c=>c.libraryId==='passive.inductor');
  if(resistors.length!==1||inductors.length!==1||net(resistors[0],'1')!==input||net(resistors[0],'2')!==net(inductors[0],'1')||net(inductors[0],'2')!==returnNet)return null;
  output=net(inductors[0],'1');
 }else{
  const pot=project.components.find(c=>c.libraryId==='passive.potentiometer'),cap=project.components.find(c=>c.libraryId==='passive.capacitor'),load=project.components.find(c=>c.libraryId==='passive.resistor');
  if(!pot||!cap||!load||net(pot,'1')!==input||net(pot,'2')!==net(cap,'1')||net(pot,'2')!==net(load,'1')||net(cap,'2')!==returnNet||net(load,'2')!==returnNet)return null;
  output=net(pot,'2');
 }
 const inputAmplitude=point.inputAmplitudeV??r.inputAmplitudeV,outputAmplitude=point.outputAmplitudeV??inputAmplitude*point.gain,frequency=point.frequencyHz,phase=point.phaseRad;
 if(!output||!Number.isFinite(inputAmplitude)||inputAmplitude<0||!Number.isFinite(outputAmplitude)||outputAmplitude<0||!Number.isFinite(phase))return null;
 const duration=4/frequency,samples=Array.from({length:481},(_,i)=>{const timeSeconds=duration*i/480,angle=2*Math.PI*frequency*timeSeconds;return {timeSeconds,nodeVoltages:{[returnNet]:0,[input]:inputAmplitude*Math.sin(angle),[output]:outputAmplitude*Math.sin(angle+phase)}};});
 return {kind:'analytical-output-recording',model:`${kind} steady-state sine at ${frequency} Hz (frequency-domain estimate, not transient simulation)`,preferredNet:output,samples};
}



function commonEmitterRecording(project,r){
 const sources=project.components.filter(c=>c.libraryId==='power.dc-source'),inputs=project.components.filter(c=>c.libraryId==='power.ac-source'),transistors=project.components.filter(c=>c.libraryId==='active.npn-small-signal'),resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),capacitors=project.components.filter(c=>c.libraryId==='passive.capacitor'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(sources.length!==1||inputs.length!==1||transistors.length!==1||resistors.length!==5||capacitors.length!==2||grounds.length!==1||!Array.isArray(r.sineTrace)||r.sineTrace.length!==9)return null;
 const net=(c,p)=>project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:${p}`))?.id,[supplySource,inputSource,transistor,ground]=[sources[0],inputs[0],transistors[0],grounds[0]],between=(c,a,b)=>net(c,'1')===a&&net(c,'2')===b||net(c,'2')===a&&net(c,'1')===b;
 const gnd=net(ground,'0'),vcc=net(supplySource,'+'),base=net(transistor,'B'),collector=net(transistor,'C'),emitter=net(transistor,'E'),input=net(inputSource,'+');
 if(!gnd||!vcc||!base||!collector||!emitter||!input||net(supplySource,'-')!==gnd||net(inputSource,'-')!==gnd)return null;
 const biasTop=resistors.find(c=>between(c,vcc,base)),biasBottom=resistors.find(c=>c!==biasTop&&between(c,base,gnd)),collectorRes=resistors.find(c=>c!==biasTop&&c!==biasBottom&&between(c,vcc,collector)),emitterRes=resistors.find(c=>c!==biasTop&&c!==biasBottom&&c!==collectorRes&&between(c,emitter,gnd)),load=resistors.find(c=>![biasTop,biasBottom,collectorRes,emitterRes].includes(c));
 const inputCap=capacitors.find(c=>[net(c,'1'),net(c,'2')].includes(input)&&[net(c,'1'),net(c,'2')].includes(base)),outputCap=capacitors.find(c=>c!==inputCap&&[net(c,'1'),net(c,'2')].includes(collector)),output=inputCap&&outputCap?(net(outputCap,'1')===collector?net(outputCap,'2'):net(outputCap,'1')):null;
 if(!biasTop||!biasBottom||!collectorRes||!emitterRes||!inputCap||!outputCap||!load||!output||!between(load,output,gnd)||!([net(inputCap,'1'),net(inputCap,'2')].includes(input)&&[net(inputCap,'1'),net(inputCap,'2')].includes(base)))return null;
 const supplyMatch=String(supplySource.value??'').trim().match(/^([\d.eE+-]+)\s*(m?V)$/),supplyVoltage=supplyMatch?Number(supplyMatch[1])*(supplyMatch[2]==='mV'?.001:1):NaN;
 if(!Number.isFinite(supplyVoltage)||!Number.isFinite(r.baseVoltageV)||!Number.isFinite(r.emitterVoltageV)||!Number.isFinite(r.collectorVoltageV)||!Number.isFinite(r.frequencyHz)||r.frequencyHz<=0||!Number.isFinite(r.inputAmplitudeV)||!Number.isFinite(r.gainVPerV))return null;
 let previous=-Infinity;
 for(let i=0;i<r.sineTrace.length;i++){
  const sample=r.sineTrace[i],expectedInput=r.inputAmplitudeV*Math.sin(2*Math.PI*r.frequencyHz*sample.timeS),expectedOutput=r.gainVPerV*expectedInput;
  if(![sample.timeS,sample.inputV,sample.outputV,sample.collectorVoltageV].every(Number.isFinite)||sample.timeS<=previous||Math.abs(sample.inputV-expectedInput)>1e-9||Math.abs(sample.outputV-expectedOutput)>1e-9||Math.abs(sample.collectorVoltageV-(r.collectorVoltageV+sample.outputV))>1e-9)return null;
  previous=sample.timeS;
 }
 if(r.sineTrace[0].timeS!==0||Math.abs(r.sineTrace.at(-1).timeS-1/r.frequencyHz)>1e-9)return null;
 const samples=r.sineTrace.map(sample=>({timeSeconds:sample.timeS,nodeVoltages:{[gnd]:0,[vcc]:supplyVoltage,[input]:sample.inputV,[base]:r.baseVoltageV+sample.inputV,[emitter]:r.emitterVoltageV,[collector]:sample.collectorVoltageV,[output]:sample.outputV}}));
 return {kind:'analytical-output-recording',model:`NPN common-emitter midband sine at ${r.frequencyHz} Hz (ideal small-signal estimate, not transient simulation)`,preferredNet:output,samples};
}


function lm2596AdjustableRecording(project,r){
 const byType=id=>project.components.filter(c=>c.libraryId===id),sources=byType('power.dc-source'),controllers=byType('active.lm2596-adjustable'),inductors=byType('passive.inductor'),diodes=byType('diode.schottky'),capacitors=byType('passive.capacitor'),reports=byType('output.buck-converter-report'),grounds=byType('ground.signal');
 if(sources.length!==1||controllers.length!==1||inductors.length!==1||diodes.length!==1||capacitors.length!==1||reports.length!==1||grounds.length!==1)return null;
 const byRef=ref=>project.components.find(c=>c.reference===ref),top=byRef('RFB1'),bottom=byRef('RFB2'),load=byRef('RLOAD');
 if(!top||!bottom||!load)return null;
 const net=(component,pin)=>{const matches=project.nets.filter(item=>item.endpoints.includes(component.instanceId+':'+pin));return matches.length===1?matches[0].id:null;};
 const [source,controller,inductor,diode,capacitor,report,ground]=[sources[0],controllers[0],inductors[0],diodes[0],capacitors[0],reports[0],grounds[0]];
 const gnd=net(ground,'0'),vin=net(source,'+'),switchNet=net(controller,'SW'),output=net(inductor,'2'),feedback=net(controller,'FB');
 if(!gnd||!vin||!switchNet||!output||!feedback||new Set([gnd,vin,switchNet,output,feedback]).size!==5)return null;
 if(net(source,'-')!==gnd||net(controller,'VIN')!==vin||net(controller,'GND')!==gnd||net(controller,'ONOFF')!==gnd)return null;
 if(net(inductor,'1')!==switchNet||net(diode,'K')!==switchNet||net(diode,'A')!==gnd)return null;
 if(net(capacitor,'1')!==output||net(capacitor,'2')!==gnd||net(load,'1')!==output||net(load,'2')!==gnd||net(report,'VOUT')!==output||net(report,'GND')!==gnd)return null;
 if(net(top,'1')!==output||net(top,'2')!==feedback||net(bottom,'1')!==feedback||net(bottom,'2')!==gnd)return null;
 const frequency=r.switchingFrequencyHz,average=r.outputVoltageV,ripple=r.outputRipplePpV,input=r.inputVoltageV,duty=r.dutyCyclePercent/100;
 if(![frequency,average,ripple,input,duty].every(Number.isFinite)||frequency!==150000||average<=0||ripple<0||input<=average||duty<=0||duty>=1||r.conductionMode!=='CCM'||r.controllerHardwareModeled!==false)return null;
 const duration=4/frequency,samples=Array.from({length:481},(_,i)=>{const timeSeconds=duration*i/480,phase=(i/480*4)%1,triangle=1-4*Math.abs(phase-.5);return {timeSeconds,nodeVoltages:{[gnd]:0,[vin]:input,[output]:average+triangle*ripple/2}};});
 return {kind:'analytical-output-recording',model:`LM2596 adjustable buck output ripple estimate at ${frequency} Hz (CCM capacitor-ripple model; phase-normalized, not switching-transient simulation)`,preferredNet:output,samples};
}

function buckAverageRecording(project,r){
 const byType=id=>project.components.filter(c=>c.libraryId===id),sources=byType('power.dc-source'),fixtures=byType('input.buck-operating-point-fixture'),controllers=byType('active.buck-average-controller'),inductors=byType('passive.inductor'),diodes=byType('diode.schottky'),capacitors=byType('passive.capacitor'),loads=byType('passive.resistor'),reports=byType('output.buck-converter-report'),grounds=byType('ground.signal');
 if(sources.length!==1||fixtures.length!==1||controllers.length!==1||inductors.length!==1||diodes.length!==1||capacitors.length!==1||loads.length!==1||reports.length!==1||grounds.length!==1)return null;
 const net=(component,pin)=>{const matches=project.nets.filter(item=>item.endpoints.includes(component.instanceId+':'+pin));return matches.length===1?matches[0].id:null;},[source,fixture,controller,inductor,diode,capacitor,load,report,ground]=[sources[0],fixtures[0],controllers[0],inductors[0],diodes[0],capacitors[0],loads[0],reports[0],grounds[0]];
 const gnd=net(ground,'0'),vin=net(source,'+'),switchNet=net(controller,'SW'),output=net(inductor,'2'),control=net(fixture,'CTRL');
 if(!gnd||!vin||!switchNet||!output||!control||new Set([gnd,vin,switchNet,output,control]).size!==5)return null;
 if(net(source,'-')!==gnd||net(fixture,'VCC')!==vin||net(fixture,'GND')!==gnd||net(controller,'VIN')!==vin||net(controller,'GND')!==gnd||net(fixture,'CTRL')!==net(controller,'CTRL'))return null;
 if(net(inductor,'1')!==switchNet||net(diode,'A')!==gnd||net(diode,'K')!==switchNet||net(capacitor,'1')!==output||net(capacitor,'2')!==gnd||net(load,'1')!==output||net(load,'2')!==gnd||net(controller,'VOUT')!==output||net(report,'VOUT')!==output||net(report,'GND')!==gnd)return null;
 const frequency=r.switchingFrequencyHz,average=r.outputVoltageV,ripple=r.outputRipplePpV,input=r.inputVoltageV,duty=r.dutyCyclePercent/100;
 if(![frequency,average,ripple,input,duty].every(Number.isFinite)||frequency<=0||average<=0||ripple<0||input<=average||duty<=0||duty>=1||r.conductionMode!=='CCM'||r.controllerHardwareModeled!==false)return null;
 const duration=4/frequency,samples=Array.from({length:481},(_,i)=>{const timeSeconds=duration*i/480,phase=(i/480*4)%1,triangle=1-4*Math.abs(phase-.5);return {timeSeconds,nodeVoltages:{[gnd]:0,[vin]:input,[output]:average+triangle*ripple/2}};});
 return {kind:'analytical-output-recording',model:`Asynchronous buck output ripple estimate at ${frequency} Hz (CCM capacitor-ripple model; phase-normalized, not switching-transient simulation)`,preferredNet:output,samples};
}

function supercapHoldUpRecording(project,r){
 const source=project.components.filter(c=>c.libraryId==='power.dc-source'),diodes=project.components.filter(c=>c.libraryId==='diode.schottky'),capacitors=project.components.filter(c=>c.libraryId==='passive.supercapacitor'),resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(source.length!==1||diodes.length!==1||capacitors.length!==1||resistors.length!==1||grounds.length!==1||!Array.isArray(r.samples)||r.samples.length<2||r.samples.length>2000)return null;
 const net=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:${pin}`))?.id,[s,d,c,res,g]=[source[0],diodes[0],capacitors[0],resistors[0],grounds[0]];
 const power=net(s,'+'),ground=net(s,'-'),output=net(c,'+'),sourceVoltage=r.sourceVoltage,initial=r.chargeVoltage;
 if(!power||!ground||!output||new Set([power,ground,output]).size!==3||net(d,'A')!==power||net(d,'K')!==output||net(c,'-')!==ground||net(res,'1')!==output||net(res,'2')!==ground||net(g,'0')!==ground)return null;
 if(!Number.isFinite(sourceVoltage)||!Number.isFinite(r.diodeVf)||!Number.isFinite(initial)||Math.abs(sourceVoltage-r.diodeVf-initial)>Math.max(1,Math.abs(sourceVoltage))*1e-9)return null;
 let previous=-Infinity;
 for(const sample of r.samples){if(!Number.isFinite(sample.timeS)||sample.timeS<previous||!Number.isFinite(sample.voltage)||sample.voltage<0||sample.voltage>r.ratedVoltage)return null;previous=sample.timeS;}
 if(r.samples[0].timeS!==0||Math.abs(r.samples[0].voltage-initial)>Math.max(1,Math.abs(initial))*1e-9||r.samples.at(-1).timeS<=0)return null;
 const duration=r.samples.at(-1).timeS;
 if(!Number.isFinite(r.initialVoltage)||r.initialVoltage<=0||!Number.isFinite(r.timeConstantS)||r.timeConstantS<=0)return null;
 const samples=Array.from({length:501},(_,i)=>{const timeSeconds=duration*i/500,voltage=r.initialVoltage*Math.exp(-timeSeconds/r.timeConstantS);return {timeSeconds,nodeVoltages:{[ground]:0,[power]:sourceVoltage,[output]:voltage}};});
 return {kind:'analytical-output-recording',model:'Supercapacitor hold-up discharge (501 analytical RC samples)',preferredNet:output,samples};
}

function rlcStepRecording(project,r){
 const sources=project.components.filter(c=>c.libraryId==='power.dc-source'),resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),inductors=project.components.filter(c=>c.libraryId==='passive.inductor'),capacitors=project.components.filter(c=>c.libraryId==='passive.capacitor'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(sources.length!==1||resistors.length!==1||inductors.length!==1||capacitors.length!==1||grounds.length!==1||!Array.isArray(r.samples)||r.samples.length<2||r.samples.length>2000||r.sampleCount!==r.samples.length)return null;
 const net=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:${pin}`))?.id,[s,res,l,c,g]=[sources[0],resistors[0],inductors[0],capacitors[0],grounds[0]];
 const power=net(s,'+'),ground=net(s,'-'),output=net(c,'1');
 if(!power||!ground||!output||new Set([power,ground,output]).size!==3||net(res,'1')!==power||net(res,'2')!==net(l,'1')||net(l,'2')!==output||net(c,'2')!==ground||net(g,'0')!==ground)return null;
 if(!Number.isFinite(r.sourceVoltage)||r.sourceVoltage<=0||!Number.isFinite(r.durationS)||r.durationS<=0||!Number.isFinite(r.resistanceOhms)||r.resistanceOhms<=0||!Number.isFinite(r.inductanceH)||r.inductanceH<=0||!Number.isFinite(r.capacitanceF)||r.capacitanceF<=0)return null;
 let previous=-Infinity;
 for(const sample of r.samples){if(!Number.isFinite(sample.timeS)||sample.timeS<previous||!Number.isFinite(sample.capacitorVoltageV))return null;previous=sample.timeS;}
 if(r.samples[0].timeS!==0||r.samples.at(-1).timeS!==r.durationS)return null;
 const samples=r.samples.map(sample=>({timeSeconds:sample.timeS,nodeVoltages:{[ground]:0,[power]:r.sourceVoltage,[output]:sample.capacitorVoltageV}}));
 return {kind:'analytical-output-recording',model:'RLC step response (analytical model samples)',preferredNet:output,samples};
}

function buttonDebounceRecording(project,r){
 const mcus=project.components.filter(c=>c.libraryId==='active.mcu-uno-ideal'),inputs=project.components.filter(c=>c.libraryId==='input.digital-sample-sequence'),resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),leds=project.components.filter(c=>c.libraryId==='diode.led-red'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(mcus.length!==1||inputs.length!==1||resistors.length!==1||leds.length!==1||grounds.length!==1||!Array.isArray(r.samples)||!Array.isArray(r.trace)||r.trace.length!==r.samples.length||r.trace.length<2||r.trace.length>2000||!Number.isFinite(r.sampleRateHz)||r.sampleRateHz<=0)return null;
 const net=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:${pin}`))?.id,[mcu,input,resistor,led,ground]=[mcus[0],inputs[0],resistors[0],leds[0],grounds[0]];
 const inputNet=net(input,'OUT'),groundNet=net(ground,'0'),outputNet=net(mcu,'D13');
 if(!inputNet||!groundNet||!outputNet||net(mcu,'D2')!==inputNet||net(input,'GND')!==groundNet||net(mcu,'GND')!==groundNet||net(resistor,'1')!==outputNet||net(resistor,'2')!==net(led,'A')||net(led,'K')!==groundNet)return null;
 const samples=[];
 for(let i=0;i<r.trace.length;i++){const item=r.trace[i];if(item.sampleIndex!==i||item.sample!==r.samples[i]||![0,1].includes(item.sample)||typeof item.gpioHigh!=='boolean'||typeof item.ledOn!=='boolean'||item.ledOn!==item.gpioHigh)return null;samples.push({timeSeconds:i/r.sampleRateHz,nodeVoltages:{[groundNet]:0,[inputNet]:item.sample,[outputNet]:item.gpioHigh?1:0}});}
 return {kind:'analytical-output-recording',units:'logic',model:'Arduino button debounce digital IO levels (sampled firmware execution)',preferredNet:outputNet,samples};
}

function activeLowPassRecording(project,r){
 const sources=project.components.filter(c=>c.libraryId==='power.dc-source'),inputs=project.components.filter(c=>c.libraryId==='power.ac-source'),opamps=project.components.filter(c=>c.libraryId==='active.opamp-ideal'),resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),capacitors=project.components.filter(c=>c.libraryId==='passive.capacitor'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(sources.length!==2||inputs.length!==1||opamps.length!==1||resistors.length!==3||capacitors.length!==1||grounds.length!==1||!Array.isArray(r.response))return null;
 const net=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:${pin}`))?.id,between=(c,a,b)=>{const one=net(c,'1'),two=net(c,'2');return one===a&&two===b||one===b&&two===a;},[input,opamp,ground]=[inputs[0],opamps[0],grounds[0]];
 const gnd=net(ground,'0'),inputNet=net(input,'+'),output=net(opamp,'OUT'),inverting=net(opamp,'-'),nonInverting=net(opamp,'+');
 const positive=sources.find(c=>net(c,'-')===gnd),negative=sources.find(c=>net(c,'+')===gnd),inputResistor=resistors.find(c=>between(c,inputNet,nonInverting)),feedback=resistors.find(c=>between(c,output,inverting)),gainLeg=resistors.find(c=>c!==inputResistor&&c!==feedback&&between(c,inverting,gnd));
 if(!gnd||!inputNet||!output||!inverting||!nonInverting||!positive||!negative||positive===negative||net(opamp,'VCC')!==net(positive,'+')||net(opamp,'VEE')!==net(negative,'-')||net(input,'-')!==gnd||!inputResistor||!feedback||!gainLeg)return null;
 const cap=capacitors[0];
 if(inputNet===nonInverting||!between(cap,nonInverting,gnd)||!r.response.length)return null;
 const amplitude=r.inputAmplitudeV,cutoff=r.cutoffHz,point=r.response.filter(s=>[s.frequencyHz,s.gain,s.outputAmplitudeV].every(Number.isFinite)&&s.frequencyHz>0).sort((a,b)=>Math.abs(Math.log(a.frequencyHz/cutoff))-Math.abs(Math.log(b.frequencyHz/cutoff)))[0];
 if(!Number.isFinite(amplitude)||amplitude<0||!Number.isFinite(cutoff)||cutoff<=0||!point||Math.abs(point.outputAmplitudeV-amplitude*point.gain)>Math.max(1,point.outputAmplitudeV)*1e-9)return null;
 const phase=-Math.atan(point.frequencyHz/cutoff),duration=4/point.frequencyHz,samples=Array.from({length:481},(_,i)=>{const timeSeconds=duration*i/480,angle=2*Math.PI*point.frequencyHz*timeSeconds;return {timeSeconds,nodeVoltages:{[gnd]:0,[inputNet]:amplitude*Math.sin(angle),[output]:point.outputAmplitudeV*Math.sin(angle+phase)}};});
 return {kind:'analytical-output-recording',model:`Active low-pass steady-state sine at ${point.frequencyHz} Hz (frequency-domain estimate, not transient simulation)`,preferredNet:output,samples};
}

function rectifierWaveformRecording(project,r){
 const smooth=r.kind==='bridge-smoothing-capacitor',sources=project.components.filter(c=>c.libraryId==='power.ac-source'),bridges=project.components.filter(c=>c.libraryId==='diode.bridge-ideal'),resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),capacitors=project.components.filter(c=>c.libraryId==='passive.capacitor'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(sources.length!==1||bridges.length!==1||resistors.length!==1||grounds.length!==1||capacitors.length!==(smooth?1:0)||!Array.isArray(r.waveform)||r.waveform.length<2||r.waveform.length>2000)return null;
 const net=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:${pin}`))?.id,[source,bridge,resistor,ground]=[sources[0],bridges[0],resistors[0],grounds[0]];
 const inputPositive=net(source,'+'),inputNegative=net(source,'-'),output=net(bridge,'POS'),returnNet=net(bridge,'NEG');
 if(!inputPositive||!inputNegative||!output||!returnNet||net(bridge,'AC1')!==inputPositive||net(bridge,'AC2')!==inputNegative||net(resistor,'1')!==output||net(resistor,'2')!==returnNet||net(ground,'0')!==returnNet)return null;
 if(smooth){const capacitor=capacitors[0];if(net(capacitor,'1')!==output||net(capacitor,'2')!==returnNet)return null;}
 if(!Number.isFinite(r.inputFrequencyHz)||r.inputFrequencyHz<=0||!Number.isFinite(r.sourceRmsVoltage)||r.sourceRmsVoltage<=0)return null;
 let previous=-Infinity;
 for(const sample of r.waveform){if(!Number.isFinite(sample.timeS)||sample.timeS<=previous||!Number.isFinite(sample.inputVoltage)||!Number.isFinite(sample.outputVoltage)||(smooth&&!Number.isFinite(sample.rectifiedVoltage)))return null;previous=sample.timeS;}
 const samples=r.waveform.map(sample=>({timeSeconds:sample.timeS,nodeVoltages:{[returnNet]:0,[output]:sample.outputVoltage}}));
 return {kind:'analytical-output-recording',model:`${smooth?'Bridge smoothing-capacitor':'Bridge rectifier'} output waveform (analytical model samples)`,preferredNet:output,samples};
}

function tvsPulseRecording(project,r){
 const sources=project.components.filter(c=>c.libraryId==='power.dc-source'),resistors=project.components.filter(c=>c.libraryId==='passive.resistor'),tvs=project.components.filter(c=>c.libraryId==='protection.tvs-ideal'),grounds=project.components.filter(c=>c.libraryId==='ground.signal');
 if(sources.length!==1||resistors.length!==2||tvs.length!==1||grounds.length!==1)return null;
 const net=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c.instanceId}:${pin}`))?.id,[source,clamp,ground]=[sources[0],tvs[0],grounds[0]],input=net(source,'+'),returnNet=net(source,'-'),output=net(clamp,'K'),series=resistors.find(c=>net(c,'1')===input&&net(c,'2')===output),load=resistors.find(c=>c!==series&&net(c,'1')===output&&net(c,'2')===returnNet);
 if(!input||!returnNet||!output||!series||!load||net(clamp,'A')!==returnNet||net(ground,'0')!==returnNet)return null;
 const {idleVoltage,pulseVoltage,pulseWidthS,idleOutputVoltage,pulseOutputVoltage}=r;
 if(![idleVoltage,pulseVoltage,pulseWidthS,idleOutputVoltage,pulseOutputVoltage].every(Number.isFinite)||idleVoltage<0||pulseVoltage<=idleVoltage||pulseWidthS<=0||pulseOutputVoltage<0||pulseOutputVoltage===idleOutputVoltage)return null;
 const samples=[
  {timeSeconds:0,nodeVoltages:{[returnNet]:0,[input]:idleVoltage,[output]:idleOutputVoltage}},
  {timeSeconds:0,nodeVoltages:{[returnNet]:0,[input]:pulseVoltage,[output]:pulseOutputVoltage}},
  {timeSeconds:pulseWidthS,nodeVoltages:{[returnNet]:0,[input]:pulseVoltage,[output]:pulseOutputVoltage}},
  {timeSeconds:pulseWidthS,nodeVoltages:{[returnNet]:0,[input]:idleVoltage,[output]:idleOutputVoltage}},
  {timeSeconds:2*pulseWidthS,nodeVoltages:{[returnNet]:0,[input]:idleVoltage,[output]:idleOutputVoltage}}
 ];
 return {kind:'analytical-output-recording',model:'TVS ideal rectangular pulse clamp (rise time and recovery dynamics omitted)',preferredNet:output,samples};
}


function lm2577BoostRecording(project,r){
 const byRef=reference=>project.components.find(c=>c.reference===reference),source=byRef('V1'),controller=byRef('U1'),report=byRef('SCOPE1'),ground=byRef('GND');
 if(!source||controller?.libraryId!=='active.ti-lm2577-adjustable'||!report||!ground)return null;
 const net=(component,pin)=>{const matches=project.nets.filter(item=>item.endpoints.includes(component.instanceId+':'+pin));return matches.length===1?matches[0].id:null;};
 const input=net(source,'+'),returnNet=net(source,'-'),output=net(report,'VOUT');
 if(!input||!returnNet||!output||input===returnNet||output===returnNet||net(controller,'VIN')!==input||net(controller,'GND')!==returnNet||net(report,'GND')!==returnNet||net(ground,'0')!==returnNet)return null;
 const {switchingFrequencyHz:frequency,outputVoltageV:average,outputRipplePpV:ripple,inputVoltageV:vin}=r;
 if(frequency!==52000||![average,ripple,vin].every(Number.isFinite)||average<=0||ripple<0||vin<=0||r.controllerHardwareModeled!==false)return null;
 const duration=4/frequency,samples=Array.from({length:481},(_,i)=>{const timeSeconds=duration*i/480,phase=(i/480*4)%1,voltage=average+(0.5-phase)*ripple;return {timeSeconds,nodeVoltages:{[returnNet]:0,[input]:vin,[output]:voltage}};});
 return {kind:'analytical-output-recording',model:`LM2577 CCM output ripple estimate at ${frequency} Hz (capacitor-discharge envelope; not switching-transient simulation)`,preferredNet:output,samples};
}
