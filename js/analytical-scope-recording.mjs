// Sample existing successful analytical models. These are ideal output estimates,
// not fabricated measurements or a substitute for nonlinear transient simulation.
export function analyticalScopeRecording(project,analysis){
 if(analysis?.state!=='complete')return null;
 const r=analysis.result,kind=r?.kind;
 if(!['ne555-astable','ne555-monostable','stm32-timer-pwm'].includes(kind))return null;
 const timer=project.components.find(c=>c.libraryId===(kind.startsWith('ne555')?'active.ne555':'active.stm32-timer-ideal'));
 if(!timer)return null;
 const net=pin=>project.nets.find(n=>n.endpoints.includes(timer.instanceId+':'+pin))?.id;
 const output=net(kind.startsWith('ne555')?'3':'TIM1_CH1'),power=net(kind.startsWith('ne555')?'8':'VCC'),ground=net(kind.startsWith('ne555')?'1':'GND');
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
