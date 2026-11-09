import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { createEmptyProject, parseProject, serializeProject, findLibraryPart } from "../js/core.mjs";
import { startComponentPlacement, rotateComponentPlacement, positionComponentPlacement, placementOverlaps, firstFreeComponentPlacement, commitComponentPlacement, placementText } from "../js/component-placement.mjs";
import { canvasClientPoint } from "../js/canvas-camera.mjs";
import { schematicObstacle } from "../js/schematic-routing.mjs";

test("a ghost stays outside the native document until a snapped, rotated component is committed",()=>{
  const project=createEmptyProject(),before=serializeProject(project);
  let draft=startComponentPlacement("passive.resistor");draft=rotateComponentPlacement(draft);draft=positionComponentPlacement(draft,[209,143]);
  assert.deepEqual(draft.point,[204,144]);assert.equal(draft.rotation,90);assert.equal(serializeProject(project),before);
  const result=commitComponentPlacement(project,draft),component=result.project.components[0];
  assert.equal(component.reference,"R1");assert.equal(component.libraryId,"passive.resistor");assert.deepEqual(component.position.schematic,[204,144]);assert.equal(component.geometry.schematic.rotation,90);assert.doesNotThrow(()=>parseProject(serializeProject(result.project)));
});

test("rotation wraps once and every rotated timer preview stays inside drawing and label bounds",()=>{
  let draft=startComponentPlacement("active.stm32-timer-ideal");
  for(let i=0;i<4;i++){
    draft=rotateComponentPlacement(draft);const positioned=positionComponentPlacement(draft,[10000,-10000]);
    const geometry={width:124,height:130,rotation:draft.rotation};const box=schematicObstacle({instanceId:"preview",position:{schematic:positioned.point},geometry:{schematic:geometry}});
    assert.ok(box.left>=8 && box.right<=672 && box.top>=8 && box.bottom<=292);
  }
  assert.equal(draft.rotation,0);
  assert.equal(positionComponentPlacement(draft,[Infinity,2]),null);
});

test("collision rejection preserves the project and Add finds separate space for the next part",()=>{
  const original=createEmptyProject(),first=firstFreeComponentPlacement(original,"passive.resistor");
  const project=commitComponentPlacement(original,first).project,serialized=serializeProject(project);
  assert.equal(placementOverlaps(project,first),true);assert.throws(()=>commitComponentPlacement(project,first),/free area/);assert.equal(serializeProject(project),serialized);
  const second=firstFreeComponentPlacement(project,"passive.resistor");assert.ok(second);assert.equal(placementOverlaps(project,second),false);
  assert.equal(commitComponentPlacement(project,second).project.components[1].reference,"R2");assert.throws(()=>startComponentPlacement("invented.part"));
});

test("actual hover handler converts camera coordinates into a preview without a project edit",async()=>{
  const source=await readFile(new URL("../app.js",import.meta.url),"utf8"),start=source.indexOf('document.addEventListener("pointermove"'),end=source.indexOf("\n});",start)+4;
  const project=createEmptyProject(),state={placement:startComponentPlacement("passive.resistor"),project};let handler,preview;
  runInNewContext(source.slice(start,end),{state,document:{addEventListener:(_,fn)=>handler=fn},canvasClientPoint,$:()=>({getBoundingClientRect:()=>({left:100,top:50,width:1360,height:600})}),updatePlacementPreview:point=>preview=point});
  handler({target:{closest:()=>true},clientX:500,clientY:350});assert.deepEqual(preview,[200,150]);assert.equal(state.project,project);assert.equal(project.components.length,0);
});

test("actual placement commit selects the native component, opens Properties and captures one Undo entry",async()=>{
  const source=await readFile(new URL("../app.js",import.meta.url),"utf8"),start=source.indexOf("function finishComponentPlacement("),end=source.indexOf("function deleteSelectedWire",start);
  const original=createEmptyProject(),state={project:original,placement:startComponentPlacement("passive.capacitor"),history:[]};let inspector;
  const finish=runInNewContext(`${source.slice(start,end)};finishComponentPlacement`,{state,positionComponentPlacement,placementOverlaps,commitComponentPlacement,$:()=>({checked:true}),captureHistory:()=>state.history.push(state.project),setInspector:value=>inspector=value,render(){},updatePlacementPreview(){}});
  finish([300,150]);assert.equal(state.history.length,1);assert.equal(state.history[0],original);assert.equal(state.selectedInstanceId,state.project.components[0].instanceId);assert.equal(inspector,"component");assert.equal(state.placement,null);assert.equal(state.dirty,true);assert.equal(findLibraryPart(state.project.components[0].libraryId).type,"Capacitor");
});

test("placement instructions exist in each supported locale",()=>{
  for(const locale of ["en","de","yo","pcm"])for(const key of ["draw","ready","blocked","noRoom"])assert.ok(placementText(locale,key).length>0);
});
