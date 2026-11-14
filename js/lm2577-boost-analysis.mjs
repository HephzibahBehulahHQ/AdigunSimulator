const number=(value)=>{const m=String(value??"").match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?/i);return m?Number(m[0]):NaN;};
const endpointNets=(project)=>{const map=new Map();for(const net of project.nets??[])for(const endpoint of net.endpoints??[])map.set(endpoint,net.id);return map;};
const unit=(value,kind)=>{
 const text=String(value??"");
 const n=number(text);if(!Number.isFinite(n))return NaN;
 if(kind==="voltage"){const u=text.match(/(m?V)\b/i)?.[1]?.toLowerCase();return u==="mV"?n/1000:u==="v"?n:NaN;}
 if(kind==="resistance"){const u=text.match(/(k)?\s*(?:Ω|ohms?)\b/i);return u?(u[1]?n*1000:n):NaN;}
 if(kind==="capacitance"){const u=text.match(/(µ|u|n|p)?F\b/i)?.[1]?.toLowerCase();return u==="µ"||u==="u"?n*1e-6:u==="n"?n*1e-9:u==="p"?n*1e-12:u===""?n:NaN;}
 if(kind==="inductance"){const u=text.match(/(µ|u|m)?H\b/i)?.[1]?.toLowerCase();return u==="µ"||u==="u"?n*1e-6:u==="m"?n*1e-3:u===""?n:NaN;}
 return NaN;
};
export function analyseLm2577Boost(project,{validation}={}){
 const byRef=(reference)=>project.components?.find(c=>c.reference===reference),parts={
  source:byRef("V1"),controller:byRef("U1"),inductor:byRef("L1"),diode:byRef("D1"),
  outputCap:byRef("C1"),inputCap:byRef("CIN"),load:byRef("RLOAD"),report:byRef("SCOPE1"),
  ground:byRef("GND"),top:byRef("RFB1"),bottom:byRef("RFB2"),compResistor:byRef("RCOMP"),
  compCap:byRef("CCOMP"),outputConnector:byRef("J2")
 };
 const missing=Object.entries(parts).filter(([,part])=>!part).map(([name])=>name);
 if(missing.length)return {state:"blocked",message:`The LM2577 reference circuit is missing ${missing.join(", ")}. Restore the listed reference components before running.`,validation};
 const nets=endpointNets(project),net=(part,pin)=>nets.get(`${part.instanceId}:${pin}`);
 const groups=[
  ["VIN",[[parts.source,"+"],[parts.controller,"VIN"],[parts.inductor,"1"],[parts.inputCap,"1"]]],
  ["GND",[[parts.source,"-"],[parts.controller,"GND"],[parts.outputCap,"2"],[parts.inputCap,"2"],[parts.load,"2"],[parts.report,"GND"],[parts.ground,"0"],[parts.bottom,"2"],[parts.compCap,"2"],[parts.outputConnector,"GND"]]],
  ["SWITCH",[[parts.controller,"SW"],[parts.inductor,"2"],[parts.diode,"A"]]],
  ["VOUT",[[parts.diode,"K"],[parts.outputCap,"1"],[parts.load,"1"],[parts.top,"1"],[parts.report,"VOUT"],[parts.outputConnector,"VOUT"]]],
  ["FB",[[parts.controller,"FB"],[parts.top,"2"],[parts.bottom,"1"]]],
  ["COMP",[[parts.controller,"COMP"],[parts.compResistor,"1"]]],
  ["COMP_RC",[[parts.compResistor,"2"],[parts.compCap,"1"]]]
 ];
 const faults=[];
 for(const [name,pins] of groups){const ids=pins.map(([part,pin])=>part?net(part,pin):null);if(!ids[0]||ids.some(id=>!id||id!==ids[0]))faults.push(`connect ${pins.map(([part,pin])=>part?`${part.reference} ${pin}`:"J1").join(", ")} on the ${name} net`);}
 if(faults.length)return {state:"blocked",message:"LM2577 boost wiring is incomplete or inconsistent. To fix it: "+faults.join("; ")+".",validation};
 if(project.components.length!==14)return {state:"blocked",message:"This LM2577 reference design expects 14 components. Remove unsupported extras or restore a missing reference component.",validation};
 const vin=unit(parts.source.value,"voltage"),vf=number(String(parts.diode.value).match(/Vf\s*([-+]?\d+(?:\.\d+)?)/i)?.[1]),l=unit(parts.inductor.value,"inductance"),c=unit(parts.outputCap.value,"capacitance"),rLoad=unit(parts.load.value,"resistance"),rTop=unit(parts.top.value,"resistance"),rBottom=unit(parts.bottom.value,"resistance"),rComp=unit(parts.compResistor.value,"resistance"),cComp=unit(parts.compCap.value,"capacitance");
 if(!Number.isFinite(vin)||vin<3.5||vin>40||!Number.isFinite(vf)||vf<0.1||vf>1.5||!Number.isFinite(l)||l<1e-6||l>10||!Number.isFinite(c)||c<1e-6||c>10||unit(parts.inputCap.value,"capacitance")<=0||!Number.isFinite(rLoad)||rLoad<=0||!Number.isFinite(rTop)||rTop<=0||!Number.isFinite(rBottom)||rBottom<=0||rComp!==2200||Math.abs(cComp-0.33e-6)>0.01e-6){
  return {state:"blocked",message:"Use a 3.5–40 V input, positive inductor/capacitor/load values, a 0.1–1.5 V Schottky drop, and the TI reference compensation network (2.2 kΩ in series with 0.33 µF to GND).",validation};
 }
 const referenceV=1.23,frequencyHz=52000,outputVoltageV=referenceV*(1+rTop/rBottom),loadCurrentA=outputVoltageV/rLoad,duty=(outputVoltageV+vf-vin)/(outputVoltageV+vf);
 if(outputVoltageV<=vin||outputVoltageV>40||duty<=0||duty>=0.85)return {state:"blocked",message:"The feedback divider must request an output above VIN and below 40 V with a boost duty below 85%. Choose RFB1/RFB2 for the LM2577 1.23 V reference.",validation};
 const inductorRipplePpA=vin*duty/(l*frequencyHz),inputPowerW=(outputVoltageV+vf)*loadCurrentA,inputCurrentA=inputPowerW/vin,peakSwitchCurrentA=inputCurrentA+inductorRipplePpA/2;
 if(inputCurrentA<=inductorRipplePpA/2)return {state:"blocked",message:"This LM2577 operating point is in discontinuous conduction. The example reports CCM only; increase L1 or the load current and recheck.",validation};
 if(peakSwitchCurrentA>3)return {state:"blocked",message:"Estimated LM2577 switch peak current exceeds its 3 A switch rating. Reduce the load or redesign the power stage.",validation};
 const outputRipplePpV=loadCurrentA*duty/(c*frequencyHz),outputPowerW=outputVoltageV*loadCurrentA,diodeLossW=vf*loadCurrentA;
 return {state:"complete",engine:"TI LM2577-ADJ boost reference CCM average and ripple estimate",message:"Estimates the TI LM2577 5 V-to-adjustable-output reference circuit using its 1.23 V feedback divider, 52 kHz oscillator, CCM inductor balance, and ideal-capacitor discharge ripple. It is not a switching-transient or control-loop stability simulation; switch saturation, ESR, tolerances, thermal behavior, EMC, and hardware qualification remain outside this model.",result:{kind:"boost-converter",device:"LM2577T-ADJ/NOPB",inputVoltageV:vin,feedbackReferenceV:referenceV,feedbackTopResistanceOhm:rTop,feedbackBottomResistanceOhm:rBottom,dutyCyclePercent:duty*100,switchingFrequencyHz:frequencyHz,diodeForwardVoltageV:vf,inductanceH:l,capacitanceF:c,loadResistanceOhm:rLoad,outputVoltageV,loadCurrentA,inputCurrentA,peakSwitchCurrentA,inductorRipplePpA,outputRipplePpV,conductionMode:"CCM",inputPowerW,outputPowerW,diodeLossW,powerBalanceW:inputPowerW-outputPowerW-diodeLossW,controllerHardwareModeled:false},validation};
}
