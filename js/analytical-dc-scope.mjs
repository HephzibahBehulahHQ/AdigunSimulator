// Map completed, topology-checked analytical DC results back to their project nets.
// These are steady-state readings, never time-varying waveforms.
export function analyticalDcScopeRecording(project,analysis){
 if(analysis?.state!=="complete")return null;
 const r=analysis.result,components=project.components,netOf=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c?.instanceId}:${pin}`))?.id;
 const byType=id=>components.filter(c=>c.libraryId===id),source=byType("power.dc-source")[0],ground=byType("ground.signal")[0];
 if(r?.kind==="led-polarity-indicator"){
  const reds=byType("diode.led-red"),greens=byType("diode.led-green"),red=reds[0],green=greens[0],resistors=byType("passive.resistor"),resistorResult=ref=>r.resistorResults?.find(item=>item.reference===ref);
  if(byType("power.dc-source").length!==1||byType("ground.signal").length!==1||reds.length!==1||greens.length!==1||resistors.length!==2)return null;
  const vcc=netOf(source,"+"),gnd=netOf(source,"-"),redA=netOf(red,"A"),greenK=netOf(green,"K"),redR=resistors.find(x=>resistorResult(x.reference)),greenR=resistors.find(x=>x!==redR&&resistorResult(x.reference));
  const between=(resistor,a,b)=>[netOf(resistor,"1"),netOf(resistor,"2")].sort().join("|")===[a,b].sort().join("|");
  if(!vcc||gnd!==netOf(ground,"0")||netOf(red,"K")!==gnd||netOf(green,"A")!==gnd||!redA||!greenK||!redR||!greenR||!between(redR,vcc,redA)||!between(greenR,vcc,greenK))return null;
  const redI=resistorResult(redR.reference).currentA,greenI=resistorResult(greenR.reference).currentA,redResistance=parseResistance(redR.value),greenResistance=parseResistance(greenR.value);
  if(![redI,greenI,redResistance,greenResistance].every(Number.isFinite))return null;
  const nodes={[vcc]:r.sourceVoltage,[gnd]:0,[redA]:r.sourceVoltage-redI*redResistance,[greenK]:r.sourceVoltage+(r.polarity==="negative"?greenI*greenResistance:0)};
  return {kind:"analytical-dc-output",model:"Anti-parallel LED analytical DC operating point",preferredNet:redA,nodes};
 }
 if(r?.kind==="pushbutton-led"){
  const sw=byType("input.pushbutton")[0],led=byType("diode.led-red")[0],resistors=byType("passive.resistor");
  if(!source||!ground||!sw||!led||resistors.length!==2)return null;
  const vcc=netOf(source,"+"),gnd=netOf(source,"-"),swIn=netOf(sw,"1"),swOut=netOf(sw,"2"),ledA=netOf(led,"A"),ledK=netOf(led,"K");
  const series=resistors.find(x=>[netOf(x,"1"),netOf(x,"2")].includes(swOut)&&[netOf(x,"1"),netOf(x,"2")].includes(ledA));
  const pullDown=resistors.find(x=>x!==series&&[netOf(x,"1"),netOf(x,"2")].includes(swOut)&&[netOf(x,"1"),netOf(x,"2")].includes(gnd));
  if(!vcc||swIn!==vcc||!swOut||!ledA||gnd!==netOf(ground,"0")||ledK!==gnd||!series||!pullDown)return null;
  const current=r.resistorResults?.find(item=>item.reference===series.reference)?.currentA,resistance=parseResistance(series.value);
  if(!Number.isFinite(current)||!Number.isFinite(resistance))return null;
  return {kind:"analytical-dc-output",model:`Pushbutton LED ${r.switchState} DC operating point`,preferredNet:ledA,nodes:{[vcc]:r.sourceVoltage,[gnd]:0,[swOut]:r.outputVoltageV,[ledA]:r.outputVoltageV-current*resistance}};
 }
 if(r?.kind==="latching-led-switch"){
  const sw=byType("input.spdt-switch")[0],led=byType("diode.led-red")[0],resistor=byType("passive.resistor")[0];
  if(!source||!ground||!sw||!led||!resistor)return null;
  const vcc=netOf(source,"+"),gnd=netOf(source,"-"),swA=netOf(sw,"A"),swB=netOf(sw,"B"),swOut=netOf(sw,"COM"),r1=netOf(resistor,"1"),r2=netOf(resistor,"2"),ledA=netOf(led,"A");
  if(!vcc||swA!==vcc||gnd!==netOf(ground,"0")||swB!==gnd||!swOut||ledA===gnd||![r1,r2].includes(swOut)||![r1,r2].includes(ledA)||netOf(led,"K")!==gnd)return null;
  const ledResistance=parseResistance(resistor.value);if(!Number.isFinite(ledResistance))return null;
  const output=r.switchPosition==="A"?r.sourceVoltage:0;
  return {kind:"analytical-dc-output",model:`Latching LED switch position ${r.switchPosition} DC operating point`,preferredNet:ledA,nodes:{[vcc]:r.sourceVoltage,[gnd]:0,[swOut]:output,[ledA]:output-r.ledCurrentA*ledResistance}};
 }
 return null;
}

function parseResistance(value){
 const match=String(value??"").trim().match(/^([\d.]+)\s*(Ω|ohm|kΩ|k ohm|MΩ)?$/i);if(!match)return NaN;
 const factor=/^k/i.test(match[2]??"")?1e3:/^m/i.test(match[2]??"")?1e6:1;
 return Number(match[1])*factor;
}

