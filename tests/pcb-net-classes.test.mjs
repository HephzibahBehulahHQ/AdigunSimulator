import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseProject, serializeProject } from "../js/core.mjs";
import { readPcbNetClasses, savePcbNetClass, removePcbNetClass, savePcbClassClearance, removePcbClassClearance } from "../js/pcb-net-classes.mjs";
import { reviewNetClassRules } from "../js/net-class-rule-review.mjs";
import { netPairClearance, auditPcbCopper } from "../js/pcb-copper.mjs";
import { minimumPcbTraceWidth } from "../js/pcb-board.mjs";
import { createPcbRoute } from "../js/pcb-routing.mjs";
import { exportPcbFabrication } from "../js/pcb-export.mjs";
import { createManufacturingExportPack } from "../js/manufacturing-export-pack.mjs";
import { createPcbNetClassEditor } from "../js/pcb-net-class-controller.mjs";
const load=async(name="138-net-class-rule-demo")=>parseProject(await readFile(new URL(`../examples/${name}.adigun.json`,import.meta.url),"utf8"));
const classInput={name:"Signal",netIds:["LED_A"],minimumWidthMm:0.25,minimumClearanceMm:0.2};

test("legacy id/name class formats both support manufacturing review",async()=>{
  for(const name of ["127-relay-module-pcb","128-audio-amplifier-pcb","129-buck-converter-pcb","138-net-class-rule-demo"]){
    const p=await load(name);const policy=readPcbNetClasses(p.pcbFabrication,new Set(p.nets.map(n=>n.id)));
    assert.deepEqual(policy.errors,[]);assert.equal(reviewNetClassRules(p).status,"passed",name);
    assert.equal(createManufacturingExportPack(p).status,"passed",name);
  }
});

test("class editing reassigns selected nets and keeps native connectivity and copper geometry",async()=>{
  const p=await load(),before=serializeProject(p);const result=savePcbNetClass(p,{...classInput,name:"Signals",netIds:["LED_A","GND"]});
  assert.equal(result.status,"complete");assert.equal(serializeProject(p),before);
  assert.deepEqual(result.project.nets,p.nets);assert.deepEqual(result.project.components,p.components);
  for(const key of ["board","pads","parts"])assert.deepEqual(result.project.pcbFabrication[key],p.pcbFabrication[key]);
  assert.deepEqual(result.project.pcbFabrication.routes.map(({netClassId,...r})=>r),p.pcbFabrication.routes.map(({netClassId,...r})=>r));
  const policy=readPcbNetClasses(result.project.pcbFabrication);
  assert.deepEqual(policy.classes.find(c=>c.id===result.classId).netIds,["LED_A","GND"]);
  assert.deepEqual(policy.classes.find(c=>c.id==="POWER").netIds,["VCC"]);
  assert.equal(result.project.pcbFabrication.routes.find(r=>r.netId==="GND").netClassId,result.classId);
  assert.deepEqual(parseProject(serializeProject(result.project)),result.project);
});

test("class rename retains stable pair identity, metadata and repeat-edit no-op behavior",async()=>{
  const p=await load();p.pcbFabrication.netClassRules[0].note="preserve";
  const result=savePcbNetClass(p,{...classInput,id:"SIGNAL",name:"Renamed signal"});
  assert.equal(result.status,"complete");assert.equal(result.project.pcbFabrication.netClassRules[0].classB,"SIGNAL");
  assert.equal(result.project.pcbFabrication.netClassRules[0].note,"preserve");
  assert.equal(savePcbNetClass(result.project,{...classInput,id:"SIGNAL",name:"Renamed signal"}).status,"unchanged");
  assert.equal(netPairClearance(result.project.pcbFabrication,"VCC","LED_A"),0.5);
});

