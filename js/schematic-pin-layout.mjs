import { SCHEMATIC_PRIMITIVES } from "./schematic-primitives.mjs";
const customPinSides = {
  "active.cd4026be-decade": [
    ["VCC", "ENABLE", "INHIBIT", "CLK", "RESET", "GND"],
    ["SEG_A", "SEG_B", "SEG_C", "SEG_D", "SEG_E", "SEG_F", "SEG_G"]
  ],
  "display.sc56-11ewa": [
    ["A", "B", "C", "D", "E", "F", "G"],
    ["K1", "K2"]
  ],
  "active.atmega328p-uart-tx": [
    ["MCU_RESET_N", "GND", "AGND"],
    ["VCC", "AVCC", "TX"]
  ],
  "active.atmega328p-debounce": [
    ["INPUT", "CLK", "RESET_N", "MCU_RESET_N", "GND", "AGND"],
    ["VCC", "AVCC", "Q"]
  ],
  "active.sn74hc74n-ring-pair": [
    ["D1", "D2", "CLK1", "CLK2", "PRE1", "CLR1", "PRE2", "CLR2"],
    ["VCC", "Q1", "Q2", "GND"]
  ],
  "active.sn74hc153n-mux": [
    ["I0", "I1", "I2", "I3", "S0", "S1"],
    ["VCC", "2G", "Y", "1G", "2C0", "2C1", "2C2", "2C3", "GND"]
  ],
  "active.cd4555be-decoder": [
    ["VCC", "2E", "A0", "A1", "1E", "2A", "2B", "GND"],
    ["Y0", "Y1", "Y2", "Y3"]
  ],
  "active.cd4532be-encoder": [
    ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    ["VCC", "EI", "CODE0", "CODE1", "VALID", "GND"]
  ]
};
// Visual anchors for the editor's named electrical terminals.
// Pin order here defines schematic placement only; it does not assert physical package pin numbers.
export function schematicSymbolSize(libraryId) {
  if(libraryId?.startsWith('plc.')&&SCHEMATIC_PRIMITIVES[libraryId]){const {width,height}=SCHEMATIC_PRIMITIVES[libraryId];return {width,height};}
  return libraryId === "active.stm32-timer-ideal" ? { width: 124, height: 130 } : { width: 56, height: 58 };
}
export function schematicGeometry(component) {
  const size = schematicSymbolSize(component?.libraryId), saved = component?.geometry?.schematic;
  return { ...(saved?.mirrorX ? { mirrorX:true } : {}), ...(saved?.mirrorY ? { mirrorY:true } : {}), width: Number.isFinite(saved?.width) && saved.width >= 28 && saved.width <= 240 ? saved.width : size.width, height: Number.isFinite(saved?.height) && saved.height >= 29 && saved.height <= 180 ? saved.height : size.height, rotation: Number.isFinite(saved?.rotation) ? saved.rotation % 360 : 0 };
}
export function schematicPinPoint(component, pins, pin) {
  const base = basePinPoint(component, pins, pin);
  if (!base || !component.geometry?.schematic) return base;
  const [x = 120, y = 120] = component.position?.schematic ?? [];
  const original = schematicSymbolSize(component.libraryId), geometry = schematicGeometry(component);
  const dx = ((base.x - x) * geometry.width / original.width - geometry.width / 2) * (geometry.mirrorX ? -1 : 1);
  const dy = ((base.y - y) * geometry.height / original.height - geometry.height / 2) * (geometry.mirrorY ? -1 : 1);
  const radians = geometry.rotation * Math.PI / 180;
  let baseSide=base.side;
  if(geometry.mirrorX)baseSide=({left:"right",right:"left"})[baseSide]??baseSide;
  if(geometry.mirrorY)baseSide=({top:"bottom",bottom:"top"})[baseSide]??baseSide;
  const sides = ["right", "bottom", "left", "top"], sideIndex = sides.indexOf(baseSide);
  const side = sides[((sideIndex + Math.round(geometry.rotation / 90)) % 4 + 4) % 4];
  return { ...base, side, x: x + geometry.width / 2 + dx * Math.cos(radians) - dy * Math.sin(radians), y: y + geometry.height / 2 + dx * Math.sin(radians) + dy * Math.cos(radians) };
}
function basePinPoint(component, pins, pin) {
  if (!component || !Array.isArray(pins) || !pins.length) return null;
  const index = pins.indexOf(pin);
  if (index < 0) return null;
  const [x = 120, y = 120] = component.position?.schematic ?? [];
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const sides = customPinSides[component.libraryId];
  if (sides) {
    const left = sides[0].includes(pin);
    const sidePins = sides[left ? 0 : 1];
    return { x: x + (left ? 6 : 50), y: y + 11 + (sidePins.indexOf(pin) + 1) * 36 / (sidePins.length + 1), side: left ? "left" : "right" };
  }
  const primitive = SCHEMATIC_PRIMITIVES[component.libraryId];
  if (primitive) {
    const point = primitive.pins[pin];
    const size = schematicSymbolSize(component.libraryId);
    // Preserve the native default footprint of old drawings; users can resize it.
    return point ? { x: x + point[0] * size.width / primitive.width, y: y + point[1] * size.height / primitive.height, side: point[2] } : null;
  }
  if (component.libraryId === "ground.signal") return { x: x + 28, y: y + 6, side: "top" };
  if (component.libraryId === "active.stm32-timer-ideal") {
    const positions = { VCC: [0, 26, "left"], GND: [0, 104, "left"], PA0: [124, 65, "right"] };
    const point = positions[pin];
    return point ? { x: x + point[0], y: y + point[1], side: point[2] } : null;
  }
  if (pins.length === 1) return { x: x + 6, y: y + 29, side: "left" };
  if (pins.length === 2) return { x: x + (index === 0 ? 6 : 50), y: y + 29, side: index === 0 ? "left" : "right" };
  const leftCount = Math.ceil(pins.length / 2);
  const side = index < leftCount ? "left" : "right";
  const sideIndex = side === "left" ? index : index - leftCount;
  const sideCount = side === "left" ? leftCount : pins.length - leftCount;
  return { x: x + (side === "left" ? 6 : 50), y: y + 11 + ((sideIndex + 1) * 36) / (sideCount + 1), side };
}
