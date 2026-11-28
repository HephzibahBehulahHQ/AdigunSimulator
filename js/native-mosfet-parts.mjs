import sot23 from "../library/assets/footprints/nexperia.2n7002-215/footprint.json" with { type: "json" };
import sot323 from "../library/assets/footprints/nexperia.bss138bkw-115/footprint.json" with { type: "json" };
import sot363 from "../library/assets/footprints/nexperia.bss138bks-115/footprint.json" with { type: "json" };

const packages = [
  ["2N7002,215", "SOT23", sot23, [[1, 3, 2]]],
  ["BSS138BKW,115", "SOT323", sot323, [[1, 3, 2]]],
  ["BSS138BKS,115", "SOT363", sot363, [[2, 6, 1], [5, 3, 4]]]
];
const terminalPoints = [[12, 50, "left"], [105, 12, "right"], [105, 88, "right"]];

const parts = new Map(packages.map(([orderCode, packageName, footprint, channels]) => {
  const id = footprint.partId;
  const drawingHeight = channels.length === 2 ? 206 : 100;
  const height = channels.length === 2 ? 162 : 100;
  const pinPoints = Object.fromEntries(channels.flatMap((terminals, index) => terminals.map((pin, role) => {
    const [x, y, side] = terminalPoints[role];
    return [String(pin), Object.freeze({ x, y: (y + index * 106) * height / drawingHeight, side })];
  })));
  return [id, Object.freeze({
    id, package: packageName, footprint, channels, pinPoints,
    symbolSize: Object.freeze({ width: 126, height }), drawingHeight,
    category: "Active", type: "Nexperia " + orderCode, prefix: "Q", defaultValue: orderCode,
    pins: Object.freeze(Object.keys(pinPoints)), simulation: null,
    status: "Manufacturer candidate; native schematic",
    views: Object.freeze({ schematic: true, breadboard: false, pcb: true }),
    mappingDiagnostics: Object.freeze({
      breadboard: `Use a documented ${packageName} breakout that preserves each numbered terminal.`,
      pcb: `Clear a location for the ${packageName} footprint on the board and add the part again.`
    })
  })];
}));

export const findNativeMosfet = id => parts.get(id) ?? null;

export function renderNativeMosfet(part) {
  const body = part.channels.map(([gate, drain, source], index) => {
    const suffix = part.channels.length === 2 ? index + 1 : "";
    return `<g transform="translate(0 ${index * 106})">
      <path class="symbol-stroke" d="M12 50H43 M43 27V73 M105 12H68V29H52 M105 88H68V71H52 M52 24V34 M52 45V55 M52 66V76 M52 50H68V71 M89 12V40 M89 62V88 M81 40H97"/>
      <path class="symbol-fill" d="M89 42L81 60H97Z M55 50L62 46V54Z"/>
      <text class="symbol-text" x="16" y="41">G${suffix} (${gate})</text>
      <text class="symbol-text" x="102" y="24">D${suffix} (${drain})</text>
      <text class="symbol-text" x="102" y="79">S${suffix} (${source})</text>
    </g>`;
  }).join("");
  return `<svg class="schematic-symbol" preserveAspectRatio="none" viewBox="0 0 126 ${part.drawingHeight}" role="img" aria-label="${part.type} schematic">${body}</svg>`;
}