test("remove class cascades only its rules and restores board defaults without deleting copper",async()=>{
  const p=await load(),result=removePcbNetClass(p,"SIGNAL");assert.equal(result.status,"complete");
  assert.equal(result.project.pcbFabrication.netClassRules.length,0);
  assert.equal(result.project.pcbFabrication.routes.find(r=>r.netId==="LED_A").netClassId,undefined);
  assert.equal(netPairClearance(result.project.pcbFabrication,"VCC","LED_A"),p.pcbFabrication.board.minimumClearanceMm);
  assert.equal(result.project.pcbFabrication.routes.length,p.pcbFabrication.routes.length);
  assert.equal(reviewNetClassRules(result.project).status,"passed");
});

test("symmetric pair updates preserve extra fields; deletion and no-op retain other rules",async()=>{
  const p=await load();p.pcbFabrication.netClassRules[0].note="keep";
  const result=savePcbClassClearance(p,{classA:"SIGNAL",classB:"POWER",minimumClearanceMm:0.6});
  assert.equal(result.status,"complete");assert.equal(result.project.pcbFabrication.netClassRules.length,1);
  assert.equal(result.project.pcbFabrication.netClassRules[0].note,"keep");
  assert.equal(netPairClearance(result.project.pcbFabrication,"VCC","LED_A"),0.6);
  assert.equal(savePcbClassClearance(result.project,{classA:"POWER",classB:"SIGNAL",minimumClearanceMm:0.6}).status,"unchanged");
  const removed=removePcbClassClearance(result.project,{classA:"SIGNAL",classB:"POWER"});assert.equal(removed.status,"complete");
  assert.equal(removePcbClassClearance(removed.project,{classA:"SIGNAL",classB:"POWER"}).status,"unchanged");
});

test("same-class clearance compares distinct nets and never a route or net against itself",()=>{
  const p={nets:[{id:"A"},{id:"B"}],pcbFabrication:{board:{minimumClearanceMm:0.2},netClasses:[{name:"POWER",netIds:["A","B"],minimumWidthMm:0.1}],netClassRules:[{classA:"POWER",classB:"POWER",minimumClearanceMm:0.4}],routes:[{netId:"A",layer:"F.Cu",widthMm:0.2,pointsMm:[[1,1],[4,1]]},{netId:"B",layer:"F.Cu",widthMm:0.2,pointsMm:[[1,2],[4,2]]}]} };
  assert.equal(reviewNetClassRules(p).status,"passed");
  p.pcbFabrication.routes[1].pointsMm=[[1,1.4],[4,1.4]];assert.equal(reviewNetClassRules(p).status,"failed");
  p.pcbFabrication.routes[1].netId="A";assert.equal(reviewNetClassRules(p).status,"passed");
});

test("invalid identities, memberships, aliases and rules are rejected without mutation",async()=>{
  const p=await load(),before=serializeProject(p);
  for(const input of [{name:""},{name:"POWER"},{netIds:["UNKNOWN"]},{netIds:["LED_A","LED_A"]},{minimumWidthMm:0},{minimumWidthMm:NaN},{minimumClearanceMm:-1},{id:"missing"}])assert.equal(savePcbNetClass(p,{...classInput,...input}).status,"blocked");
  for(const input of [{classA:"missing",classB:"POWER",minimumClearanceMm:0.2},{classA:"POWER",classB:"SIGNAL",minimumClearanceMm:Infinity}])assert.equal(savePcbClassClearance(p,input).status,"blocked");
  assert.ok(readPcbNetClasses({netClasses:null}).errors.length);assert.ok(readPcbNetClasses({netClassRules:null}).errors.length);
  const duplicate=structuredClone(p.pcbFabrication);duplicate.netClassRules.push({classA:"SIGNAL",classB:"POWER",minimumClearanceMm:0.3});assert.ok(readPcbNetClasses(duplicate).errors.length);
  const malformed=structuredClone(p);malformed.pcbFabrication.netClasses[0].netIds={};
  assert.equal(exportPcbFabrication(malformed).status,"blocked");assert.equal(auditPcbCopper(malformed.pcbFabrication)[0].type,"invalid-rules");
  assert.equal(netPairClearance(malformed.pcbFabrication,"VCC","GND"),Infinity);assert.equal(serializeProject(p),before);
});

