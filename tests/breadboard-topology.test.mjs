import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createProject, findLibraryPart, parseProject, serializeProject } from "../js/core.mjs";
import { BREADBOARD_MODEL, breadboardConnectionGroup, breadboardHoleIds, breadboardHolePoint, normalizeBreadboardHole, validateBreadboardTopology } from "../js/breadboard-topology.mjs";

const getPartPins = libraryId => findLibraryPart(libraryId)?.pins ?? [];
const readExample = async file => JSON.parse(await readFile(new URL("../examples/" + file, import.meta.url)));

test("generic 400-point board models terminal strips, center trench, split rails, and hole coordinates", () => {
  assert.equal(BREADBOARD_MODEL.columns, 30);
  assert.equal(breadboardHoleIds().length, 420);
  assert.equal(new Set(breadboardHoleIds()).size, 420);
  assert.equal(breadboardConnectionGroup("A5"), breadboardConnectionGroup("E5"));
  assert.notEqual(breadboardConnectionGroup("A5"), breadboardConnectionGroup("F5"));
  assert.equal(breadboardConnectionGroup("TP1"), breadboardConnectionGroup("TP15"));
  assert.notEqual(breadboardConnectionGroup("TP15"), breadboardConnectionGroup("TP16"));
  assert.notEqual(breadboardConnectionGroup("TP1"), breadboardConnectionGroup("TM1"));
  assert.equal(normalizeBreadboardHole("j30"), "J30");
  assert.equal(normalizeBreadboardHole("A31"), null);
  assert.deepEqual(breadboardHolePoint("A1"), {x:54,y:95});
  assert.equal(breadboardHolePoint("BM30").x > breadboardHolePoint("BM1").x, true);
});

test("starter LED project has a physically connected hole and jumper mapping for each canonical net", async () => {
  const project = await readExample("001-led-current-limiter.adigun.json");
  const result = validateBreadboardTopology(project, {getPartPins});
  assert.equal(result.state, "complete");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.nets.map(net => net.connected), [true,true,true]);
  assert.equal(result.mappedPinCount, 7);
});

test("breadboard topology catches a physical short between separate schematic nets", async () => {
  const project = await readExample("001-led-current-limiter.adigun.json");
  project.breadboard.jumpers[1] = {from:"A15",to:"TP15"};
  const result = validateBreadboardTopology(project, {getPartPins});
  assert.equal(result.state, "blocked");
  assert.ok(result.errors.some(issue => issue.code === "BREADBOARD_SHORT"));
});

test("breadboard topology catches a split net and duplicate pin-hole assignments", async () => {
  const split = await readExample("001-led-current-limiter.adigun.json");
  split.breadboard.jumpers = split.breadboard.jumpers.slice(1);
  const splitResult = validateBreadboardTopology(split, {getPartPins});
  assert.equal(splitResult.state, "incomplete");
  assert.ok(splitResult.warnings.some(issue => issue.code === "BREADBOARD_NET_SPLIT"));
  const duplicate = await readExample("001-led-current-limiter.adigun.json");
  duplicate.breadboard.pinHoles["source-1:+"] = "A5";
  const duplicateResult = validateBreadboardTopology(duplicate, {getPartPins});
  assert.equal(duplicateResult.state, "blocked");
  assert.ok(duplicateResult.errors.some(issue => issue.code === "BREADBOARD_HOLE_OCCUPIED"));
});

test("checked-in STM32 PWM fixture carries real-hole placements and validates without changing its electrical nets", async () => {
  const project = await readExample("070-stm32-timer-pwm.adigun.json");
  const before = JSON.stringify(project.nets);
  const result = validateBreadboardTopology(project, {getPartPins});
  assert.equal(result.state, "complete");
  assert.equal(result.nets.length, 4);
  assert.equal(JSON.stringify(project.nets), before);
});

test("default starter includes persistent physical breadboard mapping", () => {
  const project = createProject();
  const parsed = parseProject(serializeProject(project));
  const result = validateBreadboardTopology(parsed, {getPartPins});
  assert.equal(result.state, "complete");
  assert.equal(result.mappedPinCount, 7);
  assert.deepEqual(parsed.breadboard, project.breadboard);
});
