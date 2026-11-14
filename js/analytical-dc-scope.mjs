// Map completed, topology-checked analytical DC results back to their project nets.
// These are steady-state readings, never time-varying waveforms.
export function analyticalDcScopeRecording(project,analysis){
 if(analysis?.state!=="complete")return null;
 const r=analysis.result,components=project.components,netOf=(c,pin)=>project.nets.find(n=>n.endpoints.includes(`${c?.instanceId}:${pin}`))?.id;
 const byType=id=>components.filter(c=>c.libraryId===id),source=byType("power.dc-source")[0],ground=byType("ground.signal")[0];
 if(r?.kind==="resistive-network"){
  const sources=byType("power.dc-source"),grounds=byType("ground.signal"),resistors=byType("passive.resistor"),nodes=r.nodeVoltages,netIds=new Set(project.nets.map(net=>net.id));
  if(sources.length!==1||grounds.length!==1||resistors.length<1||r.resistors?.length!==resistors.length||!nodes||typeof nodes!=="object")return null;
  const positive=netOf(sources[0],"+"),negative=netOf(sources[0],"-"),groundNet=netOf(grounds[0],"0"),sourceVoltage=r.sourceVoltage;
  if(!positive||!negative||negative!==groundNet||positive===negative||!Number.isFinite(sourceVoltage)||!Object.keys(nodes).length||Object.entries(nodes).some(([net,value])=>!netIds.has(net)||!Number.isFinite(value)))return null;
  const tolerance=Math.max(1,Math.abs(sourceVoltage))*1e-9;
  if(!Object.hasOwn(nodes,positive)||!Object.hasOwn(nodes,negative)||Math.abs((nodes[positive]-nodes[negative])-sourceVoltage)>tolerance)return null;
  return {kind:"analytical-dc-output",model:"Resistive network DC solution",nodes:{...nodes}};
 }
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
 if(r?.kind==="usb-led-ptc"){
  const usb=byType("power.usb-source"),fuses=byType("protection.ptc-polyfuse"),resistors=byType("passive.resistor"),leds=byType("diode.led-red");
  if(usb.length!==1||fuses.length!==1||resistors.length!==1||leds.length!==1||byType("ground.signal").length!==1)return null;
  const usbSource=usb[0],fuse=fuses[0],resistor=resistors[0],led=leds[0],vbus=netOf(usbSource,"+"),gnd=netOf(usbSource,"-"),fused=netOf(fuse,"2"),ledA=netOf(led,"A");
  if(!vbus||netOf(fuse,"1")!==vbus||!fused||![netOf(resistor,"1"),netOf(resistor,"2")].includes(fused)||![netOf(resistor,"1"),netOf(resistor,"2")].includes(ledA)||netOf(led,"K")!==gnd||gnd!==netOf(ground,"0"))return null;
  const resistance=parseResistance(resistor.value);if(!Number.isFinite(resistance))return null;
  return {kind:"analytical-dc-output",model:"USB LED with PTC analytical DC operating point",preferredNet:ledA,nodes:{[vbus]:r.sourceVoltage,[fused]:r.sourceVoltage-r.fuseVoltageDrop,[ledA]:r.sourceVoltage-r.fuseVoltageDrop-r.currentA*resistance,[gnd]:0}};
 }
 if(r?.kind==="ntc-temperature-divider"){
  const sources=byType("power.dc-source"),ntcs=byType("passive.ntc-thermistor"),resistors=byType("passive.resistor");
  if(sources.length!==1||ntcs.length!==1||resistors.length!==1||byType("ground.signal").length!==1)return null;
  const v=sources[0],ntc=ntcs[0],resistor=resistors[0],vcc=netOf(v,"+"),gnd=netOf(v,"-"),output=netOf(ntc,"2");
  if(!vcc||netOf(ntc,"1")!==vcc||!output||![netOf(resistor,"1"),netOf(resistor,"2")].includes(output)||![netOf(resistor,"1"),netOf(resistor,"2")].includes(gnd)||gnd!==netOf(ground,"0"))return null;
  return {kind:"analytical-dc-output",model:`NTC divider at ${r.temperatureC} °C`,preferredNet:output,nodes:{[vcc]:r.supplyVoltage,[output]:r.outputVoltage,[gnd]:0}};
 }
 if(r?.kind==="ldr-night-light"){
  const sources=byType("power.dc-source"),ldrs=byType("passive.ldr"),comparators=byType("active.comparator-ideal"),resistors=byType("passive.resistor"),leds=byType("diode.led-red");
  if(sources.length!==1||ldrs.length!==1||comparators.length!==1||resistors.length!==2||leds.length!==1||byType("ground.signal").length!==1)return null;
  const v=sources[0],ldr=ldrs[0],comp=comparators[0],led=leds[0],gnd=netOf(v,"-"),vcc=netOf(v,"+"),sense=netOf(ldr,"2"),output=netOf(comp,"OUT"),ledA=netOf(led,"A"),divider=resistors.find(x=>[netOf(x,"1"),netOf(x,"2")].includes(sense)&&[netOf(x,"1"),netOf(x,"2")].includes(gnd)),series=resistors.find(x=>x!==divider&&[netOf(x,"1"),netOf(x,"2")].includes(output)&&[netOf(x,"1"),netOf(x,"2")].includes(ledA));
  if(!vcc||!gnd||netOf(ldr,"1")!==vcc||netOf(comp,"SENSE")!==sense||netOf(comp,"VCC")!==vcc||netOf(comp,"GND")!==gnd||netOf(led,"K")!==gnd||!divider||!series||gnd!==netOf(ground,"0"))return null;
  const resistance=parseResistance(series.value);if(!Number.isFinite(resistance))return null;
  const outputVoltage=r.ledOn?r.supplyVoltage:0;
  return {kind:"analytical-dc-output",model:`LDR night-light ${r.illuminationPercent}% illumination DC operating point`,preferredNet:ledA,nodes:{[vcc]:r.supplyVoltage,[sense]:r.senseVoltage,[output]:outputVoltage,[ledA]:outputVoltage-r.ledCurrentA*resistance,[gnd]:0}};
 }
 return null;
}

function parseResistance(value){
 const match=String(value??"").trim().match(/^([\d.]+)\s*(Ω|ohm|kΩ|k ohm|MΩ)?$/i);if(!match)return NaN;
 const factor=/^k/i.test(match[2]??"")?1e3:/^m/i.test(match[2]??"")?1e6:1;
 return Number(match[1])*factor;
}

