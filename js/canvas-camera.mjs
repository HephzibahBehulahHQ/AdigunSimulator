export const CANVAS_WORLD = Object.freeze({ width: 680, height: 300 });
export const CANVAS_ZOOM = Object.freeze({ min: 0.25, max: 8, step: 1.25 });
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

/** One isotropic transform for symbols, pins, wires, footprints and copper. */
export function createCanvasCamera(width, height, zoom = 1, pan = {}) {
  if (![width, height].every((n) => Number.isFinite(n) && n > 0)) return null;
  zoom = clamp(Number.isFinite(zoom) ? zoom : 1, CANVAS_ZOOM.min, CANVAS_ZOOM.max);
  const scale = Math.min(width / CANVAS_WORLD.width, height / CANVAS_WORLD.height) * zoom;
  const margin = Math.min(48, width / 4, height / 4);
  const limitX = (width + CANVAS_WORLD.width * scale) / 2 - margin;
  const limitY = (height + CANVAS_WORLD.height * scale) / 2 - margin;
  const x = clamp(Number.isFinite(pan.x) ? pan.x : 0, -limitX, limitX);
  const y = clamp(Number.isFinite(pan.y) ? pan.y : 0, -limitY, limitY);
  return { width, height, zoom, scale, pan: { x, y }, x: (width - CANVAS_WORLD.width * scale) / 2 + x, y: (height - CANVAS_WORLD.height * scale) / 2 + y };
}

/** Keep the world point under a viewport anchor stationary while changing zoom. */
export function zoomCanvasCamera(camera, zoom, anchor = { x: camera.width / 2, y: camera.height / 2 }) {
  const next = createCanvasCamera(camera.width, camera.height, zoom);
  const ratio = next.scale / camera.scale;
  const x = Number.isFinite(anchor.x) ? anchor.x : camera.width / 2;
  const y = Number.isFinite(anchor.y) ? anchor.y : camera.height / 2;
  return createCanvasCamera(camera.width, camera.height, next.zoom, {
    x: (camera.pan.x + camera.width / 2 - x) * ratio + x - camera.width / 2,
    y: (camera.pan.y + camera.height / 2 - y) * ratio + y - camera.height / 2
  });
}

/** Use the transformed world scene (or its full-size SVG) as the rect. */
export function canvasClientPoint(point, rect) {
  if (!rect || ![rect.left, rect.top, rect.width, rect.height, point?.x, point?.y].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0) return null;
  return [(point.x - rect.left) * CANVAS_WORLD.width / rect.width, (point.y - rect.top) * CANVAS_WORLD.height / rect.height];
}

export function canvasClientDelta(delta, rect) {
  const point = canvasClientPoint(delta, { left: 0, top: 0, width: rect?.width, height: rect?.height });
  return point ? { x: point[0], y: point[1] } : null;
}
