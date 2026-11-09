import test from "node:test";
import assert from "node:assert/strict";
import { CANVAS_WORLD, createCanvasCamera, zoomCanvasCamera, canvasClientPoint, canvasClientDelta } from "../js/canvas-camera.mjs";
import { pcbPreviewPointToBoardMm } from "../js/pcb-preview.mjs";

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test("fit uses one scale and centers the same world on wide and tall canvases", () => {
  for (const [width, height] of [[1360, 600], [320, 600], [1200, 300]]) {
    const camera = createCanvasCamera(width, height);
    near(camera.x + CANVAS_WORLD.width * camera.scale / 2, width / 2);
    near(camera.y + CANVAS_WORLD.height * camera.scale / 2, height / 2);
    assert.ok(CANVAS_WORLD.width * camera.scale <= width);
    assert.ok(CANVAS_WORLD.height * camera.scale <= height);
  }
});

test("zoom preserves the world point beneath its anchor, including a panned view", () => {
  for (const anchor of [{ x: 340, y: 150 }, { x: 120, y: 70 }]) {
    const before = createCanvasCamera(680, 300, 1, { x: 30, y: -20 });
    const world = [(anchor.x - before.x) / before.scale, (anchor.y - before.y) / before.scale];
    const after = zoomCanvasCamera(before, 4, anchor);
    near(after.x + world[0] * after.scale, anchor.x);
    near(after.y + world[1] * after.scale, anchor.y);
  }
});

test("zoom and pan limits keep geometry recoverable and reject empty viewport geometry", () => {
  assert.equal(createCanvasCamera(0, 300), null);
  assert.equal(createCanvasCamera(680, Number.NaN), null);
  assert.equal(createCanvasCamera(680, 300, Number.NaN).zoom, 1);
  assert.equal(createCanvasCamera(680, 300, -2).zoom, 0.25);
  assert.equal(createCanvasCamera(680, 300, 90).zoom, 8);
  for (const direction of [-1, 1]) {
    const camera = createCanvasCamera(680, 300, 8, { x: direction * 1e6, y: direction * 1e6 });
    assert.ok(camera.x <= 680 - 48 && camera.x + 680 * camera.scale >= 48);
    assert.ok(camera.y <= 300 - 48 && camera.y + 300 * camera.scale >= 48);
  }
});

test("pointer coordinates and drag deltas invert zoom, pan, viewport fit and page offset", () => {
  const project = { pcbFabrication: { board: { widthMm: 40, heightMm: 24 } } };
  for (const [width, height] of [[305, 460], [680, 300], [1200, 500]]) {
    for (const zoom of [0.25, 1, 1.25, 8]) {
      const camera = createCanvasCamera(width, height, zoom, { x: 23, y: -11 });
      const rect = { left: 100 + camera.x, top: 250 + camera.y, width: 680 * camera.scale, height: 300 * camera.scale };
      const point = canvasClientPoint({ x: rect.left + 340 * camera.scale, y: rect.top + 150 * camera.scale }, rect);
      near(point[0], 340); near(point[1], 150);
      const mm = pcbPreviewPointToBoardMm(project, point);
      near(mm[0], 20); near(mm[1], 12);
      const delta = canvasClientDelta({ x: 16 * camera.scale, y: -9 * camera.scale }, rect);
      near(delta.x, 16); near(delta.y, -9);
    }
  }
  assert.equal(canvasClientPoint({ x: 1, y: 2 }, { left: 0, top: 0, width: 0, height: 300 }), null);
  assert.equal(canvasClientDelta({ x: Number.NaN, y: 2 }, { width: 680, height: 300 }), null);
});
