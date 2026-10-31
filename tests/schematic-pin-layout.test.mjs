import test from "node:test";
import assert from "node:assert/strict";
import { schematicPinPoint } from "../js/schematic-pin-layout.mjs";

const component = { position: { schematic: [100, 80] } };

test("two-pin schematic terminals anchor to opposite component edges", () => {
  assert.deepEqual(schematicPinPoint(component, ["A", "K"], "A"), { x: 106, y: 109, side: "left" });
  assert.deepEqual(schematicPinPoint(component, ["A", "K"], "K"), { x: 150, y: 109, side: "right" });
});

test("multi-pin terminals are split into stable, ordered left and right banks", () => {
  const pins = ["VCC", "IN1", "IN2", "GND", "OUT"];
  assert.deepEqual(schematicPinPoint(component, pins, "VCC"), { x: 106, y: 100, side: "left" });
  assert.deepEqual(schematicPinPoint(component, pins, "GND"), { x: 150, y: 103, side: "right" });
  assert.deepEqual(schematicPinPoint(component, pins, "OUT"), { x: 150, y: 115, side: "right" });
});

test("unknown pins and malformed component positions do not produce invented anchors", () => {
  assert.equal(schematicPinPoint(component, ["A", "K"], "NC"), null);
  assert.equal(schematicPinPoint({ position: { schematic: ["x", 4] } }, ["A"], "A"), null);
});
