const parseV=value=>{const m=String(value??"").match(/^\s*(-?[\d.]+)\s*V\s*$/i);return m?Number(m[1]):NaN;};
const parseOhms=value=>{const m=String(value??"").trim().match(/^([\d.]+)\s*(MΩ|kΩ|Ω)?$/);if(!m)return NaN;return Number(m[1])*(m[2]==="MΩ"?1e6:m[2]==="kΩ"?1e3:1);};
const blocked=message=>({state:"blocked",engine:"Bounded DC series ammeter model",message,result:null});
export function analyzeDcAmmeter(project){
  const meter=project?.instrument;
  if(meter?.type!=="dc-ammeter")return blocked("Configure a DC ammeter before running this measurement.");
  if(!Array.isArray(meter.terminals)||meter.terminals.length!==2||meter.terminals[0]===meter.terminals[1])return blocked("The ammeter needs two distinct series insertion terminals.");
  const nodes=new Map();for(const net of project.nets??[])for(const endpoint of net.endpoints??[])nodes.set(endpoint,net.id);
  const source=project.components.find(c=>c.reference===(meter.sourceReference??"V1")&&c.libraryId==="power.dc-source"),top=project.components.find(c=>c.reference==="R1"),bottom=project.components.find(c=>c.reference==="R2");
  if(!source||!top||!bottom)return blocked("The supported ammeter example requires a DC source and two series divider resistors.");
  const sourceTerminal=source.instanceId+":+",loadTerminal=top.instanceId+":1";
  const forward=meter.terminals[0]===sourceTerminal&&meter.terminals[1]===loadTerminal,reverse=meter.terminals[0]===loadTerminal&&meter.terminals[1]===sourceTerminal;
  if(!forward&&!reverse)return blocked("Place the meter in series between source positive and R1 terminal 1; do not place it across a component.");
  if(nodes.get(sourceTerminal)!==nodes.get(loadTerminal))return blocked("The selected series insertion points must belong to the same connected source net.");
  const voltage=parseV(source.value),r1=parseOhms(top.value),r2=parseOhms(bottom.value),burden=Number(meter.burdenResistanceOhms??0.1);
  if(!Number.isFinite(voltage)||!Number.isFinite(r1)||!Number.isFinite(r2)||r1<=0||r2<=0||!Number.isFinite(burden)||burden<0)return blocked("Source, resistor and burden values must be valid; burden cannot be negative.");
  const current=voltage/(r1+r2+burden)*(reverse?-1:1),ideal=voltage/(r1+r2);
  return {state:"complete",engine:"Bounded DC series ammeter with burden resistance",message:"Current is calculated for a resistive DC divider with the ammeter burden inserted in series.",result:{kind:"dc-ammeter",measuredCurrentA:current,unit:"A",displayMilliAmps:current*1000,idealReferenceCurrentA:ideal,burdenResistanceOhms:burden,burdenVoltageV:Math.abs(current)*burden,seriesPlacementVerified:true,polarity:current<0?"reversed":"normal"}};
}
