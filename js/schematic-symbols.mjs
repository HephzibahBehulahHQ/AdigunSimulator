import { schematicPinPoint } from "./schematic-pin-layout.mjs";
const escape = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" })[c]);
export function renderSchematicSymbol(part) {
  if (!part || !Array.isArray(part.pins) || !part.pins.length) return null;
  const id=part.id; let body="";
  if(id==="passive.resistor") body='<path class="symbol-stroke" d="M6 29 H15 L19 23 L24 35 L29 23 L34 35 L39 23 L43 29 H50"/>';
  else if(id==="passive.capacitor") body='<path class="symbol-stroke" d="M6 29 H25 M25 19 V39 M31 19 V39 M31 29 H50"/>';
  else if(id==="passive.inductor") body='<path class="symbol-stroke" d="M6 29 H15 C15 18 25 18 25 29 C25 18 35 18 35 29 C35 18 45 18 45 29 H50"/>';
  else if(id==="power.dc-source") body='<path class="symbol-stroke" d="M6 29 H17 M39 29 H50 M17 29 A11 11 0 1 0 39 29 A11 11 0 1 0 17 29 M23 25 H29 M26 22 V28 M32 29 H36"/>';
  else if(id==="ground.signal") body='<path class="symbol-stroke" d="M28 6 V22 M17 22 H39 M20 27 H36 M24 32 H32"/>';
  else if(id==="diode.led-red" || id==="diode.rectifier-1n4007") { const arrows=id==="diode.led-red"?'<path class="symbol-stroke" d="M34 8 L40 2 M37 13 L44 6"/><path class="symbol-fill" d="M40 2 L39 6 L36 3 Z M44 6 L40 7 L43 3 Z"/>':""; body='<path class="symbol-stroke" d="M6 29 H19 M37 29 H50 M19 18 V40 L37 29 Z M37 17 V41"/>'+arrows; }
  else {
    const left=Math.ceil(part.pins.length/2), right=part.pins.length-left;
    const stubs=part.pins.map(pin=>{const p=schematicPinPoint({position:{schematic:[0,0]}},part.pins,pin);return '<path class="symbol-stroke" d="M'+p.x+' '+p.y+' L'+(p.side==="left"?15:41)+' '+p.y+'"/>';}).join("");
    const h=Math.min(34,Math.max(18,Math.max(left,right)*7)), top=(58-h)/2, label=escape((part.type??"Part").split(/\s+/).slice(0,2).join(" "));
    body='<path class="symbol-stroke" d="M15 '+top+' H41 V'+(top+h)+' H15 Z"/>'+stubs+'<text class="symbol-text" x="28" y="29">'+label+'</text>';
  }
  return '<svg class="schematic-symbol" viewBox="0 0 56 58" role="img" aria-label="Generic schematic symbol for '+escape(part.type)+'; pin placement is editorial">'+body+'</svg>';
}
