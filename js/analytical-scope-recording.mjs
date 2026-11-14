// Sample existing successful analytical models. These are ideal output estimates,
// not fabricated measurements or a substitute for nonlinear transient simulation.
export function analyticalScopeRecording(project,analysis){
 if(analysis?.state!=='complete')return null;
 const r=analysis.result,kind=r?.kind;
 if(['rc-step-response','rl-step-response','rc-charge-discharge'].includes(kind))return firstOrderRecording(project,r);
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

// Evaluate the same successful first-order model at display resolution. Preserve
// its physical net identities and initial condition; never synthesize a sine wave.
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
