import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSchematicWireUi} from '../js/schematic-wire-ui.mjs';
import {parseProject,serializeProject} from '../js/core.mjs';
import {resolveSchematicWires} from '../js/schematic-wires.mjs';
async function setup(file='../examples/005-rc-step-response.adigun.json'){
 const project=parseProject(await readFile(new URL(file,import.meta.url),'utf8'));
 const state={project,activeView:'schematic',activeTool:'select',selectedWire:null,dirty:false},history=[];
 const listeners={};const panel={hidden:true,innerHTML:'',querySelector:()=>null,addEventListener:(type,fn)=>listeners[type]=fn};
 const canvas={querySelector:()=>({focus(){},getBoundingClientRect:()=>({left:0,top:0,width:680,height:300})}),setPointerCapture(){},releasePointerCapture(){}};
 const ui=createSchematicWireUi({getState:()=>state,canvas,panel,snap:()=>false,commit:(next,before)=>{history.push(serializeProject(before));state.project=next;state.dirty=true;},render(){},showInspector(){},getFeedback:()=>null,onError:message=>assert.fail(message)});
 const target=(selector,data={})=>({dataset:data,closest:q=>q==='#design-canvas'?canvas:q===selector?{dataset:data}:null});
 const click=(selector,data={},extra={})=>ui.click({target:target(selector,data),clientX:80,clientY:90,detail:1,...extra});
 return {ui,state,history,panel,target,click,listeners};
}
test('actual click/Escape/endpoint handlers preserve a dangling path, resume it and commit an explicit connection',async()=>{
 const h=await setup(),route=resolveSchematicWires(h.state.project)[0];
 h.click('[data-schematic-endpoint]',{schematicEndpoint:route.first});
 h.click('empty',{}, {clientX:100,clientY:110});
 h.ui.pointerMove({target:h.target('empty'),clientX:120,clientY:140});
 h.ui.keydown({key:'Escape',target:h.target('empty'),preventDefault(){}});
 const stub=h.state.project.schematicWires[0];assert.deepEqual(stub.waypoints,[[100,110]]);assert.deepEqual(stub.end,[120,140]);assert.equal(stub.to,null);assert.equal(h.history.length,1);
 h.click('[data-open-wire]',{openWire:stub.id});h.click('[data-schematic-endpoint]',{schematicEndpoint:route.second});
 assert.equal(h.history.length,2);assert.equal(h.state.project.schematicWires[0].to,route.second);assert.deepEqual(h.state.project.schematicWires[0].waypoints,[[100,110],[120,140]]);
 h.click('[data-schematic-endpoint]',{schematicEndpoint:route.first});h.click('empty');h.ui.cancel();assert.equal(h.history.length,2);assert.equal(h.state.schematicWireMode,false);
});
test('coordinate typing updates immediately, coalesces one field edit and rejects empty input',async()=>{
 const h=await setup(),r=resolveSchematicWires(h.state.project)[0];h.click('[data-wire-net], [data-wire-id]',{wireNet:r.netId,wireFirst:r.first,wireSecond:r.second});
 let error='';const input={dataset:{wirePoint:'0',axis:'0'},value:'300',closest(){return this;},setCustomValidity:s=>error=s};
 h.listeners.input({target:input});input.value='310';h.listeners.input({target:input});assert.equal(h.history.length,1);assert.equal(h.state.project.schematicWires[0].waypoints[0][0],310);
 input.value='';h.listeners.input({target:input});assert.ok(error);assert.equal(h.history.length,1);assert.equal(h.state.project.schematicWires[0].waypoints[0][0],310);
 h.listeners.change();input.value='320';h.listeners.input({target:input});assert.equal(h.history.length,2);assert.equal(error,'');
});
test('actual waypoint pointer handlers preview without history, cancel safely, and commit one undo snapshot',async()=>{
 const h=await setup(),route=resolveSchematicWires(h.state.project)[0];h.click('[data-schematic-endpoint]',{schematicEndpoint:route.first});h.click('empty');h.click('[data-schematic-endpoint]',{schematicEndpoint:route.second});
 const r=resolveSchematicWires(h.state.project)[0];h.click('[data-wire-net], [data-wire-id]',{wireNet:r.netId,wireFirst:r.first,wireSecond:r.second});h.ui.renderPanel();assert.match(h.panel.innerHTML,/Waypoints/);
 const before=serializeProject(h.state.project),count=h.history.length;
 const down=()=>h.ui.pointerDown({target:h.target('[data-wire-waypoint]',{wireWaypoint:'0'}),button:0,pointerId:7,preventDefault(){}});
 assert.equal(down(),true);h.ui.pointerMove({pointerId:7,clientX:135,clientY:145});assert.notEqual(serializeProject(h.state.project),before);assert.equal(h.history.length,count);
 h.ui.pointerEnd({pointerId:7},true);assert.equal(serializeProject(h.state.project),before);assert.equal(h.history.length,count);
 down();h.ui.pointerMove({pointerId:7,clientX:135,clientY:145});h.ui.pointerEnd({pointerId:7});assert.equal(h.history.length,count+1);assert.equal(h.history.at(-1),before);assert.deepEqual(h.state.project.schematicWires[0].waypoints[0],[135,145]);
});


test('actual junction controls create one native edit, move all branches, and delete reversibly',async()=>{
 const h=await setup('./fixtures/junction-divider.adigun.json'),r=resolveSchematicWires(h.state.project).find(r=>r.wireId==='W1');
 const original=serializeProject(h.state.project);
 h.click('[data-wire-net], [data-wire-id]',{wireId:r.wireId});h.click('[data-wire-command]',{wireCommand:'junction'});h.ui.renderPanel();
 assert.match(h.panel.innerHTML,/Add junction/);const handle=h.ui.handles(h.state.project,true);assert.match(handle,/junction-candidate/);
 const candidates=[...handle.matchAll(/cx="200" cy="80"[^>]*data-junction-choice="(\d+)"/g)];assert.equal(candidates.length,1);
 h.click('[data-junction-choice]',{junctionChoice:candidates[0][1]});assert.equal(h.history.length,1);assert.equal(h.history[0],original);assert.equal(h.state.project.schematicJunctions.length,1);assert.equal(h.state.dirty,true);
 const input={value:'220',dataset:{junctionAxis:'0'},closest(q){return q==='[data-junction-axis]'?this:null;},setCustomValidity(){}};
 h.listeners.input({target:input});input.value='230';h.listeners.input({target:input});assert.equal(h.history.length,2);assert.deepEqual(h.state.project.schematicJunctions[0].point,[230,80]);
 const before=serializeProject(h.state.project);h.ui.pointerDown({target:h.target('[data-schematic-junction]',{schematicJunction:'J1'}),pointerId:7,button:0,preventDefault(){}});h.ui.pointerMove({pointerId:7,clientX:260,clientY:110});h.ui.pointerEnd({pointerId:7},true);assert.equal(serializeProject(h.state.project),before);
 h.ui.keydown({target:h.target('[data-schematic-junction]',{schematicJunction:'J1'}),key:'ArrowRight',preventDefault(){}});assert.deepEqual(h.state.project.schematicJunctions[0].point,[231,80]);
 h.click('[data-wire-command]',{wireCommand:'junction-delete'});assert.equal(h.state.project.schematicJunctions.length,0);assert.equal(parseProject(h.history.at(-1)).schematicJunctions.length,1);
});
