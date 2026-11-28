import eeprom2 from "../library/assets/footprints/microchip.24lc02b-i-p/footprint.json" with { type: "json" };
import eeprom32 from "../library/assets/footprints/microchip.24lc32a-i-p/footprint.json" with { type: "json" };
import eeprom64 from "../library/assets/footprints/microchip.24lc64-i-p/footprint.json" with { type: "json" };
import eeprom256 from "../library/assets/footprints/microchip.24fc256-i-p/footprint.json" with { type: "json" };

const patterns = [[eeprom2, "24LC02B-I/P"], [eeprom32, "24LC32A-I/P"], [eeprom64, "24LC64-I/P"], [eeprom256, "24FC256-I/P"]];
const size = Object.freeze({ width: 132, height: 104 });
const pins = Object.freeze(["1", "2", "3", "4", "5", "6", "7", "8"]);
const signalNames = ["A0", "A1", "A2", "VSS", "SDA", "SCL", "WP", "VCC"];

const records = new Map(patterns.map(([footprint, orderCode]) => {
  const id = footprint.partId;
  return [id, Object.freeze({
    id, footprint, technology: "through-hole", package: footprint.package, manufacturer: "Microchip Technology",
    type: "Microchip " + orderCode, defaultValue: orderCode, prefix: "U", category: "Active",
    pins, symbolSize: size, simulation: null,
    nativeBreadboard: orderCode === "24LC02B-I/P",
    noConnectPins: Object.freeze(orderCode.startsWith("24LC02B") ? pins.slice(0, 3) : []),
    status: "Manufacturer candidate with an educational PCB land pattern",
    views: Object.freeze({ schematic: true, breadboard: false, pcb: true }),
    mappingDiagnostics: Object.freeze({
      breadboard: orderCode === "24LC02B-I/P"
        ? "Use a clear four-column BB400 center-gap position for the eight numbered PDIP leads."
        : "Confirm the formed leads seat across the 7.62 mm BB400 center gap and check contact continuity for all eight pins before assigning holes.",
      pcb: "Clear a location for the DIP-8 pattern on the board and add the part again."
    })
  })];
}));

export const findNativeEeprom = id => records.get(id) ?? null;

export function eepromPinPoint(pin) {
  const index = pins.indexOf(pin);
  if (index < 0) return null;
  const left = index < 4;
  return { x: left ? 4 : 128, y: 22 + (left ? index : 7 - index) * 20, side: left ? "left" : "right" };
}

export function renderNativeEeprom(part) {
  const labels = pins.map((pin, index) => {
    const { x, y, side } = eepromPinPoint(pin);
    const inner = side === "left" ? 28 : 104;
    const nc = part.noConnectPins.includes(pin);
    const label = pin + " " + signalNames[index] + (nc ? " NC" : "");
    return `<path class="symbol-stroke" d="M${x} ${y}H${inner}"/><text class="symbol-text" x="${side === "left" ? 48 : 85}" y="${y}">${label}</text>`;
  }).join("");
  return `<svg class="schematic-symbol" preserveAspectRatio="none" viewBox="0 0 132 104" role="img" aria-label="${part.type} schematic"><path class="symbol-stroke" d="M28 10H57Q66 25 75 10H104V94H28Z"/>${labels}</svg>`;
}
