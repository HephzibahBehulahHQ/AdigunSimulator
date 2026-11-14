import { breadboardHolePoint, normalizeBreadboardHole } from "./breadboard-topology.mjs";

const HEADER_PINS = 15;
const PA0_HEADER_PIN = 12;
const THREE_VOLT_HEADER_PIN = 14;
const GROUND_HEADER_PIN = 2;
const PIXELS_PER_MM = (572 / 29) / 2.54;

function holeColumn(hole) {
  const match = /^I(\d{1,2})$/.exec(normalizeBreadboardHole(hole) ?? "");
  return match ? Number(match[1]) : null;
}

export function renderNucleoG031K8Breadboard(project, component) {
  if (component?.libraryId !== "active.stm32-timer-ideal") return "";
  const holes = project?.breadboard?.pinHoles ?? {};
  const pa0 = holeColumn(holes[`${component.instanceId}:PA0`]);
  const vcc = holeColumn(holes[`${component.instanceId}:VCC`]);
  const gnd = holeColumn(holes[`${component.instanceId}:GND`]);
  if (!pa0 || !vcc || !gnd) return "";

  const firstHeaderColumn = pa0 - PA0_HEADER_PIN + 1;
  if (firstHeaderColumn < 1 || firstHeaderColumn + HEADER_PINS - 1 > 30
    || vcc !== firstHeaderColumn + THREE_VOLT_HEADER_PIN - 1
    || gnd !== firstHeaderColumn + GROUND_HEADER_PIN - 1) return "";

  const cn3Y = breadboardHolePoint(`E${firstHeaderColumn}`).y;
  const cn4Y = breadboardHolePoint(`I${firstHeaderColumn}`).y;
  const firstX = breadboardHolePoint(`I${firstHeaderColumn}`).x;
  const lastX = breadboardHolePoint(`I${firstHeaderColumn + HEADER_PINS - 1}`).x;
  const boardWidth = 50.3 * PIXELS_PER_MM;
  // Breadboard row spacing is compressed in the current canvas projection, so keep the
  // board outline illustrative and align its two connector rows to the actual mapped holes.
  const boardHeight = 18.54 * (10 / 2.54);
  const x = (firstX + lastX) / 2 - boardWidth / 2;
  const y = (cn3Y + cn4Y) / 2 - boardHeight / 2;
  const pads = Array.from({ length: HEADER_PINS }, (_, index) => {
    const px = breadboardHolePoint(`I${firstHeaderColumn + index + 1}`).x;
    const number = index + 1;
    const cn3 = `<circle cx="${px}" cy="${cn3Y}" r="3.4" fill="#d6aa5a" stroke="#654b23" stroke-width="1"/>`;
    const cn4 = `<circle cx="${px}" cy="${cn4Y}" r="3.4" fill="#d6aa5a" stroke="#654b23" stroke-width="1"/>`;
    const cn4Label = number === PA0_HEADER_PIN ? "A0 / PA0" : number === THREE_VOLT_HEADER_PIN ? "+3V3" : number === GROUND_HEADER_PIN ? "GND" : "";
    const label = cn4Label ? `<title>CN4 pin ${number}: ${cn4Label}</title>` : "";
    return `${cn3}${cn4}${label}`;
  }).join("");

  return `<g class="nucleo-g031k8-board" role="img" aria-label="Illustrative ST NUCLEO-G031K8 development board, MB1455. The board drawing is not a mechanical model. Its mapped CN4 pads are pin 2 GND, pin 12 A0 PA0, and pin 14 3V3; other header pads are decorative.">
    <rect x="${x}" y="${y}" width="${boardWidth}" height="${boardHeight}" rx="8" fill="#16714f" stroke="#0b3629" stroke-width="3"/>
    <path d="M${x + 10} ${y + 14} H${x + boardWidth - 10} M${x + 10} ${y + boardHeight - 14} H${x + boardWidth - 10}" stroke="#77a98d" stroke-width="1.5" opacity=".75"/>
    <rect x="${x + 18}" y="${y + 27}" width="67" height="${boardHeight - 54}" rx="5" fill="#0e3f32" stroke="#9db6a8" stroke-width="1.2"/>
    <text x="${x + 51}" y="${y + boardHeight / 2 - 4}" text-anchor="middle" fill="#edf5ef" font-size="8" font-family="sans-serif">ST-LINK</text>
    <text x="${x + 51}" y="${y + boardHeight / 2 + 8}" text-anchor="middle" fill="#edf5ef" font-size="7" font-family="sans-serif">V2-1</text>
    <rect x="${x + 139}" y="${y + 34}" width="105" height="${boardHeight - 68}" rx="4" fill="#20272a" stroke="#adb7b5" stroke-width="1.3"/>
    <text x="${x + 191.5}" y="${y + boardHeight / 2 - 2}" text-anchor="middle" fill="#f2f2ed" font-size="7.2" font-family="sans-serif">STM32G031K8T6</text>
    <text x="${x + boardWidth - 16}" y="${y + boardHeight / 2 - 8}" text-anchor="end" fill="#f4f4e8" font-size="9" font-weight="700" font-family="sans-serif">NUCLEO-G031K8</text>
    <text x="${x + boardWidth - 16}" y="${y + boardHeight / 2 + 7}" text-anchor="end" fill="#d9e6dd" font-size="7" font-family="sans-serif">MB1455 · Arduino Nano headers</text>
    <rect x="${firstX - 4}" y="${cn3Y - 6}" width="${lastX - firstX + 8}" height="12" rx="4" fill="#18251f" stroke="#b6c9be" stroke-width="1"/>
    <rect x="${firstX - 4}" y="${cn4Y - 6}" width="${lastX - firstX + 8}" height="12" rx="4" fill="#18251f" stroke="#b6c9be" stroke-width="1"/>
    ${pads}
    <text x="${firstX - 7}" y="${cn3Y - 11}" text-anchor="start" fill="#f2f5f0" font-size="7" font-family="sans-serif">CN3</text>
    <text x="${firstX - 7}" y="${cn4Y + 20}" text-anchor="start" fill="#f2f5f0" font-size="7" font-family="sans-serif">CN4</text>
    <text x="${breadboardHolePoint(`I${gnd}`).x}" y="${cn4Y + 15}" text-anchor="middle" fill="#fff5d8" font-size="5.5" font-family="sans-serif">GND</text>
    <text x="${breadboardHolePoint(`I${pa0}`).x}" y="${cn4Y + 15}" text-anchor="middle" fill="#fff5d8" font-size="5.5" font-family="sans-serif">A0</text>
    <text x="${breadboardHolePoint(`I${vcc}`).x}" y="${cn4Y + 15}" text-anchor="middle" fill="#fff5d8" font-size="5.5" font-family="sans-serif">3V3</text>
  </g>`;
}
