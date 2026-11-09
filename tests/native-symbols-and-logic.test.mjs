import test from "node:test";
import assert from "node:assert/strict";
import { createEmptyProject, addComponent, connectPins, findLibraryPart } from "../js/core.mjs";
import { LOGIC_GATES, evaluateLogicGate } from "../js/logic-gates.mjs";
import { SCHEMATIC_PRIMITIVES } from "../js/schematic-primitives.mjs";
import { renderSchematicSymbol } from "../js/schematic-symbols.mjs";
import { schematicPinPoint, schematicSymbolSize } from "../js/schematic-pin-layout.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { analyzeBotCanvas } from "../js/bot-live-copilot.mjs";

test("every primitive has the exact native terminal set, a distinct glyph and bounded routable anchors", () => {
  for (const [id, spec] of Object.entries(SCHEMATIC_PRIMITIVES)) {
    const part = findLibraryPart(id);
    assert.ok(part, id);
    assert.deepEqual([...part.pins].sort(), Object.keys(spec.pins).sort(), id);
    const svg = renderSchematicSymbol(part);
    assert.ok(svg.includes(`data-symbol-kind="${spec.kind}"`), id);
    assert.doesNotMatch(svg, /pin placement is editorial|NaN|undefined/, id);
    const size=schematicSymbolSize(id);
    assert.deepEqual(size, { width:56, height:58 }, "preserve existing document layout dimensions");
    for (const pin of part.pins) {
      const [x,y,side] = spec.pins[pin];
      assert.ok(x >= 0 && x <= spec.width && y >= 0 && y <= spec.height, `${id}.${pin}`);
      assert.deepEqual(schematicPinPoint({ libraryId: id, position: { schematic: [40,70] } },part.pins,pin), {x:40+x*size.width/spec.width,y:70+y*size.height/spec.height,side});
    }
  }
});

test("transistor, op-amp, transformer and gate drawn leads start at their named wire anchors", () => {
  for (const [id,spec] of Object.entries(SCHEMATIC_PRIMITIVES).filter(([,s])=>["npn","pnp","nmos","pmos","transformer","opamp","spdt","and","or","xor","nand","nor","xnor","not"].includes(s.kind))) {
    const svg=renderSchematicSymbol(findLibraryPart(id));
    for(const [pin,[x,y]] of Object.entries(spec.pins)) assert.ok(svg.includes(`data-symbol-pin="${pin}" d="M${x} ${y} `),`${id}.${pin}`);
  }
  const part=findLibraryPart("active.npn-ebers-moll-generic"), id=part.id;
  const point=schematicPinPoint({libraryId:id,position:{schematic:[100,100]},geometry:{schematic:{width:112,height:116,rotation:90}}},part.pins,"C");
  assert.deepEqual(point,{x:192,y:202,side:"bottom"});
  assert.notEqual(renderSchematicSymbol(part),renderSchematicSymbol(findLibraryPart("active.pnp-ebers-moll-generic")));
});

test("polarity and switch state drawings follow native terminal identities and edited model values", () => {
  const zener=findLibraryPart("diode.zener-ideal");
  assert.equal(schematicPinPoint({libraryId:zener.id,position:{schematic:[0,0]}},zener.pins,"A").x,6);
  assert.equal(schematicPinPoint({libraryId:zener.id,position:{schematic:[0,0]}},zener.pins,"K").x,50);
  assert.match(renderSchematicSymbol(findLibraryPart("power.dc-current-source")),/M35 29 H21/);
  const switchPart=findLibraryPart("input.spdt-switch");
  assert.match(renderSchematicSymbol(switchPart,{value:"Charge (A)"}),/M18 29 L37 15/);
  assert.match(renderSchematicSymbol(switchPart,{value:"Discharge (B)"}),/M18 29 L37 43/);
  const button=findLibraryPart("input.pushbutton");
  assert.match(renderSchematicSymbol(button,{value:"pressed"}),/M17 27 H39/);
  assert.match(renderSchematicSymbol(button,{value:"Normally open"}),/M17 27 L37 17/);
});

test("Boolean model rejects unknown operations, wrong arity and indeterminate levels",()=>{
  for(const [op,inputs] of [["unknown",[1,1]],["not",[0,1]],["and",[1]],["nor",[1,null]],["xor",[0,2]]]) assert.throws(()=>evaluateLogicGate(op,inputs));
  for(const [id,gate] of Object.entries(LOGIC_GATES)) assert.deepEqual(findLibraryPart(id).pins,gate.pins);
});

test("NAND followed by NOT solves as AND on a real saved netlist with atomic input events",()=>{
  let project=createEmptyProject({name:"NAND inverter chain"});
  for(const id of ["power.dc-source","power.dc-source","power.dc-source","active.logic-nand-ideal","active.logic-not-ideal","instrument.logic-probe","ground.signal"]) project=addComponent(project,id);
  project.components=project.components.map((c,i)=>({...c,reference:["VCC","A","B","NAND","INV","PROBE","GND"][i],value:i===0?"5 V":i<3?"0 V":c.value}));
  const pin=(ref,p)=>`${project.components.find(c=>c.reference===ref).instanceId}:${p}`;
  for(const [a,b] of [["VCC:+","NAND:VCC"],["VCC:+","INV:VCC"],["VCC:-","NAND:GND"],["VCC:-","INV:GND"],["VCC:-","GND:0"],["VCC:-","A:-"],["VCC:-","B:-"],["A:+","NAND:A"],["B:+","NAND:B"],["NAND:Y","INV:A"],["INV:Y","PROBE:IN"]]) project=connectPins(project,pin(...a.split(":")),pin(...b.split(":")));
  const output=project.nets.find(n=>n.endpoints.includes(pin("INV","Y"))).id;
  project.digitalEventSimulation={stopTimeNs:50,probeNets:[output],events:[{timeNs:10,sourceReference:"A",high:true},{timeNs:20,sourceReference:"B",high:true},{timeNs:30,sourceReference:"A",high:false},{timeNs:40,sourceReference:"B",high:false}]};
  const saved=JSON.stringify(project), result=runProjectAnalysis(JSON.parse(saved));
  assert.equal(result.state,"complete",result.message);
  assert.deepEqual(result.result.trace[output].map(p=>[p.timeNs,p.high]),[[0,false],[20,true],[30,false]]);
  assert.ok(result.modelIds.includes("ideal-digital-nand-v1")); assert.ok(result.modelIds.includes("ideal-digital-not-v1"));
  assert.equal(JSON.stringify(project),saved);
  const broken=JSON.parse(saved);broken.nets=broken.nets.map(n=>({...n,endpoints:n.endpoints.filter(e=>e!==pin("INV","VCC")),connections:n.connections?.filter(edge=>!edge.includes(pin("INV","VCC")))}));
  assert.notEqual(runProjectAnalysis(broken).state,"complete");
  assert.ok(analyzeBotCanvas(broken).some(f=>f.kind==="missing-gate-rails"&&f.reference==="INV"));
});
