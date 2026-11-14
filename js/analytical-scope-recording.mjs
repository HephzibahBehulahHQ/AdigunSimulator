// Sample existing successful analytical models. These are ideal output estimates,
// not fabricated measurements or a substitute for nonlinear transient simulation.
export function analyticalScopeRecording(project,analysis){
 if(analysis?.state!=='complete')return null;
 const r=analysis.result,kind=r?.kind;
 if(kind==='digital-event-simulation')return digitalEventRecording(project,r);
 if(['rc-step-response','rl-step-response','rc-charge-discharge'].includes(kind))return firstOrderRecording(project,r);
 if(kind==='pwm-led-average')return pwmGateRecording(project,r);
 if(['rc-low-pass','rc-high-pass','rl-low-pass','passive-tone-control'].includes(kind))return frequencyResponseRecording(project,r);
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

