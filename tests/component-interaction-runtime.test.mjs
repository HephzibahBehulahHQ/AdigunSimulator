import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { createEmptyProject, createProject, findLibraryPart, addComponent, moveComponent } from "../js/core.mjs";
import { canvasClientPoint, canvasClientDelta } from "../js/canvas-camera.mjs";
import { editComponentField } from "../js/component-edit.mjs";
const source = await readFile(new URL("../app.js",import.meta.url),"utf8");
function listener(marker,globals) { const start=source.indexOf(marker),end=source.indexOf("\n});",start)+4; assert.ok(start>=0 && end>start); runInNewContext(source.slice(start,end),{pcbViaEditor:{pointerDown:()=>false,pointerMove:()=>false,pointerEnd:()=>false},wireUi:{pointerDown:()=>false,pointerMove:()=>false,pointerEnd:()=>false,keydown:()=>false,reset(){}},...globals}); }
function uiFunction(name,next,globals) {const start=source.indexOf(`function ${name}(`),end=source.indexOf(next,start);return runInNewContext(`${source.slice(start,end)};${name}`,globals);}

test("palette drop converts the actual transformed scene coordinates and rejects unrelated transfer data",()=>{
  let drop,placed,prevented=0;
  const scene={getBoundingClientRect:()=>({left:100,top:50,width:1360,height:600})};
  listener('$("#design-canvas").addEventListener("drop"',{ $:selector=>selector.includes(".canvas-scene")?scene:{addEventListener:(_,fn)=>drop=fn},findLibraryPart,canvasClientPoint,placeLibraryComponent:(id,point)=>placed={id,point} });
  drop({dataTransfer:{getData:()=>"passive.resistor"},clientX:500,clientY:350,preventDefault:()=>prevented++});
  assert.equal(placed.id,"passive.resistor");assert.deepEqual(placed.point,[200,150]);assert.equal(prevented,1);
  placed=null;drop({dataTransfer:{getData:()=>"https://unrelated.invalid"},preventDefault:()=>assert.fail()});assert.equal(placed,null);
});

test("placing a library component selects it, opens Properties and creates one history entry without inventing a PCB",()=>{
  const state={project:createEmptyProject(),activeView:"pcb",history:[]};let inspector;
  const place=uiFunction("placeLibraryComponent","function deleteSelectedWire",{state,findLibraryPart,addComponent,moveComponent,$:()=>({checked:false}),captureHistory:()=>state.history.push(state.project),setInspector:value=>inspector=value,activateView(){},render(){}});
  place("passive.resistor",[220,140]);
  assert.equal(state.project.components.length,1);assert.equal(state.selectedInstanceId,state.project.components[0].instanceId);
  assert.equal(state.activeView,"schematic");assert.equal(inspector,"component");assert.equal(state.history.length,1);assert.equal(state.dirty,true);assert.equal(state.project.pcbFabrication,undefined);
  assert.deepEqual(state.project.components[0].position.schematic,[220,140]);
});

test("real pointer move updates native geometry live and pointer cancellation restores both document and dirty state",()=>{
  const original=createProject(),component=original.components.find(item=>item.instanceId==="resistor-1");let move,cancel,rendered;
  const canvas={querySelector:()=>({getBoundingClientRect:()=>({width:1360,height:600})}),releasePointerCapture(){}};
  const state={project:original,dirty:false,activeView:"schematic",drag:{mode:"move",pointerId:9,instanceId:component.instanceId,start:{x:100,y:100},startPosition:component.position.schematic,startProject:original,startDirty:false,canvas}};
  const globals={state,canvasClientDelta,moveComponent,editComponentField,renderCanvas:()=>rendered=state.project.components.find(item=>item.instanceId===component.instanceId).position.schematic,renderInspector(){},updateSaveState(){},$:()=>({checked:false}),document:{addEventListener:(name,fn)=>{if(name==="pointermove")move=fn;else cancel=fn;}}};
  listener('document.addEventListener("pointermove"',globals);listener('document.addEventListener("pointercancel"',globals);
  move({pointerId:9,clientX:140,clientY:120});assert.deepEqual(rendered,[component.position.schematic[0]+20,component.position.schematic[1]+10]);assert.equal(state.dirty,true);
  cancel({pointerId:9});assert.equal(state.project,original);assert.equal(state.dirty,false);assert.equal(state.drag,null);
});

test("real resize preview updates dimensions and cancellation restores the original geometry",()=>{
  const original=createProject();let move,cancel;
  const state={project:original,dirty:false,activeView:"schematic",drag:{mode:"resize",pointerId:2,instanceId:"resistor-1",start:{x:0,y:0},startGeometry:{width:56,height:58,rotation:0},startProject:original,startDirty:false,canvas:{querySelector:()=>({getBoundingClientRect:()=>({width:680,height:300})}),releasePointerCapture(){}}}};
  const globals={state,canvasClientDelta,moveComponent,editComponentField,renderCanvas(){},renderInspector(){},updateSaveState(){},document:{addEventListener:(name,fn)=>{if(name==="pointermove")move=fn;else cancel=fn;}}};
  listener('document.addEventListener("pointermove"',globals);listener('document.addEventListener("pointercancel"',globals);
  move({pointerId:2,clientX:28,clientY:12});assert.deepEqual(state.project.components.find(item=>item.instanceId==="resistor-1").geometry.schematic,{width:84,height:70,rotation:0});
  cancel({pointerId:2});assert.equal(state.project,original);assert.equal(state.dirty,false);
});

test("live edits coalesce a focused field into one Undo entry and invalidate stale results",()=>{
  const original=createProject(),state={project:original,lastAnalysis:{state:"complete"},history:[]};let outputRenders=0;
  const commit=uiFunction("commitComponentEdit","function updateNodeProps",{state,captureHistory:()=>state.history.push(state.project),renderCanvas(){},renderInspector(){},updateSaveState(){},renderValidation:()=>outputRenders++,notifyBotCanvas(){}});
  commit(editComponentField(state.project,"resistor-1","value","470 Ω"));
  commit(editComponentField(state.project,"resistor-1","value","4700 Ω"),false);
  assert.equal(state.history.length,1);assert.equal(state.history[0],original);assert.equal(state.lastAnalysis,null);assert.equal(state.dirty,true);assert.equal(outputRenders,2);
});