test("edited width and pair rules block routing and fabrication; board floors cannot be relaxed",async()=>{
  const p=await load();p.pcbFabrication.board.minimumTraceWidthMm=0.2;
  const narrow=savePcbNetClass(p,{...classInput,id:"SIGNAL",minimumWidthMm:0.1,minimumClearanceMm:0});assert.equal(minimumPcbTraceWidth(narrow.project.pcbFabrication,"LED_A"),0.2);
  const wide=savePcbNetClass(p,{...classInput,id:"SIGNAL",minimumWidthMm:1});assert.equal(exportPcbFabrication(wide.project).status,"blocked");
  const pcb=wide.project.pcbFabrication,r=pcb.routes.find(r=>r.netId==="LED_A"),endpoints=[r.pointsMm[0],r.pointsMm.at(-1)].map(([x,y])=>pcb.pads.find(p=>p.netId===r.netId&&p.xMm===x&&p.yMm===y)).map(p=>`${p.instanceId}:${p.pin}`);
  assert.equal(createPcbRoute(wide.project,{startPad:endpoints[0],endPad:endpoints[1],widthMm:0.25}).code,"TRACE_WIDTH_BELOW_MINIMUM");
  const spaced=savePcbClassClearance(p,{classA:"POWER",classB:"SIGNAL",minimumClearanceMm:10});assert.equal(exportPcbFabrication(spaced.project).status,"blocked");assert.equal(reviewNetClassRules(spaced.project).status,"failed");
});

test("class-review workload is bounded and malformed routes do not throw",()=>{
  const p={nets:[],pcbFabrication:{board:{minimumClearanceMm:0.2},routes:[{widthMm:0.2,pointsMm:[[0,0],[1,1]]}]}};
  assert.equal(reviewNetClassRules(p).status,"failed");
  p.pcbFabrication.routes=[{netId:"A",layer:"F.Cu",widthMm:0.2,pointsMm:Array.from({length:1500},(_,i)=>[i,0])}];
  assert.match(reviewNetClassRules(p).errors[0],/work limit/);
});

test("editor applies one undoable edit, escapes net labels and rejects stale dialogs",async()=>{
  const state={project:await load(),dirty:false},nodes={},history=[],fields=[];
  const $=id=>nodes[id]??={value:"",textContent:"",innerHTML:"",events:{},addEventListener(n,fn){this.events[n]=fn;},showModal(){this.open=true;},close(){this.open=false;}};
  const editor=createPcbNetClassEditor({state,$,$$:()=>fields,t:k=>k,escape:s=>String(s).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;"),captureHistory:()=>history.push(serializeProject(state.project)),render(){},activateView:v=>state.activeView=v,log(){}});
  editor.action("pcb-net-classes");$("#pcb-class-name").value="New signals";$("#pcb-class-width").value="0.25";$("#pcb-class-clearance").value="0.2";fields.push({dataset:{classNet:"LED_A"}});
  $("#pcb-class-form").events.submit({preventDefault(){}});assert.equal(history.length,1);assert.equal(state.dirty,true);assert.equal(state.activeView,"pcb");
  const saved=serializeProject(state.project);$("#pcb-class-width").value="0";$("#pcb-class-form").events.submit({preventDefault(){}});assert.equal(history.length,1);assert.equal(serializeProject(state.project),saved);
  state.project={...state.project};$("#pcb-class-width").value="0.4";$("#pcb-class-form").events.submit({preventDefault(){}});assert.equal(history.length,1);assert.equal($("#pcb-class-error").textContent,"pcbClassStale");
  $("#pcb-classes-close").events.click();assert.equal($("#pcb-classes-dialog").open,false);
  state.project.nets.push({id:'<img src=x>',endpoints:[]});editor.action("pcb-net-classes");assert.ok($("#pcb-class-members").innerHTML.includes("&lt;img"));assert.ok(!$("#pcb-class-members").innerHTML.includes("<img"));
});
