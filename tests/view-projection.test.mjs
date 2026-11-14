import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { addComponent, createEmptyProject } from "../js/core.mjs";
import { projectComponentsForView, unresolvedComponentsForDisplay } from "../js/view-projection.mjs";

test("newly placed starter parts remain represented in all views without invented footprints",()=>{
 const project=addComponent(createEmptyProject(),"passive.resistor");
 for(const view of ["breadboard","schematic"])assert.equal(projectComponentsForView(project,view).components[0].instanceId,project.components[0].instanceId);
 const pcb=unresolvedComponentsForDisplay(project,"pcb");
 assert.equal(pcb.length,1);assert.equal(pcb[0].reference,project.components[0].reference);
 assert.equal(project.pcbFabrication,undefined);
});

test("reviewed project-specific footprints satisfy PCB display only with sourced parts and mapped pads",async()=>{
 const project=JSON.parse(await readFile(new URL("../examples/002-dc-voltage-divider.adigun.json",import.meta.url),"utf8"));
 const unresolved=unresolvedComponentsForDisplay(project,"pcb");
 assert.ok(project.pcbFabrication.parts.some(part=>part.reference==="R1"&&part.sourceUrl));
 assert.ok(project.pcbFabrication.pads.some(pad=>pad.reference==="R1"));
 assert.ok(!unresolved.some(issue=>issue.reference==="R1"||issue.reference==="R2"));
 const altered=structuredClone(project),part=altered.pcbFabrication.parts.find(item=>item.reference==="R1");part.sourceUrl="";
 assert.ok(unresolvedComponentsForDisplay(altered,"pcb").some(issue=>issue.reference==="R1"));
});

test("physical breadboard pin maps are distinguished from unsupported package placeholders",async()=>{
 const mapped=JSON.parse(await readFile(new URL("../examples/001-led-current-limiter.adigun.json",import.meta.url),"utf8"));
 assert.deepEqual(unresolvedComponentsForDisplay(mapped,"breadboard"),[]);
 const unsupported=JSON.parse(await readFile(new URL("../examples/184-unsupported-breadboard-package.adigun.json",import.meta.url),"utf8"));
 assert.ok(unresolvedComponentsForDisplay(unsupported,"breadboard").some(issue=>issue.reference==="U1"));
});

test("canvas rendering adds selectable, explicitly unmapped parts without treating them as physical pads",async()=>{
 const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
 assert.match(app,/function unmappedComponentVisual\(component, view, reason\)/);
 assert.match(app,/class="placed-component unmapped-component/);
 assert.match(app,/const parts = placedParts \+ issues\.map/);
 assert.match(app,/unresolvedComponentsForDisplay\(state\.project, state\.activeView\)/);
});

