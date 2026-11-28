const packages = [
  ["BCP51-10,135", "PNP"], ["BCP51,115", "PNP"], ["BCP51-16,115", "PNP"],
  ["BCP55-10,115", "NPN"], ["BCP55,115", "NPN"], ["BCP55-16,115", "NPN"],
  ["BCP56-10,115", "NPN"], ["BCP56,115", "NPN"], ["BCP56-16,115", "NPN"]
];
const bcpPins = Object.freeze({ 1: [8, 45, "left"], 2: [108, 14, "right"], 3: [108, 76, "right"], 4: [108, 36, "right"] });
const definitions = new Map(packages.map(([orderCode, polarity]) => {
  const id = "nexperia." + orderCode.toLowerCase().replace(",", "-");
  return [id, Object.freeze({
    id, polarity, package: "SOT223", category: "Active", type: "Nexperia " + orderCode, prefix: "Q", defaultValue: orderCode,
    pins: Object.freeze(Object.keys(bcpPins)), simulation: null,
    status: "Manufacturer candidate; native schematic",
    views: Object.freeze({ schematic: true, breadboard: false, pcb: true }),
    mappingDiagnostics: Object.freeze({
      breadboard: "Use a Proto Advantage PA0174C SOT223-4 to DIP-4 adapter. Preserve base (1), collector (2 and 4), and emitter (3). Confirm top-side orientation before wiring.",
      pcb: "The SOT223 copper land asset is available. There is no clear position for the native footprint on this board. Free board space and add the part again."
    })
  })];
}));

const bcxOrders = [
  "BCX51,115", "BCX51-10,115", "BCX51-16,115",
  "BCX53,115", "BCX53-10,115", "BCX53-16,115",
  "BCX56-10-QX", "BCX56-16-QX", "BCX56-QX",
  "BCX51-10-QX", "BCX51-16-QX", "BCX51-QX"
];
const bcxPins = Object.freeze({ 1: bcpPins[3], 2: bcpPins[2], 3: bcpPins[1] });
const bcxDefinitions = new Map(bcxOrders.map(orderCode => {
  const id = "nexperia." + orderCode.toLowerCase().replace(",", "-");
  return [id, Object.freeze({
    id, polarity: orderCode.startsWith("BCX56") ? "NPN" : "PNP",
    category: "Active", type: "Nexperia " + orderCode, prefix: "Q", defaultValue: orderCode,
    pins: Object.freeze(Object.keys(bcxPins)), simulation: null, package: "SOT89",
    status: "Manufacturer candidate; native schematic",
    views: Object.freeze({ schematic: true, breadboard: false, pcb: true }),
    mappingDiagnostics: Object.freeze({
      breadboard: "Evaluate the Proto Advantage PA0084 SOT89-to-DIP adapter with 0.45 mm machine pins. Confirm the adapter pinout by continuity before assigning breadboard holes for emitter (1), collector (2), and base (3).",
      pcb: "Free a clear location for the SOT89 footprint on the board and add the part again."
    })
  })];
}));

export const findBcpPart = (id) => definitions.get(id) ?? null;
export const findNativeBipolar = id => findBcpPart(id) ?? bcxDefinitions.get(id) ?? null;
export const bipolarSchematicSize = Object.freeze({ width: 116, height: 90 });
export const bipolarSchematicPin = (part, pin) => (part.package === "SOT89" ? bcxPins : bcpPins)[pin] ?? null;

export function renderNativeBipolarSchematic(part) {
  const tab = part.package === "SOT223";
  const arrow = part.polarity === "PNP" ? "M64 64 L75 64 L71 72Z" : "M83 72 L72 72 L76 64Z";
  return `<svg class="schematic-symbol" preserveAspectRatio="none" viewBox="0 0 116 90" role="img" aria-label="${part.type} schematic">
    <path class="symbol-stroke" d="M8 45H49 M49 24V66 M49 57L91 76H108 M49 33L91 14H108${tab ? " M97 14V36H108" : ""}"/>
    ${tab ? '<circle class="symbol-fill" cx="97" cy="14" r="1.5"/>' : ""}
    <path class="symbol-fill" d="${arrow}"/>
    <text class="symbol-text" x="12" y="36">B (${tab ? 1 : 3})</text>
    <text class="symbol-text" x="99" y="7">C (2)</text>
    <text class="symbol-text" x="99" y="68">E (${tab ? 3 : 1})</text>
    ${tab ? '<text class="symbol-text" x="99" y="28">C (4)</text>' : ""}
  </svg>`;
}
