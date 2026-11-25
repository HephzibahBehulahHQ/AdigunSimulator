const packages = [
  ["BCP51-10,135", "PNP"], ["BCP51,115", "PNP"], ["BCP51-16,115", "PNP"],
  ["BCP55-10,115", "NPN"], ["BCP55,115", "NPN"], ["BCP55-16,115", "NPN"],
  ["BCP56-10,115", "NPN"], ["BCP56,115", "NPN"], ["BCP56-16,115", "NPN"]
];
const bcpPins = Object.freeze({ 1: [8, 45, "left"], 2: [108, 14, "right"], 3: [108, 76, "right"], 4: [108, 36, "right"] });
const definitions = new Map(packages.map(([orderCode, polarity]) => {
  const id = "nexperia." + orderCode.toLowerCase().replace(",", "-");
  return [id, Object.freeze({
    id, polarity, category: "Active", type: "Nexperia " + orderCode, prefix: "Q", defaultValue: orderCode,
    pins: Object.freeze(Object.keys(bcpPins)), simulation: null,
    status: "Manufacturer candidate; native schematic",
    views: Object.freeze({ schematic: true, breadboard: false, pcb: false }),
    mappingDiagnostics: Object.freeze({
      breadboard: "Use a documented SOT223 breakout that preserves base (1), collector (2 and 4), and emitter (3).",
      pcb: "The SOT223 copper land asset is available. Native board placement and collector-net mapping are required."
    })
  })];
}));

export const findBcpPart = (id) => definitions.get(id) ?? null;
export const bcpSchematicSize = Object.freeze({ width: 116, height: 90 });
export const bcpSchematicPin = (pin) => bcpPins[pin] ?? null;

export function renderBcpSchematic(part) {
  const arrow = part.polarity === "PNP" ? "M64 64 L75 64 L71 72Z" : "M83 72 L72 72 L76 64Z";
  return `<svg class="schematic-symbol" preserveAspectRatio="none" viewBox="0 0 116 90" role="img" aria-label="${part.type} schematic">
    <path class="symbol-stroke" d="M8 45H49 M49 24V66 M49 57L91 76H108 M49 33L91 14H108 M97 14V36H108"/>
    <circle class="symbol-fill" cx="97" cy="14" r="1.5"/>
    <path class="symbol-fill" d="${arrow}"/>
    <text class="symbol-text" x="12" y="36">B (1)</text>
    <text class="symbol-text" x="99" y="7">C (2)</text>
    <text class="symbol-text" x="99" y="68">E (3)</text>
    <text class="symbol-text" x="99" y="28">C (4)</text>
  </svg>`;
}
