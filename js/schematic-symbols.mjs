import { schematicPinPoint, schematicSymbolSize } from "./schematic-pin-layout.mjs";
import { renderPrimitiveSymbol } from "./schematic-primitive-svg.mjs";
import { SCHEMATIC_PRIMITIVES } from "./schematic-primitives.mjs";
const escape = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" })[c]);
export function renderSchematicSymbol(part, component) {
  if (!part || !Array.isArray(part.pins) || !part.pins.length) return null;
  const id=part.id, primitive=renderPrimitiveSymbol(part,component), size=primitive ? SCHEMATIC_PRIMITIVES[id] : schematicSymbolSize(id); let body="";
  if(primitive) body=primitive;
  else if(id==="active.stm32-timer-ideal") {
    const stubs=part.pins.map(pin=>{const p=schematicPinPoint({libraryId:id,position:{schematic:[0,0]}},part.pins,pin);return p ? `<path class="symbol-stroke" data-symbol-pin="${escape(pin)}" d="M${p.x} ${p.y} H${p.side==="left"?12:112}"/>` : "";}).join("");
    body='<rect class="symbol-stroke controller-symbol-body" x="12" y="2" width="100" height="126" rx="3"/>'+stubs+'<text class="symbol-text controller-symbol-title" x="62" y="55">STM32</text><text class="symbol-text" x="62" y="73">Timer PWM</text><text class="symbol-text" x="62" y="88">ideal model</text>';
  } else {
    const left=Math.ceil(part.pins.length/2), right=part.pins.length-left;
    const stubs=part.pins.map(pin=>{const p=schematicPinPoint({position:{schematic:[0,0]}},part.pins,pin);return '<path class="symbol-stroke" d="M'+p.x+' '+p.y+' L'+(p.side==="left"?15:41)+' '+p.y+'"/>';}).join("");
    const h=Math.min(34,Math.max(18,Math.max(left,right)*7)), top=(58-h)/2, label=escape((part.type??"Part").split(/\s+/).map(word=>word[0]).join("").slice(0,5));
    body='<title>'+escape(part.type)+'</title><path class="symbol-stroke" d="M15 '+top+' H41 V'+(top+h)+' H15 Z"/>'+stubs+'<text class="symbol-text" x="28" y="29">'+label+'</text>';
  }
  return '<svg class="schematic-symbol" preserveAspectRatio="none" viewBox="0 0 '+size.width+' '+size.height+'" role="img" aria-label="'+(primitive?'Schematic symbol for ':'Generic schematic symbol for ')+escape(part.type)+(primitive?'; electrical terminals, not physical package pin numbers':' ; pin placement is editorial')+'">'+body+'</svg>';
}
