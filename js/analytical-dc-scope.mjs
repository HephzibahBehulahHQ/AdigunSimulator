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
 if(r?.kind==="linear-regulated-supply"){
  const ac=byType("power.ac-source"),transformers=byType("passive.transformer-ideal"),bridges=byType("diode.bridge-ideal"),capacitors=byType("passive.capacitor"),regulators=byType("active.regulator-7805-ideal"),resistors=byType("passive.resistor"),grounds=byType("ground.signal");
  if(ac.length!==1||transformers.length!==1||bridges.length!==1||capacitors.length!==1||regulators.length!==1||resistors.length!==1||grounds.length!==1||byType("power.dc-source").length!==0)return null;
  const [input,transformer,bridge,capacitor,regulator,load,gnd]=[ac[0],transformers[0],bridges[0],capacitors[0],regulators[0],resistors[0],grounds[0]],n=(c,pin)=>netOf(c,pin);
  const output=n(regulator,"OUT"),returnNet=n(regulator,"GND"),raw=n(regulator,"IN");
  if(!output||!returnNet||!raw||n(input,"+")!==n(transformer,"PRI1")||n(input,"-")!==n(transformer,"PRI2")||n(transformer,"SEC1")!==n(bridge,"AC1")||n(transformer,"SEC2")!==n(bridge,"AC2")||n(bridge,"POS")!==raw||n(bridge,"NEG")!==returnNet||n(capacitor,"1")!==raw||n(capacitor,"2")!==returnNet||n(load,"1")!==output||n(load,"2")!==returnNet||n(gnd,"0")!==returnNet)return null;
  if(r.regulated!==true||!Number.isFinite(r.outputVoltage)||!Number.isFinite(r.outputSetpointV)||Math.abs(r.outputVoltage-r.outputSetpointV)>1e-9)return null;
  return {kind:"analytical-dc-output",model:"Linear regulated supply DC output (ripple voltage reported separately)",nodes:{[returnNet]:0,[output]:r.outputVoltage}};
 }
 if(r?.kind==="zener-shunt-regulator"){
  const sources=byType("power.dc-source"),zener=byType("diode.zener-ideal"),resistors=byType("passive.resistor"),grounds=byType("ground.signal");
  if(sources.length!==1||zener.length!==1||resistors.length!==2||grounds.length!==1)return null;
  const [voltageSource,diode,gnd]=[sources[0],zener[0],grounds[0]],net=(c,pin)=>netOf(c,pin),returnNet=net(voltageSource,"-"),input=net(voltageSource,"+"),output=net(diode,"K"),series=resistors.find(c=>net(c,"1")===input&&net(c,"2")===output),load=resistors.find(c=>c!==series&&net(c,"1")===output&&net(c,"2")===returnNet);
  if(!input||!output||!returnNet||!series||!load||net(diode,"A")!==returnNet||net(gnd,"0")!==returnNet||!Number.isFinite(r.sourceVoltage)||!Number.isFinite(r.outputVoltage)||r.outputVoltage<0||r.outputVoltage>r.sourceVoltage)return null;
  return {kind:"analytical-dc-output",model:`Zener shunt regulator DC output (${r.zenerOn?"zener conducting":"zener off"}; steady-state estimate)`,nodes:{[returnNet]:0,[input]:r.sourceVoltage,[output]:r.outputVoltage}};
 }
 if(r?.kind==="solar-garden-light"){
  const solar=byType("power.solar-cell"),batteries=byType("power.rechargeable-battery"),diodes=byType("diode.schottky"),ldrs=byType("passive.ldr"),mosfets=byType("active.nmos-switch"),leds=byType("diode.led-red"),resistors=byType("passive.resistor"),grounds=byType("ground.signal");
  if(solar.length!==1||batteries.length!==1||diodes.length!==1||ldrs.length!==1||mosfets.length!==1||leds.length!==1||resistors.length!==2||grounds.length!==1)return null;
  const [pv,battery,diode,ldr,mosfet,led,gnd]=[solar[0],batteries[0],diodes[0],ldrs[0],mosfets[0],leds[0],grounds[0]],n=(c,pin)=>netOf(c,pin),returnNet=n(gnd,"0"),pvPositive=n(pv,"+"),batteryPositive=n(battery,"+"),gate=n(mosfet,"G"),drain=n(mosfet,"D"),ledAnode=n(led,"A");
  const between=(c,a,b)=>n(c,"1")===a&&n(c,"2")===b||n(c,"2")===a&&n(c,"1")===b,batteryResistor=resistors.find(c=>between(c,batteryPositive,gate)),ledResistor=resistors.find(c=>c!==batteryResistor&&between(c,batteryPositive,ledAnode));
  if(!returnNet||!pvPositive||!batteryPositive||!gate||!drain||n(pv,"-")!==returnNet||n(battery,"-")!==returnNet||n(diode,"A")!==pvPositive||n(diode,"K")!==batteryPositive||n(ldr,"1")!==gate||n(ldr,"2")!==returnNet||n(mosfet,"S")!==returnNet||n(led,"K")!==drain||!batteryResistor||!ledResistor)return null;
  if(!Number.isFinite(r.batteryVoltage)||!Number.isFinite(r.gateVoltage)||!Number.isFinite(r.ldrResistance)||r.ldrResistance<=0||typeof r.mosfetConducting!=="boolean"||typeof r.ledOn!=="boolean")return null;
  return {kind:"analytical-dc-output",model:"Solar garden light operating-point estimate (battery and LDR gate nodes)",nodes:{[returnNet]:0,[batteryPositive]:r.batteryVoltage,[gate]:r.gateVoltage}};
 }
 if(r?.kind==="battery-discharge-monitor"){
  const sources=byType("power.dc-source"),comparators=byType("active.comparator-ideal"),resistors=byType("passive.resistor"),leds=byType("diode.led-red"),grounds=byType("ground.signal");
  if(sources.length!==1||comparators.length!==1||resistors.length!==3||leds.length!==1||grounds.length!==1)return null;
  const [supply,comparator,led,groundPart]=[sources[0],comparators[0],leds[0],grounds[0]],n=(c,pin)=>netOf(c,pin),sourceNet=n(supply,"+"),returnNet=n(supply,"-"),sense=n(comparator,"SENSE"),alarm=n(comparator,"OUT"),ledA=n(led,"A");
  const upper=resistors.find(c=>n(c,"1")===sourceNet&&n(c,"2")===sense),lower=resistors.find(c=>c!==upper&&n(c,"1")===sense&&n(c,"2")===returnNet),series=resistors.find(c=>c!==upper&&c!==lower&&n(c,"1")===alarm&&n(c,"2")===ledA);
  if(!sourceNet||!returnNet||!sense||!alarm||!ledA||!upper||!lower||!series||n(comparator,"VCC")!==sourceNet||n(comparator,"GND")!==returnNet||n(led,"K")!==returnNet||n(groundPart,"0")!==returnNet)return null;
  if(!Number.isFinite(r.batteryVoltage)||!Number.isFinite(r.senseVoltage)||!Number.isFinite(r.comparatorOutputVoltage)||typeof r.lowBattery!=="boolean"||typeof r.ledOn!=="boolean")return null;
  return {kind:"analytical-dc-output",model:`Battery discharge monitor DC operating point (battery ${r.lowBattery?"below":"above"} trip; ideal comparator)`,nodes:{[returnNet]:0,[sourceNet]:r.batteryVoltage,[sense]:r.senseVoltage,[alarm]:r.comparatorOutputVoltage}};
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

