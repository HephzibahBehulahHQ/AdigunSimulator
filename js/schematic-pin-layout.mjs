// Generic visual pin anchors for the editor's named component pins.
// Pin order here defines schematic placement only; it does not assert physical package pin numbers.
export function schematicSymbolSize(libraryId) {
  return libraryId === "active.stm32-timer-ideal" ? { width: 124, height: 130 } : { width: 56, height: 58 };
}
export function schematicPinPoint(component, pins, pin) {
  if (!component || !Array.isArray(pins) || !pins.length) return null;
  const index = pins.indexOf(pin);
  if (index < 0) return null;
  const [x = 120, y = 120] = component.position?.schematic ?? [];
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (component.libraryId === "active.stm32-timer-ideal") {
    const positions = { VCC: [0, 26, "left"], GND: [0, 104, "left"], TIM1_CH1: [124, 65, "right"] };
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
