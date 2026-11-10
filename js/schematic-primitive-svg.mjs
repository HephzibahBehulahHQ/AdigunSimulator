import { SCHEMATIC_PRIMITIVES } from "./schematic-primitives.mjs";
import { renderLadderSymbol } from './ladder-components.mjs';
const path = d => `<path class="symbol-stroke" d="${d}"/>`;
const fill = d => `<path class="symbol-fill" d="${d}"/>`;
const text = (x, y, value) => `<text class="symbol-text" x="${x}" y="${y}">${value}</text>`;
const circle = (x, y, radius) => `<circle class="symbol-stroke" cx="${x}" cy="${y}" r="${radius}"/>`;
export function renderPrimitiveSymbol(part, component) {
  const spec = SCHEMATIC_PRIMITIVES[part.id];
  if (!spec || part.pins.length !== Object.keys(spec.pins).length || part.pins.some(pin => !spec.pins[pin])) return null;
  if(spec.kind==='ladder')return renderLadderSymbol(part.id);
  const lead = (pin, d) => `<path class="symbol-stroke" data-symbol-pin="${pin}" d="M${spec.pins[pin][0]} ${spec.pins[pin][1]} ${d}"/>`;
  const pair = (a, b, left = "H19", right = "H37") => lead(a, left) + lead(b, right);
  const kind = spec.kind, value = component?.value ?? part.defaultValue ?? "";
  let body = "";
  if (kind === "resistor" || kind === "rheostat") {
    body = path("M6 29 H15 L19 23 L24 35 L29 23 L34 35 L39 23 L43 29 H50");
    if (kind === "rheostat") body += path("M16 43 L40 15") + fill("M40 15 L38 22 L34 18 Z");
  } else if (kind === "capacitor" || kind === "polarized-capacitor") {
    body = path("M6 29 H25 M25 19 V39 M31 19 V39 M31 29 H50");
    if (kind === "polarized-capacitor") body += path("M16 17 H22 M19 14 V20");
  } else if (kind === "inductor") body = path("M6 29 H15 C15 18 25 18 25 29 C25 18 35 18 35 29 C35 18 45 18 45 29 H50");
  else if (kind === "ground") body = lead("0", "V22") + path("M17 22 H39 M20 27 H36 M24 32 H32");
  else if (kind === "battery") body = pair("+", "-", "H24", "H33") + path("M24 15 V43 M33 22 V36 M15 17 H20 M17.5 14.5 V19.5");
  else if (["dc-source", "current-source", "ac-source", "pulse-source"].includes(kind)) {
    body = pair("+", "-", "H17", "H39") + path("M17 29 A11 11 0 1 0 39 29 A11 11 0 1 0 17 29");
    if (kind === "dc-source") body += path("M23 25 H29 M26 22 V28 M32 29 H36");
    // Native current-source convention is from minus (right) to plus (left).
    if (kind === "current-source") body += path("M35 29 H21") + fill("M21 29 L26 25 V33 Z");
    if (kind === "ac-source") body += path("M20 29 C23 18 27 18 28 29 C29 40 33 40 36 29");
    if (kind === "pulse-source") body += path("M19 33 H24 V24 H32 V33 H37");
  } else if (["diode", "led", "zener", "schottky"].includes(kind)) {
    body = pair("A", "K") + path("M19 18 V40 L37 29 Z");
    body += path(kind === "zener" ? "M33 17 H37 V41 H41" : kind === "schottky" ? "M33 21 V17 H37 V41 H41 V37" : "M37 17 V41");
    if (kind === "led") body += path("M34 8 L40 2 M37 13 L44 6") + fill("M40 2 L39 6 L36 3 Z M44 6 L40 7 L43 3 Z");
  } else if (kind === "npn" || kind === "pnp") {
    body = circle(29,29,20) + lead("B","H23") + lead("C","H44 L23 24") + lead("E","H44 L23 34") + path("M23 17 V41");
    body += `<g data-polarity="${kind}">${fill(kind === "npn" ? "M41 45 L33 36 L30 42 Z" : "M27 36 L35 38 L32 44 Z")}</g>`;
  } else if (kind === "nmos" || kind === "pmos") {
    body = lead("G","H22") + lead("D","H40 V17 H29") + lead("S","H40 V41 H29") + path("M22 17 V41 M29 16 V23 M29 26 V32 M29 35 V42 M29 29 H40 V41");
    body += `<g data-polarity="${kind}">${fill(kind === "nmos" ? "M29 29 L35 25 V33 Z" : "M38 29 L32 25 V33 Z")}</g>`;
  } else if (kind === "spst" || kind === "pushbutton") {
    const closed = /^(closed|on|pressed|normally-closed)$/i.test(value.trim());
    body = pair("1","2","H17","H39") + path(closed ? "M17 27 H39" : "M17 27 L37 17") + circle(17,29,2) + circle(39,29,2);
    if (kind === "pushbutton") body += path("M28 16 V9 M23 9 H33");
  } else if (kind === "spdt") {
    body = lead("COM","H18") + lead("A","H39") + lead("B","H39") + circle(18,29,2) + circle(39,15,2) + circle(39,43,2) + path(/\(B\)|^B$|discharge/i.test(value) ? "M18 29 L37 43" : "M18 29 L37 15");
  } else if (kind === "transformer") {
    body = lead("PRI1","H18") + lead("PRI2","H18") + lead("SEC1","H46") + lead("SEC2","H46");
    body += path("M18 14 C29 14 29 28 18 28 C29 28 29 42 18 42 C29 42 29 56 18 56 M46 14 C35 14 35 28 46 28 C35 28 35 42 46 42 C35 42 35 56 46 56 M30 12 V58 M34 12 V58");
  } else if (kind === "opamp") {
    body = lead("+","H20") + lead("-","H20") + lead("OUT","H78") + lead("VCC","V28") + lead("VEE","V62") + path("M20 12 V78 L78 45 Z") + text(29,30,"+") + text(29,60,"−");
  } else if (kind === "voltmeter") body = pair("+","-","H14","H42") + circle(28,29,14) + text(28,29,"V");
  else if (["and", "nand", "or", "nor", "xor", "xnor", "not"].includes(kind)) {
    const inverted = ["nand","nor","xnor","not"].includes(kind), curved = ["or","nor","xor","xnor"].includes(kind);
    if (kind === "not") body = path("M22 17 V73 L74 45 Z") + lead("A","H22");
    else {
      body = curved ? path("M20 18 Q39 45 20 72 Q56 74 74 45 Q56 16 20 18 Z") : path("M22 18 H47 C83 18 83 72 47 72 H22 Z");
      body += lead("A",curved ? "H27" : "H22") + lead("B",curved ? "H27" : "H22");
      if (kind === "xor" || kind === "xnor") body += path("M14 18 Q33 45 14 72");
    }
    const curveT = (72 - Math.sqrt(3168)) / 36;
    const top = kind === "not" ? 31 : curved ? 18 - 4 * curveT + 31 * curveT * curveT : 18;
    body += lead("Y",inverted ? "H82" : "H74") + lead("VCC",`V${top}`) + lead("GND",`V${90-top}`);
    if (inverted) body += circle(78,45,4);
  }
  if (!body) return null;
  return `<g data-symbol-kind="${kind}">${body}</g>`;
}
