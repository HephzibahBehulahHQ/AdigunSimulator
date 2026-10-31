import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createProject, findLibraryPart, parseProject, serializeProject } from "../js/core.mjs";
import { BREADBOARD_MODEL, breadboardConnectionGroup, breadboardHoleIds, breadboardHolePoint, breadboardPackagePlacement, deriveBreadboardSchematicNets, normalizeBreadboardHole, validateBreadboardTopology } from "../js/breadboard-topology.mjs";

const getPartPins = libraryId => findLibraryPart(libraryId)?.pins ?? [];
const readExample = async file => JSON.parse(await readFile(new URL("../examples/" + file, import.meta.url)));

test("generic thirty-column board models 300 terminal holes, 120 rail holes, split rails, and coordinates", () => {
  assert.equal(BREADBOARD_MODEL.columns, 30);
  assert.equal(BREADBOARD_MODEL.terminalHoleCount, 300);
  assert.equal(BREADBOARD_MODEL.railHoleCount, 120);
  assert.equal(BREADBOARD_MODEL.holeCount, 420);
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
  project.breadboard.jumpers[1] = {from:"C11",to:"TP15"};
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

test("generic through-hole resistor and LED bodies fit their mapped pin-hole spacing", async () => {
  const project = await readExample("001-led-current-limiter.adigun.json");
  const resistor = breadboardPackagePlacement(project.components.find((component) => component.libraryId === "passive.resistor"), project);
  const led = breadboardPackagePlacement(project.components.find((component) => component.libraryId === "diode.led-red"), project);
  assert.equal(resistor.kind, "axial-resistor");
  assert.equal(resistor.exactManufacturerFootprint, false);
  assert.equal(Math.round(resistor.leadSpanPixels / (572 / 29)), 5);
  assert.equal(led.kind, "through-hole-led-5mm");
  assert.equal(led.exactManufacturerFootprint, false);
  assert.ok(Math.abs(led.leadSpanPixels - (572 / 29)) < 0.01);
});

test("generic radial capacitor, axial rectifier, and TO-92 transistor placements require all distinct mapped pins", () => {
  const place = (libraryId, pins, holes) => {
    const component = {instanceId:"part-1",libraryId};
    const project = {breadboard:{model:"generic-400-30",pinHoles:Object.fromEntries(pins.map((pin,index)=>[`part-1:${pin}`,holes[index]]))}};
    return breadboardPackagePlacement(component,project);
  };
  const capacitor = place("passive.capacitor",["1","2"],["C10","C11"]);
  assert.equal(capacitor.kind,"radial-capacitor");
  assert.notDeepEqual(capacitor.bodyCenter,capacitor.center);
  const diode = place("diode.rectifier-1n4007",["A","K"],["C12","C17"]);
  assert.equal(diode.kind,"axial-diode");
  assert.equal(diode.exactManufacturerFootprint,false);
  const transistor = place("active.npn-small-signal",["B","C","E"],["C20","C21","C22"]);
  assert.equal(transistor.kind,"to92-transistor");
  assert.equal(transistor.pinPoints.length,3);
  assert.equal(transistor.exactManufacturerFootprint,false);
  assert.equal(place("active.npn-small-signal",["B","C","E"],["C20","C21","C21"]),null);
});

test("physical-to-schematic netlist synchronization derives merged nets without mutating the source", async () => {
  const project = await readExample("001-led-current-limiter.adigun.json");
  const before = JSON.stringify(project.nets);
  const exact = deriveBreadboardSchematicNets(project, {getPartPins});
  assert.equal(exact.state,"complete");
  assert.equal(exact.changed,false);
  project.breadboard.jumpers[1] = {from:"C11",to:"TP15"};
  const preview = deriveBreadboardSchematicNets(project, {getPartPins});
  assert.equal(preview.state,"complete");
  assert.equal(preview.changed,true);
  assert.ok(preview.mergedNetIds.includes("GND"));
  assert.equal(preview.nets.length,2);
  assert.notEqual(JSON.stringify(project.nets),JSON.stringify(preview.nets));
  assert.equal(before.length>0,true);
});

test("released breadboard-to-schematic synchronization fixture checks physical connectivity", async () => {
  const project = await readExample("181-breadboard-schematic-sync.adigun.json");
  const result = runBreadboardSchematicSync(project);
  assert.equal(result.state,"complete");
  assert.equal(result.result.physicalNetsMatchSchematic,true);
});
