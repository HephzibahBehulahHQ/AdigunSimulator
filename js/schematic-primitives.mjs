import { LOGIC_GATES } from "./logic-gates.mjs";
import { LADDER_MODELS, ladderSymbolSpec } from "./ladder-components.mjs";

// Drawing coordinates are shared with the wire router. Native terminal names never
// change when a drawing is rotated/resized. Package and breadboard maps are separate.
const primitives = {};
function define(ids, kind, pins, width = 56, height = 58) {
  for (const id of ids) primitives[id] = Object.freeze({ kind, pins: Object.freeze(pins), width, height });
}
const two = (a, b) => ({ [a]: [6, 29, "left"], [b]: [50, 29, "right"] });
define(["passive.resistor", "passive.rs485-termination", "passive.can-termination"], "resistor", two("1", "2"));
define(["passive.capacitor"], "capacitor", two("1", "2"));
define(["passive.electrolytic-capacitor", "passive.supercapacitor"], "polarized-capacitor", two("+", "-"));
define(["passive.inductor"], "inductor", two("1", "2"));
define(["passive.potentiometer"], "rheostat", two("1", "2"));
define(["power.dc-source", "power.usb-source"], "dc-source", two("+", "-"));
define(["power.rechargeable-battery"], "battery", two("+", "-"));
define(["power.dc-current-source"], "current-source", two("+", "-"));
define(["power.ac-source"], "ac-source", two("+", "-"));
define(["power.pwm-source"], "pulse-source", two("+", "-"));
define(["ground.signal"], "ground", { "0": [28, 6, "top"] });
define(["diode.led-red", "diode.led-green"], "led", two("A", "K"));
define(["diode.rectifier-1n4007", "diode.shockley-generic"], "diode", two("A", "K"));
define(["diode.schottky", "diode.schottky-1n5822g"], "schottky", two("A", "K"));
// Zener's native list is K,A; the drawing explicitly maps A left / K right.
define(["diode.zener-ideal"], "zener", two("A", "K"));
define(["active.npn-ebers-moll-generic", "active.npn-small-signal"], "npn", { B: [6, 29, "left"], C: [50, 11, "right"], E: [50, 47, "right"] });
define(["active.pnp-ebers-moll-generic"], "pnp", { B: [6, 29, "left"], C: [50, 11, "right"], E: [50, 47, "right"] });
define(["active.nmos-switch"], "nmos", { G: [6, 29, "left"], D: [50, 11, "right"], S: [50, 47, "right"] });
define(["active.pmos-high-side-ideal"], "pmos", { G: [6, 29, "left"], D: [50, 11, "right"], S: [50, 47, "right"] });
define(["input.pushbutton"], "pushbutton", two("1", "2"));
define(["input.spdt-switch"], "spdt", { COM: [6, 29, "left"], A: [50, 15, "right"], B: [50, 43, "right"] });
define(["passive.transformer-ideal"], "transformer", { PRI1: [6, 14, "left"], PRI2: [6, 56, "left"], SEC1: [58, 14, "right"], SEC2: [58, 56, "right"] }, 64, 70);
define(["active.opamp-ideal"], "opamp", { "+": [6, 30, "left"], "-": [6, 60, "left"], OUT: [90, 45, "right"], VCC: [48, 6, "top"], VEE: [48, 84, "bottom"] }, 96, 90);
define(["instrument.voltmeter"], "voltmeter", two("+", "-"));
for (const [id, gate] of Object.entries(LOGIC_GATES)) define([id], gate.operation, { A: [6, gate.inputs.length === 1 ? 45 : 31, "left"], ...(gate.inputs.length === 2 ? { B: [6, 59, "left"] } : {}), Y: [90, 45, "right"], VCC: [48, 6, "top"], GND: [48, 84, "bottom"] }, 96, 90);
for(const id of Object.keys(LADDER_MODELS))primitives[id]=Object.freeze(ladderSymbolSpec(id));
export const SCHEMATIC_PRIMITIVES = Object.freeze(primitives);
