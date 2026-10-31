const parseV=value=>{const m=String(value??"").match(/^\s*(-?[\d.]+)\s*V\s*$/i);return m?Number(m[1]):NaN;};
const parseOhms=value=>{const m=String(value??"").trim().match(/^([\d.]+)\s*(MΩ|kΩ|Ω)?$/);if(!m)return NaN;const scale=m[2]==="MΩ"?1e6:m[2]==="kΩ"?1e3:1;return Number(m[1])*scale;};
function blocked(message){return {state:"blocked",engine:"Bounded DC divider voltmeter model",message,result:null};}
export function analyzeDcVoltmeter(project){
  const meter=project?.instrument;
  if(meter?.type!=="dc-voltmeter")return blocked("Configure a DC voltmeter before running this measurement.");
  if(!meter.positiveNet||!meter.negativeNet||meter.positiveNet===meter.negativeNet)return blocked("Voltmeter leads must connect to two distinct, declared nets.");
  const netIds=new Set((project.nets??[]).map(n=>n.id));if(!netIds.has(meter.positiveNet)||!netIds.has(meter.negativeNet))return blocked("One or both voltmeter leads refer to an unknown net.");
  const nodes=new Map();for(const net of project.nets??[])for(const endpoint of net.endpoints??[])nodes.set(endpoint,net.id);
  const source=project.components.find(c=>c.reference===(meter.sourceReference??"V1")&&c.libraryId==="power.dc-source");
  const ground=project.components.find(c=>c.reference==="GND"||c.libraryId==="ground.signal");
  if(!source||!ground)return blocked("The supported DC voltmeter example requires one DC source and a ground reference.");
  const highNet=nodes.get(source.instanceId+":+"),groundNet=nodes.get(source.instanceId+":-");if(!highNet||!groundNet)return blocked("The source positive and reference terminals must be connected.");
  const resistorBetween=(a,b)=>project.components.find(c=>c.libraryId==="passive.resistor"&&((nodes.get(c.instanceId+":1")===a&&nodes.get(c.instanceId+":2")===b)||(nodes.get(c.instanceId+":1")===b&&nodes.get(c.instanceId+":2")===a)));
  const top=project.components.find(c=>c.reference==="R1"),bottom=project.components.find(c=>c.reference==="R2"),outputNet=project.nets.find(n=>n.id==="VOUT")?.id;
  if(!outputNet||resistorBetween(highNet,outputNet)?.instanceId!==top?.instanceId||resistorBetween(outputNet,groundNet)?.instanceId!==bottom?.instanceId)return blocked("The supported topology requires R1 from source to VOUT and R2 from VOUT to ground.");
  let polarity=1;if(meter.positiveNet===outputNet&&meter.negativeNet===groundNet)polarity=1;else if(meter.positiveNet===groundNet&&meter.negativeNet===outputNet)polarity=-1;else return blocked("Place the voltmeter across VOUT and GND; this example does not support other measurement points.");
  const sourceV=parseV(source.value),rTop=parseOhms(top.value),rBottom=parseOhms(bottom.value),rMeter=Number(meter.inputResistanceOhms??10000000);
  if(!Number.isFinite(sourceV)||!Number.isFinite(rTop)||!Number.isFinite(rBottom)||rTop<=0||rBottom<=0||!Number.isFinite(rMeter)||rMeter<=0)return blocked("Source voltage, divider resistances and meter input resistance must be valid positive values.");
  const loadedBottom=1/(1/rBottom+1/rMeter),unloaded=sourceV*rBottom/(rTop+rBottom),reading=polarity*sourceV*loadedBottom/(rTop+loadedBottom);
  return {state:"complete",engine:"Bounded DC voltmeter with finite input resistance",message:"DC measurement across VOUT and GND; the meter loads the divider according to its declared input resistance.",result:{kind:"dc-voltmeter",measuredVoltageV:reading,unit:"V",positiveLeadNet:meter.positiveNet,negativeLeadNet:meter.negativeNet,polarity:polarity>0?"normal":"reversed",inputResistanceOhms:rMeter,unloadedReferenceVoltageV:unloaded,loadingErrorV:Math.abs(unloaded-reading),loadingModeled:true}};
}
