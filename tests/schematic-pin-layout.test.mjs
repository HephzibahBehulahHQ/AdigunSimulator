import test from "node:test";
import assert from "node:assert/strict";
import { schematicPinPoint, schematicSymbolSize } from "../js/schematic-pin-layout.mjs";

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

// Native pin names remain unchanged while the controller gets enough room for legible labels.
test("STM32 timer block anchors match its larger symbol without changing net endpoints", () => {
  const timer = { libraryId: "active.stm32-timer-ideal", position: { schematic: [175,60] } };
  const pins = ["VCC", "GND", "PA0"];
  assert.deepEqual(schematicSymbolSize(timer.libraryId), { width:124, height:130 });
  assert.deepEqual(schematicPinPoint(timer,pins,"VCC"), {x:175,y:86,side:"left"});
  assert.deepEqual(schematicPinPoint(timer,pins,"GND"), {x:175,y:164,side:"left"});
  assert.deepEqual(schematicPinPoint(timer,pins,"PA0"), {x:299,y:125,side:"right"});
  assert.equal(schematicPinPoint(timer,pins,"TIM1_CH1"),null);
});
