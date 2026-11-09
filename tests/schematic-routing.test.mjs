import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { findLibraryPart } from "../js/core.mjs";
import { netEdges } from "../js/net-edges.mjs";
import { schematicPinPoint } from "../js/schematic-pin-layout.mjs";
import { routeSchematicConnection, schematicObstacle, segmentClearsBoxes } from "../js/schematic-routing.mjs";

for (const file of ["001-led-current-limiter", "003-pushbutton-led", "070-stm32-timer-pwm"]) test(`${file}: every wire reaches its actual pins and avoids other symbols and labels`, async()=>{
  const project=JSON.parse(await readFile(new URL(`../examples/${file}.adigun.json`,import.meta.url))), previous=[];
  for (const net of project.nets) for (const [first,second] of netEdges(net)) {
    const points=routeSchematicConnection(project.components,findLibraryPart,first,second,previous.filter(item=>item.net!==net.id).map(item=>item.points));
    assert.ok(points,`${net.id}: ${first} to ${second}`);
    const endpoint = value => { const [id,pin]=value.split(":"),component=project.components.find(c=>c.instanceId===id); return schematicPinPoint(component,findLibraryPart(component.libraryId).pins,pin); };
    for (const [actual,expected] of [[points[0],endpoint(first)],[points.at(-1),endpoint(second)]]) {assert.equal(actual.x,expected.x);assert.equal(actual.y,expected.y);}
    for (let i=1;i<points.length;i++) {
      assert.ok(points[i].x===points[i-1].x || points[i].y===points[i-1].y,"orthogonal segment");
      const boxes=project.components.filter(c=>!(i===1 && c.instanceId===first.split(":")[0]) && !(i===points.length-1 && c.instanceId===second.split(":")[0])).map(schematicObstacle);
      assert.ok(segmentClearsBoxes(points[i-1],points[i],boxes),`${net.id} segment ${i} crosses a component`);
    }
    previous.push({net:net.id,points});
  }
});

test("overlapping terminals are reported as unroutable rather than inventing a wire through a body",()=>{
  const components=[{instanceId:"a",libraryId:"passive.resistor",position:{schematic:[100,100]}},{instanceId:"b",libraryId:"passive.resistor",position:{schematic:[105,100]}}];
  assert.equal(routeSchematicConnection(components,findLibraryPart,"a:1","b:2"),null);
});

test("adjacent added resistors route through the available inter-symbol gap",()=>{
  const components=[{instanceId:"a",libraryId:"passive.resistor",position:{schematic:[48,60]}},{instanceId:"b",libraryId:"passive.resistor",position:{schematic:[120,60]}}];
  const points=routeSchematicConnection(components,findLibraryPart,"a:1","b:1");
  assert.ok(points);assert.deepEqual(points[0],{x:54,y:89});assert.deepEqual(points.at(-1),{x:126,y:89});
});
