const blocked=message=>({state:"blocked",engine:"Bounded second-order RLC step model",message,warnings:[],result:null});
const parse=(value,units)=>{const m=String(value??"").trim().match(/^([\d.]+)\s*([a-zA-ZµμΩ]+)$/);if(!m)return NaN;const factor=units[m[2]];return factor===undefined?NaN:Number(m[1])*factor;};
const V=Object.freeze({V:1,mV:1e-3}),R=Object.freeze({"Ω":1,ohm:1,kΩ:1e3,MΩ:1e6}),L=Object.freeze({H:1,mH:1e-3,µH:1e-6,μH:1e-6,uH:1e-6}),C=Object.freeze({F:1,mF:1e-3,µF:1e-6,μF:1e-6,uF:1e-6,nF:1e-9,pF:1e-12});
export function analyzeRlcStep(project){
  const cfg=project?.rlcTransient;if(!cfg)return blocked("Configure a transient RLC pulse analysis.");
  const find=(ref,lib)=>project.components.find(part=>part.reference===ref&&part.libraryId===lib),source=find(cfg.sourceReference??"V1","power.dc-source"),resistor=find(cfg.resistorReference??"R1","passive.resistor"),inductor=find(cfg.inductorReference??"L1","passive.inductor"),capacitor=find(cfg.capacitorReference??"C1","passive.capacitor");
  if(!source||!resistor||!inductor||!capacitor)return blocked("The RLC model requires declared source, resistor, inductor and capacitor components.");
  const net=new Map();for(const item of project.nets??[])for(const endpoint of item.endpoints??[])net.set(endpoint,item.id);
  const input=net.get(source.instanceId+":+"),ground=net.get(source.instanceId+":-"),nodeR=net.get(resistor.instanceId+":2"),nodeL=net.get(inductor.instanceId+":2");
  if(net.get(resistor.instanceId+":1")!==input||net.get(inductor.instanceId+":1")!==nodeR||net.get(capacitor.instanceId+":1")!==nodeL||net.get(capacitor.instanceId+":2")!==ground)return blocked("Supported series topology is source → R → L → C → source return.");
  const voltage=parse(source.value,V),ohms=parse(resistor.value,R),henries=parse(inductor.value,L),farads=parse(capacitor.value,C),duration=Number(cfg.durationS),dt=Number(cfg.timeStepS);
  if(![voltage,ohms,henries,farads,duration,dt].every(Number.isFinite)||voltage<=0||ohms<=0||henries<=0||farads<=0||duration<=0||dt<=0)return blocked("Source, R, L, C, duration and timestep must be positive valid values.");
  const samplesCount=Math.ceil(duration/dt)+1;if(samplesCount>10001)return blocked("Requested transient trace exceeds the 10,001-sample limit.");
  const alpha=ohms/(2*henries),omega0=1/Math.sqrt(henries*farads),zeta=alpha/omega0,underdamped=alpha<omega0*(1-1e-9),critical=Math.abs(alpha-omega0)<=omega0*1e-9,omegaD=underdamped?Math.sqrt(omega0*omega0-alpha*alpha):0;
  const recommended=underdamped?2*Math.PI/omegaD/20:1/omega0/20,warnings=[];
  if(dt>recommended)warnings.push({code:"TIMESTEP_RESOLUTION",message:"Timestep exceeds the recommended response-resolution limit of "+recommended.toExponential(3)+" s; ringing or settling detail may be undersampled."});
  const samples=Array.from({length:samplesCount},(_,i)=>{const timeS=Math.min(i*dt,duration);let response;
    if(underdamped)response=1-Math.exp(-alpha*timeS)*(Math.cos(omegaD*timeS)+(alpha/omegaD)*Math.sin(omegaD*timeS));
    else if(critical)response=1-Math.exp(-alpha*timeS)*(1+alpha*timeS);
    else{const root=Math.sqrt(alpha*alpha-omega0*omega0),s1=-alpha+root,s2=-alpha-root;response=1-(s2*Math.exp(s1*timeS)-s1*Math.exp(s2*timeS))/(s2-s1);}
    return {timeS,capacitorVoltageV:voltage*response};});
  const peak=Math.max(...samples.map(sample=>sample.capacitorVoltageV)),dampedFrequencyHz=underdamped?omegaD/(2*Math.PI):0;
  return {state:"complete",engine:"Bounded analytical series RLC step response",message:"Closed-form ideal RLC step response. Source resistance, parasitics, component tolerance, nonlinear saturation and numerical integration are not modeled.",warnings,result:{kind:"rlc-step-response",sourceVoltage:voltage,resistanceOhms:ohms,inductanceH:henries,capacitanceF:farads,dampingRatio:zeta,regime:underdamped?"underdamped":critical?"critical":"overdamped",dampedFrequencyHz,peakVoltageV:peak,overshootV:Math.max(0,peak-voltage),ringingVisible:underdamped&&peak>voltage,sampleCount:samples.length,timeStepS:dt,recommendedTimeStepS:recommended,durationS:duration,samples}};
}
