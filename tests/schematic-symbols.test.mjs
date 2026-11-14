import test from "node:test";
import assert from "node:assert/strict";
import { renderSchematicSymbol } from "../js/schematic-symbols.mjs";
const p=(id,type,pins)=>({id,type,pins});
test("passive and source components render distinct generic schematic glyphs",()=>{
 assert.match(renderSchematicSymbol(p("passive.resistor","Resistor",["1","2"])),/M6 29 H15 L19 23/);
 assert.match(renderSchematicSymbol(p("passive.capacitor","Capacitor",["1","2"])),/M25 19 V39 M31 19 V39/);
 assert.match(renderSchematicSymbol(p("power.dc-source","DC source",["+","-"])),/A11 11/);
});
test("LED symbol includes emission arrows and rectifier symbol does not",()=>{
 assert.match(renderSchematicSymbol(p("diode.led-red","LED",["A","K"])),/M34 8 L40 2/);
 assert.doesNotMatch(renderSchematicSymbol(p("diode.rectifier-1n4007","Diode",["A","K"])),/M34 8 L40 2/);
});
test("multi-pin generic symbol emits one stub per named pin and discloses editorial layout",()=>{
 const s=renderSchematicSymbol(p("sensor.example","Sensor",["VCC","SDA","SCL","GND"]));
 assert.match(s,/pin placement is editorial/);
 assert.equal((s.match(/M(?:6|50) [\d.]+ L(?:15|41) [\d.]+/g)??[]).length,4);
});
test("missing pin metadata does not create a fake symbol",()=>{
 assert.equal(renderSchematicSymbol(null),null);
 assert.equal(renderSchematicSymbol({id:"unknown",type:"Unknown",pins:[]}),null);
});

test("STM32 behavior symbol uses matching pin stubs and discloses its ideal model",()=>{
 const s=renderSchematicSymbol(p("active.stm32-timer-ideal","STM32 timer",["VCC","GND","PA0"]));
 assert.match(s,/viewBox="0 0 124 130"/);
 for(const stub of ["M0 26 H12","M0 104 H12","M124 65 H112"]) assert.ok(s.includes(stub));
 assert.match(s,/ideal model/);
 assert.match(s,/PA0/);
 assert.doesNotMatch(s,/G031K8/);
});
