import two from "../library/assets/footprints/samtec.tsw-102-07-t-s/footprint.json" with { type: "json" };
import three from "../library/assets/footprints/samtec.tsw-103-07-t-s/footprint.json" with { type: "json" };
import four from "../library/assets/footprints/samtec.tsw-104-07-t-s/footprint.json" with { type: "json" };

const headers = new Map([two, three, four].map(asset => {
  const pins = Object.freeze(asset.pads.map(pad => pad.number));
  const orderCode = asset.partId.slice("samtec.".length).toUpperCase();
  const footprint = {
    ...asset,
    pads: asset.pads.map(pad => ({
      ...pad, widthMm: asset.padPattern.diameterMm, drillMm: asset.padPattern.drillMm
    }))
  };
  return [asset.partId, Object.freeze({
    id: asset.partId, type: "Samtec " + orderCode, defaultValue: orderCode,
    manufacturer: "Samtec", prefix: "J", category: "Connectors", pins,
    technology: "through-hole", package: asset.package, footprint,
    symbolSize: Object.freeze({ width: 64, height: (pins.length + 1) * 16 }),
    status: "Manufacturer candidate with an educational PCB land pattern",
    views: Object.freeze({ schematic: true, breadboard: false, pcb: true }),
    mappingDiagnostics: Object.freeze({
      breadboard: "Confirm square-post seating depth and continuity, then assign the numbered pins to separate BB400 strips at 2.54 mm pitch.",
      pcb: "Clear a location on the board for the single-row header and add the part again."
    })
  })];
}));

export const findNativeSamtecHeader = id => headers.get(id) ?? null;

export function samtecHeaderPinPoint(pin) {
  return { x: 4, y: Number(pin) * 16, side: "left" };
}

export function renderNativeSamtecHeader(part) {
  const terminals = part.pins.map(pin => {
    const { x, y } = samtecHeaderPinPoint(pin);
    return `<path class="symbol-stroke" data-symbol-pin="${pin}" d="M${x} ${y}H27"/><circle class="symbol-stroke" cx="30" cy="${y}" r="3"/><text class="symbol-text" x="43" y="${y + 3}">${pin}</text>`;
  }).join("");
  const { width, height } = part.symbolSize;
  return `<svg class="schematic-symbol" preserveAspectRatio="none" viewBox="0 0 ${width} ${height}" role="img" aria-label="${part.type} numbered header"><rect class="symbol-stroke" x="20" y="5" width="34" height="${height - 10}" rx="2"/>${terminals}</svg>`;
}
