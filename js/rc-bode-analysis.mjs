const blocked=message=>({state:"blocked",engine:"Bounded first-order RC Bode analysis",message,result:null});
const parseOhms=value=>{const m=String(value??"").trim().match(/^([\d.]+)\s*(MΩ|kΩ|Ω)?$/);if(!m)return NaN;return Number(m[1])*(m[2]==="MΩ"?1e6:m[2]==="kΩ"?1e3:1);};
const parseFarads=value=>{const m=String(value??"").trim().match(/^([\d.]+)\s*(mF|µF|μF|uF|nF|pF|F)$/);if(!m)return NaN;const scale={mF:1e-3,"µF":1e-6,"μF":1e-6,uF:1e-6,nF:1e-9,pF:1e-12,F:1}[m[2]];return Number(m[1])*scale;};
export function analyzeRcBode(project){
  const config=project?.bodeAnalysis;if(!config)return blocked("Configure an RC Bode analysis before running.");
  const r=project.components.find(c=>c.reference===config.resistorReference&&c.libraryId==="passive.resistor"),c=project.components.find(x=>x.reference===config.capacitorReference&&x.libraryId==="passive.capacitor");
  const source=project.components.find(x=>x.libraryId==="power.ac-source"),nets=new Map();for(const net of project.nets??[])for(const endpoint of net.endpoints??[])nets.set(endpoint,net.id);
  if(!r||!c||!source)return blocked("The supported Bode model requires one AC source, the named resistor and capacitor.");
  const inputNet=nets.get(source.instanceId+":+"),groundNet=nets.get(source.instanceId+":-"),outNet=nets.get(r.instanceId+":2");
  if(nets.get(r.instanceId+":1")!==inputNet||nets.get(c.instanceId+":1")!==outNet||nets.get(c.instanceId+":2")!==groundNet)return blocked("The supported topology is source → series resistor → output, with capacitor from output to source return.");
  const resistance=parseOhms(r.value),capacitance=parseFarads(c.value),decades=Number(config.spanDecades??2),count=Number(config.pointCount??41);
  if(!Number.isFinite(resistance)||!Number.isFinite(capacitance)||resistance<=0||capacitance<=0||!Number.isFinite(decades)||decades<=0||!Number.isInteger(count)||count<3||count>1001||count%2===0)return blocked("R, C, decade span and odd plot point count must be valid.");
  const cutoff=1/(2*Math.PI*resistance*capacitance),start=cutoff/10**decades,stop=cutoff*10**decades;
  const points=Array.from({length:count},(_,i)=>{const frequency=start*(stop/start)**(i/(count-1)),ratio=frequency/cutoff,magnitude=1/Math.sqrt(1+ratio*ratio);return {frequencyHz:frequency,magnitudeRatio:magnitude,magnitudeDb:20*Math.log10(magnitude),phaseDeg:-Math.atan(ratio)*180/Math.PI};});
  const cutoffIndex=(count-1)/2,marker=points[cutoffIndex];
  return {state:"complete",engine:"Bounded first-order RC low-pass frequency response",message:"Ideal small-signal first-order RC response; source impedance, capacitor parasitics, tolerances and loading are not modeled.",result:{kind:"rc-bode-plot",cutoffHz:cutoff,cutoffMagnitudeDb:marker.magnitudeDb,cutoffPhaseDeg:marker.phaseDeg,cutoffIndex,frequencyStartHz:start,frequencyStopHz:stop,pointCount:points.length,frequencyUnit:"Hz",phaseUnit:"deg",magnitudeUnit:"dB",points}};
}
